import { Router, type IRouter } from "express";
import Razorpay from "razorpay";
import { sb } from "../lib/supabase";
import { requireAdmin } from "../lib/auth";
import { notifySlack } from "../lib/slack";

const router: IRouter = Router();

const CATEGORY_IDS = [
  "snacks", "bars", "spreads-sauces", "beverages", "coffee-tea", "spices", "bakery", "confectionery",
  "ready-to-eat", "nutraceuticals", "ayurveda", "skincare", "haircare", "baby-care", "home-care", "pet-food",
];

const PARSE_PROMPT = `You turn a brand's manufacturing requirement into JSON for matching Indian CPG contract manufacturers.
Return ONLY a JSON object with these keys:
- "category": one of ${CATEGORY_IDS.join(", ")} (closest fit)
- "product": short product name, e.g. "protein bar"
- "monthly_units": integer or null
- "certifications": array from FSSAI, GMP, WHO-GMP, ISO, HACCP, BRCGS, AYUSH, Organic, US FDA, Halal (only those asked for)
- "services": array from "private label", "custom formulation", "contract manufacturing", "co-packing"
- "location": Indian state or city the user prefers, or null
- "packaging": the pack format mentioned or implied, e.g. "flow wrap", "stand-up pouch", "jar", "bottle", or null
- "summary": one sentence restating the brief
No prose, no markdown fences.`;

// Same OpenRouter configuration Pack AI uses. Parsing is an enhancement: when
// no key or model is available the client falls back to its own keyword parser.
router.post("/manufacturing/parse", async (req, res): Promise<void> => {
  const query = String(req.body?.query ?? "").trim().slice(0, 600);
  if (query.length < 3) {
    res.status(400).json({ error: "Describe what you want to make" });
    return;
  }
  const apiKey = process.env.AI_INTEGRATIONS_OPENROUTER_API_KEY || process.env.OPENROUTER_API_KEY;
  const baseUrl = process.env.AI_INTEGRATIONS_OPENROUTER_BASE_URL ?? "https://openrouter.ai/api/v1";
  if (!apiKey) {
    res.json({ parsed: null, ai: false });
    return;
  }
  const models = process.env.AI_INTEGRATIONS_OPENROUTER_BASE_URL
    ? ["meta-llama/llama-3.3-70b-instruct", "mistralai/mistral-nemo"]
    : ["openrouter/auto", "openrouter/free"];
  for (const model of models) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 9000);
      const response = await fetch(`${baseUrl}/chat/completions`, {
        method: "POST",
        signal: controller.signal,
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json", "HTTP-Referer": "https://packworkz.com", "X-Title": "Packworkz Manufacturing" },
        body: JSON.stringify({
          model,
          temperature: 0.1,
          max_tokens: 900,
          // Short structured task: skip long hidden reasoning so the answer fits and arrives fast.
          reasoning: { enabled: false },
          messages: [{ role: "user", content: `${PARSE_PROMPT}\n\nRequirement: ${query}` }],
        }),
      }).finally(() => clearTimeout(timer));
      if (!response.ok) {
        console.warn(`[manufacturing/parse] ${model} returned ${response.status}`);
        continue;
      }
      const data = await response.json() as { choices?: Array<{ message?: { content?: string } }> };
      const text = data.choices?.[0]?.message?.content ?? "";
      const json = text.slice(text.indexOf("{"), text.lastIndexOf("}") + 1);
      const parsed = JSON.parse(json);
      if (!CATEGORY_IDS.includes(parsed.category)) parsed.category = null;
      res.json({ parsed, ai: true });
      return;
    } catch (error: any) {
      console.warn(`[manufacturing/parse] ${model} failed: ${error?.message || error}`);
    }
  }
  res.json({ parsed: null, ai: false });
});

