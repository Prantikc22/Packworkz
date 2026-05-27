import { Link } from "wouter";

const PROBLEM_CARDS = [
  { title: "Production halted",   desc: "One missing pouch stops 10,000 units from shipping. The real cost is lost sales, not the pouch." },
  { title: "Emergency orders",    desc: "Rush reorders cost 40–60% more per unit. Brands absorb this silently, every quarter." },
  { title: "Forecast blindness",  desc: "Most brands order reactively — only after stock hits zero. By then, it's already too late." },
];

const HOW_STEPS = [
  { step: "01", title: "Consumption Pattern Analysis",    desc: "SmartStock monitors your order velocity across seasons, campaigns, and market cycles — building a brand-specific demand model that improves with every order.", color: "#60a5fa" },
  { step: "02", title: "Predictive Reorder Triggers",     desc: "Before your stock hits the danger zone, SmartStock raises a reorder flag — with the exact quantities, timing, and variant breakdown your production schedule needs.", color: "#a78bfa" },
  { step: "03", title: "Buffer Inventory Pre-positioning",desc: "For high-velocity SKUs, Packworkz pre-positions buffer stock at our fulfilment layer — enabling 5–7 day delivery vs. the industry standard 14–21 days.", color: "#34d399" },
  { step: "04", title: "Automatic SLA Protection",        desc: "Every SmartStock order comes with 3 backup vendor assignments and a dispatch SLA guarantee. Your production line never waits.", color: "#f59e0b" },
];

const VALUE_CARDS = [
  { index: "01", title: "5–7 Day Delivery",        desc: "Pre-positioned buffer inventory means SmartStock SKUs ship in days, not weeks. Your launches never get delayed by packaging.", accent: "#60a5fa" },
  { index: "02", title: "Zero-Stockout Guarantee", desc: "If a SmartStock SKU goes out of stock due to a fulfilment failure on our end, Packworkz covers the emergency sourcing cost.", accent: "#34d399" },
  { index: "03", title: "No Manual Forecasting",   desc: "Your team stops tracking spreadsheets and starts scaling. The system raises the flag — all you do is approve.", accent: "#a78bfa" },
  { index: "04", title: "Always Getting Smarter",  desc: "Every order cycle refines the model. The longer you're on Packworkz, the more accurate your SmartStock predictions become.", accent: "#f59e0b" },
];

const PROOF_STATS = [
  { val: "5–7", unit: "days", label: "SmartStock delivery" },
  { val: "0",   unit: "",     label: "Stockouts on record" },
  { val: "48",  unit: "hrs",  label: "Reorder prediction lead" },
  { val: "99",  unit: "%",    label: "Fulfilment accuracy" },
];

const ELIGIBILITY = [
  { label: "Repeat orders across", val: "2+ cycles" },
  { label: "Minimum order size",   val: "Any tier" },
  { label: "Setup required",       val: "Zero" },
];

