import { Link } from "wouter";
import { INDUSTRY_IMAGES } from "@/lib/images";

const MS = ({ icon, className = "", style }: { icon: string; className?: string; style?: React.CSSProperties }) => (
  <span className={`material-symbols-outlined ${className}`} style={style}>{icon}</span>
);

const INDUSTRIES = [
  {
    slug: "food-beverage",
    label: "Food & Beverage",
    sub: "Pouches, retort packs, barrier films, glass",
    icon: "restaurant",
    img: INDUSTRY_IMAGES.food,
    skus: "28 SKUs",
    certs: ["FSSC 22000", "FDA", "HACCP"],
  },
  {
    slug: "pharma",
    label: "Pharma & Healthcare",
    sub: "Child-resistant, tamper-evident, cold chain",
    icon: "medical_services",
    img: INDUSTRY_IMAGES.pharma,
    skus: "18 SKUs",
    certs: ["FDA", "ISO 15223", "WHO-GMP"],
  },
  {
    slug: "cosmetics",
    label: "Beauty & Cosmetics",
    sub: "Rigid boxes, glass bottles, premium labels",
    icon: "spa",
    img: INDUSTRY_IMAGES.cosmetics,
    skus: "22 SKUs",
    certs: ["ISO 22716", "COSMOS"],
  },
  {
    slug: "ecommerce",
    label: "E-commerce & D2C",
    sub: "Mailers, branded boxes, bubble protection",
    icon: "local_shipping",
    img: INDUSTRY_IMAGES.ecommerce,
    skus: "16 SKUs",
    certs: ["ASTM", "ISTA"],
  },
  {
    slug: "fmcg",
    label: "FMCG & Consumer",
    sub: "High-volume cartons, secondary packaging",
    icon: "shopping_cart",
    img: INDUSTRY_IMAGES.fmcg,
    skus: "20 SKUs",
    certs: ["BRC", "ISO 9001"],
  },
  {
    slug: "industrial",
    label: "Industrial & B2B",
    sub: "Heavy-duty corrugated, stretch wrap, strapping",
    icon: "precision_manufacturing",
    img: INDUSTRY_IMAGES.industrial,
    skus: "14 SKUs",
    certs: ["ISO 9001", "CE"],
  },
  {
    slug: "agriculture",
    label: "Agriculture & Seeds",
    sub: "Crop protection packs, moisture barriers",
    icon: "grass",
    img: INDUSTRY_IMAGES.agriculture,
    skus: "10 SKUs",
    certs: ["FAO", "ISO 9001"],
  },
  {
    slug: "electronics",
    label: "Electronics & Tech",
    sub: "Anti-static bags, foam inserts, ESD packaging",
    icon: "devices",
    img: INDUSTRY_IMAGES.electronics,
    skus: "12 SKUs",
    certs: ["ESD", "JEDEC", "RoHS"],
  },
];

export default function Industries() {
  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

      {/* ── Hero ── */}
      <section className="py-24 px-8 md:px-20" style={{ background: "#020617" }}>
        <div className="max-w-4xl">
          <p className="font-bold tracking-[0.2em] text-xs uppercase mb-4" style={{ color: "#1B6CA8" }}>INDUSTRY SOLUTIONS</p>
          <h1 className="clash-display text-white mb-6" style={{ fontSize: "clamp(2.5rem,6vw,4.5rem)", lineHeight: 1.05 }}>
            Engineered for<br /><span style={{ color: "#E8A838" }}>your industry.</span>
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl leading-relaxed">
            Packwerk maintains separate manufacturing protocols, compliance stacks, and SKU libraries for 8 industrial verticals.
          </p>
        </div>
      </section>

      {/* ── Industries Grid ── */}
      <section className="py-20 px-8 md:px-20" style={{ background: "#F8F9FC" }}>
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          {INDUSTRIES.map(ind => (
            <Link href={`/industries/${ind.slug}`} key={ind.slug}>
              <div className="group bg-white rounded border border-slate-200 overflow-hidden hover:border-blue-400 hover:shadow-lg transition-all cursor-pointer">
                <div className="h-52 overflow-hidden relative">
                  <img src={ind.img} alt={ind.label} className="w-full h-full object-cover brightness-75 group-hover:brightness-90 group-hover:scale-105 transition-all duration-500" />
                  <div className="absolute top-4 left-4 flex gap-2">
                    {ind.certs.slice(0, 2).map(c => (
                      <span key={c} className="px-2 py-1 rounded text-xs font-bold" style={{ background: "rgba(27,108,168,0.9)", color: "white" }}>{c}</span>
                    ))}
                  </div>
                  <div className="absolute bottom-4 right-4">
                    <span className="px-3 py-1.5 rounded text-xs font-bold" style={{ background: "#E8A838", color: "#0F1C2C" }}>{ind.skus}</span>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <MS icon={ind.icon} className="text-2xl" style={{ color: "#1B6CA8" }} />
                    <h3 className="font-bold text-xl" style={{ color: "#0D1B2A" }}>{ind.label}</h3>
                  </div>
                  <p className="text-sm mb-4" style={{ color: "#44474c" }}>{ind.sub}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex gap-2 flex-wrap">
                      {ind.certs.map(c => (
                        <span key={c} className="px-2 py-0.5 rounded text-xs font-bold" style={{ background: "#F2F3F6", color: "#44474c" }}>{c}</span>
                      ))}
                    </div>
                    <span className="font-bold text-sm flex items-center gap-1 group-hover:underline" style={{ color: "#1B6CA8" }}>
                      Explore <MS icon="arrow_forward" className="text-base" />
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20 px-8 text-center" style={{ background: "#0f172a" }}>
        <p className="font-bold tracking-widest uppercase text-xs mb-4" style={{ color: "#E8A838" }}>SECTOR-SPECIFIC CONSULTATION</p>
        <h2 className="clash-display text-white text-4xl mb-6">Don&rsquo;t see your sector?</h2>
        <p className="text-slate-400 max-w-xl mx-auto mb-10">Our team has built bespoke packaging solutions for 50+ niche verticals. Contact our sector leads.</p>
        <Link href="/quote">
          <button className="px-10 py-5 rounded font-bold text-base hover:opacity-90 transition-all" style={{ background: "#E8A838", color: "#0F1C2C" }}>
            Request Custom Solution
          </button>
        </Link>
      </section>
    </div>
  );
}
