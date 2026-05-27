import { Link } from "wouter";
import { Leaf, ShieldCheck, FileCheck, Recycle, Droplets, Globe } from "lucide-react";

const WHATSAPP_NUM = "918208990366";

const SKUs = [
  {
    name: "Kraft Stand-Up Pouch",
    certs: ["FSC Certified", "Food Safe", "Leak Proof"],
    moq: "500 units",
    price: "From ₹6.50/unit",
    desc: "FSC certified kraft outer with food-safe inner liner. Leak-proof seal, resealable zipper available. Ideal for spices, dry food, snacks, and Indian grocery.",
  },
  {
    name: "Compostable Courier Bag",
    certs: ["TUV Austria", "Water Resistant", "Tamper Evident"],
    moq: "500 units",
    price: "From ₹12/unit",
    desc: "TUV Austria certified compostable. Water-resistant outer. Tamper-evident adhesive seal. For D2C brands whose packaging needs to match their sustainability story.",
  },
  {
    name: "Bagasse Food Tray",
    certs: ["Microwave Safe", "Oil Resistant", "Compostable"],
    moq: "1,000 units",
    price: "From ₹5/unit",
    desc: "100% sugarcane waste. Microwave safe up to 5 minutes. Oil and water resistant. Ideal for QSR and cloud kitchens serving gravies and curries.",
  },
  {
    name: "Recycled Corrugated Box",
    certs: ["FSC Certified", "80–100% Recycled", "Export Grade"],
    moq: "200 units",
    price: "From ₹22/unit",
    desc: "80–100% recycled board. FSC certified. Full exterior print surface. Same structural strength as virgin board. For e-commerce and export shipping.",
  },
  {
    name: "Mono-material PE Pouch",
    certs: ["EPR Compliant", "Fully Recyclable", "Customisable"],
    moq: "1,000 units",
    price: "From ₹4/unit",
    desc: "Single-material construction — fully recyclable in standard plastic recycling streams. EPR compliant. Available as flat pouch, stand-up, or courier bag.",
  },
  {
    name: "Paper Bubble Mailer",
    certs: ["No Plastic", "Water Resistant", "Kerbside Recyclable"],
    moq: "200 units",
    price: "From ₹18/unit",
    desc: "Honeycomb kraft paper cushioning replaces plastic bubble wrap entirely. Water-resistant outer coating. 100% kerbside recyclable. Printable exterior.",
  },
  {
    name: "Moulded Pulp Insert",
    certs: ["100% Recycled", "Compostable", "Biodegradable"],
    moq: "500 units",
    price: "From ₹8/unit",
    desc: "Moulded from recycled newsprint and cardboard. Custom shapes available. Replaces expanded polystyrene inserts. Food-safe and export-certified.",
  },
  {
    name: "Seed Paper Swing Tag",
    certs: ["Plantable", "Recycled", "Chemical Free"],
    moq: "1,000 units",
    price: "From ₹3/unit",
    desc: "Handmade from post-consumer waste embedded with wildflower seeds. Soy-based ink printing. Fully plantable after use. For premium brand unboxing.",
  },
  {
    name: "Natural Jute Bag",
    certs: ["100% Natural", "Biodegradable", "Reusable"],
    moq: "100 units",
    price: "From ₹35/unit",
    desc: "Natural jute with cotton lining. Screen printed or sublimation printed with your brand. Fully reusable and biodegradable. Popular for gifting and retail.",
  },
  {
    name: "Compostable Zipper Pouch",
    certs: ["TUV Certified", "Resealable", "Food Safe"],
    moq: "500 units",
    price: "From ₹9/unit",
    desc: "Certified compostable film with resealable zipper. Food-safe barrier layer. For coffee, tea, health supplements, and premium food brands.",
  },
  {
    name: "Glass-Coated Paper Wrapper",
    certs: ["Recyclable", "Moisture Resistant", "Printed"],
    moq: "2,000 units",
    price: "From ₹2/unit",
    desc: "Glass-coated outer with moisture barrier. Recyclable in standard paper streams. High-quality flexographic printing for FMCG and snack wrapping.",
  },
  {
    name: "EPR-Compliant Shrink Film",
    certs: ["EPR Compliant", "Tamper Evident", "Recyclable"],
    moq: "1,000 units",
    price: "From ₹1.5/unit",
    desc: "Mono-layer PE shrink film — recyclable and EPR compliant. Tamper-evident on bottles, jars, and bundles. For FMCG, pharma, and F&B brands.",
  },
];

