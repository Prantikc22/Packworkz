import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import { INDUSTRY_IMAGES } from "@/lib/images";
import BrandAdvantageSection from "@/components/home/BrandAdvantageSection";
import ComparisonSection from "@/components/home/ComparisonSection";
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

const MARQUEE_PHRASES = [
  "One platform.", "110+ SKUs.", "3 backup vendors per order.", "98.7% on-time delivery.", "Zero vendor chaos.",
];
const MARQUEE_1 = Array(6).fill(MARQUEE_PHRASES).flat();

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
    title: "We Source and Manufacture",
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
    initials: "HP",
    logo: "/images/logos/happilo.png",
    logoBg: "#1a4a2e",
    company: "Happilo",
    industry: "Premium Foods · Bangalore",
    metric: "7 vendors → 1 platform",
    challenge: "We were managing 7 different packaging vendors for our snack range. Every month was a coordination nightmare — delays from one vendor cascaded across our entire production schedule.",
    whatWeDid: "Consolidated all 7 SKUs onto the Packworkz platform. Assigned backup vendors for each. Integrated their reorder into the dashboard with SmartStock pre-positioning.",
    result: "Single point of contact for all packaging. Zero production delays in the first 6 months. Quality consistent across every batch.",
    metrics: [
      { val: "7 → 1", label: "Vendors managed" },
      { val: "₹0", label: "Production delays" },
      { val: "6 mo", label: "Zero quality issues" },
    ],
    quote: "We cut vendor coordination time by 80% in the first quarter. Packworkz handles everything — sourcing, QC, dispatch tracking. Our team finally has time to focus on growth.",
    quoteName: "Rohan Mehta",
    quoteTitle: "Supply Chain Head, Happilo",
  },
  {
    initials: "BC",
    logo: "/images/logos/bodycraft.png",
    logoBg: "#8b1a2e",
    company: "Bodycraft",
    industry: "Cosmetics & Salon · Bangalore",
    metric: "₹3.8L saved in Year 1",
    challenge: "Our previous vendor's QC was self-certified. We received two batches with print registration errors that our retail partners rejected. The cost of returns was significant.",
    whatWeDid: "Moved cosmetic jar and carton orders to Packworkz. Pre-dispatch inspection with photo evidence on every batch. Design also migrated — artwork now stored on platform.",
    result: "Zero QC rejections in 14 months. Artwork errors eliminated because print-ready files are standardised. Net saving vs previous vendor.",
    metrics: [
      { val: "0", label: "QC rejections" },
      { val: "₹3.8L", label: "Annual saving" },
      { val: "14 mo", label: "Perfect record" },
    ],
    quote: "Switched all 12 of our packaging SKUs to Packworkz after our previous vendor failed us three times. Six months in — zero delays, costs down 19%, and I sleep better on launch days.",
    quoteName: "Prashant Kumar",
    quoteTitle: "Procurement Manager, Bodycraft",
  },
  {
    initials: "OC",
    logo: "/images/logos/oliva.png",
    logoBg: "#1a2a3a",
    company: "Oliva Clinics",
    industry: "Dermatology · Pan-India",
    metric: "14 days · Fully certified",
    challenge: "We needed FSC certified kraft pouches with compostability certification for a UK export order. Our local vendor couldn't provide the documentation and we nearly lost the contract.",
    whatWeDid: "Sourced FSC certified kraft stand-up pouches from our verified sustainable packaging network. Provided full export documentation including FSC chain of custody certificate.",
    result: "UK export order fulfilled on time with full certification. Buyer has since placed 3 repeat orders. Sustainable packaging now standard across their range.",
    metrics: [
      { val: "14d", label: "Sourced and shipped" },
      { val: "3x", label: "Repeat orders won" },
      { val: "100%", label: "Certs provided" },
    ],
    quote: "Our export buyer needed FSC certified packaging with full chain-of-custody documentation. Packworkz had it sourced, certified, and shipped in 14 days. No other vendor even understood the brief.",
    quoteName: "Dr. Shalini Bhat",
    quoteTitle: "Operations Director, Oliva Clinics",
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
    <div className="po-case-detail" style={{
      background: "#F8F9FC",
      border: "1px solid #E2EAF4",
      borderTop: "3px solid #1B6CA8",
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

        {/* Customer quote */}
        <div style={{
          marginTop: 28,
          borderLeft: "3px solid #E8A838",
          background: "white",
          padding: "20px 20px 20px 20px",
        }}>
          <p style={{ color: "#374151", fontSize: 14, lineHeight: 1.75, fontStyle: "italic", marginBottom: 12 }}>
            "{cs.quote}"
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: "50%",
              background: "#1B6CA8", display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 12, fontWeight: 700, color: "white", flexShrink: 0,
            }}>
              {cs.quoteName.split(" ").map(w => w[0]).slice(0,2).join("")}
            </div>
            <div>
              <p style={{ color: "#0D1B2A", fontSize: 13, fontWeight: 700, lineHeight: 1.2 }}>{cs.quoteName}</p>
              <p style={{ color: "#94A3B8", fontSize: 11, marginTop: 2 }}>{cs.quoteTitle}</p>
            </div>
          </div>
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

function StatCount({ target, suffix = "", color = "#60a5fa" }: { target: number; suffix?: string; color?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started.current) {
        started.current = true;
        const startTime = performance.now();
        const duration = 1800;
        const tick = (now: number) => {
          const t = Math.min((now - startTime) / duration, 1);
          const eased = 1 - Math.pow(1 - t, 3);
          setCount(Math.round(target * eased));
          if (t < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
        obs.disconnect();
      }
    }, { threshold: 0.4 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [target]);
  return (
    <div ref={ref} style={{ color, fontSize: "clamp(3rem,5.5vw,4.5rem)", fontWeight: 900, lineHeight: 1, letterSpacing: "-2px" }}>
      {count}{suffix}
    </div>
  );
}

export default function Home() {
  const [monthlySpend, setMonthlySpend] = useState(500000);
  const [vendorBucket, setVendorBucket] = useState<VendorBucket>("2 to 4");
  const [useCredit, setUseCredit] = useState<CreditOption>("Yes");
  const [activeCase, setActiveCase] = useState(0);
  const [heroLoaded, setHeroLoaded] = useState(false);
  const [stepsVisible, setStepsVisible] = useState(false);
  const [stepVisible, setStepVisible] = useState([false, false, false, false]);
  const [activeStep, setActiveStep] = useState(-1);
  const [heroParallax, setHeroParallax] = useState(0);
  const [showAllComparisons, setShowAllComparisons] = useState(false);

  const caseIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const processRef = useRef<HTMLDivElement>(null);
  const stepEls = useRef<(HTMLDivElement | null)[]>([]);

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

  // Hero parallax on scroll
  useEffect(() => {
    const onScroll = () => setHeroParallax(window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Per-step intersection observers (run after first render)
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const cleanups: (() => void)[] = [];
      stepEls.current.forEach((el, i) => {
        if (!el) return;
        const obs = new IntersectionObserver(([entry]) => {
          if (entry.isIntersecting) {
            setStepVisible(prev => { const n = [...prev]; n[i] = true; return n; });
            setActiveStep(i);
          }
        }, { threshold: 0.45 });
        obs.observe(el);
        cleanups.push(() => obs.disconnect());
      });
      return () => cleanups.forEach(fn => fn());
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  // Global scroll-reveal observer
  useEffect(() => {
    const elements = document.querySelectorAll(".scroll-animate");
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add("scroll-animate-done"); });
    }, { threshold: 0.15 });
    elements.forEach(el => obs.observe(el));
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
          marginTop: -68,
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
          <circle cx="250" cy="270" r="210" stroke="url(#goldArc)" strokeWidth="1.5" />
          <circle cx="250" cy="270" r="238" stroke="url(#goldArc2)" strokeWidth="0.7" />
          <circle cx="250" cy="270" r="185" stroke="url(#goldArc)" strokeWidth="0.4" strokeOpacity="0.5" />
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
        <picture>
          <source srcSet="/images/hero-products-transparent.webp" type="image/webp" />
          <img
            src="/images/hero-products-transparent.png"
            aria-hidden="true"
            className="hidden lg:block absolute pointer-events-none select-none"
            loading="eager"
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
        </picture>

        {/* Main product image — with parallax depth */}
        <picture className="hidden lg:block absolute pointer-events-none" style={{ right: 0, bottom: 0, height: "85%", maxWidth: "56%", aspectRatio: "748/498" }}>
          <source srcSet="/images/hero-products-transparent.webp" type="image/webp" />
          <img
            src="/images/hero-products-transparent.png"
            alt="Premium packaging products"
            width="748"
            height="498"
            fetchPriority="high"
            loading="eager"
            style={{
              width: "auto",
              height: "100%",
              objectFit: "contain",
              objectPosition: "right bottom",
              aspectRatio: "748/498",
              opacity: heroLoaded ? 1 : 0,
              transition: "opacity 1s ease",
              animation: heroLoaded ? "heroProductFloat 5s ease-in-out infinite" : "none",
              filter: "drop-shadow(0 24px 48px rgba(0,0,20,0.65)) drop-shadow(0 0 60px rgba(59,130,246,0.2))",
              transform: `translateY(${heroParallax * 0.22}px) scale(${1 + heroParallax * 0.00008})`,
            }}
          />
        </picture>

        {/* Depth layer: secondary glow orb that moves faster for parallax depth */}
        <div
          className="hidden lg:block absolute pointer-events-none"
          style={{
            right: "8%", bottom: "10%", width: 340, height: 340,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(59,130,246,0.13) 0%, transparent 70%)",
            transform: `translateY(${heroParallax * 0.35}px)`,
            transition: "transform 0.05s linear",
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
              AI-POWERED PACKAGING PROCUREMENT PLATFORM
            </p>
            <h1 className="clash-display text-white leading-[1.05] mb-6" style={{ fontSize: "clamp(2.6rem, 5vw, 5rem)" }}>
              Your Packaging.<br />Sorted. Forever.
            </h1>
            <p className="text-blue-100 text-lg md:text-xl mb-3 max-w-lg font-light">
              AI-powered packaging procurement that eliminates vendor chaos, prevents stockouts, and keeps your production line moving.
            </p>
            <p style={{ color: "rgba(255,255,255,0.48)", fontSize: 13, marginBottom: 18, letterSpacing: "0.1px", display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap" }}>
              <span style={{
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                width: 18, height: 18, borderRadius: "50%",
                background: "rgba(232,168,56,0.15)", border: "1px solid rgba(232,168,56,0.45)",
                flexShrink: 0,
              }}>
                <span className="material-symbols-outlined" style={{ fontSize: 11, color: "#E8A838", fontVariationSettings: "'FILL' 1, 'wght' 700" }}>verified</span>
              </span>
              Trusted by{" "}
              <span style={{ color: "rgba(255,255,255,0.78)", fontWeight: 600 }}>Plum, Happilo, Bodycraft</span>
              {" "}and 220+ brands across India
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mb-3" style={{ alignItems: "stretch" }}>
              <span className="animated-border animated-border-white" style={{ display: "flex" }}>
                <Link href="/quote" style={{ flex: 1, display: "flex" }}>
                  <button className="btn-fill btn-amber px-9 py-4 text-base whitespace-nowrap" style={{ flex: 1 }}>
                    <span>Get a Quote</span><MS icon="arrow_forward" />
                  </button>
                </Link>
              </span>
              <Link href="/products" style={{ display: "flex" }}>
                <button className="btn-fill btn-outline-white px-9 py-4 text-base whitespace-nowrap" style={{ flex: 1 }}>
                  <span>Browse 110+ SKUs</span>
                </button>
              </Link>
            </div>
            <p style={{ color: "rgba(255,255,255,0.32)", fontSize: 12, marginBottom: 24, letterSpacing: "0.2px" }}>
              No minimum for samples · MOQ from 500 units for bulk
            </p>

            {/* Stats badges — locked inside left column */}
            <div className="flex flex-wrap gap-x-7 gap-y-3 pt-7 border-t border-white/15">
              {[
                { icon: "inventory_2",       value: "110+", label: "Packaging SKUs" },
                { icon: "workspace_premium", value: "220+", label: "Brands Served" },
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
            <span key={i} className="text-white font-bold tracking-[0.2em] text-xs uppercase mx-6">
              {t}
              {i % MARQUEE_PHRASES.length < MARQUEE_PHRASES.length - 1 && (
                <span className="mx-6 opacity-30">·</span>
              )}
            </span>
          ))}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════ */}
      {/*  SECTION 3B — OUR CUSTOMERS (2-col: text + marquee)      */}
      {/* ══════════════════════════════════════════════════════════ */}
      <section style={{ background: "#FFFFFF", borderBottom: "1px solid #E2EAF4", padding: "72px 0", overflow: "hidden" }}>
        <div className="po-customers-grid" style={{ maxWidth: 1200, margin: "0 auto", padding: "0 40px", display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: 72, alignItems: "center" }}>

          {/* Left: text */}
          <div>
            <p className="scroll-animate" style={{ color: "#1B6CA8", fontSize: 11, fontWeight: 700, letterSpacing: "2.5px", textTransform: "uppercase", marginBottom: 16 }}>
              OUR CUSTOMERS
            </p>
            <h2 className="scroll-animate scroll-animate-delay-1" style={{ color: "#0D1B2A", fontSize: 34, fontWeight: 800, lineHeight: 1.15, marginBottom: 18 }}>
              Trusted by India's fastest-growing brands.
            </h2>
            <p className="scroll-animate scroll-animate-delay-2" style={{ color: "#475569", fontSize: 15, lineHeight: 1.75, marginBottom: 32 }}>
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
          <span className="scroll-animate" style={{ color: "#1B6CA8", fontSize: 11, fontWeight: 600, letterSpacing: "2px", textTransform: "uppercase", display: "block", marginBottom: 14 }}>
            THE PROBLEM
          </span>
          <h2 className="scroll-animate scroll-animate-delay-1" style={{ color: "#0D1B2A", fontSize: "clamp(2rem,4vw,3.25rem)", fontWeight: 700, lineHeight: 1.15, marginBottom: 56 }}>
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
                className={`group scroll-animate scroll-animate-delay-${Math.min(i + 1, 4)}`}
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

          <p style={{ color: "#0D1B2A", fontSize: 18, fontWeight: 700, textAlign: "center", marginTop: 40, lineHeight: 1.5 }}>
            The cheapest packaging is the packaging you never have to rush order.<br />
            <span style={{ color: "#1B6CA8" }}>Packworkz eliminates all five.</span> That's why brands with ₹5L/month spend save ₹6L+ annually.
          </p>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════ */}
      {/*  SECTION 6 — HOW IT WORKS (dark animated timeline)        */}
      {/* ══════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden" style={{ background: "#08080f", padding: "100px 0" }}>
        {/* Remarqd-style blue radial glow */}
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 70% 60% at 50% 90%, rgba(27,108,168,0.50) 0%, rgba(10,30,80,0.25) 45%, transparent 70%)" }} />
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 40% 30% at 50% 100%, rgba(232,168,56,0.10) 0%, transparent 60%)" }} />
        <div className="relative" style={{ zIndex: 1, maxWidth: 1200, margin: "0 auto", padding: "0 40px" }}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-start">

            {/* Left — sticky heading */}
            <div className="relative lg:sticky lg:top-24">
              <span className="scroll-animate" style={{ color: "#E8A838", fontSize: 11, fontWeight: 600, letterSpacing: "2.5px", textTransform: "uppercase", display: "block", marginBottom: 20 }}>
                THE PROCESS
              </span>
              <h2 className="scroll-animate scroll-animate-delay-1" style={{ color: "white", fontSize: "clamp(2.2rem,4.5vw,3.5rem)", fontWeight: 700, lineHeight: 1.08, marginBottom: 20, letterSpacing: "-1px" }}>
                Four steps.<br />
                <span style={{ color: "#E8A838", fontStyle: "italic" }}>Then you're sorted.</span>
              </h2>
              <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 17, lineHeight: 1.75, marginBottom: 40, maxWidth: 380 }}>
                From quote to delivery, one team owns every step. No finger-pointing. No vendor follow-ups.
              </p>
              <Link href="/how-it-works">
                <span style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  color: "#E8A838", fontSize: 14, fontWeight: 600,
                  borderBottom: "1px solid rgba(232,168,56,0.35)", paddingBottom: 3,
                }}>
                  See the full process <ArrowRight size={15} />
                </span>
              </Link>
            </div>

            {/* Right — vertical timeline */}
            <div ref={processRef} style={{ display: "flex", flexDirection: "column" }}>
              {HOW_IT_WORKS_STEPS.map((step, i) => {
                const isLast = i === HOW_IT_WORKS_STEPS.length - 1;
                const isVisible = stepVisible[i];
                const isActive = activeStep === i;
                return (
                  <div
                    key={i}
                    ref={el => { stepEls.current[i] = el; }}
                    data-step={i}
                    style={{
                      display: "flex", gap: 20,
                      opacity: isVisible ? 1 : 0,
                      transform: isVisible ? "translateY(0)" : "translateY(28px)",
                      transition: `opacity 0.6s cubic-bezier(0.22,1,0.36,1), transform 0.6s cubic-bezier(0.22,1,0.36,1)`,
                    }}
                  >
                    {/* Number circle + vertical connector */}
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
                      <div style={{
                        width: 44, height: 44,
                        border: isActive ? "1.5px solid #E8A838" : "1.5px solid rgba(232,168,56,0.35)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        color: isActive ? "#E8A838" : "rgba(232,168,56,0.55)",
                        fontSize: 12, fontWeight: 700,
                        letterSpacing: "0.5px",
                        background: isActive ? "rgba(232,168,56,0.07)" : "#0A1628",
                        position: "relative", zIndex: 1,
                        boxShadow: isActive ? "0 0 22px rgba(232,168,56,0.28), inset 0 0 8px rgba(232,168,56,0.05)" : "none",
                        transition: "all 0.45s cubic-bezier(0.22,1,0.36,1)",
                      }}>
                        {String(i + 1).padStart(2, "0")}
                      </div>
                      {!isLast && (
                        <div style={{
                          width: 1, flex: 1, minHeight: 32, margin: "8px 0",
                          background: isVisible ? "rgba(232,168,56,0.38)" : "rgba(232,168,56,0.1)",
                          transition: "background 0.6s ease",
                        }} />
                      )}
                    </div>

                    {/* Content */}
                    <div style={{ paddingBottom: isLast ? 0 : 44, flex: 1 }}>
                      <h3 style={{
                        color: isActive ? "white" : "rgba(255,255,255,0.7)",
                        fontSize: 20, fontWeight: 700, lineHeight: 1.2, marginBottom: 10,
                        transition: "color 0.4s ease",
                      }}>
                        {step.title}
                      </h3>
                      <p style={{ color: "rgba(255,255,255,0.42)", fontSize: 14, lineHeight: 1.75, margin: 0 }}>
                        {step.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

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
              <span className="scroll-animate" style={{ color: "#1B6CA8", fontSize: 11, fontWeight: 600, letterSpacing: "2px", textTransform: "uppercase", display: "block", marginBottom: 14 }}>
                PRODUCTS
              </span>
              <h2 className="clash-display text-4xl scroll-animate scroll-animate-delay-1" style={{ color: "#0D1B2A" }}>Core Product Categories</h2>
              <p className="mt-2 text-lg scroll-animate scroll-animate-delay-2" style={{ color: "#64748B" }}>110+ curated SKUs across 10 managed categories.</p>
            </div>
            <Link href="/products">
              <button className="font-bold flex items-center gap-2 hover:underline" style={{ color: "#1B6CA8" }}>
                View full catalog <MS icon="chevron_right" />
              </button>
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5" style={{ alignItems: "stretch" }}>
            {CATEGORIES.map((cat, ci) => (
              <Link href={`/products?category=${cat.cat}`} key={cat.title} style={{ display: "flex", flexDirection: "column" }}>
                <div className={`group bg-white shadow-sm hover:-translate-y-2 transition-all cursor-pointer border overflow-hidden scroll-animate scroll-animate-delay-${Math.min(ci % 4 + 1, 4)}`} style={{ borderColor: "#E2EAF4", display: "flex", flexDirection: "column", height: "100%" }}>
                  <div className="w-full overflow-hidden" style={{ height: 160 }}>
                    <img
                      src={CAT_IMAGES[cat.cat]}
                      alt={cat.title}
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                    />
                  </div>
                  <div className="p-4" style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                    <h4 className="font-bold text-sm leading-tight mb-1" style={{ color: "#0D1B2A" }}>{cat.title}</h4>
                    <p className="text-xs leading-snug" style={{ color: "#64748B", flex: 1 }}>{cat.sub}</p>
                    <p className="text-xs font-bold mt-2" style={{ color: "#1B6CA8" }}>{cat.skus} SKU{cat.skus !== 1 ? "s" : ""}</p>
                  </div>
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
              <p className="font-bold tracking-[0.2em] text-sm uppercase mb-3 scroll-animate" style={{ color: "#1B6CA8" }}>SECTORS WE SERVE</p>
              <h2 className="clash-display text-white text-4xl scroll-animate scroll-animate-delay-1">Built for every industry.</h2>
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
      <section className="relative overflow-hidden" style={{ background: "#020817", minHeight: 640 }}>
        {/* Radial glow */}
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 65% 55% at 75% 50%, rgba(27,108,168,0.18) 0%, transparent 65%)" }} />

        {/* Mobile bg — subtle image hint */}
        <div className="absolute inset-0 lg:hidden">
          <img src="/smartstock.jpg" alt="" className="w-full h-full object-cover" style={{ opacity: 0.45 }} />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(2,8,23,0.78) 0%, rgba(2,8,23,0.65) 50%, rgba(2,8,23,0.82) 100%)" }} />
        </div>

        {/* Desktop image — right 50%, seamlessly blended */}
        <div className="absolute top-0 right-0 bottom-0 hidden lg:block" style={{ width: "55%" }}>
          <img src="/smartstock.jpg" alt="SmartStock AI" className="w-full h-full object-cover" style={{ opacity: 0.6 }} />
          {/* Multi-stop gradient: strong dark on left, feathers out smoothly */}
          <div className="absolute inset-0" style={{
            background: "linear-gradient(to right, #020817 0%, rgba(2,8,23,0.97) 15%, rgba(2,8,23,0.82) 32%, rgba(2,8,23,0.48) 58%, rgba(2,8,23,0.12) 80%, rgba(2,8,23,0) 100%)"
          }} />
        </div>

        {/* Content */}
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 min-h-[640px]">
          <div className="px-8 md:px-16 lg:px-20 py-24 flex flex-col justify-center">

            {/* Eyebrow */}
            <div className="scroll-animate" style={{ display: "inline-flex", alignItems: "center", gap: 10, marginBottom: 28 }}>
              <div style={{ width: 7, height: 7, background: "#3b82f6", borderRadius: "50%", boxShadow: "0 0 10px rgba(59,130,246,0.7)" }} />
              <span style={{ color: "#60a5fa", fontSize: 11, fontWeight: 700, letterSpacing: "2.5px", textTransform: "uppercase" }}>SMARTSTOCK™ AI INVENTORY</span>
            </div>

            <h2 className="clash-display scroll-animate scroll-animate-delay-1" style={{ color: "white", fontSize: "clamp(2rem,4vw,3.2rem)", fontWeight: 700, lineHeight: 1.1, marginBottom: 16 }}>
              Never run out<br />of boxes again.
            </h2>
            <p className="scroll-animate scroll-animate-delay-2" style={{ color: "rgba(255,255,255,0.65)", fontSize: 16, lineHeight: 1.8, marginBottom: 28 }}>
              Most companies use AI to write emails or run ads. We use it to solve a problem that costs brands billions — packaging that delays production, bleeds cash, and burns your team's time.
            </p>

            {/* AI feature bullets */}
            <div className="scroll-animate scroll-animate-delay-3" style={{
              background: "linear-gradient(135deg, rgba(15,25,65,0.95) 0%, rgba(5,10,35,0.98) 100%)",
              border: "1px solid rgba(59,130,246,0.18)",
              borderLeft: "3px solid #3b82f6",
              padding: "24px 28px",
              marginBottom: 28,
              boxShadow: "0 0 40px rgba(27,108,168,0.12), inset 0 0 20px rgba(59,130,246,0.04)",
            }}>
              {[
                { label: "AI demand forecasting", desc: "predicts your reorder window before you run out" },
                { label: "AI vendor matching", desc: "routes each SKU to the best-fit factory in real time" },
                { label: "AI quality flags", desc: "pre-dispatch anomaly detection before it leaves the floor" },
                { label: "AI stockout alerts", desc: "pushes notifications 4 weeks before you'd discover the gap yourself" },
              ].map((item, i) => (
                <div key={i} style={{ display: "flex", gap: 14, alignItems: "flex-start", marginBottom: i < 3 ? 16 : 0 }}>
                  <span style={{ color: "#60a5fa", fontSize: 17, fontWeight: 700, lineHeight: 1.4, flexShrink: 0 }}>→</span>
                  <p style={{ margin: 0, fontSize: 14, lineHeight: 1.55 }}>
                    <span style={{ color: "white", fontWeight: 700 }}>{item.label}</span>
                    <span style={{ color: "rgba(255,255,255,0.52)" }}> — {item.desc}</span>
                  </p>
                </div>
              ))}
            </div>

            {/* Metrics grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", marginBottom: 36, border: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.03)" }}>
              {[
                { val: "500+", label: "Factory Partners" },
                { val: "12",   label: "City Nodes" },
                { val: "4 wk", label: "Buffer Stock" },
              ].map((m, i) => (
                <div key={i} style={{ padding: "20px 14px", textAlign: "center", borderRight: i < 2 ? "1px solid rgba(255,255,255,0.10)" : "none" }}>
                  <p style={{ color: "white", fontSize: 24, fontWeight: 800, lineHeight: 1, marginBottom: 6 }}>{m.val}</p>
                  <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 11, textTransform: "uppercase", letterSpacing: "1.5px", fontWeight: 600 }}>{m.label}</p>
                </div>
              ))}
            </div>

            {/* Features */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 36 }}>
              {["Automated JIT Replenishment", "Regional Warehousing in 12 Cities", "SKU Consolidation Reporting"].map(item => (
                <div key={item} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 20, height: 20, background: "rgba(27,108,168,0.2)", border: "1px solid rgba(59,130,246,0.35)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <span style={{ color: "#60a5fa", fontSize: 10, fontWeight: 800, lineHeight: 1 }}>✓</span>
                  </div>
                  <span style={{ color: "rgba(255,255,255,0.65)", fontSize: 14 }}>{item}</span>
                </div>
              ))}
            </div>

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
      <section style={{ background: "#051A12", padding: "96px 0", position: "relative", overflow: "hidden" }}>

        {/* Photo background */}
        <picture style={{ position: "absolute", inset: 0, width: "100%", height: "100%", zIndex: 0 }}>
          <source srcSet="/images/sustainable-bg.webp" type="image/webp" />
          <img src="/images/sustainable-bg.jpg" alt="" loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center" }} />
        </picture>

        {/* Gradient overlay — dark green tint */}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(5,26,18,0.94) 0%, rgba(5,26,18,0.82) 60%, rgba(5,26,18,0.6) 100%)", zIndex: 1 }} />

        {/* Radial green glow */}
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 2, background: "radial-gradient(ellipse 55% 60% at 80% 20%, rgba(34,197,94,0.12) 0%, transparent 55%)" }} />

        {/* Subtle grid lines */}
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 2, opacity: 0.04, backgroundImage: "linear-gradient(rgba(134,239,172,1) 1px, transparent 1px), linear-gradient(90deg, rgba(134,239,172,1) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />

        {/* Content */}
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 40px", position: "relative", zIndex: 3 }}>

          {/* Top eyebrow */}
          <div className="scroll-animate" style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 64 }}>
            <div style={{ width: 6, height: 6, background: "#4ade80", borderRadius: "50%", boxShadow: "0 0 8px rgba(74,222,128,0.7)" }} />
            <span style={{ color: "#86EFAC", fontSize: 11, fontWeight: 700, letterSpacing: "2.5px", textTransform: "uppercase" }}>SUSTAINABLE PACKAGING</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">

            {/* Left */}
            <div>
              <h2 className="scroll-animate scroll-animate-delay-1" style={{ color: "white", fontSize: "clamp(2rem,4vw,3.25rem)", fontWeight: 700, lineHeight: 1.1, marginBottom: 20, letterSpacing: "-0.5px" }}>
                Sustainable Packaging.<br />
                <span style={{ color: "#4ade80" }}>No Premium Required.</span>
              </h2>
              <p className="scroll-animate scroll-animate-delay-2" style={{ color: "rgba(255,255,255,0.6)", fontSize: 16, lineHeight: 1.8, marginBottom: 36 }}>
                12 certified sustainable SKUs. All customisable with your brand design. Food-safe, leak-proof, and built for Indian brands that take sustainability seriously. Full EPR compliance included.
              </p>
              <Link href="/products?category=sustainable">
                <button className="btn-fill btn-amber px-8 py-4 text-sm">
                  <span>See all sustainable SKUs →</span>
                </button>
              </Link>

              {/* Stats row */}
              <div style={{ display: "flex", gap: 32, marginTop: 40, paddingTop: 40, borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                {[{ val: "12", label: "Certified SKUs" }, { val: "100%", label: "EPR Compliant" }, { val: "0", label: "Plastic Waste" }].map((s, i) => (
                  <div key={i}>
                    <p style={{ color: "#4ade80", fontSize: 26, fontWeight: 700, lineHeight: 1 }}>{s.val}</p>
                    <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, marginTop: 4, textTransform: "uppercase", letterSpacing: "1px" }}>{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — premium feature cards */}
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {[
                { Icon: Leaf,      num: "01", title: "12 Certified Sustainable SKUs",   desc: "Kraft, compostable, recycled, and mono-material options. All verified by third-party certifiers." },
                { Icon: Droplets,  num: "02", title: "Food-safe and Leak-proof",        desc: "Rigorously tested for spices, gravies, oils, and Indian food products. No compromise." },
                { Icon: FileCheck, num: "03", title: "EPR Compliance Included",         desc: "Full Extended Producer Responsibility documentation for your annual regulatory filing. Zero extra cost." },
              ].map((row, i) => {
                const Icon = row.Icon;
                return (
                  <div key={i} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(134,239,172,0.1)", padding: "24px 28px", display: "flex", gap: 20, alignItems: "flex-start" }}>
                    <div style={{ flexShrink: 0 }}>
                      <p style={{ color: "rgba(134,239,172,0.4)", fontSize: 11, fontWeight: 700, letterSpacing: "1px", marginBottom: 10 }}>{row.num}</p>
                      <div style={{ width: 44, height: 44, background: "rgba(74,222,128,0.1)", border: "1px solid rgba(74,222,128,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Icon size={20} color="#4ade80" />
                      </div>
                    </div>
                    <div>
                      <p style={{ color: "white", fontSize: 15, fontWeight: 700, marginBottom: 8 }}>{row.title}</p>
                      <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, lineHeight: 1.7 }}>{row.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════ */}
      {/*  BUILT FOR MODERN PROCUREMENT TEAMS                        */}
      {/* ══════════════════════════════════════════════════════════ */}
      <ComparisonSection />
      {false && <div className="relative" style={{ zIndex: 1, maxWidth: 940, margin: "0 auto", padding: "0 24px" }}>

          {/* ── Eyebrow ── */}
          <div className="scroll-animate" style={{ textAlign: "center", marginBottom: 20 }}>
            <span style={{
              display: "inline-flex", alignItems: "center",
              background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.10)",
              borderRadius: 9999, padding: "6px 18px",
              color: "rgba(255,255,255,0.45)", fontSize: 11, fontWeight: 600, letterSpacing: "2.5px", textTransform: "uppercase",
            }}>
              WHY BRANDS CHOOSE PACKWORKZ
            </span>
          </div>

          {/* ── Heading ── */}
          <div style={{ textAlign: "center", marginBottom: 14 }}>
            <h2 className="scroll-animate scroll-animate-delay-1" style={{ color: "white", fontSize: "clamp(2.2rem,4.5vw,3.4rem)", fontWeight: 800, lineHeight: 1.05, letterSpacing: "-1.5px" }}>
              Built for modern<br />
              <span style={{ color: "white", fontStyle: "italic", opacity: 0.75 }}>procurement teams.</span>
            </h2>
          </div>
          <p className="scroll-animate scroll-animate-delay-2" style={{ color: "rgba(255,255,255,0.40)", fontSize: 16, textAlign: "center", maxWidth: 420, margin: "0 auto 72px", lineHeight: 1.7 }}>
            Operational resilience designed into every order.
          </p>

          {/* ── Stats row — white numbers, gold accent underline ── */}
          <div className="scroll-animate cmp-stats-grid" style={{ maxWidth: 860, margin: "0 auto 88px" }}>
            {[
              { target: 500, suffix: "+",   label: "Manufacturing Partners" },
              { target: 99,  suffix: ".2%", label: "Dispatch Reliability" },
              { target: 3,   suffix: "×",   label: "Backup Vendors / Order" },
              { target: 48,  suffix: " hr", label: "Resolution SLA" },
            ].map((s, i) => (
              <div
                key={i}
                className="cmp-stat-item"
                style={{
                  padding: "0 28px",
                  borderRight: i < 3 ? "1px solid rgba(255,255,255,0.07)" : "none",
                }}
              >
                <p style={{ color: "white", fontSize: "clamp(2.6rem,3.8vw,3.8rem)", fontWeight: 800, lineHeight: 1, letterSpacing: "-2px" }}>
                  <CountUp target={s.target} suffix={s.suffix} duration={1800} />
                </p>
                {/* Gold accent underline */}
                <div style={{ width: 28, height: 2, background: "#C8952A", margin: "10px 0 14px", flexShrink: 0 }} />
                <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "1.5px", lineHeight: 1.4 }}>
                  {s.label}
                </p>
              </div>
            ))}
          </div>

          {/* ── Column headers ── */}
          <div className="scroll-animate cmp-col-headers" style={{ maxWidth: 860, margin: "0 auto 10px" }}>
            <div style={{
              background: "rgba(13,27,42,0.70)",
              border: "1px solid rgba(59,130,246,0.25)",
              borderBottom: "2px solid rgba(59,130,246,0.65)",
              padding: "16px 22px", display: "flex", alignItems: "center", gap: 10,
            }}>
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#3B82F6", flexShrink: 0 }} />
              <div>
                <p style={{ color: "white", fontSize: 14, fontWeight: 700 }}>Packworkz</p>
                <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 10, textTransform: "uppercase", letterSpacing: "1.5px", marginTop: 2 }}>Managed Platform</p>
              </div>
            </div>
            <div style={{
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.06)",
              padding: "16px 22px", display: "flex", alignItems: "center", gap: 10,
            }}>
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: "rgba(255,255,255,0.18)", flexShrink: 0 }} />
              <div>
                <p style={{ color: "rgba(255,255,255,0.50)", fontSize: 14, fontWeight: 600 }}>Traditional Vendors</p>
                <p style={{ color: "rgba(255,255,255,0.22)", fontSize: 10, textTransform: "uppercase", letterSpacing: "1.5px", marginTop: 2 }}>Direct Procurement</p>
              </div>
            </div>
          </div>

          {/* ── Comparison rows ── */}
          <div style={{ maxWidth: 860, margin: "0 auto", display: "flex", flexDirection: "column", gap: 6 }}>
            {([
              { feature: "Vendor redundancy",    good: "3 vetted backup vendors per order — production never stalls.",  bad: "One vendor. Their delay is your delay." },
              { feature: "Quality control",       good: "Our team inspects every dispatch. Photo evidence in dashboard.", bad: "Vendor self-certifies. Rejection risk is yours." },
              { feature: "Pricing transparency",  good: "Transparent pricing + 3% discount for upfront payment.",        bad: "Credit terms hide 10–15% markup per unit." },
              { feature: "SKU coverage",          good: "110+ SKUs across all categories. One invoice.",                 bad: "Specialised in one category. Source the rest yourself." },
              { feature: "Compliance & certs",    good: "ISO, BRC, FDA, FSC on file. Export-ready documentation.",       bad: "Certification varies by vendor. Risk sits with you." },
              { feature: "Design service",        good: "Print-ready artwork from ₹1,999. Files yours forever.",         bad: "Mostly unavailable. Third-party dependency." },
              { feature: "Order visibility",      good: "Real-time dashboard — status, dispatch, ETA in one place.",     bad: "WhatsApp updates. No audit trail." },
              { feature: "Problem resolution",    good: "48-hour resolution SLA. Dedicated account manager.",            bad: "Call them. Hope they answer." },
            ] as { feature: string; good: string; bad: string }[]).map((row, i) => (
              <div
                key={i}
                className="cmp-card-row"
                style={{
                  display: (i < 3 || showAllComparisons) ? undefined : "none",
                  animation: (showAllComparisons && i >= 3) ? `cmp-reveal 0.32s ease ${(i - 3) * 0.07}s both` : undefined,
                  marginBottom: 10,
                }}
              >

                {/* Packworkz card */}
                <div
                  className="cmp-card-good"
                  style={{
                    background: "rgba(13,27,42,0.65)",
                    border: "1px solid rgba(255,255,255,0.07)",
                    borderLeft: "2px solid rgba(59,130,246,0.55)",
                    padding: "16px 18px",
                    transition: "border-left-color 0.2s, box-shadow 0.2s",
                    cursor: "default",
                  }}
                  onMouseEnter={e => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.borderLeftColor = "#3B82F6";
                    el.style.boxShadow = "0 6px 24px rgba(0,0,0,0.28)";
                  }}
                  onMouseLeave={e => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.borderLeftColor = "rgba(59,130,246,0.55)";
                    el.style.boxShadow = "none";
                  }}
                >
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 11 }}>
                    <span style={{
                      width: 20, height: 20, borderRadius: "50%",
                      background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.35)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      flexShrink: 0, marginTop: 2, color: "#22c55e", fontSize: 11, fontWeight: 800,
                    }}>✓</span>
                    <div>
                      <p style={{ color: "rgba(255,255,255,0.38)", fontSize: 10, fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: 4 }}>
                        {row.feature}
                        <span className="cmp-mobile-label" style={{ display: "none", marginLeft: 8, color: "#3B82F6" }}>· Packworkz</span>
                      </p>
                      <p style={{ color: "rgba(255,255,255,0.88)", fontSize: 13, lineHeight: 1.55, fontWeight: 500 }}>{row.good}</p>
                    </div>
                  </div>
                </div>

                {/* Traditional vendor card */}
                <div
                  style={{
                    background: "rgba(255,255,255,0.02)",
                    border: "1px solid rgba(255,255,255,0.04)",
                    padding: "16px 18px",
                    transition: "box-shadow 0.2s",
                    cursor: "default",
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 14px rgba(0,0,0,0.18)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = "none"; }}
                >
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 11 }}>
                    <span style={{
                      width: 20, height: 20, borderRadius: "50%",
                      background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.22)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      flexShrink: 0, marginTop: 2, color: "rgba(239,68,68,0.60)", fontSize: 11, fontWeight: 800,
                    }}>✗</span>
                    <div>
                      <p style={{ color: "rgba(255,255,255,0.20)", fontSize: 10, fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: 4 }}>
                        {row.feature}
                        <span className="cmp-mobile-label" style={{ display: "none", marginLeft: 8, color: "rgba(255,255,255,0.25)" }}>· Traditional</span>
                      </p>
                      <p style={{ color: "rgba(255,255,255,0.32)", fontSize: 13, lineHeight: 1.55 }}>{row.bad}</p>
                    </div>
                  </div>
                </div>

              </div>
            ))}
          </div>

          {/* ── Show more / less button ── */}
          {!showAllComparisons && (
            <div style={{ maxWidth: 860, margin: "12px auto 0", textAlign: "center" }}>
              <button
                onClick={() => setShowAllComparisons(true)}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)",
                  color: "rgba(255,255,255,0.65)", fontSize: 13, fontWeight: 600,
                  padding: "11px 24px", cursor: "pointer",
                  transition: "background 0.2s, color 0.2s",
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.09)"; (e.currentTarget as HTMLElement).style.color = "white"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)"; (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.65)"; }}
              >
                <span>Show all 8 comparisons</span>
                <span style={{ fontSize: 16, lineHeight: 1 }}>↓</span>
              </button>
            </div>
          )}

          {/* ── Summary bar ── */}
          <div className="scroll-animate" style={{
            maxWidth: 860, margin: "20px auto 0",
            background: "rgba(13,27,42,0.50)",
            border: "1px solid rgba(59,130,246,0.18)",
            padding: "16px 24px", textAlign: "center",
          }}>
            <p style={{ color: "rgba(255,255,255,0.60)", fontSize: 13, fontWeight: 600 }}>
              Even factoring in vendor credit lines — Packworkz delivers better total cost of ownership.
            </p>
          </div>

          {/* ── CTA block ── */}
          <div className="scroll-animate cmp-cta" style={{
            maxWidth: 860, margin: "48px auto 0",
            background: "rgba(13,27,42,0.60)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderTop: "1px solid rgba(59,130,246,0.30)",
            padding: "44px 48px",
            display: "flex", flexDirection: "column" as const, alignItems: "center", textAlign: "center",
          }}>
            <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 11, fontWeight: 700, letterSpacing: "2.5px", textTransform: "uppercase", marginBottom: 14 }}>
              READY TO MODERNIZE
            </p>
            <h3 style={{ color: "white", fontSize: "clamp(1.5rem,3vw,2.1rem)", fontWeight: 800, lineHeight: 1.15, marginBottom: 12, letterSpacing: "-0.5px" }}>
              Operational certainty at scale.
            </h3>
            <p style={{ color: "rgba(255,255,255,0.40)", fontSize: 15, maxWidth: 400, lineHeight: 1.7, marginBottom: 32 }}>
              Talk to a packaging specialist and see exactly how Packworkz fits your supply chain.
            </p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" as const, justifyContent: "center" }}>
              <span className="animated-border animated-border-white">
                <Link href="/quote">
                  <button className="btn-fill btn-amber px-8 py-3 text-sm">
                    Get a Quote →
                  </button>
                </Link>
              </span>
              <a href={`https://wa.me/918208990366?text=Hi%20Packworkz%2C%20I%27d%20like%20to%20talk%20to%20an%20expert.`} target="_blank" rel="noopener noreferrer">
                <button className="btn-fill btn-outline-white px-8 py-3 text-sm">
                  Talk to an Expert
                </button>
              </a>
            </div>
          </div>

        </div>}


      {/* ══════════════════════════════════════════════════════════ */}
      {/*  SECTION 12 — CASE STUDIES                                */}
      {/* ══════════════════════════════════════════════════════════ */}
      <section style={{ background: "#FFFFFF", padding: "100px 0" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 40px" }}>
          <span className="scroll-animate" style={{ color: "#1B6CA8", fontSize: 11, fontWeight: 600, letterSpacing: "2px", textTransform: "uppercase", display: "block", marginBottom: 14 }}>
            CLIENT RESULTS
          </span>
          <h2 className="scroll-animate scroll-animate-delay-1" style={{ color: "#0D1B2A", fontSize: "clamp(2rem,4vw,3.25rem)", fontWeight: 700, lineHeight: 1.1, marginBottom: 0 }}>
            Brands that switched.<br />Numbers that speak.
          </h2>

          <div className="po-case-grid" style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 28, maxWidth: 1100, margin: "56px auto 0", alignItems: "stretch" }}>
            {/* Left: selector cards */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {CASE_STUDIES.map((cs, i) => {
                const isActive = activeCase === i;
                return (
                  <div
                    key={i}
                    onClick={() => { setActiveCase(i); startCaseRotation(); }}
                    style={{
                      background: isActive ? "#EFF6FF" : "white",
                      border: `1px solid ${isActive ? "#1B6CA8" : "#E2EAF4"}`,
                      padding: "22px 24px",
                      cursor: "pointer",
                      position: "relative",
                      overflow: "hidden",
                      transition: "all 0.3s ease",
                      boxShadow: isActive ? "0 4px 20px rgba(27,108,168,0.12)" : "none",
                    }}
                  >
                    {isActive && (
                      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 3, background: "#1B6CA8" }} />
                    )}
                    {isActive && (
                      <div style={{ position: "absolute", bottom: 0, left: 0, height: 2, background: "#1B6CA8", animation: "progress-fill 4s linear forwards" }} />
                    )}
                    <div style={{ width: 44, height: 44, background: cs.logoBg ?? "#0D1B2A", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12, overflow: "hidden", flexShrink: 0 }}>
                      {cs.logo
                        ? <img src={cs.logo} alt={cs.company} style={{ width: "100%", height: "100%", objectFit: "contain", padding: 4 }} />
                        : <span style={{ color: "white", fontSize: 13, fontWeight: 700 }}>{cs.initials}</span>
                      }
                    </div>
                    <p style={{ color: "#0D1B2A", fontSize: 15, fontWeight: 700, marginBottom: 3 }}>{cs.company}</p>
                    <p style={{ color: "#64748B", fontSize: 12 }}>{cs.industry}</p>
                    <div style={{ display: "inline-block", marginTop: 10, background: "rgba(27,108,168,0.08)", border: "1px solid rgba(27,108,168,0.2)", padding: "4px 12px" }}>
                      <span style={{ color: "#1B6CA8", fontSize: 12, fontWeight: 600 }}>{cs.metric}</span>
                    </div>

                    {/* Mobile-only inline detail — hidden on desktop via CSS */}
                    {isActive && (
                      <div className="po-case-inline-detail" style={{ marginTop: 20, paddingTop: 20, borderTop: "1px solid #E2EAF4" }}>
                        <p style={{ color: "#1B6CA8", fontSize: 10, fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", marginBottom: 8 }}>THE RESULT</p>
                        <p style={{ color: "#0D1B2A", fontSize: 13, lineHeight: 1.65, fontWeight: 600, marginBottom: 16 }}>{cs.result}</p>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
                          {cs.metrics.map((m) => (
                            <div key={m.label} style={{ background: "#F1F5F9", padding: "10px 8px", textAlign: "center" }}>
                              <p style={{ color: "#E8A838", fontSize: 18, fontWeight: 700, lineHeight: 1 }}>{m.val}</p>
                              <p style={{ color: "#64748B", fontSize: 10, marginTop: 4, lineHeight: 1.3 }}>{m.label}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* 4th slot: CTA */}
              <div style={{ background: "#0D1B2A", border: "1px solid rgba(27,108,168,0.2)", padding: "22px 24px", display: "flex", flexDirection: "column", justifyContent: "center", flex: 1 }}>
                <p style={{ color: "#60a5fa", fontSize: 10, fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", marginBottom: 12 }}>YOUR BRAND</p>
                <p style={{ color: "white", fontSize: 15, fontWeight: 700, marginBottom: 8, lineHeight: 1.3 }}>Could your story be next?</p>
                <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 12, lineHeight: 1.55, marginBottom: 18 }}>Join 220+ brands that simplified their packaging with Packworkz.</p>
                <Link href="/quote">
                  <button style={{ background: "#1B6CA8", color: "white", padding: "10px 20px", fontSize: 13, fontWeight: 700, border: "none", cursor: "pointer" }}>
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
          <span className="scroll-animate" style={{
            color: "#1B6CA8", fontSize: 11, fontWeight: 600,
            letterSpacing: "2px", textTransform: "uppercase",
            display: "block", marginBottom: 14,
          }}>
            THE NUMBERS
          </span>

          {/* Headline */}
          <h2 className="scroll-animate scroll-animate-delay-1" style={{
            color: "#0D1B2A", fontSize: "clamp(2rem, 5vw, 3.25rem)", fontWeight: 700,
            lineHeight: 1.15, marginBottom: 16,
          }}>
            How much is vendor<br />chaos costing you?
          </h2>

          {/* Subheadline */}
          <p className="scroll-animate scroll-animate-delay-2" style={{ color: "#64748B", fontSize: 18, marginBottom: 56 }}>
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
                <label htmlFor="spend-slider" style={{
                  display: "block", color: "#0D1B2A", fontSize: 13,
                  fontWeight: 600, letterSpacing: "0.3px", marginBottom: 20,
                }}>
                  Monthly packaging spend
                </label>

                <input
                  id="spend-slider"
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
                    <span>Get My Free Packaging Audit →</span>
                  </button>
                </Link>

                {/* Disclaimer */}
                <p style={{
                  color: "rgba(255,255,255,0.45)", fontSize: 12,
                  textAlign: "center", marginTop: 12, lineHeight: 1.6,
                }}>
                  We'll show you exactly where you're overpaying. No commitment.
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
        style={{ background: "#08080f", padding: "160px 0" }}
      >
        {/* Rich blue spotlight — Remarqd-style radial glow at bottom center */}
        <div className="absolute inset-0 pointer-events-none" style={{
          background: "radial-gradient(ellipse 65% 60% at 50% 90%, rgba(27,108,168,0.55) 0%, rgba(13,40,90,0.30) 40%, transparent 70%)",
        }} />
        {/* Amber accent ring */}
        <div className="absolute inset-0 pointer-events-none" style={{
          background: "radial-gradient(ellipse 35% 25% at 50% 100%, rgba(232,168,56,0.18) 0%, transparent 60%)",
        }} />

        {/* Content */}
        <div className="relative" style={{
          zIndex: 1, maxWidth: 600, margin: "0 auto", padding: "0 32px",
          display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center",
        }}>

          {/* Eyebrow — frosted pill tag */}
          <div className="scroll-animate" style={{ marginBottom: 28 }}>
            <span style={{
              display: "inline-flex", alignItems: "center",
              background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 9999, padding: "7px 20px",
              color: "rgba(255,255,255,0.55)", fontSize: 11, fontWeight: 600,
              letterSpacing: "2.5px", textTransform: "uppercase",
            }}>
              YOUR MOVE
            </span>
          </div>

          {/* Headline — split like Remarqd */}
          <h2 className="scroll-animate scroll-animate-delay-1" style={{
            color: "#FFFFFF", fontSize: "clamp(2.4rem, 5.5vw, 60px)", fontWeight: 800,
            lineHeight: 1.05, letterSpacing: "-2px", marginBottom: 8,
          }}>
            Packaging sorted.
          </h2>
          <h2 className="scroll-animate scroll-animate-delay-2 clash-display" style={{
            color: "#E8A838", fontSize: "clamp(2.4rem, 5.5vw, 60px)", fontWeight: 800,
            lineHeight: 1.05, letterSpacing: "-2px", marginBottom: 28, fontStyle: "italic",
          }}>
            Forever.
          </h2>

          {/* Subheadline */}
          <p className="scroll-animate scroll-animate-delay-2" style={{
            color: "rgba(255,255,255,0.45)", fontSize: 17,
            maxWidth: 420, marginBottom: 44, lineHeight: 1.7,
          }}>
            Join brands across India and 40+ countries who have simplified their packaging supply chain.
          </p>

          {/* CTAs — sharp animated-border (our design) */}
          <div className="scroll-animate scroll-animate-delay-3 flex flex-col sm:flex-row gap-4 justify-center mb-5" style={{ alignItems: "stretch" }}>
            <span className="animated-border animated-border-white" style={{ display: "flex" }}>
              <Link href="/products" style={{ flex: 1, display: "flex" }}>
                <button className="btn-fill btn-amber px-10 py-4 text-base whitespace-nowrap" style={{ flex: 1 }}>
                  Browse 110+ SKUs →
                </button>
              </Link>
            </span>
            <a
              href={`https://wa.me/${WHATSAPP_NUM}?text=Hi%20Packworkz%2C%20I%27d%20like%20to%20discuss%20packaging.`}
              target="_blank" rel="noopener noreferrer" style={{ display: "flex" }}
            >
              <button className="btn-fill btn-outline-white px-10 py-4 text-base whitespace-nowrap" style={{ flex: 1 }}>
                Talk to a human first
              </button>
            </a>
          </div>

          <p className="scroll-animate scroll-animate-delay-4" style={{
            color: "rgba(255,255,255,0.22)", fontSize: 13, letterSpacing: "0.3px",
          }}>
            No commitment · No sales pitch · Just results
          </p>

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
