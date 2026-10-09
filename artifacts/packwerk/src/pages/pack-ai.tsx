import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { Link } from "wouter";
import { ArrowLeft, ArrowRight, ArrowUp, Leaf, Package, PenSquare, Sparkle, TrendingDown, Truck } from "lucide-react";
import { CATALOG_SKUS, getCatalogImage, type CatalogSku } from "@/lib/catalog";
import { formatRupeeRange, formatUnitRate, getIndicativePrice } from "@/lib/indicative-pricing";
import { parseRequirementLocally } from "@/lib/manufacturers";
import { matchSku, matchUseCase } from "@/lib/assistant-kb";
import { resolveFormats } from "@/lib/use-case-content";
import { titleCase } from "@/lib/use-cases";
import { trackMarketingEvent } from "@/lib/analytics";
import "./pack-ai.css";

type ChatMessage = { role: "user" | "assistant"; content: string; fresh?: boolean };

const STORE_KEY = "pw_packai_v2";

const STARTERS = [
  { icon: Sparkle, label: "Packaging for a 30 ml vitamin C serum, 2,000 units" },
  { icon: TrendingDown, label: "Cut the cost of my 250 g snack pouches, 20,000 a month" },
  { icon: Truck, label: "Plan e-commerce packaging for a candle brand launch" },
  { icon: Leaf, label: "Plastic-free packaging for a cloud kitchen" },
];

const TYPED = [
  "250 g coffee beans, 2,000 pouches, matte with a valve…",
  "Protein powder, 1 kg, 5,000 units for Amazon…",
  "Gift box for a 3-piece skincare set, premium feel…",
  "Masala sachets, 10 g, 50,000 a month…",
];

const THINKING = ["Understanding your product", `Checking ${CATALOG_SKUS.length} live formats`, "Working out MOQ and price"];

const lowest = (sku: CatalogSku) => Math.min(...(sku.price_tiers?.length ? sku.price_tiers.map((t) => t.unit_price) : [sku.price_min]).filter((v) => v > 0));

/** Live catalog sent with every request so the model never quotes stale numbers. */
const CATALOG_TEXT = CATALOG_SKUS.map((sku) => {
  const low = lowest(sku);
  return `${sku.code} ${sku.name} — MOQ ${sku.moq} ${sku.moq_unit}; ₹${Number.isFinite(low) ? low : sku.price_min}–₹${sku.price_max}/${sku.moq_unit.replace(/s$/, "")}; ${sku.publicBuyingPath === "instant" ? "instant" : "quote"}; use: ${sku.use_case}`;
}).join("\n");

const SKU_BY_CODE = Object.fromEntries(CATALOG_SKUS.map((sku) => [sku.code, sku])) as Record<string, CatalogSku>;

function skusIn(text: string): CatalogSku[] {
  const codes = Array.from(new Set(text.match(/\b[A-Z]{2}-\d{3}\b/g) || []));
  return codes.map((code) => SKU_BY_CODE[code]).filter(Boolean).slice(0, 4);
}

/** Offline plan from live data when the model is unavailable. */
function planLocally(history: ChatMessage[]): string {
  const text = history.filter((m) => m.role === "user").map((m) => m.content).join(" ");
  const qty = parseRequirementLocally(text).monthlyUnits;
  const useCase = matchUseCase(text);
  const sku = matchSku(text);
  if (useCase) {
    const formats = resolveFormats(useCase).slice(0, 3);
    return [
      `Here's a starting shortlist for **${useCase.name}**${qty ? ` at about ${qty.toLocaleString("en-IN")} units` : ""}:`,
      ...formats.map(({ sku: s, why }) => `- **${s.code} · ${s.name}** — ${why} MOQ ${s.moq.toLocaleString("en-IN")} ${s.moq_unit}.`),
      "",
      qty ? "Open any card to configure size, material and print — standard formats price instantly, custom ones are confirmed within 4 business hours." : "How many units do you need per order? I'll check MOQ fit and an indicative cost.",
    ].join("\n");
  }
  if (sku) {
    return `**${sku.code} · ${sku.name}** starts at ${sku.moq.toLocaleString("en-IN")} ${sku.moq_unit}. ${sku.use_case}. ${qty ? "The card below shows an indicative cost at your quantity." : "Tell me your quantity and I'll estimate the cost."}`;
  }
  return "Tell me **what you're packaging** and **how many units** you need — for example \"250 g coffee beans, 2,000 pouches\". I'll shortlist formats from the live catalog with MOQ and indicative cost.";
}

