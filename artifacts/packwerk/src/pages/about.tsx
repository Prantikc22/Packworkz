import { Link } from "wouter";

const kalyanFactory = "/kalyani-factory.png";

const TIMELINE = [
  { year: "1993", title: "Kalyani Packaging Founded", desc: "Kalyani Packaging is established in West Bengal — a flexographic printing and lamination plant serving regional FMCG brands. Built on precision, not promises." },
  { year: "2008", title: "Expansion & Modernisation", desc: "Kalyani Rotopack Pvt Ltd is formally incorporated. We invest in rotogravure printing lines, barrier laminates, and food-grade film processing — serving national brands across India." },
  { year: "2018", title: "Global Supply Network", desc: "A decade of supplier relationships evolves into a curated global network — raw material sourcing from Japan, South Korea, Germany, and domestic mills — giving us cost and quality leverage." },
  { year: "2024", title: "Packworkz is Born", desc: "Armed with 30 years of manufacturing know-how and a network of 500+ vetted factories, we launch Packworkz — India's first managed packaging platform — to give every brand the supply chain we always wished we had." },
  { year: "2025", title: "Platform Scales Nationally", desc: "The catalog expands across D2C and enterprise packaging, supported by real-time order records and inventory intelligence." },
];

const VALUES = [
  { title: "Radical Transparency", desc: "Every price, lead time, and factory name is visible to you. No hidden markups, no black boxes, no 'trust us' procurement.", index: "01" },
  { title: "Quality Without Compromise", desc: "Three-stage QC before dispatch, every batch. You only pay for what meets spec — rejects are on us.", index: "02" },
  { title: "Technology Over Tradition", desc: "We built SmartStock™, real-time dashboards, and digital QC trails because the industry ran on WhatsApp and Excel for too long.", index: "03" },
  { title: "Sustainability First", desc: "We actively push brands toward lower-footprint alternatives. The planet is a stakeholder in every order we place.", index: "04" },
];

const STATS = [
  { val: "30+", label: "Years Manufacturing" },
  { val: "49", label: "Product families" },
  { val: "500+", label: "Factory Partners" },
  { val: "220+", label: "Brands Served" },
];

const MISSION_STATS = [
  { num: "18–35%", label: "Cost Savings vs. Traditional" },
  { num: "49", label: "Product families" },
  { num: "0", label: "Stockouts on SmartStock" },
  { num: "48hr", label: "Pricing Turnaround" },
];

