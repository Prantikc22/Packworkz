import { Router, type IRouter, type Request } from "express";
import { sb } from "../lib/supabase";
import { requireAuth } from "../lib/auth";
import { generateId } from "../lib/generateId";
import { pushToSheetDB } from "../lib/sheetdb";
import { claimCustomerReference } from "../lib/customerHistory";

type AuthRequest = Request & { userId: string };

const router: IRouter = Router();

function readAdminMeta(quote: any): Record<string, any> {
  if (typeof quote?.rejection_reason !== "string" || !quote.rejection_reason.startsWith("__ADMIN_META__")) return {};
  try {
    return JSON.parse(quote.rejection_reason.slice(14));
  } catch {
    return {};
  }
}

function safePaymentUrl(value?: string | null) {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" ? url.toString() : null;
  } catch {
    return null;
  }
}

function normalizeQuote(quote: any) {
  const meta = readAdminMeta(quote);
  return {
    ...quote,
    total_estimated_min: quote.total_estimated_min ? Number(quote.total_estimated_min) : null,
    total_estimated_max: quote.total_estimated_max ? Number(quote.total_estimated_max) : null,
    quoted_amount: quote.quoted_amount ? Number(quote.quoted_amount) : (meta.quoted_amount ? Number(meta.quoted_amount) : null),
    payment_link: safePaymentUrl(quote.payment_link || meta.payment_link),
    delivery_date: quote.delivery_date || meta.delivery_date || null,
    payment_terms: quote.payment_terms || meta.payment_terms || null,
  };
}

function advancePercent(paymentTerms?: string | null) {
  const terms = String(paymentTerms || "");
  if (/\b(net[- ]?\d+|credit)\b/i.test(terms) && !/advance/i.test(terms)) return 0;
  const advanceMatch = terms.match(/(?:advance|upfront)[^\d]{0,12}(\d+(?:\.\d+)?)\s*%/i)
    || terms.match(/(\d+(?:\.\d+)?)\s*%[^,;.]{0,20}(?:advance|upfront|before production)/i);
  const parsed = advanceMatch ? Number(advanceMatch[1]) : 50;
  return Number.isFinite(parsed) ? Math.min(100, Math.max(0, parsed)) : 50;
}

function dateOnly(value?: string | null) {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString().slice(0, 10);
}

async function enrichOrdersWithQuoteCommercials(orders: any[]) {
  const quoteIds = orders.map(order => order.quote_request_id).filter(Boolean);
  if (quoteIds.length === 0) return orders;
  const orderIds = orders.map(order => order.id).filter(Boolean);
  const [{ data: quotes }, { data: invoices }] = await Promise.all([
    sb.from("quote_requests")
      .select("id,payment_link,delivery_date,payment_terms,quoted_amount,rejection_reason")
      .in("id", quoteIds),
    sb.from("invoices").select("order_id,status").in("order_id", orderIds),
  ]);
  const byId = new Map((quotes || []).map(quote => [quote.id, normalizeQuote(quote)]));
  const paidOrderIds = new Set((invoices || []).filter(invoice => invoice.status === "paid").map(invoice => invoice.order_id));
  return orders.map(order => {
    const quote = byId.get(order.quote_request_id);
    const fullAmount = Number(quote?.quoted_amount || order.total_price || 0);
    const percent = advancePercent(quote?.payment_terms);
    return {
      ...order,
      payment_link: safePaymentUrl(order.payment_link || quote?.payment_link),
      estimated_delivery: order.estimated_delivery || dateOnly(quote?.delivery_date),
      delivery_date_label: quote?.delivery_date || order.estimated_delivery || null,
      payment_terms: quote?.payment_terms || null,
      advance_amount: percent > 0 ? Math.round(fullAmount * percent) / 100 : 0,
      advance_paid: paidOrderIds.has(order.id),
    };
  });
}

router.use("/dashboard", requireAuth as never);