const STATS = [
  { num: "12", label: "Certified sustainable SKUs" },
  { num: "100%", label: "EPR documentation included" },
  { num: "6", label: "Global certifications held" },
  { num: "200", label: "Min. order quantity" },
];

const CERTS = [
  "ISO 9001:2015",
  "FSSC 22000",
  "BRC Packaging",
  "US FDA Compliant",
  "FSC Certified",
  "TUV Austria Compostable",
];

const EPR_POINTS = [
  {
    Icon: FileCheck,
    heading: "Producer Registration",
    body: "We handle your CPCB producer registration for extended producer responsibility across all plastic packaging categories.",
  },
  {
    Icon: Recycle,
    heading: "Tonnage Calculation",
    body: "Our compliance team calculates your annual plastic tonnage obligations and maps it against your product portfolio.",
  },
  {
    Icon: ShieldCheck,
    heading: "Documentation Package",
    body: "Every order includes full EPR documentation — material declarations, recycled content certificates, and compostability certifications.",
  },
  {
    Icon: Globe,
    heading: "Annual Compliance Report",
    body: "Annual summary report covering all your packaging usage, EPR liability, and offsetting certifications — ready for submission.",
  },
];

const WHY_ITEMS = [
  { Icon: Leaf, heading: "Custom brand printing", body: "All 12 sustainable SKUs available with full custom print — your logo, colours, and brand exactly as designed." },
  { Icon: ShieldCheck, heading: "Certified materials only", body: "Every SKU in our sustainable range uses verified certified material — no greenwashing, no shortcuts." },
  { Icon: Droplets, heading: "Food-grade & leak-proof", body: "Suitable for food, pharma, and cosmetics. All materials comply with FSSAI and food-contact safety standards." },
  { Icon: FileCheck, heading: "EPR docs with every order", body: "Compliance documentation bundled in — no chasing for certificates. Ready for ESG and regulatory reporting." },
];

