import { Router, type IRouter } from "express";
import { db, quoteRequestsTable, ordersTable, designRequestsTable, sampleRequestsTable, usersTable, invoicesTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import { requireAdmin, hashPassword, generateTempPassword } from "../lib/auth";
import { generateId } from "../lib/generateId";
import { sendWhatsApp } from "../lib/whatsapp";

const router: IRouter = Router();

router.use("/admin", requireAdmin as never);

router.get("/admin/quotes", async (req, res): Promise<void> => {
  const { status } = req.query as { status?: string };

  const quotes = status
    ? await db.select().from(quoteRequestsTable).where(eq(quoteRequestsTable.status, status)).orderBy(sql`${quoteRequestsTable.created_at} DESC`)
    : await db.select().from(quoteRequestsTable).orderBy(sql`${quoteRequestsTable.created_at} DESC`);

  res.json(
    quotes.map((q) => ({
      ...q,
      total_estimated_min: q.total_estimated_min ? Number(q.total_estimated_min) : null,
      total_estimated_max: q.total_estimated_max ? Number(q.total_estimated_max) : null,
    }))
  );
});

router.put("/admin/quotes/:id/status", async (req, res): Promise<void> => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const { status, rejection_reason } = req.body;

  const [updated] = await db
    .update(quoteRequestsTable)
    .set({ status, rejection_reason })
    .where(eq(quoteRequestsTable.id, id))
    .returning();

  if (!updated) {
    res.status(404).json({ error: "Quote not found" });
    return;
  }

  res.json({ success: true, quote: updated });
});

router.post("/admin/quotes/:id/accept", async (req, res): Promise<void> => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const { total_price, payment_type, line_items } = req.body;

  const [quote] = await db
    .select()
    .from(quoteRequestsTable)
    .where(eq(quoteRequestsTable.id, id))
    .limit(1);

  if (!quote) {
    res.status(404).json({ error: "Quote not found" });
    return;
  }

  let userId: string | undefined;
  let userCreated = false;

  const [existingUser] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, quote.email.toLowerCase()))
    .limit(1);

  if (!existingUser) {
    const tempPassword = generateTempPassword();
    const [newUser] = await db
      .insert(usersTable)
      .values({
        email: quote.email.toLowerCase(),
        company_name: quote.company_name,
        contact_name: quote.contact_name,
        phone: quote.phone,
        country: quote.delivery_country,
        password_hash: hashPassword(tempPassword),
        orders_completed: 0,
        credit_eligible: false,
        credit_limit: "0",
      })
      .returning();

    userId = newUser.id;
    userCreated = true;

    await sendWhatsApp(
      quote.phone,
      `Welcome to Packwerk! Your account is ready.\nEmail: ${quote.email}\nTemp Password: ${tempPassword}\nLogin at packwerk.replit.app/login\nYour order is waiting inside.`
    );
  } else {
    userId = existingUser.id;
  }

  await db
    .update(quoteRequestsTable)
    .set({ status: "accepted", user_id: userId })
    .where(eq(quoteRequestsTable.id, id));

  const orderId = await generateId("ORD", "orders", "order_id");
  const discountApplied = payment_type === "upfront" ? Math.round(total_price * 0.03) : 0;

  const [order] = await db
    .insert(ordersTable)
    .values({
      order_id: orderId,
      quote_request_id: id,
      user_id: userId,
      items: line_items,
      total_price: total_price.toString(),
      payment_type,
      discount_applied: discountApplied.toString(),
      delivery_address: {},
      status: "confirmed",
    })
    .returning();

  const invoiceId = await generateId("INV", "invoices", "invoice_id");
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + (payment_type === "credit" ? 30 : 7));

  await db.insert(invoicesTable).values({
    invoice_id: invoiceId,
    order_id: order.id,
    user_id: userId,
    amount: (total_price - discountApplied).toString(),
    discount_line: discountApplied.toString(),
    status: "pending",
    due_date: dueDate.toISOString().split("T")[0],
  });

  await sendWhatsApp(
    quote.phone,
    `Your order ${orderId} has been confirmed! Login to your Packwerk dashboard to track progress.`
  );

  res.json({ order_id: orderId, user_created: userCreated });
});

router.get("/admin/orders", async (_req, res): Promise<void> => {
  const orders = await db.select().from(ordersTable).orderBy(sql`${ordersTable.created_at} DESC`);
  res.json(
    orders.map((o) => ({
      ...o,
      total_price: Number(o.total_price),
      discount_applied: Number(o.discount_applied ?? 0),
      delivery_address: o.delivery_address ?? {},
    }))
  );
});

router.put("/admin/orders/:id/status", async (req, res): Promise<void> => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const { status, tracking_number, tracking_url } = req.body;

  const [updated] = await db
    .update(ordersTable)
    .set({ status, tracking_number, tracking_url })
    .where(eq(ordersTable.id, id))
    .returning();

  if (!updated) {
    res.status(404).json({ error: "Order not found" });
    return;
  }

  if (status === "dispatched" && tracking_url) {
    const user = updated.user_id
      ? (await db.select().from(usersTable).where(eq(usersTable.id, updated.user_id)).limit(1))[0]
      : null;
    if (user?.phone) {
      await sendWhatsApp(
        user.phone,
        `Your order ${updated.order_id} has been dispatched! Track here: ${tracking_url}`
      );
    }
  }

  if (status === "delivered" && updated.user_id) {
    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, updated.user_id))
      .limit(1);

    if (user) {
      const newCount = (user.orders_completed ?? 0) + 1;
      const creditEligible = newCount >= 3;
      await db
        .update(usersTable)
        .set({ orders_completed: newCount, credit_eligible: creditEligible })
        .where(eq(usersTable.id, updated.user_id));

      if (creditEligible && user.phone) {
        await sendWhatsApp(
          user.phone,
          `Congratulations! You are now eligible for net-30 credit terms with Packwerk.`
        );
      }
    }
  }

  res.json({ success: true, order: { ...updated, total_price: Number(updated.total_price) } });
});

router.get("/admin/designs", async (_req, res): Promise<void> => {
  const designs = await db.select().from(designRequestsTable).orderBy(sql`${designRequestsTable.created_at} DESC`);
  res.json(designs);
});

router.put("/admin/designs/:id/status", async (req, res): Promise<void> => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const { status, designer_notes } = req.body;

  const [updated] = await db
    .update(designRequestsTable)
    .set({ status, designer_notes })
    .where(eq(designRequestsTable.id, id))
    .returning();

  if (!updated) {
    res.status(404).json({ error: "Design request not found" });
    return;
  }

  res.json({ success: true, design: updated });
});

router.get("/admin/samples", async (_req, res): Promise<void> => {
  const samples = await db.select().from(sampleRequestsTable).orderBy(sql`${sampleRequestsTable.created_at} DESC`);
  res.json(samples);
});

router.post("/admin/samples/:id/dispatch", async (req, res): Promise<void> => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

  const [updated] = await db
    .update(sampleRequestsTable)
    .set({ status: "dispatched" })
    .where(eq(sampleRequestsTable.id, id))
    .returning();

  if (!updated) {
    res.status(404).json({ error: "Sample request not found" });
    return;
  }

  res.json({ success: true, sample: updated });
});

export default router;