export default function SmartStock() {
  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

      {/* ── HERO ── */}
      <section className="relative overflow-hidden" style={{ background: "linear-gradient(135deg, #020817 0%, #071a45 40%, #0f2d7a 100%)", padding: "140px 40px 100px", textAlign: "center", minHeight: "70vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="pw-glow-drift absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(59,130,246,0.16) 0%, transparent 70%)" }} />
        <div className="pw-glow-drift-slow absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 35% 30% at 75% 65%, rgba(96,165,250,0.07) 0%, transparent 55%)" }} />
        <div style={{ position: "relative", zIndex: 1, maxWidth: 820, margin: "0 auto" }}>
          <div className="pw-reveal" style={{ display: "inline-flex", alignItems: "center", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 9999, padding: "6px 18px", marginBottom: 28 }}>
            <span style={{ color: "#E8A838", fontSize: 10, fontWeight: 700, letterSpacing: "2.5px", textTransform: "uppercase" }}>PACKWORKZ TECHNOLOGY</span>
          </div>
          <h1 className="pw-reveal pw-d1" style={{ color: "white", fontSize: "clamp(2.8rem,6vw,5rem)", fontWeight: 900, lineHeight: 1.05, letterSpacing: "-2px", marginBottom: 28 }}>
            SmartStock™<br />
            <span style={{ color: "#60a5fa", fontStyle: "italic" }}>AI Inventory.</span>
          </h1>
          <p className="pw-reveal pw-d2" style={{ color: "rgba(255,255,255,0.50)", fontSize: "clamp(16px,2vw,20px)", lineHeight: 1.7, maxWidth: 580, margin: "0 auto 48px" }}>
            The intelligence layer that eliminates packaging stockouts before they happen. Built exclusively for Packworkz customers — no configuration required.
          </p>
          <div className="pw-reveal pw-d3" style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            <span className="animated-border animated-border-white">
              <Link href="/quote"><button className="btn-fill btn-amber px-8 py-3 text-sm pw-btn-transition">Get a Quote →</button></Link>
            </span>
            <a href="https://wa.me/918208990366?text=Hi%2C%20I%27d%20like%20to%20know%20more%20about%20SmartStock" target="_blank" rel="noopener noreferrer">
              <button className="btn-fill btn-outline-white px-8 py-3 text-sm pw-btn-transition">Talk to an Expert</button>
            </a>
          </div>
        </div>
      </section>

      {/* ── PROOF BAR ── */}
      <section style={{ background: "#08080f", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
        <div style={{ maxWidth: 860, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(4,1fr)", padding: "0 24px" }}>
          {PROOF_STATS.map((s, i) => (
            <div key={i} className={`pw-reveal pw-d${i + 1}`} style={{ padding: "32px 16px", textAlign: "center", borderRight: i < 3 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
              <p style={{ color: "white", fontSize: "clamp(2rem,3vw,2.8rem)", fontWeight: 800, lineHeight: 1, letterSpacing: "-1px" }}>{s.val}<span style={{ fontSize: "0.55em", color: "#60a5fa", marginLeft: 3 }}>{s.unit}</span></p>
              <div style={{ width: 24, height: 2, background: "#C8952A", margin: "10px auto 12px" }} />
              <p style={{ color: "rgba(255,255,255,0.38)", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "1.5px" }}>{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── THE PROBLEM ── */}
      <section style={{ background: "#08080f", padding: "100px 40px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div className="pw-reveal" style={{ textAlign: "center", marginBottom: 64 }}>
            <p style={{ color: "#60a5fa", fontSize: 11, fontWeight: 700, letterSpacing: "2.5px", textTransform: "uppercase", marginBottom: 14 }}>THE PROBLEM WE SOLVE</p>
            <h2 style={{ color: "white", fontSize: "clamp(2rem,4vw,3rem)", fontWeight: 800, lineHeight: 1.1, letterSpacing: "-1px" }}>
              Packaging stockouts cost brands more<br />
              <span style={{ color: "rgba(255,255,255,0.42)", fontStyle: "italic" }}>than the packaging itself.</span>
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
            {PROBLEM_CARDS.map((p, i) => (
              <div key={i} className={`pw-reveal pw-lift pw-d${i + 1}`} style={{ background: "rgba(239,68,68,0.04)", border: "1px solid rgba(239,68,68,0.10)", padding: "28px 24px" }}>
                <div style={{ width: 28, height: 2, background: "rgba(239,68,68,0.40)", marginBottom: 16 }} />
                <h3 style={{ color: "rgba(255,255,255,0.82)", fontSize: 15, fontWeight: 700, marginBottom: 10 }}>{p.title}</h3>
                <p style={{ color: "rgba(255,255,255,0.38)", fontSize: 13, lineHeight: 1.7 }}>{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section style={{ background: "#0a0f1e", padding: "100px 40px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div className="pw-reveal" style={{ textAlign: "center", marginBottom: 64 }}>
            <p style={{ color: "#60a5fa", fontSize: 11, fontWeight: 700, letterSpacing: "2.5px", textTransform: "uppercase", marginBottom: 14 }}>HOW IT WORKS</p>
            <h2 style={{ color: "white", fontSize: "clamp(2rem,4vw,3rem)", fontWeight: 800, lineHeight: 1.1, letterSpacing: "-1px" }}>
              Your inventory.<br />
              <span style={{ color: "#60a5fa", fontStyle: "italic" }}>Managed by intelligence.</span>
            </h2>
          </div>
          <div style={{ display: "flex", flexDirection: "column" as const, gap: 0 }}>
            {HOW_STEPS.map((s, i) => (
              <div key={i} className={`pw-reveal pw-d${i + 1}`} style={{ display: "grid", gridTemplateColumns: "80px 1fr", gap: 24, padding: "32px 0", borderBottom: i < HOW_STEPS.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none", alignItems: "flex-start" }}>
                <div style={{ textAlign: "center", paddingTop: 4 }}>
                  <span style={{ fontSize: "clamp(2.5rem,4vw,3.5rem)", fontWeight: 900, color: s.color, opacity: 0.20, lineHeight: 1, letterSpacing: "-2px", fontFamily: "'Space Grotesk', sans-serif" }}>{s.step}</span>
                </div>
                <div>
                  <h3 style={{ color: "white", fontSize: 18, fontWeight: 700, marginBottom: 10 }}>{s.title}</h3>
                  <p style={{ color: "rgba(255,255,255,0.42)", fontSize: 14, lineHeight: 1.75 }}>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── VALUE CARDS ── */}
      <section style={{ background: "#08080f", padding: "100px 40px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div className="pw-reveal" style={{ textAlign: "center", marginBottom: 56 }}>
            <p style={{ color: "#60a5fa", fontSize: 11, fontWeight: 700, letterSpacing: "2.5px", textTransform: "uppercase", marginBottom: 14 }}>THE SMARTSTOCK ADVANTAGE</p>
            <h2 style={{ color: "white", fontSize: "clamp(1.8rem,3.5vw,2.6rem)", fontWeight: 800, lineHeight: 1.1, letterSpacing: "-1px" }}>
              Not a feature. A competitive edge.
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {VALUE_CARDS.map((v, i) => (
              <div key={i} className={`pw-reveal pw-lift pw-d${i + 1}`} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)", borderTop: `2px solid ${v.accent}28`, padding: "32px 28px" }}>
                <div style={{ color: v.accent, fontSize: 11, fontWeight: 800, letterSpacing: "2px", marginBottom: 16 }}>{v.index}</div>
                <h3 style={{ color: "white", fontSize: 16, fontWeight: 700, marginBottom: 10 }}>{v.title}</h3>
                <p style={{ color: "rgba(255,255,255,0.40)", fontSize: 13, lineHeight: 1.7 }}>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ELIGIBILITY ── */}
      <section style={{ background: "#0a0f1e", padding: "80px 40px" }}>
        <div style={{ maxWidth: 720, margin: "0 auto", textAlign: "center" }}>
          <div className="pw-reveal">
            <p style={{ color: "#60a5fa", fontSize: 11, fontWeight: 700, letterSpacing: "2.5px", textTransform: "uppercase", marginBottom: 16 }}>WHO QUALIFIES</p>
            <h2 style={{ color: "white", fontSize: "clamp(1.8rem,3.5vw,2.4rem)", fontWeight: 800, lineHeight: 1.15, marginBottom: 20, letterSpacing: "-0.5px" }}>
              SmartStock activates automatically<br />for qualifying brands.
            </h2>
            <p style={{ color: "rgba(255,255,255,0.40)", fontSize: 15, lineHeight: 1.75, marginBottom: 48 }}>
              Brands with repeat orders across 2+ cycles are automatically evaluated for SmartStock eligibility. There's no form to fill, no integration to set up.
            </p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 48 }}>
            {ELIGIBILITY.map((c, i) => (
              <div key={i} className={`pw-reveal pw-d${i + 1}`} style={{ background: "rgba(96,165,250,0.05)", border: "1px solid rgba(96,165,250,0.10)", padding: "20px 16px", textAlign: "center" }}>
                <p style={{ color: "white", fontSize: 18, fontWeight: 800, marginBottom: 6 }}>{c.val}</p>
                <p style={{ color: "rgba(255,255,255,0.36)", fontSize: 11, textTransform: "uppercase", letterSpacing: "1.5px" }}>{c.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="relative overflow-hidden" style={{ background: "#08080f", padding: "100px 40px", textAlign: "center" }}>
        <div className="pw-glow-drift absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 50% 60% at 50% 100%, rgba(59,130,246,0.12) 0%, transparent 65%)" }} />
        <div className="pw-reveal" style={{ position: "relative", zIndex: 1, maxWidth: 600, margin: "0 auto" }}>
          <p style={{ color: "rgba(255,255,255,0.28)", fontSize: 11, fontWeight: 700, letterSpacing: "2.5px", textTransform: "uppercase", marginBottom: 16 }}>READY TO ELIMINATE STOCKOUTS</p>
          <h2 style={{ color: "white", fontSize: "clamp(2rem,4vw,3rem)", fontWeight: 800, lineHeight: 1.1, letterSpacing: "-1px", marginBottom: 16 }}>
            Start your first Packworkz order.<br />
            <span style={{ color: "#60a5fa", fontStyle: "italic" }}>SmartStock kicks in automatically.</span>
          </h2>
          <p style={{ color: "rgba(255,255,255,0.36)", fontSize: 15, lineHeight: 1.7, marginBottom: 40 }}>
            No integration. No setup. Just place your order — and let the intelligence layer do the rest.
          </p>
          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            <span className="animated-border animated-border-white">
              <Link href="/quote"><button className="btn-fill btn-amber px-8 py-3 text-sm pw-btn-transition">Get a Quote →</button></Link>
            </span>
            <a href="https://wa.me/918208990366?text=Hi%2C%20I%27d%20like%20to%20know%20about%20SmartStock" target="_blank" rel="noopener noreferrer">
              <button className="btn-fill btn-outline-white px-8 py-3 text-sm pw-btn-transition">Talk to an Expert</button>
            </a>
          </div>
          <p style={{ color: "rgba(255,255,255,0.28)", fontSize: 12, marginTop: 14, letterSpacing: "0.2px" }}>
            No minimum for samples · MOQ from 500 units for bulk
          </p>
        </div>
      </section>

    </div>
  );
}