export default function Sustainable() {
  return (
    <div>
      {/* ── Hero ─────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden"
        style={{ background: "linear-gradient(150deg, #052e16 0%, #064e3b 55%, #0a3528 100%)", padding: "96px 0 80px" }}
      >
        {/* Subtle radial highlight */}
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: "radial-gradient(ellipse 70% 60% at 65% 40%, rgba(134,239,172,0.06) 0%, transparent 65%)" }} />
        {/* Dot grid */}
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: "radial-gradient(circle, rgba(134,239,172,0.12) 1px, transparent 1px)",
          backgroundSize: "36px 36px",
          opacity: 0.4,
        }} />

        <div className="relative z-10 text-center" style={{ maxWidth: 760, margin: "0 auto", padding: "0 32px" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 7,
            background: "rgba(134,239,172,0.12)", border: "1px solid rgba(134,239,172,0.25)",
            borderRadius: 999, padding: "6px 16px", marginBottom: 28,
          }}>
            <Leaf size={13} color="#86EFAC" />
            <span style={{ color: "#86EFAC", fontSize: 11, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase" }}>
              Sustainable Packaging
            </span>
          </div>

          <h1 className="clash-display" style={{ color: "white", fontSize: "clamp(2.2rem, 5.5vw, 3.75rem)", lineHeight: 1.08, marginBottom: 22 }}>
            Eco packaging that performs.<br />
            <span style={{ color: "#86EFAC" }}>EPR compliant.</span> FSC certified.
          </h1>

          <p style={{ color: "rgba(255,255,255,0.72)", fontSize: 18, lineHeight: 1.65, maxWidth: 580, margin: "0 auto 40px" }}>
            12 certified sustainable SKUs — fully customisable with your brand. Food-safe, leak-proof, and built for India's EPR compliance requirements.
          </p>

          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/quote">
              <button className="btn-fill btn-amber px-10 py-4 text-base">
                <span>Get a Free Quote →</span>
              </button>
            </Link>
            <Link href="/samples">
              <button className="btn-fill btn-outline-white px-10 py-4 text-base">
                <span>Order a Sample</span>
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Stats bar ─────────────────────────────────────── */}
      <section style={{ background: "#064e3b", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ maxWidth: 960, margin: "0 auto", padding: "0 32px", display: "grid", gridTemplateColumns: "repeat(4, 1fr)" }} className="grid-cols-2 sm:grid-cols-4">
          {STATS.map((s, i) => (
            <div key={i} style={{ padding: "28px 24px", textAlign: "center", borderRight: i < STATS.length - 1 ? "1px solid rgba(255,255,255,0.07)" : "none" }}>
              <div style={{ color: "#86EFAC", fontSize: "clamp(1.8rem, 4vw, 2.5rem)", fontWeight: 900, lineHeight: 1 }}>{s.num}</div>
              <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, fontWeight: 500, marginTop: 6 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Why Packworkz for sustainable ─────────────────── */}
      <section style={{ background: "#052e16", padding: "80px 32px" }}>
        <div style={{ maxWidth: 1080, margin: "0 auto" }}>
          <div style={{ textAlign: "center", maxWidth: 560, margin: "0 auto 56px" }}>
            <p style={{ color: "#86EFAC", fontSize: 11, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 12 }}>WHY PACKWORKZ</p>
            <h2 className="clash-display" style={{ color: "white", fontSize: "clamp(1.6rem, 3vw, 2.5rem)", lineHeight: 1.15 }}>
              Sustainable packaging without the compromise.
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20 }}>
            {WHY_ITEMS.map((item) => (
              <div key={item.heading} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(134,239,172,0.15)", borderRadius: 14, padding: "28px 24px" }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 10,
                  background: "rgba(134,239,172,0.1)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16,
                }}>
                  <item.Icon size={20} color="#86EFAC" />
                </div>
                <h3 style={{ color: "white", fontSize: 15, fontWeight: 700, marginBottom: 8 }}>{item.heading}</h3>
                <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 14, lineHeight: 1.65 }}>{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SKU Grid ──────────────────────────────────────── */}
      <section style={{ background: "#063d2e", padding: "88px 32px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 16, marginBottom: 48 }}>
            <div>
              <p style={{ color: "#86EFAC", fontSize: 11, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 10 }}>ALL 12 SUSTAINABLE SKUs</p>
              <h2 className="clash-display" style={{ color: "white", fontSize: "clamp(1.6rem, 3vw, 2.5rem)", lineHeight: 1.15 }}>
                Every SKU. Fully customisable.
              </h2>
            </div>
            <Link href="/quote">
              <button className="btn-fill btn-amber px-8 py-3 text-sm">
                <span>Get Pricing →</span>
              </button>
            </Link>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(310px, 1fr))", gap: 16 }}>
            {SKUs.map((sku) => (
              <div key={sku.name} style={{
                background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)",
                borderRadius: 14, padding: "24px", transition: "transform 0.2s, border-color 0.2s",
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(-3px)"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(134,239,172,0.3)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.09)"; }}
              >
                <h3 style={{ color: "white", fontWeight: 700, fontSize: 16, marginBottom: 10 }}>{sku.name}</h3>
                <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, lineHeight: 1.7, marginBottom: 14 }}>{sku.desc}</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>
                  {sku.certs.map((c) => (
                    <span key={c} style={{
                      background: "rgba(134,239,172,0.1)", color: "#86EFAC",
                      border: "1px solid rgba(134,239,172,0.2)",
                      padding: "3px 10px", borderRadius: 999, fontSize: 11, fontWeight: 700,
                    }}>{c}</span>
                  ))}
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 12, borderTop: "1px solid rgba(255,255,255,0.07)" }}>
                  <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, fontWeight: 600 }}>MOQ: {sku.moq}</span>
                  <span style={{ color: "#E8A838", fontWeight: 800, fontSize: 14 }}>{sku.price}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Certifications ────────────────────────────────── */}
      <section style={{ background: "#052e16", padding: "72px 32px", textAlign: "center" }}>
        <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 11, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 24 }}>
          CERTIFIED ACROSS EVERY GLOBAL STANDARD
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 10, maxWidth: 800, margin: "0 auto 16px" }}>
          {CERTS.map((c) => (
            <span key={c} style={{
              background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.14)",
              borderRadius: 999, padding: "10px 22px", color: "white", fontSize: 13, fontWeight: 600,
            }}>{c}</span>
          ))}
        </div>
        <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 12 }}>
          Certification documentation provided with every order for your ESG and compliance reporting.
        </p>
      </section>

      {/* ── EPR Compliance ────────────────────────────────── */}
      <section style={{ background: "#064e3b", padding: "88px 32px" }}>
        <div style={{ maxWidth: 1080, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "start" }} className="grid grid-cols-1 md:grid-cols-2">
            {/* Left — heading */}
            <div>
              <p style={{ color: "#86EFAC", fontSize: 11, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 14 }}>EPR COMPLIANCE</p>
              <h2 className="clash-display" style={{ color: "white", fontSize: "clamp(1.8rem, 3.5vw, 2.75rem)", lineHeight: 1.1, marginBottom: 18 }}>
                India's EPR mandate is here.<br />We handle it for you.
              </h2>
              <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 16, lineHeight: 1.7, marginBottom: 32 }}>
                From April 2024, all producers, importers, and brand owners must comply with India's Extended Producer Responsibility regulations. We make it simple — documentation, registration, and annual reporting, all included.
              </p>
              <Link href="/quote">
                <button className="btn-fill btn-amber px-9 py-4 text-base">
                  <span>Talk to our compliance team →</span>
                </button>
              </Link>
            </div>

            {/* Right — 4 points */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {EPR_POINTS.map((pt) => (
                <div key={pt.heading} style={{
                  background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
                  borderLeft: "3px solid #86EFAC", borderRadius: "0 12px 12px 0",
                  padding: "20px 22px", display: "flex", gap: 16, alignItems: "flex-start",
                }}>
                  <div style={{ width: 36, height: 36, borderRadius: 8, background: "rgba(134,239,172,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <pt.Icon size={16} color="#86EFAC" />
                  </div>
                  <div>
                    <h3 style={{ color: "white", fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{pt.heading}</h3>
                    <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, lineHeight: 1.65 }}>{pt.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Final CTA ─────────────────────────────────────── */}
      <section
        className="relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #052e16 0%, #063d2e 60%, #064e3b 100%)", padding: "112px 32px", textAlign: "center" }}
      >
        {/* Box grid */}
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Crect x='0.5' y='0.5' width='59' height='59' rx='3' fill='none' stroke='white' stroke-opacity='0.04'/%3E%3C/svg%3E")`,
          backgroundSize: "60px 60px",
        }} />
        <div className="absolute inset-0 pointer-events-none" style={{
          background: "radial-gradient(ellipse 70% 55% at 50% 100%, rgba(134,239,172,0.12) 0%, transparent 70%)",
        }} />

        <div className="relative" style={{ zIndex: 1, maxWidth: 600, margin: "0 auto" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 7,
            background: "rgba(134,239,172,0.12)", border: "1px solid rgba(134,239,172,0.25)",
            borderRadius: 999, padding: "6px 16px", marginBottom: 24,
          }}>
            <Leaf size={12} color="#86EFAC" />
            <span style={{ color: "#86EFAC", fontSize: 11, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase" }}>READY TO GO GREEN</span>
          </div>

          <h2 className="clash-display" style={{ color: "white", fontSize: "clamp(2rem, 4.5vw, 3.25rem)", lineHeight: 1.1, marginBottom: 18 }}>
            Ready to go sustainable?
          </h2>
          <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 17, lineHeight: 1.65, marginBottom: 40 }}>
            Get a free quote on any of our 12 certified sustainable SKUs. Minimum order from 100 units. EPR documentation included with every order.
          </p>

          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/quote">
              <button className="btn-fill btn-amber px-10 py-4 text-base">
                <span>Get a Free Quote →</span>
              </button>
            </Link>
            <a
              href={`https://wa.me/${WHATSAPP_NUM}?text=Hi%20Packworkz%2C%20I%27d%20like%20to%20discuss%20sustainable%20packaging.`}
              target="_blank" rel="noopener noreferrer"
            >
              <button className="btn-fill btn-outline-white px-10 py-4 text-base">
                <span>WhatsApp us</span>
              </button>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