function Rich({ text }: { text: string }) {
  return (
    <>
      {text.split("\n").map((line, i) => {
        const bullet = /^\s*[-•*]\s+/.test(line);
        const sub = bullet && /^\s{2,}/.test(line);
        const body = line.replace(/^\s*[-•*]\s+/, "");
        if (!body.trim()) return <span key={i} className="pai-gap" />;
        return (
          <span key={i} className={sub ? "pai-li is-sub" : bullet ? "pai-li" : "pai-p"}>
            {body.split(/(\*\*[^*]+\*\*)/g).map((part, j) => (part.startsWith("**") && part.endsWith("**") ? <strong key={j}>{part.slice(2, -2)}</strong> : <span key={j}>{part}</span>))}
          </span>
        );
      })}
    </>
  );
}

/** Reveals a reply word by word so new answers feel live; history renders instantly. */
function Typewriter({ text, onDone }: { text: string; onDone: () => void }) {
  const words = useMemo(() => text.split(/(\s+)/), [text]);
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setCount(words.length); onDone(); return; }
    let i = 0;
    const timer = window.setInterval(() => {
      i += 3;
      setCount(i);
      if (i >= words.length) { window.clearInterval(timer); onDone(); }
    }, 28);
    return () => window.clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [words]);
  return <Rich text={words.slice(0, count).join("")} />;
}

function Mark({ size = 34, live = false }: { size?: number; live?: boolean }) {
  return (
    <span className={`pai-mark${live ? " is-live" : ""}`} style={{ width: size, height: size }} aria-hidden="true">
      <i /><b />
    </span>
  );
}

function SkuCards({ skus, quantity }: { skus: CatalogSku[]; quantity: number | null }) {
  if (!skus.length) return null;
  return (
    <div className="pai-cards">
      {skus.map((sku) => {
        const price = quantity ? getIndicativePrice(sku, quantity) : null;
        const low = lowest(sku);
        return (
          <Link key={sku.code} href={`/products/${sku.slug}`} className="pai-card" onClick={() => trackMarketingEvent("packai_card_click", { sku: sku.code })}>
            <img src={getCatalogImage(sku)} alt="" loading="lazy" />
            <span className="pai-card-body">
              <small>{sku.code}</small>
              <b>{sku.name}</b>
              <em>MOQ {sku.moq.toLocaleString("en-IN")} {sku.moq_unit}{Number.isFinite(low) ? ` · from ${formatUnitRate(low)}` : ""}</em>
              {price && <em className="pai-card-total">≈ {formatRupeeRange(price.totalLow, price.totalHigh)} for {Math.max(quantity!, sku.moq).toLocaleString("en-IN")}</em>}
            </span>
            <span className="pai-card-go">{sku.publicBuyingPath === "instant" ? "Price it" : "Configure"} <ArrowRight size={13} /></span>
          </Link>
        );
      })}
    </div>
  );
}

