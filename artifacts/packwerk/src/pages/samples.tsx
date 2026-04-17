import { Link } from "wouter";

const MS = ({ icon, className = "", style }: { icon: string; className?: string; style?: React.CSSProperties }) => (
  <span className={`material-symbols-outlined ${className}`} style={style}>{icon}</span>
);
const MsFilled = ({ icon, className = "", style }: { icon: string; className?: string; style?: React.CSSProperties }) => (
  <span className={`material-symbols-outlined ms-filled ${className}`} style={style}>{icon}</span>
);

const TIERS = [
  {
    name: "Standard",
    price: "₹2,999",
    sub: "per unit",
    badge: null,
    badgeColor: "",
    covered: "Corrugated Boxes, Mailers, Paper Bags",
    best: "Structural testing, sizing validation",
    turnaround: "48–72 hours",
    cta: "CHOOSE STANDARD",
    dark: false,
    features: [
      "Unprinted physical sample",
      "Exact size and structure",
      "Standard corrugated / paper materials",
      "No print proof included",
    ],
  },
  {
    name: "Premium",
    price: "₹4,999",
    sub: "per unit",
    badge: "OFTEN REQUESTED",
    badgeColor: "#E8A838",
    covered: "Rigid Boxes, UV Spot, Premium Lamination, Foil Stamping",
    best: "Luxury brands, high-fidelity finish check",
    turnaround: "4–5 Working Days",
    cta: "CHOOSE PREMIUM",
    dark: true,
    features: [
      "Digitally printed with your artwork",
      "Exact size and structure",
      "Premium materials & finishes",
      "Spot UV, foil, or emboss available",
    ],
  },
  {
    name: "Complex",
    price: "₹7,999",
    sub: "per unit",
    badge: null,
    badgeColor: "",
    covered: "Custom inserts, Multi-component, Fold electronics",
    best: "Unboxing experience, multi-assembly packaging",
    turnaround: "7–10 Working Days",
    cta: "CHOOSE COMPLEX",
    dark: false,
    features: [
      "Fully customized structure",
      "Offset printed with your artwork",
      "All specialized finishes (foil, spot UV)",
      "3D structural dieline included",
    ],
  },
];

