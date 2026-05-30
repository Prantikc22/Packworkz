import { Router, type IRouter } from "express";
import { sb } from "../lib/supabase";
import { requireAdmin, hashPassword, generateTempPassword } from "../lib/auth";
import { generateId } from "../lib/generateId";
import { sendWhatsApp } from "../lib/whatsapp";
import { sendWelcomeEmail } from "../lib/email";

const router: IRouter = Router();

router.post("/admin/verify-key", (req, res): void => {
  const body = req.body as { key?: string } | undefined;
  const key = body?.key?.trim();
  const expectedKey = process.env.ADMIN_KEY?.trim();
  if (!expectedKey) {
    console.error("[admin/verify-key] ADMIN_KEY env var is not set");
    res.status(503).json({ error: "Admin auth not configured" });
    return;
  }
  if (!key || key !== expectedKey) {
    console.warn("[admin/verify-key] key mismatch — received length:", key?.length ?? 0, "expected length:", expectedKey.length);
    res.status(401).json({ error: "Invalid admin key" });
    return;
  }
  res.json({ valid: true });
});

router.use("/admin", requireAdmin as never);

router.get("/admin/quotes", async (req, res): Promise<void> => {
  const { status } = req.query as { status?: string };

  let query = sb.from("quote_requests").select("*").order("created_at", { ascending: false });
  if (status) query = query.eq("status", status);

  const { data: quotes, error } = await query;
  if (error) {
    console.error("[admin/quotes]", error.message);
    res.status(500).json({ error: "Failed to load quotes" });
    return;
  }

  res.json(
    (quotes || []).map(q => {
      // Parse admin metadata stored in rejection_reason fallback (pre-migration)
      let adminMeta: Record<string, any> = {};
      if (typeof q.rejection_reason === "string" && q.rejection_reason.startsWith("__ADMIN_META__")) {
        try {
          adminMeta = JSON.parse(q.rejection_reason.slice(14));
        } catch { /* ignore */ }
      }

      return {
        ...q,
        total_estimated_min: q.total_estimated_min ? Number(q.total_estimated_min) : null,
        total_estimated_max: q.total_estimated_max ? Number(q.total_estimated_max) : null,
        quoted_amount: q.quoted_amount ? Number(q.quoted_amount) : (adminMeta.quoted_amount ? Number(adminMeta.quoted_amount) : null),
        admin_notes: q.admin_notes ?? adminMeta.admin_notes ?? null,
        payment_link: q.payment_link ?? adminMeta.payment_link ?? null,
        delivery_date: q.delivery_date ?? adminMeta.delivery_date ?? null,
        payment_terms: q.payment_terms ?? adminMeta.payment_terms ?? null,
        rejection_reason: adminMeta.admin_notes ? null : q.rejection_reason,
      };
    })
  );
});

router.put("/admin/quotes/:id/status", async (req, res): Promise<void> => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const { status, rejection_reason } = req.body;

  const updatePayload: Record<string, any> = { status, rejection_reason };

  // When marking as "quoted", auto-link the user_id if there's a matching account
  if (status === "quoted") {
    const { data: quote } = await sb.from("quote_requests").select("email, user_id").eq("id", id).maybeSingle();
    if (quote && !quote.user_id && quote.email) {
      const { data: matchedUser } = await sb
        .from("users_profile")
        .select("id")
        .eq("email", quote.email.toLowerCase())
        .maybeSingle();
      if (matchedUser) {
        updatePayload.user_id = matchedUser.id;
      }
    }
  }

  const { data: updated, error } = await sb
    .from("quote_requests")
    .update(updatePayload)
    .eq("id", id)
    .select()
    .maybeSingle();

  if (error || !updated) {
    res.status(404).json({ error: "Quote not found" });
    return;
  }

  res.json({ success: true, quote: updated });
});

