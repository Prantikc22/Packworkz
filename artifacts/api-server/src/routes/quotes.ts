import { Router, type IRouter } from "express";
import { db, quoteRequestsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { generateId } from "../lib/generateId";
import { sendWhatsApp } from "../lib/whatsapp";

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

  const itemSummary = Array.isArray(items)
    ? items.map((i: { product_name?: string; quantity?: number }) => `${i.product_name} x${i.quantity}`).join(", ")
    : "items";

  const teamPhone = process.env.TEAM_WHATSAPP_PHONE || "+919999999999";
  await sendWhatsApp(
    teamPhone,
    `New quote: ${quoteId}\nCompany: ${company_name}\nProducts: ${itemSummary}\nValue: ₹${total_estimated_min}\nPhone: ${phone}`
  );

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
