import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import {
  Package, Box, ShoppingBag, Layers, RotateCcw, Tag, Leaf, Gift,
  Zap, Factory, Pill, Sparkles, Cpu, UtensilsCrossed, Gem, Globe,
  ChevronDown, BookOpen, Info, Network,
} from "lucide-react";

// ── Product mega-menu data ────────────────────────────────────────────────────
const PRODUCT_CATS = [
  { icon: Package,      label: "Flexible Packaging",   desc: "Pouches, films & wraps",           href: "/products/flexible" },
  { icon: Box,          label: "Rigid Packaging",       desc: "Jars, bottles & hard shells",      href: "/products/rigid" },
  { icon: ShoppingBag,  label: "Boxes & Retail",        desc: "Mono, duplex & gift boxes",        href: "/products/boxes" },
  { icon: Layers,       label: "E-commerce Packaging",  desc: "Mailers, corrugated & tapes",      href: "/products/ecommerce" },
  { icon: RotateCcw,    label: "Packaging Rolls",       desc: "Rollstock & centre-fold films",    href: "/products/rolls" },
  { icon: Tag,          label: "Labels & Accessories",  desc: "Stickers, inserts & ribbons",      href: "/products/labels" },
  { icon: Leaf,         label: "Sustainable Packaging", desc: "Kraft, recycled & compostable",    href: "/products/sustainable" },
  { icon: Gift,         label: "Premium & Gift",        desc: "Luxury rigid & foil options",      href: "/products/premium" },
];

// ── Industry mega-menu data ───────────────────────────────────────────────────
const INDUSTRIES = [
  { icon: Zap,              label: "D2C Brands",           href: "/industries/d2c" },
  { icon: Factory,          label: "FMCG Manufacturers",   href: "/industries/fmcg" },
  { icon: Pill,             label: "Pharma & Healthcare",  href: "/industries/pharma" },
  { icon: Sparkles,         label: "Cosmetics & Beauty",   href: "/industries/beauty" },
  { icon: Cpu,              label: "Electronics",          href: "/industries/electronics" },
  { icon: UtensilsCrossed,  label: "Food & Beverage",      href: "/industries/food" },
  { icon: Gem,              label: "Jewellery & Luxury",   href: "/industries/luxury" },
  { icon: Globe,            label: "Exports & Global",     href: "/industries/exports" },
];

const ABOUT_ITEMS = [
  { icon: Info,     label: "Our Story",       href: "/about" },
  { icon: BookOpen, label: "How It Works",    href: "/how-it-works" },
  { icon: Network,  label: "Factory Network", href: "/network" },
];

// ── Styles injected once ──────────────────────────────────────────────────────
const GLOBAL_STYLES = `
  @keyframes dropIn {
    from { opacity: 0; transform: translateX(-50%) translateY(-8px); }
    to   { opacity: 1; transform: translateX(-50%) translateY(0); }
  }
  @keyframes slideUpChat {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .po-menu-item {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 10px 12px;
    border-radius: 8px;
    cursor: pointer;
    transition: background 0.15s;
    text-decoration: none;
    color: inherit;
  }
  .po-menu-item:hover { background: #F8F9FC; }

  /* Fill-left hover for nav text links */
  .po-nav-link {
    position: relative;
    overflow: hidden;
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 6px 10px;
    border-radius: 6px;
    font-size: 13px;
    font-weight: 600;
    letter-spacing: 0.03em;
    text-decoration: none;
    cursor: pointer;
    background: transparent;
    border: none;
    color: rgba(255,255,255,0.72);
    transition: color 0.2s;
    white-space: nowrap;
    font-family: inherit;
  }
  .po-nav-link::after {
    content: '';
    position: absolute;
    inset: 0;
    background: rgba(255,255,255,0.07);
    border-radius: 6px;
    transform: translateX(-101%);
    transition: transform 0.25s ease;
  }
  .po-nav-link:hover::after { transform: translateX(0); }
  .po-nav-link.active { color: #E8A838; }

  /* Amber CTA button fill animation */
  .po-cta-btn {
    position: relative;
    overflow: hidden;
    display: inline-block;
    padding: 8px 20px;
    border-radius: 0;
    font-size: 13px;
    font-weight: 800;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    text-decoration: none;
    color: #0D1B2A;
    background: #E8A838;
    transition: color 0.25s;
  }
  .po-cta-btn::before {
    content: '';
    position: absolute;
    inset: 0;
    background: #0D1B2A;
    transform: translateX(-101%);
    transition: transform 0.3s ease;
  }
  .po-cta-btn:hover { color: white; }
  .po-cta-btn:hover::before { transform: translateX(0); }
  .po-cta-btn span { position: relative; z-index: 1; }
`;

