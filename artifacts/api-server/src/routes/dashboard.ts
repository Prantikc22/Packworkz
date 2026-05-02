import { Router, type IRouter, type Request } from "express";
import { sb } from "../lib/supabase";
import { requireAuth } from "../lib/auth";
import { generateId } from "../lib/generateId";
import { pushToSheetDB } from "../lib/sheetdb";

type AuthRequest = Request & { userId: string };

const router: IRouter = Router();

router.use("/dashboard", requireAuth as never);

router.get("/dashboard/overview", async (req, res): Promise<void> => {
  const userId = (req as AuthRequest).userId;

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

  const { data: userRow } = await sb.from("users_profile").select("email").eq("id", userId).maybeSingle();
  const userEmailForCount = userRow?.email ?? "";

  // Count both user_id-linked and email-matched (unlinked) pending quotes
  const [countByUserId, countByEmail] = await Promise.all([
    sb.from("quote_requests").select("id", { count: "exact", head: true }).eq("user_id", userId).in("status", ["submitted", "under_review", "reviewing", "quoted"]),
    userEmailForCount
      ? sb.from("quote_requests").select("id", { count: "exact", head: true }).is("user_id", null).eq("email", userEmailForCount).in("status", ["submitted", "under_review", "reviewing", "quoted"])
      : Promise.resolve({ count: 0 }),
  ]);
  const pendingQuotesCount = (countByUserId.count ?? 0) + (countByEmail.count ?? 0);

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
    .in("status", ["submitted", "under_review", "reviewing", "quoted"])
    .order("created_at", { ascending: false })
    .limit(3);

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
    recent_orders: (recentOrders || []).map(o => ({
      ...o,
      total_price: Number(o.total_price),
      discount_applied: Number(o.discount_applied ?? 0),
      delivery_address: o.delivery_address ?? {},
    })),
    pending_quotes_list: (pendingQuotesList || []).map(q => ({
      ...q,
      total_estimated_min: q.total_estimated_min ? Number(q.total_estimated_min) : null,
      total_estimated_max: q.total_estimated_max ? Number(q.total_estimated_max) : null,
    })),
  });
});

router.get("/dashboard/orders", async (req, res): Promise<void> => {
  const userId = (req as AuthRequest).userId;
  const { status } = req.query as { status?: string };

  let query = sb.from("orders").select("*").eq("user_id", userId).order("created_at", { ascending: false });
  if (status) query = query.eq("status", status);

  const { data: orders } = await query;
  res.json(
    (orders || []).map(o => ({
      ...o,
      total_price: Number(o.total_price),
      discount_applied: Number(o.discount_applied ?? 0),
      delivery_address: o.delivery_address ?? {},
    }))
  );
});

router.get("/dashboard/quotes", async (req, res): Promise<void> => {
  const userId = (req as AuthRequest).userId;
  const { tab } = req.query as { tab?: string };

  const statusFilter = tab === "history"
    ? ["accepted", "rejected", "expired"]
    : ["submitted", "under_review", "reviewing", "quoted"];

  // Get user's email so we can also match quotes submitted without being logged in
  const { data: user } = await sb.from("users_profile").select("email").eq("id", userId).maybeSingle();
  const userEmail = user?.email ?? "";

  // Fetch quotes both by user_id and by email (for quotes submitted while not logged in)
  const [byUserId, byEmail] = await Promise.all([
    sb.from("quote_requests").select("*").eq("user_id", userId).in("status", statusFilter).order("created_at", { ascending: false }),
    userEmail
      ? sb.from("quote_requests").select("*").is("user_id", null).eq("email", userEmail).in("status", statusFilter).order("created_at", { ascending: false })
      : Promise.resolve({ data: [] as any[] }),
  ]);

  // Merge + deduplicate
  const seen = new Set<string>();
  const allQuotes = [...(byUserId.data || []), ...(byEmail.data || [])].filter(q => {
    if (seen.has(q.id)) return false;
    seen.add(q.id);
    return true;
  }).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  // Auto-link user_id for any email-matched quotes so they show up correctly going forward
  const unlinked = (byEmail.data || []);
  if (unlinked.length > 0) {
    await sb.from("quote_requests").update({ user_id: userId }).in("id", unlinked.map(q => q.id));
  }

  res.json(
    allQuotes.map(q => ({
      ...q,
      total_estimated_min: q.total_estimated_min ? Number(q.total_estimated_min) : null,
      total_estimated_max: q.total_estimated_max ? Number(q.total_estimated_max) : null,
      quoted_amount: q.quoted_amount ? Number(q.quoted_amount) : null,
    }))
  );
});

router.post("/dashboard/quotes/:id/accept", async (req, res): Promise<void> => {
  const userId = (req as AuthRequest).userId;
  const quoteUuid = req.params.id;

  // Get user email for fallback matching
  const { data: userProfile } = await sb.from("users_profile").select("email").eq("id", userId).maybeSingle();
  const userEmail = userProfile?.email ?? "";

  // Accept if quote belongs to user by user_id OR by email (when user_id was null)
  const { data: quote } = await sb
    .from("quote_requests")
    .select("*")
    .eq("id", quoteUuid)
    .maybeSingle();

  if (!quote || (quote.user_id !== userId && quote.email?.toLowerCase() !== userEmail.toLowerCase())) {
    res.status(404).json({ error: "Quote not found" });
    return;
  }

  // Auto-link user_id if still null
  if (!quote.user_id) {
    await sb.from("quote_requests").update({ user_id: userId }).eq("id", quoteUuid);
  }

  if (quote.status !== "quoted") {
    res.status(400).json({ error: "Quote is not ready to accept" });
    return;
  }

  const orderId = await generateId("PO", "orders", "order_id");

  const estimatedDelivery = new Date();
  estimatedDelivery.setDate(estimatedDelivery.getDate() + 21);

  const { data: order } = await sb
    .from("orders")
    .insert({
      order_id: orderId,
      quote_request_id: quoteUuid,
      user_id: userId,
      items: quote.items,
      total_price: String(quote.quoted_amount || quote.total_estimated_max || "0"),
      payment_type: "standard",
      discount_applied: "0",
      delivery_address: {},
      status: "confirmed",
      estimated_delivery: estimatedDelivery.toISOString().split("T")[0],
    })
    .select()
    .single();

  await sb
    .from("quote_requests")
    .update({ status: "accepted" })
    .eq("id", quoteUuid);

  // Push accepted quote to Google Sheet
  const firstItem = Array.isArray(quote.items) ? quote.items[0] : null;
  pushToSheetDB({
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
    status: "accepted",
    accepted_date: new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
  }).catch(() => {});

  res.status(201).json({
    order_id: order?.order_id,
    id: order?.id,
    message: "Order confirmed! Your production has begun.",
  });
});

router.post("/dashboard/reorder/:orderId", async (req, res): Promise<void> => {
  const userId = (req as AuthRequest).userId;
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
  const userId = (req as AuthRequest).userId;
  const { data: designs } = await sb
    .from("design_requests")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  res.json(designs || []);
});

router.get("/dashboard/invoices", async (req, res): Promise<void> => {
  const userId = (req as AuthRequest).userId;
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
  const userId = (req as AuthRequest).userId;
  const { data: user } = await sb.from("users_profile").select("*").eq("id", userId).maybeSingle();
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  const { password_hash: _, ...profile } = user;
  res.json({ ...profile, credit_limit: Number(profile.credit_limit ?? 0) });
});

router.put("/dashboard/profile", async (req, res): Promise<void> => {
  const userId = (req as AuthRequest).userId;
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
