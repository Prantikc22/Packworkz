import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link } from "wouter";
import { ArrowRight, ArrowUp, MessageCircle, Package, Phone, X } from "lucide-react";
import { SUGGESTIONS, WHATSAPP, answerLocally, factsFor, type AssistantLink } from "@/lib/assistant-kb";
import { trackMarketingEvent } from "@/lib/analytics";
import "./assistant.css";

type Message = { id: number; role: "user" | "assistant"; text: string; links?: AssistantLink[]; handoff?: boolean };

const STORE_KEY = "pw_assistant_v1";
const GREETING: Message = { id: 0, role: "assistant", text: "Hi! I can answer questions about packaging prices, minimum orders, samples, delivery and finding a manufacturer. What are you working on?" };

const FALLBACK: Omit<Message, "id"> = {
  role: "assistant",
  text: "I'm not certain about that one. Our team can answer it properly — message us on WhatsApp, or leave your number and we'll call you back.",
  links: [{ label: "WhatsApp us", href: WHATSAPP }],
  handoff: true,
};

function load(): Message[] {
  try {
    const raw = sessionStorage.getItem(STORE_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    return Array.isArray(parsed) && parsed.length ? parsed : [GREETING];
  } catch {
    return [GREETING];
  }
}

function LinkChip({ link }: { link: AssistantLink }) {
  return link.href.startsWith("http")
    ? <a href={link.href} target="_blank" rel="noopener noreferrer">{link.label} <ArrowRight size={13} /></a>
    : <Link href={link.href}>{link.label} <ArrowRight size={13} /></Link>;
}

function Callback({ transcript, onDone }: { transcript: string; onDone: () => void }) {
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [state, setState] = useState<"idle" | "saving" | "done" | "error">("idle");
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (phone.replace(/\D/g, "").length < 10) return;
    setState("saving");
    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source: "contact",
          name: name || "Website visitor",
          phone,
          subject: "[Assistant] Callback request",
          message: `Callback requested from the website assistant.\n\n${transcript}`.slice(0, 2900),
          metadata: { kind: "assistant_callback", page: window.location.pathname },
        }),
      });
      if (!response.ok) throw new Error("save failed");
      setState("done");
      trackMarketingEvent("assistant_callback", {});
      onDone();
    } catch {
      setState("error");
    }
  };
  if (state === "done") return <p className="pwa-callback-done">Thanks — we'll call you shortly during business hours.</p>;
  return (
    <form className="pwa-callback" onSubmit={submit}>
      <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Your name" autoComplete="name" aria-label="Your name" />
      <input value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="Phone / WhatsApp" inputMode="tel" autoComplete="tel" aria-label="Phone or WhatsApp number" required />
      <button type="submit" disabled={state === "saving"}><Phone size={14} /> {state === "saving" ? "Sending…" : "Call me back"}</button>
      {state === "error" && <small>That didn't go through — please WhatsApp us instead.</small>}
    </form>
  );
}