export default function Samples() {
  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

      {/* ── HERO ─────────────────────────────────── */}
      <section className="relative min-h-[65vh] flex flex-col justify-center px-8 md:px-20 overflow-hidden"
        style={{ background: "linear-gradient(135deg, #0D1B2A 0%, #0F1C2C 100%)" }}>
        <div className="absolute inset-0 opacity-30">
          <img src="https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=1400&h=700&fit=crop&q=60"
            alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0" style={{ background: "rgba(13,27,42,0.85)" }} />
        </div>
        <div className="relative z-10 max-w-3xl py-24">
          <p className="font-bold tracking-[0.25em] text-xs uppercase mb-6" style={{ color: "#1B6CA8" }}>PHYSICAL VALIDATION</p>
          <h1 className="clash-display text-white mb-6" style={{ fontSize: "clamp(2.5rem,6vw,4.5rem)", lineHeight: 1.05 }}>
            See it. Touch it.<br />Approve it.<br />Then order.
          </h1>
          <p className="text-slate-300 text-lg mb-3 max-w-xl leading-relaxed">
            Don&rsquo;t leave your brand to chance. Order a custom sample of your production-ready packaging.{" "}
            <span className="font-bold underline decoration-[#E8A838]" style={{ color: "#E8A838" }}>The sampling fee is fully adjusted against your main production order.</span>
          </p>
          <div className="mt-10">
            <Link href="/products">
              <button className="flex items-center gap-3 px-8 py-4 rounded font-bold uppercase tracking-wide text-sm hover:opacity-90 active:scale-95 transition-all" style={{ background: "#E8A838", color: "#0F1C2C" }}>
                BROWSE PRODUCTS TO SAMPLE
                <span className="material-symbols-outlined text-lg">arrow_forward</span>
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── LIFECYCLE ────────────────────────────── */}
      <section className="py-20 px-8 md:px-20 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold mb-2" style={{ color: "#0D1B2A", fontFamily: "'Space Grotesk', sans-serif" }}>
            The Sampling Lifecycle
          </h2>
          <div className="w-12 h-0.5 mb-12" style={{ background: "#E8A838" }} />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { n: "01", nColor: "#0D1B2A", title: "Find", desc: "Choose from our catalog of structured boxes, mailers, or rigid packaging. Upload your artwork or specify dimensions.", cta: "→ SEARCH CATALOG", href: "/products" },
              { n: "02", nColor: "#E8A838", title: "Order", desc: "Select your tier and checkout. Our engineers review your files for structural integrity before manufacturing the unit.", cta: "→ INSTANT CHECKOUT", href: "/quote" },
              { n: "03", nColor: "#0D1B2A", title: "Approve", desc: "Receive your physical sample. If you&rsquo;re happy, hit 'Produce' in your dashboard. The sample cost is deducted from the total.", cta: "→ FINAL PRODUCTION", href: "/dashboard" },
            ].map(step => (
              <div key={step.n}>
                <div className="w-10 h-10 rounded flex items-center justify-center font-bold text-white mb-5 text-sm" style={{ background: step.nColor, fontFamily: "'Manrope', sans-serif" }}>{step.n}</div>
                <h3 className="text-xl font-bold mb-3" style={{ color: "#0D1B2A" }}>{step.title}</h3>
                <p className="text-sm leading-relaxed mb-4" style={{ color: "#44474c" }} dangerouslySetInnerHTML={{ __html: step.desc }} />
                <Link href={step.href}>
                  <span className="text-xs font-bold uppercase tracking-wider cursor-pointer hover:underline" style={{ color: "#1B6CA8" }}>{step.cta}</span>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TIERS ────────────────────────────────── */}
      <section className="py-20 px-8 md:px-20" style={{ background: "#F2F3F6" }}>
        <div className="max-w-6xl mx-auto">
          <h2 className="clash-display text-4xl text-center mb-3" style={{ color: "#0D1B2A" }}>Precision Sampling Tiers</h2>
          <p className="text-center mb-16" style={{ color: "#44474c" }}>Select the level of fidelity required for your brand validation.</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TIERS.map(tier => (
              <div
                key={tier.name}
                className="rounded-lg p-8 relative overflow-hidden flex flex-col"
                style={tier.dark
                  ? { background: "#0D1B2A", border: "2px solid #1B6CA8" }
                  : { background: "white", border: "1px solid #E7E8EB" }}
              >
                {tier.badge && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-px px-5 py-1.5 rounded-b text-xs font-bold uppercase tracking-widest"
                    style={{ background: tier.badgeColor, color: "#0F1C2C" }}>
                    {tier.badge}
                  </div>
                )}
                <div className={`mb-6 ${tier.badge ? "pt-4" : ""}`}>
                  <h3 className="text-2xl font-bold mb-1" style={{ color: tier.dark ? "white" : "#0D1B2A" }}>{tier.name}</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black" style={{ fontFamily: "'Manrope', sans-serif", color: tier.dark ? "#E8A838" : "#1B6CA8" }}>{tier.price}</span>
                    <span className="text-sm" style={{ color: tier.dark ? "rgba(255,255,255,0.5)" : "#74777d" }}>{tier.sub}</span>
                  </div>
                </div>

                <div className="space-y-3 mb-6 flex-1">
                  <div className="rounded p-3" style={{ background: tier.dark ? "rgba(255,255,255,0.07)" : "#F2F3F6" }}>
                    <p className="text-xs font-bold uppercase mb-1" style={{ color: tier.dark ? "#E8A838" : "#1B6CA8" }}>COVERED SKUs</p>
                    <p className="text-sm" style={{ color: tier.dark ? "rgba(255,255,255,0.7)" : "#44474c" }}>{tier.covered}</p>
                  </div>
                  <div className="rounded p-3" style={{ background: tier.dark ? "rgba(255,255,255,0.07)" : "#F2F3F6" }}>
                    <p className="text-xs font-bold uppercase mb-1" style={{ color: tier.dark ? "#E8A838" : "#1B6CA8" }}>BEST FOR</p>
                    <p className="text-sm" style={{ color: tier.dark ? "rgba(255,255,255,0.7)" : "#44474c" }}>{tier.best}</p>
                  </div>
                  {tier.features.map(f => (
                    <div key={f} className="flex items-start gap-2">
                      <MsFilled icon="check_circle" className="text-base shrink-0 mt-0.5" style={{ color: tier.dark ? "#1B6CA8" : "#22C55E" }} />
                      <span className="text-sm" style={{ color: tier.dark ? "rgba(255,255,255,0.7)" : "#44474c" }}>{f}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-4">
                  <p className="text-xs uppercase tracking-widest mb-4 font-bold" style={{ color: tier.dark ? "rgba(255,255,255,0.4)" : "#74777d" }}>
                    TURNAROUND: {tier.turnaround}
                  </p>
                  <Link href="/products">
                    <button
                      className="w-full py-3.5 rounded font-bold text-sm uppercase tracking-wide hover:opacity-90 active:scale-95 transition-all"
                      style={tier.dark
                        ? { background: "#E8A838", color: "#0F1C2C" }
                        : { background: "#0D1B2A", color: "white" }}
                    >
                      {tier.cta}
                    </button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── COMMODITY NOTE ───────────────────────── */}
      <section className="py-16 px-8 md:px-20 bg-white">
        <div className="max-w-4xl mx-auto border border-slate-200 rounded-lg p-8 flex gap-6 items-start">
          <div className="w-12 h-12 rounded flex items-center justify-center shrink-0" style={{ background: "#F2F3F6" }}>
            <MS icon="info" className="text-2xl" style={{ color: "#1B6CA8" }} />
          </div>
          <div>
            <h3 className="font-bold text-lg mb-2" style={{ color: "#0D1B2A" }}>Commodity SKU Policy</h3>
            <p className="text-sm leading-relaxed mb-3" style={{ color: "#44474c" }}>
              Standard commodity items such as <strong>bubble wrap, packaging tape, honeycomb paper,</strong> and <strong>stretch film</strong> do not require physical samples. We offer generic swatches or technical data sheets for these materials free of charge on request.
            </p>
            <button className="text-sm font-bold hover:underline flex items-center gap-1" style={{ color: "#1B6CA8" }}>
              <MS icon="download" className="text-base" /> Get Data Sheets
            </button>
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────── */}
      <section className="py-20 px-8 text-center" style={{ background: "#0D1B2A" }}>
        <h2 className="clash-display text-white text-4xl mb-6">Ready to touch your brand?</h2>
        <Link href="/products">
          <button className="flex items-center gap-3 px-10 py-5 rounded font-bold uppercase tracking-wide text-base hover:opacity-90 active:scale-95 transition-all mx-auto" style={{ background: "#E8A838", color: "#0F1C2C" }}>
            BROWSE PRODUCTS TO SAMPLE <span className="material-symbols-outlined">arrow_forward</span>
          </button>
        </Link>
      </section>
    </div>
  );
}
