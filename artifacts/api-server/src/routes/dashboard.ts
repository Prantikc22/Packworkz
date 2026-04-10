import { Router, type IRouter, type Request } from "express";
import { db, ordersTable, invoicesTable, designRequestsTable, usersTable } from "@workspace/db";
import { eq, ne, sql } from "drizzle-orm";
import { requireAuth } from "../lib/auth";
import { generateId } from "../lib/generateId";
import { generateTempPassword, hashPassword } from "../lib/auth";

type AuthRequest = Request & { userId: string };

const router: IRouter = Router();

router.use("/dashboard", requireAuth as never);

router.get("/dashboard/overview", async (req, res): Promise<void> => {
  const userId = (req as AuthRequest).userId;

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  const activeOrdersResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(ordersTable)
    .where(sql`${ordersTable.user_id} = ${userId} AND ${ordersTable.status} != 'delivered'`);

  const lastOrderResult = await db
    .select({ created_at: ordersTable.created_at })
    .from(ordersTable)
    .where(eq(ordersTable.user_id, userId))
    .orderBy(sql`${ordersTable.created_at} DESC`)
    .limit(1);

  const totalSavedResult = await db
    .select({ total: sql<number>`coalesce(sum(cast(${ordersTable.discount_applied} as numeric)), 0)` })
    .from(ordersTable)
    .where(eq(ordersTable.user_id, userId));

  const recentOrders = await db
    .select()
    .from(ordersTable)
    .where(eq(ordersTable.user_id, userId))
    .orderBy(sql`${ordersTable.created_at} DESC`)
    .limit(3);

  res.json({
    active_orders: Number(activeOrdersResult[0]?.count ?? 0),
    last_order_date: lastOrderResult[0]?.created_at?.toISOString() ?? null,
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
  });
});

router.get("/dashboard/orders", async (req, res): Promise<void> => {
  const userId = (req as AuthRequest).userId;
  const { status } = req.query as { status?: string };

  const conditions = [eq(ordersTable.user_id, userId)];
  if (status) {
    conditions.push(eq(ordersTable.status, status));
  }

  const orders = await db
    .select()
    .from(ordersTable)
    .where(sql`${ordersTable.user_id} = ${userId}${status ? sql` AND ${ordersTable.status} = ${status}` : sql``}`)
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
