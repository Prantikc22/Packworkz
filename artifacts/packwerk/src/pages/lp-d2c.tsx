import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";

// ─── Calculator ───────────────────────────────────────────────────────────────
type VendorBucket = "Just 1" | "2 to 4" | "5+";
type CreditOption = "Yes" | "No";

function calcSavings(monthly: number, vendors: VendorBucket, credit: CreditOption) {
  const savingPct = vendors === "Just 1" ? 0.08 : vendors === "2 to 4" ? 0.10 : 0.12;
  const annual = monthly * 12;
  const annualSaving = annual * savingPct;
  const creditMarkup = credit === "Yes" ? annual * 0.12 : 0;
  const upfrontSaving = annual * 0.03;
  const timeSaved = vendors === "Just 1" ? 4 : vendors === "2 to 4" ? 8 : 14;
  return { annual, annualSaving, creditMarkup, upfrontSaving, totalValue: annualSaving + creditMarkup, timeSaved };
}

const inr = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

// ─── Industries ───────────────────────────────────────────────────────────────
const INDUSTRIES = [
  {
    key: "beauty",
    label: "Beauty & Cosmetics",
    emoji: "✨",
    accent: "#D946EF",
    bg: "linear-gradient(135deg,#2d0038 0%,#4a0060 100%)",
    img: "/industries/beauty.jpg",
    headline: "Packaging that reflects your brand's prestige",
    desc: "Cosmetic tubes, airless pumps, magnetic closure boxes, and luxury rigid sets — tailored for skincare, makeup, and fragrance brands.",
    skus: ["Airless Pump Bottles", "Cosmetic Tubes", "Magnetic Closure Boxes", "Rigid Gift Sets", "Spray Pumps & Dispensers"],
    brands: ["Plum", "Pilgrim", "Juicy Chemistry", "CosIQ"],
  },
  {
    key: "food",
    label: "Food & Beverage",
    emoji: "🍃",
    accent: "#22C55E",
    bg: "linear-gradient(135deg,#002a14 0%,#004d24 100%)",
    img: "/industries/food.jpg",
    headline: "From farm to shelf — packaging built for freshness",
    desc: "Barrier pouches, stand-up packs, liquid cartons, and food-safe films designed to extend shelf life and drive impulse purchase.",
    skus: ["Stand-Up Pouches", "Retort Pouches", "Gable-Top Cartons", "Food Delivery Boxes", "Greaseproof Films"],
    brands: ["Rage Coffee", "Mogu Mogu", "Zestful Foods", "Artisan Chai Co."],
  },
  {
    key: "fmcg",
    label: "FMCG & Personal Care",
    emoji: "🛒",
    accent: "#F59E0B",
    bg: "linear-gradient(135deg,#1a1200 0%,#3a2800 100%)",
    img: "/industries/fmcg.jpg",
    headline: "Speed-to-shelf for high-velocity SKUs",
    desc: "Printed rolls, labels, blister packs, and folding cartons. Fast turnarounds, multi-factory back-up, and consistent colour matching at scale.",
    skus: ["Printed Laminated Rolls", "Folding Cartons", "Blister Packs", "Shrink Sleeves", "Pressure-Sensitive Labels"],
    brands: ["NutriCore", "Harvest Organics", "PurePet Foods", "EcoWear India"],
  },
  {
    key: "d2c",
    label: "E-commerce & D2C",
    emoji: "📦",
    accent: "#3B82F6",
    bg: "linear-gradient(135deg,#00102a 0%,#00204f 100%)",
    img: "/industries/ecommerce.jpg",
    headline: "Unboxing that converts one-time buyers to loyalists",
    desc: "Mailer boxes, poly mailers, tissue paper, thank-you cards, and tamper-evident packs — branded from ₹1 per unit at scalable MOQs.",
    skus: ["Custom Mailer Boxes", "Poly Mailer Bags", "Tissue Paper & Inserts", "Tamper-Evident Bags", "Thank-You Cards"],
    brands: ["The Souled Store", "Neeman's", "Urban Nest Home", "QuickShip Commerce"],
  },
];

// ─── Comparison ───────────────────────────────────────────────────────────────
const COMPARE = [
  { aspect: "Quote turnaround",   old: "3–7 days",                     pw: "48 hours" },
  { aspect: "First sample",       old: "2–4 weeks",                    pw: "7–10 days" },
  { aspect: "Brief to delivery",  old: "6–12 weeks",                   pw: "14 days" },
  { aspect: "Re-order",           old: "Call / email vendor",           pw: "One click in dashboard" },
  { aspect: "QC process",         old: "Hope for the best",             pw: "Owned QC + 3 backup factories" },
  { aspect: "Vendor risk",        old: "1 vendor = 1 point of failure", pw: "3 backup vendors per order" },
  { aspect: "Payment terms",      old: "Net-30/60 with hidden markup",  pw: "50/50 milestone, no credit markup" },
];

// ─── Testimonials ─────────────────────────────────────────────────────────────
const TESTIMONIALS = [
  {
    quote: "We switched 8 packaging SKUs in 6 weeks. Delivery on time, quality identical to sample approval. The one-click reorder alone saves my ops team 3 hours a week.",
    name: "Priya Mehta", title: "Co-Founder, Zestful Foods", initials: "PM", industry: "Food & Beverage",
  },
  {
    quote: "Packworkz matched our previous vendor's price on stand-up pouches — then beat it by 9% on the second order. Price match guarantee is real.",
    name: "Rahul Desai", title: "Head of Operations, NutriCore", initials: "RD", industry: "FMCG",
  },
  {
    quote: "From WhatsApp brief to production samples in 8 days. We were launching a new SKU under pressure and this was the fastest packaging experience we've ever had.",
    name: "Aisha Khan", title: "Brand Manager, Botanica", initials: "AK", industry: "Beauty & Cosmetics",
  },
];

// ─── Steps ────────────────────────────────────────────────────────────────────
const STEPS = [
  { n: "01", icon: "💬", title: "Brief us in 10 minutes", desc: "Tell us your product, MOQ, timeline, and any design files — via WhatsApp, form, or a quick call." },
  { n: "02", icon: "🔬", title: "Receive sample in 7–10 days", desc: "We source from our factory network and ship a physical sample to your door. From ₹2,999, no commitment." },
  { n: "03", icon: "✅", title: "Approve & pay first 50%", desc: "Pay 50% on order confirmation. We begin production immediately — no waiting." },
  { n: "04", icon: "🚚", title: "Delivered in 14 days total", desc: "Balance due on sample approval. Your order ships and arrives doorstep — on time, every time." },
];