// Self-listed factories an admin has approved. Approval lives in the lead's
// JSON metadata so no schema change is needed.
router.get("/manufacturing/listings", async (_req, res): Promise<void> => {
  const { data, error } = await sb
    .from("quote_requests")
    .select("quote_id, company_name, items, created_at")
    // supabase-js turns an array argument to .contains() into a Postgres array literal,
    // which never matches a jsonb column, so pass the JSON explicitly.
    .filter("items", "cs", JSON.stringify([{ metadata: { kind: "manufacturer_application", approved: true } }]))
    .order("created_at", { ascending: false })
    .limit(500);
  if (error) {
    console.error("[manufacturing/listings]", error.message);
    res.json({ listings: [] });
    return;
  }
  const listings = (data || []).map((row: any) => {
    const meta = row.items?.[0]?.metadata || {};
    return {
      id: row.quote_id,
      name: row.company_name,
      profile: meta.profile || {},
      verified: meta.verification_level === "verified",
      basic_checked: meta.verification_level === "basic" || meta.verification_level === "verified",
    };
  });
  res.set("Cache-Control", "public, max-age=300");
  res.json({ listings });
});

const PAID_SERVICES: Record<string, number> = { launch_desk: 1_499_900, factory_verified: 499_900 };

// Records a verified Razorpay payment against the lead it pays for.
router.post("/manufacturing/mark-paid", async (req, res): Promise<void> => {
  const inquiryId = String(req.body?.inquiry_id || "").slice(0, 40);
  const paymentId = String(req.body?.razorpay_payment_id || "").slice(0, 60);
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!inquiryId || !paymentId || !keyId || !keySecret) {
    res.status(400).json({ error: "Missing payment details" });
    return;
  }
  try {
    const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });
    const payment = await razorpay.payments.fetch(paymentId);
    const order = await razorpay.orders.fetch(String(payment.order_id));
    const service = String((order.notes as Record<string, string>)?.service || "");
    if (!PAID_SERVICES[service] || Number(payment.amount) !== PAID_SERVICES[service] || !["captured", "authorized"].includes(String(payment.status))) {
      res.status(400).json({ error: "Payment does not match this service" });
      return;
    }
    const { data: lead } = await sb.from("quote_requests").select("id, items, admin_notes, company_name").eq("quote_id", inquiryId).maybeSingle();
    if (!lead) {
      res.status(404).json({ error: "Request not found" });
      return;
    }
    const items = Array.isArray(lead.items) ? lead.items : [];
    const first = items[0] || {};
    first.metadata = { ...(first.metadata || {}), paid_service: service, payment_id: paymentId, paid_at: new Date().toISOString() };
    items[0] = first;
    await sb.from("quote_requests").update({ items, admin_notes: `${lead.admin_notes || ""}\nPAID ${service} ₹${PAID_SERVICES[service] / 100} · ${paymentId}`.trim() }).eq("id", lead.id);
    await notifySlack({
      source: service === "launch_desk" ? "Launch Desk payment" : "Factory verification payment",
      title: `${lead.company_name} paid ₹${(PAID_SERVICES[service] / 100).toLocaleString("en-IN")}`,
      referenceId: inquiryId,
      summary: `Payment ${paymentId}`,
      fields: [],
    });
    res.json({ success: true });
  } catch (error: any) {
    console.error("[manufacturing/mark-paid]", error?.message);
    res.status(502).json({ error: "We could not confirm the payment yet. It is safe; our team will reconcile it." });
  }
});

// Admin: approve or update a factory application and its verification level.
router.put("/admin/manufacturers/:quoteId", requireAdmin as never, async (req, res): Promise<void> => {
  const quoteId = String(req.params.quoteId);
  const level = ["none", "basic", "verified"].includes(req.body?.verification_level) ? req.body.verification_level : "none";
  const approved = Boolean(req.body?.approved);
  const { data: lead } = await sb.from("quote_requests").select("id, items").eq("quote_id", quoteId).maybeSingle();
  if (!lead) {
    res.status(404).json({ error: "Application not found" });
    return;
  }
  const items = Array.isArray(lead.items) ? lead.items : [];
  const first = items[0] || {};
  first.metadata = { ...(first.metadata || {}), approved, verification_level: level, reviewed_at: new Date().toISOString() };
  items[0] = first;
  const { error } = await sb.from("quote_requests").update({ items }).eq("id", lead.id);
  if (error) {
    res.status(500).json({ error: "Could not update application" });
    return;
  }
  res.json({ success: true });
});

export default router;
