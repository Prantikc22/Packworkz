import { Router } from "express";
import Razorpay from "razorpay";
import crypto from "crypto";
import {
  LAUNCH_PROMOTION_CODE,
  LAUNCH_PROMOTION_MONTHLY_LIMIT,
  RAZORPAY_PAYMENT_LIMIT_RUPEES,
  calculateCommerceEstimate,
} from "@workspace/commerce";
import { sb } from "../lib/supabase";
import { generateId } from "../lib/generateId";
import { notifySlack } from "../lib/slack";

function getRazorpay(): Razorpay | null {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) return null;
  return new Razorpay({ key_id: keyId, key_secret: keySecret });
}

const router = Router();
const SERVICE_AMOUNTS: Record<string, number> = {
  design: 199_900,
  sample_standard: 299_900,
  sample_express: 499_900,
};

function safeEqualHex(left: string, right: string) {
  if (!left || !right || left.length !== right.length || !/^[a-f0-9]+$/i.test(left) || !/^[a-f0-9]+$/i.test(right)) return false;
  const leftBuffer = Buffer.from(left, "hex");
  const rightBuffer = Buffer.from(right, "hex");
  return leftBuffer.length === rightBuffer.length && crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

function parseQuoteForCommerce(quote: any) {
  const item = Array.isArray(quote?.items) ? quote.items[0] : null;
  const skuCode = String(item?.sku_code || "");
  const quantity = Number(item?.quantity || 0);
  const sizeCode = String(item?.custom_specs?.standard_size || "");
  const rawConfiguration = (item?.variant_selections && typeof item.variant_selections === "object")
    ? item.variant_selections as Record<string, string>
    : {};
  const promotionCode = String(rawConfiguration.promotion_code || "").toUpperCase();
  const { promotion_code: _promotionCode, ...configuration } = rawConfiguration;
  const artwork = (quote?.design_paid
    ? "upload"
    : quote?.artwork_option || item?.artwork_status || "none") as "upload" | "design" | "none";
  const delivery = (quote?.preferred_timeline || "standard") as "standard" | "blitz" | "warehouse";
  return { item, skuCode, quantity, sizeCode, artwork, delivery, configuration, promotionCode };
}

async function launchPromotionAvailable() {
  const monthStart = new Date();
  monthStart.setUTCDate(1);
  monthStart.setUTCHours(0, 0, 0, 0);
  const { count, error } = await sb
    .from("orders")
    .select("id", { count: "exact", head: true })
    .gt("discount_applied", 0)
    .in("status", ["confirmed", "in_production", "dispatched", "delivered"])
    .gte("created_at", monthStart.toISOString());
  if (error) {
    console.error("[payments/prepare-order] Promotion count failed", error);
    return false;
  }
  return (count || 0) < LAUNCH_PROMOTION_MONTHLY_LIMIT;
}

async function finalizeCommerceOrder(gatewayOrderId: string, paymentId?: string) {
  const { data: order } = await sb.from("orders").select("*").eq("payment_link", gatewayOrderId).maybeSingle();
  if (!order) return null;
  if (order.status !== "confirmed" && order.status !== "in_production") {
    await sb.from("orders").update({
      status: "confirmed",
      internal_notes: paymentId ? `Razorpay payment captured: ${paymentId}` : "Razorpay order paid via verified webhook",
    }).eq("id", order.id);
    if (order.quote_request_id) await sb.from("quote_requests").update({ status: "paid" }).eq("id", order.quote_request_id);
  }

  const { data: existingInvoice } = await sb.from("invoices").select("id").eq("order_id", order.id).maybeSingle();
  if (!existingInvoice) {
    const invoiceId = await generateId("INV", "invoices", "invoice_id");
    await sb.from("invoices").insert({
      invoice_id: invoiceId,
      order_id: order.id,
      user_id: order.user_id || null,
      amount: String(order.total_price),
      status: "paid",
      due_date: new Date().toISOString().slice(0, 10),
      payment_method: "razorpay",
      razorpay_payment_id: paymentId || null,
    });
  }

  if (order.status !== "confirmed" && order.status !== "in_production") {
    await notifySlack({
      source: "Razorpay",
      title: "Packworkz order paid",
      referenceId: order.order_id,
      summary: `Payment captured for ₹${Number(order.total_price).toLocaleString("en-IN")}`,
      fields: paymentId ? [{ label: "Payment", value: paymentId }] : [],
    });
  }
  return order;
}

router.post("/payments/prepare-order", async (req, res): Promise<void> => {
  const quoteId = String(req.body?.quote_id || "").trim();
  if (!quoteId) {
    res.status(400).json({ error: "quote_id is required" });
    return;
  }

  const { data: quote, error } = await sb.from("quote_requests").select("*").eq("quote_id", quoteId).maybeSingle();
  if (error || !quote) {
    res.status(404).json({ error: "Order plan not found" });
    return;
  }

  const parsed = parseQuoteForCommerce(quote);
  const { data: existingOrder } = await sb.from("orders").select("*").eq("quote_request_id", quote.id).maybeSingle();
  if (existingOrder?.status === "confirmed" || existingOrder?.status === "in_production") {
    const existingDiscount = Number(existingOrder.discount_applied || 0);
    res.json({
      status: "already_paid",
      quote_id: quoteId,
      order_id: existingOrder.order_id,
      amount_rupees: Number(existingOrder.total_price),
      discount_rupees: existingDiscount,
      promotion_code: existingDiscount > 0 ? LAUNCH_PROMOTION_CODE : undefined,
    });
    return;
  }

  const promotionRequested = parsed.promotionCode === LAUNCH_PROMOTION_CODE;
  const promotionCode = promotionRequested && (Number(existingOrder?.discount_applied || 0) > 0 || await launchPromotionAvailable())
    ? LAUNCH_PROMOTION_CODE
    : undefined;
  const estimate = calculateCommerceEstimate({
    skuCode: parsed.skuCode,
    quantity: parsed.quantity,
    sizeCode: parsed.sizeCode,
    artwork: parsed.artwork,
    delivery: parsed.delivery,
    configuration: parsed.configuration,
    promotionCode,
  });

  if (estimate.reason && estimate.reason !== "payment_limit") {
    res.json({
      status: "manual_confirmation",
      quote_id: quoteId,
      amount_rupees: estimate.total || Number(quote.total_estimated_min || 0),
      message: "Packworkz will confirm the final payment route after reviewing this production specification.",
    });
    return;
  }

  if (estimate.total > RAZORPAY_PAYMENT_LIMIT_RUPEES) {
    await sb.from("quote_requests").update({
      status: "payment_confirmation_required",
      admin_notes: `Online payment ceiling exceeded. Confirm payment route for ₹${estimate.total}.`,
    }).eq("id", quote.id);
    res.json({
      status: "manual_confirmation",
      quote_id: quoteId,
      amount_rupees: estimate.total,
      message: `Online payment is currently available up to ₹${RAZORPAY_PAYMENT_LIMIT_RUPEES.toLocaleString("en-IN")}. We will confirm the payment route and production slot with you.`,
    });
    return;
  }

  const razorpay = getRazorpay();
  if (!razorpay) {
    res.json({
      status: "gateway_not_configured",
      quote_id: quoteId,
      amount_rupees: estimate.total,
      message: "Secure online payment is being activated. Your order plan is saved and our team will send the payment step.",
    });
    return;
  }

  let packworkzOrderId = existingOrder?.order_id as string | undefined;
  let razorpayOrderId = existingOrder?.payment_link as string | undefined;
  const totalChanged = existingOrder ? Math.abs(Number(existingOrder.total_price) - estimate.total) > 0.01 : false;
  if (!existingOrder || !razorpayOrderId?.startsWith("order_") || totalChanged) {
    let gatewayOrder;
    try {
      gatewayOrder = await razorpay.orders.create({
        amount: estimate.amountPaise,
        currency: "INR",
        receipt: quoteId.slice(0, 40),
        notes: { quote_id: quoteId, sku_code: parsed.skuCode, size_code: parsed.sizeCode },
      });
    } catch (error) {
      console.error("[payments/prepare-order] Razorpay order creation failed", error);
      res.status(502).json({
        error: "Secure payment could not be started. Your order plan is saved; please retry in a moment.",
      });
      return;
    }
    packworkzOrderId = packworkzOrderId || await generateId("ORD", "orders", "order_id");
    razorpayOrderId = gatewayOrder.id;

    if (existingOrder) {
      await sb.from("orders").update({
        total_price: String(estimate.total),
        discount_applied: String(estimate.discount),
        payment_link: razorpayOrderId,
        status: "payment_pending",
      }).eq("id", existingOrder.id);
    } else {
      const { error: orderError } = await sb.from("orders").insert({
        order_id: packworkzOrderId,
        quote_request_id: quote.id,
        user_id: quote.user_id || null,
        items: quote.items,
        total_price: String(estimate.total),
        discount_applied: String(estimate.discount),
        payment_type: "razorpay",
        delivery_address: { value: quote.delivery_pincode, country: quote.delivery_country },
        status: "payment_pending",
        payment_link: razorpayOrderId,
        internal_notes: `Awaiting Razorpay payment for ${quoteId}`,
      });
      if (orderError) {
        res.status(500).json({ error: "Could not create Packworkz order" });
        return;
      }
    }
  }

  res.json({
    status: "ready",
    quote_id: quoteId,
    order_id: packworkzOrderId,
    razorpay_order_id: razorpayOrderId,
    key_id: process.env.RAZORPAY_KEY_ID,
    amount: estimate.amountPaise,
    amount_rupees: estimate.total,
    discount_rupees: estimate.discount,
    promotion_code: estimate.promotionCode,
    currency: "INR",
  });
});

// Fixed-price service checkout used by design and sample requests.
router.post("/payments/create-order", async (req, res): Promise<void> => {
  const razorpay = getRazorpay();
  if (!razorpay) {
    res.status(503).json({ error: "Payment gateway not configured" });
    return;
  }
  try {
    const service = String(req.body?.notes?.service || "");
    const amount = SERVICE_AMOUNTS[service];
    if (!amount || amount !== req.body?.amount) {
      res.status(400).json({ error: "Invalid service payment" });
      return;
    }
    const order = await razorpay.orders.create({ amount, currency: "INR", notes: { service } });
    res.json({ order_id: order.id, key_id: process.env.RAZORPAY_KEY_ID, amount: order.amount, currency: order.currency });
  } catch (error: any) {
    console.error("[payments/create-order] Razorpay order creation failed", {
      status: error?.statusCode || error?.status,
      description: error?.error?.description || error?.message,
    });
    res.status(502).json({
      error: "Secure payment could not be started. No charge was made; please retry after the payment gateway is checked.",
    });
  }
});

router.post("/payments/verify", async (req, res): Promise<void> => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) {
      res.status(503).json({ error: "Payment verification is not configured" });
      return;
    }
    const expected = crypto.createHmac("sha256", secret).update(`${razorpay_order_id}|${razorpay_payment_id}`).digest("hex");
    if (!safeEqualHex(expected, String(razorpay_signature || ""))) {
      res.status(400).json({ success: false, error: "Payment signature mismatch" });
      return;
    }

    const order = await finalizeCommerceOrder(razorpay_order_id, razorpay_payment_id);
    if (!order) {
      // A valid fixed-price design/sample payment has no commerce order record.
      res.json({ success: true, payment_id: razorpay_payment_id });
      return;
    }
    res.json({ success: true, order_id: order.order_id, payment_id: razorpay_payment_id });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || "Payment verification failed" });
  }
});

router.post("/payments/webhook", async (req, res): Promise<void> => {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  const signature = String(req.headers["x-razorpay-signature"] || "");
  const rawBody = (req as any).rawBody as Buffer | undefined;
  if (!secret || !rawBody) {
    res.status(503).json({ error: "Webhook verification is not configured" });
    return;
  }
  const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  if (!safeEqualHex(expected, signature)) {
    res.status(400).json({ error: "Invalid webhook signature" });
    return;
  }
  const event = req.body?.event;
  const gatewayOrderId = req.body?.payload?.payment?.entity?.order_id || req.body?.payload?.order?.entity?.id;
  const paymentId = req.body?.payload?.payment?.entity?.id;
  if ((event === "payment.captured" || event === "order.paid") && gatewayOrderId) {
    await finalizeCommerceOrder(gatewayOrderId, paymentId);
  }
  res.json({ received: true });
});

export default router;
