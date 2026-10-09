import { Router, type IRouter } from "express";
import { sb } from "../lib/supabase";
import { generateId } from "../lib/generateId";
import { sendDesignConfirmation, sendSampleConfirmation } from "../lib/email";
import { notifySlack } from "../lib/slack";
import { finalizeServicePayment } from "../lib/servicePayments";
import Razorpay from "razorpay";

const router: IRouter = Router();

router.post("/design-requests", async (req, res): Promise<void> => {
  const {
    contact_name,
    email,
    phone,
    product_type,
    product_id,
    brand_colors,
    logo_url,
    brand_description,
    notes,
    is_rush,
    amount_paid,
    razorpay_payment_id,
    user_id,
  } = req.body;

  if (!contact_name || !email || !phone || !product_type || !amount_paid) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }

  const designId = await generateId("DES", "design_requests", "design_id");

  const { data: design, error } = await sb
    .from("design_requests")
    .insert({
      design_id: designId,
      user_id: user_id ?? null,
      contact_name,
      email,
      phone,
      product_type,
      product_id: product_id ?? null,
      brand_colors: brand_colors ?? null,
      logo_url: logo_url ?? null,
      brand_description: brand_description ?? null,
      notes: notes ?? null,
      is_rush: is_rush ?? false,
      amount_paid,
      razorpay_payment_id: razorpay_payment_id ?? null,
      status: "paid",
    })
    .select()
    .single();

  if (error || !design) {
    console.error("[design-requests] insert error:", error?.message);
    res.status(500).json({ error: "Failed to create design request" });
    return;
  }

  await Promise.allSettled([
    sendDesignConfirmation({
      to: email,
      name: contact_name,
      designId,
      productType: product_type,
      isRush: is_rush ?? false,
      amountPaid: amount_paid,
    }),
    notifySlack({
      source: "Design",
      title: "New paid design request",
      referenceId: designId,
      summary: brand_description || notes || product_type,
      fields: [
        { label: "Contact", value: contact_name },
        { label: "Email", value: email },
        { label: "Phone", value: phone },
        { label: "Product", value: product_type },
        { label: "Paid", value: `₹${amount_paid}` },
        { label: "Rush", value: is_rush ? "Yes" : "No" },
      ],
    }),
  ]);

  res.status(201).json({ design_id: design.design_id, id: design.id });
});

router.post("/sample-requests", async (req, res): Promise<void> => {
  const {
    contact_name,
    email,
    phone,
    product_id,
    sample_tier,
    amount_paid,
    razorpay_payment_id,
    razorpay_order_id,
    shipping_address,
    pincode,
    order_note,
    user_id,
  } = req.body;

  if (!contact_name || !email || !phone || !sample_tier || !amount_paid || !razorpay_payment_id || !razorpay_order_id || !shipping_address || !pincode) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }

  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) {
    res.status(503).json({ error: "Payment verification is not configured" });
    return;
  }
  if (Number(amount_paid) !== 399 || sample_tier !== "kit") {
    res.status(400).json({ error: "The verified payment does not match this sample kit" });
    return;
  }

  // Shared with the webhook and the checkout poll, so the kit is recorded once
  // whichever path reaches the server first.
  try {
    const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });
    const result = await finalizeServicePayment(razorpay, String(razorpay_order_id), String(razorpay_payment_id), {
      details: { contact_name, email, phone, pincode, address: shipping_address, note: order_note },
      sendEmail: true,
      via: "checkout",
    });
    if (result.status === "pending") {
      res.status(202).json({ pending: true });
      return;
    }
    if (result.status === "ignored" || result.service !== "sample_kit") {
      res.status(400).json({ error: "The verified payment does not match this sample kit" });
      return;
    }
    res.status(result.status === "recorded" ? 201 : 200).json({ sample_id: "sampleId" in result ? result.sampleId : undefined, duplicate: result.status === "duplicate" });
  } catch (error: any) {
    console.error("[sample-requests] record error:", error?.message);
    res.status(502).json({ error: "The sample payment could not be recorded yet" });
  }
});

export default router;
