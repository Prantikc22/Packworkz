import { Link } from "wouter";

const SKUs = [
  {
    name: "Kraft Stand-Up Pouch",
    certs: ["FSC Certified", "Food Safe", "Leak Proof"],
    moq: "500 units",
    price: "From ₹6.50/unit",
    desc: "FSC certified kraft outer with food-safe inner liner. Leak-proof seal. Available with resealable zipper. Ideal for spices, dry food, snacks, and Indian grocery.",
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
    desc: "Single-material construction — fully recyclable in standard plastic recycling streams. EPR compliant. Available as flat pouch, stand-up, or courier bag format.",
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
    desc: "Handmade from post-consumer waste embedded with wildflower seeds. Printable with soy-based inks. Fully plantable after use. For premium brand unboxing.",
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
    certs:["TUV Certified", "Resealable", "Food Safe"],
    moq: "500 units",
    price: "From ₹9/unit",
    desc: "Certified compostable film with resealable zipper. Food-safe barrier layer. For coffee, tea, health supplements, and premium food brands targeting the sustainability segment.",
  },
  {
    name: "Glass-Coated Paper Wrapper",
    certs: ["Recyclable", "Moisture Resistant", "Printed"],
    moq: "2,000 units",
    price: "From ₹2/unit",
    desc: "Glass-coated outer with moisture barrier. Recyclable in standard paper streams. High-quality flexographic printing. For FMCG and snack wrapping applications.",
  },
  {
    name: "EPR-Compliant Shrink Film",
    certs: ["EPR Compliant", "Tamper Evident", "Recyclable"],
    moq: "1,000 units",
    price: "From ₹1.5/unit",
    desc: "Mono-layer PE shrink film — recyclable and EPR compliant. Tamper-evident on bottles, jars, and bundles. For FMCG, pharma, and F&B brands navigating EPR mandates.",
  },
];

const CERTS = ["ISO 9001:2015", "FSSC 22000", "BRC Packaging", "US FDA Compliant", "FSC Certified", "TUV Austria Compostable"];

const EPR_POINTS = [
  { heading: "Producer Registration", body: "We handle your CPCB producer registration for extended producer responsibility across all plastic packaging categories." },
  { heading: "Tonnage Calculation", body: "Our compliance team calculates your annual plastic tonnage obligations and maps it against your product portfolio." },
  { heading: "Documentation Package", body: "Every order includes full EPR documentation — material declarations, recycled content certificates, and compostability certifications." },
  { heading: "Annual Compliance Report", body: "Annual summary report covering all your packaging usage, EPR liability, and offsetting certifications — ready for submission." },
];

