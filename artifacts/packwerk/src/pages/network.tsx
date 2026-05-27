import { Link } from "wouter";

const CERTIFICATIONS = [
  { code: "ISO 9001",  name: "Quality Management" },
  { code: "BRC",       name: "Global Food Safety" },
  { code: "FDA",       name: "US Food & Drug" },
  { code: "FSC",       name: "Forest Stewardship" },
  { code: "ISO 14001", name: "Environmental Mgmt" },
  { code: "FSSAI",     name: "India Food Safety" },
];

const CATEGORIES = [
  { label: "Flexible Packaging",  count: "80+ SKUs", desc: "Pouches, films, laminates, wrappers" },
  { label: "Rigid & Bottles",     count: "40+ SKUs", desc: "PET, HDPE, glass, aluminium" },
  { label: "Boxes & Cartons",     count: "30+ SKUs", desc: "Mono, duplex, corrugated, SBS" },
  { label: "E-commerce",          count: "25+ SKUs", desc: "Mailers, bubble wrap, kraft tapes" },
  { label: "Labels & Closures",   count: "20+ SKUs", desc: "Pressure-sensitive, in-mould, caps" },
  { label: "Sustainable",         count: "15+ SKUs", desc: "Kraft, recycled, compostable" },
];

const VETTING_STEPS = [
  { n: "01", title: "On-site Audit",        desc: "Our team visits the facility before onboarding. No remote approval — physical verification is mandatory." },
  { n: "02", title: "Sample QC Gate",       desc: "Factories must clear a 3-round sample quality gate covering dimensional accuracy, print fidelity, and material strength." },
  { n: "03", title: "Capacity Assessment",  desc: "We map peak and off-peak capacity to ensure every partner can deliver at scale without subcontracting." },
  { n: "04", title: "Compliance Review",    desc: "All certifications are verified, dated, and stored in our system. Expired certs trigger automatic quarantine." },
  { n: "05", title: "Performance Tracking", desc: "Every dispatch is scored on OTD, quality rejections, and packing accuracy. Low scorers are placed on review." },
  { n: "06", title: "Annual Re-audit",      desc: "Factories are re-audited every 12 months. The network continuously improves — mediocrity doesn't survive." },
];

const NETWORK_STATS = [
  { val: "500+", label: "Verified Partners" },
  { val: "20+",  label: "States Covered" },
  { val: "3×",   label: "Backup Vendors / Order" },
  { val: "100%", label: "QC Pre-dispatch" },
];

