import { Router, type IRouter } from "express";
import { sb } from "../lib/supabase";
import { generateId } from "../lib/generateId";
import { notifySlack } from "../lib/slack";

const router: IRouter = Router();
const ALLOWED_SOURCES = new Set(["contact", "support", "pack_ai_handoff", "exit_offer", "newsletter", "enterprise_benchmark"]);

const clean = (value: unknown, max = 1200) => String(value ?? "").trim().slice(0, max);

router.post("/leads", async (req, res): Promise<void> => {
  const source = clean(req.body?.source, 40);
  const message = clean(req.body?.message, 3000);
  const name = clean(req.body?.name, 120) || "Website visitor";
  const company = clean(req.body?.company, 160) || "Not provided";
  const email = clean(req.body?.email, 240).toLowerCase();
  const phone = clean(req.body?.phone, 60);
  const subject = clean(req.body?.subject, 180) || "New website inquiry";
  const metadata = req.body?.metadata && typeof req.body.metadata === "object" ? req.body.metadata : {};

  if (!ALLOWED_SOURCES.has(source)) {
    res.status(400).json({ error: "Invalid inquiry source" });
    return;
  }
  if (message.length < 10) {
    res.status(400).json({ error: "Please include a little more detail" });
    return;
  }
  if (!email && !phone) {
    res.status(400).json({ error: "Add an email or phone number so we can respond" });
    return;
  }
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    res.status(400).json({ error: "Enter a valid email address" });
    return;
  }

  const inquiryId = await generateId("INQ", "quote_requests", "quote_id");
  const sourceLabel = source === "pack_ai_handoff"
    ? "Packworkz AI"
    : source === "support"
      ? "Support"
      : source === "exit_offer"
        ? "Exit offer"
        : source === "newsletter"
          ? "Newsletter"
          : source === "enterprise_benchmark"
            ? "Enterprise benchmark"
            : "Contact";
  const safeEmail = email || `unknown+${inquiryId.toLowerCase()}@packworkz.invalid`;

  const { data: inquiry, error } = await sb
    .from("quote_requests")
    .insert({
      quote_id: inquiryId,
      contact_name: name,
      company_name: company,
      email: safeEmail,
      phone: phone || "Not provided",
      items: [{ source, subject, message, metadata }],
      delivery_country: "India",
      preferred_timeline: "inquiry",
      notes: message,
      status: "lead",
      admin_notes: `Source: ${sourceLabel}`,
    })
    .select("id, quote_id")
    .single();

  if (error || !inquiry) {
    console.error("[leads/post] insert error:", error?.message);
    res.status(500).json({ error: "We could not save your message. Please try again." });
    return;
  }

  const slack = await notifySlack({
    source: sourceLabel,
    title: subject,
    referenceId: inquiryId,
    summary: message,
    fields: [
      { label: "Name", value: name },
      { label: "Company", value: company !== "Not provided" ? company : undefined },
      { label: "Email", value: email || undefined },
      { label: "Phone", value: phone || undefined },
    ],
  });

  if (!slack.delivered) {
    await sb.from("quote_requests")
      .update({ admin_notes: `Source: ${sourceLabel}\nSlack pending: ${slack.reason}` })
      .eq("id", inquiry.id);
    console.warn(`[leads/post] Slack notification pending: ${slack.reason}`);
  }

  res.status(201).json({ inquiry_id: inquiryId, saved: true, slack_delivered: slack.delivered });
});

export default router;