router.put("/admin/quotes/:id/notes", async (req, res): Promise<void> => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const { admin_notes, payment_link, quoted_amount, delivery_date, payment_terms } = req.body;

  // Build full update — new columns are added via SQL migration; fall back gracefully if missing
  const fullUpdate: Record<string, any> = {};
  if (admin_notes !== undefined) fullUpdate.admin_notes = admin_notes;
  if (payment_link !== undefined) fullUpdate.payment_link = payment_link;
  if (quoted_amount !== undefined && quoted_amount !== "") {
    fullUpdate.quoted_amount = String(quoted_amount);
    fullUpdate.total_estimated_min = String(quoted_amount);
    fullUpdate.total_estimated_max = String(quoted_amount);
  }
  // Only save delivery_date to DB column if it's a valid ISO date (YYYY-MM-DD)
  if (delivery_date !== undefined) {
    const isoDate = delivery_date ? new Date(delivery_date) : null;
    const isValidDate = isoDate && !isNaN(isoDate.getTime()) && /^\d{4}-\d{2}-\d{2}$/.test(delivery_date);
    fullUpdate.delivery_date = isValidDate ? delivery_date : null;
  }
  if (payment_terms !== undefined) fullUpdate.payment_terms = payment_terms;

  let result = await sb.from("quote_requests").update(fullUpdate).eq("id", id).select().maybeSingle();

  if (result.error?.message?.includes("column")) {
    // New columns don't exist yet — store all admin data in rejection_reason as JSON
    // (safe to use for non-rejected quotes; auto-upgrades once migration is run)
    console.warn("[admin/quotes/notes] New columns missing — using rejection_reason fallback. Run SQL migration to persist all fields.");

    const safeUpdate: Record<string, any> = {};

    // Always safe to update: map quoted_amount → total_estimated_min/max
    if (quoted_amount !== undefined && quoted_amount !== "") {
      safeUpdate.total_estimated_min = String(quoted_amount);
      safeUpdate.total_estimated_max = String(quoted_amount);
    }

    // Store all admin meta in rejection_reason as JSON with a prefix marker
    const adminMeta: Record<string, any> = {};
    if (admin_notes !== undefined) adminMeta.admin_notes = admin_notes;
    if (payment_link !== undefined) adminMeta.payment_link = payment_link;
    if (delivery_date !== undefined) adminMeta.delivery_date = delivery_date;
    if (payment_terms !== undefined) adminMeta.payment_terms = payment_terms;
    if (quoted_amount !== undefined) adminMeta.quoted_amount = quoted_amount;

    if (Object.keys(adminMeta).length > 0) {
      safeUpdate.rejection_reason = `__ADMIN_META__${JSON.stringify(adminMeta)}`;
    }

    if (Object.keys(safeUpdate).length > 0) {
      result = await sb.from("quote_requests").update(safeUpdate).eq("id", id).select().maybeSingle();
    } else {
      result = await sb.from("quote_requests").select("*").eq("id", id).maybeSingle() as typeof result;
    }
  }

  if (result.error) {
    console.error("[admin/quotes/notes]", result.error.message);
    res.status(500).json({ error: "Failed to save" });
    return;
  }
  if (!result.data) { res.status(404).json({ error: "Quote not found" }); return; }
  res.json({ success: true, quote: result.data });
});

router.delete("/admin/quotes/:id", async (req, res): Promise<void> => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const { error } = await sb.from("quote_requests").delete().eq("id", id);
  if (error) { res.status(500).json({ error: "Failed to delete quote" }); return; }
  res.json({ success: true });
});

router.put("/admin/samples/:id/update", async (req, res): Promise<void> => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const { status, admin_notes, payment_link } = req.body;

  const updateFields: Record<string, any> = { admin_notes, payment_link };
  if (status) updateFields.status = status;

  const { data: updated, error } = await sb
    .from("sample_requests")
    .update(updateFields)
    .eq("id", id)
    .select()
    .maybeSingle();

  if (error || !updated) { res.status(404).json({ error: "Sample not found" }); return; }
  res.json({ success: true, sample: updated });
});

router.put("/admin/designs/:id/notes", async (req, res): Promise<void> => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const { designer_notes, payment_link } = req.body;

  const { data: updated, error } = await sb
    .from("design_requests")
    .update({ designer_notes, payment_link })
    .eq("id", id)
    .select()
    .maybeSingle();

  if (error || !updated) { res.status(404).json({ error: "Design not found" }); return; }
  res.json({ success: true, design: updated });
});

