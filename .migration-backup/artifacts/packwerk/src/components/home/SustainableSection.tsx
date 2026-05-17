import { Link } from "wouter";

const ECO_SKUS = [
  {
    name: "Kraft Stand-Up Pouch",
    body: "FSC certified kraft outer with food-safe inner liner. Leak-proof seal — carries spices, dry food, snacks, and Indian grocery products without any seepage. Available with resealable zipper.",
    badges: ["Food Safe", "Leak Proof", "Recyclable", "Customisable"],
    price: "From ₹6.50/unit",
  },
  {
    name: "Compostable Courier Bag",
    body: "TUV Austria certified compostable. Water-resistant outer surface. Tamper-evident adhesive seal. For D2C brands whose packaging needs to match their sustainability story.",
    badges: ["Water Resistant", "Tamper Evident", "Compostable"],
    price: "From ₹12/unit",
  },
  {
    name: "Bagasse Food Tray",
    body: "100% sugarcane waste. Microwave safe up to 5 minutes. Oil and water resistant — no leaking, no sogging, even with gravies and curries. Ideal for QSR and cloud kitchens.",
    badges: ["Microwave Safe", "Oil Resistant", "Leak Proof"],
    price: "From ₹5/unit",
  },
  {
    name: "Recycled Corrugated Box",
    body: "80-100% recycled board content. FSC certified. Full exterior print surface for brand experience. Same structural strength as virgin board. For e-commerce and export shipping.",
    badges: ["FSC Certified", "Full Printable", "Export Grade"],
    price: "From ₹22/unit",
  },
  {
    name: "Mono-material PE Pouch",
    body: "Single-material construction — fully recyclable in standard plastic recycling streams. EPR compliant. Available as flat pouch, stand-up, or courier bag format. Printable with your brand design.",
    badges: ["EPR Compliant", "Fully Recyclable", "Customisable"],
    price: "From ₹4/unit",
  },
  {
    name: "Paper Bubble Mailer",
    body: "Honeycomb kraft paper cushioning replaces plastic bubble wrap entirely. Water-resistant outer coating. 100% kerbside recyclable. Printable exterior for unboxing brand experience.",
    badges: ["Water Resistant", "No Plastic", "Fully Printable"],
    price: "From ₹18/unit",
  },
];

const INCLUDES = [
  ["Food grade certified", "Leak proof tested"],
  ["Custom brand printing", "EPR documentation"],
  ["D2C and FMCG scale MOQs", "Indian manufacturer verified"],
];

export default function SustainableSection() {
  return (
    <section className="py-24 px-8 md:px-20" style={{ background: "#0D3B2E" }}>
      <div className="max-w-7xl mx-auto">
        <p className="font-bold tracking-[0.25em] text-xs uppercase mb-5" style={{ color: "#86EFAC" }}>
          SUSTAINABLE PACKAGING
        </p>
        <h2 className="clash-display text-white mb-4" style={{ fontSize: "clamp(2rem,4vw,3.25rem)", lineHeight: 1.1 }}>
          The future of packaging<br />is already here.
        </h2>
        <p className="text-white italic mb-14" style={{ fontSize: 16, maxWidth: 600, opacity: 0.8 }}>
          Every sustainable SKU is fully customisable with your brand design — colours, logo, artwork, finishes. Food-safe. Leak-proof. Built for Indian conditions.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
          {ECO_SKUS.map((sku) => (
            <div key={sku.name} className="rounded-xl p-5" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)" }}>
              <h3 className="font-bold text-white text-lg mb-2">{sku.name}</h3>
              <p className="text-sm mb-4 leading-relaxed" style={{ color: "rgba(255,255,255,0.75)" }}>{sku.body}</p>
              <div className="flex flex-wrap gap-2 mb-4">
                {sku.badges.map((b) => (
                  <span key={b} className="px-2.5 py-1 rounded-full text-xs font-bold" style={{ background: "rgba(134,239,172,0.15)", color: "#86EFAC" }}>{b}</span>
                ))}
              </div>
              <p className="font-bold text-sm" style={{ color: "#86EFAC" }}>{sku.price}</p>
            </div>
          ))}
        </div>

        {/* Info card */}
        <div className="rounded-xl p-6 mb-10 flex flex-col md:flex-row gap-8 items-start" style={{ background: "rgba(255,255,255,0.05)" }}>
          <p className="text-white font-bold text-sm shrink-0">All sustainable packaging includes:</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 flex-1">
            {INCLUDES.map((col, ci) => (
              <ul key={ci} className="space-y-1.5">
                {col.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm" style={{ color: "rgba(255,255,255,0.85)" }}>
                    <span style={{ color: "#86EFAC", fontWeight: 700 }}>✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            ))}
          </div>
        </div>

        <div className="text-center">
          <Link href="/sustainable">
            <button className="px-10 py-4 rounded-lg font-bold text-lg hover:brightness-110 transition-all mb-3" style={{ background: "#E8A838", color: "#0D1B2A" }}>
              See all 12 sustainable SKUs →
            </button>
          </Link>
          <p className="text-sm mt-2" style={{ color: "rgba(255,255,255,0.55)" }}>
            Full certification documentation included with every order for your ESG reporting.
          </p>
        </div>
      </div>
    </section>
  );
}
