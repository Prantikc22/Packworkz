import { Router, type IRouter } from "express";
import { sb } from "../lib/supabase";
import { generateId } from "../lib/generateId";
import { sendWhatsApp } from "../lib/whatsapp";
import { sendQuoteConfirmation, sendAdminQuoteNotification } from "../lib/email";
import { getSessionUserId } from "../lib/auth";
import { pushToSheetDB } from "../lib/sheetdb";

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
    artwork_file_url,
    sample_option,
    design_paid,
    sample_paid,
  } = req.body;

  if (!contact_name || !company_name || !email || !phone || !items || !delivery_country) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }

  // Optionally extract user_id from Bearer token if user is logged in
  let userId: string | null = null;
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith("Bearer ")) {
    userId = await getSessionUserId(authHeader.slice(7));
  }

  const quoteId = await generateId("PKG", "quote_requests", "quote_id");

  const firstItem = Array.isArray(items) ? items[0] : null;
  const itemSummary = Array.isArray(items)
    ? items.map((i: { product_name?: string; quantity?: number }) => `${i.product_name} x${i.quantity}`).join(", ")
    : "items";

  const resolvedArtwork = artwork_option || firstItem?.artwork_status || "none";
  const resolvedSample = sample_option || (firstItem?.sample_requested ? firstItem?.sample_tier : "none");

  const { data: quote, error } = await sb
    .from("quote_requests")
    .insert({
      quote_id: quoteId,
      contact_name,
      company_name,
      email: email.toLowerCase().trim(),
      phone,
      items,
      delivery_country,
      delivery_pincode,
      preferred_timeline: preferred_timeline || "standard",
      notes,
      total_estimated_min: total_estimated_min?.toString() ?? null,
      total_estimated_max: total_estimated_max?.toString() ?? null,
      artwork_option: resolvedArtwork,
      ...(artwork_file_url && !artwork_file_url.startsWith("local:") ? { artwork_file_url } : {}),
      sample_option: resolvedSample,
      status: "submitted",
      ...(userId ? { user_id: userId } : {}),
    })
    .select()
    .single();

  if (error || !quote) {
    console.error("[quotes/post] insert error:", error?.message);
    res.status(500).json({ error: "Failed to create quote" });
    return;
  }

  // Await all side-effects before responding — in Vercel serverless the function
  // is terminated as soon as res.json() is called, so fire-and-forget tasks never complete.
  await Promise.allSettled([
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
    }).catch(err => console.error("[email] Failed to send confirmation:", err)),

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
    }).catch(err => console.error("[sheetdb] quote submit failed:", err)),

    sendAdminQuoteNotification({
      quoteId,
      contactName: contact_name,
      company: company_name,
      email,
      phone,
      productName: firstItem?.product_name || "Packaging",
      qty: firstItem?.quantity || 0,
      qtyUnit: firstItem?.quantity_unit || undefined,
      artworkOption: resolvedArtwork,
      sampleOption: resolvedSample,
      pincode: delivery_pincode,
      notes: notes || undefined,
      estimatedMin: total_estimated_min ? Number(total_estimated_min) : undefined,
      estimatedMax: total_estimated_max ? Number(total_estimated_max) : undefined,
      artworkFileUrl: artwork_file_url || undefined,
      variantSelections: firstItem?.variant_selections || undefined,
      customSpecs: firstItem?.custom_specs || undefined,
    }).catch(err => console.error("[email] Failed to send admin notification:", err)),

    sendWhatsApp(
      process.env.TEAM_WHATSAPP_PHONE || "+919999999999",
      `New quote: ${quoteId}\nCompany: ${company_name}\nProducts: ${itemSummary}\nValue: ₹${total_estimated_min}\nPhone: ${phone}`
    ).catch(() => {}),
  ]);

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
