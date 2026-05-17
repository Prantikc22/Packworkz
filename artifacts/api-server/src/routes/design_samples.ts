import { Router, type IRouter } from "express";
import { sb } from "../lib/supabase";
import { generateId } from "../lib/generateId";
import { sendDesignConfirmation, sendSampleConfirmation } from "../lib/email";

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

  sendDesignConfirmation({
    to: email,
    name: contact_name,
    designId,
    productType: product_type,
    isRush: is_rush ?? false,
    amountPaid: amount_paid,
  }).catch(err => console.error("[email] design confirmation failed:", err));

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
    user_id,
  } = req.body;

  if (!contact_name || !email || !phone || !product_id || !sample_tier || !amount_paid) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }

  const sampleId = await generateId("SAM", "sample_requests", "sample_id");

  const { data: sample, error } = await sb
    .from("sample_requests")
    .insert({
      sample_id: sampleId,
      user_id: user_id ?? null,
      contact_name,
      email,
      phone,
      product_id,
      sample_tier,
      amount_paid,
      razorpay_payment_id: razorpay_payment_id ?? null,
      status: "paid",
    })
    .select()
    .single();

  if (error || !sample) {
    console.error("[sample-requests] insert error:", error?.message);
    res.status(500).json({ error: "Failed to create sample request" });
    return;
  }

  sendSampleConfirmation({
    to: email,
    name: contact_name,
    sampleId,
    sampleTier: sample_tier,
    amountPaid: amount_paid,
  }).catch(err => console.error("[email] sample confirmation failed:", err));

  res.status(201).json({ sample_id: sample.sample_id, id: sample.id });
});

export default router;