router.post("/dashboard/claim-history", async (req, res): Promise<void> => {
  const userId = (req as unknown as AuthRequest).userId;
  const reference = String(req.body?.reference || "").trim().toUpperCase();
  const contact = String(req.body?.contact || "").trim();

  if (!reference || reference.length > 64 || !contact || contact.length > 160) {
    res.status(400).json({ error: "Enter the reference and checkout email or mobile." });
    return;
  }

  try {
    const claimed = await claimCustomerReference(userId, reference, contact);
    if (!claimed) {
      res.status(404).json({ error: "We could not verify that reference with those checkout details." });
      return;
    }
    res.json({
      success: true,
      order_reference: claimed.order?.order_id || null,
      quote_reference: claimed.quote?.quote_id || null,
    });
  } catch (error) {
    console.error("[dashboard/claim-history] DB error:", error);
    res.status(500).json({ error: "We could not link that record right now. Please try again." });
  }
});

router.get("/dashboard/overview", async (req, res): Promise<void> => {
  const userId = (req as unknown as AuthRequest).userId;

  const { data: user } = await sb.from("users_profile").select("*").eq("id", userId).maybeSingle();
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  const { data: activeOrders } = await sb
    .from("orders")
    .select("*")
    .eq("user_id", userId)
    .not("status", "in", '("delivered","cancelled")')
    .order("created_at", { ascending: false });

  const orders = activeOrders || [];
  const inProductionCount = orders.filter(o => o.status === "in_production" || o.status === "confirmed").length;
  const dispatchedCount = orders.filter(o => o.status === "dispatched").length;

  const { count: pendingQuotesCount } = await sb
    .from("quote_requests")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .in("status", ["submitted", "under_review", "reviewing", "quoted", "payment_pending", "payment_processing"]);

  const { data: allOrders } = await sb
    .from("orders")
    .select("discount_applied")
    .eq("user_id", userId);

  const totalSaved = (allOrders || []).reduce(
    (sum, o) => sum + Number(o.discount_applied ?? 0), 0
  );

  const { data: recentOrders } = await sb
    .from("orders")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(5);

  const { data: pendingQuotesList } = await sb
    .from("quote_requests")
    .select("*")
    .eq("user_id", userId)
    .in("status", ["submitted", "under_review", "reviewing", "quoted", "payment_pending", "payment_processing"])
    .order("created_at", { ascending: false })
    .limit(3);

  const enrichedRecentOrders = await enrichOrdersWithQuoteCommercials(recentOrders || []);

  res.json({
    company_name: user.company_name,
    active_orders: orders.length,
    in_production_count: inProductionCount,
    dispatched_count: dispatchedCount,
    pending_quotes: pendingQuotesCount ?? 0,
    total_saved: totalSaved,
    orders_completed: user.orders_completed ?? 0,
    credit_eligible: user.credit_eligible ?? false,
    credit_limit: Number(user.credit_limit ?? 0),
    recent_orders: enrichedRecentOrders.map(o => ({
      ...o,
      total_price: Number(o.total_price),
      discount_applied: Number(o.discount_applied ?? 0),
      delivery_address: o.delivery_address ?? {},
    })),
    pending_quotes_list: (pendingQuotesList || []).map(normalizeQuote),
  });
});

router.get("/dashboard/orders", async (req, res): Promise<void> => {
  const userId = (req as unknown as AuthRequest).userId;
  const { status } = req.query as { status?: string };

  let query = sb.from("orders").select("*").eq("user_id", userId).order("created_at", { ascending: false });
  if (status) query = query.eq("status", status);

  const { data: orders } = await query;
  const enrichedOrders = await enrichOrdersWithQuoteCommercials(orders || []);
  res.json(
    enrichedOrders.map(o => ({
      ...o,
      total_price: Number(o.total_price),
      discount_applied: Number(o.discount_applied ?? 0),
      delivery_address: o.delivery_address ?? {},
    }))
  );
});

router.get("/dashboard/quotes", async (req, res): Promise<void> => {
  const userId = (req as unknown as AuthRequest).userId;
  const { tab } = req.query as { tab?: string };

  const statusFilter = tab === "history"
    ? ["accepted", "paid", "rejected", "expired", "cancelled"]
    : ["submitted", "under_review", "reviewing", "quoted", "payment_pending", "payment_processing"];

  const { data: allQuotes } = await sb
    .from("quote_requests")
    .select("*")
    .eq("user_id", userId)
    .in("status", statusFilter)
    .order("created_at", { ascending: false });

  res.json(
    (allQuotes || []).map(normalizeQuote)
  );
});