// ── Icon wrapper for dropdown items ──────────────────────────────────────────
function IconBox({ Icon }: { Icon: React.ElementType }) {
  return (
    <div style={{
      width: 32, height: 32, borderRadius: 8,
      background: "rgba(27,108,168,0.08)",
      display: "flex", alignItems: "center", justifyContent: "center",
      flexShrink: 0,
    }}>
      <Icon size={16} color="#1B6CA8" />
    </div>
  );
}

// ── Products mega-menu ────────────────────────────────────────────────────────
function ProductsMenu() {
  return (
    <div style={{
      position: "absolute", top: "100%", left: "50%",
      transform: "translateX(-50%)",
      background: "white",
      border: "1px solid #E2EAF4",
      borderRadius: "0 0 16px 16px",
      boxShadow: "0 16px 48px rgba(13,27,42,0.12)",
      padding: "28px 32px",
      width: 680,
      animation: "dropIn 0.2s ease forwards",
      zIndex: 100,
    }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 220px", gap: 24 }}>
        {/* Left: categories 2-col */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 }}>
          {PRODUCT_CATS.map(cat => (
            <Link key={cat.href} href={cat.href} className="po-menu-item">
              <IconBox Icon={cat.icon} />
              <div>
                <div style={{ color: "#0D1B2A", fontSize: 14, fontWeight: 600, lineHeight: 1.3 }}>{cat.label}</div>
                <div style={{ color: "#64748B", fontSize: 12, lineHeight: 1.4, marginTop: 2 }}>{cat.desc}</div>
              </div>
            </Link>
          ))}
        </div>

        {/* Right: SmartStock feature card */}
        <div style={{
          background: "linear-gradient(135deg, #0D1B2A 0%, #1B3A5C 100%)",
          borderRadius: 12, padding: "20px 18px",
          display: "flex", flexDirection: "column", justifyContent: "space-between",
        }}>
          <div>
            <div style={{ color: "#E8A838", fontSize: 10, fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", marginBottom: 10 }}>FEATURED</div>
            <div style={{ color: "white", fontSize: 16, fontWeight: 700, lineHeight: 1.3, marginBottom: 8 }}>SmartStock™<br />AI Inventory</div>
            <div style={{ color: "rgba(255,255,255,0.55)", fontSize: 12, lineHeight: 1.5 }}>
              Predict reorder points before you run out. Zero stockouts.
            </div>
          </div>
          <Link href="/products/smartstock"
            style={{
              display: "inline-block", marginTop: 16,
              background: "#E8A838", color: "#0D1B2A",
              padding: "8px 14px", borderRadius: 6,
              fontSize: 12, fontWeight: 700, textDecoration: "none",
            }}>
            Learn more →
          </Link>
        </div>
      </div>
    </div>
  );
}

// ── Industries mega-menu ──────────────────────────────────────────────────────
function IndustriesMenu() {
  return (
    <div style={{
      position: "absolute", top: "100%", left: "50%",
      transform: "translateX(-50%)",
      background: "white",
      border: "1px solid #E2EAF4",
      borderRadius: "0 0 16px 16px",
      boxShadow: "0 16px 48px rgba(13,27,42,0.12)",
      padding: "28px 32px",
      width: 620,
      animation: "dropIn 0.2s ease forwards",
      zIndex: 100,
    }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 200px", gap: 24 }}>
        {/* Left: 8 industries */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 }}>
          {INDUSTRIES.map(ind => (
            <Link key={ind.href} href={ind.href} className="po-menu-item" style={{ alignItems: "center" }}>
              <IconBox Icon={ind.icon} />
              <div style={{ color: "#0D1B2A", fontSize: 14, fontWeight: 600 }}>{ind.label}</div>
            </Link>
          ))}
        </div>

        {/* Right: New to Packworkz card */}
        <div style={{
          background: "#F8F9FC", borderRadius: 12,
          border: "1px solid #E2EAF4",
          padding: "20px 18px",
          display: "flex", flexDirection: "column", justifyContent: "space-between",
        }}>
          <div>
            <div style={{ color: "#1B6CA8", fontSize: 10, fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", marginBottom: 10 }}>NEW TO PACKOPS?</div>
            <div style={{ color: "#0D1B2A", fontSize: 14, fontWeight: 700, lineHeight: 1.4, marginBottom: 8 }}>See how it works in 3 minutes</div>
            <div style={{ color: "#64748B", fontSize: 12, lineHeight: 1.5 }}>
              Platform walkthrough for brand owners and procurement teams.
            </div>
          </div>
          <Link href="/how-it-works"
            style={{
              display: "inline-block", marginTop: 16,
              background: "#1B6CA8", color: "white",
              padding: "8px 14px", borderRadius: 6,
              fontSize: 12, fontWeight: 700, textDecoration: "none",
            }}>
            How it works →
          </Link>
        </div>
      </div>
    </div>
  );
}

// ── About mini-menu ───────────────────────────────────────────────────────────
function AboutMenu() {
  return (
    <div style={{
      position: "absolute", top: "100%", left: "50%",
      transform: "translateX(-50%)",
      background: "white",
      border: "1px solid #E2EAF4",
      borderRadius: "0 0 16px 16px",
      boxShadow: "0 16px 48px rgba(13,27,42,0.12)",
      padding: "16px 20px",
      width: 220,
      animation: "dropIn 0.2s ease forwards",
      zIndex: 100,
    }}>
      {ABOUT_ITEMS.map(item => (
        <Link key={item.href} href={item.href} className="po-menu-item" style={{ alignItems: "center" }}>
          <IconBox Icon={item.icon} />
          <div style={{ color: "#0D1B2A", fontSize: 14, fontWeight: 600 }}>{item.label}</div>
        </Link>
      ))}
    </div>
  );
}

// ── NavItem with optional dropdown ───────────────────────────────────────────
function NavItem({
  label, children, href, active,
}: {
  label: string;
  children?: React.ReactNode;
  href?: string;
  active?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  if (href && !children) {
    return (
      <Link href={href} className={`po-nav-link${active ? " active" : ""}`}>
        {label}
      </Link>
    );
  }

  return (
    <div
      ref={ref}
      style={{ position: "relative" }}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        onClick={() => setOpen(o => !o)}
        className={`po-nav-link${active ? " active" : ""}`}
      >
        {label}
        <ChevronDown size={13} style={{ transition: "transform 0.2s", transform: open ? "rotate(180deg)" : "rotate(0deg)" }} />
      </button>
      {open && children}
    </div>
  );
}

// ── PackAI Widget ─────────────────────────────────────────────────────────────
const WA_NUM = "918208990366";
const WA_ICON = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="#25D366">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

type Msg = { role: "user" | "assistant"; content: string };
type Stage = "name" | "email" | "phone" | "chat";

const WELCOME_MSG: Msg = {
  role: "assistant",
  content: "Hi! I'm PackAI — your intelligent packaging advisor from Packworkz 👋\n\nI'll help you find the right packaging for your product, optimise costs, and connect you to the best factories in India.\n\nBefore we start, what's your name?",
};

function TypingDots() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 4, padding: "10px 14px", background: "white", borderRadius: "4px 14px 14px 14px", width: "fit-content", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
      {[0, 1, 2].map(i => (
        <span key={i} style={{
          width: 7, height: 7, borderRadius: "50%", background: "#94A3B8",
          display: "inline-block",
          animation: `packaiDot 1.2s ${i * 0.2}s infinite ease-in-out`,
        }} />
      ))}
    </div>
  );
}

function PackAIWidget() {
  const [open, setOpen] = useState(false);
  const [stage, setStage] = useState<Stage>("name");
  const [lead, setLead] = useState({ name: "", email: "", phone: "" });
  const [messages, setMessages] = useState<Msg[]>([WELCOME_MSG]);
  const [inputVal, setInputVal] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const addMsg = (role: Msg["role"], content: string) =>
    setMessages(prev => [...prev, { role, content }]);

  const handleSend = async () => {
    const text = inputVal.trim();
    if (!text || loading) return;
    setInputVal("");

    // Lead capture stages
    if (stage === "name") {
      const name = text;
      setLead(l => ({ ...l, name }));
      addMsg("user", text);
      setTimeout(() => {
        addMsg("assistant", `Nice to meet you, ${name}! 😊\n\nWhat's your email address? We'll send your packaging recommendations there.`);
        setStage("email");
      }, 400);
      return;
    }

    if (stage === "email") {
      setLead(l => ({ ...l, email: text }));
      addMsg("user", text);
      setTimeout(() => {
        addMsg("assistant", `Got it! And your WhatsApp / phone number? Our team will follow up with samples and pricing.`);
        setStage("phone");
      }, 400);
      return;
    }

    if (stage === "phone") {
      const phone = text;
      setLead(l => ({ ...l, phone }));
      addMsg("user", text);
      setTimeout(() => {
        addMsg("assistant", `Perfect, thanks ${lead.name}! 🎉\n\nNow tell me — what product are you looking to package? (e.g. "spice powder", "skincare serum", "protein supplement", "electronic gadget")`);
        setStage("chat");
      }, 400);
      return;
    }

    // Real AI chat
    addMsg("user", text);
    setLoading(true);

    const historyForAI: Msg[] = [
      {
        role: "assistant",
        content: `[Client info — Name: ${lead.name}, Email: ${lead.email}, Phone: ${lead.phone}. They are chatting via PackAI on Packworkz.com. Use their name naturally in responses.]`,
      },
      ...messages.filter(m => m.role !== "assistant" || !m.content.startsWith("[Client info")),
      { role: "user", content: text },
    ];

    try {
      const res = await fetch("/api/pack-ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: historyForAI }),
      });
      const data = await res.json() as { reply?: string; error?: string };
      addMsg("assistant", data.reply || "I'm having trouble right now — please try again or WhatsApp us directly!");
    } catch {
      addMsg("assistant", "Something went wrong on my end. Please WhatsApp us directly and our team will help you right away!");
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const placeholder = stage === "name" ? "Your name…"
    : stage === "email" ? "your@email.com"
    : stage === "phone" ? "+91 98765 43210"
    : "Ask about packaging, SKUs, pricing, MOQs…";

  return (
    <>
      {open && (
        <div style={{
          position: "fixed", bottom: 90, right: 24, zIndex: 998,
          width: 360, borderRadius: 18,
          background: "white",
          boxShadow: "0 16px 64px rgba(13,27,42,0.22)",
          display: "flex", flexDirection: "column",
          overflow: "hidden",
          maxHeight: "80vh",
          animation: "slideUpChat 0.25s ease",
        }}>
          {/* Header */}
          <div style={{ background: "#0D1B2A", padding: "14px 18px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg,#1B6CA8,#E8A838)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                </svg>
              </div>
              <div>
                <p style={{ color: "white", fontWeight: 800, fontSize: 14, margin: 0 }}>PackAI</p>
                <p style={{ color: "#64B5E8", fontSize: 11, fontWeight: 600, margin: 0 }}>Your Intelligent Packaging Advisor</p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} style={{ color: "rgba(255,255,255,0.5)", background: "none", border: "none", cursor: "pointer", fontSize: 22, lineHeight: 1, padding: "0 4px" }}>×</button>
          </div>

          {/* Stage progress */}
          {stage !== "chat" && (
            <div style={{ background: "#F8F9FC", padding: "8px 18px", borderBottom: "1px solid #E2EAF4", display: "flex", gap: 4, flexShrink: 0 }}>
              {(["name", "email", "phone", "chat"] as Stage[]).map((s, i) => (
                <div key={s} style={{
                  flex: 1, height: 3, borderRadius: 99,
                  background: ["name", "email", "phone", "chat"].indexOf(stage) >= i ? "#1B6CA8" : "#E2EAF4",
                  transition: "background 0.3s",
                }} />
              ))}
            </div>
          )}

          {/* Messages */}
          <div style={{ flex: 1, overflowY: "auto", padding: "16px 14px 8px", display: "flex", flexDirection: "column", gap: 10, background: "#F8F9FC", minHeight: 240 }}>
            {messages.map((m, i) => (
              <div key={i} style={{
                alignSelf: m.role === "assistant" ? "flex-start" : "flex-end",
                maxWidth: "88%",
                background: m.role === "assistant" ? "white" : "#1B6CA8",
                color: m.role === "assistant" ? "#0D1B2A" : "white",
                borderRadius: m.role === "assistant" ? "4px 14px 14px 14px" : "14px 4px 14px 14px",
                padding: "10px 14px", fontSize: 13, lineHeight: 1.6,
                boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                whiteSpace: "pre-wrap",
              }}>{m.content}</div>
            ))}
            {loading && <TypingDots />}
            <div ref={bottomRef} />
          </div>

          {/* WhatsApp link */}
          <div style={{ padding: "8px 14px", background: "#F0F9FF", borderTop: "1px solid #BAD7F2", textAlign: "center", flexShrink: 0 }}>
            <a
              href={`https://wa.me/${WA_NUM}?text=Hi%20Packworkz%2C%20I%27d%20like%20to%20discuss%20packaging.`}
              target="_blank" rel="noopener noreferrer"
              style={{ fontSize: 12, color: "#25D366", fontWeight: 700, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 5 }}
            >
              {WA_ICON} Prefer WhatsApp? Chat directly with our team →
            </a>
          </div>

          {/* Input */}
          <div style={{ padding: "10px 14px", background: "white", borderTop: "1px solid #E2EAF4", display: "flex", gap: 8, flexShrink: 0 }}>
            <input
              value={inputVal}
              onChange={e => setInputVal(e.target.value)}
              onKeyDown={handleKey}
              placeholder={placeholder}
              disabled={loading}
              style={{
                flex: 1, padding: "9px 12px", borderRadius: 8,
                border: "1.5px solid #E2EAF4", fontSize: 13,
                background: loading ? "#F8F9FC" : "white",
                color: "#0D1B2A", outline: "none",
                transition: "border-color 0.2s",
              }}
              onFocus={e => { (e.target as HTMLInputElement).style.borderColor = "#1B6CA8"; }}
              onBlur={e => { (e.target as HTMLInputElement).style.borderColor = "#E2EAF4"; }}
            />
            <button
              onClick={handleSend}
              disabled={loading || !inputVal.trim()}
              style={{
                padding: "9px 14px", borderRadius: 8,
                background: loading || !inputVal.trim() ? "#E2EAF4" : "#1B6CA8",
                border: "none", cursor: loading || !inputVal.trim() ? "not-allowed" : "pointer",
                transition: "background 0.2s",
                flexShrink: 0,
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
            </button>
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen(!open)}
        style={{
          position: "fixed", bottom: 24, right: 24, zIndex: 999,
          background: open ? "#0D1B2A" : "linear-gradient(135deg,#1B6CA8,#0D4F80)",
          borderRadius: 999, border: "none", cursor: "pointer",
          padding: "13px 22px",
          display: "flex", alignItems: "center", gap: 8,
          boxShadow: "0 4px 24px rgba(27,108,168,0.4)",
          transition: "background 0.2s, transform 0.15s",
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "scale(1.05)"; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = "scale(1)"; }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          {open
            ? <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>
            : <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
          }
        </svg>
        <span style={{ color: "white", fontWeight: 800, fontSize: 14, letterSpacing: "0.04em" }}>PackAI</span>
        {!open && <span style={{ background: "#E8A838", color: "#0D1B2A", fontSize: 9, fontWeight: 900, padding: "2px 5px", borderRadius: 4, letterSpacing: "0.05em" }}>AI</span>}
      </button>

      <style>{GLOBAL_STYLES + `
        @keyframes packaiDot {
          0%, 80%, 100% { transform: scale(0.7); opacity: 0.5; }
          40% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </>
  );
}

// ── Public Layout ─────────────────────────────────────────────────────────────
export function PublicLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="min-h-screen flex flex-col" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

      {/* ── NAV ── */}
      <header
        className="fixed top-0 left-0 w-full z-50 flex items-center justify-between px-6 md:px-10 h-[68px]"
        style={{
          background: scrolled ? "rgba(2,6,23,0.85)" : "#020617",
          backdropFilter: scrolled ? "blur(16px)" : "none",
          WebkitBackdropFilter: scrolled ? "blur(16px)" : "none",
          borderBottom: scrolled ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(255,255,255,0.06)",
          transition: "background 0.35s ease, border-color 0.35s ease",
        }}
      >
        {/* Logo */}
        <Link href="/"
          style={{ textDecoration: "none" }}
        >
          <span style={{
            fontSize: 20, fontWeight: 900, letterSpacing: "-0.02em",
            color: "white", fontFamily: "'Space Grotesk', sans-serif",
            cursor: "pointer", userSelect: "none",
          }}>
            Packworkz
          </span>
        </Link>

        {/* Centre navigation */}
        <nav className="hidden md:flex items-center gap-1">
          <NavItem label="Products" active={location.startsWith("/products")}>
            <ProductsMenu />
          </NavItem>
          <NavItem label="Industries" active={location.startsWith("/industries")}>
            <IndustriesMenu />
          </NavItem>
          <NavItem label="Design" href="/design" active={location.startsWith("/design")} />
          <NavItem label="Sustainability" href="/sustainable" active={location.startsWith("/sustainable")} />
          <NavItem label="About" active={location.startsWith("/about") || location.startsWith("/how-it-works") || location.startsWith("/network")}>
            <AboutMenu />
          </NavItem>
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-1">
          <Link href="/samples" className="hidden md:inline po-nav-link">
            Sample
          </Link>
          <Link href="/login" className="hidden md:inline po-nav-link">
            Login
          </Link>
          <Link href="/quote" className="po-cta-btn" style={{ marginLeft: 8 }}>
            <span>Get Quote</span>
          </Link>

          {/* Mobile toggle */}
          <button className="md:hidden p-2 text-white ml-2" onClick={() => setMobileOpen(!mobileOpen)}>
            <span className="material-symbols-outlined text-2xl">{mobileOpen ? "close" : "menu"}</span>
          </button>
        </div>
      </header>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 pt-[68px] overflow-y-auto" style={{ background: "#020617" }}>
          <nav className="flex flex-col px-8 py-8 gap-6">
            {[
              { label: "Products", href: "/products" },
              { label: "Industries", href: "/industries" },
              { label: "Design", href: "/design" },
              { label: "Sustainability", href: "/sustainable" },
              { label: "How It Works", href: "/how-it-works" },
            ].map(item => (
              <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)}
                style={{ fontSize: 24, fontWeight: 900, textTransform: "uppercase", color: "white", textDecoration: "none" }}>
                {item.label}
              </Link>
            ))}
            <div className="border-t border-white/10 pt-6 flex flex-col gap-4">
              <Link href="/samples" onClick={() => setMobileOpen(false)}
                style={{ fontSize: 18, fontWeight: 700, color: "rgba(255,255,255,0.6)", textDecoration: "none" }}>
                Sample
              </Link>
              <Link href="/login" onClick={() => setMobileOpen(false)}
                style={{ fontSize: 18, fontWeight: 700, color: "rgba(255,255,255,0.6)", textDecoration: "none" }}>
                Login
              </Link>
              <Link href="/quote" onClick={() => setMobileOpen(false)}
                style={{ display: "inline-block", padding: "14px 28px", background: "#E8A838", color: "#0D1B2A", fontWeight: 800, fontSize: 14, textDecoration: "none", borderRadius: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Get Quote
              </Link>
            </div>
          </nav>
        </div>
      )}

      <main className="flex-1 pt-[68px]">
        {children}
      </main>

      <PackAIWidget />

      {/* ── FOOTER ── */}
      <footer className="px-8 md:px-16 py-16 grid grid-cols-2 md:grid-cols-4 gap-10 text-sm border-t"
        style={{ background: "#020617", borderColor: "rgba(255,255,255,0.08)", fontFamily: "'Space Grotesk', sans-serif" }}>
        <div className="col-span-2 md:col-span-1 flex flex-col gap-4">
          <span className="text-xl font-black text-white">Packworkz</span>
          <p className="text-slate-500 text-sm leading-relaxed max-w-xs">
            High-performance industrial packaging management for the modern enterprise.
          </p>
          <p className="text-slate-600 text-xs">© {new Date().getFullYear()} Packworkz India. All rights reserved.</p>
        </div>
        <div className="flex flex-col gap-3">
          <h4 className="font-bold uppercase tracking-widest text-xs text-white">Products</h4>
          {["Flexible Packaging", "Rigid Packaging", "Sustainable Packaging", "Premium & Gift"].map(l => (
            <Link key={l} href="/products"
              style={{ color: "#64748B", textDecoration: "none", transition: "color 0.15s", cursor: "pointer" }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "white"}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "#64748B"}>
              {l}
            </Link>
          ))}
        </div>
        <div className="flex flex-col gap-3">
          <h4 className="font-bold uppercase tracking-widest text-xs text-white">Company</h4>
          {["About Us", "How It Works", "Sustainability", "Factory Network"].map(l => (
            <a key={l} href="#" style={{ color: "#64748B", textDecoration: "none", transition: "color 0.15s" }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "white"}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "#64748B"}>{l}</a>
          ))}
        </div>
        <div className="flex flex-col gap-3">
          <h4 className="font-bold uppercase tracking-widest text-xs text-white">Support</h4>
          {["Contact Sales", "Get a Sample", "Documentation", "WhatsApp Us"].map(l => (
            <a key={l} href="#" style={{ color: "#64748B", textDecoration: "none", transition: "color 0.15s" }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "white"}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "#64748B"}>{l}</a>
          ))}
        </div>
      </footer>
    </div>
  );
}
