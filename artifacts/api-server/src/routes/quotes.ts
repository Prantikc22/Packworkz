import { Router, type IRouter } from "express";
import { sb } from "../lib/supabase";
import { generateId } from "../lib/generateId";
import { sendWhatsApp } from "../lib/whatsapp";
import { sendQuoteConfirmation } from "../lib/email";

const router: IRouter = Router();

// Push quote data to SheetDB if API key is configured
async function pushToSheetDB(data: Record<string, string | number | undefined>) {
  const apiKey = process.env.SHEETDB_API_KEY || "bnbunpp7hb33q";
  if (!apiKey) return;

  try {
    await fetch(`https://sheetdb.io/api/v1/${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify({ data }),
      signal: AbortSignal.timeout(8000),
    });
  } catch (err) {
    console.error("[sheetdb] Failed to push quote:", (err as Error).message);
  }
}

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

  const { data: quote, error } = await sb
    .from("quote_requests")
    .insert({
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
      total_estimated_min: total_estimated_min?.toString() ?? null,
      total_estimated_max: total_estimated_max?.toString() ?? null,
      status: "submitted",
    })
    .select()
    .single();

  if (error || !quote) {
    console.error("[quotes/post] insert error:", error?.message);
    res.status(500).json({ error: "Failed to create quote" });
    return;
  }

  const firstItem = Array.isArray(items) ? items[0] : null;
  const itemSummary = Array.isArray(items)
    ? items.map((i: { product_name?: string; quantity?: number }) => `${i.product_name} x${i.quantity}`).join(", ")
    : "items";

  const resolvedArtwork = artwork_option || firstItem?.artwork_status || "none";
  const resolvedSample = sample_option || (firstItem?.sample_requested ? firstItem?.sample_tier : "none");

  sendQuoteConfirmation({
    to: email,
    name: contact_name,
    company: company_name,
    quoteId,
    productName: firstItem?.product_name || "Packaging",
    qty: firstItem?.quantity || 0,
    artworkOption: resolvedArtwork,
    sampleOption: resolvedSample,
    designPaid: !!design_paid,
    samplePaid: !!sample_paid,
    pincode: delivery_pincode,
    notes: notes || undefined,
    estimatedMin: total_estimated_min ? Number(total_estimated_min) : undefined,
    estimatedMax: total_estimated_max ? Number(total_estimated_max) : undefined,
  }).catch(err => console.error("[email] Failed to send confirmation:", err));

  const teamPhone = process.env.TEAM_WHATSAPP_PHONE || "+919999999999";
  sendWhatsApp(
    teamPhone,
    `New quote: ${quoteId}\nCompany: ${company_name}\nProducts: ${itemSummary}\nValue: ₹${total_estimated_min}\nPhone: ${phone}`
  ).catch(() => {});

  // Push to Google Sheet via SheetDB
  pushToSheetDB({
    quote_id: quoteId,
    contact_name,
    company_name,
    email,
    phone,
    product_name: firstItem?.product_name || "",
    quantity: firstItem?.quantity || "",
    delivery_country,
    delivery_pincode: delivery_pincode || "",
    artwork_option: resolvedArtwork,
    sample_option: resolvedSample,
    estimated_budget_min: total_estimated_min || "",
    estimated_budget_max: total_estimated_max || "",
    preferred_timeline: preferred_timeline || "standard",
    notes: notes || "",
    design_paid: design_paid ? "Yes" : "No",
    sample_paid: sample_paid ? "Yes" : "No",
    submission_date: new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
  }).catch(() => {});

  res.status(201).json({ quote_id: quote.quote_id, id: quote.id });
});

router.get("/quotes/:quoteId", async (req, res): Promise<void> => {
  const quoteId = Array.isArray(req.params.quoteId) ? req.params.quoteId[0] : req.params.quoteId;

  const { data: quote } = await sb
    .from("quote_requests")
    .select("*")
    .eq("quote_id", quoteId)
    .maybeSingle();

  if (!quote) {
    res.status(404).json({ error: "Quote not found" });
    return;
  }

  res.json(quote);
});

export default router;
