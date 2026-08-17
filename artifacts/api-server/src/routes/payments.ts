import { Router } from "express";
import Razorpay from "razorpay";
import crypto from "crypto";
import {
  LAUNCH_PROMOTION_CODE,
  LAUNCH_PROMOTION_MONTHLY_LIMIT,
  RAZORPAY_PAYMENT_LIMIT_RUPEES,
  calculateCommerceCartEstimate,
} from "@workspace/commerce";
import { sb } from "../lib/supabase";
import { generateId } from "../lib/generateId";
import { notifySlack } from "../lib/slack";
import { createRecoveryReference, readRecoveryCheckoutToken } from "../lib/checkoutToken";

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
  const artwork = (quote?.design_paid
    ? "upload"
    : quote?.artwork_option || "upload") as "upload" | "design" | "none";
  const delivery = (quote?.preferred_timeline || "standard") as "standard" | "blitz" | "warehouse";
  const items = (Array.isArray(quote?.items) ? quote.items : []).map((item: any) => {
    const rawConfiguration = (item?.variant_selections && typeof item.variant_selections === "object")
      ? item.variant_selections as Record<string, string>
      : {};
    const promotionCode = String(rawConfiguration.promotion_code || "").toUpperCase();
    const { promotion_code: _promotionCode, ...configuration } = rawConfiguration;
    const rawCustomSpecs = (item?.custom_specs && typeof item.custom_specs === "object")
      ? item.custom_specs as Record<string, string>
      : {};
    const { standard_size: _standardSize, ...customConfiguration } = rawCustomSpecs;
    return {
      item,
      skuCode: String(item?.sku_code || ""),
      quantity: Number(item?.quantity || 0),
      sizeCode: String(item?.custom_specs?.standard_size || ""),
      configuration: { ...configuration, ...customConfiguration },
      promotionCode,
    };
  });
  return { items, artwork, delivery };
}

