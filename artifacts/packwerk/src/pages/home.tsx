import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import { INDUSTRY_IMAGES } from "@/lib/images";
import BrandAdvantageSection from "@/components/home/BrandAdvantageSection";
import {
  Search, GitBranch, ShieldCheck, Truck,
  Leaf, Droplets, FileCheck, Info,
} from "lucide-react";

const WHATSAPP_NUM = "919999999999";

const CLIENT_PILLS = [
  "Zestful Foods", "Dermatica India", "NatureCraft Organics", "QuickShip Commerce",
  "Bloom Skincare", "Spice Route Foods", "Urban Nest Home", "ClearDerm Pharma",
  "EcoWear India", "Harvest Organics", "PurePet Foods", "Artisan Chai Co.",
];

interface IconProps { icon: string; className?: string; style?: React.CSSProperties; }
const MS = ({ icon, className = "", style }: IconProps) => (
  <span className={`material-symbols-outlined ${className}`} style={style}>{icon}</span>
);

const MARQUEE_1 = Array(8).fill("We are not a vendor. We are your packaging partner.");

const HERO_FLOAT_CARDS = [
  { title: "Flexible Packaging",  icon: "inventory_2",    skus: 5,  pos: { top: "2%",    left: "4%" },   delay: "0s"    },
  { title: "E-commerce Packs",    icon: "local_shipping", skus: 4,  pos: { top: "6%",    right: "2%" },  delay: "0.9s"  },
  { title: "Sustainable",         icon: "eco",            skus: 4,  pos: { top: "44%",   right: "0%" },  delay: "1.5s"  },
  { title: "Boxes & Cartons",     icon: "view_in_ar",     skus: 3,  pos: { bottom: "30%",left: "0%" },   delay: "0.4s"  },
  { title: "Labels & Closures",   icon: "label",          skus: 3,  pos: { bottom: "8%", left: "20%" },  delay: "1.1s"  },
  { title: "Protective Packs",    icon: "security",       skus: 2,  pos: { bottom: "18%",right: "6%" },  delay: "0.2s"  },
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
  { title: "Sustainable Packaging", sub: "Kraft, Compostable, Recycled & Bagasse", cat: "sustainable", skus: 4  },
  { title: "Liquid Cartons",        sub: "Aseptic Brick & Gable Top Cartons",      cat: "liquid",      skus: 1  },
];

const CAT_IMAGES: Record<string, string> = {
  flexible:    "/categories/flexiblepacks.jpg",
  bottles:     "/categories/rigidpacks.jpg",
  tubes:       "/categories/tubes.jpg",
  boxes:       "https://images.unsplash.com/photo-1553413077-190dd305871c?w=600&h=400&fit=crop&q=75",
  ecommerce:   "/categories/ecom.jpg",
  protective:  "/categories/protectivepacks.jpg",
  rolls:       "/categories/printedrolls.jpg",
  labels:      "/categories/closures.jpg",
  sustainable: "/categories/sustainable.jpg",
  liquid:      "/categories/liquid.jpg",
};

const INDUSTRIES = [
  { slug: "food-beverage", label: "Food & Beverage",    icon: "restaurant",               img: INDUSTRY_IMAGES.food },
  { slug: "pharma",        label: "Pharma & Healthcare", icon: "medical_services",          img: INDUSTRY_IMAGES.pharma },
  { slug: "cosmetics",     label: "Beauty & Cosmetics",  icon: "spa",                       img: INDUSTRY_IMAGES.cosmetics },
  { slug: "ecommerce",     label: "E-commerce & D2C",    icon: "local_shipping",            img: INDUSTRY_IMAGES.ecommerce },
  { slug: "fmcg",          label: "FMCG & Consumer",     icon: "shopping_cart",             img: INDUSTRY_IMAGES.fmcg },
  { slug: "industrial",    label: "Industrial & B2B",    icon: "precision_manufacturing",   img: INDUSTRY_IMAGES.industrial },
  { slug: "agriculture",   label: "Agriculture & Seeds", icon: "grass",                     img: INDUSTRY_IMAGES.agriculture },
  { slug: "electronics",   label: "Electronics & Tech",  icon: "devices",                   img: INDUSTRY_IMAGES.electronics },
];

const PAIN_POINTS = [
  {
    title: "Vendor delays",
    body: "Promised 10 days. It's been 3 weeks. Your production line is waiting.",
  },
  {
    title: "Quality roulette",
    body: "Perfect last batch. Rejected this batch. Same vendor. No explanation.",
  },
  {
    title: "Vendor overload",
    body: "6 vendors for 6 SKUs. Coordination costs 2 full days every month.",
  },
  {
    title: "Compliance gaps",
    body: "Your export buyer needs FDA certs. Your vendor doesn't have them.",
  },
  {
    title: "Credit illusion",
    body: "Their 'free' credit is 12% higher per unit. You always pay for it.",
  },
];

const HOW_IT_WORKS_STEPS = [
  {
    num: "Step 01",
    Icon: Search,
    title: "Configure and Quote",
    desc: "Browse 110+ SKUs, configure your spec, and submit a quote request. We respond in 48 hours.",
    bg: "#0D1B2A",
  },
  {
    num: "Step 02",
    Icon: GitBranch,
    title: "We Source and Match",
    desc: "PackOS matches your SKU to the best available factory from our verified network. 3 backup vendors assigned.",
    bg: "#0D1B2A",
  },
  {
    num: "Step 03",
    Icon: ShieldCheck,
    title: "QC at Every Stage",
    desc: "Pre-production sample. In-process check. Pre-dispatch inspection. You see photo evidence.",
    bg: "#1B6CA8",
  },
  {
    num: "Step 04",
    Icon: Truck,
    title: "Delivered and Tracked",
    desc: "Door to door logistics. Real-time tracking in your dashboard. India or global.",
    bg: "#1B6CA8",
  },
];