export default function About() {
  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

      {/* ── HERO ── */}
      <section className="relative overflow-hidden" style={{ background: "linear-gradient(135deg, #020817 0%, #071a45 40%, #0f2455 100%)", padding: "140px 40px 100px", textAlign: "center", minHeight: "65vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="pw-glow-drift absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 65% 55% at 50% 40%, rgba(27,108,168,0.16) 0%, transparent 70%)" }} />
        <div className="pw-glow-drift-slow absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 40% 35% at 70% 60%, rgba(59,130,246,0.08) 0%, transparent 60%)" }} />
        <div style={{ position: "relative", zIndex: 1, maxWidth: 800, margin: "0 auto" }}>
          <div className="pw-reveal" style={{ display: "inline-flex", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 9999, padding: "6px 18px", marginBottom: 28 }}>
            <span style={{ color: "rgba(255,255,255,0.45)", fontSize: 10, fontWeight: 700, letterSpacing: "2.5px", textTransform: "uppercase" }}>OUR STORY</span>
          </div>
          <h1 className="pw-reveal pw-d1" style={{ color: "white", fontSize: "clamp(2.8rem,6vw,5rem)", fontWeight: 900, lineHeight: 1.05, letterSpacing: "-2px", marginBottom: 24 }}>
            30 Years of Manufacturing.<br />
            <span style={{ color: "#60a5fa", fontStyle: "italic" }}>One Platform. Every Brand.</span>
          </h1>
          <p className="pw-reveal pw-d2" style={{ color: "rgba(255,255,255,0.50)", fontSize: "clamp(15px,2vw,18px)", lineHeight: 1.75, maxWidth: 600, margin: "0 auto 48px" }}>
            Packworkz is built on the backbone of Kalyani Rotopack Pvt Ltd — a 30-year-old packaging manufacturing operation — now reimagined as India's first managed packaging platform.
          </p>
          <div className="pw-reveal pw-d3" style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            <span className="animated-border animated-border-white">
              <Link href="/configure"><button className="btn-fill btn-amber px-8 py-3 text-sm pw-btn-transition">Get a Quote →</button></Link>
            </span>
            <Link href="/how-it-works"><button className="btn-fill btn-outline-white px-8 py-3 text-sm pw-btn-transition">How It Works</button></Link>
          </div>
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <section style={{ background: "#08080f", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
        <div style={{ maxWidth: 860, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(4,1fr)", padding: "0 24px" }}>
          {STATS.map((s, i) => (
            <div key={i} className={`pw-reveal pw-d${i + 1}`} style={{ padding: "36px 16px", textAlign: "center", borderRight: i < 3 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
              <p style={{ color: "white", fontSize: "clamp(2.2rem,3.5vw,3.2rem)", fontWeight: 800, lineHeight: 1, letterSpacing: "-1px" }}>{s.val}</p>
              <div style={{ width: 24, height: 2, background: "#C8952A", margin: "10px auto 12px" }} />
              <p style={{ color: "rgba(255,255,255,0.38)", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "1.5px" }}>{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── KALYANI ORIGIN STORY ── */}
      <section style={{ background: "#04080f", padding: "100px 40px", borderTop: "1px solid rgba(255,255,255,0.04)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div className="pw-reveal" style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
            <div style={{ width: 6, height: 6, background: "#E8A838", borderRadius: "50%", boxShadow: "0 0 8px rgba(232,168,56,0.7)", flexShrink: 0 }} />
            <p style={{ color: "#E8A838", fontSize: 11, fontWeight: 700, letterSpacing: "2.5px", textTransform: "uppercase" }}>THE ORIGIN STORY</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 72, alignItems: "center" }}>
            <div>
              <h2 className="pw-reveal pw-d1" style={{ color: "white", fontSize: "clamp(1.8rem,3.5vw,2.8rem)", fontWeight: 800, lineHeight: 1.12, letterSpacing: "-0.5px", marginBottom: 28 }}>
                Built on Three Decades of Packaging Manufacturing
              </h2>
              <div className="pw-reveal pw-d2" style={{ color: "rgba(255,255,255,0.65)", fontSize: 16, lineHeight: 1.85 }}>
                <p style={{ marginBottom: 18 }}>
                  In 1993, <strong style={{ color: "white" }}>Kalyani Packaging</strong> was founded in West Bengal — a flexographic printing and lamination unit serving India's growing FMCG sector. What started as a regional operation grew into <strong style={{ color: "white" }}>Kalyani Rotopack Pvt Ltd</strong>, one of India's trusted flexible packaging manufacturers, running rotogravure presses, multi-layer barrier laminates, and food-grade film lines.
                </p>
                <p style={{ marginBottom: 18 }}>
                  Over 30 years, we built something most packaging platforms cannot buy: <strong style={{ color: "white" }}>manufacturer-grade relationships</strong>. We know which factories never miss a colour register. We know which mills in South Korea supply the best barrier films. We know what "real quality" looks like on a press — because we ran one.
                </p>
                <p>
                  In 2024, we made a decision. Instead of keeping this advantage inside one factory, we would <strong style={{ color: "white" }}>open it up to every brand in India</strong>. That's Packworkz — our 30-year supply chain expertise, packaged into a platform any brand can access from Day 1.
                </p>
              </div>
            </div>
            <div className="pw-reveal pw-d2">
              <div style={{ position: "relative", borderRadius: 8, overflow: "hidden", border: "1px solid rgba(255,255,255,0.08)" }}>
                <img
                  src={kalyanFactory}
                  alt="Kalyani Packaging — Flexo Printing & Lamination Plant"
                  style={{ width: "100%", height: 340, objectFit: "cover", display: "block" }}
                />
                <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "20px 24px", background: "linear-gradient(to top, rgba(4,8,15,0.92), transparent)" }}>
                  <p style={{ color: "white", fontSize: 13, fontWeight: 700, marginBottom: 2 }}>Kalyani Rotopack Pvt Ltd</p>
                  <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 12 }}>Flexo Printing & Lamination Plant · Est. 1993</p>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 10 }}>
                {[
                  { val: "1993", label: "Year Founded" },
                  { val: "30+", label: "Years in Production" },
                  { val: "Global", label: "Supplier Network" },
                  { val: "500+", label: "Factory Partners" },
                ].map((s, i) => (
                  <div key={i} style={{ background: "rgba(13,27,42,0.60)", border: "1px solid rgba(59,130,246,0.10)", padding: "16px 18px", borderRadius: 6, textAlign: "center" }}>
                    <div style={{ color: "white", fontSize: 22, fontWeight: 900, letterSpacing: "-0.5px", marginBottom: 4 }}>{s.val}</div>
                    <div style={{ color: "rgba(255,255,255,0.36)", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "1px" }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW PACKWORKZ DISRUPTS PACKAGING ── */}
      <section style={{ background: "#08080f", padding: "100px 40px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "center" }}>
          <div className="pw-reveal">
            <p style={{ color: "#60a5fa", fontSize: 11, fontWeight: 700, letterSpacing: "2.5px", textTransform: "uppercase", marginBottom: 16 }}>THE DISRUPTION</p>
            <h2 style={{ color: "white", fontSize: "clamp(2rem,4vw,2.8rem)", fontWeight: 800, lineHeight: 1.1, letterSpacing: "-1px", marginBottom: 24 }}>
              India's packaging industry was ripe for a reset.
            </h2>
            <p style={{ color: "rgba(255,255,255,0.48)", fontSize: 15, lineHeight: 1.8, marginBottom: 16 }}>
              For decades, brands sourced packaging through layers of middlemen — each taking a cut, each adding opacity. MOQs were impossibly high for new brands, lead times were unpredictable, and quality control was verbal. The result? Brands overpaid, understocked, and firefought constantly.
            </p>
            <p style={{ color: "rgba(255,255,255,0.48)", fontSize: 15, lineHeight: 1.8, marginBottom: 32 }}>
              Packworkz collapses those layers. We connect brands directly to a curated network of 500+ verified factories — backed by our own 30-year manufacturing lens — and manage the entire journey: quoting, procurement, QC, logistics, and reorders. One platform. Zero guesswork.
            </p>
            <span className="animated-border animated-border-white" style={{ display: "inline-block" }}>
              <Link href="/configure"><button className="btn-fill btn-amber px-8 py-3 text-sm pw-btn-transition">Get a Quote →</button></Link>
            </span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {MISSION_STATS.map((stat, i) => (
              <div key={i} className={`pw-reveal pw-lift pw-d${i + 1}`} style={{ background: "rgba(13,27,42,0.50)", border: "1px solid rgba(59,130,246,0.10)", padding: "28px 20px", textAlign: "center" }}>
                <div style={{ color: "white", fontSize: "clamp(1.5rem,2.5vw,2.2rem)", fontWeight: 900, lineHeight: 1, marginBottom: 10, letterSpacing: "-1px" }}>{stat.num}</div>
                <div style={{ width: 20, height: 2, background: "#C8952A", margin: "0 auto 10px" }} />
                <div style={{ color: "rgba(255,255,255,0.36)", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "1.2px", lineHeight: 1.4 }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TIMELINE ── */}
      <section style={{ background: "#0a0f1e", padding: "100px 40px" }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <div className="pw-reveal" style={{ textAlign: "center", marginBottom: 64 }}>
            <p style={{ color: "#60a5fa", fontSize: 11, fontWeight: 700, letterSpacing: "2.5px", textTransform: "uppercase", marginBottom: 14 }}>THE JOURNEY</p>
            <h2 style={{ color: "white", fontSize: "clamp(2rem,4vw,3rem)", fontWeight: 800, lineHeight: 1.1, letterSpacing: "-1px" }}>Three decades in the making.</h2>
          </div>
          <div style={{ position: "relative" }}>
            <div style={{ position: "absolute", left: 52, top: 0, bottom: 0, width: 1, background: "rgba(59,130,246,0.10)" }} />
            {TIMELINE.map((t, i) => (
              <div key={i} className={`pw-reveal pw-d${i + 1}`} style={{ display: "flex", gap: 28, marginBottom: i < TIMELINE.length - 1 ? 40 : 0, position: "relative" }}>
                <div style={{ flexShrink: 0, width: 80, textAlign: "right" }}>
                  <span style={{ color: "#60a5fa", fontSize: 13, fontWeight: 800, letterSpacing: "-0.5px" }}>{t.year}</span>
                </div>
                <div style={{ width: 9, height: 9, borderRadius: "50%", background: "#3B82F6", border: "2px solid #1d4ed8", flexShrink: 0, marginTop: 5, zIndex: 1 }} />
                <div style={{ paddingBottom: 8 }}>
                  <h3 style={{ color: "white", fontSize: 16, fontWeight: 700, marginBottom: 8 }}>{t.title}</h3>
                  <p style={{ color: "rgba(255,255,255,0.38)", fontSize: 13, lineHeight: 1.7 }}>{t.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── VALUES ── */}
      <section style={{ background: "#08080f", padding: "100px 40px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div className="pw-reveal" style={{ textAlign: "center", marginBottom: 56 }}>
            <p style={{ color: "#60a5fa", fontSize: 11, fontWeight: 700, letterSpacing: "2.5px", textTransform: "uppercase", marginBottom: 14 }}>WHAT WE STAND FOR</p>
            <h2 style={{ color: "white", fontSize: "clamp(2rem,4vw,3rem)", fontWeight: 800, lineHeight: 1.1, letterSpacing: "-1px" }}>Our Values</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {VALUES.map((v, i) => (
              <div key={i} className={`pw-reveal pw-lift pw-d${i + 1}`} style={{ background: "rgba(13,27,42,0.50)", border: "1px solid rgba(255,255,255,0.04)", borderTop: "2px solid rgba(59,130,246,0.22)", padding: "32px 28px" }}>
                <div style={{ color: "rgba(96,165,250,0.55)", fontSize: 11, fontWeight: 800, letterSpacing: "2px", marginBottom: 16 }}>{v.index}</div>
                <h3 style={{ color: "white", fontSize: 16, fontWeight: 700, marginBottom: 10 }}>{v.title}</h3>
                <p style={{ color: "rgba(255,255,255,0.38)", fontSize: 13, lineHeight: 1.75 }}>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── GLOBAL NETWORK ── */}
      <section style={{ background: "#04080f", padding: "80px 40px", borderTop: "1px solid rgba(255,255,255,0.04)" }}>
        <div style={{ maxWidth: 860, margin: "0 auto", textAlign: "center" }}>
          <div className="pw-reveal">
            <p style={{ color: "#E8A838", fontSize: 11, fontWeight: 700, letterSpacing: "2.5px", textTransform: "uppercase", marginBottom: 14 }}>OUR NETWORK</p>
            <h2 style={{ color: "white", fontSize: "clamp(1.8rem,3.5vw,2.6rem)", fontWeight: 800, lineHeight: 1.15, letterSpacing: "-0.5px", marginBottom: 20 }}>
              Sourced Globally. Delivered Locally.
            </h2>
            <p style={{ color: "rgba(255,255,255,0.48)", fontSize: 15, lineHeight: 1.8, maxWidth: 640, margin: "0 auto 48px" }}>
              Our supplier relationships span India, Japan, South Korea, Germany, and Southeast Asia — built over 30 years, stress-tested across thousands of production runs. When you order through Packworkz, you get the same supplier access that took us three decades to build.
            </p>
            <div style={{ display: "flex", gap: 32, justifyContent: "center", flexWrap: "wrap" }}>
              {["India", "Japan", "South Korea", "Germany", "Southeast Asia"].map((country, i) => (
                <div key={i} className="pw-reveal" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 6, padding: "12px 24px" }}>
                  <span style={{ color: "rgba(255,255,255,0.60)", fontSize: 13, fontWeight: 600 }}>{country}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="relative overflow-hidden" style={{ background: "#08080f", padding: "100px 40px", textAlign: "center", borderTop: "1px solid rgba(255,255,255,0.03)" }}>
        <div className="pw-glow-drift absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 50% 60% at 50% 100%, rgba(27,108,168,0.12) 0%, transparent 65%)" }} />
        <div className="pw-reveal" style={{ position: "relative", zIndex: 1, maxWidth: 560, margin: "0 auto" }}>
          <p style={{ color: "rgba(255,255,255,0.30)", fontSize: 11, fontWeight: 700, letterSpacing: "2.5px", textTransform: "uppercase", marginBottom: 16 }}>WORK WITH US</p>
          <h2 style={{ color: "white", fontSize: "clamp(2rem,4vw,3rem)", fontWeight: 800, lineHeight: 1.1, letterSpacing: "-1px", marginBottom: 16 }}>
            Ready to fix your packaging?
          </h2>
          <p style={{ color: "rgba(255,255,255,0.36)", fontSize: 15, lineHeight: 1.7, marginBottom: 40 }}>
            Talk to our team. Get a pricing plan in 24 hours. No commitment required.
          </p>
          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            <span className="animated-border animated-border-white">
              <Link href="/configure"><button className="btn-fill btn-amber px-8 py-3 text-sm pw-btn-transition">Get a Quote →</button></Link>
            </span>
            <a href="https://wa.me/918208990366" target="_blank" rel="noreferrer">
              <button className="btn-fill btn-outline-white px-8 py-3 text-sm pw-btn-transition">WhatsApp Us</button>
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
