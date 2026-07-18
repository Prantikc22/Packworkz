import { Router, type IRouter } from "express";
import { notifySlack } from "../lib/slack";

const router: IRouter = Router();

const SYSTEM_PROMPT = `You are Packworkz AI, a packaging planning assistant for Packworkz, an Indian B2B packaging platform. Understand the product and recommend practical formats from the current Packworkz catalog.

## Your personality
- Warm, knowledgeable, practical — like a trusted senior packaging advisor
- Tie recommendations to protection, operational fit and likely cost drivers
- Never give generic advice — always be specific to what the user packs
- Keep responses concise (3-5 sentences max per reply, unless presenting a recommendation table)
- Use ₹ for prices, and Indian market context

## Conversation flow — follow this sequence:
1. Greet and ask what product they want to package
2. Ask quantity (units per month or per order) 
3. Ask about their current packaging situation (what they use now, what's the problem)
4. Ask if they need design / branding support
5. Give 2-3 specific SKU recommendations with reasons and an indicative price band
Do not repeat a question the user has already answered. When both product and quantity are present, recommend immediately and place at most one useful follow-up question at the end.

## Current launch catalog (price bands are indicative, before GST)
Instant-buy families: FP-101 Stand-up Pouch (MOQ 250, ₹8.90–32/unit); FP-103 Flat-bottom & Gusseted Pouch (500, ₹8–28); FP-104 Spout & Refill Pouch (500, ₹9–32); FP-105 Sachet / Stick Pack (5,000, ₹0.80–4); BC-201 Plastic Bottles & Jars (500, ₹8–45); BC-202 Glass Bottles & Jars (200, ₹22–120); BC-204 Cosmetic Jar (200, ₹12–75); BC-205 Dropper Bottle (200, ₹15–60); BC-206 Airless Pump Bottle (200, ₹28–130); BC-213 Perfume and Attar Bottle (100, ₹46–88); TS-301 Cosmetic Tube (1,000, ₹5–22); BX-401 Folding Cartons (500, ₹3–18); BX-402 Rigid & Magnetic Boxes (100, ₹65–350); EC-501 Mailer Box (200, ₹18–75); EC-502 Corrugated Shipping Box (500, ₹8–35); EC-503 Food Delivery Box (200, ₹10–40); EC-504 Courier & Return Mailers (1,000, ₹2.50–10); EC-505 Paper & Padded Mailers (100, ₹10.80–24); EC-509 Frosted Zipper Garment Bag (100, ₹10–22); EC-510 Printed Paper Carrier Bag (50, ₹9.50–24); PR-601 Protective Wrap & Void Fill (1 roll, ₹1,200–5,000/roll); LC-801 Custom Labels & Stickers (1,000, ₹0.50–8); LC-808 Hang Tags & Insert Cards (50, ₹3.20–12); LC-810 Printed Tissue & Wrapping Paper (250, ₹6.40–14); LC-811 Custom Packaging Tape (72 rolls, ₹56–92/roll); SP-905 Bagasse Food Containers (500, ₹7–9.80); SP-907 Paper Cups, Bowls & Food Tubs (1,000, ₹3.60–5.80); SP-909 Greaseproof & Food Wrap Paper (1,000, ₹1.30–2.90).
Managed-quote families: PR-602 Custom Inserts & Dividers; RL-701 Printed Flexible Rollstock; FP-110 Retort Pouch; FP-112 Flow-wrap & Pillow Pack; RL-704 Lidding & Sealing Film; RL-705 Shrink Film & Sleeve Rollstock; LC-806 Shrink Sleeve & Wrap-around Labels.
Instant-buy families move to a managed quote at their published high-volume threshold. Do not invent or recommend SKU codes outside this list.

## Rules:
- ALWAYS recommend current SKU codes with the indicative price range
- Compare 2-3 options when possible (good/better/best)
- Ask clarifying questions before recommending if info is insufficient
- Respect format fit before price. Never suggest a mechanically incompatible pack just to provide more options.
- Coffee and tea: use FP-103 or FP-101 with the barrier and degassing-valve question; never recommend a spout pouch.
- Liquids and refills: FP-104 is suitable only after checking viscosity, hot-fill needs and closure compatibility.
- Creams and balms: prefer BC-204; serums and oils: prefer BC-205 or BC-206 after compatibility review.
- Apparel: prefer EC-509 for presentation or EC-504 for dispatch; electronics need EC-501 or EC-502 plus PR-602 when a fitted insert is required.
- Food-service formats must be checked for grease, temperature, liquid hold and lid fit before recommendation.
- Never promise a certification, exact saving, delivery date or final price. Explain what needs verification.
- Unit pricing generally decreases with volume, but final pricing depends on dimensions, material, print, closure, artwork and delivery.
- If the user asks about something outside packaging, gently redirect
- After recommending, offer the configurator for standard SKUs or an assisted quote for technical SKUs
- Keep your tone helpful and practical, not salesy`;

