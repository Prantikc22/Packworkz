import { Link } from "wouter";

const TIMELINE = [
  { year: "2024", title: "The Idea", desc: "Founders run D2C brands, hit every packaging pain point — opaque pricing, vendor delays, zero tech. Decide to build what they wished existed." },
  { year: "2025 Q1", title: "Platform Launch", desc: "Packworkz goes live with 33 SKUs, 50+ factory partners, and the first version of the managed procurement layer." },
  { year: "2025 Q2", title: "SmartStock™ Launches", desc: "AI inventory intelligence layer ships. Brands on Packworkz record zero stockouts within months of launch." },
  { year: "2025", title: "Growing Fast", desc: "500+ brands, 110+ SKUs, expanding across FMCG, D2C, pharma and e-commerce. India's first managed packaging platform." },
];

const VALUES = [
  {
    title: "Radical Transparency",
    desc: "Every price, lead time, and factory name is visible to you. No hidden markups, no black boxes, no 'trust us' procurement.",
    icon: "🔍",
  },
  {
    title: "Quality Without Compromise",
    desc: "Three-stage QC before dispatch, every batch. You only pay for what meets spec — rejects are on us.",
    icon: "✦",
  },
  {
    title: "Technology Over Tradition",
    desc: "We built SmartStock™, real-time dashboards, and digital QC trails because the industry ran on WhatsApp and Excel for too long.",
    icon: "⚡",
  },
  {
    title: "Sustainability First",
    desc: "We actively push brands toward lower-footprint alternatives. The planet is a stakeholder in every order we place.",
    icon: "🌱",
  },
];

