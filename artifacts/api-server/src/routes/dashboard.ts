import { Router, type IRouter, type Request } from "express";
import { db, ordersTable, invoicesTable, designRequestsTable, usersTable, quoteRequestsTable } from "@workspace/db";
import { eq, sql, and } from "drizzle-orm";
import { requireAuth } from "../lib/auth";
import { generateId } from "../lib/generateId";

type AuthRequest = Request & { userId: string };

const WHATSAPP_NUM = "919999999999";

const router: IRouter = Router();

router.use("/dashboard", requireAuth as never);

router.get("/dashboard/overview", async (req, res): Promise<void> => {
  const userId = (req as AuthRequest).userId;

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  const activeOrders = await db
    .select()
    .from(ordersTable)
    .where(
      and(
        eq(ordersTable.user_id, userId),
        sql`${ordersTable.status} NOT IN ('delivered', 'cancelled')`
      )
    )
    .orderBy(sql`${ordersTable.created_at} DESC`);

  const inProductionCount = activeOrders.filter(o => o.status === "in_production" || o.status === "confirmed").length;
  const dispatchedCount = activeOrders.filter(o => o.status === "dispatched").length;

  const pendingQuotes = await db
    .select({ count: sql<number>`count(*)` })
    .from(quoteRequestsTable)
    .where(
      and(
        eq(quoteRequestsTable.user_id, userId),
        sql`${quoteRequestsTable.status} IN ('submitted', 'under_review', 'quoted')`
      )
    );

  const totalSavedResult = await db
    .select({ total: sql<number>`coalesce(sum(cast(${ordersTable.discount_applied} as numeric)), 0)` })
    .from(ordersTable)
    .where(eq(ordersTable.user_id, userId));

  const recentOrders = await db
    .select()
    .from(ordersTable)
    .where(eq(ordersTable.user_id, userId))
    .orderBy(sql`${ordersTable.created_at} DESC`)
    .limit(5);

  const pendingQuotesList = await db
    .select()
    .from(quoteRequestsTable)
    .where(
      and(
        eq(quoteRequestsTable.user_id, userId),
        sql`${quoteRequestsTable.status} IN ('submitted', 'under_review', 'quoted')`
      )
    )
    .orderBy(sql`${quoteRequestsTable.created_at} DESC`)
    .limit(3);

  res.json({
    company_name: user.company_name,
    active_orders: activeOrders.length,
    in_production_count: inProductionCount,
    dispatched_count: dispatchedCount,
    pending_quotes: Number(pendingQuotes[0]?.count ?? 0),
    total_saved: Number(totalSavedResult[0]?.total ?? 0),
    orders_completed: user.orders_completed ?? 0,
    credit_eligible: user.credit_eligible ?? false,
    credit_limit: Number(user.credit_limit ?? 0),
    recent_orders: recentOrders.map((o) => ({
      ...o,
      total_price: Number(o.total_price),
      discount_applied: Number(o.discount_applied ?? 0),
      delivery_address: o.delivery_address ?? {},
    })),
    pending_quotes_list: pendingQuotesList.map(q => ({
      ...q,
      total_estimated_min: q.total_estimated_min ? Number(q.total_estimated_min) : null,
      total_estimated_max: q.total_estimated_max ? Number(q.total_estimated_max) : null,
    })),
  });
});

router.get("/dashboard/orders", async (req, res): Promise<void> => {
  const userId = (req as AuthRequest).userId;
  const { status } = req.query as { status?: string };

  const orders = await db
    .select()
    .from(ordersTable)
    .where(
      status
        ? and(eq(ordersTable.user_id, userId), eq(ordersTable.status, status))
        : eq(ordersTable.user_id, userId)
    )
    .orderBy(sql`${ordersTable.created_at} DESC`);

  res.json(
    orders.map((o) => ({
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

  let statusFilter: string[];
  if (tab === "history") {
    statusFilter = ["accepted", "rejected", "expired"];
  } else {
    statusFilter = ["submitted", "under_review", "quoted"];
  }

  const quotes = await db
    .select()
    .from(quoteRequestsTable)
    .where(
      and(
        eq(quoteRequestsTable.user_id, userId),
        sql`${quoteRequestsTable.status} = ANY(${statusFilter})`
      )
    )
    .orderBy(sql`${quoteRequestsTable.created_at} DESC`);

  res.json(
    quotes.map(q => ({
      ...q,
      total_estimated_min: q.total_estimated_min ? Number(q.total_estimated_min) : null,
      total_estimated_max: q.total_estimated_max ? Number(q.total_estimated_max) : null,
    }))
  );
});

router.post("/dashboard/quotes/:id/accept", async (req, res): Promise<void> => {
  const userId = (req as AuthRequest).userId;
  const quoteUuid = req.params.id;

  const [quote] = await db
    .select()
    .from(quoteRequestsTable)
    .where(and(eq(quoteRequestsTable.id, quoteUuid as any), eq(quoteRequestsTable.user_id, userId)))
    .limit(1);

  if (!quote) {
    res.status(404).json({ error: "Quote not found" });
    return;
  }

  if (quote.status !== "quoted") {
    res.status(400).json({ error: "Quote is not ready to accept" });
    return;
  }

  const orderId = await generateId("PO", "orders", "order_id");

  const estimatedDelivery = new Date();
  estimatedDelivery.setDate(estimatedDelivery.getDate() + 21);

  const [order] = await db
    .insert(ordersTable)
    .values({
      order_id: orderId,
      quote_request_id: quoteUuid as any,
      user_id: userId,
      items: quote.items as any,
      total_price: quote.total_estimated_max?.toString() || "0",
      payment_type: "standard",
      discount_applied: "0",
      delivery_address: {},
      status: "confirmed",
      estimated_delivery: estimatedDelivery.toISOString().split("T")[0],
    })
    .returning();

  await db
    .update(quoteRequestsTable)
    .set({ status: "accepted" })
    .where(eq(quoteRequestsTable.id, quoteUuid as any));

  res.status(201).json({
    order_id: order.order_id,
    id: order.id,
    message: "Order confirmed! Your production has begun.",
  });
});

router.get("/dashboard/designs", async (req, res): Promise<void> => {
  const userId = (req as AuthRequest).userId;

  const designs = await db
    .select()
    .from(designRequestsTable)
    .where(eq(designRequestsTable.user_id, userId))
    .orderBy(sql`${designRequestsTable.created_at} DESC`);

  res.json(designs);
});

router.get("/dashboard/invoices", async (req, res): Promise<void> => {
  const userId = (req as AuthRequest).userId;

  const invoices = await db
    .select()
    .from(invoicesTable)
    .where(eq(invoicesTable.user_id, userId))
    .orderBy(sql`${invoicesTable.created_at} DESC`);

  res.json(
    invoices.map((i) => ({
      ...i,
      amount: Number(i.amount),
      discount_line: Number(i.discount_line ?? 0),
    }))
  );
});

router.get("/dashboard/profile", async (req, res): Promise<void> => {
  const userId = (req as AuthRequest).userId;

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
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

  const [updated] = await db
    .update(usersTable)
    .set({ company_name, contact_name, phone, gstin, default_address })
    .where(eq(usersTable.id, userId))
    .returning();

  if (!updated) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  const { password_hash: _, ...profile } = updated;
  res.json({ ...profile, credit_limit: Number(profile.credit_limit ?? 0) });
});

export default router;
