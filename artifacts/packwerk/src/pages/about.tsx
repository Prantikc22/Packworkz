import { Link } from "wouter";
import { PublicLayout } from "@/components/layout/PublicLayout";

export default function About() {
  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* Hero */}
      <section style={{ background: "#020617", padding: "100px 64px 80px", textAlign: "center" }}>
        <p style={{ color: "#E8A838", fontSize: 12, fontWeight: 700, letterSpacing: "3px", textTransform: "uppercase", marginBottom: 16 }}>OUR STORY</p>
        <h1 style={{ color: "white", fontSize: "clamp(36px,5vw,64px)", fontWeight: 900, lineHeight: 1.1, marginBottom: 24, letterSpacing: "-0.03em" }}>
          Built by Brand Owners,<br />for Brand Owners.
        </h1>
        <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 18, lineHeight: 1.7, maxWidth: 620, margin: "0 auto 40px" }}>
          Packworkz was born from the frustration of running a D2C brand and realising India's packaging supply chain was broken — opaque pricing, inconsistent quality, and zero tech. We decided to fix it.
        </p>
      </section>

      {/* Story */}
      <section style={{ background: "#F8F9FC", padding: "80px 64px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "center" }}>
          <div>
            <h2 style={{ color: "#0D1B2A", fontSize: 32, fontWeight: 800, lineHeight: 1.2, marginBottom: 20 }}>
              India's first managed packaging platform.
            </h2>
            <p style={{ color: "#475569", fontSize: 15, lineHeight: 1.8, marginBottom: 16 }}>
              We started in 2022 with a simple idea: connect India's best packaging factories directly to brands, cut out 3 distributor layers, and use technology to manage everything from quote to delivery.
            </p>
            <p style={{ color: "#475569", fontSize: 15, lineHeight: 1.8, marginBottom: 24 }}>
              Today, Packworkz serves 500+ brands across FMCG, D2C, pharma, and e-commerce — delivering consistent quality at 18–35% lower cost than traditional procurement routes.
            </p>
            <Link href="/quote" style={{
              display: "inline-block", background: "#E8A838", color: "#0D1B2A",
              fontWeight: 800, fontSize: 14, padding: "12px 28px",
              borderRadius: 8, textDecoration: "none",
            }}>
              Get a Quote →
            </Link>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {[
              { num: "500+", label: "Brands Served" },
              { num: "110+", label: "Packaging SKUs" },
              { num: "20+", label: "Factory Partners" },
              { num: "2022", label: "Founded" },
            ].map(stat => (
              <div key={stat.label} style={{ background: "white", borderRadius: 12, padding: "24px 20px", border: "1px solid #E2EAF4", textAlign: "center" }}>
                <div style={{ color: "#1B6CA8", fontSize: 36, fontWeight: 900, lineHeight: 1 }}>{stat.num}</div>
                <div style={{ color: "#64748B", fontSize: 13, fontWeight: 600, marginTop: 8 }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section style={{ background: "white", padding: "80px 64px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <p style={{ color: "#1B6CA8", fontSize: 12, fontWeight: 700, letterSpacing: "3px", textTransform: "uppercase", marginBottom: 12 }}>WHAT WE STAND FOR</p>
          <h2 style={{ color: "#0D1B2A", fontSize: 32, fontWeight: 800, marginBottom: 48 }}>Our Values</h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 24 }}>
            {[
              { title: "Radical Transparency", desc: "Every price, lead time, and factory is visible to you. No hidden markups, no black boxes." },
              { title: "Quality Without Compromise", desc: "Every batch goes through 3-stage QC before dispatch. You only pay for what meets spec." },
              { title: "Sustainability First", desc: "We actively push brands toward lower-footprint packaging alternatives — because the planet is a stakeholder too." },
            ].map(v => (
              <div key={v.title} style={{ background: "#F8F9FC", borderRadius: 12, padding: "28px 24px", border: "1px solid #E2EAF4" }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#E8A838", marginBottom: 16 }} />
                <h3 style={{ color: "#0D1B2A", fontSize: 16, fontWeight: 700, marginBottom: 10 }}>{v.title}</h3>
                <p style={{ color: "#64748B", fontSize: 14, lineHeight: 1.7 }}>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: "#020617", padding: "80px 64px", textAlign: "center" }}>
        <h2 style={{ color: "white", fontSize: 32, fontWeight: 800, marginBottom: 16 }}>Ready to fix your packaging?</h2>
        <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 16, marginBottom: 32 }}>Talk to our team. Get a quote in 24 hours.</p>
        <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/quote" style={{ background: "#E8A838", color: "#0D1B2A", fontWeight: 800, fontSize: 14, padding: "14px 32px", borderRadius: 8, textDecoration: "none" }}>
            Get a Quote
          </Link>
          <a href="https://wa.me/918208990366" target="_blank" rel="noreferrer" style={{ background: "#25D366", color: "white", fontWeight: 800, fontSize: 14, padding: "14px 32px", borderRadius: 8, textDecoration: "none" }}>
            WhatsApp Us
          </a>
        </div>
      </section>
    </div>
  );
}
