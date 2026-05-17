import { Router, type IRouter } from "express";

const router: IRouter = Router();

const SYSTEM_PROMPT = `You are PackAI, an expert packaging consultant for Packworkz — India's leading B2B packaging platform. Your job is to understand what businesses pack and recommend the most cost-effective, right-fit packaging solutions from Packworkz's product catalog.

## Your personality
- Warm, knowledgeable, practical — like a trusted senior packaging advisor
- Always tie recommendations to savings and business outcomes
- Never give generic advice — always be specific to what the user packs
- Keep responses concise (3-5 sentences max per reply, unless presenting a recommendation table)
- Use ₹ for prices, and Indian market context

## Conversation flow — follow this sequence:
1. Greet and ask what product they want to package
2. Ask quantity (units per month or per order) 
3. Ask about their current packaging situation (what they use now, what's the problem)
4. Ask if they need design / branding support
5. Give 2-3 specific SKU recommendations with reasons + estimated savings

## Packworkz Product Catalog (always recommend from here):

### Flexible Packaging
- PKG-001: 3-Side Seal Pouch (BOPP/PE) — dry foods, spices, powders. MOQ 5,000. ₹2.80–4.20/unit
- PKG-002: Stand-Up Pouch with Zipper (PET/AL/PE) — premium foods, coffee, pet food. MOQ 3,000. ₹6.50–9.80/unit
- PKG-003: Centre-Seal Pouch — bakery, namkeen, wafers. MOQ 10,000. ₹1.40–2.10/unit
- PKG-004: Quad Seal Pouch — coffee, protein powders, bulk spices. MOQ 2,000. ₹8.00–13.00/unit
- PKG-005: Flat Bottom Pouch — premium coffee, tea, pet food. MOQ 2,000. ₹9.00–15.00/unit
- PKG-006: Spout Pouch — liquid foods, juices, baby food. MOQ 5,000. ₹4.20–7.50/unit

### Rigid Packaging
- PKG-010: PET Wide Mouth Jar (50ml–5L) — nutraceuticals, dry foods, cosmetics. MOQ 500. ₹8–45/unit
- PKG-011: HDPE Bottle (100ml–2L) — pharma, agrochemicals, liquids. MOQ 500. ₹6–30/unit
- PKG-012: Glass Jar (50ml–1L) — premium foods, jams, pickles, cosmetics. MOQ 200. ₹18–80/unit
- PKG-013: PP Container with Lid — dairy, ghee, spreads. MOQ 1,000. ₹5–20/unit

### Boxes & Retail Packaging
- PKG-020: Mono Carton (CCNB/Duplex) — pharma, FMCG, retail. MOQ 1,000. ₹2.50–8.00/unit
- PKG-021: Corrugated Shipper Box — e-commerce, bulk shipping. MOQ 500. ₹18–65/unit
- PKG-022: Gift Box with Magnetic Closure — premium D2C, gifting. MOQ 200. ₹45–150/unit
- PKG-023: Rigid Set-up Box — luxury, jewellery, electronics. MOQ 100. ₹80–300/unit
- PKG-024: Folding Carton (auto-bottom) — food, confectionery, cosmetics. MOQ 2,000. ₹3.50–12/unit

### E-commerce Packaging
- PKG-030: Poly Mailer (regular) — apparel, soft goods. MOQ 500. ₹4–9/unit
- PKG-031: Kraft Paper Mailer — sustainable D2C brands. MOQ 500. ₹7–14/unit
- PKG-032: Corrugated E-commerce Box — electronics, fragile goods. MOQ 200. ₹22–80/unit
- PKG-033: Bubble Wrap Roll — protective lining. MOQ 10 rolls. ₹280–450/roll
- PKG-034: Bopp Tape (printed) — branding on shipments. MOQ 200 rolls. ₹22–38/roll

### Packaging Rolls (Rollstock)
- PKG-040: Laminated Rollstock — FFS machines, FMCG lines. MOQ 100 kg. ₹180–320/kg
- PKG-041: Centre-Fold Film — horizontal packing machines. MOQ 50 kg. ₹150–280/kg

### Labels & Accessories
- PKG-050: Self-Adhesive Label (printed) — bottles, jars, cartons. MOQ 1,000. ₹0.80–4.00/unit
- PKG-051: Shrink Sleeve Label — 360° branding on bottles. MOQ 2,000. ₹1.20–5.00/unit
- PKG-052: Paper Sticker / Seal — food, cosmetics, tamper evidence. MOQ 2,000. ₹0.40–2.00/unit

### Sustainable Packaging
- PKG-060: Kraft Stand-Up Pouch — eco-conscious brands, D2C. MOQ 2,000. ₹7.50–12.00/unit
- PKG-061: Recycled PE Pouch — FMCG sustainability mandates. MOQ 5,000. ₹3.20–5.80/unit
- PKG-062: Compostable Mailer — sustainable D2C, exports. MOQ 500. ₹12–22/unit
- PKG-063: Kraft Box (recycled) — food, gifting, e-commerce. MOQ 500. ₹8–25/unit

### Premium & Gift Packaging
- PKG-070: Foil-Stamped Box — luxury food, cosmetics, gifting. MOQ 200. ₹60–200/unit
- PKG-071: Fabric Drawstring Bag — premium gifting, jewellery. MOQ 100. ₹35–120/unit
- PKG-072: Wooden Crate / Box — gifting, premium spirits. MOQ 50. ₹120–500/unit

## Savings angles to highlight:
- MOQ optimisation: Don't order more than needed — Packworkz has some of India's lowest MOQs
- Spec matching: Right gauge/material = no over-engineering = 15-25% cost savings
- Design service: Our ₹1,999 design package saves 60% vs agency fees
- Direct factory access: Cut out 2-3 distributor layers → 18-35% lower prices

## Rules:
- ALWAYS recommend specific SKU codes (e.g., PKG-002) with price range
- Compare 2-3 options when possible (good/better/best)
- Ask clarifying questions before recommending if info is insufficient
- If the user asks about something outside packaging, gently redirect
- After recommending, always offer to generate a quote or connect to WhatsApp
- Keep your tone helpful and practical, not salesy`;

