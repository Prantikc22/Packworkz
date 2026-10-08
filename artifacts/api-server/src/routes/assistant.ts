import { Router, type IRouter } from "express";

const router: IRouter = Router();

const PROMPT = `You are the Packworkz website assistant. Packworkz is an Indian managed packaging platform (custom packaging, sample kits, contract-manufacturer matching, packaging machinery and scrap recycling).
Rules:
- Answer ONLY from the FACTS below. If the facts do not cover the question, say you are not sure and suggest WhatsApp (+91 82089 90366) or the contact page. Never invent prices, MOQs, timelines, certifications or company names.
- For materials, finishes, print effects or options, confirm only what appears in a product's listed options; for anything else (for example spot UV or embossing when not listed) say the team can confirm it on a quote.
- Prices are in Indian rupees and are indicative unless the facts say otherwise.
- Be brief: 2–4 short sentences, plain text, no markdown headings, no lists longer than 4 items.
- When a page in the facts fits, mention its path (for example /products/stand-up-pouch) so the visitor can open it.`;

const clip = (value: unknown, max: number) => String(value ?? "").slice(0, max);

// Free-text questions the widget's built-in answers could not handle. The page
// sends the catalog facts relevant to the question, so answers stay grounded.
router.post("/assistant", async (req, res): Promise<void> => {
  const question = clip(req.body?.question, 500).trim();
  const facts = clip(req.body?.facts, 9000);
  const history = (Array.isArray(req.body?.history) ? req.body.history : [])
    .slice(-6)
    .map((turn: { role?: string; text?: string }) => ({ role: turn.role === "assistant" ? "assistant" : "user", content: clip(turn.text, 600) }));
  if (question.length < 2) {
    res.status(400).json({ error: "Ask a question" });
    return;
  }
  const apiKey = process.env.AI_INTEGRATIONS_OPENROUTER_API_KEY || process.env.OPENROUTER_API_KEY;
  const baseUrl = process.env.AI_INTEGRATIONS_OPENROUTER_BASE_URL ?? "https://openrouter.ai/api/v1";
  if (!apiKey) {
    res.json({ answer: null });
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
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json", "HTTP-Referer": "https://packworkz.com", "X-Title": "Packworkz Assistant" },
        body: JSON.stringify({
          model,
          temperature: 0.2,
          max_tokens: 700,
          reasoning: { enabled: false },
          messages: [
            { role: "system", content: `${PROMPT}\n\nFACTS:\n${facts || "(none)"}` },
            ...history,
            { role: "user", content: question },
          ],
        }),
      }).finally(() => clearTimeout(timer));
      if (!response.ok) {
        console.warn(`[assistant] ${model} returned ${response.status}`);
        continue;
      }
      const data = await response.json() as { choices?: Array<{ message?: { content?: string } }> };
      const answer = (data.choices?.[0]?.message?.content ?? "").replace(/\*\*/g, "").trim();
      if (answer) {
        res.json({ answer });
        return;
      }
    } catch (error: any) {
      console.warn(`[assistant] ${model} failed: ${error?.message || error}`);
    }
  }
  res.json({ answer: null });
});

export default router;
