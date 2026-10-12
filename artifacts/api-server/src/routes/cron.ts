// Scheduled jobs (Vercel Cron, see vercel.json). Vercel sends
// "Authorization: Bearer $CRON_SECRET" when CRON_SECRET is set in the project.
import { Router, type IRouter } from "express";
import { sb } from "../lib/supabase";
import { sendCalculatorFollowUp } from "../lib/email";
import { readCalculatorQuote } from "../lib/calculatorQuote";

const router: IRouter = Router();
const HOUR = 60 * 60 * 1000;

router.get("/cron/calculator-followups", async (req, res): Promise<void> => {
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.authorization !== `Bearer ${secret}`) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  // Leads saved 20–44 hours ago: "the next day" for a once-a-day schedule.
  const now = Date.now();
  const { data: leads, error } = await sb
    .from("quote_requests")
    .select("id, contact_name, email, items, created_at")
    .eq("status", "lead")
    .filter("items", "cs", JSON.stringify([{ source: "calculator_quote" }]))
    .gte("created_at", new Date(now - 44 * HOUR).toISOString())
    .lte("created_at", new Date(now - 20 * HOUR).toISOString());
  if (error) {
    console.error("[cron/calculator-followups]", error.message);
    res.status(500).json({ error: error.message });
    return;
  }

  const result = { checked: leads?.length || 0, sent: 0, skipped: 0 };
  for (const lead of leads || []) {
    const items = Array.isArray(lead.items) ? [...lead.items] : [];
    const first = { ...(items[0] || {}) };
    const metadata = { ...(first.metadata || {}) } as Record<string, unknown>;
    const email = String(lead.email || "");
    const quote = readCalculatorQuote(metadata);
    let outcome: string | null = null;

    if (metadata.follow_up_sent_at || metadata.follow_up_skipped) { result.skipped++; continue; }
    if (!quote || !email || email.endsWith(".invalid")) outcome = "no_email";
    else {
      // Already placed a quote or order since pricing: no nudge needed.
      const { count } = await sb
        .from("quote_requests")
        .select("id", { count: "exact", head: true })
        .eq("email", email)
        .neq("preferred_timeline", "inquiry")
        .gt("created_at", lead.created_at);
      if ((count || 0) > 0) outcome = "converted";
    }

    if (outcome) {
      metadata.follow_up_skipped = outcome;
      result.skipped++;
    } else {
      const sent = await sendCalculatorFollowUp({ to: email, name: lead.contact_name || "", quote: quote! }).catch(() => null);
      if (!sent?.ok) { result.skipped++; continue; }
      metadata.follow_up_sent_at = new Date().toISOString();
      result.sent++;
    }
    first.metadata = metadata;
    items[0] = first;
    await sb.from("quote_requests").update({ items }).eq("id", lead.id);
  }

  res.json(result);
});

export default router;