export default function About() {
  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

      {/* ── HERO ── */}
      <section className="relative overflow-hidden" style={{ background: "linear-gradient(135deg, #020817 0%, #071a45 40%, #0f2455 100%)", padding: "140px 40px 100px", textAlign: "center", minHeight: "65vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 65% 55% at 50% 40%, rgba(27,108,168,0.18) 0%, transparent 70%)" }} />
        <div style={{ position: "relative", zIndex: 1, maxWidth: 800, margin: "0 auto" }}>
          <div style={{ display: "inline-flex", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 9999, padding: "6px 18px", marginBottom: 28 }}>
            <span style={{ color: "rgba(255,255,255,0.45)", fontSize: 10, fontWeight: 700, letterSpacing: "2.5px", textTransform: "uppercase" }}>OUR STORY</span>
          </div>
          <h1 style={{ color: "white", fontSize: "clamp(2.8rem,6vw,5rem)", fontWeight: 900, lineHeight: 1.05, letterSpacing: "-2px", marginBottom: 24 }}>
            Built by Brand Owners,<br />
            <span style={{ color: "#60a5fa", fontStyle: "italic" }}>for Brand Owners.</span>
          </h1>
          <p style={{ color: "rgba(255,255,255,0.52)", fontSize: "clamp(15px,2vw,18px)", lineHeight: 1.75, maxWidth: 580, margin: "0 auto 48px" }}>
            Packworkz was born from the frustration of running D2C brands in India and realising the packaging supply chain was broken — opaque pricing, inconsistent quality, and zero technology. We decided to fix it.
          </p>
          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            <span className="animated-border animated-border-white">
              <Link href="/quote">
                <button className="btn-fill btn-amber px-8 py-3 text-sm">Get a Quote →</button>
              </Link>
            </span>
            <Link href="/how-it-works">
              <button className="btn-fill btn-outline-white px-8 py-3 text-sm">How It Works</button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section style={{ background: "#08080f", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ maxWidth: 860, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(4,1fr)", padding: "0 24px" }}>
          {[
            { val: "500+",  label: "Brands Served" },
            { val: "110+",  label: "Packaging SKUs" },
            { val: "500+",  label: "Factory Partners" },
            { val: "2025",  label: "Founded" },
          ].map((s, i) => (
            <div key={i} style={{ padding: "36px 16px", textAlign: "center", borderRight: i < 3 ? "1px solid rgba(255,255,255,0.06)" : "none" }}>
              <p style={{ color: "white", fontSize: "clamp(2.2rem,3.5vw,3.2rem)", fontWeight: 800, lineHeight: 1, letterSpacing: "-1px" }}>{s.val}</p>
              <div style={{ width: 24, height: 2, background: "#C8952A", margin: "10px auto 12px" }} />
              <p style={{ color: "rgba(255,255,255,0.42)", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "1.5px" }}>{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── MISSION ── */}
      <section style={{ background: "#08080f", padding: "100px 40px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "center" }}>
          <div>
            <p style={{ color: "#60a5fa", fontSize: 11, fontWeight: 700, letterSpacing: "2.5px", textTransform: "uppercase", marginBottom: 16 }}>THE MISSION</p>
            <h2 style={{ color: "white", fontSize: "clamp(2rem,4vw,3rem)", fontWeight: 800, lineHeight: 1.1, letterSpacing: "-1px", marginBottom: 24 }}>
              India's first managed packaging platform.
            </h2>
            <p style={{ color: "rgba(255,255,255,0.50)", fontSize: 15, lineHeight: 1.8, marginBottom: 16 }}>
              We started in 2025 with a simple idea: connect India's best packaging factories directly to brands, cut out 3 distributor layers, and use technology to manage everything from quote to delivery.
            </p>
            <p style={{ color: "rgba(255,255,255,0.50)", fontSize: 15, lineHeight: 1.8, marginBottom: 32 }}>
              Today, Packworkz serves 500+ brands across FMCG, D2C, pharma, and e-commerce — delivering consistent quality at 18–35% lower cost than traditional procurement routes.
            </p>
            <span className="animated-border animated-border-white" style={{ display: "inline-block" }}>
              <Link href="/quote">
                <button className="btn-fill btn-amber px-8 py-3 text-sm">Get a Quote →</button>
              </Link>
            </span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {[
              { num: "18–35%", label: "Cost Savings vs. Traditional" },
              { num: "110+",   label: "Packaging SKUs" },
              { num: "0",      label: "Stockouts on SmartStock" },
              { num: "48hr",   label: "Quote Turnaround" },
            ].map((stat, i) => (
              <div key={i} style={{ background: "rgba(13,27,42,0.70)", border: "1px solid rgba(59,130,246,0.15)", padding: "28px 20px", textAlign: "center" }}>
                <div style={{ color: "white", fontSize: "clamp(1.5rem,2.5vw,2.2rem)", fontWeight: 900, lineHeight: 1, marginBottom: 10, letterSpacing: "-1px" }}>{stat.num}</div>
                <div style={{ width: 20, height: 2, background: "#C8952A", margin: "0 auto 10px" }} />
                <div style={{ color: "rgba(255,255,255,0.40)", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "1.2px", lineHeight: 1.4 }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TIMELINE ── */}
      <section style={{ background: "#0a0f1e", padding: "100px 40px" }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <p style={{ color: "#60a5fa", fontSize: 11, fontWeight: 700, letterSpacing: "2.5px", textTransform: "uppercase", marginBottom: 14 }}>THE JOURNEY</p>
            <h2 style={{ color: "white", fontSize: "clamp(2rem,4vw,3rem)", fontWeight: 800, lineHeight: 1.1, letterSpacing: "-1px" }}>How we got here.</h2>
          </div>
          <div style={{ position: "relative" }}>
            <div style={{ position: "absolute", left: 52, top: 0, bottom: 0, width: 1, background: "rgba(59,130,246,0.15)" }} />
            {TIMELINE.map((t, i) => (
              <div key={i} style={{ display: "flex", gap: 28, marginBottom: i < TIMELINE.length - 1 ? 40 : 0, position: "relative" }}>
                <div style={{ flexShrink: 0, width: 80, textAlign: "right" }}>
                  <span style={{ color: "#60a5fa", fontSize: 13, fontWeight: 800, letterSpacing: "-0.5px" }}>{t.year}</span>
                </div>
                <div style={{ width: 9, height: 9, borderRadius: "50%", background: "#3B82F6", border: "2px solid #1d4ed8", flexShrink: 0, marginTop: 5, zIndex: 1 }} />
                <div style={{ paddingBottom: 8 }}>
                  <h3 style={{ color: "white", fontSize: 16, fontWeight: 700, marginBottom: 8 }}>{t.title}</h3>
                  <p style={{ color: "rgba(255,255,255,0.42)", fontSize: 13, lineHeight: 1.7 }}>{t.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── VALUES ── */}
      <section style={{ background: "#08080f", padding: "100px 40px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <p style={{ color: "#60a5fa", fontSize: 11, fontWeight: 700, letterSpacing: "2.5px", textTransform: "uppercase", marginBottom: 14 }}>WHAT WE STAND FOR</p>
            <h2 style={{ color: "white", fontSize: "clamp(2rem,4vw,3rem)", fontWeight: 800, lineHeight: 1.1, letterSpacing: "-1px" }}>Our Values</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {VALUES.map((v, i) => (
              <div key={i} style={{ background: "rgba(13,27,42,0.60)", border: "1px solid rgba(255,255,255,0.06)", borderTop: "2px solid rgba(59,130,246,0.35)", padding: "32px 28px" }}>
                <div style={{ fontSize: 24, marginBottom: 16 }}>{v.icon}</div>
                <h3 style={{ color: "white", fontSize: 16, fontWeight: 700, marginBottom: 10 }}>{v.title}</h3>
                <p style={{ color: "rgba(255,255,255,0.42)", fontSize: 13, lineHeight: 1.75 }}>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="relative overflow-hidden" style={{ background: "#08080f", padding: "100px 40px", textAlign: "center", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 50% 60% at 50% 100%, rgba(27,108,168,0.14) 0%, transparent 65%)" }} />
        <div style={{ position: "relative", zIndex: 1, maxWidth: 560, margin: "0 auto" }}>
          <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 11, fontWeight: 700, letterSpacing: "2.5px", textTransform: "uppercase", marginBottom: 16 }}>WORK WITH US</p>
          <h2 style={{ color: "white", fontSize: "clamp(2rem,4vw,3rem)", fontWeight: 800, lineHeight: 1.1, letterSpacing: "-1px", marginBottom: 16 }}>
            Ready to fix your packaging?
          </h2>
          <p style={{ color: "rgba(255,255,255,0.40)", fontSize: 15, lineHeight: 1.7, marginBottom: 40 }}>
            Talk to our team. Get a quote in 24 hours. No commitment required.
          </p>
          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            <span className="animated-border animated-border-white">
              <Link href="/quote">
                <button className="btn-fill btn-amber px-8 py-3 text-sm">Get a Quote →</button>
              </Link>
            </span>
            <a href="https://wa.me/918208990366" target="_blank" rel="noreferrer">
              <button className="btn-fill btn-outline-white px-8 py-3 text-sm">WhatsApp Us</button>
            </a>
          </div>
        </div>
      </section>

    </div>
  );
}