router.post("/admin/quotes/:id/accept", async (req, res): Promise<void> => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const { total_price, payment_type, line_items } = req.body;

  const { data: quote } = await sb.from("quote_requests").select("*").eq("id", id).maybeSingle();
  if (!quote) {
    res.status(404).json({ error: "Quote not found" });
    return;
  }

  let userId: string | undefined;
  let userCreated = false;

  const { data: existingUser } = await sb
    .from("users_profile")
    .select("*")
    .eq("email", quote.email.toLowerCase())
    .maybeSingle();

  if (!existingUser) {
    const tempPassword = generateTempPassword();
    const { data: newUser } = await sb
      .from("users_profile")
      .insert({
        email: quote.email.toLowerCase(),
        company_name: quote.company_name,
        contact_name: quote.contact_name,
        phone: quote.phone,
        country: quote.delivery_country,
        password_hash: hashPassword(tempPassword),
        orders_completed: 0,
        credit_eligible: false,
        credit_limit: 0,
        default_address: { must_change_password: true },
      })
      .select()
      .single();

    userId = newUser?.id;
    userCreated = true;

    await sendWhatsApp(
      quote.phone,
      `Welcome to Packwerk! Your account is ready.\nEmail: ${quote.email}\nTemp Password: ${tempPassword}\nLogin at packwerk.replit.app/login\nYour order is waiting inside.`
    );
  } else {
    userId = existingUser.id;
  }

  await sb
    .from("quote_requests")
    .update({ status: "accepted", user_id: userId })
    .eq("id", id);

  const orderId = await generateId("ORD", "orders", "order_id");
  const discountApplied = payment_type === "upfront" ? Math.round(total_price * 0.03) : 0;

  const { data: order } = await sb
    .from("orders")
    .insert({
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
    .select()
    .single();

  const invoiceId = await generateId("INV", "invoices", "invoice_id");
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + (payment_type === "credit" ? 30 : 7));

  await sb.from("invoices").insert({
    invoice_id: invoiceId,
    order_id: order?.id,
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
  const { data: orders } = await sb.from("orders").select("*").order("created_at", { ascending: false });
  res.json(
    (orders || []).map(o => ({
      ...o,
      total_price: Number(o.total_price),
      discount_applied: Number(o.discount_applied ?? 0),
      delivery_address: o.delivery_address ?? {},
    }))
  );
});

router.put("/admin/orders/:id/status", async (req, res): Promise<void> => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const { status, tracking_number, tracking_url, payment_link, estimated_delivery, internal_notes, total_price } = req.body;

  const updateFields: Record<string, any> = {};
  if (status !== undefined) updateFields.status = status;
  if (tracking_number !== undefined) updateFields.tracking_number = tracking_number;
  if (tracking_url !== undefined) updateFields.tracking_url = tracking_url;
  if (estimated_delivery !== undefined) updateFields.estimated_delivery = estimated_delivery;
  if (internal_notes !== undefined) updateFields.internal_notes = internal_notes;
  if (total_price !== undefined) updateFields.total_price = total_price.toString();

  const { data: updated, error } = await sb
    .from("orders")
    .update(updateFields)
    .eq("id", id)
    .select()
    .maybeSingle();

  if (error || !updated) {
    res.status(404).json({ error: "Order not found" });
    return;
  }

  if (status === "dispatched" && tracking_url && updated.user_id) {
    const { data: user } = await sb.from("users_profile").select("phone").eq("id", updated.user_id).maybeSingle();
    if (user?.phone) {
      await sendWhatsApp(user.phone, `Your order ${updated.order_id} has been dispatched! Track here: ${tracking_url}`);
    }
  }

  if (status === "delivered" && updated.user_id) {
    const { data: user } = await sb.from("users_profile").select("*").eq("id", updated.user_id).maybeSingle();
    if (user) {
      const newCount = (user.orders_completed ?? 0) + 1;
      const creditEligible = newCount >= 3;
      await sb
        .from("users_profile")
        .update({ orders_completed: newCount, credit_eligible: creditEligible })
        .eq("id", updated.user_id);

      if (creditEligible && user.phone) {
        await sendWhatsApp(user.phone, `Congratulations! You are now eligible for net-30 credit terms with Packwerk.`);
      }
    }
  }

  res.json({ success: true, order: { ...updated, total_price: Number(updated.total_price) } });
});

router.get("/admin/designs", async (_req, res): Promise<void> => {
  const { data: designs } = await sb.from("design_requests").select("*").order("created_at", { ascending: false });
  res.json(designs || []);
});

router.put("/admin/designs/:id/status", async (req, res): Promise<void> => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const { status, designer_notes } = req.body;

  const { data: updated, error } = await sb
    .from("design_requests")
    .update({ status, designer_notes })
    .eq("id", id)
    .select()
    .maybeSingle();

  if (error || !updated) {
    res.status(404).json({ error: "Design request not found" });
    return;
  }
  res.json({ success: true, design: updated });
});

