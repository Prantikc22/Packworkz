import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";

const NAV_ITEMS = [
  { href: "/products", label: "Products" },
  { href: "/#how-it-works", label: "How It Works" },
  { href: "/industries", label: "Industries" },
  { href: "/design", label: "Design" },
  { href: "/samples", label: "Sample" },
];

const PACK_AI_MESSAGES = [
  { from: "ai", text: "Hi! I'm PackAI — your packaging advisor for PackOps." },
  { from: "ai", text: "I can help you find the right SKU, estimate costs, check MOQs, understand certifications, and more." },
  { from: "ai", text: "What are you looking to pack? Tell me your product and I'll point you in the right direction." },
];

function PackAIWidget() {
  const [open, setOpen] = useState(false);
  const [inputVal, setInputVal] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  return (
    <>
      {/* ── Chat panel ── */}
      {open && (
        <div style={{
          position: "fixed", bottom: 90, right: 24, zIndex: 998,
          width: 348, borderRadius: 18,
          background: "white",
          boxShadow: "0 12px 48px rgba(13,27,42,0.18)",
          display: "flex", flexDirection: "column",
          overflow: "hidden",
          animation: "slideUpChat 0.25s ease",
        }}>
          {/* Header */}
          <div style={{ background: "#0D1B2A", padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#1B6CA8", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
                </svg>
              </div>
              <div>
                <p style={{ color: "white", fontWeight: 700, fontSize: 14 }}>PackAI</p>
                <p style={{ color: "#1B6CA8", fontSize: 11, fontWeight: 600 }}>Your Packaging Advisor</p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} style={{ color: "rgba(255,255,255,0.6)", background: "none", border: "none", cursor: "pointer", fontSize: 20, lineHeight: 1 }}>×</button>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: "auto", padding: "16px 16px 8px", display: "flex", flexDirection: "column", gap: 10, maxHeight: 300, background: "#F8F9FC" }}>
            {PACK_AI_MESSAGES.map((m, i) => (
              <div key={i} style={{
                alignSelf: m.from === "ai" ? "flex-start" : "flex-end",
                maxWidth: "85%",
                background: m.from === "ai" ? "white" : "#1B6CA8",
                color: m.from === "ai" ? "#0D1B2A" : "white",
                borderRadius: m.from === "ai" ? "4px 14px 14px 14px" : "14px 4px 14px 14px",
                padding: "10px 14px",
                fontSize: 13,
                lineHeight: 1.55,
                boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
              }}>{m.text}</div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Coming soon badge */}
          <div style={{ padding: "8px 16px", background: "#F8F9FC", borderTop: "1px solid #E2EAF4", textAlign: "center" }}>
            <span style={{ fontSize: 11, color: "#94A3B8", fontWeight: 600 }}>🚀 Full AI chat launching soon</span>
          </div>

          {/* Input */}
          <div style={{ padding: "12px 16px", background: "white", borderTop: "1px solid #E2EAF4", display: "flex", gap: 8 }}>
            <input
              value={inputVal}
              onChange={e => setInputVal(e.target.value)}
              placeholder="Ask about SKUs, pricing, MOQs…"
              disabled
              style={{
                flex: 1, padding: "9px 12px", borderRadius: 8, border: "1px solid #E2EAF4",
                fontSize: 13, background: "#F8F9FC", color: "#94A3B8", outline: "none",
              }}
            />
            <button disabled style={{ padding: "9px 14px", borderRadius: 8, background: "#1B6CA8", border: "none", cursor: "not-allowed", opacity: 0.5 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
            </button>
          </div>

          {/* Footer */}
          <div style={{ padding: "10px 16px 14px", background: "white", borderTop: "1px solid #F1F5F9", textAlign: "center" }}>
            <a
              href="https://wa.me/919999999999?text=Hi%20PackOps%2C%20I%27d%20like%20to%20discuss%20packaging."
              target="_blank" rel="noopener noreferrer"
              style={{ fontSize: 12, color: "#25D366", fontWeight: 700, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 5 }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="#25D366">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Prefer WhatsApp? Chat with our team →
            </a>
          </div>
        </div>
      )}

      {/* ── Float button ── */}
      <button
        onClick={() => setOpen(!open)}
        style={{
          position: "fixed", bottom: 24, right: 24, zIndex: 999,
          background: open ? "#0D1B2A" : "#1B6CA8",
          borderRadius: 999, border: "none", cursor: "pointer",
          padding: "13px 22px",
          display: "flex", alignItems: "center", gap: 8,
          boxShadow: "0 4px 24px rgba(27,108,168,0.35)",
          transition: "background 0.2s, transform 0.2s, box-shadow 0.2s",
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "scale(1.04)"; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = "scale(1)"; }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          {open
            ? <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>
            : <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
          }
        </svg>
        <span style={{ color: "white", fontWeight: 800, fontSize: 14, letterSpacing: "0.04em" }}>PackAI</span>
      </button>

      <style>{`
        @keyframes slideUpChat {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
}

export function PublicLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navStyle: React.CSSProperties = {
    background: "#020617",
    borderBottom: scrolled ? "1px solid rgba(255,255,255,0.12)" : "1px solid rgba(255,255,255,0.08)",
    transition: "border-color 0.3s ease",
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

      {/* ── NAV ── */}
      <header className="fixed top-0 left-0 w-full z-50 flex items-center justify-between px-6 md:px-10 py-0 h-[68px]"
        style={navStyle}>

        <Link href="/">
          <span className="text-xl font-black tracking-tight text-white cursor-pointer select-none" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            PackOps
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-7">
          {NAV_ITEMS.map(item => {
            const active = location.startsWith(item.href);
            return (
              <Link key={item.href} href={item.href}>
                <span
                  className="text-xs font-bold tracking-[0.15em] uppercase cursor-pointer transition-colors duration-200"
                  style={{ color: active ? "#E8A838" : "rgba(255,255,255,0.65)", textDecoration: active ? "underline" : "none", textUnderlineOffset: "5px" }}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-4">
          <Link href="/login">
            <span className="hidden md:inline text-xs font-bold tracking-[0.15em] uppercase text-slate-300 hover:text-white transition-colors cursor-pointer">Login</span>
          </Link>
          <Link href="/quote">
            <button className="px-5 py-2.5 rounded text-xs font-black uppercase tracking-widest hover:opacity-90 active:scale-95 transition-all"
              style={{ background: "#1B6CA8", color: "white" }}>
              Get Quote
            </button>
          </Link>

          {/* Mobile menu toggle */}
          <button className="md:hidden p-2 text-white" onClick={() => setMobileOpen(!mobileOpen)}>
            <span className="material-symbols-outlined text-2xl">{mobileOpen ? "close" : "menu"}</span>
          </button>
        </div>
      </header>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 pt-[68px]" style={{ background: "#020617" }}>
          <nav className="flex flex-col px-8 py-8 gap-6">
            {NAV_ITEMS.map(item => (
              <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)}>
                <span className="text-2xl font-black uppercase text-white">{item.label}</span>
              </Link>
            ))}
            <div className="border-t border-white/10 pt-6 flex flex-col gap-4">
              <Link href="/login" onClick={() => setMobileOpen(false)}>
                <span className="text-lg font-bold text-slate-300">Login</span>
              </Link>
              <Link href="/quote" onClick={() => setMobileOpen(false)}>
                <button className="px-8 py-4 rounded font-bold text-sm" style={{ background: "#1B6CA8", color: "white" }}>Get Quote</button>
              </Link>
            </div>
          </nav>
        </div>
      )}

      <main className="flex-1 pt-[68px]">
        {children}
      </main>

      {/* ── PackAI Float Widget ── */}
      <PackAIWidget />

      {/* ── FOOTER ── */}
      <footer className="px-8 md:px-16 py-16 grid grid-cols-2 md:grid-cols-4 gap-10 text-sm border-t" style={{ background: "#020617", borderColor: "rgba(255,255,255,0.08)", fontFamily: "'Space Grotesk', sans-serif" }}>
        <div className="col-span-2 md:col-span-1 flex flex-col gap-4">
          <span className="text-xl font-black text-white">PackOps</span>
          <p className="text-slate-500 text-sm leading-relaxed max-w-xs">
            High-performance industrial packaging management for the modern enterprise.
          </p>
          <p className="text-slate-600 text-xs">© {new Date().getFullYear()} PackOps India. All rights reserved.</p>
        </div>
        <div className="flex flex-col gap-3">
          <h4 className="font-bold uppercase tracking-widest text-xs text-white">Products</h4>
          {["Folding Cartons", "Corrugated Solutions", "Protective Inserts", "Sustainability Line"].map(l => (
            <Link key={l} href="/products"><span className="text-slate-500 hover:text-white cursor-pointer transition-colors">{l}</span></Link>
          ))}
        </div>
        <div className="flex flex-col gap-3">
          <h4 className="font-bold uppercase tracking-widest text-xs text-white">Company</h4>
          {["About Us", "Partnerships", "Process", "Sustainability"].map(l => (
            <a key={l} href="#" className="text-slate-500 hover:text-white transition-colors">{l}</a>
          ))}
        </div>
        <div className="flex flex-col gap-3">
          <h4 className="font-bold uppercase tracking-widest text-xs text-white">Support</h4>
          {["Contact Sales", "Technical Docs", "Documentation", "Security"].map(l => (
            <a key={l} href="#" className="text-slate-500 hover:text-white transition-colors">{l}</a>
          ))}
        </div>
      </footer>
    </div>
  );
}
