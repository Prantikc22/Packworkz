import { Router, type IRouter } from "express";
import { db, designRequestsTable, sampleRequestsTable } from "@workspace/db";
import { generateId } from "../lib/generateId";

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

  const [design] = await db
    .insert(designRequestsTable)
    .values({
      design_id: designId,
      user_id,
      contact_name,
      email,
      phone,
      product_type,
      product_id,
      brand_colors,
      logo_url,
      brand_description,
      notes,
      is_rush: is_rush ?? false,
      amount_paid,
      razorpay_payment_id,
      status: "paid",
    })
    .returning();

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

  const [sample] = await db
    .insert(sampleRequestsTable)
    .values({
      sample_id: sampleId,
      user_id,
      contact_name,
      email,
      phone,
      product_id,
      sample_tier,
      amount_paid,
      razorpay_payment_id,
      status: "paid",
    })
    .returning();

  res.status(201).json({ sample_id: sample.sample_id, id: sample.id });
});

export default router;
