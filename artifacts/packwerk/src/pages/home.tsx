import { useState } from "react";
import { Link } from "wouter";
import { formatINR } from "@/lib/format";
import { INDUSTRY_IMAGES } from "@/lib/images";

interface IconProps {
  icon: string;
  className?: string;
  style?: React.CSSProperties;
}
const MS = ({ icon, className = "", style }: IconProps) => (
  <span className={`material-symbols-outlined ${className}`} style={style}>{icon}</span>
);
const MsFilled = ({ icon, className = "", style }: IconProps) => (
  <span className={`material-symbols-outlined ms-filled ${className}`} style={style}>{icon}</span>
);

const MARQUEE_1 = Array(8).fill("We are not a vendor. We are your packaging partner.");
const MARQUEE_2 = ["We are not a vendor. We are your packaging partner.", "Precision Engineered Supply Chain"].flatMap(t => [t, t, t, t]);

const PAIN_POINTS = [
  { icon: "schedule", title: "Delays & Stock-outs", desc: "Missed deadlines lead to stock-outs and lost revenue." },
  { icon: "warning", title: "Inconsistency", desc: "Variations in color and thickness across batches." },
  { icon: "group_off", title: "Vendor Chaos", desc: "Managing 20+ vendors manually is an operational nightmare." },
  { icon: "fact_check", title: "Compliance Gaps", desc: "Uncertified factories putting global exports at risk." },
  { icon: "credit_card_off", title: "Hidden Costs", desc: '"Free credit" usually hides a 15–20% markup on unit costs.' },
];

const CATEGORIES = [
  { title: "Flexible Packaging",    sub: "Stand-up, Pillow & Flat Bottom Pouches", cat: "flexible",    skus: 5  },
  { title: "Bottles & Containers",  sub: "Plastic, Glass, Cosmetic & Airless",     cat: "bottles",     skus: 6  },
  { title: "Tubes & Small Packs",   sub: "Cosmetic Tubes & Blister Packs",         cat: "tubes",       skus: 2  },
  { title: "Boxes & Cartons",       sub: "Folding, Rigid & Magnetic Closure",      cat: "boxes",       skus: 3  },
  { title: "E-commerce Packaging",  sub: "Mailers, Corrugated & Courier Bags",     cat: "ecommerce",   skus: 4  },
  { title: "Protective Packaging",  sub: "Bubble Wrap, Air Pillows & Foam",        cat: "protective",  skus: 2  },
  { title: "Packaging Rolls",       sub: "Printed, Laminated & Barrier Films",     cat: "rolls",       skus: 3  },
  { title: "Labels & Closures",     sub: "Labels, Caps, Pumps & Spout Fitments",   cat: "labels",      skus: 3  },
  { title: "Sustainable Packaging", sub: "Kraft, Compostable, Recycled & Bagasse", cat: "sustainable", skus: 4, eco: true },
  { title: "Liquid Cartons",        sub: "Aseptic Brick & Gable Top Cartons",      cat: "liquid",      skus: 1  },
];

const CAT_IMAGES: Record<string, string> = {
  flexible:   "https://images.unsplash.com/photo-1606166187734-a4cb74079037?w=400&h=280&fit=crop&q=80",
  bottles:    "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=280&fit=crop&q=80",
  tubes:      "https://images.unsplash.com/photo-1522338140262-f46f5913618a?w=400&h=280&fit=crop&q=80",
  boxes:      "https://images.unsplash.com/photo-1553413077-190dd305871c?w=400&h=280&fit=crop&q=80",
  ecommerce:  "https://images.unsplash.com/photo-1531973576160-7125cd663d86?w=400&h=280&fit=crop&q=80",
  protective: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400&h=280&fit=crop&q=80",
  rolls:      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=280&fit=crop&q=80",
  labels:     "https://images.unsplash.com/photo-1574634534894-89d7576c8259?w=400&h=280&fit=crop&q=80",
  sustainable:"https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=400&h=280&fit=crop&q=80",
  liquid:     "https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400&h=280&fit=crop&q=80",
};

const INDUSTRIES = [
  { slug: "food-beverage", label: "Food & Beverage", icon: "restaurant", img: INDUSTRY_IMAGES.food },
  { slug: "pharma", label: "Pharma & Healthcare", icon: "medical_services", img: INDUSTRY_IMAGES.pharma },
  { slug: "cosmetics", label: "Beauty & Cosmetics", icon: "spa", img: INDUSTRY_IMAGES.cosmetics },
  { slug: "ecommerce", label: "E-commerce & D2C", icon: "local_shipping", img: INDUSTRY_IMAGES.ecommerce },
  { slug: "fmcg", label: "FMCG & Consumer", icon: "shopping_cart", img: INDUSTRY_IMAGES.fmcg },
  { slug: "industrial", label: "Industrial & B2B", icon: "precision_manufacturing", img: INDUSTRY_IMAGES.industrial },
  { slug: "agriculture", label: "Agriculture & Seeds", icon: "grass", img: INDUSTRY_IMAGES.agriculture },
  { slug: "electronics", label: "Electronics & Tech", icon: "devices", img: INDUSTRY_IMAGES.electronics },
];