const CASE_STUDIES = [
  {
    initials: "ZF",
    company: "Zestful Foods",
    industry: "D2C Snacks · Mumbai",
    metric: "7 vendors → 1 platform",
    challenge: "We were managing 7 different packaging vendors for our snack range. Every month was a coordination nightmare — delays from one vendor cascaded across our entire production schedule.",
    whatWeDid: "Consolidated all 7 SKUs onto the PackOps platform. Assigned backup vendors for each. Integrated their reorder into the dashboard with SmartStock pre-positioning.",
    result: "Single point of contact for all packaging. Zero production delays in the first 6 months. Quality consistent across every batch.",
    metrics: [
      { val: "7 → 1", label: "Vendors managed" },
      { val: "₹0", label: "Production delays" },
      { val: "6 mo", label: "Zero quality issues" },
    ],
  },
  {
    initials: "DI",
    company: "Dermatica India",
    industry: "Cosmetics · Bangalore",
    metric: "₹3.8L saved in Year 1",
    challenge: "Our previous vendor's QC was self-certified. We received two batches with print registration errors that our retail partners rejected. The cost of returns was significant.",
    whatWeDid: "Moved cosmetic jar and carton orders to PackOps. Pre-dispatch inspection with photo evidence on every batch. Design also migrated — artwork now stored on platform.",
    result: "Zero QC rejections in 14 months. Artwork errors eliminated because print-ready files are standardised. Net saving vs previous vendor.",
    metrics: [
      { val: "0", label: "QC rejections" },
      { val: "₹3.8L", label: "Annual saving" },
      { val: "14 mo", label: "Perfect record" },
    ],
  },
  {
    initials: "NC",
    company: "NatureCraft Organics",
    industry: "Organic Food · Pune",
    metric: "14 days · Fully certified",
    challenge: "We needed FSC certified kraft pouches with compostability certification for a UK export order. Our local vendor couldn't provide the documentation and we nearly lost the contract.",
    whatWeDid: "Sourced FSC certified kraft stand-up pouches from our verified sustainable packaging network. Provided full export documentation including FSC chain of custody certificate.",
    result: "UK export order fulfilled on time with full certification. Buyer has since placed 3 repeat orders. Sustainable packaging now standard across their range.",
    metrics: [
      { val: "14d", label: "Sourced and shipped" },
      { val: "3x", label: "Repeat orders won" },
      { val: "100%", label: "Certs provided" },
    ],
  },
];

// ── Count-up animation ──────────────────────────────────────────
function CountUp({ target, suffix = "", prefix = "", duration = 1500 }: {
  target: number; suffix?: string; prefix?: string; duration?: number;
}) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || started) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setStarted(true);
        let t0: number | null = null;
        const step = (ts: number) => {
          if (!t0) t0 = ts;
          const p = Math.min((ts - t0) / duration, 1);
          const ease = 1 - Math.pow(1 - p, 3);
          setCount(Math.floor(ease * target));
          if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
        observer.disconnect();
      }
    }, { threshold: 0.5 });
    observer.observe(el);
    return () => observer.disconnect();
  }, [target, duration, started]);
  return <span ref={ref}>{prefix}{count}{suffix}</span>;
}