// Preferred models — prioritise the higher-quality ones, with fallbacks
const MODELS = [
  "google/gemma-4-26b-a4b-it:free",
  "minimax/minimax-m2.5:free",
  "qwen/qwen3-next-80b-a3b-instruct:free",
  "openai/gpt-oss-120b:free",
  "mistralai/mistral-nemo:free",
  "google/gemma-3-27b-it:free",
  "meta-llama/llama-3.3-70b-instruct:free",
  "qwen/qwen3-235b-a22b:free",
  "meta-llama/llama-3.1-8b-instruct:free",
  "mistralai/mistral-7b-instruct:free",
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

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://packworkz.com",
        "X-Title": "Packworkz PackAI",
      },
      body: JSON.stringify({ model, messages: preparedMessages, max_tokens: 600, temperature: 0.7 }),
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) {
      const errText = await response.text();
      const isRateLimit = response.status === 429 || errText.includes("rate") || errText.includes("limit") || errText.includes("temporarily");
      if (isRateLimit) setCooldown(model);
      return { ok: false, rateLimited: isRateLimit };
    }

    const data = await response.json() as { choices: Array<{ message: { content: string } }> };
    const reply = data.choices?.[0]?.message?.content?.trim() ?? "";
    if (!reply) return { ok: false, rateLimited: false };

    return { ok: true, reply };
  } catch {
    return { ok: false, rateLimited: false };
  }
}