const STEPS = [
  { n: "01", title: "Browse", desc: "Select from 33 curated SKUs across 10 categories, or start a custom design brief." },
  { n: "02", title: "Configure", desc: "Adjust dimensions, materials, and upload your branding assets." },
  { n: "03", title: "We Produce + QC", desc: "Manufactured at ISO-certified facilities with 100% manual QC." },
  { n: "04", title: "Delivered", desc: "Doorstep delivery with real-time tracking and SmartStock replenishment." },
];

const TESTIMONIALS = [
  {
    quote: "The consolidation of 14 vendors into 1 platform saved us ₹3.2L annually in operational overhead alone.",
    highlight: "₹3.2L annually",
    stat: "Reduced Vendors: 14 → 1",
    name: "Procurement Head",
    company: "Top 5 Cosmetic D2C Brand",
  },
  {
    quote: "Their automated replenishment reduced delays by 40% in our peak season compared to last year.",
    highlight: "reduced delays by 40%",
    stat: "0% Rejection Rate since 2023",
    name: "Operations Director",
    company: "FMCG Manufacturer",
  },
  {
    quote: "Structural redesign of master cartons saved us ₹1.8L in shipping by reducing damage by 85%.",
    highlight: "₹1.8L in shipping",
    stat: "85% Damage Reduction",
    name: "Supply Chain Manager",
    company: "National Beverage Giant",
  },
];

const CERTS = [
  { icon: "verified", label: "ISO 9001:2015" },
  { icon: "restaurant", label: "FSSC 22000" },
  { icon: "security", label: "BRCGS" },
  { icon: "health_and_safety", label: "FDA COMPLIANT" },
  { icon: "nature_people", label: "FSC CERTIFIED" },
];

// ─── Savings Calculator Logic ──────────────────────────────────
function calcSavings(spend: number, vendors: number, useCredit: boolean, hadStockouts: boolean) {
  // 1. Unit cost savings from factory consolidation (6–13% by vendor count)
  const unitPct = vendors >= 10 ? 0.13 : vendors >= 5 ? 0.10 : vendors >= 3 ? 0.08 : 0.06;
  const unitSavings = spend * 12 * unitPct;

  // 2. Overhead savings: each vendor needs ~10 hrs/mo management at ₹1,500/hr
  const overheadSavings = vendors * 10 * 1500 * 12;

  // 3. Hidden markup recovery (vendor credit adds ~15% markup on 50% of spend)
  const creditSavings = useCredit ? spend * 0.5 * 12 * 0.15 : 0;

  // 4. Stock-out opportunity cost (stock-out = ~3x cost of goods affected ~2% of orders)
  const stockoutSavings = hadStockouts ? spend * 12 * 0.02 * 3 : 0;

  const total = unitSavings + overheadSavings + creditSavings + stockoutSavings;
  const roiMonths = Math.round(1 / (total / (spend * 12)) * 1.5); // months to break-even

  return { unitSavings, overheadSavings, creditSavings, stockoutSavings, total, roiMonths };
}