// ── Case Study Detail Panel ─────────────────────────────────────
function CaseDetail({ cs }: { cs: typeof CASE_STUDIES[0] }) {
  return (
    <div style={{
      background: "#F8F9FC", border: "1px solid #E2EAF4", borderRadius: 0,
      padding: "44px 48px", minHeight: 380,
      animation: "caseFadeIn 0.25s ease",
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
        <span style={{ color: "#0D1B2A", fontSize: 22, fontWeight: 700 }}>{cs.company}</span>
        <span style={{ color: "#E8A838", fontSize: 16, letterSpacing: 2 }}>★★★★★</span>
      </div>
      <span style={{
        display: "inline-block", background: "#E2EAF4", borderRadius: 999,
        padding: "4px 12px", color: "#64748B", fontSize: 12, margin: "8px 0 28px",
      }}>{cs.industry}</span>

      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {[
          { label: "THE CHALLENGE", text: cs.challenge, italic: true, color: "#0D1B2A" },
          { label: "WHAT WE DID",   text: cs.whatWeDid, italic: false, color: "#64748B" },
          { label: "THE RESULT",    text: cs.result,    italic: false, color: "#0D1B2A", bold: true },
        ].map((block, i) => (
          <div key={i} style={{ paddingTop: i > 0 ? 20 : 0, borderTop: i > 0 ? "1px solid #E2EAF4" : "none" }}>
            <p style={{ color: "#1B6CA8", fontSize: 10, fontWeight: 600, letterSpacing: "2px", textTransform: "uppercase", marginBottom: 8 }}>
              {block.label}
            </p>
            <p style={{ color: block.color, fontSize: 15, lineHeight: 1.7, fontStyle: block.italic ? "italic" : "normal", fontWeight: (block as { bold?: boolean }).bold ? 700 : 400 }}>
              {block.text}
            </p>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 12, marginTop: 32 }}>
        {cs.metrics.map((m) => (
          <div key={m.label} style={{
            flex: 1, background: "white", border: "1px solid #E2EAF4",
            borderRadius: 0, padding: "16px 20px", textAlign: "center",
          }}>
            <p style={{ color: "#E8A838", fontSize: 26, fontWeight: 700, lineHeight: 1 }}>{m.val}</p>
            <p style={{ color: "#64748B", fontSize: 12, marginTop: 4 }}>{m.label}</p>
          </div>
        ))}
      </div>
      <style>{`
        @keyframes caseFadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

// ── Savings Calculator ──────────────────────────────────────────
type VendorBucket = "Just 1" | "2 to 4" | "5+";
type CreditOption = "Yes" | "No";

function calcNewSavings(monthly: number, vendors: VendorBucket, credit: CreditOption) {
  const savingPct = vendors === "Just 1" ? 0.08 : vendors === "2 to 4" ? 0.10 : 0.12;
  const annual = monthly * 12;
  const annualSaving = annual * savingPct;
  const creditMarkup = credit === "Yes" ? annual * 0.12 : 0;
  const upfrontSaving = annual * 0.03;
  const totalValue = annualSaving + creditMarkup;
  const timeSaved = vendors === "Just 1" ? 4 : vendors === "2 to 4" ? 8 : 14;
  return { annual, annualSaving, creditMarkup, upfrontSaving, totalValue, timeSaved };
}

export default function Home() {
  const [monthlySpend, setMonthlySpend] = useState(500000);
  const [vendorBucket, setVendorBucket] = useState<VendorBucket>("2 to 4");
  const [useCredit, setUseCredit] = useState<CreditOption>("Yes");
  const [activeCase, setActiveCase] = useState(0);
  const [showCreditTip, setShowCreditTip] = useState(false);

  const calc = calcNewSavings(monthlySpend, vendorBucket, useCredit);

  const inr = (n: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

      {/* ══════════════════════════════════════════════════════════ */}
      {/*  SECTION 1 — HERO                                         */}
      {/* ══════════════════════════════════════════════════════════ */}
      <section
        className="relative min-h-[90vh] flex flex-col justify-center px-8 md:px-20 overflow-hidden py-24"
        style={{ background: "radial-gradient(circle at 70% 40%, rgba(59,130,246,0.18), transparent 45%), linear-gradient(135deg, #020617 0%, #0f172a 35%, #1e3a8a 65%, #1d4ed8 85%, #2563eb 100%)" }}
      >
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <svg width="100%" height="100%" preserveAspectRatio="none" viewBox="0 0 100 100">
            <path d="M0,20 L20,0 L100,0 L100,80 L80,100 L0,100 Z" fill="none" stroke="white" strokeWidth="0.1" />
            <path d="M10,30 L30,10 L90,10 L90,70 L70,90 L10,90 Z" fill="none" stroke="white" strokeWidth="0.1" />
          </svg>
        </div>

        <div className="relative z-10 w-full max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_460px] gap-12 xl:gap-20 items-center mb-14">
            <div>
              <p className="font-bold tracking-[0.2em] mb-6 text-sm uppercase" style={{ color: "#93c5fd" }}>
                INDIA'S FIRST MANAGED PACKAGING PLATFORM
              </p>
              <h1 className="clash-display text-white text-5xl md:text-[80px] xl:text-[88px] leading-[1.0] mb-8">
                Your Packaging.<br />Sorted. Forever.
              </h1>
              <p className="text-blue-100 text-xl md:text-2xl mb-4 max-w-xl font-light">
                Design. Source. QC. Deliver. One platform.{" "}
                <span className="text-white font-medium italic">Zero vendor chaos.</span>
              </p>
              <p className="text-sm md:text-base font-bold tracking-wide mb-10 uppercase flex items-center gap-2" style={{ color: "#93c5fd" }}>
                <span className="w-1 h-1 rounded-full inline-block" style={{ background: "#93c5fd" }} />
                Built for D2C, FMCG &amp; Pharma Brands Globally
              </p>
              <div className="flex flex-col sm:flex-row gap-5">
                <Link href="/products">
                  <button className="px-10 py-5 font-bold text-lg flex items-center justify-center gap-2 hover:opacity-90 transition-all active:scale-95 whitespace-nowrap" style={{ background: "#E8A838", color: "#0F1C2C" }}>
                    Browse 110+ SKUs <MS icon="arrow_forward" />
                  </button>
                </Link>
                <Link href="/samples">
                  <button className="border-2 border-white/60 text-white px-10 py-5 font-bold text-lg hover:bg-white/10 transition-all active:scale-95">
                    Get a sample from ₹2,999
                  </button>
                </Link>
              </div>
            </div>

            <div className="hidden lg:block relative h-[500px]">
              {HERO_FLOAT_CARDS.map((card) => (
                <div
                  key={card.title}
                  className="float-card absolute px-5 py-4 w-[172px] cursor-default select-none"
                  style={{
                    ...card.pos,
                    background: "rgba(255,255,255,0.08)",
                    backdropFilter: "blur(14px)",
                    WebkitBackdropFilter: "blur(14px)",
                    border: "1px solid rgba(255,255,255,0.15)",
                    animationDelay: card.delay,
                  }}
                >
                  <span className="material-symbols-outlined text-2xl mb-2 block" style={{ color: "#93c5fd" }}>{card.icon}</span>
                  <p className="text-white font-bold text-sm leading-tight mb-1">{card.title}</p>
                  <p className="text-blue-300 text-xs">{card.skus} SKUs available</p>
                </div>
              ))}
            </div>
          </div>

          {/* Stats strip */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 py-10 border-t border-white/15">
            {([
              { target: 110, suffix: "+", label: "SKUs" },
              { target: 500, suffix: "+", label: "Factory Partners" },
              { target: 40,  suffix: "+", label: "Countries Served" },
              { target: 100, suffix: "%", label: "QC Inspected" },
              { amber: true,              label: "Hidden Charges", fixed: "₹0" },
            ] as Array<{ target?: number; suffix?: string; label: string; amber?: boolean; fixed?: string }>).map((s) => (
              <div key={s.label}>
                <p style={{ color: s.amber ? "#E8A838" : "white", fontSize: "1.5rem", fontWeight: 700 }}>
                  {s.fixed ?? <CountUp target={s.target!} suffix={s.suffix} />}
                </p>
                <p className="text-blue-200 text-xs uppercase tracking-widest mt-1 opacity-80">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Client logo marquee */}
          <div className="mt-10 overflow-hidden" style={{ borderTop: "1px solid rgba(255,255,255,0.12)", paddingTop: 20 }}>
            <p className="text-center text-xs font-bold tracking-[0.25em] uppercase mb-5" style={{ color: "rgba(255,255,255,0.5)" }}>
              Trusted by D2C, FMCG &amp; Pharma brands
            </p>
            <div style={{ overflow: "hidden" }}>
              <div className="marquee-track">
                {[...CLIENT_PILLS, ...CLIENT_PILLS].map((name, i) => (
                  <span key={i} className="font-bold text-sm px-5 py-2.5 rounded-full" style={{
                    background: "rgba(255,255,255,0.08)",
                    border: "1px solid rgba(255,255,255,0.15)",
                    color: "white", whiteSpace: "nowrap", flexShrink: 0,
                  }}>{name}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════ */}
      {/*  TEXT MARQUEE STRIP                                        */}
      {/* ══════════════════════════════════════════════════════════ */}
      <div className="overflow-hidden py-3 border-y border-white/10" style={{ background: "#1e3a8a" }}>
        <div className="animate-marquee">
          {MARQUEE_1.map((t, i) => (
            <span key={i} className="text-white font-bold tracking-[0.2em] text-xs uppercase mx-8">{t}</span>
          ))}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════ */}
      {/*  SECTION 4 — PAIN POINTS                                   */}
      {/* ══════════════════════════════════════════════════════════ */}
      <section style={{ background: "#FFFFFF", padding: "100px 0" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 40px" }}>
          <span style={{ color: "#1B6CA8", fontSize: 11, fontWeight: 600, letterSpacing: "2px", textTransform: "uppercase", display: "block", marginBottom: 14 }}>
            THE PROBLEM
          </span>
          <h2 style={{ color: "#0D1B2A", fontSize: "clamp(2rem,4vw,3.25rem)", fontWeight: 700, lineHeight: 1.15, marginBottom: 56 }}>
            Traditional sourcing is broken.<br />We fixed it.
          </h2>

          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5"
            style={{
              gap: 1, background: "#E2EAF4",
              border: "1px solid #E2EAF4", borderRadius: 0, overflow: "hidden",
            }}
          >
            {PAIN_POINTS.map((p, i) => (
              <div
                key={i}
                className="group"
                style={{
                  background: "#FFFFFF", padding: "32px 24px",
                  transition: "background 0.2s", cursor: "default",
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#F8F9FC"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "#FFFFFF"; }}
              >
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#EF4444", display: "block", marginBottom: 24 }} />
                <h3 style={{ color: "#0D1B2A", fontSize: 15, fontWeight: 700, marginBottom: 10 }}>{p.title}</h3>
                <p style={{ color: "#64748B", fontSize: 13, lineHeight: 1.65 }}>{p.body}</p>
              </div>
            ))}
          </div>

          <p style={{ color: "#0D1B2A", fontSize: 22, fontWeight: 700, textAlign: "center", marginTop: 40 }}>
            We built PackOps to eliminate every single one of these.
          </p>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════ */}
      {/*  SECTION 5 — COMPARISON TABLE                             */}
      {/* ══════════════════════════════════════════════════════════ */}
      <section style={{ background: "#F8F9FC", padding: "100px 0" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 40px" }}>
          <span style={{ color: "#1B6CA8", fontSize: 11, fontWeight: 600, letterSpacing: "2px", textTransform: "uppercase", display: "block", marginBottom: 14 }}>
            THE HONEST COMPARISON
          </span>
          <h2 style={{ color: "#0D1B2A", fontSize: "clamp(2rem,4vw,3.25rem)", fontWeight: 700, lineHeight: 1.1, marginBottom: 16 }}>
            Why not just call<br />a vendor directly?
          </h2>
          <p style={{ color: "#64748B", fontSize: 18, maxWidth: 520, marginBottom: 48, lineHeight: 1.6 }}>
            This question comes up every time. Here is the honest answer.
          </p>

          <div style={{ maxWidth: 960, margin: "0 auto", borderRadius: 0, overflow: "hidden", boxShadow: "0 4px 32px rgba(13,27,42,0.08)" }}>
            {/* Header row */}
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1.5fr 1.5fr", borderBottom: "1px solid #E2EAF4" }}>
              <div style={{ background: "#F8F9FC", padding: "20px 28px" }} />
              <div style={{ background: "#0D1B2A", padding: "20px 28px", textAlign: "center" }}>
                <p style={{ color: "white", fontSize: 16, fontWeight: 700 }}>PackOps</p>
                <p style={{ color: "#1B6CA8", fontSize: 11, textTransform: "uppercase", letterSpacing: "1.5px", marginTop: 4 }}>Managed Platform</p>
              </div>
              <div style={{ background: "#E8ECF2", padding: "20px 28px", textAlign: "center" }}>
                <p style={{ color: "#475569", fontSize: 16, fontWeight: 700 }}>Direct Vendor</p>
                <p style={{ color: "#94A3B8", fontSize: 11, textTransform: "uppercase", letterSpacing: "1.5px", marginTop: 4 }}>Traditional Approach</p>
              </div>
            </div>

            {/* Data rows */}
            {[
              { label: "Backup coverage",    good: "3 backup vendors per order",           bad: "One vendor. Their delay is your delay." },
              { label: "QC ownership",       good: "We inspect every dispatch",             bad: "Vendor checks their own work" },
              { label: "True cost of credit",good: "Transparent pricing + 3% upfront discount", bad: "Credit = 10–15% higher per unit" },
              { label: "SKU range",          good: "110+ SKUs. One invoice.",               bad: "One category. Source the rest yourself." },
              { label: "Compliance docs",    good: "ISO, BRC, FDA, FSC. Export-ready.",     bad: "Varies. Risk is yours." },
              { label: "Packaging design",   good: "₹1,999. Files yours forever.",          bad: "Mostly unavailable." },
              { label: "Order tracking",     good: "Real-time dashboard.",                  bad: "WhatsApp messages." },
              { label: "Problem resolution", good: "48-hour resolution guarantee.",         bad: "Call them. Hope they answer." },
            ].map((row, i) => (
              <div
                key={i}
                style={{
                  display: "grid", gridTemplateColumns: "2fr 1.5fr 1.5fr",
                  borderBottom: "1px solid #E2EAF4",
                  background: i % 2 === 0 ? "white" : "#FAFBFC",
                }}
              >
                <div style={{ padding: "18px 28px", color: "#0D1B2A", fontSize: 14, fontWeight: 600, display: "flex", alignItems: "center" }}>
                  {row.label}
                </div>
                <div style={{ padding: "18px 28px", textAlign: "center", background: "rgba(13,27,42,0.015)" }}>
                  <p style={{ color: "#22C55E", fontSize: 18, fontWeight: 700, lineHeight: 1 }}>✓</p>
                  <p style={{ color: "#64748B", fontSize: 12, lineHeight: 1.4, maxWidth: 150, margin: "4px auto 0" }}>{row.good}</p>
                </div>
                <div style={{ padding: "18px 28px", textAlign: "center" }}>
                  <p style={{ color: "#EF4444", fontSize: 18, fontWeight: 700, lineHeight: 1 }}>✗</p>
                  <p style={{ color: "#94A3B8", fontSize: 12, lineHeight: 1.4, maxWidth: 150, margin: "4px auto 0" }}>{row.bad}</p>
                </div>
              </div>
            ))}

            {/* Footer row */}
            <div style={{ gridColumn: "1 / -1", background: "#E8A838", padding: "18px 28px", textAlign: "center" }}>
              <p style={{ color: "#0D1B2A", fontSize: 15, fontWeight: 700 }}>
                Even with their credit — we are still the better financial choice.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════ */}
      {/*  SECTION 6 — HOW IT WORKS                                 */}
      {/* ══════════════════════════════════════════════════════════ */}
      <section style={{ background: "#FFFFFF", padding: "100px 0" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 40px" }}>
          <span style={{ color: "#1B6CA8", fontSize: 11, fontWeight: 600, letterSpacing: "2px", textTransform: "uppercase", display: "block", marginBottom: 14 }}>
            THE PROCESS
          </span>
          <h2 style={{ color: "#0D1B2A", fontSize: "clamp(2rem,4vw,3.25rem)", fontWeight: 700, lineHeight: 1.1, marginBottom: 16 }}>
            From brief to delivered.<br />Every time.
          </h2>
          <p style={{ color: "#64748B", fontSize: 18, maxWidth: 480, marginBottom: 64, lineHeight: 1.6 }}>
            Four steps. Zero ambiguity. One team responsible for all of it.
          </p>

          <div
            className="grid grid-cols-2 md:grid-cols-4"
            style={{ maxWidth: 1000, margin: "0 auto", position: "relative", gap: 0 }}
          >
            {/* Connecting line */}
            <div className="hidden md:block" style={{
              position: "absolute", top: 28,
              left: "calc(12.5%)", right: "calc(12.5%)",
              height: 1,
              background: "linear-gradient(90deg, #E2EAF4, #1B6CA8, #E8A838, #E2EAF4)",
              zIndex: 0,
            }} />

            {HOW_IT_WORKS_STEPS.map((step, i) => {
              const Icon = step.Icon;
              return (
                <div key={i} style={{ position: "relative", zIndex: 1, textAlign: "center", padding: "0 16px" }}>
                  <p style={{ color: "#E8A838", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: 8 }}>
                    {step.num}
                  </p>
                  <div style={{
                    width: 56, height: 56, borderRadius: "50%",
                    background: step.bg,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    margin: "0 auto 24px",
                  }}>
                    <Icon size={22} color="white" />
                  </div>
                  <h3 style={{ color: "#0D1B2A", fontSize: 17, fontWeight: 700, marginBottom: 8 }}>{step.title}</h3>
                  <p style={{ color: "#64748B", fontSize: 13, lineHeight: 1.6 }}>{step.desc}</p>
                </div>
              );
            })}
          </div>

          <div style={{ marginTop: 56, textAlign: "center" }}>
            <Link href="/how-it-works">
              <button style={{
                background: "rgba(232,168,56,0.1)", border: "1px solid #E8A838",
                borderRadius: 2, padding: "10px 24px",
                color: "#0D1B2A", fontSize: 14, fontWeight: 600,
                cursor: "pointer",
              }}>
                See the full process →
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════ */}
      {/*  SECTION 7 — STATS STRIP                                  */}
      {/* ══════════════════════════════════════════════════════════ */}
      <section style={{
        background: "#F8F9FC",
        borderTop: "1px solid #E2EAF4", borderBottom: "1px solid #E2EAF4",
        padding: "56px 0",
      }}>
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 40px" }}>
          <div className="flex flex-col md:flex-row justify-center items-center" style={{ gap: 0 }}>
            {[
              { target: 500, suffix: "+", label: "Verified factory partners", sub: null },
              { target: 1, suffix: "", label: "Owned manufacturing facility", sub: "Flexo + Rotogravure · Indore" },
              { target: 40, suffix: "+", label: "Countries delivered to", sub: null },
            ].map((stat, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 0 }}>
                {i > 0 && (
                  <div className="hidden md:block" style={{ width: 1, height: 52, background: "#E2EAF4", margin: "0 80px" }} />
                )}
                <div style={{ textAlign: "center", padding: "16px 0" }}>
                  <p style={{ color: "#E8A838", fontSize: 52, fontWeight: 700, lineHeight: 1 }}>
                    <CountUp target={stat.target} suffix={stat.suffix} />
                  </p>
                  <p style={{ color: "#64748B", fontSize: 14, marginTop: 4 }}>{stat.label}</p>
                  {stat.sub && (
                    <p style={{ color: "#1B6CA8", fontSize: 11, marginTop: 3, fontWeight: 600 }}>{stat.sub}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════ */}
      {/*  SECTION 8 — PRODUCT CATEGORIES                           */}
      {/* ══════════════════════════════════════════════════════════ */}
      <section style={{ background: "white", padding: "100px 0" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 40px" }}>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-4">
            <div>
              <span style={{ color: "#1B6CA8", fontSize: 11, fontWeight: 600, letterSpacing: "2px", textTransform: "uppercase", display: "block", marginBottom: 14 }}>
                PRODUCTS
              </span>
              <h2 className="clash-display text-4xl" style={{ color: "#0D1B2A" }}>Core Product Categories</h2>
              <p className="mt-2 text-lg" style={{ color: "#64748B" }}>110+ curated SKUs across 10 managed categories.</p>
            </div>
            <Link href="/products">
              <button className="font-bold flex items-center gap-2 hover:underline" style={{ color: "#1B6CA8" }}>
                View full catalog <MS icon="chevron_right" />
              </button>
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
            {CATEGORIES.map((cat) => (
              <Link href={`/products?category=${cat.cat}`} key={cat.title}>
                <div className="group bg-white p-5 shadow-sm hover:-translate-y-2 transition-all cursor-pointer border" style={{ borderColor: "#E2EAF4" }}>
                  <div className="w-full h-36 mb-4 overflow-hidden bg-slate-100">
                    <img
                      src={CAT_IMAGES[cat.cat]}
                      alt={cat.title}
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                    />
                  </div>
                  <h4 className="font-bold text-sm leading-tight mb-1" style={{ color: "#0D1B2A" }}>{cat.title}</h4>
                  <p className="text-xs leading-snug" style={{ color: "#64748B" }}>{cat.sub}</p>
                  <p className="text-xs font-bold mt-2" style={{ color: "#1B6CA8" }}>{cat.skus} SKU{cat.skus !== 1 ? "s" : ""}</p>
                </div>
              </Link>
            ))}
          </div>

          <p style={{ marginTop: 32, textAlign: "center", color: "#64748B", fontSize: 15 }}>
            Need packaging design before ordering?{" "}
            <Link href="/design">
              <span style={{ color: "#1B6CA8", textDecoration: "underline", fontWeight: 600, cursor: "pointer" }}>
                Get print-ready artwork from ₹1,999 →
              </span>
            </Link>
          </p>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════ */}
      {/*  SECTORS (kept per user)                                   */}
      {/* ══════════════════════════════════════════════════════════ */}
      <section style={{ background: "linear-gradient(150deg, #020617 0%, #0a1840 100%)", padding: "100px 0" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 40px" }}>
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
                <div className="group relative overflow-hidden cursor-pointer h-52">
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

      {/* ══════════════════════════════════════════════════════════ */}
      {/*  SMARTSTOCK — responsive: image visible on all screens     */}
      {/* ══════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden" style={{ background: "#0f172a", minHeight: 600 }}>
        {/* Mobile: full-width bg image with dark overlay */}
        <div className="absolute inset-0 lg:hidden">
          <img src="/smartstock.jpg" alt="" className="w-full h-full object-cover" style={{ objectPosition: "center" }} />
          <div className="absolute inset-0" style={{ background: "rgba(15,23,42,0.82)" }} />
        </div>

        {/* Desktop: image on right 52% of section */}
        <div className="absolute top-0 right-0 bottom-0 hidden lg:block" style={{ width: "52%" }}>
          <img src="/smartstock.jpg" alt="SmartStock — India logistics network" className="w-full h-full object-cover" />
          <div className="absolute inset-0" style={{
            background: "linear-gradient(to right, #0f172a 0%, rgba(15,23,42,0.6) 38%, rgba(15,23,42,0.05) 100%)"
          }} />
        </div>

        {/* Content */}
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 min-h-[600px]">
          <div className="px-8 md:px-16 lg:px-20 py-24 flex flex-col justify-center text-white">
            <span className="font-bold tracking-widest mb-6 uppercase text-sm" style={{ color: "#E8A838" }}>SMARTSTOCK™ AI INVENTORY</span>
            <h2 className="clash-display text-4xl mb-8">Never run out of boxes again.</h2>
            <p className="text-slate-400 text-lg mb-10 leading-relaxed">
              Our AI analyses your sales velocity and lead times across 500+ factory partners to automatically trigger replenishment.
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
              <button className="text-white w-fit px-8 py-4 font-bold hover:opacity-90 transition-all" style={{ background: "#1B6CA8" }}>
                See SmartStock in Action
              </button>
            </Link>
          </div>
          <div className="hidden lg:block" />
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════ */}
      {/*  SECTION 9 — ADVANTAGE DIAGRAM                            */}
      {/* ══════════════════════════════════════════════════════════ */}
      <BrandAdvantageSection />

      {/* ══════════════════════════════════════════════════════════ */}
      {/*  SECTION 10 — SUSTAINABLE PACKAGING BAND                  */}
      {/* ══════════════════════════════════════════════════════════ */}
      <section style={{ background: "#0D3B2E", padding: "72px 0" }}>
        <div
          className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center"
          style={{ maxWidth: 1100, margin: "0 auto", padding: "0 40px" }}
        >
          {/* Left */}
          <div>
            <span style={{ color: "#86EFAC", fontSize: 11, fontWeight: 600, letterSpacing: "2px", textTransform: "uppercase", display: "block", marginBottom: 14 }}>
              SUSTAINABLE PACKAGING
            </span>
            <h2 style={{ color: "white", fontSize: "clamp(1.8rem, 3.5vw, 2.75rem)", fontWeight: 700, lineHeight: 1.2, margin: "0 0 20px" }}>
              Eco packaging<br />at real scale.
            </h2>
            <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 16, lineHeight: 1.7, marginBottom: 28 }}>
              12 certified sustainable SKUs. All customisable with your brand design. Food-safe, leak-proof, and built for Indian brands that take sustainability seriously. Full EPR compliance documentation included with every order.
            </p>
            <Link href="/products?category=sustainable">
              <button style={{
                background: "#86EFAC", color: "#0D3B2E",
                padding: "12px 28px", borderRadius: 0, fontSize: 15, fontWeight: 700,
                border: "none", cursor: "pointer",
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.filter = "brightness(0.95)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.filter = "brightness(1)"; }}
              >
                See all sustainable SKUs →
              </button>
            </Link>
          </div>

          {/* Right */}
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {[
              { Icon: Leaf,        title: "12 certified sustainable SKUs", desc: "Kraft, compostable, recycled, and mono-material" },
              { Icon: Droplets,    title: "Food-safe and leak-proof",      desc: "Tested for spices, gravies, and Indian food products" },
              { Icon: FileCheck,   title: "EPR compliance included",       desc: "Full documentation for your annual filing" },
            ].map((row, i) => {
              const Icon = row.Icon;
              return (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                  <div style={{
                    background: "rgba(134,239,172,0.15)", width: 40, height: 40,
                    borderRadius: "50%", display: "flex", alignItems: "center",
                    justifyContent: "center", flexShrink: 0,
                  }}>
                    <Icon size={18} color="#86EFAC" />
                  </div>
                  <div>
                    <p style={{ color: "white", fontSize: 14, fontWeight: 700, marginBottom: 2 }}>{row.title}</p>
                    <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 13 }}>{row.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════ */}
      {/*  SECTION 11 — CASE STUDIES                                */}
      {/* ══════════════════════════════════════════════════════════ */}
      <section style={{ background: "#FFFFFF", padding: "100px 0" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 40px" }}>
          <span style={{ color: "#1B6CA8", fontSize: 11, fontWeight: 600, letterSpacing: "2px", textTransform: "uppercase", display: "block", marginBottom: 14 }}>
            CLIENT RESULTS
          </span>
          <h2 style={{ color: "#0D1B2A", fontSize: "clamp(2rem,4vw,3.25rem)", fontWeight: 700, lineHeight: 1.1, marginBottom: 56 }}>
            Brands that switched.<br />Numbers that speak.
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-6 items-start" style={{ maxWidth: 1100, margin: "0 auto" }}>
            {/* Left: selector cards */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {CASE_STUDIES.map((cs, i) => {
                const isActive = activeCase === i;
                return (
                  <div
                    key={i}
                    onClick={() => setActiveCase(i)}
                    style={{
                      background: isActive ? "rgba(232,168,56,0.04)" : "white",
                      border: `1px solid ${isActive ? "#E8A838" : "#E2EAF4"}`,
                      borderRadius: 0, padding: "20px 24px",
                      cursor: "pointer", position: "relative", overflow: "hidden",
                      transition: "all 0.2s",
                      boxShadow: isActive ? "0 2px 12px rgba(232,168,56,0.12)" : "none",
                    }}
                  >
                    {isActive && (
                      <div style={{
                        position: "absolute", left: 0, top: 0, bottom: 0,
                        width: 3, background: "#E8A838", borderRadius: "3px 0 0 3px",
                      }} />
                    )}
                    <div style={{
                      width: 36, height: 36, borderRadius: "50%",
                      background: "#0D1B2A", color: "white",
                      fontSize: 14, fontWeight: 700,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      marginBottom: 10,
                    }}>
                      {cs.initials}
                    </div>
                    <p style={{ color: "#0D1B2A", fontSize: 15, fontWeight: 700 }}>{cs.company}</p>
                    <p style={{ color: "#64748B", fontSize: 12, marginTop: 3 }}>{cs.industry}</p>
                    <div style={{
                      display: "inline-block", marginTop: 10,
                      background: "rgba(232,168,56,0.1)", borderRadius: 0,
                      padding: "4px 10px",
                    }}>
                      <span style={{ color: "#E8A838", fontSize: 12, fontWeight: 700 }}>{cs.metric}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right: detail card */}
            <CaseDetail cs={CASE_STUDIES[activeCase]} />
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════ */}
      {/*  SECTION 12 — SAVINGS CALCULATOR                          */}
      {/* ══════════════════════════════════════════════════════════ */}
      <section style={{ background: "#F8F9FC", padding: "100px 0" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 40px" }}>
          <span style={{ color: "#1B6CA8", fontSize: 11, fontWeight: 600, letterSpacing: "2px", textTransform: "uppercase", display: "block", marginBottom: 14 }}>
            THE NUMBERS
          </span>
          <h2 style={{ color: "#0D1B2A", fontSize: "clamp(2rem,4vw,3.25rem)", fontWeight: 700, lineHeight: 1.1, marginBottom: 16 }}>
            How much is vendor<br />chaos costing you?
          </h2>
          <p style={{ color: "#64748B", fontSize: 18, marginBottom: 56 }}>
            Most brands overpay by 8–15% without realising it. Calculate your real cost.
          </p>

          <div style={{
            maxWidth: 900, margin: "0 auto",
            background: "white", border: "1px solid #E2EAF4",
            borderRadius: 0, padding: "48px",
            boxShadow: "0 4px 24px rgba(13,27,42,0.06)",
          }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-14 items-start">

              {/* ── Left: Inputs ── */}
              <div>
                {/* Input 1: spend slider */}
                <div style={{ marginBottom: 32 }}>
                  <label style={{ color: "#0D1B2A", fontSize: 14, fontWeight: 600, display: "block", marginBottom: 16 }}>
                    Monthly packaging spend
                  </label>
                  <input
                    type="range"
                    min={50000} max={5000000} step={10000}
                    value={monthlySpend}
                    onChange={e => setMonthlySpend(Number(e.target.value))}
                    style={{ width: "100%", accentColor: "#E8A838", cursor: "pointer" }}
                  />
                  <p style={{ color: "#E8A838", fontSize: 22, fontWeight: 700, textAlign: "center", marginTop: 8 }}>
                    {inr(monthlySpend)}<span style={{ fontSize: 13, fontWeight: 400, color: "#94A3B8" }}>/mo</span>
                  </p>
                </div>

                {/* Input 2: vendor pills */}
                <div style={{ marginBottom: 28 }}>
                  <label style={{ color: "#0D1B2A", fontSize: 14, fontWeight: 600, display: "block", marginBottom: 12 }}>
                    Vendors you currently manage
                  </label>
                  <div style={{ display: "flex", gap: 8 }}>
                    {(["Just 1", "2 to 4", "5+"] as VendorBucket[]).map((opt) => (
                      <button
                        key={opt}
                        onClick={() => setVendorBucket(opt)}
                        style={{
                          border: `1px solid ${vendorBucket === opt ? "#0D1B2A" : "#E2EAF4"}`,
                          borderRadius: 0, padding: "8px 20px",
                          fontSize: 14, cursor: "pointer",
                          background: vendorBucket === opt ? "#0D1B2A" : "white",
                          color: vendorBucket === opt ? "white" : "#64748B",
                          transition: "all 0.15s",
                        }}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Input 3: credit pills */}
                <div>
                  <label style={{ color: "#0D1B2A", fontSize: 14, fontWeight: 600, display: "block", marginBottom: 12 }}>
                    Do you receive credit from vendor?
                  </label>
                  <div style={{ display: "flex", gap: 8 }}>
                    {(["Yes", "No"] as CreditOption[]).map((opt) => (
                      <button
                        key={opt}
                        onClick={() => setUseCredit(opt)}
                        style={{
                          border: `1px solid ${useCredit === opt ? "#0D1B2A" : "#E2EAF4"}`,
                          borderRadius: 0, padding: "8px 20px",
                          fontSize: 14, cursor: "pointer",
                          background: useCredit === opt ? "#0D1B2A" : "white",
                          color: useCredit === opt ? "white" : "#64748B",
                          transition: "all 0.15s",
                        }}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* ── Right: Outputs ── */}
              <div>
                {/* Row 1: Annual saving */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", paddingBottom: 16, marginBottom: 16, borderBottom: "1px solid #E2EAF4" }}>
                  <span style={{ color: "#64748B", fontSize: 14 }}>Estimated annual saving</span>
                  <span style={{ color: "#22C55E", fontSize: 28, fontWeight: 700, lineHeight: 1 }}>{inr(calc.annualSaving)}</span>
                </div>

                {/* Row 2: Credit markup (if Yes) */}
                {useCredit === "Yes" && (
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", paddingBottom: 16, marginBottom: 16, borderBottom: "1px solid #E2EAF4" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ color: "#64748B", fontSize: 14 }}>Hidden credit markup you pay</span>
                      <div style={{ position: "relative" }}>
                        <Info
                          size={14}
                          color="#94A3B8"
                          style={{ cursor: "pointer" }}
                          onMouseEnter={() => setShowCreditTip(true)}
                          onMouseLeave={() => setShowCreditTip(false)}
                        />
                        {showCreditTip && (
                          <div style={{
                            position: "absolute", bottom: 24, left: -90, width: 200,
                            background: "#0D1B2A", color: "white", fontSize: 12,
                            padding: "8px 12px", borderRadius: 2, zIndex: 100, lineHeight: 1.5,
                            boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
                          }}>
                            Credit pricing is typically 10–15% above cash price. This is embedded in your vendor's per-unit quote.
                          </div>
                        )}
                      </div>
                    </div>
                    <span style={{ color: "#EF4444", fontSize: 24, fontWeight: 700, lineHeight: 1 }}>+{inr(calc.creditMarkup)}</span>
                  </div>
                )}

                {/* Row 3: Upfront saving */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", paddingBottom: 16, marginBottom: 16, borderBottom: "1px solid #E2EAF4" }}>
                  <span style={{ color: "#64748B", fontSize: 14 }}>Extra saving if you pay upfront</span>
                  <span style={{ color: "#E8A838", fontSize: 22, fontWeight: 700, lineHeight: 1 }}>+{inr(calc.upfrontSaving)}</span>
                </div>

                {/* Row 4: Total */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <span style={{ color: "#0D1B2A", fontSize: 16, fontWeight: 700 }}>Total annual value</span>
                  <span style={{ color: "#0D1B2A", fontSize: 36, fontWeight: 700, lineHeight: 1 }}>{inr(calc.totalValue)}</span>
                </div>

                <p style={{ color: "#64748B", fontSize: 14, marginBottom: 24 }}>
                  Time saved per month:{" "}
                  <span style={{ color: "#0D1B2A", fontWeight: 700 }}>{calc.timeSaved} hours</span>
                </p>

                <Link href="/quote">
                  <button style={{
                    width: "100%", background: "#E8A838", color: "#0D1B2A",
                    padding: 14, borderRadius: 0, fontSize: 15, fontWeight: 700,
                    border: "none", cursor: "pointer",
                  }}>
                    Get a quote — see real prices →
                  </button>
                </Link>

                <p style={{ color: "#94A3B8", fontSize: 12, textAlign: "center", marginTop: 10 }}>
                  Estimates based on industry averages. Actual savings confirmed in your quote.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════ */}
      {/*  SECTION 13 — FINAL CTA                                   */}
      {/* ══════════════════════════════════════════════════════════ */}
      <section
        className="relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #0D1B2A 0%, #0F2744 100%)", padding: "120px 0", textAlign: "center" }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: "repeating-linear-gradient(45deg, rgba(255,255,255,0.03) 0, rgba(255,255,255,0.03) 1px, transparent 0, transparent 50%)",
            backgroundSize: "20px 20px",
          }}
        />
        <div className="relative z-10" style={{ maxWidth: 600, margin: "0 auto", padding: "0 40px" }}>
          <span style={{ color: "#1B6CA8", fontSize: 11, fontWeight: 600, letterSpacing: "2px", textTransform: "uppercase", display: "block", marginBottom: 20 }}>
            GET STARTED
          </span>
          <h2 style={{ color: "white", fontSize: "clamp(2.5rem,6vw,4rem)", fontWeight: 700, lineHeight: 1.1, marginBottom: 20 }}>
            Packaging sorted.<br />Forever.
          </h2>
          <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 19, maxWidth: 460, margin: "0 auto 48px", lineHeight: 1.6 }}>
            Join brands across India and 40+ countries who have simplified their packaging supply chain.
          </p>

          <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/products">
              <button
                style={{ background: "#E8A838", color: "#0D1B2A", padding: "16px 36px", borderRadius: 0, fontSize: 16, fontWeight: 700, border: "none", cursor: "pointer" }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.filter = "brightness(1.08)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.filter = "brightness(1)"; }}
              >
                Browse 110+ SKUs →
              </button>
            </Link>
            <a href={`https://wa.me/${WHATSAPP_NUM}?text=Hi%20PackOps%2C%20I%27d%20like%20to%20discuss%20packaging.`} target="_blank" rel="noopener noreferrer">
              <button
                style={{
                  background: "transparent", color: "white",
                  border: "2px solid rgba(255,255,255,0.3)",
                  padding: "16px 36px", borderRadius: 0, fontSize: 16, fontWeight: 600, cursor: "pointer",
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "white"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.3)"; }}
              >
                WhatsApp Us
              </button>
            </a>
          </div>

          <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 13, marginTop: 40 }}>
            Quote in 48 hours &nbsp;·&nbsp; No commitment until you approve &nbsp;·&nbsp; Sample from ₹2,999 &nbsp;·&nbsp; Design from ₹1,999
          </p>
        </div>
      </section>

    </div>
  );
}