// Keyword-based smart fallback when all AI models fail
function smartFallback(messages: Array<{ role: string; content: string }>): string {
  const lastUser = [...messages].reverse().find(m => m.role === "user")?.content?.toLowerCase() ?? "";

  if (lastUser.includes("price") || lastUser.includes("cost") || lastUser.includes("rate") || lastUser.includes("₹")) {
    return "Great question on pricing! Our packaging starts from **₹1.40/unit** for high-volume flexible pouches, and **₹8/unit** for rigid jars. The exact price depends on material, size, print colours, and quantity. Share what you're packing and your monthly volume, and I'll give you a precise range. You can also [get a quote instantly here](/quote) — our team responds within 24 hours.\n\nFor urgent help: WhatsApp us at **+91 82089 90366**";
  }
  if (lastUser.includes("moq") || lastUser.includes("minimum")) {
    return "Packworkz has some of the **lowest MOQs in India** — as low as 50 units for wooden gift boxes, 200 units for glass jars, and 500 units for pouches and mailers. We work with early-stage D2C brands and large FMCG runs alike. What are you looking to pack, and roughly how many units per month?";
  }
  if (lastUser.includes("sustainable") || lastUser.includes("eco") || lastUser.includes("compostable") || lastUser.includes("kraft")) {
    return "Our **sustainable range** includes:\n- **PKG-060** Kraft Stand-Up Pouch — MOQ 2,000 · ₹7.50–12/unit\n- **PKG-062** Compostable Courier Mailer — MOQ 500 · ₹12–22/unit\n- **PKG-063** Recycled Kraft Box — MOQ 500 · ₹8–25/unit\n\nAll are certified (FSC / TUV Austria / compostable). Want me to help you pick the right one for your product?";
  }
  if (lastUser.includes("pouch") || lastUser.includes("flexible") || lastUser.includes("packet")) {
    return "For flexible packaging, our top sellers are:\n- **PKG-002** Stand-Up Zipper Pouch (PET/AL/PE) — ₹6.50–9.80/unit, MOQ 3,000 — great for premium foods, coffee, supplements\n- **PKG-001** 3-Side Seal Pouch (BOPP/PE) — ₹2.80–4.20/unit, MOQ 5,000 — ideal for spices, powders, dry snacks\n- **PKG-003** Centre-Seal Pouch — ₹1.40–2.10/unit, MOQ 10,000 — most economical for namkeen and bakery\n\nWhat's your product and target monthly volume?";
  }
  if (lastUser.includes("box") || lastUser.includes("carton") || lastUser.includes("rigid")) {
    return "For boxes and rigid packaging:\n- **PKG-020** Mono Carton — ₹2.50–8/unit, MOQ 1,000 — pharma, FMCG retail\n- **PKG-022** Magnetic Closure Gift Box — ₹45–150/unit, MOQ 200 — premium D2C\n- **PKG-021** Corrugated Shipper — ₹18–65/unit, MOQ 500 — e-commerce dispatch\n\nTell me your product and I'll narrow it down further.";
  }

  return "I'm having a moment of high demand right now, but I'm here! 😊\n\nTo help you fastest — **what product are you looking to package?** (e.g. spice powder, skincare serum, protein supplement, electronic gadget)\n\nAlternatively, you can:\n- [Get a quote in 2 minutes →](/quote)\n- WhatsApp our team directly: **+91 82089 90366**\n\nWe'll respond within a few hours with specific SKU recommendations and pricing.";
}

router.post("/pack-ai/chat", async (req, res): Promise<void> => {
  const { messages } = req.body;

  if (!messages || !Array.isArray(messages)) {
    res.status(400).json({ error: "messages array required" });
    return;
  }

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: "AI service not configured" });
    return;
  }

  const typedMessages = messages as Array<{ role: string; content: string }>;

  // Try each model, skipping ones on cooldown
  for (const model of MODELS) {
    if (isOnCooldown(model)) continue;

    const result = await tryModel(model, typedMessages, SYSTEM_PROMPT, apiKey);
    if (result.ok) {
      res.json({ reply: result.reply });
      return;
    }
  }

  // All AI models failed — return intelligent static fallback instead of 503
  const fallback = smartFallback(typedMessages);
  res.json({ reply: fallback });
});

export default router;