// Replit proxy requires no :free suffix; real OpenRouter API requires :free for free-tier models
const isReplitProxy = !!process.env.AI_INTEGRATIONS_OPENROUTER_BASE_URL;
const MODELS = isReplitProxy
  ? [
      "meta-llama/llama-3.3-70b-instruct",
      "google/gemma-3-27b-it",
      "mistralai/mistral-nemo",
      "meta-llama/llama-3.1-8b-instruct",
    ]
  : [
      "openrouter/auto",
      "openrouter/free",
    ];

// Simple in-memory cooldown: track which models recently failed
const modelCooldown = new Map<string, number>();
const COOLDOWN_MS = 30_000; // 30s cooldown per model after failure

function isOnCooldown(model: string): boolean {
  const t = modelCooldown.get(model);
  if (!t) return false;
  if (Date.now() - t > COOLDOWN_MS) { modelCooldown.delete(model); return false; }
  return true;
}

function setCooldown(model: string) {
  modelCooldown.set(model, Date.now());
}

async function tryModel(
  model: string,
  messages: Array<{ role: string; content: string }>,
  systemPrompt: string,
  apiKey: string
): Promise<{ ok: true; reply: string } | { ok: false; rateLimited: boolean }> {
  try {
    // Gemma models don't support "system" role — inject into first user message
    const isGemma = model.startsWith("google/gemma");
    const [firstUser, ...rest] = messages;
    const preparedMessages = isGemma
      ? [
          { role: "user", content: `<system_instructions>\n${systemPrompt}\n</system_instructions>\n\n${firstUser?.content ?? "Hello"}` },
          ...rest,
        ]
      : [{ role: "system", content: systemPrompt }, ...messages];

    const baseUrl = process.env.AI_INTEGRATIONS_OPENROUTER_BASE_URL ?? "https://openrouter.ai/api/v1";
    // Keep per-model timeout under Vercel's function limit (10s hobby / 60s pro)
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://packworkz.com",
        "X-Title": "Packworkz PackAI",
      },
      body: JSON.stringify({
        model,
        messages: preparedMessages,
        max_tokens: 600,
        temperature: 0.7,
        provider: {
          sort: "latency",
          allow_fallbacks: true,
          preferred_max_latency: 4,
        },
      }),
      signal: AbortSignal.timeout(15_000),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error(`[PackAI] model=${model} status=${response.status} err=${errText.substring(0, 200)}`);
      const isRateLimit = response.status === 429 || errText.includes("rate") || errText.includes("limit") || errText.includes("temporarily");
      if (isRateLimit) setCooldown(model);
      return { ok: false, rateLimited: isRateLimit };
    }

    const data = await response.json() as { choices: Array<{ finish_reason?: string; message: { content: string } }> };
    const reply = data.choices?.[0]?.message?.content?.trim() ?? "";
    const finishReason = data.choices?.[0]?.finish_reason;
    const looksComplete = /[.!?)](?:[*_`])?$/.test(reply);
    if (!reply || finishReason === "length" || !looksComplete) {
      console.error(`[PackAI] model=${model} returned incomplete reply (finish=${finishReason ?? "unknown"})`);
      return { ok: false, rateLimited: false };
    }

    return { ok: true, reply };
  } catch (err) {
    console.error(`[PackAI] model=${model} threw:`, err instanceof Error ? err.message : String(err));
    return { ok: false, rateLimited: false };
  }
}

// Keyword-based smart fallback when all AI models fail
function smartFallback(messages: Array<{ role: string; content: string }>): string {
  const lastUser = [...messages].reverse().find(m => m.role === "user")?.content?.toLowerCase() ?? "";
  const userText = messages.filter(m => m.role === "user").map(m => m.content).join(" ").toLowerCase();
  const quantityMatch = userText.match(/([\d,]+)\s+(?:[a-z-]+\s+){0,2}(?:units?|pcs?|pieces?|packs?)\b/i);
  const quantity = quantityMatch ? Number(quantityMatch[1].replace(/,/g, "")) : null;

  const formatRecommendation = (
    product: string,
    options: Array<{ sku: string; name: string; fit: string; moq: number; low: number; high: number }>,
  ) => {
    if (!quantity) {
      const shortlist = options.slice(0, 2).map(option => `- **${option.sku} · ${option.name}** — ${option.fit}; MOQ ${option.moq.toLocaleString("en-IN")}`).join("\n");
      return `For **${product}**, I would start with these two formats:\n${shortlist}\n\nWhat quantity do you need per order? Once I have that, I can compare the practical price band and flag whether self-serve or an assisted quote is the better path.`;
    }

    const shortlist = options.slice(0, 2).map(option => {
      const orderQty = Math.max(quantity, option.moq);
      const lowTotal = Math.round(orderQty * option.low).toLocaleString("en-IN");
      const highTotal = Math.round(orderQty * option.high).toLocaleString("en-IN");
      const moqNote = quantity < option.moq ? ` MOQ requires ${option.moq.toLocaleString("en-IN")} units.` : "";
      return `- **${option.sku} · ${option.name}** — ${option.fit}. ₹${option.low}–₹${option.high}/unit; indicative order value ₹${lowTotal}–₹${highTotal}.${moqNote}`;
    }).join("\n");

    return `For **${quantity.toLocaleString("en-IN")} units of ${product}**, this is the strongest shortlist:\n${shortlist}\n\nMy recommendation is the first option unless shelf-life testing, filling equipment, or premium shelf presence changes the priority. Do you need custom printing, and what shelf life are you targeting?`;
  };

  if (/coffee|tea/.test(userText)) {
    return formatRecommendation("coffee or tea", [
      { sku: "FP-103", name: "Flat Bottom Pouch", fit: "best shelf presence with a strong barrier and optional degassing valve", moq: 500, low: 8, high: 28 },
      { sku: "FP-101", name: "Stand-up Pouch", fit: "more economical with zipper, barrier and optional degassing valve", moq: 250, low: 8.9, high: 32 },
    ]);
  }
  if (/spice|powder|flour|dry food|snack|namkeen/.test(userText)) {
    return formatRecommendation("your dry food product", [
      { sku: "FP-105", name: "Sachet / Stick Pack", fit: "efficient for single-serve powders and controlled portions", moq: 5000, low: 0.8, high: 4 },
      { sku: "FP-101", name: "Stand-up Pouch", fit: "better for resealability and premium retail presentation", moq: 250, low: 8.9, high: 32 },
    ]);
  }
  if (/serum|skincare|cosmetic|beauty|cream|lotion/.test(userText)) {
    return formatRecommendation("your skincare product", [
      { sku: "BC-204", name: "Cosmetic Jar", fit: "premium feel for creams and balms after compatibility review", moq: 200, low: 12, high: 75 },
      { sku: "BC-201", name: "Plastic Bottle (PET/HDPE)", fit: "lighter and more economical for scale", moq: 500, low: 8, high: 45 },
    ]);
  }
  if (/protein|supplement|nutraceutical|capsule|tablet/.test(userText)) {
    return formatRecommendation("your supplement", [
      { sku: "BC-201", name: "Plastic Bottle (PET/HDPE)", fit: "easy dispensing and familiar supplement presentation", moq: 500, low: 8, high: 45 },
      { sku: "FP-103", name: "Flat Bottom Pouch", fit: "lower freight and stronger refill-pack economics", moq: 500, low: 8, high: 28 },
    ]);
  }
  if (/apparel|clothing|garment|fashion|t-shirt|shirt/.test(userText)) {
    return formatRecommendation("your apparel product", [
      { sku: "EC-504", name: "Courier Bag", fit: "lowest practical dispatch cost for soft goods", moq: 1000, low: 2.5, high: 10 },
      { sku: "EC-501", name: "Mailer Box", fit: "stronger protection and a more structured unboxing", moq: 200, low: 18, high: 75 },
    ]);
  }
  if (/electronic|gadget|device|fragile/.test(userText)) {
    return formatRecommendation("your electronic product", [
      { sku: "EC-501", name: "Mailer Box", fit: "best protection with room for a fitted insert", moq: 200, low: 18, high: 75 },
      { sku: "EC-502", name: "Corrugated Shipping Box", fit: "more economical for secondary transit packaging", moq: 500, low: 8, high: 35 },
    ]);
  }

  if (lastUser.includes("price") || lastUser.includes("cost") || lastUser.includes("rate") || lastUser.includes("₹")) {
    return "Pricing depends on the format, dimensions, material, print, closure and quantity. Unit pricing generally decreases as quantity rises, but every catalog band is indicative until the specification and artwork are reviewed. Tell me what you are packing and the quantity per order, and I will compare the closest current SKU bands.";
  }
  if (lastUser.includes("moq") || lastUser.includes("minimum")) {
    return "MOQs vary by production method: standard rigid boxes can start at 100 units, bottles and jars at 200, many pouches at 500–1,000, and printed rollstock at 100kg. Tell me the product and quantity and I will flag whether it fits self-serve configuration or needs an assisted quote.";
  }
  if (lastUser.includes("sustainable") || lastUser.includes("eco") || lastUser.includes("compostable") || lastUser.includes("kraft")) {
    return "The current lower-impact range includes:\n- **SP-905 · Bagasse Food Containers** — MOQ 500 · ₹7–9.80/unit\n- **SP-907 · Paper Cups, Bowls & Food Tubs** — MOQ 1,000 · ₹3.60–5.80/unit\n- **SP-909 · Greaseproof & Food Wrap Paper** — MOQ 1,000 · ₹1.30–2.90/unit\n- **EC-505 · Paper & Padded Mailers** — MOQ 100 · ₹10.80–24/unit\n\nThe right option depends on barrier, leak and transit requirements. Certification and end-of-life claims must be verified against the final construction.";
  }
  if (lastUser.includes("pouch") || lastUser.includes("flexible") || lastUser.includes("packet")) {
    return "For flexible packaging, start with:\n- **FP-101 · Stand-up Pouch** — ₹8.90–32/unit, MOQ 250\n- **FP-103 · Flat-bottom & Gusseted Pouch** — ₹8–28/unit, MOQ 500\n- **FP-104 · Spout & Refill Pouch** — ₹9–32/unit, MOQ 500\n\nFor machine-made pillow packs, use **FP-112 · Flow-wrap & Pillow Pack**, which follows the managed-quote route. Tell me the product, pack weight, shelf-life target and quantity so I can narrow the material and barrier route.";
  }
  if (lastUser.includes("box") || lastUser.includes("carton") || lastUser.includes("rigid")) {
    return "For boxes and cartons:\n- **BX-401 · Folding Cartons** — ₹3–18/unit, MOQ 500\n- **EC-501 · Mailer Box** — ₹18–75/unit, MOQ 200\n- **EC-502 · Corrugated Shipping Box** — ₹8–35/unit, MOQ 500\n- **BX-402 · Rigid & Magnetic Boxes** — ₹65–350/unit, MOQ 100\n\nTell me the product dimensions, weight and whether this is a shelf pack or a shipper.";
  }

  return "Let's build this properly. **What product are you packaging, and how many units do you need per order?**\n\nYou can answer in one line, for example: `250g roasted coffee, 2,500 units, premium matte finish`. I will return a practical format shortlist, MOQ fit, indicative price band, and the next self-serve or assisted step.";
}

function hasCompletePlanningBrief(messages: Array<{ role: string; content: string }>): boolean {
  const userText = messages.filter(message => message.role === "user").map(message => message.content).join(" ").toLowerCase();
  const hasQuantity = /[\d,]+\s+(?:[a-z-]+\s+){0,2}(?:units?|pcs?|pieces?|packs?)\b/i.test(userText);
  const hasKnownProduct = /coffee|tea|spice|powder|flour|dry food|snack|namkeen|serum|skincare|cosmetic|beauty|cream|lotion|protein|supplement|nutraceutical|capsule|tablet|apparel|clothing|garment|fashion|t-shirt|shirt|electronic|gadget|device|fragile/.test(userText);
  return hasQuantity && hasKnownProduct;
}

router.post("/pack-ai/chat", async (req, res): Promise<void> => {
  const { messages } = req.body;

  if (!messages || !Array.isArray(messages)) {
    res.status(400).json({ error: "messages array required" });
    return;
  }

  const apiKey = process.env.AI_INTEGRATIONS_OPENROUTER_API_KEY || process.env.OPENROUTER_API_KEY;
  const baseUrl = process.env.AI_INTEGRATIONS_OPENROUTER_BASE_URL ?? "https://openrouter.ai/api/v1";
  console.log(`[PackAI] env=isReplitProxy:${isReplitProxy} apiKey:${apiKey ? "present" : "MISSING"} baseUrl:${baseUrl.substring(0, 50)} models:${MODELS.join(",")}`);

  const typedMessages = messages as Array<{ role: string; content: string }>;
  const respond = async (reply: string, model: string) => {
    const latestUserMessage = [...typedMessages].reverse().find(message => message.role === "user")?.content || "";
    const slack = await notifySlack({
      source: "Packworkz AI",
      title: "Packaging planner interaction",
      summary: latestUserMessage,
      fields: [
        { label: "Planner response", value: reply },
        { label: "Model", value: model },
        { label: "Conversation turns", value: typedMessages.filter(message => message.role === "user").length },
      ],
    });
    res.json({ reply, slack_delivered: slack.delivered });
  };

  if (!apiKey) {
    console.error("[PackAI] No API key found — returning fallback");
    const fallback = smartFallback(typedMessages);
    await respond(fallback, "catalog fallback");
    return;
  }

  if (hasCompletePlanningBrief(typedMessages)) {
    await respond(smartFallback(typedMessages), "verified catalog planner");
    return;
  }

  // Try each model, skipping ones on cooldown
  for (const model of MODELS) {
    if (isOnCooldown(model)) { console.log(`[PackAI] skipping ${model} (on cooldown)`); continue; }

    const result = await tryModel(model, typedMessages, SYSTEM_PROMPT, apiKey);
    if (result.ok) {
      console.log(`[PackAI] success with ${model}`);
      await respond(result.reply, model);
      return;
    }
  }

  // All AI models failed — return intelligent static fallback instead of 503
  console.error("[PackAI] All models failed — returning smart fallback");
  const fallback = smartFallback(typedMessages);
  await respond(fallback, "catalog fallback");
});

export default router;