function readDeliveryAddress(quote: any) {
  const notes = String(quote?.notes || "");
  const line = (label: string) => notes.match(new RegExp(`^${label}:\\s*(.+)$`, "im"))?.[1]?.trim() || "";
  return {
    address: line("Delivery address"),
    city: line("Delivery city"),
    state: line("Delivery state"),
    pincode: line("Delivery pincode") || String(quote?.delivery_pincode || ""),
    country: String(quote?.delivery_country || "India"),
  };
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

async function findCommerceOrder(gatewayOrderId: string) {
  const result = await sb.from("orders").select("*").eq("payment_link", gatewayOrderId).maybeSingle();
  if (result.error) {
    console.error("[payments] Could not resolve Packworkz order", { code: result.error.code, message: result.error.message });
    return null;
  }
  return result.data;
}

async function finalizeRecoveryOrder(gatewayOrderId: string, paymentId?: string) {
  const razorpay = getRazorpay();
  if (!razorpay) return null;
  try {
    const gatewayOrder = await razorpay.orders.fetch(gatewayOrderId);
    const notes = (gatewayOrder.notes || {}) as Record<string, string>;
    if (notes.storage_mode !== "recovery" || !notes.recovery_order_id) return null;
    await notifySlack({
      source: "Razorpay",
      title: "RECOVERY ORDER PAID - database sync required",
      referenceId: notes.recovery_order_id,
      summary: `Payment captured for recovery checkout ${notes.quote_id || ""}`.trim(),
      fields: [
        { label: "Payment", value: paymentId },
        { label: "Razorpay order", value: gatewayOrderId },
        { label: "Amount", value: `₹${(Number(gatewayOrder.amount) / 100).toLocaleString("en-IN")}` },
        { label: "Customer email", value: notes.contact_email },
      ],
    });
    return { order_id: notes.recovery_order_id };
  } catch (error) {
    console.error("[payments/recovery] Could not inspect Razorpay order", error);
    return null;
  }
}

router.post("/payments/prepare-order", async (req, res): Promise<void> => {
  const quoteId = String(req.body?.quote_id || "").trim();
  if (!quoteId) {
    res.status(400).json({ error: "quote_id is required" });
    return;
  }

  const suppliedRecoveryToken = req.body?.checkout_token;
  const recovery = readRecoveryCheckoutToken(suppliedRecoveryToken);
  if (suppliedRecoveryToken && recovery?.quote_id !== quoteId) {
    res.status(400).json({ error: "This recovery checkout has expired or is invalid" });
    return;
  }

  let quote: any = recovery?.quote || null;
  const recoveryMode = Boolean(recovery);
  if (!quote) {
    const result = await sb.from("quote_requests").select("*").eq("quote_id", quoteId).maybeSingle();
    if (result.error) {
      console.error("[payments/prepare-order] database error", { code: result.error.code, message: result.error.message });
      res.status(503).json({ error: "Order storage is temporarily unavailable. Please retry from your saved checkout." });
      return;
    }
    quote = result.data;
  }
  if (!quote) {
    res.status(404).json({ error: "Order plan not found" });
    return;
  }

  const parsed = parseQuoteForCommerce(quote);
  const existingOrderResult = recoveryMode
    ? { data: null as any }
    : await sb.from("orders").select("*").eq("quote_request_id", quote.id).maybeSingle();
  const existingOrder = existingOrderResult.data;
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
  if (existingOrder?.status === "payment_processing" && String(existingOrder.payment_link || "").startsWith("order_")) {
    const razorpay = getRazorpay();
    try {
      const gatewayOrder = razorpay ? await razorpay.orders.fetch(existingOrder.payment_link) : null;
      if (gatewayOrder?.status === "paid") {
        const paidOrder = await finalizeCommerceOrder(existingOrder.payment_link);
        res.json({
          status: "already_paid",
          quote_id: quoteId,
          order_id: paidOrder?.order_id || existingOrder.order_id,
          amount_rupees: Number(existingOrder.total_price),
          discount_rupees: Number(existingOrder.discount_applied || 0),
        });
        return;
      }
    } catch (error) {
      console.error("[payments/prepare-order] Could not refresh processing payment", error);
    }
    res.json({
      status: "payment_processing",
      quote_id: quoteId,
      order_id: existingOrder.order_id,
      amount_rupees: Number(existingOrder.total_price),
      message: "Razorpay accepted the payment attempt and confirmation is still processing. Do not pay again.",
    });
    return;
  }
  if (existingOrder?.status === "payment_pending" && String(existingOrder.payment_link || "").startsWith("order_")) {
    const razorpay = getRazorpay();
    if (!razorpay) {
      res.json({ status: "gateway_not_configured", quote_id: quoteId, amount_rupees: Number(existingOrder.total_price), message: "Secure online payment is temporarily unavailable. Your original order amount remains saved." });
      return;
    }
    try {
      const gatewayOrder = await razorpay.orders.fetch(existingOrder.payment_link);
      if (gatewayOrder.status === "paid") {
        const paidOrder = await finalizeCommerceOrder(existingOrder.payment_link);
        res.json({ status: "already_paid", quote_id: quoteId, order_id: paidOrder?.order_id || existingOrder.order_id, amount_rupees: Number(existingOrder.total_price), discount_rupees: Number(existingOrder.discount_applied || 0) });
        return;
      }
      const lockedTotal = Number(existingOrder.total_price);
      res.json({
        status: "ready",
        quote_id: quoteId,
        order_id: existingOrder.order_id,
        razorpay_order_id: existingOrder.payment_link,
        key_id: process.env.RAZORPAY_KEY_ID,
        amount: Math.round(lockedTotal * 100),
        amount_rupees: lockedTotal,
        discount_rupees: Number(existingOrder.discount_applied || 0),
        promotion_code: Number(existingOrder.discount_applied || 0) > 0 ? LAUNCH_PROMOTION_CODE : undefined,
        currency: "INR",
        recovery_mode: false,
      });
      return;
    } catch (error) {
      console.error("[payments/prepare-order] Could not refresh saved Razorpay order", error);
      res.status(503).json({ error: "Your saved payment could not be refreshed. Nothing was charged; please retry shortly." });
      return;
    }
  }

  const promotionRequested = parsed.items.some((item: any) => item.promotionCode === LAUNCH_PROMOTION_CODE);
  const promotionCode = promotionRequested && (recoveryMode || Number(existingOrder?.discount_applied || 0) > 0 || await launchPromotionAvailable())
    ? LAUNCH_PROMOTION_CODE
    : undefined;
  const cartEstimate = calculateCommerceCartEstimate(parsed.items.map((item: any) => ({
    skuCode: item.skuCode,
    quantity: item.quantity,
    sizeCode: item.sizeCode,
    artwork: parsed.artwork,
    delivery: parsed.delivery,
    configuration: item.configuration,
    promotionCode,
  })));
  const estimate = {
    total: cartEstimate.total,
    discount: cartEstimate.discount,
    amountPaise: cartEstimate.amountPaise,
    promotionCode,
  };

  if (cartEstimate.reason === "empty_cart" || cartEstimate.reason === "manual_review") {
    res.json({
      status: "manual_confirmation",
      quote_id: quoteId,
      amount_rupees: Number(quote.total_estimated_min || estimate.total || 0),
      message: "Packworkz will confirm the final payment route after reviewing this production specification.",
    });
    return;
  }

  if (cartEstimate.reason === "payment_limit") {
    if (!recoveryMode) {
      await sb.from("quote_requests").update({
        status: "payment_confirmation_required",
        admin_notes: `Online payment ceiling exceeded. Confirm payment route for ₹${estimate.total}.`,
      }).eq("id", quote.id);
    }
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
  if (!existingOrder || !razorpayOrderId?.startsWith("order_")) {
    packworkzOrderId = packworkzOrderId || (recoveryMode
      ? createRecoveryReference("ORD")
      : await generateId("ORD", "orders", "order_id"));
    let gatewayOrder;
    try {
      gatewayOrder = await razorpay.orders.create({
        amount: estimate.amountPaise,
        currency: "INR",
        receipt: quoteId.slice(0, 40),
        notes: {
          quote_id: quoteId,
          sku_codes: parsed.items.map((item: any) => item.skuCode).join(",").slice(0, 240),
          item_count: String(parsed.items.length),
          ...(recoveryMode ? {
            storage_mode: "recovery",
            recovery_order_id: packworkzOrderId,
            contact_email: String(quote.email || "").slice(0, 240),
          } : {}),
        },
      });
    } catch (error) {
      console.error("[payments/prepare-order] Razorpay order creation failed", error);
      res.status(502).json({
        error: "Secure payment could not be started. Your order plan is saved; please retry in a moment.",
      });
      return;
    }
    razorpayOrderId = gatewayOrder.id;

    if (recoveryMode) {
      await notifySlack({
        source: "Razorpay",
        title: "Recovery checkout opened",
        referenceId: packworkzOrderId,
        summary: `${quoteId} is proceeding to Razorpay while database persistence is unavailable.`,
        fields: [
          { label: "Customer", value: quote.contact_name },
          { label: "Email", value: quote.email },
          { label: "Products", value: parsed.items.map((entry: any) => entry.item?.product_name).filter(Boolean).join(", ") },
          { label: "Lines", value: parsed.items.length },
          { label: "Amount", value: `₹${estimate.total.toLocaleString("en-IN")}` },
        ],
      });
    } else if (existingOrder) {
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
        delivery_address: readDeliveryAddress(quote),
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
    recovery_mode: recoveryMode,
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

    const razorpay = getRazorpay();
    if (!razorpay) {
      res.status(503).json({ success: false, error: "Payment verification is not configured" });
      return;
    }
    const payment = await razorpay.payments.fetch(razorpay_payment_id);
    if (String(payment.order_id || "") !== String(razorpay_order_id) || String(payment.currency || "") !== "INR") {
      res.status(400).json({ success: false, error: "Payment details do not match this order" });
      return;
    }

    const commerceOrder = await findCommerceOrder(razorpay_order_id);
    if (commerceOrder) {
      const expectedAmount = Math.round(Number(commerceOrder.total_price) * 100);
      if (Number(payment.amount) !== expectedAmount) {
        res.status(400).json({ success: false, error: "Payment amount does not match this order" });
        return;
      }
      if (payment.status !== "captured") {
        await sb.from("orders").update({ status: "payment_processing", internal_notes: `Razorpay payment awaiting capture: ${razorpay_payment_id}` }).eq("id", commerceOrder.id);
        res.status(202).json({ success: true, pending: true, order_id: commerceOrder.order_id, payment_id: razorpay_payment_id });
        return;
      }
      const order = await finalizeCommerceOrder(razorpay_order_id, razorpay_payment_id);
      res.json({ success: true, order_id: order?.order_id || commerceOrder.order_id, payment_id: razorpay_payment_id });
      return;
    }

    const gatewayOrder = await razorpay.orders.fetch(razorpay_order_id);
    const gatewayNotes = (gatewayOrder.notes || {}) as Record<string, string>;
    if (gatewayNotes.storage_mode === "recovery" && gatewayNotes.recovery_order_id) {
      if (payment.status !== "captured") {
        res.status(202).json({ success: true, pending: true, order_id: gatewayNotes.recovery_order_id, payment_id: razorpay_payment_id, recovery_mode: true });
        return;
      }
      const recoveryOrder = await finalizeRecoveryOrder(razorpay_order_id, razorpay_payment_id);
      if (!recoveryOrder) {
        res.status(500).json({ success: false, error: "Recovery payment could not be reconciled" });
        return;
      }
      res.json({ success: true, order_id: recoveryOrder.order_id, payment_id: razorpay_payment_id, recovery_mode: true });
      return;
    }

    const service = String(gatewayNotes.service || "");
    const serviceAmount = SERVICE_AMOUNTS[service];
    if (!serviceAmount || Number(gatewayOrder.amount) !== serviceAmount || Number(payment.amount) !== serviceAmount) {
      res.status(404).json({ success: false, error: "Payment order is not recognized" });
      return;
    }
    if (payment.status !== "captured") {
      res.status(202).json({ success: true, pending: true, payment_id: razorpay_payment_id });
      return;
    }
    res.json({ success: true, payment_id: razorpay_payment_id });
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
    const recoveryOrder = await finalizeRecoveryOrder(gatewayOrderId, paymentId);
    if (!recoveryOrder) await finalizeCommerceOrder(gatewayOrderId, paymentId);
  }
  res.json({ received: true });
});

export default router;
