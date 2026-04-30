import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import { INDUSTRY_IMAGES } from "@/lib/images";
import BrandAdvantageSection from "@/components/home/BrandAdvantageSection";
import {
  Search, GitBranch, ShieldCheck, Truck,
  Leaf, Droplets, FileCheck, ArrowRight,
  Package, ShoppingBag, Box, Tag, Gift,
} from "lucide-react";

const WHATSAPP_NUM = "918208990366";

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

const LOGO_ROW_1 = [
  { name: "Plum",             file: "/images/logos/plum.png" },
  { name: "The Souled Store", file: "/images/logos/souledstore.png" },
  { name: "Neeman's",         file: "/images/logos/neemans.png" },
  { name: "MVMT",             file: "/images/logos/mvmt.gif" },
  { name: "CosIQ",            file: "/images/logos/cosiq.png" },
  { name: "Rage Coffee",      file: "/images/logos/ragecoffee.png" },
];
const LOGO_ROW_2 = [
  { name: "Juicy Chemistry",  file: "/images/logos/juicychemistry.png" },
  { name: "Mogu Mogu",        file: "/images/logos/mogumogi.png" },
  { name: "Olipop",           file: "/images/logos/olipop.webp" },
  { name: "Voltas",           file: "/images/logos/voltas.png" },
  { name: "Pilgrim",          file: "/images/logos/pilgrim.png" },
];

const HERO_CARDS = [
  {
    title: "Flexible Packaging", Icon: Package, count: "15 SKUs", slug: "flexible", badge: true,
    pos: { top: "5%", left: "10%" }, width: 180,
    floatAnim: "float-1 6s ease-in-out infinite",
    entranceDelay: "0.3s", greenBorder: false,
  },
  {
    title: "E-commerce Packs", Icon: ShoppingBag, count: "17 SKUs", slug: "ecommerce", badge: true,
    pos: { top: "3%", left: "52%" }, width: 170,
    floatAnim: "float-2 7s ease-in-out -2s infinite",
    entranceDelay: "0.5s", greenBorder: false,
  },
  {
    title: "Boxes & Cartons", Icon: Box, count: "9 SKUs", slug: "boxes", badge: false,
    pos: { top: "38%", left: "5%" }, width: 175,
    floatAnim: "float-3 5.5s ease-in-out -1s infinite",
    entranceDelay: "0.4s", greenBorder: false,
  },
  {
    title: "Sustainable", Icon: Leaf, count: "12 SKUs", slug: "sustainable", badge: false,
    pos: { top: "35%", left: "55%" }, width: 165,
    floatAnim: "float-4 6.5s ease-in-out -3s infinite",
    entranceDelay: "0.7s", greenBorder: true,
  },
  {
    title: "Labels & Closures", Icon: Tag, count: "14 SKUs", slug: "labels", badge: false,
    pos: { top: "68%", left: "12%" }, width: 175,
    floatAnim: "float-5 7.5s ease-in-out -1.5s infinite",
    entranceDelay: "0.6s", greenBorder: false,
  },
  {
    title: "Premium & Gift", Icon: Gift, count: "10 SKUs", slug: "premium", badge: false,
    pos: { top: "65%", left: "52%" }, width: 170,
    floatAnim: "float-6 6s ease-in-out -4s infinite",
    entranceDelay: "0.8s", greenBorder: false,
  },
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
  premium:     "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=600&h=400&fit=crop&q=75",
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
    bg: "#0D1B2A",
  },
  {
    num: "Step 04",
    Icon: Truck,
    title: "Delivered and Tracked",
    desc: "Door to door logistics. Real-time tracking in your dashboard. India or global.",
    bg: "#0D1B2A",
  },
];