export function AssistantWidget({ location }: { location: string }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([GREETING]);
  const [draft, setDraft] = useState("");
  const [thinking, setThinking] = useState(false);
  const [calledBack, setCalledBack] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const nextId = useRef(1);

  useEffect(() => { const saved = load(); setMessages(saved); nextId.current = Math.max(...saved.map((m) => m.id)) + 1; }, []);
  useEffect(() => { try { sessionStorage.setItem(STORE_KEY, JSON.stringify(messages.slice(-30))); } catch { /* storage blocked */ } }, [messages]);
  useEffect(() => { listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" }); }, [messages, thinking, open]);
  useEffect(() => { if (open) window.setTimeout(() => inputRef.current?.focus(), 250); }, [open]);
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const push = (message: Omit<Message, "id">) => setMessages((current) => [...current, { ...message, id: nextId.current++ }]);

  const ask = async (question: string, label?: string) => {
    const text = question.trim();
    if (!text || thinking) return;
    push({ role: "user", text: label || text });
    setDraft("");
    setThinking(true);
    const local = answerLocally(text);
    trackMarketingEvent("assistant_question", { intent: local?.intent || "ai", query: text.slice(0, 80) });
    if (local) {
      window.setTimeout(() => { push({ role: "assistant", text: local.text, links: local.links, handoff: local.handoff }); setThinking(false); }, 450);
      return;
    }
    try {
      const controller = new AbortController();
      const timer = window.setTimeout(() => controller.abort(), 12_000);
      const history = messages.slice(-6).map((m) => ({ role: m.role, text: m.text }));
      const response = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: text, facts: factsFor(text), history }),
        signal: controller.signal,
      }).finally(() => window.clearTimeout(timer));
      const body = await response.json().catch(() => ({}));
      if (response.ok && body.answer) {
        const paths = Array.from(new Set(String(body.answer).match(/\/(products|packaging|manufacturing|manufacturers|resources|samples|machinery|circular|enterprise|contact|sustainable)(\/[a-z0-9-]+)?/g) || [])).slice(0, 2);
        push({ role: "assistant", text: body.answer, links: paths.map((href) => ({ label: `Open ${href}`, href })) });
      } else {
        push(FALLBACK);
      }
    } catch {
      push(FALLBACK);
    }
    setThinking(false);
  };

  const submit = (event: FormEvent) => { event.preventDefault(); void ask(draft); };
  const reset = () => { setMessages([GREETING]); setCalledBack(false); };
  const transcript = messages.map((m) => `${m.role === "user" ? "Visitor" : "Assistant"}: ${m.text}`).join("\n");
  const fresh = messages.length === 1;
  const raised = /^\/products\/[^/]+/.test(location);

  return (
    <aside className={`pwa${open ? " is-open" : ""}${raised ? " is-raised" : ""}`} aria-label="Packworkz assistant">
      {open && (
        <div className="pwa-panel" role="dialog" aria-label="Chat with Packworkz">
          <header className="pwa-head">
            <span className="pwa-mark" aria-hidden="true"><i /><b /></span>
            <div><strong>Packworkz</strong><small>Instant answers · real team on WhatsApp</small></div>
            {!fresh && <button type="button" className="pwa-reset" onClick={reset}>New chat</button>}
            <button type="button" className="pwa-close" onClick={() => setOpen(false)} aria-label="Close chat"><X size={18} /></button>
          </header>

          <div className="pwa-list" ref={listRef} aria-live="polite">
            {messages.map((message) => (
              <div key={message.id} className={`pwa-msg is-${message.role}`}>
                <p>{message.text}</p>
                {message.links?.length ? <div className="pwa-links">{message.links.map((link) => <LinkChip key={link.href} link={link} />)}</div> : null}
                {message.handoff && !calledBack && <Callback transcript={transcript} onDone={() => setCalledBack(true)} />}
              </div>
            ))}
            {fresh && (
              <div className="pwa-suggest">
                {SUGGESTIONS.map((suggestion) => (
                  <button key={suggestion.label} type="button" onClick={() => void ask(suggestion.query, suggestion.label)}>
                    {suggestion.label}<ArrowRight size={14} />
                  </button>
                ))}
              </div>
            )}
            {thinking && <div className="pwa-msg is-assistant is-typing" aria-label="Typing"><span /><span /><span /></div>}
          </div>

          <form className="pwa-input" onSubmit={submit}>
            <input ref={inputRef} value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Ask about pricing, MOQ, samples…" aria-label="Your question" maxLength={500} />
            <button type="submit" disabled={!draft.trim() || thinking} aria-label="Send"><ArrowUp size={17} /></button>
          </form>
          <Link href="/samples" className="pwa-kit" onClick={() => setOpen(false)}>
            <Package size={15} /> <span>Get 25–50+ samples for ₹299</span> <ArrowRight size={14} />
          </Link>
          <p className="pwa-note">Automated answers from Packworkz product data. Ask for a person any time.</p>
        </div>
      )}

      <button type="button" className="pwa-launcher" onClick={() => { setOpen((value) => !value); if (!open) trackMarketingEvent("assistant_open", {}); }} aria-expanded={open}>
        {open ? <X size={20} /> : <MessageCircle size={20} />}
        <span><b>{open ? "Close" : "Questions? Ask us"}</b>{!open && <small>Pricing · MOQ · samples</small>}</span>
      </button>
    </aside>
  );
}