const STATS = [
  { value: "220+", label: "Brands served" },
  { value: "110+", label: "Packaging SKUs" },
  { value: "14",   label: "Days brief to door" },
  { value: "98.7%", label: "On-time delivery" },
];

// ─── useInView hook ───────────────────────────────────────────────────────────
function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVisible(true); obs.disconnect(); }
    }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

export default function LpD2c() {
  const [heroLoaded, setHeroLoaded] = useState(false);
  const [activeIndustry, setActiveIndustry] = useState(0);
  const [monthlySpend, setMonthlySpend] = useState(500000);
  const [vendorBucket, setVendorBucket] = useState<VendorBucket>("2 to 4");
  const [useCredit, setUseCredit] = useState<CreditOption>("Yes");

  const calc = calcSavings(monthlySpend, vendorBucket, useCredit);
  const sliderPct = Math.round(((monthlySpend - 50000) / (5000000 - 50000)) * 100);

  const [displayedSaving, setDisplayedSaving] = useState(calc.annualSaving);
  const animRef = useRef<number | null>(null);
  const fromRef = useRef(calc.annualSaving);

  useEffect(() => { const t = setTimeout(() => setHeroLoaded(true), 80); return () => clearTimeout(t); }, []);

  useEffect(() => {
    const from = fromRef.current;
    const to = calc.annualSaving;
    if (from === to) return;
    const start = performance.now();
    const duration = 450;
    if (animRef.current) cancelAnimationFrame(animRef.current);
    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const e = 1 - Math.pow(1 - t, 3);
      setDisplayedSaving(Math.round(from + (to - from) * e));
      if (t < 1) animRef.current = requestAnimationFrame(tick);
      else fromRef.current = to;
    };
    animRef.current = requestAnimationFrame(tick);
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [calc.annualSaving]);

  const ind = INDUSTRIES[activeIndustry];

  const heroSection = useInView(0.05);
  const statsSection = useInView(0.2);
  const industrySection = useInView(0.1);
  const compareSection = useInView(0.1);
  const processSection = useInView(0.1);
  const calcSection = useInView(0.1);
  const testimonialSection = useInView(0.1);
  const ctaSection = useInView(0.15);

  return (
    <>
      {/* ── Global styles & keyframes ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700;900&family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');

        * { box-sizing: border-box; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(40px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.92); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes slideRight {
          from { opacity: 0; transform: translateX(-30px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes float1 { 0%,100% { transform: translateY(0px) rotate(-1deg); } 50% { transform: translateY(-18px) rotate(1deg); } }
        @keyframes float2 { 0%,100% { transform: translateY(0px) rotate(1deg); } 50% { transform: translateY(-14px) rotate(-1deg); } }
        @keyframes float3 { 0%,100% { transform: translateY(0px); } 50% { transform: translateY(-20px); } }
        @keyframes float4 { 0%,100% { transform: translateY(-8px) rotate(-1deg); } 50% { transform: translateY(8px) rotate(1deg); } }
        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes pulse {
          0%,100% { transform: scale(1); opacity: 0.8; }
          50%     { transform: scale(1.05); opacity: 1; }
        }
        @keyframes orb1 {
          0%,100% { transform: translate(0,0); }
          33%     { transform: translate(30px,-20px); }
          66%     { transform: translate(-20px,15px); }
        }
        @keyframes orb2 {
          0%,100% { transform: translate(0,0); }
          33%     { transform: translate(-25px,20px); }
          66%     { transform: translate(20px,-15px); }
        }
        @keyframes borderFlow {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes countUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes indTab {
          from { opacity:0; transform: translateX(20px); }
          to   { opacity:1; transform: translateX(0); }
        }
        @keyframes stepLine {
          from { width: 0; }
          to   { width: 100%; }
        }

        .lp-hero-card {
          background: rgba(255,255,255,0.07);
          border: 1px solid rgba(255,255,255,0.14);
          backdrop-filter: blur(12px);
          border-radius: 14px;
          padding: 18px 20px;
          position: absolute;
          cursor: default;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .lp-hero-card:hover {
          transform: scale(1.04);
          box-shadow: 0 20px 60px rgba(0,0,0,0.4);
        }

        .lp-gradient-text {
          background: linear-gradient(135deg, #E8A838 0%, #f5d08a 40%, #E8A838 80%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 3s linear infinite;
        }

        .lp-cta-primary {
          display: inline-block;
          background: linear-gradient(135deg, #E8A838 0%, #f0b93a 100%);
          color: #0D1B2A;
          font-weight: 800;
          font-size: 15px;
          padding: 16px 36px;
          text-decoration: none;
          letter-spacing: 0.02em;
          border-radius: 6px;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          box-shadow: 0 4px 20px rgba(232,168,56,0.35);
        }
        .lp-cta-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 32px rgba(232,168,56,0.5);
        }
        .lp-cta-secondary {
          display: inline-block;
          background: transparent;
          color: white;
          border: 1.5px solid rgba(255,255,255,0.3);
          font-weight: 600;
          font-size: 15px;
          padding: 15px 28px;
          text-decoration: none;
          letter-spacing: 0.02em;
          border-radius: 6px;
          transition: background 0.2s ease, border-color 0.2s ease;
        }
        .lp-cta-secondary:hover {
          background: rgba(255,255,255,0.08);
          border-color: rgba(255,255,255,0.5);
        }

        .lp-ind-tab {
          padding: 10px 22px;
          border-radius: 99px;
          border: 1.5px solid transparent;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.25s ease;
          white-space: nowrap;
        }

        .lp-stat-card {
          opacity: 0;
          transform: translateY(30px);
          transition: opacity 0.5s ease, transform 0.5s ease;
        }
        .lp-stat-card.visible {
          opacity: 1;
          transform: translateY(0);
        }

        .lp-section-reveal {
          opacity: 0;
          transform: translateY(36px);
          transition: opacity 0.65s ease, transform 0.65s ease;
        }
        .lp-section-reveal.visible {
          opacity: 1;
          transform: translateY(0);
        }

        .lp-compare-row {
          opacity: 0;
          transform: translateX(-20px);
          transition: opacity 0.4s ease, transform 0.4s ease;
        }
        .lp-compare-row.visible {
          opacity: 1;
          transform: translateX(0);
        }

        .lp-step-card {
          opacity: 0;
          transform: translateY(40px) scale(0.96);
          transition: opacity 0.5s ease, transform 0.5s ease;
        }
        .lp-step-card.visible {
          opacity: 1;
          transform: translateY(0) scale(1);
        }

        .lp-testimonial {
          opacity: 0;
          transform: translateY(30px);
          transition: opacity 0.5s ease, transform 0.5s ease;
        }
        .lp-testimonial.visible {
          opacity: 1;
          transform: translateY(0);
        }

        .lp-badge-shimmer {
          background: linear-gradient(90deg, rgba(232,168,56,0.12) 0%, rgba(232,168,56,0.25) 50%, rgba(232,168,56,0.12) 100%);
          background-size: 200% auto;
          animation: shimmer 2.5s linear infinite;
        }

        @media (max-width: 768px) {
          .lp-hero-cards-area { display: none !important; }
          .lp-compare-grid { grid-template-columns: 1fr 1.5fr !important; }
          .lp-calc-grid { grid-template-columns: 1fr !important; }
          .lp-stats-grid { grid-template-columns: 1fr 1fr !important; }
          .lp-cta-row { flex-direction: column !important; }
          .lp-cta-row a { width: 100%; text-align: center; }
          .lp-ind-img { height: 180px !important; }
          .lp-section-pad { padding-left: 20px !important; padding-right: 20px !important; }
        }
      `}</style>

      <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", background: "#ffffff", overflowX: "hidden" }}>

        {/* ── Sticky header ── */}
        <header style={{
          position: "fixed", top: 0, left: 0, right: 0, zIndex: 200,
          background: "rgba(2,8,23,0.92)", backdropFilter: "blur(16px)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "0 32px", height: 60,
        }}>
          <Link href="/" style={{ textDecoration: "none" }}>
            <span style={{ color: "white", fontWeight: 900, fontSize: 22, fontFamily: "'Space Grotesk', sans-serif", letterSpacing: "-0.03em" }}>
              Packworkz
            </span>
          </Link>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <a href="https://wa.me/918208990366" target="_blank" rel="noreferrer"
              style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, fontWeight: 600, textDecoration: "none", display: "flex", alignItems: "center", gap: 6 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="#25D366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
              WhatsApp
            </a>
            <Link href="/quote" className="lp-cta-primary" style={{ padding: "8px 18px", fontSize: 13 }}>
              Get Free Quote
            </Link>
          </div>
        </header>

        {/* ══════════════════════════════════════════════
            HERO — same visual language as home page
        ═══════════════════════════════════════════════ */}
        <section
          ref={heroSection.ref}
          style={{
            background: "linear-gradient(135deg, #020817 0%, #071a45 40%, #153e9f 100%)",
            minHeight: "92vh",
            paddingTop: 60,
            position: "relative",
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
          }}
        >
          {/* Geometric line overlay — same as home */}
          <div style={{ position: "absolute", inset: 0, opacity: 0.07, pointerEvents: "none" }}>
            <svg width="100%" height="100%" preserveAspectRatio="none" viewBox="0 0 100 100">
              <path d="M0,20 L20,0 L100,0 L100,80 L80,100 L0,100 Z" fill="none" stroke="white" strokeWidth="0.15" />
              <path d="M10,30 L30,10 L90,10 L90,70 L70,90 L10,90 Z" fill="none" stroke="white" strokeWidth="0.1" />
            </svg>
          </div>

          {/* Blue radial glow — same as home */}
          <div style={{
            position: "absolute", right: "-2%", bottom: "-5%",
            width: "58%", height: "110%", pointerEvents: "none",
            background: "radial-gradient(circle at 50% 60%, rgba(59,130,246,0.38) 0%, transparent 65%)",
          }} />

          {/* Golden arc ring — same as home */}
          <svg
            style={{
              position: "absolute", right: "1%", bottom: "2%",
              width: "52%", height: "90%",
              opacity: heroLoaded ? 0.55 : 0, transition: "opacity 1.2s ease",
              pointerEvents: "none",
            }}
            viewBox="0 0 500 500" fill="none"
          >
            <circle cx="250" cy="270" r="210" stroke="url(#goldArcLP)" strokeWidth="1.5" />
            <circle cx="250" cy="270" r="238" stroke="url(#goldArc2LP)" strokeWidth="0.7" />
            <circle cx="250" cy="270" r="185" stroke="url(#goldArcLP)" strokeWidth="0.4" strokeOpacity="0.5" />
            <defs>
              <linearGradient id="goldArcLP" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#E8A838" stopOpacity="0" />
                <stop offset="35%" stopColor="#E8A838" stopOpacity="0.9" />
                <stop offset="65%" stopColor="#f5d08a" stopOpacity="0.7" />
                <stop offset="100%" stopColor="#E8A838" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="goldArc2LP" x1="1" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#E8A838" stopOpacity="0" />
                <stop offset="50%" stopColor="#E8A838" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#E8A838" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>

          {/* Floating product cards (right side) — same style as home */}
          <div className="lp-hero-cards-area" style={{ position: "absolute", right: "4%", top: "8%", width: "44%", height: "84%", pointerEvents: "none" }}>
            {[
              { top: "4%",  left: "18%", w: 190, icon: "✨", title: "Beauty Packaging",    count: "28 SKUs", anim: "float1 6s ease-in-out infinite", delay: "0.3s" },
              { top: "6%",  left: "58%", w: 175, icon: "🍃", title: "Food & Beverage",     count: "22 SKUs", anim: "float2 7s ease-in-out -2s infinite", delay: "0.5s" },
              { top: "40%", left: "5%",  w: 178, icon: "🛒", title: "FMCG & Personal Care",count: "19 SKUs", anim: "float3 5.5s ease-in-out -1s infinite", delay: "0.4s" },
              { top: "38%", left: "56%", w: 170, icon: "📦", title: "E-commerce D2C",      count: "17 SKUs", anim: "float4 6.5s ease-in-out -3s infinite", delay: "0.7s" },
              { top: "72%", left: "20%", w: 180, icon: "♻️", title: "Sustainable Packs",   count: "12 SKUs", anim: "float1 7s ease-in-out -2s infinite",   delay: "0.6s" },
            ].map((card, i) => (
              <div key={i} className="lp-hero-card" style={{
                top: card.top, left: card.left, width: card.w,
                animation: heroLoaded ? card.anim : "none",
                opacity: heroLoaded ? 1 : 0,
                transition: `opacity 0.8s ease ${card.delay}`,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                  <span style={{ fontSize: 22 }}>{card.icon}</span>
                  <span style={{ color: "white", fontSize: 13, fontWeight: 700 }}>{card.title}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ color: "rgba(255,255,255,0.45)", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>{card.count}</span>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#22C55E", boxShadow: "0 0 6px #22C55E" }} />
                </div>
              </div>
            ))}
          </div>

          {/* Hero content */}
          <div style={{ maxWidth: 1100, margin: "0 auto", padding: "60px 32px", width: "100%", position: "relative", zIndex: 10 }}>
            <div style={{ maxWidth: 640 }}>

              {/* Badge */}
              <div className="lp-badge-shimmer" style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                border: "1px solid rgba(232,168,56,0.35)",
                borderRadius: 99, padding: "6px 16px", marginBottom: 28,
                opacity: heroLoaded ? 1 : 0, transition: "opacity 0.6s ease 0.1s",
              }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="#E8A838"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                <span style={{ color: "#E8A838", fontSize: 12, fontWeight: 700 }}>220+ D2C &amp; FMCG brands trust Packworkz</span>
              </div>

              <h1 style={{
                color: "white",
                fontSize: "clamp(2.2rem, 5vw, 3.9rem)",
                fontWeight: 900, lineHeight: 1.08, marginBottom: 24,
                fontFamily: "'Space Grotesk', sans-serif", letterSpacing: "-0.02em",
                opacity: heroLoaded ? 1 : 0,
                transform: heroLoaded ? "translateY(0)" : "translateY(28px)",
                transition: "opacity 0.7s ease 0.2s, transform 0.7s ease 0.2s",
              }}>
                Order Packaging Like You<br />
                Order from Amazon.{" "}
                <span className="lp-gradient-text">Brief to Doorstep in 14 Days.</span>
              </h1>

              <p style={{
                color: "rgba(255,255,255,0.7)", fontSize: 18, lineHeight: 1.75, marginBottom: 36, maxWidth: 540,
                opacity: heroLoaded ? 1 : 0, transform: heroLoaded ? "translateY(0)" : "translateY(20px)",
                transition: "opacity 0.7s ease 0.35s, transform 0.7s ease 0.35s",
              }}>
                India's first managed packaging platform. Beauty, food, FMCG, e-commerce — 110+ SKUs, owned QC, 3 backup vendors per order. No chaos. No delays. No surprises.
              </p>

              {/* Price match badge */}
              <div style={{
                background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.13)",
                borderRadius: 12, padding: "18px 22px", marginBottom: 36, maxWidth: 520,
                opacity: heroLoaded ? 1 : 0, transform: heroLoaded ? "translateY(0)" : "translateY(20px)",
                transition: "opacity 0.7s ease 0.45s, transform 0.7s ease 0.45s",
              }}>
                <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                  <div style={{
                    width: 38, height: 38, background: "#E8A838", borderRadius: 8, flexShrink: 0,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0D1B2A" strokeWidth="2.5" strokeLinecap="round"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </div>
                  <div>
                    <p style={{ color: "white", fontWeight: 800, fontSize: 15, marginBottom: 3 }}>First Order Price Match Guarantee</p>
                    <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.6, margin: 0 }}>
                      We match your current vendor's price — or we cover the difference. Sample from ₹2,999. No commitment until you approve.
                    </p>
                  </div>
                </div>
              </div>

              {/* CTAs */}
              <div className="lp-cta-row" style={{
                display: "flex", gap: 14, flexWrap: "wrap",
                opacity: heroLoaded ? 1 : 0, transform: heroLoaded ? "translateY(0)" : "translateY(20px)",
                transition: "opacity 0.7s ease 0.55s, transform 0.7s ease 0.55s",
              }}>
                <Link href="/quote" className="lp-cta-primary">
                  Get My Free Quote in 48hrs →
                </Link>
                <Link href="/samples" className="lp-cta-secondary">
                  Order a Sample ₹2,999
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════
            STATS BAR
        ═══════════════════════════════════════════════ */}
        <section
          ref={statsSection.ref}
          style={{ background: "#0D1B2A", padding: "0 32px" }}
        >
          <div className="lp-stats-grid" style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 0 }}>
            {STATS.map((s, i) => (
              <div
                key={i}
                className={`lp-stat-card${statsSection.visible ? " visible" : ""}`}
                style={{
                  padding: "36px 28px",
                  borderRight: i < 3 ? "1px solid rgba(255,255,255,0.07)" : "none",
                  textAlign: "center",
                  transitionDelay: `${i * 100}ms`,
                }}
              >
                <p style={{ color: "#E8A838", fontSize: "clamp(2rem,4vw,2.8rem)", fontWeight: 900, lineHeight: 1, marginBottom: 6, fontFamily: "'Space Grotesk', sans-serif" }}>
                  {s.value}
                </p>
                <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", margin: 0 }}>
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ══════════════════════════════════════════════
            INDUSTRY VERTICALS
        ═══════════════════════════════════════════════ */}
        <section
          ref={industrySection.ref}
          className="lp-section-pad"
          style={{ background: "#F8F9FC", padding: "96px 32px" }}
        >
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>

            <div className={`lp-section-reveal${industrySection.visible ? " visible" : ""}`} style={{ marginBottom: 48 }}>
              <p style={{ color: "#1B6CA8", fontSize: 11, fontWeight: 700, letterSpacing: "2.5px", textTransform: "uppercase", marginBottom: 12 }}>
                YOUR INDUSTRY
              </p>
              <h2 style={{ color: "#0D1B2A", fontSize: "clamp(1.9rem, 4vw, 2.8rem)", fontWeight: 800, lineHeight: 1.12, marginBottom: 16, fontFamily: "'Space Grotesk', sans-serif" }}>
                Built for every consumer brand.
              </h2>
              <p style={{ color: "#64748B", fontSize: 17, lineHeight: 1.7, maxWidth: 560 }}>
                Whether you're a beauty brand, food startup, or fast-moving FMCG company — Packworkz has the packaging and the expertise for your category.
              </p>
            </div>

            {/* Industry tabs */}
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 40 }}>
              {INDUSTRIES.map((ind, i) => (
                <button
                  key={ind.key}
                  className="lp-ind-tab"
                  onClick={() => setActiveIndustry(i)}
                  style={{
                    background: activeIndustry === i ? ind.accent : "transparent",
                    color: activeIndustry === i ? (ind.key === "food" ? "#002a14" : "#fff") : "#64748B",
                    borderColor: activeIndustry === i ? ind.accent : "#E2EAF4",
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                  }}
                >
                  {ind.emoji} {ind.label}
                </button>
              ))}
            </div>

            {/* Industry panel */}
            <div
              key={activeIndustry}
              style={{
                display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0,
                borderRadius: 20, overflow: "hidden",
                boxShadow: "0 20px 80px rgba(13,27,42,0.12)",
                animation: "indTab 0.35s ease both",
              }}
            >
              {/* Left — image */}
              <div className="lp-ind-img" style={{ position: "relative", minHeight: 380, overflow: "hidden" }}>
                <img
                  src={ind.img}
                  alt={ind.label}
                  style={{ width: "100%", height: "100%", objectFit: "cover", position: "absolute", inset: 0 }}
                />
                <div style={{ position: "absolute", inset: 0, background: ind.bg, opacity: 0.65 }} />
                <div style={{ position: "absolute", inset: 0, padding: "36px", display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
                  <div style={{
                    display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 14,
                    background: "rgba(255,255,255,0.12)", borderRadius: 99, padding: "6px 14px",
                    border: `1px solid ${ind.accent}40`, width: "fit-content",
                  }}>
                    <span style={{ color: ind.accent, fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px" }}>
                      {ind.emoji} {ind.label}
                    </span>
                  </div>
                  <h3 style={{ color: "white", fontSize: "clamp(1.3rem,2.5vw,1.8rem)", fontWeight: 800, lineHeight: 1.2, margin: 0, fontFamily: "'Space Grotesk', sans-serif" }}>
                    {ind.headline}
                  </h3>
                </div>
              </div>

              {/* Right — detail */}
              <div style={{ background: "white", padding: "44px 44px" }}>
                <p style={{ color: "#64748B", fontSize: 15, lineHeight: 1.75, marginBottom: 28 }}>{ind.desc}</p>

                <p style={{ color: "#0D1B2A", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: 16 }}>
                  Popular SKUs for this category
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 32 }}>
                  {ind.skus.map((sku, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ width: 6, height: 6, borderRadius: "50%", background: ind.accent, flexShrink: 0 }} />
                      <span style={{ color: "#334155", fontSize: 14, fontWeight: 600 }}>{sku}</span>
                    </div>
                  ))}
                </div>

                <p style={{ color: "#94A3B8", fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 14 }}>
                  Brands in this category
                </p>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 36 }}>
                  {ind.brands.map((b, i) => (
                    <span key={i} style={{
                      padding: "4px 12px", borderRadius: 99, fontSize: 12, fontWeight: 700,
                      background: `${ind.accent}14`, color: ind.accent,
                      border: `1px solid ${ind.accent}30`,
                    }}>{b}</span>
                  ))}
                </div>

                <Link href="/quote" className="lp-cta-primary" style={{ width: "100%", textAlign: "center" }}>
                  Get a Free Quote for {ind.label} →
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════
            COMPARISON TABLE
        ═══════════════════════════════════════════════ */}
        <section
          ref={compareSection.ref}
          className="lp-section-pad"
          style={{ background: "white", padding: "96px 32px" }}
        >
          <div style={{ maxWidth: 960, margin: "0 auto" }}>

            <div className={`lp-section-reveal${compareSection.visible ? " visible" : ""}`} style={{ marginBottom: 48 }}>
              <p style={{ color: "#1B6CA8", fontSize: 11, fontWeight: 700, letterSpacing: "2.5px", textTransform: "uppercase", marginBottom: 12 }}>
                THE DIFFERENCE
              </p>
              <h2 style={{ color: "#0D1B2A", fontSize: "clamp(1.9rem, 4vw, 2.8rem)", fontWeight: 800, lineHeight: 1.12, marginBottom: 14, fontFamily: "'Space Grotesk', sans-serif" }}>
                This is not your typical packaging vendor.
              </h2>
              <p style={{ color: "#64748B", fontSize: 17, lineHeight: 1.7, maxWidth: 520 }}>
                Traditional procurement is slow, fragmented, and full of hidden costs. We rebuilt it from scratch.
              </p>
            </div>

            <div style={{ border: "1px solid #E2EAF4", borderRadius: 16, overflow: "hidden", boxShadow: "0 8px 40px rgba(13,27,42,0.06)" }}>
              {/* Header */}
              <div className="lp-compare-grid" style={{ display: "grid", gridTemplateColumns: "2fr 2fr 2.5fr", background: "#F8FAFC", borderBottom: "1px solid #E2EAF4" }}>
                {["What you're evaluating", "Traditional vendor", "Packworkz"].map((h, i) => (
                  <div key={i} style={{
                    padding: "14px 24px", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px",
                    color: i === 2 ? "#1B6CA8" : "#94A3B8",
                    borderLeft: i > 0 ? "1px solid #E2EAF4" : "none",
                  }}>{h}</div>
                ))}
              </div>
              {COMPARE.map((row, i) => (
                <div
                  key={i}
                  className={`lp-compare-row lp-compare-grid${compareSection.visible ? " visible" : ""}`}
                  style={{
                    display: "grid", gridTemplateColumns: "2fr 2fr 2.5fr",
                    borderBottom: i < COMPARE.length - 1 ? "1px solid #E2EAF4" : "none",
                    background: i % 2 === 0 ? "white" : "#FAFBFC",
                    transitionDelay: `${i * 60}ms`,
                  }}
                >
                  <div style={{ padding: "16px 24px", color: "#0D1B2A", fontSize: 14, fontWeight: 600 }}>{row.aspect}</div>
                  <div style={{ padding: "16px 24px", color: "#64748B", fontSize: 14, borderLeft: "1px solid #E2EAF4", display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ color: "#EF4444", fontWeight: 700 }}>✕</span> {row.old}
                  </div>
                  <div style={{ padding: "16px 24px", color: "#0D1B2A", fontSize: 14, fontWeight: 600, borderLeft: "1px solid #E2EAF4", display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ color: "#22C55E", fontWeight: 700, fontSize: 16 }}>✓</span> {row.pw}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════
            HOW IT WORKS — animated steps
        ═══════════════════════════════════════════════ */}
        <section
          ref={processSection.ref}
          className="lp-section-pad"
          style={{ background: "#020817", padding: "96px 32px", position: "relative", overflow: "hidden" }}
        >
          {/* Background orbs */}
          <div style={{ position: "absolute", top: "20%", left: "5%", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 70%)", animation: "orb1 12s ease-in-out infinite", pointerEvents: "none" }} />
          <div style={{ position: "absolute", bottom: "10%", right: "5%", width: 350, height: 350, borderRadius: "50%", background: "radial-gradient(circle, rgba(232,168,56,0.08) 0%, transparent 70%)", animation: "orb2 14s ease-in-out infinite", pointerEvents: "none" }} />

          <div style={{ maxWidth: 1100, margin: "0 auto", position: "relative", zIndex: 1 }}>

            <div className={`lp-section-reveal${processSection.visible ? " visible" : ""}`} style={{ textAlign: "center", marginBottom: 64 }}>
              <p style={{ color: "#1B6CA8", fontSize: 11, fontWeight: 700, letterSpacing: "2.5px", textTransform: "uppercase", marginBottom: 12 }}>
                THE PROCESS
              </p>
              <h2 style={{ color: "white", fontSize: "clamp(1.9rem, 4vw, 2.8rem)", fontWeight: 800, lineHeight: 1.12, marginBottom: 16, fontFamily: "'Space Grotesk', sans-serif" }}>
                From brief to your door in{" "}
                <span className="lp-gradient-text">14 days</span>.
              </h2>
              <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 16, maxWidth: 440, margin: "0 auto" }}>
                The fastest packaging turnaround in India. Guaranteed.
              </p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 24 }}>
              {STEPS.map((step, i) => (
                <div
                  key={i}
                  className={`lp-step-card${processSection.visible ? " visible" : ""}`}
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.09)",
                    borderRadius: 16, padding: "32px 28px",
                    position: "relative", overflow: "hidden",
                    transitionDelay: `${i * 120}ms`,
                    backdropFilter: "blur(8px)",
                  }}
                >
                  {/* Step number watermark */}
                  <span style={{
                    position: "absolute", top: 16, right: 20,
                    color: "rgba(255,255,255,0.04)", fontSize: 72, fontWeight: 900,
                    fontFamily: "'Space Grotesk', sans-serif", lineHeight: 1, userSelect: "none",
                  }}>
                    {step.n}
                  </span>

                  {/* Icon circle */}
                  <div style={{
                    width: 52, height: 52, borderRadius: 14,
                    background: "linear-gradient(135deg, rgba(232,168,56,0.15) 0%, rgba(232,168,56,0.05) 100%)",
                    border: "1px solid rgba(232,168,56,0.25)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 24, marginBottom: 20,
                  }}>
                    {step.icon}
                  </div>

                  {/* Step number pill */}
                  <div style={{
                    display: "inline-flex", alignItems: "center", gap: 6,
                    background: "rgba(232,168,56,0.1)", border: "1px solid rgba(232,168,56,0.2)",
                    borderRadius: 99, padding: "3px 10px", marginBottom: 14,
                  }}>
                    <span style={{ color: "#E8A838", fontSize: 11, fontWeight: 700 }}>STEP {step.n}</span>
                  </div>

                  <h3 style={{ color: "white", fontSize: 16, fontWeight: 700, marginBottom: 10, lineHeight: 1.3 }}>{step.title}</h3>
                  <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 14, lineHeight: 1.65, margin: 0 }}>{step.desc}</p>

                  {/* Connector line (not last) */}
                  {i < STEPS.length - 1 && (
                    <div style={{ position: "absolute", top: 0, right: -12, width: 24, height: "100%", display: "flex", alignItems: "center", zIndex: 2, pointerEvents: "none" }}>
                      <div style={{ width: "100%", height: 1, background: "rgba(232,168,56,0.2)" }} />
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div style={{ textAlign: "center", marginTop: 56 }}>
              <Link href="/quote" className="lp-cta-primary" style={{ fontSize: 16, padding: "18px 48px" }}>
                Start My 14-Day Journey →
              </Link>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════
            SAVINGS CALCULATOR
        ═══════════════════════════════════════════════ */}
        <section
          ref={calcSection.ref}
          className="lp-section-pad"
          style={{ background: "white", padding: "96px 32px" }}
        >
          <div style={{ maxWidth: 1000, margin: "0 auto" }}>

            <div className={`lp-section-reveal${calcSection.visible ? " visible" : ""}`} style={{ marginBottom: 48 }}>
              <p style={{ color: "#1B6CA8", fontSize: 11, fontWeight: 700, letterSpacing: "2.5px", textTransform: "uppercase", marginBottom: 12 }}>
                THE NUMBERS
              </p>
              <h2 style={{ color: "#0D1B2A", fontSize: "clamp(1.9rem, 4vw, 2.8rem)", fontWeight: 800, lineHeight: 1.12, marginBottom: 12, fontFamily: "'Space Grotesk', sans-serif" }}>
                How much is vendor chaos costing you?
              </h2>
              <p style={{ color: "#64748B", fontSize: 17 }}>Most D2C brands overpay by 8–15% without realising it.</p>
            </div>

            <div
              className={`lp-section-reveal${calcSection.visible ? " visible" : ""}`}
              style={{
                background: "white", border: "1px solid #E2EAF4",
                boxShadow: "0 16px 64px rgba(13,27,42,0.1)",
                borderRadius: 20, overflow: "hidden",
                transitionDelay: "0.15s",
              }}
            >
              <div className="lp-calc-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
                {/* Left inputs */}
                <div style={{ background: "white", padding: "44px 44px", borderRight: "1px solid #E2EAF4" }}>
                  <label style={{ display: "block", color: "#0D1B2A", fontSize: 13, fontWeight: 700, marginBottom: 20, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    Monthly packaging spend
                  </label>
                  <input
                    type="range" min={50000} max={5000000} step={10000}
                    value={monthlySpend}
                    onChange={e => setMonthlySpend(Number(e.target.value))}
                    style={{
                      width: "100%", appearance: "none", height: 6, borderRadius: 99,
                      background: `linear-gradient(to right, #E8A838 0%, #E8A838 ${sliderPct}%, #E2EAF4 ${sliderPct}%, #E2EAF4 100%)`,
                      outline: "none", cursor: "pointer",
                    }}
                  />
                  <div style={{ marginTop: 14, textAlign: "center", marginBottom: 28 }}>
                    <span style={{ color: "#0D1B2A", fontSize: 30, fontWeight: 700 }}>{inr(monthlySpend)}</span>
                    <span style={{ color: "#94A3B8", fontSize: 13, marginLeft: 4 }}>/month</span>
                  </div>

                  <div style={{ height: 1, background: "#F1F5F9", marginBottom: 24 }} />
                  <label style={{ display: "block", color: "#0D1B2A", fontSize: 13, fontWeight: 700, marginBottom: 14, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    Vendors you currently manage
                  </label>
                  <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
                    {(["Just 1", "2 to 4", "5+"] as VendorBucket[]).map(opt => {
                      const sel = vendorBucket === opt;
                      return (
                        <button key={opt} onClick={() => setVendorBucket(opt)} style={{
                          flex: 1, padding: "10px 0", borderRadius: 10,
                          border: `1.5px solid ${sel ? "#0D1B2A" : "#E2EAF4"}`,
                          fontSize: 14, fontWeight: 600, cursor: "pointer",
                          background: sel ? "#0D1B2A" : "#F8F9FC",
                          color: sel ? "white" : "#64748B",
                          transition: "all 0.2s ease",
                        }}>{opt}</button>
                      );
                    })}
                  </div>

                  <label style={{ display: "block", color: "#0D1B2A", fontSize: 13, fontWeight: 700, marginBottom: 14, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    Do you use vendor credit?
                  </label>
                  <div style={{ display: "flex", gap: 8 }}>
                    {(["Yes", "No"] as CreditOption[]).map(opt => {
                      const sel = useCredit === opt;
                      return (
                        <button key={opt} onClick={() => setUseCredit(opt)} style={{
                          flex: 1, padding: "10px 0", borderRadius: 10,
                          border: `1.5px solid ${sel ? "#0D1B2A" : "#E2EAF4"}`,
                          fontSize: 14, fontWeight: 600, cursor: "pointer",
                          background: sel ? "#0D1B2A" : "#F8F9FC",
                          color: sel ? "white" : "#64748B",
                          transition: "all 0.2s ease",
                        }}>{opt}</button>
                      );
                    })}
                  </div>
                </div>

                {/* Right — result */}
                <div style={{ background: "#020817", padding: "44px 44px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                  <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 10, fontWeight: 700, letterSpacing: "2.5px", textTransform: "uppercase", marginBottom: 10 }}>
                    YOUR ESTIMATED ANNUAL SAVING
                  </p>
                  <p style={{
                    color: "#E8A838", fontSize: "clamp(2.5rem,5vw,3.5rem)", fontWeight: 700, lineHeight: 1,
                    letterSpacing: "-1px", marginBottom: 6,
                    fontFamily: "'Space Grotesk', sans-serif",
                  }}>
                    {inr(displayedSaving)}
                  </p>
                  <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 13, marginBottom: 36 }}>vs. your current spend pattern</p>

                  <div style={{ height: 1, background: "rgba(255,255,255,0.07)", marginBottom: 28 }} />

                  {[
                    { label: "Hidden credit markup", value: useCredit === "Yes" ? inr(calc.creditMarkup) : "Not applicable" },
                    { label: "Extra saving if upfront", value: inr(calc.upfrontSaving) },
                    { label: "Time saved per month", value: `${calc.timeSaved} hours` },
                  ].map(row => (
                    <div key={row.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
                      <span style={{ color: "rgba(255,255,255,0.45)", fontSize: 13 }}>{row.label}</span>
                      <span style={{ color: "rgba(255,255,255,0.9)", fontSize: 15, fontWeight: 600 }}>{row.value}</span>
                    </div>
                  ))}

                  <div style={{ height: 1, background: "rgba(255,255,255,0.07)", margin: "20px 0" }} />
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 32 }}>
                    <span style={{ color: "white", fontSize: 14, fontWeight: 700 }}>Total annual value</span>
                    <span style={{ color: "white", fontSize: 26, fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif" }}>{inr(calc.totalValue)}</span>
                  </div>

                  <Link href="/quote" className="lp-cta-primary" style={{ textAlign: "center" }}>
                    Lock in these savings →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════
            TESTIMONIALS
        ═══════════════════════════════════════════════ */}
        <section
          ref={testimonialSection.ref}
          className="lp-section-pad"
          style={{ background: "#F8F9FC", padding: "96px 32px" }}
        >
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>

            <div className={`lp-section-reveal${testimonialSection.visible ? " visible" : ""}`} style={{ textAlign: "center", marginBottom: 56 }}>
              <p style={{ color: "#1B6CA8", fontSize: 11, fontWeight: 700, letterSpacing: "2.5px", textTransform: "uppercase", marginBottom: 12 }}>
                WHAT BRANDS SAY
              </p>
              <h2 style={{ color: "#0D1B2A", fontSize: "clamp(1.9rem, 4vw, 2.8rem)", fontWeight: 800, marginBottom: 0, fontFamily: "'Space Grotesk', sans-serif" }}>
                220+ brands made the switch.
              </h2>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24 }}>
              {TESTIMONIALS.map((t, i) => (
                <div
                  key={i}
                  className={`lp-testimonial${testimonialSection.visible ? " visible" : ""}`}
                  style={{
                    background: "white", borderRadius: 16, padding: "32px 30px",
                    boxShadow: "0 4px 24px rgba(13,27,42,0.06)",
                    border: "1px solid #E8EDF4",
                    transitionDelay: `${i * 120}ms`,
                    position: "relative", overflow: "hidden",
                  }}
                >
                  {/* Quote mark decoration */}
                  <div style={{
                    position: "absolute", top: 20, right: 24,
                    fontSize: 64, color: "#F1F5F9", fontFamily: "Georgia, serif",
                    lineHeight: 1, userSelect: "none",
                  }}>
                    "
                  </div>

                  {/* Industry tag */}
                  <div style={{
                    display: "inline-flex", alignItems: "center",
                    background: "#F1F5F9", borderRadius: 99, padding: "4px 12px",
                    marginBottom: 18, fontSize: 11, fontWeight: 700, color: "#64748B",
                    textTransform: "uppercase", letterSpacing: "0.5px",
                  }}>
                    {t.industry}
                  </div>

                  {/* Stars */}
                  <div style={{ display: "flex", gap: 3, marginBottom: 16 }}>
                    {[...Array(5)].map((_, j) => (
                      <svg key={j} width="15" height="15" viewBox="0 0 24 24" fill="#E8A838"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                    ))}
                  </div>

                  <p style={{ color: "#334155", fontSize: 15, lineHeight: 1.75, marginBottom: 24, position: "relative", zIndex: 1 }}>
                    "{t.quote}"
                  </p>

                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{
                      width: 42, height: 42, borderRadius: "50%",
                      background: "linear-gradient(135deg, #0D1B2A, #1B3A6B)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: "#E8A838", fontSize: 14, fontWeight: 800, flexShrink: 0,
                    }}>
                      {t.initials}
                    </div>
                    <div>
                      <p style={{ color: "#0D1B2A", fontSize: 14, fontWeight: 700, margin: 0 }}>{t.name}</p>
                      <p style={{ color: "#94A3B8", fontSize: 13, margin: 0 }}>{t.title}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════
            PAYMENT TERMS
        ═══════════════════════════════════════════════ */}
        <section className="lp-section-pad" style={{ background: "#0D1B2A", padding: "72px 32px" }}>
          <div style={{ maxWidth: 900, margin: "0 auto" }}>
            <h2 style={{ color: "white", fontSize: "clamp(1.6rem, 3.5vw, 2.2rem)", fontWeight: 800, marginBottom: 10, fontFamily: "'Space Grotesk', sans-serif" }}>
              Simple, fair payment terms. No credit surprises.
            </h2>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 14, fontStyle: "italic", marginBottom: 44 }}>
              "We don't do credit because we don't do delays. Paid orders ship on time. Every time."
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20 }}>
              {[
                { step: "50%", title: "On order confirmation", desc: "We begin production immediately once confirmed. No waiting.", color: "#1B6CA8" },
                { step: "50%", title: "On sample approval or dispatch", desc: "Balance due when you approve your production sample — or before dispatch if you're in a rush.", color: "#E8A838" },
              ].map((item, i) => (
                <div key={i} style={{
                  background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 14, padding: "28px 28px",
                }}>
                  <div style={{ display: "inline-flex", alignItems: "baseline", gap: 8, marginBottom: 18 }}>
                    <span style={{ color: item.color, fontSize: 36, fontWeight: 900, fontFamily: "'Space Grotesk', sans-serif" }}>{item.step}</span>
                    <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 13 }}>payment</span>
                  </div>
                  <h3 style={{ color: "white", fontSize: 15, fontWeight: 700, marginBottom: 8 }}>{item.title}</h3>
                  <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 14, lineHeight: 1.65, margin: 0 }}>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════
            FINAL CTA BANNER
        ═══════════════════════════════════════════════ */}
        <section
          ref={ctaSection.ref}
          className="lp-section-pad"
          style={{
            background: "linear-gradient(135deg, #071a45 0%, #153e9f 60%, #1B6CA8 100%)",
            padding: "96px 32px", position: "relative", overflow: "hidden",
          }}
        >
          {/* Decorative rings */}
          <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 700, height: 700, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.05)", pointerEvents: "none" }} />
          <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 500, height: 500, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.07)", pointerEvents: "none" }} />

          <div
            className={`lp-section-reveal${ctaSection.visible ? " visible" : ""}`}
            style={{ maxWidth: 760, margin: "0 auto", textAlign: "center", position: "relative", zIndex: 1 }}
          >
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)",
              borderRadius: 99, padding: "6px 18px", marginBottom: 24,
            }}>
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#22C55E", animation: "pulse 2s ease-in-out infinite" }} />
              <span style={{ color: "rgba(255,255,255,0.8)", fontSize: 12, fontWeight: 700 }}>Quotes delivered in 48 hours</span>
            </div>

            <h2 style={{
              color: "white", fontSize: "clamp(2rem,5vw,3.4rem)", fontWeight: 900, lineHeight: 1.1, marginBottom: 20,
              fontFamily: "'Space Grotesk', sans-serif", letterSpacing: "-0.02em",
            }}>
              Ready to simplify your<br />
              <span className="lp-gradient-text">packaging operations?</span>
            </h2>
            <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 18, lineHeight: 1.7, marginBottom: 44, maxWidth: 520, margin: "0 auto 44px" }}>
              Get a free quote in 48 hours. Sample from ₹2,999. No commitment until you approve. India's fastest packaging platform.
            </p>

            <div className="lp-cta-row" style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
              <Link href="/quote" className="lp-cta-primary" style={{ fontSize: 16, padding: "18px 44px" }}>
                Get My Free Quote →
              </Link>
              <a href="https://wa.me/918208990366" target="_blank" rel="noreferrer" className="lp-cta-secondary" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="#25D366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                Chat on WhatsApp
              </a>
            </div>

            {/* Trust row */}
            <div style={{ display: "flex", gap: 32, justifyContent: "center", marginTop: 48, flexWrap: "wrap" }}>
              {["No commitment until you approve", "Price match guarantee", "14-day brief-to-doorstep"].map((item, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2.5" strokeLinecap="round"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  <span style={{ color: "rgba(255,255,255,0.55)", fontSize: 13, fontWeight: 600 }}>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Minimal footer ── */}
        <footer style={{ background: "#020817", padding: "28px 32px", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
            <span style={{ color: "white", fontWeight: 900, fontSize: 18, fontFamily: "'Space Grotesk', sans-serif", letterSpacing: "-0.02em" }}>Packworkz</span>
            <div style={{ display: "flex", gap: 24 }}>
              <Link href="/" style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, textDecoration: "none" }}>Home</Link>
              <Link href="/products" style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, textDecoration: "none" }}>Products</Link>
              <Link href="/quote" style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, textDecoration: "none" }}>Get Quote</Link>
              <Link href="/samples" style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, textDecoration: "none" }}>Samples</Link>
            </div>
            <span style={{ color: "rgba(255,255,255,0.25)", fontSize: 12 }}>© 2025 Packworkz India Pvt. Ltd.</span>
          </div>
        </footer>

      </div>
    </>
  );
}