const CASE_STUDIES = [
  {
    initials: "ZF",
    company: "Zestful Foods",
    industry: "D2C Snacks · Mumbai",
    metric: "7 vendors → 1 platform",
    challenge: "We were managing 7 different packaging vendors for our snack range. Every month was a coordination nightmare — delays from one vendor cascaded across our entire production schedule.",
    whatWeDid: "Consolidated all 7 SKUs onto the Packworkz platform. Assigned backup vendors for each. Integrated their reorder into the dashboard with SmartStock pre-positioning.",
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
    whatWeDid: "Moved cosmetic jar and carton orders to Packworkz. Pre-dispatch inspection with photo evidence on every batch. Design also migrated — artwork now stored on platform.",
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
      background: "#F8F9FC",
      border: "1px solid #E2EAF4",
      borderTop: "3px solid #E8A838",
      padding: "44px 48px",
      minHeight: 380,
    }}>
      <div key={cs.company} style={{ animation: "caseFadeIn 0.25s ease-out" }}>
        {/* Top row */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
          <span style={{ color: "#0D1B2A", fontSize: 24, fontWeight: 700 }}>{cs.company}</span>
          <span style={{ color: "#E8A838", fontSize: 18, letterSpacing: 2 }}>★★★★★</span>
        </div>

        {/* Industry tag */}
        <span style={{
          display: "inline-block", background: "#E2EAF4",
          padding: "5px 14px", color: "#64748B", fontSize: 12, marginBottom: 32,
        }}>{cs.industry}</span>

        {/* Content blocks */}
        {[
          { label: "THE CHALLENGE", text: cs.challenge, italic: true,  color: "#64748B",  bold: false },
          { label: "WHAT WE DID",   text: cs.whatWeDid, italic: true,  color: "#64748B",  bold: false },
          { label: "THE RESULT",    text: cs.result,    italic: false, color: "#0D1B2A",  bold: true  },
        ].map((block, i) => (
          <div key={i}>
            {i > 0 && <div style={{ height: 1, background: "#E8ECF4", margin: "24px 0" }} />}
            <p style={{ color: "#1B6CA8", fontSize: 10, fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", marginBottom: 10 }}>
              {block.label}
            </p>
            <p style={{ color: block.color, fontSize: 15, lineHeight: 1.75, fontStyle: block.italic ? "italic" : "normal", fontWeight: block.bold ? 600 : 400 }}>
              {block.text}
            </p>
          </div>
        ))}

        {/* Metric boxes */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginTop: 32 }}>
          {cs.metrics.map((m) => (
            <div key={m.label} style={{
              background: "white", border: "1px solid #E2EAF4",
              padding: "18px 20px", textAlign: "center",
            }}>
              <p style={{ color: "#E8A838", fontSize: 26, fontWeight: 700, lineHeight: 1 }}>{m.val}</p>
              <p style={{ color: "#64748B", fontSize: 12, marginTop: 6 }}>{m.label}</p>
            </div>
          ))}
        </div>
      </div>
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
  const [heroLoaded, setHeroLoaded] = useState(false);
  const [stepsVisible, setStepsVisible] = useState(false);
  const caseIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const processRef = useRef<HTMLDivElement>(null);

  const startCaseRotation = () => {
    if (caseIntervalRef.current) clearInterval(caseIntervalRef.current);
    caseIntervalRef.current = setInterval(() => {
      setActiveCase(prev => (prev + 1) % CASE_STUDIES.length);
    }, 4000);
  };

  useEffect(() => {
    startCaseRotation();
    return () => { if (caseIntervalRef.current) clearInterval(caseIntervalRef.current); };
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setHeroLoaded(true), 100);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const el = processRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setStepsVisible(true); obs.disconnect(); }
    }, { threshold: 0.15 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const calc = calcNewSavings(monthlySpend, vendorBucket, useCredit);

  const inr = (n: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

  // ── Count-up for hero saving number ────────────────────────────
  const [displayedSaving, setDisplayedSaving] = useState(calc.annualSaving);
  const animRef = useRef<number | null>(null);
  const fromRef = useRef(calc.annualSaving);

  useEffect(() => {
    const from = fromRef.current;
    const to = calc.annualSaving;
    if (from === to) return;
    const start = performance.now();
    const duration = 400;
    if (animRef.current) cancelAnimationFrame(animRef.current);
    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplayedSaving(Math.round(from + (to - from) * eased));
      if (t < 1) animRef.current = requestAnimationFrame(tick);
      else fromRef.current = to;
    };
    animRef.current = requestAnimationFrame(tick);
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [calc.annualSaving]);

  // Slider fill percentage
  const sliderPct = Math.round(((monthlySpend - 50000) / (5000000 - 50000)) * 100);

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

      {/* ══════════════════════════════════════════════════════════ */}
      {/*  SECTION 1 — HERO                                         */}
      {/* ══════════════════════════════════════════════════════════ */}
      <section
        className="relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #020817 0%, #071a45 40%, #153e9f 100%)",
          minHeight: 620,
        }}
      >
        {/* Subtle geometric lines */}
        <div className="absolute inset-0 opacity-[0.07] pointer-events-none">
          <svg width="100%" height="100%" preserveAspectRatio="none" viewBox="0 0 100 100">
            <path d="M0,20 L20,0 L100,0 L100,80 L80,100 L0,100 Z" fill="none" stroke="white" strokeWidth="0.15" />
            <path d="M10,30 L30,10 L90,10 L90,70 L70,90 L10,90 Z" fill="none" stroke="white" strokeWidth="0.1" />
          </svg>
        </div>

        {/* Blue radial glow behind products */}
        <div
          className="hidden lg:block absolute pointer-events-none"
          style={{
            right: "-2%",
            bottom: "-5%",
            width: "58%",
            height: "110%",
            background: "radial-gradient(circle at 50% 60%, rgba(59,130,246,0.38) 0%, transparent 65%)",
          }}
        />

        {/* Golden arc ring behind products */}
        <svg
          className="hidden lg:block absolute pointer-events-none"
          style={{ right: "1%", bottom: "2%", width: "52%", height: "90%", opacity: heroLoaded ? 0.55 : 0, transition: "opacity 1.2s ease" }}
          viewBox="0 0 500 500"
          fill="none"
        >
          <circle cx="250" cy="270" r="210" stroke="url(#goldArc)" strokeWidth="1.5" strokeDasharray="900 400" strokeDashoffset="200" />
          <circle cx="250" cy="270" r="235" stroke="url(#goldArc2)" strokeWidth="0.7" strokeDasharray="600 600" strokeDashoffset="100" />
          <defs>
            <linearGradient id="goldArc" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#E8A838" stopOpacity="0" />
              <stop offset="35%" stopColor="#E8A838" stopOpacity="0.9" />
              <stop offset="65%" stopColor="#f5d08a" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#E8A838" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="goldArc2" x1="1" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#E8A838" stopOpacity="0" />
              <stop offset="50%" stopColor="#E8A838" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#E8A838" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>

        {/* Floor reflection — flipped image fading up from bottom edge */}
        <img
          src="/images/hero-products-transparent.png"
          aria-hidden="true"
          className="hidden lg:block absolute pointer-events-none select-none"
          style={{
            right: 0,
            bottom: 0,
            height: "28%",
            width: "auto",
            maxWidth: "56%",
            objectFit: "contain",
            objectPosition: "right top",
            transform: "scaleY(-1)",
            opacity: heroLoaded ? 0.22 : 0,
            transition: "opacity 1.2s ease",
            maskImage: "linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.2) 50%, transparent 100%)",
            WebkitMaskImage: "linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.2) 50%, transparent 100%)",
            filter: "blur(3px) saturate(0.6)",
          }}
        />

        {/* Main product image */}
        <img
          src="/images/hero-products-transparent.png"
          alt="Premium packaging products"
          className="hidden lg:block absolute pointer-events-none"
          style={{
            right: 0,
            bottom: 0,
            height: "85%",
            width: "auto",
            maxWidth: "56%",
            objectFit: "contain",
            objectPosition: "right bottom",
            opacity: heroLoaded ? 1 : 0,
            transition: "opacity 1s ease",
            animation: heroLoaded ? "heroProductFloat 5s ease-in-out infinite" : "none",
            filter: "drop-shadow(0 24px 48px rgba(0,0,20,0.65)) drop-shadow(0 0 60px rgba(59,130,246,0.2))",
          }}
        />

        {/* Vignette — protects left text, softens right edges */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse at 72% 50%, transparent 28%, rgba(2,8,23,0.5) 100%)" }}
        />

        {/* Left content */}
        <div className="relative z-10 max-w-7xl mx-auto px-8 md:px-20 pt-28 pb-14">
          {/* All text + CTAs + stats pinned to left column */}
          <div className="lg:max-w-[48%]">
            <p className="font-bold tracking-[0.2em] mb-5 text-sm uppercase" style={{ color: "#93c5fd" }}>
              INDIA'S FIRST MANAGED PACKAGING PLATFORM
            </p>
            <h1 className="clash-display text-white leading-[1.05] mb-6" style={{ fontSize: "clamp(2.6rem, 5vw, 5rem)" }}>
              Your Packaging.<br />Sorted. Forever.
            </h1>
            <p className="text-blue-100 text-lg md:text-xl mb-3 max-w-lg font-light">
              Design. Source. QC. Deliver. One platform.{" "}
              <span className="text-white font-medium italic">Zero vendor chaos.</span>
            </p>
            <p className="text-sm font-bold tracking-wide mb-9 uppercase flex items-center gap-2" style={{ color: "#93c5fd" }}>
              <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: "#93c5fd" }} />
              Built for D2C, FMCG &amp; Pharma Brands Globally
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <Link href="/products">
                <button className="btn-fill btn-amber px-9 py-4 text-base whitespace-nowrap">
                  <span>Browse 110+ SKUs</span><MS icon="arrow_forward" />
                </button>
              </Link>
              <Link href="/samples">
                <button className="btn-fill btn-outline-white px-9 py-4 text-base">
                  <span>Get a sample from ₹2,999</span>
                </button>
              </Link>
            </div>

            {/* Stats badges — locked inside left column */}
            <div className="flex flex-wrap gap-x-7 gap-y-3 pt-7 border-t border-white/15">
              {[
                { icon: "inventory_2",       value: "110+", label: "Packaging SKUs" },
                { icon: "workspace_premium", value: "500+", label: "Brands Served" },
                { icon: "public",            value: "20+",  label: "Countries" },
                { icon: "verified",          value: "Zero", label: "Quality Compromise" },
              ].map((s) => (
                <div key={s.label} className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-amber-400" style={{ fontSize: 17 }}>{s.icon}</span>
                  <span className="text-white font-bold text-sm">{s.value}</span>
                  <span className="text-blue-300 text-xs uppercase tracking-wider">{s.label}</span>
                </div>
              ))}
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
      {/*  SECTION 3B — OUR CUSTOMERS (2-col: text + marquee)      */}
      {/* ══════════════════════════════════════════════════════════ */}
      <section style={{ background: "#FFFFFF", borderBottom: "1px solid #E2EAF4", padding: "72px 0", overflow: "hidden" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 40px", display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: 72, alignItems: "center" }}>

          {/* Left: text */}
          <div>
            <p style={{ color: "#1B6CA8", fontSize: 11, fontWeight: 700, letterSpacing: "2.5px", textTransform: "uppercase", marginBottom: 16 }}>
              OUR CUSTOMERS
            </p>
            <h2 style={{ color: "#0D1B2A", fontSize: 34, fontWeight: 800, lineHeight: 1.15, marginBottom: 18 }}>
              Trusted by India's fastest-growing brands.
            </h2>
            <p style={{ color: "#475569", fontSize: 15, lineHeight: 1.75, marginBottom: 32 }}>
              From D2C beauty &amp; wellness to FMCG and pharma — India's leading brands rely on Packworkz for consistent, compliant, beautiful packaging.
            </p>
            <div style={{ display: "flex", gap: 36, alignItems: "center" }}>
              <div>
                <p style={{ color: "#0D1B2A", fontSize: 30, fontWeight: 800, lineHeight: 1, marginBottom: 4 }}>220+</p>
                <p style={{ color: "#94A3B8", fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>Brands served</p>
              </div>
              <div style={{ width: 1, height: 44, background: "#E2EAF4" }} />
              <div>
                <p style={{ color: "#0D1B2A", fontSize: 30, fontWeight: 800, lineHeight: 1, marginBottom: 4 }}>98.7%</p>
                <p style={{ color: "#94A3B8", fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>On-time delivery</p>
              </div>
            </div>
          </div>

          {/* Right: 2-row logo marquee */}
          <div style={{
            overflow: "hidden",
            maskImage: "linear-gradient(to right, transparent 0%, black 14%, black 86%, transparent 100%)",
            WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 14%, black 86%, transparent 100%)",
          }}>
            {/* Row 1 — standard speed, unique set */}
            <div style={{ overflow: "hidden", marginBottom: 20 }}>
              <div className="logo-row">
                {[...LOGO_ROW_1, ...LOGO_ROW_1].map((logo, i) => (
                  <div key={i} style={{
                    width: 160, height: 72, flexShrink: 0,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    marginRight: 2,
                  }}>
                    <img
                      src={logo.file} alt={logo.name}
                      style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Row 2 — slower, different set */}
            <div style={{ overflow: "hidden" }}>
              <div className="logo-row-slow">
                {[...LOGO_ROW_2, ...LOGO_ROW_2].map((logo, i) => (
                  <div key={i} style={{
                    width: 160, height: 72, flexShrink: 0,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    marginRight: 2,
                  }}>
                    <img
                      src={logo.file} alt={logo.name}
                      style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </section>

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
            We built Packworkz to eliminate every single one of these.
          </p>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════ */}
      {/*  SECTION 6 — HOW IT WORKS (dark animated timeline)        */}
      {/* ══════════════════════════════════════════════════════════ */}
      <section style={{ background: "#0A1628", padding: "100px 0" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 40px" }}>
          {/* Heading */}
          <div style={{ textAlign: "center", marginBottom: 80 }}>
            <span style={{ color: "#E8A838", fontSize: 11, fontWeight: 600, letterSpacing: "2px", textTransform: "uppercase", display: "block", marginBottom: 14 }}>
              THE PROCESS
            </span>
            <h2 style={{ color: "white", fontSize: "clamp(2rem,4vw,3.25rem)", fontWeight: 700, lineHeight: 1.1, marginBottom: 16 }}>
              From brief to delivered.<br />Every time.
            </h2>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 18, maxWidth: 480, margin: "0 auto", lineHeight: 1.6 }}>
              Four steps. Zero ambiguity. One team responsible for all of it.
            </p>
          </div>

          {/* Timeline track */}
          <div ref={processRef} style={{ position: "relative" }}>
            {/* Horizontal connector line */}
            <div style={{
              position: "absolute",
              top: 56,
              left: "calc(12.5% + 32px)",
              right: "calc(12.5% + 32px)",
              height: 1,
              background: "linear-gradient(to right, rgba(232,168,56,0.6), rgba(232,168,56,0.2), rgba(232,168,56,0.6))",
              zIndex: 0,
            }} />

            <div className="grid grid-cols-2 md:grid-cols-4" style={{ gap: 0 }}>
              {HOW_IT_WORKS_STEPS.map((step, i) => {
                const Icon = step.Icon;
                return (
                  <div
                    key={i}
                    style={{
                      padding: "0 32px",
                      textAlign: "center",
                      opacity: stepsVisible ? 1 : 0,
                      transform: stepsVisible ? "translateY(0)" : "translateY(32px)",
                      transition: `opacity 0.55s ease ${i * 0.13}s, transform 0.55s ease ${i * 0.13}s`,
                    }}
                  >
                    {/* Step label */}
                    <p style={{
                      color: "#E8A838", fontSize: 10, fontWeight: 700,
                      letterSpacing: "2px", textTransform: "uppercase",
                      marginBottom: 16,
                    }}>
                      {step.num}
                    </p>

                    {/* Icon box */}
                    <div style={{
                      width: 64, height: 64,
                      background: "#E8A838",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      margin: "0 auto 32px",
                      position: "relative", zIndex: 1,
                      boxShadow: "0 0 0 8px rgba(232,168,56,0.12)",
                    }}>
                      <Icon size={26} color="#0A1628" strokeWidth={2.5} />
                    </div>

                    {/* Title */}
                    <h3 style={{
                      color: "white", fontSize: 15, fontWeight: 700,
                      marginBottom: 12, textTransform: "uppercase",
                      letterSpacing: "0.5px", lineHeight: 1.3,
                    }}>
                      {step.title}
                    </h3>

                    {/* Description */}
                    <p style={{
                      color: "rgba(255,255,255,0.42)", fontSize: 13,
                      lineHeight: 1.7, margin: 0,
                    }}>
                      {step.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ marginTop: 64, textAlign: "center" }}>
            <Link href="/how-it-works">
              <span style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                color: "#E8A838", fontSize: 14, fontWeight: 600,
                cursor: "pointer",
                borderBottom: "1px solid rgba(232,168,56,0.3)",
                paddingBottom: 2,
                transition: "border-color 0.2s",
              }}>
                See the full process
                <ArrowRight size={15} />
              </span>
            </Link>
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
              <button className="btn-fill btn-blue w-fit px-8 py-4">
                <span>See SmartStock in Action</span>
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
      <section style={{ background: "#0A3326", padding: "88px 0", position: "relative", overflow: "hidden" }}>

        {/* Layer 1: Photo background */}
        <img
          src="/images/sustainable-bg.jpg"
          alt=""
          style={{
            position: "absolute", inset: 0,
            width: "100%", height: "100%",
            objectFit: "cover", objectPosition: "center",
            zIndex: 0,
          }}
        />

        {/* Layer 2: Dark overlay */}
        <div style={{
          position: "absolute", inset: 0,
          background: "rgba(10,51,38,0.78)",
          zIndex: 1,
        }} />

        {/* Layer 3: Subtle radial accent */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none", zIndex: 2,
          background: "radial-gradient(ellipse 60% 70% at 85% 15%, rgba(34,197,94,0.15) 0%, transparent 60%)",
        }} />

        {/* Content */}
        <div
          className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center"
          style={{ maxWidth: 1100, margin: "0 auto", padding: "0 40px", position: "relative", zIndex: 3 }}
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
              <button className="btn-fill btn-amber px-7 py-3 text-sm">
                <span>See all sustainable SKUs →</span>
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
                    display: "flex", alignItems: "center",
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
      {/*  SECTION 5 — COMPARISON TABLE                             */}
      {/* ══════════════════════════════════════════════════════════ */}
      <section style={{ background: "#F8F9FC", padding: "100px 0" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 40px" }}>
          <span style={{ color: "#1B6CA8", fontSize: 11, fontWeight: 600, letterSpacing: "2px", textTransform: "uppercase", display: "block", marginBottom: 14 }}>
            THE HONEST COMPARISON
          </span>
          <h2 style={{ color: "#0D1B2A", fontSize: "clamp(2rem,4vw,3.25rem)", fontWeight: 700, lineHeight: 1.1, marginBottom: 16 }}>
            Why brands switch<br />to Packworkz.
          </h2>
          <p style={{ color: "#64748B", fontSize: 18, maxWidth: 520, marginBottom: 48, lineHeight: 1.6 }}>
            This question comes up every time. Here is the honest answer.
          </p>

          <div style={{ maxWidth: 820, margin: "0 auto", borderRadius: 0, overflow: "hidden", boxShadow: "0 4px 32px rgba(13,27,42,0.08)" }}>
            {/* Header row */}
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1.5fr 1.5fr", borderBottom: "1px solid #E2EAF4" }}>
              <div style={{ background: "#F8F9FC", padding: "20px 28px" }} />
              <div style={{ background: "#0D1B2A", padding: "20px 28px", textAlign: "center", borderBottom: "2px solid #E8A838" }}>
                <p style={{ color: "white", fontSize: 16, fontWeight: 700 }}>Packworkz</p>
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
                <div style={{ padding: "14px 28px", color: "#0D1B2A", fontSize: 14, fontWeight: 600, display: "flex", alignItems: "center" }}>
                  {row.label}
                </div>
                <div style={{ padding: "14px 28px", textAlign: "center", background: "rgba(13,27,42,0.015)" }}>
                  <p style={{ color: "#22C55E", fontSize: 18, fontWeight: 700, lineHeight: 1 }}>✓</p>
                  <p style={{ color: "#64748B", fontSize: 12, lineHeight: 1.4, maxWidth: 150, margin: "4px auto 0" }}>{row.good}</p>
                </div>
                <div style={{ padding: "14px 28px", textAlign: "center" }}>
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
      {/*  SECTION 12 — CASE STUDIES                                */}
      {/* ══════════════════════════════════════════════════════════ */}
      <section style={{ background: "#FFFFFF", padding: "100px 0" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 40px" }}>
          <span style={{ color: "#1B6CA8", fontSize: 11, fontWeight: 600, letterSpacing: "2px", textTransform: "uppercase", display: "block", marginBottom: 14 }}>
            CLIENT RESULTS
          </span>
          <h2 style={{ color: "#0D1B2A", fontSize: "clamp(2rem,4vw,3.25rem)", fontWeight: 700, lineHeight: 1.1, marginBottom: 0 }}>
            Brands that switched.<br />Numbers that speak.
          </h2>

          <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 28, maxWidth: 1100, margin: "56px auto 0", alignItems: "stretch" }}>
            {/* Left: selector cards */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {CASE_STUDIES.map((cs, i) => {
                const isActive = activeCase === i;
                return (
                  <div
                    key={i}
                    onClick={() => { setActiveCase(i); startCaseRotation(); }}
                    style={{
                      background: isActive ? "#FFFBF0" : "white",
                      border: `1px solid ${isActive ? "#E8A838" : "#E2EAF4"}`,
                      padding: "22px 24px",
                      cursor: "pointer",
                      position: "relative",
                      overflow: "hidden",
                      transition: "all 0.3s ease",
                      boxShadow: isActive ? "0 4px 20px rgba(232,168,56,0.15)" : "none",
                    }}
                  >
                    {/* Left accent bar */}
                    {isActive && (
                      <div style={{
                        position: "absolute", left: 0, top: 0, bottom: 0,
                        width: 3, background: "#E8A838",
                      }} />
                    )}

                    {/* Auto-rotation progress bar */}
                    {isActive && (
                      <div style={{
                        position: "absolute", bottom: 0, left: 0,
                        height: 2, background: "#E8A838",
                        animation: "progress-fill 4s linear forwards",
                      }} />
                    )}

                    {/* Avatar — sharp square */}
                    <div style={{
                      width: 38, height: 38,
                      background: "#0D1B2A", color: "white",
                      fontSize: 13, fontWeight: 700,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      marginBottom: 12,
                    }}>
                      {cs.initials}
                    </div>

                    <p style={{ color: "#0D1B2A", fontSize: 15, fontWeight: 700, marginBottom: 3 }}>{cs.company}</p>
                    <p style={{ color: "#64748B", fontSize: 12 }}>{cs.industry}</p>

                    {/* Metric tag — sharp */}
                    <div style={{
                      display: "inline-block", marginTop: 10,
                      background: "rgba(232,168,56,0.1)",
                      border: "1px solid rgba(232,168,56,0.3)",
                      padding: "4px 12px",
                    }}>
                      <span style={{ color: "#92600A", fontSize: 12, fontWeight: 600 }}>{cs.metric}</span>
                    </div>
                  </div>
                );
              })}

              {/* 4th slot: CTA — stretches to match right card height */}
              <div style={{
                background: "#0D1B2A",
                border: "1px solid rgba(232,168,56,0.2)",
                padding: "22px 24px",
                display: "flex", flexDirection: "column", justifyContent: "center",
                flex: 1,
              }}>
                <p style={{ color: "#E8A838", fontSize: 10, fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", marginBottom: 12 }}>
                  YOUR BRAND
                </p>
                <p style={{ color: "white", fontSize: 15, fontWeight: 700, marginBottom: 8, lineHeight: 1.3 }}>
                  Could your story be next?
                </p>
                <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 12, lineHeight: 1.55, marginBottom: 18 }}>
                  Join 220+ brands that simplified their packaging with Packworkz.
                </p>
                <Link href="/quote">
                  <button style={{
                    background: "#E8A838", color: "#0D1B2A",
                    padding: "10px 20px", fontSize: 13, fontWeight: 700,
                    border: "none", cursor: "pointer",
                  }}>
                    Get a quote →
                  </button>
                </Link>
              </div>
            </div>

            {/* Right: detail card */}
            <CaseDetail cs={CASE_STUDIES[activeCase]} />
          </div>
        </div>
      </section>


      {/* ══════════════════════════════════════════════════════════ */}
      {/*  SECTION 11 — SAVINGS CALCULATOR                          */}
      {/* ══════════════════════════════════════════════════════════ */}
      <section style={{ background: "#F8F9FC", padding: "100px 0" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 40px" }}>

          {/* Eyebrow */}
          <span style={{
            color: "#1B6CA8", fontSize: 11, fontWeight: 600,
            letterSpacing: "2px", textTransform: "uppercase",
            display: "block", marginBottom: 14,
          }}>
            THE NUMBERS
          </span>

          {/* Headline */}
          <h2 style={{
            color: "#0D1B2A", fontSize: 52, fontWeight: 700,
            lineHeight: 1.15, marginBottom: 16,
          }}>
            How much is vendor<br />chaos costing you?
          </h2>

          {/* Subheadline */}
          <p style={{ color: "#64748B", fontSize: 18, marginBottom: 56 }}>
            Most brands overpay by 8–15% without realising it.
          </p>

          {/* ── Calculator Card ── */}
          <div style={{
            maxWidth: 880, margin: "0 auto",
            background: "#FFFFFF",
            border: "1px solid #E2EAF4",
            overflow: "hidden",
            boxShadow: "0 8px 40px rgba(13,27,42,0.08)",
          }}>
            <div
              className="calc-grid"
              style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}
            >

              {/* ══ LEFT PANEL ══ */}
              <div
                className="calc-left"
                style={{
                  background: "#FFFFFF",
                  padding: "36px 44px",
                  borderRight: "1px solid #E2EAF4",
                }}
              >
                {/* Input 1: Spend slider */}
                <label style={{
                  display: "block", color: "#0D1B2A", fontSize: 13,
                  fontWeight: 600, letterSpacing: "0.3px", marginBottom: 20,
                }}>
                  Monthly packaging spend
                </label>

                <input
                  type="range"
                  className="calc-slider"
                  min={50000} max={5000000} step={10000}
                  value={monthlySpend}
                  onChange={e => setMonthlySpend(Number(e.target.value))}
                  style={{
                    background: `linear-gradient(to right, #E8A838 0%, #E8A838 ${sliderPct}%, #E2EAF4 ${sliderPct}%, #E2EAF4 100%)`,
                  }}
                />

                <div style={{ marginTop: 12, textAlign: "center" }}>
                  <span style={{ color: "#0D1B2A", fontSize: 26, fontWeight: 700 }}>
                    {inr(monthlySpend)}
                  </span>
                  <span style={{ color: "#94A3B8", fontSize: 13, fontWeight: 400, marginLeft: 4 }}>
                    /month
                  </span>
                </div>

                {/* Divider */}
                <div style={{ height: 1, background: "#F1F5F9", margin: "24px 0" }} />

                {/* Input 2: Vendors */}
                <label style={{
                  display: "block", color: "#0D1B2A", fontSize: 13,
                  fontWeight: 600, marginBottom: 12,
                }}>
                  Vendors you currently manage
                </label>
                <div style={{ display: "flex", gap: 8 }}>
                  {(["Just 1", "2 to 4", "5+"] as VendorBucket[]).map(opt => {
                    const sel = vendorBucket === opt;
                    return (
                      <button
                        key={opt}
                        onClick={() => setVendorBucket(opt)}
                        style={{
                          padding: "9px 0", flex: 1, textAlign: "center",
                          borderRadius: 8,
                          border: `1px solid ${sel ? "#0D1B2A" : "#E2EAF4"}`,
                          fontSize: 14, fontWeight: 500, cursor: "pointer",
                          background: sel ? "#0D1B2A" : "#F8F9FC",
                          color: sel ? "#FFFFFF" : "#64748B",
                          transition: "all 0.15s ease",
                        }}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>

                {/* Divider */}
                <div style={{ height: 1, background: "#F1F5F9", margin: "20px 0" }} />

                {/* Input 3: Credit */}
                <label style={{
                  display: "block", color: "#0D1B2A", fontSize: 13,
                  fontWeight: 600, marginBottom: 12,
                }}>
                  Do you use vendor credit?
                </label>
                <div style={{ display: "flex", gap: 8 }}>
                  {(["Yes", "No"] as CreditOption[]).map(opt => {
                    const sel = useCredit === opt;
                    return (
                      <button
                        key={opt}
                        onClick={() => setUseCredit(opt)}
                        style={{
                          padding: "9px 0", flex: 1, textAlign: "center",
                          borderRadius: 8,
                          border: `1px solid ${sel ? "#0D1B2A" : "#E2EAF4"}`,
                          fontSize: 14, fontWeight: 500, cursor: "pointer",
                          background: sel ? "#0D1B2A" : "#F8F9FC",
                          color: sel ? "#FFFFFF" : "#64748B",
                          transition: "all 0.15s ease",
                        }}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* ══ RIGHT PANEL ══ */}
              <div
                className="calc-right"
                style={{ background: "#0D1B2A", padding: "48px 44px" }}
              >
                {/* Top label */}
                <p style={{
                  color: "rgba(255,255,255,0.4)", fontSize: 10, fontWeight: 600,
                  letterSpacing: "2px", textTransform: "uppercase", marginBottom: 8,
                }}>
                  YOUR ESTIMATED SAVINGS
                </p>

                {/* Hero number — animated */}
                <p
                  className="calc-hero-num"
                  style={{
                    color: "#E8A838", fontSize: 52, fontWeight: 700,
                    lineHeight: 1, letterSpacing: "-1px", marginBottom: 6,
                  }}
                >
                  {inr(displayedSaving)}
                </p>

                <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 13, marginBottom: 36 }}>
                  estimated annual saving
                </p>

                {/* Divider */}
                <div style={{ height: 1, background: "rgba(255,255,255,0.08)", marginBottom: 28 }} />

                {/* Secondary metrics */}
                {[
                  {
                    label: "Hidden credit markup",
                    value: useCredit === "Yes" ? inr(calc.creditMarkup) : "Not applicable",
                  },
                  {
                    label: "Extra saving if upfront",
                    value: inr(calc.upfrontSaving),
                  },
                  {
                    label: "Time saved per month",
                    value: `${calc.timeSaved} hours`,
                  },
                ].map(row => (
                  <div
                    key={row.label}
                    style={{
                      display: "flex", justifyContent: "space-between",
                      alignItems: "center", marginBottom: 18,
                    }}
                  >
                    <span style={{ color: "rgba(255,255,255,0.55)", fontSize: 13 }}>
                      {row.label}
                    </span>
                    <span style={{ color: "rgba(255,255,255,0.9)", fontSize: 15, fontWeight: 600 }}>
                      {row.value}
                    </span>
                  </div>
                ))}

                {/* Divider */}
                <div style={{ height: 1, background: "rgba(255,255,255,0.08)", margin: "24px 0" }} />

                {/* Total row */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <span style={{ color: "white", fontSize: 15, fontWeight: 700 }}>Total annual value</span>
                  <span style={{ color: "white", fontSize: 28, fontWeight: 700 }}>{inr(calc.totalValue)}</span>
                </div>

                {/* CTA button */}
                <Link href="/quote" style={{ display: "block", marginTop: 28 }}>
                  <button className="btn-fill btn-amber w-full py-4 text-sm">
                    <span>Get a quote — see real prices →</span>
                  </button>
                </Link>

                {/* Disclaimer */}
                <p style={{
                  color: "rgba(255,255,255,0.3)", fontSize: 11,
                  textAlign: "center", marginTop: 12,
                }}>
                  Estimates based on industry averages.
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
        style={{
          background: "radial-gradient(circle at 30% 60%, rgba(59,130,246,0.18), transparent 45%), linear-gradient(135deg, #020617 0%, #0f172a 35%, #1e3a8a 65%, #1d4ed8 85%, #2563eb 100%)",
          padding: "140px 0",
        }}
      >
        {/* Box pattern overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Crect x='0.5' y='0.5' width='59' height='59' rx='3' fill='none' stroke='white' stroke-opacity='0.04'/%3E%3C/svg%3E")`,
            backgroundSize: "60px 60px",
          }}
        />

        {/* Radial depth overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            zIndex: 0,
            background: "radial-gradient(ellipse 80% 60% at 50% 100%, rgba(27,108,168,0.25) 0%, transparent 70%)",
          }}
        />

        {/* Content */}
        <div className="relative" style={{
          zIndex: 1, maxWidth: 640, margin: "0 auto", padding: "0 32px",
          display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center",
        }}>

          {/* Eyebrow */}
          <span style={{
            color: "#E8A838", fontSize: 11, fontWeight: 600,
            letterSpacing: "2.5px", textTransform: "uppercase",
            display: "block", marginBottom: 20,
          }}>
            READY TO START
          </span>

          {/* Headline */}
          <h2 style={{
            color: "#FFFFFF", fontSize: "clamp(2.2rem, 5vw, 54px)", fontWeight: 700,
            lineHeight: 1.08, letterSpacing: "-1.5px", marginBottom: 24,
          }}>
            Packaging sorted. Forever.
          </h2>

          {/* Subheadline */}
          <p style={{
            color: "rgba(255,255,255,0.6)", fontSize: 18,
            maxWidth: 460, marginBottom: 52, lineHeight: 1.65,
          }}>
            Join brands across India and 40+ countries who have simplified their packaging supply chain.
          </p>

          {/* CTAs */}
          <div style={{ display: "flex", gap: 16, justifyContent: "center", alignItems: "center", flexWrap: "wrap" }}>
            <Link href="/products">
              <button className="btn-fill btn-amber px-11 py-5 text-base">
                <span>Browse 110+ SKUs →</span>
              </button>
            </Link>

            <a
              href={`https://wa.me/${WHATSAPP_NUM}?text=Hi%20Packworkz%2C%20I%27d%20like%20to%20discuss%20packaging.`}
              target="_blank" rel="noopener noreferrer"
            >
              <button className="btn-fill btn-outline-white px-11 py-5 text-base">
                <span>WhatsApp Us</span>
              </button>
            </a>
          </div>

          {/* Trust strip */}
          <div style={{
            display: "flex", justifyContent: "center", alignItems: "center",
            gap: 12, flexWrap: "wrap", marginTop: 40,
          }}>
            {["Quote in 48 hours", "No commitment until you approve", "Sample from ₹2,999", "Design from ₹1,999"].map((item, i) => (
              <div key={item} style={{ display: "flex", alignItems: "center", gap: 16 }}>
                {i > 0 && (
                  <span style={{ color: "rgba(255,255,255,0.2)", fontSize: 16, lineHeight: 1 }}>·</span>
                )}
                <span style={{ display: "flex", alignItems: "center", gap: 6, whiteSpace: "nowrap" }}>
                  <span style={{ color: "#4ade80", fontSize: 13, fontWeight: 700, lineHeight: 1 }}>✓</span>
                  <span style={{ color: "rgba(255,255,255,0.55)", fontSize: 13 }}>{item}</span>
                </span>
              </div>
            ))}
          </div>

        </div>
      </section>

    </div>
  );
}