router.post("/dashboard/quotes/:id/accept", async (req, res): Promise<void> => {
  const userId = (req as unknown as AuthRequest).userId;
  const quoteUuid = req.params.id;

  const { data: quote } = await sb
    .from("quote_requests")
    .select("*")
    .eq("id", quoteUuid)
    .maybeSingle();

  if (!quote || quote.user_id !== userId) {
    res.status(404).json({ error: "Quote not found" });
    return;
  }

  if (!["quoted", "payment_pending", "payment_processing"].includes(quote.status)) {
    res.status(400).json({ error: "Quote is not ready to accept" });
    return;
  }

  const normalizedQuote = normalizeQuote(quote);
  const quotedAmount = Number(normalizedQuote.quoted_amount || normalizedQuote.total_estimated_max || 0);
  if (!Number.isFinite(quotedAmount) || quotedAmount <= 0) {
    res.status(409).json({ error: "The quote amount must be finalised before payment can begin." });
    return;
  }

  const percent = advancePercent(normalizedQuote.payment_terms);
  const advanceAmount = Math.round(quotedAmount * percent) / 100;
  if (advanceAmount > 0 && !normalizedQuote.payment_link) {
    res.status(409).json({ error: "The secure payment link is still being prepared. Please contact Packworkz before confirming." });
    return;
  }

  const { data: existingOrder } = await sb
    .from("orders")
    .select("*")
    .eq("quote_request_id", quoteUuid)
    .maybeSingle();
  if (existingOrder) {
    res.json({
      order_id: existingOrder.order_id,
      id: existingOrder.id,
      payment_status: existingOrder.status,
      payment_url: safePaymentUrl(existingOrder.payment_link || normalizedQuote.payment_link),
      advance_amount: advanceAmount,
      message: existingOrder.status === "payment_pending"
        ? "Your order is reserved and awaiting the advance payment."
        : "Your order is already in progress.",
    });
    return;
  }

  const orderId = await generateId("PO", "orders", "order_id");
  const initialStatus = advanceAmount > 0 ? "payment_pending" : "confirmed";

  const { data: order, error: orderError } = await sb
    .from("orders")
    .insert({
      order_id: orderId,
      quote_request_id: quoteUuid,
      user_id: userId,
      items: quote.items,
      total_price: String(quote.quoted_amount || quote.total_estimated_max || "0"),
      payment_type: advanceAmount > 0 ? `quote_advance_${percent}` : "credit",
      discount_applied: "0",
      delivery_address: {},
      status: initialStatus,
      estimated_delivery: dateOnly(normalizedQuote.delivery_date),
      payment_link: normalizedQuote.payment_link || null,
      internal_notes: advanceAmount > 0 ? `Awaiting ${percent}% advance payment for ${quote.quote_id}` : null,
    })
    .select()
    .single();

  if (orderError || !order) {
    console.error("[dashboard/quotes/accept] order creation failed", orderError);
    res.status(500).json({ error: "The payment request could not be created. Please try again." });
    return;
  }

  if (advanceAmount > 0) {
    const invoiceId = await generateId("INV", "invoices", "invoice_id");
    const { error: invoiceError } = await sb.from("invoices").insert({
      invoice_id: invoiceId,
      order_id: order.id,
      user_id: userId,
      amount: String(advanceAmount),
      discount_line: "0",
      status: "pending",
      due_date: new Date().toISOString().slice(0, 10),
      payment_method: "advance",
    });
    if (invoiceError) {
      console.error("[dashboard/quotes/accept] advance invoice creation failed", invoiceError);
      await sb.from("orders").delete().eq("id", order.id);
      res.status(500).json({ error: "The advance payment record could not be created. Please try again." });
      return;
    }
  }

  await sb
    .from("quote_requests")
    .update({ status: initialStatus === "payment_pending" ? "payment_pending" : "accepted" })
    .eq("id", quoteUuid);

  // Await SheetDB push before responding — Vercel terminates the function
  // as soon as res.json() is called, so unawaited calls never complete.
  const firstItem = Array.isArray(quote.items) ? quote.items[0] : null;
  await pushToSheetDB({
    quote_id: quote.quote_id,
    contact_name: quote.contact_name,
    company_name: quote.company_name,
    email: quote.email,
    phone: quote.phone,
    product_name: firstItem?.product_name || "",
    quantity: firstItem?.quantity || "",
    delivery_country: quote.delivery_country,
    delivery_pincode: quote.delivery_pincode || "",
    artwork_option: firstItem?.artwork_status || quote.artwork_option || "none",
    sample_option: quote.sample_option || "none",
    estimated_budget_min: quote.total_estimated_min || "",
    estimated_budget_max: quote.total_estimated_max || "",
    quoted_amount: quote.quoted_amount || "",
    preferred_timeline: quote.preferred_timeline || "standard",
    notes: quote.notes || "",
    order_id: order?.order_id || "",
    status: initialStatus,
    accepted_date: new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
  }).catch(err => console.error("[sheetdb] accept push failed:", err));

  res.status(201).json({
    order_id: order?.order_id,
    id: order?.id,
    payment_status: initialStatus,
    payment_url: normalizedQuote.payment_link || null,
    advance_amount: advanceAmount,
    message: advanceAmount > 0
      ? "Your order is reserved. Production begins after the advance payment is verified."
      : "Your order is confirmed.",
  });
});