export default function Home() {
  const [spend, setSpend] = useState(2500000);
  const [vendors, setVendors] = useState(7);
  const [useCredit, setUseCredit] = useState(true);
  const [hadStockouts, setHadStockouts] = useState(false);

  const s = calcSavings(spend, vendors, useCredit, hadStockouts);

  const mono: React.CSSProperties = { fontFamily: "'Manrope', sans-serif", fontWeight: 700 };

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

      {/* ── HERO ─────────────────────────────────── */}
      <section className="relative min-h-[90vh] flex flex-col justify-center px-8 md:px-20 overflow-hidden py-24"
        style={{ background: "linear-gradient(135deg, #0D1B2A 0%, #0F1C2C 100%)" }}>
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <svg width="100%" height="100%" preserveAspectRatio="none" viewBox="0 0 100 100">
            <path d="M0,20 L20,0 L100,0 L100,80 L80,100 L0,100 Z" fill="none" stroke="white" strokeWidth="0.1" />
            <path d="M10,30 L30,10 L90,10 L90,70 L70,90 L10,90 Z" fill="none" stroke="white" strokeWidth="0.1" />
          </svg>
        </div>
        <div className="relative z-10 max-w-5xl">
          <p className="font-bold tracking-[0.2em] mb-6 text-sm uppercase" style={{ color: "#1B6CA8" }}>
            INDIA'S FIRST MANAGED PACKAGING PLATFORM
          </p>
          <h1 className="clash-display text-white text-5xl md:text-[88px] leading-[1.0] mb-8">
            Your Packaging.<br />Sorted. Forever.
          </h1>
          <p className="text-slate-400 text-xl md:text-2xl mb-4 max-w-2xl font-light">
            Design. Source. QC. Deliver. One platform.{" "}
            <span className="text-white font-medium italic">Zero vendor chaos.</span>
          </p>
          <p className="text-sm md:text-base font-bold tracking-wide mb-12 uppercase flex items-center gap-2" style={{ color: "#1B6CA8" }}>
            <span className="w-1 h-1 rounded-full inline-block" style={{ background: "#1B6CA8" }} />
            Trusted by D2C &amp; FMCG brands across India
          </p>
          <div className="flex flex-col sm:flex-row gap-6 mb-20">
            <Link href="/products">
              <button className="px-10 py-5 rounded font-bold text-lg flex items-center justify-center gap-2 hover:opacity-90 transition-all active:scale-95" style={{ background: "#E8A838", color: "#0F1C2C" }}>
                Browse 33 SKUs <MS icon="arrow_forward" />
              </button>
            </Link>
            <Link href="/samples">
              <button className="border-2 border-white text-white px-10 py-5 rounded font-bold text-lg hover:bg-white/10 transition-all active:scale-95">
                Get a sample from ₹2,999
              </button>
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 py-10 border-t border-white/10">
            {[
              { val: "33", label: "SKUs" },
              { val: "500+", label: "Factory Partners" },
              { val: "40+", label: "Countries Served" },
              { val: "QC", label: "On Every Order" },
              { val: "₹0", label: "Hidden Charges", amber: true },
            ].map((s) => (
              <div key={s.label}>
                <p style={{ ...mono, color: s.amber ? "#E8A838" : "white", fontSize: "1.5rem" }}>{s.val}</p>
                <p className="text-slate-500 text-xs uppercase tracking-widest mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MARQUEE 1 ────────────────────────────── */}
      <div className="overflow-hidden py-3 border-y border-white/10" style={{ background: "#1B6CA8" }}>
        <div className="animate-marquee">
          {MARQUEE_1.map((t, i) => (
            <span key={i} className="text-white font-bold tracking-[0.2em] text-xs uppercase mx-8">{t}</span>
          ))}
        </div>
      </div>

      {/* ── FEATURE STRIP ────────────────────────── */}
      <div className="py-20 px-8 border-b border-slate-200/50" style={{ background: "#F8F9FC" }}>
        <div className="max-w-7xl mx-auto flex flex-wrap justify-center md:justify-between items-center gap-8">
          {[
            { icon: "assignment_turned_in", label: "Multi-vendor backup" },
            { icon: "verified_user", label: "QC owned by us" },
            { icon: "public", label: "Global shipping" },
            { icon: "payments", label: "Net-30 credit" },
            { icon: "psychology", label: "AI demand forecasting" },
            { icon: "palette", label: "Design from ₹1,999" },
          ].map((f) => (
            <div key={f.label} className="flex flex-col items-center text-center group">
              <MS icon={f.icon} className="mb-3 text-3xl" style={{ color: "#1B6CA8" }} />
              <span className="text-sm font-bold whitespace-nowrap" style={{ color: "#191c1e" }}>{f.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── PAIN POINTS ──────────────────────────── */}
      <section className="py-24 px-8 md:px-20" style={{ background: "#0F1C2C" }}>
        <div className="max-w-7xl mx-auto">
          <h2 className="clash-display text-white text-4xl mb-16 max-w-xl">
            Traditional sourcing is broken. We fixed it.
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-0 border border-white/10 rounded overflow-hidden shadow-2xl">
            {PAIN_POINTS.map((p, i) => (
              <div key={i} className="p-8 border-r border-white/5 last:border-r-0 transition-colors cursor-default"
                style={{ background: "#0D1B2A" }}
                onMouseEnter={e => (e.currentTarget.style.background = "rgba(27,108,168,0.2)")}
                onMouseLeave={e => (e.currentTarget.style.background = "#0D1B2A")}>
                <MS icon={p.icon} className="mb-6 text-3xl" style={{ color: "#E8A838" }} />
                <h3 className="font-bold text-white text-xl mb-3">{p.title}</h3>
                <p className="text-slate-400 text-sm">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── VS COMPARISON ────────────────────────── */}
      <section className="py-24 px-8 md:px-20" style={{ background: "#F2F3F6" }}>
        <div className="max-w-5xl mx-auto">
          <h2 className="clash-display text-4xl mb-12 text-center" style={{ color: "#0D1B2A" }}>
            Packwerk vs. The Old Way
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="rounded p-10 shadow-2xl border-2 relative overflow-hidden" style={{ background: "#0F1C2C", borderColor: "#1B6CA8" }}>
              <div className="absolute top-0 right-0 text-white px-6 py-2 font-bold text-xs uppercase tracking-widest" style={{ background: "#1B6CA8" }}>Recommended</div>
              <h3 className="text-white text-3xl font-black mb-10"><span style={{ color: "#1B6CA8" }}>Packwerk</span> Precision</h3>
              <ul className="space-y-6">
                {["Redundant Production Nodes", "Managed & Liability-owned QC", "100% Transparent Unit Pricing", "Global Certification Stack", "Digital SKU Dashboard"].map(item => (
                  <li key={item} className="flex items-center gap-4 text-slate-200">
                    <MsFilled icon="check_circle" className="text-xl" style={{ color: "#1B6CA8" }} />
                    <span className="font-medium">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white rounded p-10 shadow-lg border opacity-60" style={{ borderColor: "rgba(196,198,204,0.3)" }}>
              <h3 className="text-3xl font-black mb-10" style={{ color: "#191c1e" }}>Direct Vendors</h3>
              <ul className="space-y-6">
                {["Single Point of Failure", "Self-certified (Conflict of Interest)", 'Markup-heavy "Free" Credit', "Compliance Gaps", "Manual WhatsApp Chaos"].map(item => (
                  <li key={item} className="flex items-center gap-4" style={{ color: "#44474c" }}>
                    <MS icon="cancel" className="text-xl" style={{ color: "#ba1a1a" }} />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── PRODUCT CATEGORIES ───────────────────── */}
      <section className="py-24 px-8 md:px-20" style={{ background: "#F8F9FC" }}>
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-4">
            <div>
              <h2 className="clash-display text-4xl" style={{ color: "#0D1B2A" }}>Core Product Categories</h2>
              <p className="mt-2 text-lg" style={{ color: "#44474c" }}>33 curated SKUs across 10 managed categories.</p>
            </div>
            <Link href="/products">
              <button className="font-bold flex items-center gap-2 hover:underline" style={{ color: "#1B6CA8" }}>
                View full catalog <MS icon="chevron_right" />
              </button>
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5 mb-20">
            {CATEGORIES.map((cat) => (
              <Link href={`/products?category=${cat.cat}`} key={cat.title}>
                <div
                  className="group rounded p-5 shadow-sm hover:-translate-y-2 transition-all cursor-pointer border relative overflow-hidden"
                  style={cat.eco
                    ? { background: "#f0faf3", borderColor: "#22c55e", borderWidth: 2 }
                    : { background: "white", borderColor: "#e2e8f0" }
                  }
                >
                  {cat.eco && (
                    <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest" style={{ background: "#dcfce7", color: "#15803d" }}>
                      <MS icon="eco" style={{ fontSize: "12px" }} /> ECO
                    </div>
                  )}
                  <div className="w-full h-36 rounded mb-4 overflow-hidden bg-slate-100 relative">
                    <img
                      src={CAT_IMAGES[cat.cat]}
                      alt={cat.title}
                      className={`w-full h-full object-cover transition-all duration-500 ${cat.eco ? "group-hover:scale-105" : "grayscale group-hover:grayscale-0"}`}
                    />
                    {cat.eco && (
                      <div className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(135deg, rgba(34,197,94,0.15) 0%, transparent 60%)" }} />
                    )}
                  </div>
                  <h4 className="font-bold text-sm leading-tight mb-1" style={{ color: cat.eco ? "#15803d" : "#191c1e" }}>{cat.title}</h4>
                  <p className="text-xs leading-snug" style={{ color: cat.eco ? "#16a34a" : "#44474c" }}>{cat.sub}</p>
                  <p className="text-xs font-bold mt-2" style={{ color: cat.eco ? "#22c55e" : "#1B6CA8", fontFamily: "'Manrope', sans-serif" }}>{cat.skus} SKU{cat.skus !== 1 ? "s" : ""}</p>
                </div>
              </Link>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              { title: "Coffee Brand Bundle", tags: ["Stand-up Pouch", "Printed Roll Label", "Mailer Box"], icon: "inventory_2" },
              { title: "Skincare Essentials", tags: ["Airless Pump Bottle", "Cosmetic Jar", "Folding Carton"], icon: "sanitizer" },
            ].map(kit => (
              <div key={kit.title} className="p-8 rounded border border-white/5 flex flex-col md:flex-row items-center gap-8" style={{ background: "#0F1C2C" }}>
                <div className="flex-1">
                  <span className="text-xs font-bold tracking-widest uppercase mb-2 block" style={{ color: "#E8A838" }}>Starter Kit</span>
                  <h3 className="text-white text-2xl font-bold mb-4">{kit.title}</h3>
                  <div className="flex flex-wrap gap-3">
                    {kit.tags.map(tag => <span key={tag} className="px-3 py-1 text-xs rounded border text-white" style={{ background: "rgba(255,255,255,0.1)", borderColor: "rgba(255,255,255,0.2)" }}>{tag}</span>)}
                  </div>
                </div>
                <div className="w-full md:w-1/3 aspect-square rounded flex items-center justify-center" style={{ background: "rgba(255,255,255,0.05)" }}>
                  <MS icon={kit.icon} className="text-6xl" style={{ color: "rgba(255,255,255,0.2)" }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── INDUSTRIES ───────────────────────────── */}
      <section className="py-24 px-8 md:px-20" style={{ background: "#0D1B2A" }}>
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-4">
            <div>
              <p className="font-bold tracking-[0.2em] text-sm uppercase mb-3" style={{ color: "#1B6CA8" }}>SECTORS WE SERVE</p>
              <h2 className="clash-display text-white text-4xl">Built for every industry.</h2>
            </div>
            <Link href="/industries">
              <button className="font-bold flex items-center gap-2 hover:underline" style={{ color: "#E8A838" }}>
                All Industries <MS icon="chevron_right" />
              </button>
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {INDUSTRIES.map((ind) => (
              <Link href={`/industries/${ind.slug}`} key={ind.slug}>
                <div className="group relative rounded overflow-hidden cursor-pointer h-52">
                  <img src={ind.img} alt={ind.label} className="w-full h-full object-cover brightness-50 group-hover:brightness-75 group-hover:scale-105 transition-all duration-500" />
                  <div className="absolute inset-0 flex flex-col justify-end p-5">
                    <MS icon={ind.icon} className="text-2xl mb-2" style={{ color: "#E8A838" }} />
                    <h3 className="text-white font-bold text-lg leading-tight">{ind.label}</h3>
                    <p className="text-slate-400 text-xs mt-1 group-hover:text-white transition-colors">View solutions →</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── MARQUEE 2 ────────────────────────────── */}
      <div className="overflow-hidden py-4 border-y border-white/10" style={{ background: "#0F1C2C" }}>
        <div className="animate-marquee">
          {MARQUEE_2.map((t, i) => (
            <span key={i} className="font-bold tracking-[0.2em] text-sm uppercase mx-12" style={{ color: i % 2 === 0 ? "white" : "#E8A838" }}>{t}</span>
          ))}
        </div>
      </div>

      {/* ── PROCUREMENT PERFECTED ────────────────── */}
      <section className="py-24 px-8 md:px-20 text-white text-center" style={{ background: "#0F1C2C" }}>
        <div className="max-w-7xl mx-auto">
          <h2 className="clash-display text-4xl md:text-5xl mb-4">Procurement Perfected</h2>
          <p className="text-slate-400 text-lg mb-20 max-w-2xl mx-auto">From concept to global delivery, our process ensures zero quality compromise.</p>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 text-left">
            {STEPS.map((step) => (
              <div key={step.n} className="relative group">
                <p className="font-black text-8xl mb-[-30px] transition-colors" style={{ color: "rgba(255,255,255,0.07)", fontFamily: "'Manrope', sans-serif" }}>
                  {step.n}
                </p>
                <h4 className="text-2xl font-bold mb-4 relative z-10">{step.title}</h4>
                <p className="text-slate-400 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── EXPERT DESIGN ────────────────────────── */}
      <section className="py-24 px-8 md:px-20 border-b border-slate-100" style={{ background: "#F8F9FC" }}>
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16">
          <div className="lg:w-1/2">
            <span className="font-bold tracking-widest uppercase text-sm mb-4 block" style={{ color: "#1B6CA8" }}>Design Intelligence</span>
            <h2 className="clash-display text-4xl mb-6" style={{ color: "#0D1B2A" }}>Expert Packaging Design. Ready in 5 Days.</h2>
            <p className="text-lg mb-8 leading-relaxed" style={{ color: "#44474c" }}>
              Stop guessing your dielines. Our structural engineers create production-ready files optimized for your SKU and factory specs.
            </p>
            <div className="grid grid-cols-2 gap-6 mb-10">
              {[{ icon: "verified", label: "Dielines Included" }, { icon: "speed", label: "5-Day Turnaround" }, { icon: "payments", label: "Starts @ ₹1,999" }, { icon: "view_in_ar", label: "3D Renderings" }].map(f => (
                <div key={f.label} className="flex items-center gap-3">
                  <MS icon={f.icon} style={{ color: "#1B6CA8" }} />
                  <span className="font-bold" style={{ color: "#191c1e" }}>{f.label}</span>
                </div>
              ))}
            </div>
            <Link href="/design">
              <button className="px-8 py-4 rounded font-bold hover:opacity-90 transition-all text-white" style={{ background: "#0D1B2A" }}>Start Design Brief</button>
            </Link>
          </div>
          <div className="lg:w-1/2 w-full rounded-lg overflow-hidden shadow-xl">
            <img src="https://images.unsplash.com/photo-1589782182703-2aaa69037b5b?w=700&h=450&fit=crop&q=80" alt="Design Service" className="w-full h-full object-cover" />
          </div>
        </div>
      </section>

      {/* ── SAVINGS CALCULATOR ───────────────────── */}
      <section className="py-24 px-8 md:px-20" style={{ background: "#F2F3F6" }}>
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          <div>
            <h2 className="clash-display text-4xl mb-3" style={{ color: "#0D1B2A" }}>Stop overpaying for &ldquo;hidden&rdquo; costs.</h2>
            <p className="mb-10" style={{ color: "#44474c" }}>
              Real savings from switching to Packwerk. Based on actual customer data across 450+ brands.
            </p>
            <div className="bg-white p-8 rounded border border-slate-200/60 space-y-8">

              {/* Spend Slider */}
              <div>
                <div className="flex justify-between mb-3">
                  <label className="font-bold text-sm uppercase tracking-wide">Monthly Packaging Spend</label>
                  <span className="font-bold" style={{ ...mono, color: "#1B6CA8" }}>{formatINR(spend)}</span>
                </div>
                <input type="range" min={100000} max={10000000} step={100000} value={spend}
                  onChange={e => setSpend(Number(e.target.value))}
                  className="w-full h-2 rounded appearance-none cursor-pointer" style={{ accentColor: "#1B6CA8" }} />
                <div className="flex justify-between text-xs mt-1" style={{ color: "#74777d" }}>
                  <span>₹1 L</span><span>₹1 Cr</span>
                </div>
              </div>

              {/* Vendor Count */}
              <div>
                <div className="flex justify-between mb-3">
                  <label className="font-bold text-sm uppercase tracking-wide">Current Number of Vendors</label>
                  <span className="font-bold" style={{ ...mono, color: "#1B6CA8" }}>{vendors}</span>
                </div>
                <input type="range" min={1} max={25} step={1} value={vendors}
                  onChange={e => setVendors(Number(e.target.value))}
                  className="w-full h-2 rounded appearance-none cursor-pointer" style={{ accentColor: "#1B6CA8" }} />
                <div className="flex justify-between text-xs mt-1" style={{ color: "#74777d" }}>
                  <span>1</span><span>25+</span>
                </div>
              </div>

              {/* Toggles */}
              <div className="space-y-4 pt-2">
                <label className="flex items-center justify-between cursor-pointer">
                  <div>
                    <p className="font-bold text-sm">Using vendor credit / extended terms?</p>
                    <p className="text-xs" style={{ color: "#74777d" }}>Vendor credit typically adds 15% hidden markup</p>
                  </div>
                  <div className="relative ml-4">
                    <input type="checkbox" className="sr-only peer" checked={useCredit} onChange={e => setUseCredit(e.target.checked)} />
                    <div className="w-11 h-6 rounded-full transition-colors relative" style={{ background: useCredit ? "#1B6CA8" : "#C4C6CC" }}>
                      <div className="absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform" style={{ left: useCredit ? "calc(100% - 22px)" : "2px" }} />
                    </div>
                  </div>
                </label>
                <label className="flex items-center justify-between cursor-pointer">
                  <div>
                    <p className="font-bold text-sm">Had any stock-outs in the last 12 months?</p>
                    <p className="text-xs" style={{ color: "#74777d" }}>Stock-outs cost 3× the value of lost inventory</p>
                  </div>
                  <div className="relative ml-4">
                    <input type="checkbox" className="sr-only peer" checked={hadStockouts} onChange={e => setHadStockouts(e.target.checked)} />
                    <div className="w-11 h-6 rounded-full transition-colors relative" style={{ background: hadStockouts ? "#1B6CA8" : "#C4C6CC" }}>
                      <div className="absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform" style={{ left: hadStockouts ? "calc(100% - 22px)" : "2px" }} />
                    </div>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Results Panel */}
          <div className="p-10 rounded text-white shadow-2xl" style={{ background: "#0F1C2C" }}>
            <p className="font-bold uppercase text-xs tracking-widest mb-6" style={{ color: "#E8A838" }}>Your Annual Savings Breakdown</p>
            <div className="space-y-6 mb-8">
              <div className="flex justify-between items-start pb-4 border-b border-white/10">
                <div>
                  <p className="text-slate-400 text-sm">Unit cost savings ({vendors >= 10 ? "13" : vendors >= 5 ? "10" : vendors >= 3 ? "8" : "6"}% off current rates)</p>
                </div>
                <p style={{ ...mono, fontSize: "1.1rem" }}>{formatINR(s.unitSavings)}</p>
              </div>
              <div className="flex justify-between items-start pb-4 border-b border-white/10">
                <div>
                  <p className="text-slate-400 text-sm">Vendor management time recovered ({vendors} vendors × 10 hrs)</p>
                </div>
                <p style={{ ...mono, fontSize: "1.1rem" }}>{formatINR(s.overheadSavings)}</p>
              </div>
              {useCredit && (
                <div className="flex justify-between items-start pb-4 border-b border-white/10">
                  <p className="text-slate-400 text-sm">Hidden markup recovered (vendor credit)</p>
                  <p style={{ ...mono, fontSize: "1.1rem" }}>{formatINR(s.creditSavings)}</p>
                </div>
              )}
              {hadStockouts && (
                <div className="flex justify-between items-start pb-4 border-b border-white/10">
                  <p className="text-slate-400 text-sm">Stock-out opportunity cost avoided</p>
                  <p style={{ ...mono, fontSize: "1.1rem" }}>{formatINR(s.stockoutSavings)}</p>
                </div>
              )}
            </div>
            <div className="pt-4">
              <p className="text-slate-400 text-sm mb-2">Total Annual Value Unlocked</p>
              <p className="clash-display mb-1" style={{ fontSize: "clamp(2rem,5vw,3.5rem)", color: "#E8A838" }}>
                {formatINR(s.total)}
              </p>
              <p className="text-slate-500 text-xs">Typically recovers switch cost in &lt;{Math.max(1, s.roiMonths)} months</p>
            </div>
            <Link href="/quote">
              <button className="w-full mt-8 py-4 rounded font-bold hover:bg-slate-200 transition-all" style={{ background: "white", color: "#0F1C2C" }}>
                Get My Free Savings Audit →
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── SWITCHING IS EASY ────────────────────── */}
      <section className="py-24 px-8 md:px-20" style={{ background: "#F8F9FC" }}>
        <div className="max-w-4xl mx-auto">
          <h2 className="clash-display text-4xl mb-4 text-center" style={{ color: "#0D1B2A" }}>Switching from 10+ vendors is easy.</h2>
          <p className="text-lg text-center mb-12 max-w-2xl mx-auto" style={{ color: "#44474c" }}>
            Replace the coordination chaos of multiple vendors with one managed platform. We handle the transition SKU by SKU.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            {[
              { n: "1", title: "Start with 1 SKU", desc: "No need to move your entire catalog. Start small and see the difference." },
              { n: "2", title: "Compare Quality", desc: "Get samples and contrast them against your current supplies side-by-side." },
              { n: "3", title: "Scale Gradually", desc: "Once you trust our managed QC, roll out the rest of your inventory." },
            ].map(s => (
              <div key={s.n}>
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-black" style={{ ...mono, background: "rgba(27,108,168,0.1)", color: "#1B6CA8" }}>{s.n}</div>
                <h4 className="font-bold text-xl mb-3" style={{ color: "#191c1e" }}>{s.title}</h4>
                <p className="text-sm" style={{ color: "#44474c" }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SMARTSTOCK ───────────────────────────── */}
      <section className="grid grid-cols-1 lg:grid-cols-2">
        <div className="text-white px-8 md:px-20 py-24 flex flex-col justify-center" style={{ background: "#0F1C2C" }}>
          <span className="font-bold tracking-widest mb-6 uppercase text-sm" style={{ color: "#E8A838" }}>SMARTSTOCK™ AI INVENTORY</span>
          <h2 className="clash-display text-4xl mb-8">Never run out of boxes again.</h2>
          <p className="text-slate-400 text-lg mb-10 leading-relaxed">
            Our AI analyzes your sales velocity and lead times across 500+ factory partners to automatically trigger replenishment.
            <br /><br />We hold up to <span className="text-white font-bold">4 weeks of buffer stock</span> in regional nodes so you never face a line-stop.
          </p>
          <ul className="space-y-4 mb-12">
            {["Automated JIT Replenishment", "Regional Warehousing in 12 Cities", "SKU Consolidation Reporting"].map(item => (
              <li key={item} className="flex items-center gap-3">
                <MS icon="check_circle" style={{ color: "#1B6CA8" }} /> {item}
              </li>
            ))}
          </ul>
          <Link href="/quote">
            <button className="text-white w-fit px-8 py-4 rounded font-bold hover:opacity-90 transition-all" style={{ background: "#1B6CA8" }}>See SmartStock in Action</button>
          </Link>
        </div>
        <div className="relative p-12 flex items-center justify-center" style={{ background: "#F2F3F6" }}>
          <div className="relative z-10 w-full max-w-lg bg-white p-8 rounded shadow-2xl border border-slate-200/30">
            <div className="flex justify-between items-center mb-8">
              <h4 className="font-bold">Live Inventory Map</h4>
              <span className="flex items-center gap-2 text-xs font-bold uppercase" style={{ color: "#1B6CA8" }}>
                <span className="w-2 h-2 rounded-full animate-ping inline-block" style={{ background: "#1B6CA8" }} />Live Updates
              </span>
            </div>
            <div className="space-y-4">
              {[
                { node: "Delhi NCR Node", cap: "92% Capacity", ok: true },
                { node: "Mumbai West Node", cap: "87% Capacity", ok: true },
                { node: "Bengaluru Node", cap: "42% (Replenishing)", ok: false },
                { node: "Chennai Port Node", cap: "98% Capacity", ok: true },
              ].map(row => (
                <div key={row.node} className="flex items-center justify-between p-4 rounded" style={{ background: "#EDEEF1" }}>
                  <span className="font-bold text-sm">{row.node}</span>
                  <span style={{ ...mono, fontSize: "0.85rem", color: row.ok ? "#1B6CA8" : "#ba1a1a" }}>{row.cap}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── COMPLIANCE ───────────────────────────── */}
      <section className="py-24 text-white px-8 md:px-20 text-center" style={{ background: "#0F1C2C" }}>
        <h2 className="clash-display text-4xl mb-4">Uncompromising Compliance. Global Ready.</h2>
        <div className="inline-block px-4 py-2 rounded mb-16 border" style={{ background: "rgba(27,108,168,0.2)", borderColor: "rgba(27,108,168,0.3)" }}>
          <p className="text-sm font-bold">Manufactured with precision in India. Exporting to 40+ countries across the Middle East, Europe, and USA.</p>
        </div>
        <div className="flex flex-wrap justify-center gap-12 items-center opacity-70 mb-20">
          {CERTS.map(c => (
            <div key={c.label} className="flex flex-col items-center">
              <MS icon={c.icon} className="text-5xl mb-2" />
              <p className="text-xs font-bold" style={{ ...mono }}>{c.label}</p>
            </div>
          ))}
        </div>
        <div className="p-12 rounded max-w-4xl mx-auto border border-white/5 shadow-2xl" style={{ background: "#0D1B2A" }}>
          <h4 className="font-bold mb-4">Exporting to USA, EU or MENA?</h4>
          <p className="text-slate-400 mb-8">Full documentation for global sustainability mandates including Plastic Tax declarations and EPR certifications.</p>
          <div className="flex flex-wrap justify-center gap-4">
            {["USA — FDA Grade", "EU — REACH Compliant", "MENA — SASO Ready"].map(tag => (
              <div key={tag} className="px-6 py-3 rounded-full text-xs font-bold border uppercase tracking-widest" style={{ background: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.1)" }}>{tag}</div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ─────────────────────────── */}
      <section className="py-24 px-8 md:px-20" style={{ background: "#F8F9FC" }}>
        <h2 className="clash-display text-4xl mb-16 text-center" style={{ color: "#0D1B2A" }}>Used by India&rsquo;s fastest growing brands.</h2>
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {TESTIMONIALS.map(t => (
            <div key={t.name} className="bg-white p-10 rounded shadow-sm border border-slate-100">
              <div className="flex gap-1 mb-6" style={{ color: "#E8A838" }}>
                {[...Array(5)].map((_, i) => <MsFilled key={i} icon="star" className="text-xl" />)}
              </div>
              <p className="text-lg italic mb-10" style={{ color: "#191c1e" }}>
                &ldquo;{t.quote.split(t.highlight).map((part, i, arr) =>
                  i < arr.length - 1
                    ? [part, <span key={i} className="font-bold" style={{ color: "#1B6CA8" }}>{t.highlight}</span>]
                    : part
                )}&rdquo;
              </p>
              <div className="pt-8 border-t border-slate-100">
                <p className="font-bold uppercase text-sm" style={{ ...mono, color: "#1B6CA8" }}>{t.stat}</p>
                <p className="mt-2 font-bold" style={{ color: "#191c1e" }}>{t.name}</p>
                <p className="text-xs" style={{ color: "#44474c" }}>{t.company}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FINAL CTA ────────────────────────────── */}
      <section className="py-24 px-8 md:px-20 text-center relative overflow-hidden" style={{ background: "#0F1C2C" }}>
        <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: "repeating-linear-gradient(45deg, white 0, white 1px, transparent 0, transparent 50%)", backgroundSize: "20px 20px" }} />
        <div className="relative z-10 max-w-4xl mx-auto">
          <h2 className="clash-display text-white text-5xl md:text-6xl mb-8 leading-tight">The way brands buy packaging just changed.</h2>
          <p className="text-slate-400 text-xl mb-12">Join 450+ companies optimizing their supply chain on Packwerk.</p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link href="/quote"><button className="px-12 py-5 rounded font-bold text-xl hover:scale-105 transition-all" style={{ background: "#E8A838", color: "#0F1C2C" }}>Schedule a Factory Audit</button></Link>
            <Link href="/products"><button className="text-white px-12 py-5 rounded font-bold text-xl hover:bg-white/20 transition-all" style={{ background: "rgba(255,255,255,0.1)" }}>Download Product Catalog</button></Link>
          </div>
        </div>
      </section>
    </div>
  );
}