export default function Network() {
  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

      {/* ── HERO ── */}
      <section className="relative overflow-hidden" style={{ background: "linear-gradient(135deg, #020817 0%, #071a45 40%, #0f2455 100%)", padding: "140px 40px 100px", textAlign: "center", minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="pw-glow-drift absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 60% 50% at 50% 40%, rgba(27,108,168,0.18) 0%, transparent 70%)" }} />
        <div className="pw-glow-drift-slow absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 35% 30% at 75% 65%, rgba(59,130,246,0.07) 0%, transparent 55%)" }} />
        <div style={{ position: "relative", zIndex: 1, maxWidth: 800, margin: "0 auto" }}>
          <div className="pw-reveal" style={{ display: "inline-flex", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 9999, padding: "6px 18px", marginBottom: 28 }}>
            <span style={{ color: "rgba(255,255,255,0.45)", fontSize: 10, fontWeight: 700, letterSpacing: "2.5px", textTransform: "uppercase" }}>OUR MANUFACTURING BACKBONE</span>
          </div>
          <h1 className="pw-reveal pw-d1" style={{ color: "white", fontSize: "clamp(2.8rem,6vw,4.8rem)", fontWeight: 900, lineHeight: 1.05, letterSpacing: "-2px", marginBottom: 24 }}>
            500+ Verified<br />
            <span style={{ color: "#60a5fa", fontStyle: "italic" }}>Factory Partners.</span>
          </h1>
          <p className="pw-reveal pw-d2" style={{ color: "rgba(255,255,255,0.48)", fontSize: "clamp(15px,2vw,18px)", lineHeight: 1.75, maxWidth: 560, margin: "0 auto 48px" }}>
            Every Packworkz order is backed by India's most rigorously vetted packaging manufacturer network — with 3 backup vendors assigned per order, by default.
          </p>
          <div className="pw-reveal pw-d3" style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            <span className="animated-border animated-border-white">
              <Link href="/quote"><button className="btn-fill btn-amber px-8 py-3 text-sm pw-btn-transition">Get a Quote →</button></Link>
            </span>
            <Link href="/products"><button className="btn-fill btn-outline-white px-8 py-3 text-sm pw-btn-transition">Browse Products</button></Link>
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section style={{ background: "#08080f", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
        <div style={{ maxWidth: 860, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(4,1fr)", padding: "0 24px" }}>
          {NETWORK_STATS.map((s, i) => (
            <div key={i} className={`pw-reveal pw-d${i + 1}`} style={{ padding: "36px 16px", textAlign: "center", borderRight: i < 3 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
              <p style={{ color: "white", fontSize: "clamp(2.2rem,3.5vw,3.2rem)", fontWeight: 800, lineHeight: 1, letterSpacing: "-1px" }}>{s.val}</p>
              <div style={{ width: 24, height: 2, background: "#C8952A", margin: "10px auto 12px" }} />
              <p style={{ color: "rgba(255,255,255,0.38)", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "1.5px" }}>{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW WE VET ── */}
      <section style={{ background: "#08080f", padding: "100px 40px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div className="pw-reveal" style={{ textAlign: "center", marginBottom: 64 }}>
            <p style={{ color: "#60a5fa", fontSize: 11, fontWeight: 700, letterSpacing: "2.5px", textTransform: "uppercase", marginBottom: 14 }}>OUR VETTING PROCESS</p>
            <h2 style={{ color: "white", fontSize: "clamp(2rem,4vw,3rem)", fontWeight: 800, lineHeight: 1.1, letterSpacing: "-1px" }}>
              Not every factory makes the cut.
            </h2>
            <p style={{ color: "rgba(255,255,255,0.38)", fontSize: 16, maxWidth: 500, margin: "16px auto 0", lineHeight: 1.7 }}>
              We evaluate factories across 40+ parameters before they handle a single Packworkz order.
            </p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {VETTING_STEPS.map((s, i) => (
              <div key={i} className={`pw-reveal pw-lift pw-d${(i % 2) + 1}`} style={{ background: "rgba(13,27,42,0.50)", border: "1px solid rgba(255,255,255,0.04)", borderLeft: "2px solid rgba(59,130,246,0.28)", padding: "24px 20px", display: "flex", gap: 16 }}>
                <span style={{ color: "rgba(255,255,255,0.14)", fontSize: 13, fontWeight: 800, fontFamily: "'Space Grotesk',sans-serif", flexShrink: 0, paddingTop: 2 }}>{s.n}</span>
                <div>
                  <h3 style={{ color: "rgba(255,255,255,0.85)", fontSize: 14, fontWeight: 700, marginBottom: 7 }}>{s.title}</h3>
                  <p style={{ color: "rgba(255,255,255,0.34)", fontSize: 13, lineHeight: 1.65 }}>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── COVERAGE ── */}
      <section style={{ background: "#0a0f1e", padding: "100px 40px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div className="pw-reveal" style={{ textAlign: "center", marginBottom: 56 }}>
            <p style={{ color: "#60a5fa", fontSize: 11, fontWeight: 700, letterSpacing: "2.5px", textTransform: "uppercase", marginBottom: 14 }}>CATEGORY COVERAGE</p>
            <h2 style={{ color: "white", fontSize: "clamp(2rem,4vw,2.8rem)", fontWeight: 800, lineHeight: 1.1, letterSpacing: "-1px" }}>
              110+ SKUs. Every packaging need. One network.
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
            {CATEGORIES.map((c, i) => (
              <div key={i} className={`pw-reveal pw-lift pw-d${(i % 3) + 1}`} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)", padding: "24px 20px" }}>
                <p style={{ color: "#60a5fa", fontSize: 12, fontWeight: 700, marginBottom: 6 }}>{c.count}</p>
                <h3 style={{ color: "white", fontSize: 14, fontWeight: 700, marginBottom: 8 }}>{c.label}</h3>
                <p style={{ color: "rgba(255,255,255,0.30)", fontSize: 12, lineHeight: 1.6 }}>{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CERTIFICATIONS ── */}
      <section style={{ background: "#08080f", padding: "80px 40px" }}>
        <div style={{ maxWidth: 860, margin: "0 auto", textAlign: "center" }}>
          <div className="pw-reveal">
            <p style={{ color: "#60a5fa", fontSize: 11, fontWeight: 700, letterSpacing: "2.5px", textTransform: "uppercase", marginBottom: 14 }}>CERTIFICATIONS COVERED</p>
            <h2 style={{ color: "white", fontSize: "clamp(1.8rem,3vw,2.4rem)", fontWeight: 800, marginBottom: 40, letterSpacing: "-0.5px" }}>Export-ready. Regulation-compliant.</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, maxWidth: 640, margin: "0 auto" }}>
            {CERTIFICATIONS.map((c, i) => (
              <div key={i} className={`pw-reveal pw-d${(i % 3) + 1}`} style={{ background: "rgba(96,165,250,0.04)", border: "1px solid rgba(96,165,250,0.10)", padding: "20px 16px", textAlign: "center" }}>
                <p style={{ color: "white", fontSize: 15, fontWeight: 800, marginBottom: 6 }}>{c.code}</p>
                <p style={{ color: "rgba(255,255,255,0.34)", fontSize: 11, textTransform: "uppercase", letterSpacing: "1.2px" }}>{c.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="relative overflow-hidden" style={{ background: "#08080f", padding: "100px 40px", textAlign: "center", borderTop: "1px solid rgba(255,255,255,0.03)" }}>
        <div className="pw-glow-drift absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 50% 60% at 50% 100%, rgba(27,108,168,0.12) 0%, transparent 65%)" }} />
        <div className="pw-reveal" style={{ position: "relative", zIndex: 1, maxWidth: 580, margin: "0 auto" }}>
          <h2 style={{ color: "white", fontSize: "clamp(2rem,4vw,2.8rem)", fontWeight: 800, letterSpacing: "-1px", marginBottom: 16 }}>
            Put the network to work for your brand.
          </h2>
          <p style={{ color: "rgba(255,255,255,0.36)", fontSize: 15, lineHeight: 1.7, marginBottom: 40 }}>
            500+ partners. 3 backup vendors per order. Zero single points of failure.
          </p>
          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            <span className="animated-border animated-border-white">
              <Link href="/quote"><button className="btn-fill btn-amber px-8 py-3 text-sm pw-btn-transition">Get a Quote →</button></Link>
            </span>
            <Link href="/products"><button className="btn-fill btn-outline-white px-8 py-3 text-sm pw-btn-transition">Browse 110+ SKUs</button></Link>
          </div>
          <p style={{ color: "rgba(255,255,255,0.28)", fontSize: 12, marginTop: 14, letterSpacing: "0.2px" }}>
            No minimum for samples · MOQ from 500 units for bulk
          </p>
        </div>
      </section>

    </div>
  );
}