export default function Sustainable() {
  return (
    <div>
      {/* Hero */}
      <section className="py-28 px-8 md:px-20 text-center relative overflow-hidden" style={{ background: "linear-gradient(150deg, #052e16 0%, #064e3b 50%, #0d3b2e 100%)" }}>
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: "radial-gradient(circle at 70% 50%, rgba(134,239,172,0.04) 0%, transparent 60%)" }} />
        <div className="relative z-10 max-w-4xl mx-auto">
          <p className="font-bold tracking-[0.25em] text-xs uppercase mb-6" style={{ color: "#86EFAC" }}>
            SUSTAINABLE PACKAGING
          </p>
          <h1 className="clash-display text-white mb-6" style={{ fontSize: "clamp(2.5rem,6vw,4.5rem)", lineHeight: 1.1 }}>
            Sustainable packaging manufacturer India — EPR compliant, FSC certified.
          </h1>
          <p className="text-lg mb-12 mx-auto" style={{ color: "rgba(255,255,255,0.75)", maxWidth: 600 }}>
            12 certified sustainable SKUs. All fully customisable with your brand design. Food-safe, leak-proof, EPR compliant, and built for Indian manufacturing conditions.
          </p>
          <Link href="/quote">
            <button className="px-10 py-4 rounded-lg font-bold text-lg hover:brightness-110 transition-all" style={{ background: "#E8A838", color: "#0D1B2A" }}>
              Get a Quote
            </button>
          </Link>
        </div>
      </section>

      {/* What's included */}
      <section className="py-14 px-8 md:px-20 text-center" style={{ background: "#064e3b" }}>
        <div className="max-w-5xl mx-auto flex flex-wrap justify-center gap-8">
          {["Custom brand printing", "Food grade certified", "EPR documentation included", "Leak proof tested", "Certified sustainable materials", "Indian manufacturer verified"].map((item) => (
            <div key={item} className="flex items-center gap-2 text-sm font-bold" style={{ color: "#86EFAC" }}>
              <span style={{ fontSize: 18 }}>✓</span>
              {item}
            </div>
          ))}
        </div>
      </section>

      {/* SKU Grid */}
      <section className="py-24 px-8 md:px-20" style={{ background: "#0D3B2E" }}>
        <div className="max-w-7xl mx-auto">
          <p className="font-bold tracking-[0.25em] text-xs uppercase mb-4" style={{ color: "#86EFAC" }}>ALL 12 SUSTAINABLE SKUs</p>
          <h2 className="clash-display text-white mb-14" style={{ fontSize: "clamp(1.8rem,3.5vw,2.75rem)", lineHeight: 1.1 }}>
            Every SKU. Fully customisable.
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {SKUs.map((sku) => (
              <div key={sku.name} className="rounded-xl p-6 hover:-translate-y-1 transition-transform" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}>
                <h3 className="font-bold text-white text-lg mb-2">{sku.name}</h3>
                <p className="text-sm mb-4 leading-relaxed" style={{ color: "rgba(255,255,255,0.65)", lineHeight: 1.7 }}>{sku.desc}</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {sku.certs.map((c) => (
                    <span key={c} className="px-2.5 py-1 rounded-full text-xs font-bold" style={{ background: "rgba(134,239,172,0.12)", color: "#86EFAC" }}>{c}</span>
                  ))}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold" style={{ color: "rgba(255,255,255,0.4)" }}>MOQ: {sku.moq}</span>
                  <span className="font-bold text-sm" style={{ color: "#E8A838" }}>{sku.price}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Certifications */}
      <section className="py-16 px-8 text-center" style={{ background: "#064e3b" }}>
        <p className="font-bold tracking-[0.25em] text-xs uppercase mb-6" style={{ color: "rgba(255,255,255,0.6)" }}>
          CERTIFIED ACROSS EVERY GLOBAL STANDARD
        </p>
        <div className="flex flex-wrap justify-center gap-4 mb-4">
          {CERTS.map((c) => (
            <span key={c} className="font-bold" style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 999, padding: "10px 20px", color: "white", fontSize: 13 }}>{c}</span>
          ))}
        </div>
        <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 12 }}>Certification documentation provided with every order for your ESG and compliance reporting.</p>
      </section>

      {/* EPR Compliance */}
      <section className="py-24 px-8 md:px-20" style={{ background: "#052e16" }}>
        <div className="max-w-7xl mx-auto">
          <p className="font-bold tracking-[0.25em] text-xs uppercase mb-4" style={{ color: "#86EFAC" }}>EPR COMPLIANCE</p>
          <h2 className="clash-display text-white mb-4" style={{ fontSize: "clamp(1.8rem,3.5vw,2.75rem)", lineHeight: 1.1 }}>
            India's EPR mandate is here.<br />We handle it for you.
          </h2>
          <p className="mb-14" style={{ color: "rgba(255,255,255,0.65)", fontSize: 16, maxWidth: 580 }}>
            From April 2024, all producers, importers, and brand owners are required to comply with India's Extended Producer Responsibility regulations. We make it simple.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {EPR_POINTS.map((pt) => (
              <div key={pt.heading} className="rounded-xl p-6" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderLeft: "3px solid #86EFAC" }}>
                <h3 className="font-bold text-white text-base mb-2">{pt.heading}</h3>
                <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 14, lineHeight: 1.7 }}>{pt.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-8 md:px-20 text-center" style={{ background: "linear-gradient(135deg, #052e16 0%, #064e3b 100%)" }}>
        <div className="max-w-3xl mx-auto">
          <h2 className="clash-display text-white mb-6" style={{ fontSize: "clamp(2rem,4vw,3.25rem)", lineHeight: 1.1 }}>
            Ready to go sustainable?
          </h2>
          <p className="mb-8 text-lg" style={{ color: "rgba(255,255,255,0.7)" }}>
            Get a free quote on any of our 12 certified sustainable SKUs. Minimum order from 100 units.
          </p>
          <Link href="/quote">
            <button className="px-12 py-4 rounded-lg font-bold text-lg hover:brightness-110 transition-all" style={{ background: "#E8A838", color: "#0D1B2A" }}>
              Get a Free Quote →
            </button>
          </Link>
        </div>
      </section>
    </div>
  );
}