router.post("/dashboard/reorder/:orderId", async (req, res): Promise<void> => {
  const userId = (req as unknown as AuthRequest).userId;
  const orderId = req.params.orderId;

  const { data: order } = await sb
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .eq("user_id", userId)
    .maybeSingle();

  if (!order) {
    res.status(404).json({ error: "Order not found" });
    return;
  }

  const { data: user } = await sb.from("users_profile").select("*").eq("id", userId).maybeSingle();
  const quoteId = await generateId("PKG", "quote_requests", "quote_id");

  const bodyItems = Array.isArray(req.body?.items) && req.body.items.length > 0
    ? req.body.items
    : order.items;
  const bodyNotes = typeof req.body?.notes === "string" && req.body.notes.trim()
    ? req.body.notes.trim()
    : `Reorder of ${order.order_id}`;

  const { data: quote } = await sb
    .from("quote_requests")
    .insert({
      quote_id: quoteId,
      contact_name: user?.contact_name ?? "",
      company_name: user?.company_name ?? "",
      email: user?.email ?? "",
      phone: user?.phone ?? "",
      items: bodyItems,
      delivery_country: "India",
      delivery_pincode: "",
      preferred_timeline: "standard",
      notes: bodyNotes,
      artwork_option: "none",
      sample_option: "no",
      status: "submitted",
      user_id: userId,
    })
    .select()
    .single();

  res.status(201).json({ quote_id: quote?.quote_id, id: quote?.id });
});

router.get("/dashboard/designs", async (req, res): Promise<void> => {
  const userId = (req as unknown as AuthRequest).userId;
  const { data: designs } = await sb
    .from("design_requests")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  res.json(designs || []);
});

router.get("/dashboard/invoices", async (req, res): Promise<void> => {
  const userId = (req as unknown as AuthRequest).userId;
  const { data: invoices } = await sb
    .from("invoices")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  res.json(
    (invoices || []).map(i => ({
      ...i,
      amount: Number(i.amount),
      discount_line: Number(i.discount_line ?? 0),
    }))
  );
});

router.get("/dashboard/profile", async (req, res): Promise<void> => {
  const userId = (req as unknown as AuthRequest).userId;
  const { data: user } = await sb.from("users_profile").select("*").eq("id", userId).maybeSingle();
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  const { password_hash: _, ...profile } = user;
  res.json({ ...profile, credit_limit: Number(profile.credit_limit ?? 0) });
});

router.put("/dashboard/profile", async (req, res): Promise<void> => {
  const userId = (req as unknown as AuthRequest).userId;
  const { company_name, contact_name, phone, gstin, default_address } = req.body;

  const { data: updated } = await sb
    .from("users_profile")
    .update({ company_name, contact_name, phone, gstin, default_address })
    .eq("id", userId)
    .select()
    .maybeSingle();

  if (!updated) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  const { password_hash: _, ...profile } = updated;
  res.json({ ...profile, credit_limit: Number(profile.credit_limit ?? 0) });
});

export default router;
