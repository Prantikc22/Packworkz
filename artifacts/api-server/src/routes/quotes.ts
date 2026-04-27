import { Router, type IRouter } from "express";
import { db, quoteRequestsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { generateId } from "../lib/generateId";
import { sendWhatsApp } from "../lib/whatsapp";
import { sendQuoteConfirmation } from "../lib/email";

const router: IRouter = Router();

router.post("/quotes", async (req, res): Promise<void> => {
  const {
    contact_name,
    company_name,
    email,
    phone,
    items,
    delivery_country,
    delivery_pincode,
    preferred_timeline,
    notes,
    total_estimated_min,
    total_estimated_max,
    artwork_option,
    sample_option,
    design_paid,
    sample_paid,
  } = req.body;

  if (!contact_name || !company_name || !email || !phone || !items || !delivery_country) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }

  const quoteId = await generateId("PKG", "quote_requests", "quote_id");

  const [quote] = await db
    .insert(quoteRequestsTable)
    .values({
      quote_id: quoteId,
      contact_name,
      company_name,
      email,
      phone,
      items,
      delivery_country,
      delivery_pincode,
      preferred_timeline: preferred_timeline || "standard",
      notes,
      total_estimated_min: total_estimated_min?.toString(),
      total_estimated_max: total_estimated_max?.toString(),
      status: "submitted",
    })
    .returning();

  const firstItem = Array.isArray(items) ? items[0] : null;
  const itemSummary = Array.isArray(items)
    ? items.map((i: { product_name?: string; quantity?: number }) => `${i.product_name} x${i.quantity}`).join(", ")
    : "items";

  // Send confirmation email (non-blocking)
  sendQuoteConfirmation({
    to: email,
    name: contact_name,
    company: company_name,
    quoteId,
    productName: firstItem?.product_name || "Packaging",
    qty: firstItem?.quantity || 0,
    artworkOption: artwork_option || firstItem?.artwork_status || "none",
    sampleOption: sample_option || (firstItem?.sample_requested ? firstItem?.sample_tier : "none"),
    designPaid: !!design_paid,
    samplePaid: !!sample_paid,
  }).catch(err => console.error("[email] Failed to send confirmation:", err));

  // Send WhatsApp notification to team (non-blocking)
  const teamPhone = process.env.TEAM_WHATSAPP_PHONE || "+919999999999";
  sendWhatsApp(
    teamPhone,
    `New quote: ${quoteId}\nCompany: ${company_name}\nProducts: ${itemSummary}\nValue: ₹${total_estimated_min}\nPhone: ${phone}`
  ).catch(() => {});

  res.status(201).json({ quote_id: quote.quote_id, id: quote.id });
});

router.get("/quotes/:quoteId", async (req, res): Promise<void> => {
  const quoteId = Array.isArray(req.params.quoteId) ? req.params.quoteId[0] : req.params.quoteId;

  const [quote] = await db
    .select()
    .from(quoteRequestsTable)
    .where(eq(quoteRequestsTable.quote_id, quoteId))
    .limit(1);

  if (!quote) {
    res.status(404).json({ error: "Quote not found" });
    return;
  }

  res.json(quote);
});

export default router;