export default function PackAIPlanner() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0);
  const [typing, setTyping] = useState(false);
  const [placeholder, setPlaceholder] = useState("");
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const empty = messages.length === 0;

  useEffect(() => { document.title = "Packworkz AI — Plan your packaging in minutes"; }, []);
  useEffect(() => {
    try { const saved = JSON.parse(sessionStorage.getItem(STORE_KEY) || "[]"); if (Array.isArray(saved)) setMessages(saved.map((m: ChatMessage) => ({ ...m, fresh: false }))); } catch { /* ignore */ }
  }, []);
  useEffect(() => { try { sessionStorage.setItem(STORE_KEY, JSON.stringify(messages.slice(-24).map(({ fresh, ...m }) => m))); } catch { /* ignore */ } }, [messages]);
  useEffect(() => { if (!empty) endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" }); }, [messages, loading, step, empty]);

  // Typed example briefs in the empty composer.
  useEffect(() => {
    if (!empty || input) return;
    let example = 0;
    let char = 0;
    let deleting = false;
    const tick = () => {
      const full = TYPED[example];
      if (!deleting) {
        char += 1;
        setPlaceholder(full.slice(0, char));
        if (char >= full.length) { deleting = true; timer = window.setTimeout(tick, 1800); return; }
      } else {
        char -= 2;
        setPlaceholder(full.slice(0, Math.max(0, char)));
        if (char <= 0) { deleting = false; example = (example + 1) % TYPED.length; }
      }
      timer = window.setTimeout(tick, deleting ? 18 : 42);
    };
    let timer = window.setTimeout(tick, 600);
    return () => window.clearTimeout(timer);
  }, [empty, input]);

  // Grow the textarea with its content.
  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 180)}px`;
  }, [input]);

  const quantity = useMemo(() => parseRequirementLocally(messages.filter((m) => m.role === "user").map((m) => m.content).join(" ")).monthlyUnits, [messages]);

  const send = async (preset?: string) => {
    const content = (preset ?? input).trim();
    if (!content || loading || typing) return;
    const next: ChatMessage[] = [...messages.map((m) => ({ ...m, fresh: false })), { role: "user", content }];
    setMessages(next);
    setInput("");
    setLoading(true);
    setStep(0);
    trackMarketingEvent("packai_message", { turn: next.filter((m) => m.role === "user").length });
    const stepTimer = window.setInterval(() => setStep((s) => Math.min(s + 1, THINKING.length - 1)), 900);
    let reply: string | null = null;
    try {
      const response = await fetch("/api/pack-ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next.map(({ role, content: c }) => ({ role, content: c })), catalog: CATALOG_TEXT, clientFallback: true }),
      });
      const data = await response.json().catch(() => ({})) as { reply?: string | null };
      reply = response.ok && data.reply ? data.reply : null;
    } catch {
      reply = null;
    }
    window.clearInterval(stepTimer);
    setLoading(false);
    setTyping(true);
    setMessages((current) => [...current, { role: "assistant", content: reply || planLocally(next), fresh: true }]);
  };

  const submit = (event: FormEvent) => { event.preventDefault(); void send(); };
  const reset = () => { setMessages([]); setInput(""); setTyping(false); inputRef.current?.focus(); };

  const composer = (
    <form className={`pai-composer${empty ? " is-hero" : ""}`} onSubmit={submit}>
      <textarea
        ref={inputRef}
        value={input}
        onChange={(event) => setInput(event.target.value)}
        onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); void send(); } }}
        placeholder={empty ? placeholder || "Describe your product…" : "Ask a follow-up, add quantity, or change the brief…"}
        rows={1}
        aria-label="Describe what you want to package"
        autoFocus
      />
      <button type="submit" disabled={!input.trim() || loading || typing} aria-label="Send"><ArrowUp size={19} /></button>
    </form>
  );

  return (
    <main className={`pai${empty ? " is-empty" : ""}`}>
      <div className="pai-glow" aria-hidden="true"><span /><span /></div>

      <header className="pai-top">
        <Link href="/" className="pai-brand"><Mark size={26} /> <span>Packworkz</span><em>AI</em></Link>
        <nav>
          {!empty && <button type="button" onClick={reset} aria-label="New plan"><PenSquare size={15} /> <span>New plan</span></button>}
          <Link href="/products" aria-label="Catalog"><Package size={15} /> <span>Catalog</span></Link>
          <Link href="/" className="pai-exit" aria-label="Back to site"><ArrowLeft size={15} /> <span>Back to site</span></Link>
        </nav>
      </header>

      {empty ? (
        <section className="pai-hero">
          <Mark size={64} live />
          <h1>What are you packaging?</h1>
          <p>Describe your product and quantity in plain words. Packworkz AI plans the format, material, MOQ and cost from {CATALOG_SKUS.length} live formats — then hands you a ready-to-price spec.</p>
          {composer}
          <div className="pai-starters">
            {STARTERS.map(({ icon: Icon, label }) => (
              <button key={label} type="button" onClick={() => void send(label)}>
                <Icon size={16} /><span>{label}</span><ArrowRight size={15} />
              </button>
            ))}
          </div>
          <p className="pai-fine">Indicative planning from the live catalog. Final prices are confirmed against your specification.</p>
        </section>
      ) : (
        <>
          <section className="pai-thread" aria-live="polite">
            {messages.map((message, i) => (
              <article key={i} className={`pai-msg is-${message.role}`}>
                {message.role === "assistant" && <Mark size={30} />}
                <div className="pai-msg-body">
                  {message.role === "assistant" && message.fresh
                    ? <Typewriter text={message.content} onDone={() => setTyping(false)} />
                    : <Rich text={message.content} />}
                  {message.role === "assistant" && (!message.fresh || !typing) && <SkuCards skus={skusIn(message.content)} quantity={quantity} />}
                </div>
              </article>
            ))}
            {loading && (
              <article className="pai-msg is-assistant">
                <Mark size={30} live />
                <ol className="pai-thinking">
                  {THINKING.map((label, i) => <li key={label} className={i < step ? "is-done" : i === step ? "is-on" : ""}>{label}</li>)}
                </ol>
              </article>
            )}
            <div ref={endRef} className="pai-end" />
          </section>
          <div className="pai-dock">
            {composer}
            <p className="pai-fine">Indicative planning from the live catalog. Final prices are confirmed against your specification.</p>
          </div>
        </>
      )}
    </main>
  );
}