router.get("/admin/samples", async (_req, res): Promise<void> => {
  const { data: samples } = await sb.from("sample_requests").select("*").order("created_at", { ascending: false });
  res.json(samples || []);
});

router.get("/admin/users", async (_req, res): Promise<void> => {
  try {
    const { data: users, error } = await sb
      .from("users_profile")
      .select("id,email,company_name,contact_name,phone,gstin,country,orders_completed,credit_eligible,credit_limit,created_at")
      .order("created_at", { ascending: false });

    if (error) throw error;
    res.json((users || []).map(u => ({ ...u, credit_limit: Number(u.credit_limit ?? 0) })));
  } catch (err: any) {
    console.error("[admin/users] error:", err?.message);
    res.status(500).json({ error: "Failed to load users" });
  }
});

router.post("/admin/users", async (req, res): Promise<void> => {
  const { email, company_name, contact_name, phone, password, gstin, country, send_welcome } = req.body;

  if (!email || !company_name) {
    res.status(400).json({ error: "email and company_name are required" });
    return;
  }

  const { data: existing } = await sb
    .from("users_profile")
    .select("id")
    .eq("email", email.toLowerCase().trim())
    .maybeSingle();

  if (existing) {
    res.status(409).json({ error: "A user with this email already exists" });
    return;
  }

  const tempPassword = password || generateTempPassword();

  const { data: newUser, error } = await sb
    .from("users_profile")
    .insert({
      email: email.toLowerCase().trim(),
      company_name,
      contact_name: contact_name ?? "",
      phone: phone ?? "",
      gstin: gstin ?? "",
      country: country ?? "India",
      password_hash: hashPassword(tempPassword),
      orders_completed: 0,
      credit_eligible: false,
      credit_limit: 0,
      default_address: { must_change_password: true },
    })
    .select("id,email,company_name,contact_name,created_at")
    .single();

  if (error || !newUser) {
    console.error("[admin/users] insert error:", error?.message);
    res.status(500).json({ error: "Failed to create user" });
    return;
  }

  if (send_welcome !== false) {
    const loginUrl = `https://${process.env.REPLIT_DOMAINS?.split(",")[0] || "packworkz.com"}/login`;
    sendWelcomeEmail({
      to: email,
      name: contact_name || company_name,
      tempPassword,
      loginUrl,
    }).catch(err => console.error("[email] Welcome email failed:", err));
  }

  res.status(201).json({ success: true, user: newUser, temp_password: tempPassword });
});

router.put("/admin/users/:id/password", async (req, res): Promise<void> => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const { password } = req.body;

  if (!password) {
    res.status(400).json({ error: "password is required" });
    return;
  }

  const { data: updated, error } = await sb
    .from("users_profile")
    .update({ password_hash: hashPassword(password) })
    .eq("id", id)
    .select("id,email")
    .maybeSingle();

  if (error || !updated) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  res.json({ success: true, user: updated });
});

router.delete("/admin/users/:id", async (req, res): Promise<void> => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  await sb.from("users_profile").delete().eq("id", id);
  res.json({ success: true });
});

router.post("/admin/samples/:id/dispatch", async (req, res): Promise<void> => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

  const { data: updated, error } = await sb
    .from("sample_requests")
    .update({ status: "dispatched" })
    .eq("id", id)
    .select()
    .maybeSingle();

  if (error || !updated) {
    res.status(404).json({ error: "Sample request not found" });
    return;
  }
  res.json({ success: true, sample: updated });
});

export default router;
