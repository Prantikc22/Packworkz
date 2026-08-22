import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import { INDUSTRY_IMAGES } from "@/lib/images";
import BrandAdvantageSection from "@/components/home/BrandAdvantageSection";
import ComparisonSection from "@/components/home/ComparisonSection";
import { SmartStockDemo } from "@/pages/smartstock";
import { PackagingProcessSection, SustainabilityProofSection } from "@/components/home/CommerceExperienceSections";
import TestimonialsSection from "@/components/home/TestimonialsSection";
import { CATALOG_SKUS, getCatalogImage, isCatalogSkuInCategory } from "@/lib/catalog";
import {
  Search, GitBranch, ShieldCheck, Truck,
  Leaf, Droplets, FileCheck, ArrowRight, ArrowLeft,
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
  "One platform.", `${CATALOG_SKUS.length} packaging families.`, "Backup sourcing routes.", "Documented QC checkpoints.", "One order record.",
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
  { name: "Mogu Mogu",        file: "/images/logos/mogumogi.png" },
  { name: "Olipop",           file: "/images/logos/olipop.webp" },
  { name: "Voltas",           file: "/images/logos/voltas.png" },
  { name: "Pilgrim",          file: "/images/logos/pilgrim.png" },
];

const catalogCount = (category: string) => CATALOG_SKUS.filter((sku) => isCatalogSkuInCategory(sku, category)).length;

const HERO_CARDS = [
  {
    title: "Flexible Packaging", Icon: Package, count: `${catalogCount("flexible")} families`, slug: "flexible", badge: true,
    pos: { top: "5%", left: "10%" }, width: 180,
    floatAnim: "float-1 6s ease-in-out infinite",
    entranceDelay: "0.3s", greenBorder: false,
  },
  {
    title: "E-commerce Packs", Icon: ShoppingBag, count: `${catalogCount("ecommerce")} families`, slug: "ecommerce", badge: true,
    pos: { top: "3%", left: "52%" }, width: 170,
    floatAnim: "float-2 7s ease-in-out -2s infinite",
    entranceDelay: "0.5s", greenBorder: false,
  },
  {
    title: "Boxes & Cartons", Icon: Box, count: `${catalogCount("boxes")} families`, slug: "boxes", badge: false,
    pos: { top: "38%", left: "5%" }, width: 175,
    floatAnim: "float-3 5.5s ease-in-out -1s infinite",
    entranceDelay: "0.4s", greenBorder: false,
  },
  {
    title: "Sustainable", Icon: Leaf, count: `${catalogCount("sustainable")} families`, slug: "sustainable", badge: false,
    pos: { top: "35%", left: "55%" }, width: 165,
    floatAnim: "float-4 6.5s ease-in-out -3s infinite",
    entranceDelay: "0.7s", greenBorder: true,
  },
  {
    title: "Labels & Closures", Icon: Tag, count: `${catalogCount("labels")} families`, slug: "labels", badge: false,
    pos: { top: "68%", left: "12%" }, width: 175,
    floatAnim: "float-5 7.5s ease-in-out -1.5s infinite",
    entranceDelay: "0.6s", greenBorder: false,
  },
  {
    title: "Premium & Gift", Icon: Gift, count: `${catalogCount("boxes")} families`, slug: "boxes", badge: false,
    pos: { top: "65%", left: "52%" }, width: 170,
    floatAnim: "float-6 6s ease-in-out -4s infinite",
    entranceDelay: "0.8s", greenBorder: false,
  },
];

const CATEGORIES = [
  { title: "Flexible Packaging",    sub: "Pouches, sachets, refill and high-barrier formats", cat: "flexible",    skus: catalogCount("flexible") },
  { title: "Bottles & Containers",  sub: "Plastic, glass, aluminium, jars and dispensers",     cat: "bottles",     skus: catalogCount("bottles") },
  { title: "Cosmetic Tubes",        sub: "Squeeze tubes for skincare, haircare and personal care", cat: "tubes",       skus: catalogCount("tubes") },
  { title: "Boxes & Cartons",       sub: "Folding cartons, two-piece rigid and magnetic gift boxes", cat: "boxes",       skus: catalogCount("boxes") },
  { title: "E-commerce Packaging",  sub: "Mailers, paper bags and food-service containers",         cat: "ecommerce",   skus: catalogCount("ecommerce") },
  { title: "Protective Packaging",  sub: "Cushioning, void fill and custom protective inserts",     cat: "protective",  skus: catalogCount("protective") },
  { title: "Packaging Rolls",       sub: "Printed films, lidding and shrink rollstock",              cat: "rolls",       skus: catalogCount("rolls") },
  { title: "Labels & Brand Extras", sub: "Labels, sleeves, tape, cards and printed tissue",          cat: "labels",      skus: catalogCount("labels") },
  { title: "Food & Sustainable",    sub: "Bagasse, paper food service and moulded fibre",           cat: "sustainable", skus: catalogCount("sustainable") },
];

const CAT_IMAGES: Record<string, string> = {
  flexible:    "/categories/flexiblepacks.jpg",
  bottles:     "/categories/rigidpacks.jpg",
  tubes:       "/categories/tubes.jpg",
  boxes:       "/categories/boxes-cartons-v2.png",
  ecommerce:   "/categories/ecom.jpg",
  protective:  "/categories/protectivepacks.jpg",
  rolls:       "/categories/printedrolls.jpg",
  labels:      "/categories/closures.jpg",
  sustainable: "/images/foodservice-containers-premium.jpg",
  premium:     "/skus/magneticbox.jpg",
};

const STARTER_SKU_CODES = ["FP-101", "EC-501", "LC-816", "SP-907", "RL-701"];
const STARTER_SKUS = STARTER_SKU_CODES
  .map((code) => CATALOG_SKUS.find((sku) => sku.code === code))
  .filter((sku): sku is (typeof CATALOG_SKUS)[number] => Boolean(sku));

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

const INDUSTRY_SOLUTIONS: Record<string, {
  title: string;
  subtitle: string;
  image: string;
  proof: string;
  best: string[];
  stack: Array<{ label: string; desc: string }>;
}> = {
  "food-beverage": {
    title: "Food brands, cloud kitchens, beverage launches",
    subtitle: "Barrier pouches, glass jars, spout packs, and food-safe cartons selected for shelf life, leakage control, and repeat purchase.",
    image: INDUSTRY_IMAGES.food,
    proof: "Best for shelf life, freshness, and FSSAI-ready launches",
    best: ["Stand-up pouches", "Spout pouches", "Glass jars", "Bagasse trays"],
    stack: [
      { label: "High-barrier pouches", desc: "For snacks, coffee, dry fruits, spices, protein, and pet food." },
      { label: "Jars and bottles", desc: "For sauces, honey, kombucha, oils, and premium preserves." },
      { label: "Food-service eco packs", desc: "Bagasse, kraft, and compostable formats for delivery brands." },
    ],
  },
  pharma: {
    title: "Pharma, wellness, diagnostics, supplements",
    subtitle: "Tamper-aware cartons, labels, bottles, and protective inserts with documentation discipline.",
    image: INDUSTRY_IMAGES.pharma,
    proof: "Best for traceability, tamper evidence, and clean approval cycles",
    best: ["Folding cartons", "Tamper labels", "PET/HDPE bottles", "Protective inserts"],
    stack: [
      { label: "Primary and secondary packs", desc: "Bottles, cartons and labels for supplements, diagnostics and wellness products." },
      { label: "Cartons and labels", desc: "Readable, batch-ready, QR-ready, and built for compliance workflows." },
      { label: "Transit protection", desc: "Foam inserts, corrugated shippers, and secondary packaging for fragile SKUs." },
    ],
  },
  cosmetics: {
    title: "Beauty, skincare, salons, personal care",
    subtitle: "Premium tubes, airless pumps, droppers, jars, rigid boxes, and labels that make the formula feel worth more.",
    image: INDUSTRY_IMAGES.cosmetics,
    proof: "Best for shelf presence, launch drops, and premium unboxing",
    best: ["Airless pumps", "Cosmetic tubes", "Rigid boxes", "Glass droppers"],
    stack: [
      { label: "Primary packs", desc: "Tubes, jars, pumps, droppers, and bottles matched to viscosity and usage." },
      { label: "Retail cartons", desc: "Mono cartons, textured boards, foils, embossing, and batch-ready labels." },
      { label: "Gift and launch kits", desc: "Rigid boxes, magnetic closures, inserts, and influencer-ready packs." },
    ],
  },
  ecommerce: {
    title: "D2C, marketplaces, apparel, subscription boxes",
    subtitle: "Courier bags, mailer boxes, corrugated shippers, return-friendly packs, and branded unboxing kits.",
    image: INDUSTRY_IMAGES.ecommerce,
    proof: "Best for lower damage, faster dispatch, and branded delivery moments",
    best: ["Mailer boxes", "Poly mailers", "Corrugated shippers", "Paper mailers"],
    stack: [
      { label: "Instant-buy mailers", desc: "Pick a fixed size, print, quantity, and delivery window without a vendor call." },
      { label: "Return-ready packaging", desc: "Tamper-safe, POD-compatible, and practical for reverse logistics." },
      { label: "Launch bundles", desc: "Boxes, tissue, stickers, sleeves, and inserts in one managed order." },
    ],
  },
  fmcg: {
    title: "FMCG, retail, household, high-volume brands",
    subtitle: "Cost-optimised cartons, pouches, labels, rollstock, and backup factory allocation for repeat runs.",
    image: INDUSTRY_IMAGES.fmcg,
    proof: "Best for high-volume repeatability and per-unit cost control",
    best: ["Pillow pouches", "Mono cartons", "Rollstock", "Pressure labels"],
    stack: [
      { label: "Repeat SKU playbooks", desc: "Standardised material, print, MOQ, and reorder windows per product." },
      { label: "Managed rollstock", desc: "Reviewed pricing for films, laminates, and machine-specific roll formats." },
      { label: "SmartStock fit", desc: "Consumption-aware reorder prompts for SKUs you cannot afford to miss." },
    ],
  },
  industrial: {
    title: "Industrial, B2B, automotive, tools, chemicals",
    subtitle: "Heavy-duty corrugation, drums, HDPE containers, protective inserts, labels, and export-grade transit packs.",
    image: INDUSTRY_IMAGES.industrial,
    proof: "Best for durability, bulk movement, and procurement discipline",
    best: ["5-ply shippers", "HDPE containers", "Foam inserts", "Industrial labels"],
    stack: [
      { label: "Transit engineering", desc: "Corrugated specs, board grade, burst strength, and padding matched to load." },
      { label: "Bulk containers", desc: "Jars, bottles, canisters, and closure combinations for industrial use." },
      { label: "Procurement controls", desc: "Vendor backup, QC checkpoints, and clean documentation for repeat buying." },
    ],
  },
  agriculture: {
    title: "Seeds, fertilisers, agri-inputs, fresh produce",
    subtitle: "Moisture-resistant pouches, sacks, labels, cartons, and durable packaging for rural and distributor handling.",
    image: INDUSTRY_IMAGES.agriculture,
    proof: "Best for moisture protection and rugged channel movement",
    best: ["Laminated pouches", "Sachets", "Woven sacks", "Corrugated cartons"],
    stack: [
      { label: "Seed and input packs", desc: "Barrier pouches, sachets, and printed rolls for high-volume filling lines." },
      { label: "Distributor cartons", desc: "Secondary packaging that survives stacking, humidity, and long routes." },
      { label: "Label and compliance", desc: "Batch, MRP, QR, instruction, and regulatory label workflows." },
    ],
  },
  electronics: {
    title: "Electronics, devices, accessories, repair kits",
    subtitle: "ESD-safe protection, precision inserts, mailer boxes, labels, and premium boxes for fragile, high-value SKUs.",
    image: INDUSTRY_IMAGES.electronics,
    proof: "Best for damage reduction and high-value unboxing",
    best: ["ESD pouches", "Foam inserts", "Mailer boxes", "Rigid boxes"],
    stack: [
      { label: "Damage control", desc: "Foam, corrugated, and cushioning choices tuned to fragile components." },
      { label: "Premium kits", desc: "Rigid boxes, sleeves, inserts, and labels for device bundles and accessories." },
      { label: "Marketplace ready", desc: "Barcode labels, tamper seals, and shippers suited for fulfilment centres." },
    ],
  },
};

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
    title: "Configure and Pricing Plan",
    desc: `Browse ${CATALOG_SKUS.length} launch-ready product families, choose the specification, and follow one of two clear paths: instant buy or managed quote.`,
    bg: "#0D1B2A",
  },
  {
    num: "Step 02",
    Icon: GitBranch,
    title: "We Source and Manufacture",
    desc: "PackOS matches the specification to available factory capability and prepares backup sourcing routes where the format allows it.",
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
    logo: "",
    logoBg: "#1a4a2e",
    company: "Scaling snack brand",
    industry: "Illustrative food scenario",
    metric: "7 vendors → 1 workflow",
    challenge: "Seven packaging vendors create fragmented approvals, inconsistent status updates, and avoidable production planning work.",
    whatWeDid: "Model the portfolio as one managed workflow, with approved specifications, backup sourcing routes and reorder signals held against each SKU.",
    result: "A single operating record for sourcing, quality checkpoints and delivery decisions across the packaging portfolio.",
    metrics: [
      { val: "7 → 1", label: "Vendors managed" },
      { val: "1", label: "Order workflow" },
      { val: "3", label: "Control points" },
    ],
    testimonial: "Use this model when coordination work is spread across suppliers and the team needs one source of truth for every repeat SKU.",
    testimonialName: "Planning model",
    testimonialTitle: "Illustrative workflow, not a customer claim",
  },
  {
    initials: "BC",
    logo: "",
    logoBg: "#8b1a2e",
    company: "Multi-location beauty brand",
    industry: "Illustrative beauty scenario",
    metric: "Artwork → QC → dispatch",
    challenge: "Jar, closure, label and carton specifications can drift when artwork files and quality approvals live in separate conversations.",
    whatWeDid: "Model a controlled workflow with a locked artwork version, pre-production checks, photo evidence and a dispatch approval gate.",
    result: "A traceable route from approved design to the inspected production batch, with fewer opportunities for version error.",
    metrics: [
      { val: "1", label: "Artwork record" },
      { val: "3", label: "QC gates" },
      { val: "2", label: "Pack components" },
    ],
    testimonial: "Use this model when print consistency and artwork version control matter as much as the unit price.",
    testimonialName: "Planning model",
    testimonialTitle: "Illustrative workflow, not a customer claim",
  },
  {
    initials: "OC",
    logo: "",
    logoBg: "#1a2a3a",
    company: "Export-ready wellness brand",
    industry: "Illustrative export scenario",
    metric: "Material claim → proof file",
    challenge: "An export buyer requests a specific material claim, but the finished construction and supporting evidence have not yet been aligned.",
    whatWeDid: "Model a specification-first sourcing route: define the claim, shortlist eligible structures, and verify applicable supplier evidence before approval.",
    result: "The buyer-facing material claim is tied to the actual order specification and its supporting document set.",
    metrics: [
      { val: "1", label: "Approved claim" },
      { val: "1", label: "Material spec" },
      { val: "1", label: "Evidence file" },
    ],
    testimonial: "Use this model when a sustainability or export claim must survive procurement, production and buyer review.",
    testimonialName: "Planning model",
    testimonialTitle: "Illustrative workflow, not a customer claim",
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
          <span style={{ color: "#1B6CA8", fontSize: 10, fontWeight: 800, letterSpacing: 1.5 }}>MODELLED WORKFLOW</span>
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

        {/* Scenario note */}
        <div style={{
          marginTop: 28,
          borderLeft: "3px solid #E8A838",
          background: "white",
          padding: "20px 20px 20px 20px",
        }}>
          <p style={{ color: "#374151", fontSize: 14, lineHeight: 1.75, fontStyle: "italic", marginBottom: 12 }}>
            "{cs.testimonial}"
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: "50%",
              background: "#1B6CA8", display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 12, fontWeight: 700, color: "white", flexShrink: 0,
            }}>
              {cs.testimonialName.split(" ").map(w => w[0]).slice(0,2).join("")}
            </div>
            <div>
              <p style={{ color: "#0D1B2A", fontSize: 13, fontWeight: 700, lineHeight: 1.2 }}>{cs.testimonialName}</p>
              <p style={{ color: "#94A3B8", fontSize: 11, marginTop: 2 }}>{cs.testimonialTitle}</p>
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
  const savingPct = vendors === "Just 1" ? 0.04 : vendors === "2 to 4" ? 0.06 : 0.08;
  const annual = monthly * 12;
  const annualSaving = annual * savingPct;
  const emergencyLeakage = credit === "Yes" ? annual * 0.025 : 0;
  const totalValue = annualSaving + emergencyLeakage;
  const timeSaved = vendors === "Just 1" ? 4 : vendors === "2 to 4" ? 8 : 14;
  return { annual, annualSaving, emergencyLeakage, totalValue, timeSaved, savingPct };
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
  const [activeIndustrySlug, setActiveIndustrySlug] = useState(INDUSTRIES[0].slug);

  const caseIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const processRef = useRef<HTMLDivElement>(null);
  const industryTabsRef = useRef<HTMLDivElement>(null);
  const stepEls = useRef<(HTMLDivElement | null)[]>([]);
  const activeIndustry = INDUSTRIES.find((industry) => industry.slug === activeIndustrySlug) || INDUSTRIES[0];
  const activeIndustrySolution = INDUSTRY_SOLUTIONS[activeIndustry.slug];

  const moveIndustryTabs = (direction: -1 | 1) => {
    industryTabsRef.current?.scrollBy({ left: direction * 230, behavior: "smooth" });
  };

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
    <div className="pw-home" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

      {/* ══════════════════════════════════════════════════════════ */}
      {/*  SECTION 1 — HERO                                         */}
      {/* ══════════════════════════════════════════════════════════ */}
      <section
        className="relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #020817 0%, #071a45 40%, #153e9f 100%)",
          minHeight: "100svh",
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
          <div className="lg:max-w-[54%]">
            <h1 className="clash-display text-white leading-[1.05] mb-6" style={{ fontSize: "clamp(2.6rem, 5vw, 4.7rem)" }}>
              <span className="block lg:whitespace-nowrap">Your Packaging.</span>
              <span className="block lg:whitespace-nowrap">Sorted. Forever.</span>
            </h1>
            <p className="text-blue-100 text-lg md:text-xl mb-3 max-w-lg font-light">
              Design. Source. QC. Deliver. One platform. Zero vendor chaos.
            </p>
            <p style={{ color: "rgba(255,255,255,0.48)", fontSize: 13, marginBottom: 18, letterSpacing: "0.1px", display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap" }}>
              <span style={{
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                width: 18, height: 18, borderRadius: "50%",
                background: "transparent", border: "1px solid rgba(232,168,56,0.65)",
                flexShrink: 0,
              }}>
                <span className="material-symbols-outlined" style={{ fontSize: 11, color: "#E8A838", fontVariationSettings: "'FILL' 1, 'wght' 700" }}>verified</span>
              </span>
              Packaging operations for{" "}
              <span style={{ color: "rgba(255,255,255,0.78)", fontWeight: 600 }}>Plum, Happilo, Bodycraft</span>
              {" "}and growing teams across India
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mb-3" style={{ alignItems: "stretch" }}>
              <span className="animated-border animated-border-white" style={{ display: "flex" }}>
                <Link href="/products" style={{ flex: 1, display: "flex" }}>
                  <button className="btn-fill btn-amber px-8 py-3 text-left" style={{ flex: 1 }}>
                    <span><strong style={{ display: "block", fontSize: 15 }}>Shop Packaging</strong><small style={{ display: "block", marginTop: 2, fontSize: 10, opacity: .68, textTransform: "none", letterSpacing: 0 }}>For startups & growing brands</small></span><MS icon="arrow_forward" />
                  </button>
                </Link>
              </span>
              <Link href="/enterprise" style={{ display: "flex" }}>
                <button className="btn-fill btn-outline-white px-8 py-3 text-left" style={{ flex: 1 }}>
                  <span><strong style={{ display: "block", fontSize: 15 }}>Packworkz Enterprise</strong><small style={{ display: "block", marginTop: 2, fontSize: 10, opacity: .62, textTransform: "none", letterSpacing: 0 }}>For multi-SKU procurement</small></span>
                </button>
              </Link>
            </div>
            <div style={{ marginBottom: 24, display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap" }}>
              <p style={{ color: "rgba(255,255,255,0.42)", fontSize: 12, letterSpacing: "0.2px" }}>
                MOQs from 25 units on selected formats · enterprise volumes supported
              </p>
              <Link href="/mockup-studio" style={{ color: "#93c5fd", fontSize: 12, fontWeight: 800, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 5 }}>
                Preview artwork in 3D <MS icon="view_in_ar" className="text-base" />
              </Link>
            </div>

            {/* Stats badges — locked inside left column */}
            <div className="pw-hero-proof-row pt-7 border-t border-white/15">
              {[
                { icon: "inventory_2",       value: String(CATALOG_SKUS.length), label: "Configured SKU Families" },
                { icon: "public",            value: "India", label: "Delivery Network" },
                { icon: "verified",          value: "QC", label: "Documented Checkpoints" },
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

      {/* Familiar starting points for founders who do not know packaging terminology. */}
      <section id="products" className="pw-starter-section" aria-labelledby="starter-products-title">
        <div className="pw-starter-inner">
          <div className="pw-starter-heading">
            <div>
              <span>PACKAGING CATALOG</span>
              <h2 id="starter-products-title">Start with something familiar.</h2>
              <p>Choose a common format below, or browse by packaging type. We will guide the technical details.</p>
            </div>
            <Link href="/products" className="pw-starter-all">See every product <ArrowRight size={17} /></Link>
          </div>
          <div className="pw-starter-grid">
            {STARTER_SKUS.map((sku) => (
              <Link key={sku.code} href={`/configure?sku=${sku.code}`} className="pw-starter-card">
                <div className="pw-starter-image">
                  <img src={getCatalogImage(sku)} alt={`${sku.name} custom printed packaging`} loading="eager" />
                </div>
                <div className="pw-starter-copy">
                  <small>{sku.purchase_mode === "brief" ? "Specialist confirmed" : "Buy online"}</small>
                  <h3>{sku.name}</h3>
                  <p>{sku.use_case}</p>
                  <div><strong>MOQ {sku.moq.toLocaleString()} {sku.moq_unit}</strong><ArrowRight size={17} /></div>
                </div>
              </Link>
            ))}
          </div>

          <div className="pw-family-directory" aria-label="Browse all packaging families">
            <div className="pw-family-directory-heading">
              <strong>Explore all packaging types</strong>
              <span>For founders who know the pack they need</span>
            </div>
            <div className="pw-family-directory-grid">
              {CATEGORIES.map((cat) => (
                <Link key={cat.cat} href={`/products?category=${cat.cat}`} className="pw-family-directory-link">
                  <span className="pw-family-directory-image">
                    <img src={CAT_IMAGES[cat.cat]} alt={`${cat.title} examples`} loading="lazy" />
                  </span>
                  <span className="pw-family-directory-copy">
                    <strong>{cat.title}</strong>
                    <em>{cat.sub}</em>
                    <small>{cat.skus} product families <ArrowRight size={14} /></small>
                  </span>
                </Link>
              ))}
            </div>
          </div>

          <div className="pw-ai-entry">
            <div className="pw-ai-entry-icon"><MS icon="auto_awesome" /></div>
            <div>
              <strong>Not sure what packaging fits?</strong>
              <span>Tell Packworkz AI what you sell. It will suggest a practical format, MOQ, and sampling plan.</span>
            </div>
            <Link href="/pack-ai">
              <button className="btn-fill btn-amber px-6 py-3 text-sm pw-btn-transition">
                <span>Help me choose</span><MS icon="arrow_forward" className="text-base" />
              </button>
            </Link>
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
      <section className="pw-theme-surface" style={{ background: "#FFFFFF", borderBottom: "1px solid #E2EAF4", padding: "72px 0", overflow: "hidden" }}>
        <div className="po-customers-grid" style={{ maxWidth: 1200, margin: "0 auto", padding: "0 40px", display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: 72, alignItems: "center" }}>

          {/* Left: text */}
          <div>
            <h2 className="scroll-animate scroll-animate-delay-1" style={{ color: "#0D1B2A", fontSize: 34, fontWeight: 800, lineHeight: 1.15, marginBottom: 18 }}>
              Trusted by growing brands
            </h2>
            <p className="scroll-animate scroll-animate-delay-2" style={{ color: "#475569", fontSize: 15, lineHeight: 1.75, marginBottom: 32 }}>
              From D2C beauty and wellness to FMCG and pharma, teams use Packworkz for consistent, compliant, beautifully produced packaging.
            </p>
            <div style={{ display: "flex", gap: 36, alignItems: "center" }}>
              <div>
                <p style={{ color: "#0D1B2A", fontSize: 30, fontWeight: 800, lineHeight: 1, marginBottom: 4 }}>Multi-category</p>
                <p style={{ color: "#94A3B8", fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>Packaging coverage</p>
              </div>
              <div style={{ width: 1, height: 44, background: "#E2EAF4" }} />
              <div>
                <p style={{ color: "#0D1B2A", fontSize: 30, fontWeight: 800, lineHeight: 1, marginBottom: 4 }}>One record</p>
                <p style={{ color: "#94A3B8", fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>Quote to delivery</p>
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
      {/*  SECTION 3C — HERITAGE STRIP                              */}
      {/* ══════════════════════════════════════════════════════════ */}
      <section style={{ background: "#0D1B2A", padding: "52px 40px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", alignItems: "center", gap: 48, flexWrap: "wrap", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <div style={{ width: 4, height: 52, background: "#E8A838", borderRadius: 2, flexShrink: 0 }} />
            <div>
              <p className="scroll-animate" style={{ color: "#E8A838", fontSize: 10, fontWeight: 700, letterSpacing: "2.5px", textTransform: "uppercase", marginBottom: 6 }}>Our Manufacturing Heritage</p>
              <p className="scroll-animate" style={{ color: "white", fontSize: 18, fontWeight: 800, lineHeight: 1.3, margin: 0 }}>
                Backed by 30 years of packaging manufacturing — <span style={{ color: "rgba(255,255,255,0.55)", fontWeight: 500 }}>Kalyani Rotopack Pvt Ltd, est. 1993.</span>
              </p>
            </div>
          </div>
          <a href="/about" style={{ textDecoration: "none", flexShrink: 0 }}>
            <button className="btn-fill btn-outline-white px-6 py-2.5 text-sm pw-btn-transition" style={{ whiteSpace: "nowrap" }}>Read Our Story →</button>
          </a>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════ */}
      {/*  SECTION 4 — PAIN POINTS                                   */}
      {/* ══════════════════════════════════════════════════════════ */}
      <section className="pw-theme-surface pw-home-longform" style={{ background: "#FFFFFF", padding: "100px 0" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 40px" }}>
          <span className="scroll-animate" style={{ color: "#1B6CA8", fontSize: 11, fontWeight: 600, letterSpacing: "2px", textTransform: "uppercase", display: "block", marginBottom: 14 }}>
            THE PROBLEM
          </span>
          <h2 className="scroll-animate scroll-animate-delay-1" style={{ color: "#0D1B2A", fontSize: "clamp(2rem,4vw,3.25rem)", fontWeight: 700, lineHeight: 1.15, marginBottom: 56 }}>
            Traditional sourcing is broken.<br />We fixed it.
          </h2>

          <div
            className="pw-pain-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5"
            style={{
              gap: 1, background: "#E2EAF4",
              border: "1px solid #E2EAF4", borderRadius: 0, overflow: "hidden",
            }}
          >
            {PAIN_POINTS.map((p, i) => (
              <div
                key={i}
                className={`pw-pain-card group scroll-animate scroll-animate-delay-${Math.min(i + 1, 4)}`}
                style={{
                  background: "#FFFFFF", padding: "32px 24px",
                  transition: "background 0.2s", cursor: "default",
                }}
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
      <PackagingProcessSection />
      <section className="relative overflow-hidden pw-home-longform" style={{ background: "#08080f", padding: "100px 0" }}>
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
                From pricing plan to delivery, one team owns every step. No finger-pointing. No vendor follow-ups.
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
      {/*  SECTORS WE SERVE — light/dark aware solution showcase     */}
      {/* ══════════════════════════════════════════════════════════ */}
      <section className="pw-sector-section" style={{ padding: "104px 0" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 40px" }}>
          <div className="pw-sector-layout">
            <aside className="pw-sector-copy">
              <p className="font-bold tracking-[0.22em] text-sm uppercase mb-5 scroll-animate" style={{ color: "#1B6CA8" }}>SECTORS WE SERVE</p>
              <h2 className="clash-display scroll-animate scroll-animate-delay-1">
                Packaging engineered for your industry.
              </h2>
              <p className="scroll-animate scroll-animate-delay-2">
                Explore practical packaging stacks selected for your product, supply chain, compliance needs, and route to market.
              </p>
              <div className="pw-sector-note scroll-animate scroll-animate-delay-3">
                <span>Instant buy for standard SKUs.</span>
                <span>Managed quotes for rolls, films, and technical packs.</span>
              </div>
              <Link href="/industries">
                <button className="btn-fill btn-navy px-6 py-3 text-sm pw-btn-transition">
                  <span>View all industry pages</span>
                  <MS icon="arrow_forward" className="text-base" />
                </button>
              </Link>
            </aside>

            <div className="pw-sector-showcase">
              <div className="pw-sector-tab-header">
                <div><strong>Explore all 8 industries</strong><span>Select an industry to update the playbook</span></div>
                <div className="pw-sector-tab-controls" aria-label="Scroll industries">
                  <button type="button" onClick={() => moveIndustryTabs(-1)} title="Previous industries"><ArrowLeft size={16} /></button>
                  <button type="button" onClick={() => moveIndustryTabs(1)} title="Next industries"><ArrowRight size={16} /></button>
                </div>
              </div>
              <div ref={industryTabsRef} className="pw-sector-tabs" role="tablist" aria-label="Industries served by Packworkz">
                {INDUSTRIES.map((industry) => (
                  <button
                    key={industry.slug}
                    type="button"
                    role="tab"
                    aria-selected={activeIndustrySlug === industry.slug}
                    onClick={() => setActiveIndustrySlug(industry.slug)}
                    className={activeIndustrySlug === industry.slug ? "active" : ""}
                  >
                    <MS icon={industry.icon} className="text-base" />
                    <span>{industry.label}</span>
                  </button>
                ))}
              </div>

              <Link href={`/industries/${activeIndustry.slug}`} style={{ textDecoration: "none" }}>
                <article className="pw-sector-card">
                  <img src={activeIndustrySolution.image} alt={activeIndustry.label} />
                  <div className="pw-sector-card-overlay" />
                  <div className="pw-sector-card-content">
                    <div className="pw-sector-pill">
                      <MS icon={activeIndustry.icon} className="text-base" />
                      {activeIndustry.label}
                    </div>
                    <h3>{activeIndustrySolution.title}</h3>
                    <p>{activeIndustrySolution.subtitle}</p>
                  </div>
                  <div className="pw-sector-proof">
                    <span>{activeIndustrySolution.proof}</span>
                    <strong>View solution <MS icon="arrow_forward" className="text-base" /></strong>
                  </div>
                </article>
              </Link>

              <div className="pw-sector-solution-strip">
                {activeIndustrySolution.stack.map((item, index) => (
                  <div key={item.label} className="pw-sector-solution">
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    <h4>{item.label}</h4>
                    <p>{item.desc}</p>
                  </div>
                ))}
              </div>

              <div className="pw-sector-best-row" aria-label="Recommended packaging formats">
                {activeIndustrySolution.best.map((item) => (
                  <span key={item}>{item}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SmartStock uses the same live simulator as the dedicated demo page. */}
      <div id="smartstock" className="pw-home-smartstock-demo">
        <SmartStockDemo />
      </div>

      <TestimonialsSection />

      {/* ══════════════════════════════════════════════════════════ */}
      {/*  SECTION 9 — ADVANTAGE DIAGRAM                            */}
      {/* ══════════════════════════════════════════════════════════ */}
      <BrandAdvantageSection />

      {/* ══════════════════════════════════════════════════════════ */}
      {/*  SECTION 10 — SUSTAINABLE PACKAGING BAND                  */}
      {/* ══════════════════════════════════════════════════════════ */}
      <section className="pw-sustainable-editorial pw-home-longform">
        <div className="pw-sustainable-inner">
          <div className="pw-sustainable-media scroll-animate">
            <img src="/images/foodservice-containers-premium.jpg" alt="Premium paper bowls and food containers from the Packworkz sustainable foodservice range" loading="lazy" />
            <div className="pw-sustainable-media-label"><span>Foodservice range</span><strong>Paper bowls · food tubs · fibre lids</strong></div>
          </div>
          <div className="pw-sustainable-copy">
            <p className="pw-sustainable-eyebrow scroll-animate"><Leaf size={16} /> RESPONSIBLE MATERIALS</p>
            <h2 className="clash-display scroll-animate scroll-animate-delay-1">Sustainability that still looks premium.</h2>
            <p className="scroll-animate scroll-animate-delay-2">Choose the right material story without compromising shelf presence, food safety, or production practicality.</p>
            <div className="pw-sustainable-specs scroll-animate scroll-animate-delay-3">
              {[
                { Icon: Leaf, title: "Material options", text: "FSC kraft, recycled content, mono-material and compostable formats." },
                { Icon: Droplets, title: "Performance matched", text: "Barrier, seal and food-contact requirements reviewed before production." },
                { Icon: FileCheck, title: "Documentation ready", text: "Relevant certificates and EPR information supplied for eligible formats." },
              ].map(({ Icon, title, text }) => (
                <div key={title}><Icon size={18} /><span><strong>{title}</strong><small>{text}</small></span></div>
              ))}
            </div>
            <div className="pw-sustainable-actions">
              <Link href="/products?category=sustainable"><button className="btn-fill btn-navy px-7 py-3 text-sm"><span>Explore sustainable formats</span><MS icon="arrow_forward" className="text-base" /></button></Link>
              <Link href="/sustainable">How we verify materials →</Link>
            </div>
          </div>
        </div>
      </section>
      <SustainabilityProofSection />

      {/* ══════════════════════════════════════════════════════════ */}
      {/*  BUILT FOR MODERN PROCUREMENT TEAMS                        */}
      {/* ══════════════════════════════════════════════════════════ */}
      <div className="pw-home-longform"><ComparisonSection /></div>
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
              { feature: "Vendor redundancy",    good: "Compatible backup routes planned where the specification allows.",  bad: "One vendor. Their delay is your delay." },
              { feature: "Quality control",       good: "Our team inspects every dispatch. Photo evidence in dashboard.", bad: "Vendor self-certifies. Rejection risk is yours." },
              { feature: "Pricing transparency",  good: "Visible quantity pricing, delivery and first-order launch saving.", bad: "Extra tooling and freight often appear late." },
              { feature: "Product coverage",      good: "A focused buying catalogue, with specialist formats handled through one production brief.", bad: "Specialised in one category. Source the rest yourself." },
              { feature: "Compliance & certs",    good: "Applicable documents matched to the final format and factory.", bad: "Certification varies by vendor. Risk sits with you." },
              { feature: "Design service",        good: "Print-ready artwork from ₹1,999. Files yours forever.",         bad: "Mostly unavailable. Third-party dependency." },
              { feature: "Order visibility",      good: "Real-time dashboard — status, dispatch, ETA in one place.",     bad: "WhatsApp updates. No audit trail." },
              { feature: "Problem resolution",    good: "One support record across quote, production and delivery.",     bad: "Call them. Hope they answer." },
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
                <Link href="/configure">
                  <button className="btn-fill btn-amber px-8 py-3 text-sm">
                    Get a managed quote →
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
      <section className="pw-theme-surface pw-home-longform" style={{ background: "#FFFFFF", padding: "100px 0" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 40px" }}>
          <span className="scroll-animate" style={{ color: "#1B6CA8", fontSize: 11, fontWeight: 600, letterSpacing: "2px", textTransform: "uppercase", display: "block", marginBottom: 14 }}>
            ILLUSTRATIVE OPERATING SCENARIOS
          </span>
          <h2 className="scroll-animate scroll-animate-delay-1" style={{ color: "#0D1B2A", fontSize: "clamp(2rem,4vw,3.25rem)", fontWeight: 700, lineHeight: 1.1, marginBottom: 0 }}>
            What a managed packaging<br />workflow can change.
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
                      background: "white",
                      border: `1px solid ${isActive ? "#1B6CA8" : "#E2EAF4"}`,
                      padding: "22px 24px",
                      cursor: "pointer",
                      position: "relative",
                      overflow: "hidden",
                      transition: "all 0.3s ease",
                      boxShadow: "none",
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
                    <div style={{ display: "inline-block", marginTop: 10, background: "transparent", borderTop: "1px solid #CBD5E1", padding: "7px 0 0" }}>
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
                <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 12, lineHeight: 1.55, marginBottom: 18 }}>Turn the next packaging brief into a managed order record.</p>
                <Link href="/configure">
                  <button style={{ background: "#1B6CA8", color: "white", padding: "10px 20px", fontSize: 13, fontWeight: 700, border: "none", cursor: "pointer" }}>
                    Get a pricing plan →
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
      <section className="pw-calculator-section">
        <div className="pw-calculator-shell">
          <div className="pw-calculator-heading">
            <span>PACKWORKZ VALUE SCENARIO</span>
            <h2>Put a number on packaging friction.</h2>
            <p>Adjust three operating inputs. We will show a conservative scenario, the assumptions behind it, and where a sourcing audit should look first.</p>
            <div className="pw-calculator-assumption"><MS icon="info" /><span>Scenario only: uses a {Math.round(calc.savingPct * 100)}% sourcing-efficiency assumption and {useCredit === "Yes" ? "2.5%" : "0%"} rush-buying leakage. It is not a guaranteed saving.</span></div>
          </div>

          <div className="pw-calculator-workbench">
            <div className="pw-calculator-controls">
              <label htmlFor="spend-slider"><span>Monthly packaging spend</span><strong>{inr(monthlySpend)}<small>/ month</small></strong></label>
              <input id="spend-slider" type="range" className="calc-slider" min={50000} max={5000000} step={10000} value={monthlySpend} onChange={event => setMonthlySpend(Number(event.target.value))} style={{ background: `linear-gradient(to right,#E8A838 0%,#E8A838 ${sliderPct}%,#CBD6DE ${sliderPct}%,#CBD6DE 100%)` }} />

              <div className="pw-calculator-control-row">
                <fieldset><legend>Vendors managed</legend><div>{(["Just 1", "2 to 4", "5+"] as VendorBucket[]).map(option => <button type="button" key={option} className={vendorBucket === option ? "active" : ""} onClick={() => setVendorBucket(option)}>{option}</button>)}</div></fieldset>
                <fieldset><legend>Rush buys or credit leakage?</legend><div>{(["Yes", "No"] as CreditOption[]).map(option => <button type="button" key={option} className={useCredit === option ? "active" : ""} onClick={() => setUseCredit(option)}>{option}</button>)}</div></fieldset>
              </div>
            </div>

            <div className="pw-calculator-result">
              <div className="pw-calculator-result-top"><span>CONSERVATIVE ANNUAL OPPORTUNITY</span><b>LIVE SCENARIO</b></div>
              <strong className="calc-hero-num">{inr(displayedSaving)}</strong>
              <p>potential sourcing efficiency</p>
              <div className="pw-calculator-bar"><i style={{ width: `${Math.min(92, 34 + calc.savingPct * 500)}%` }} /></div>
              <div className="pw-calculator-metrics">
                <div><span>Rush leakage identified</span><strong>{inr(calc.emergencyLeakage)}</strong></div>
                <div><span>Operational time returned</span><strong>{calc.timeSaved} hrs / month</strong></div>
                <div><span>Total scenario value</span><strong>{inr(calc.totalValue)}</strong></div>
              </div>
              <Link href="/configure"><button className="btn-fill btn-amber"><span>Build my packaging plan</span><MS icon="arrow_forward" /></button></Link>
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
            Build a clear packaging specification, sourcing path, and order record in one place.
          </p>

          {/* CTAs — sharp animated-border (our design) */}
          <div className="scroll-animate scroll-animate-delay-3 flex flex-col sm:flex-row gap-4 justify-center mb-5" style={{ alignItems: "stretch" }}>
            <span className="animated-border animated-border-white" style={{ display: "flex" }}>
              <Link href="/products" style={{ flex: 1, display: "flex" }}>
                <button className="btn-fill btn-amber px-10 py-4 text-base whitespace-nowrap" style={{ flex: 1 }}>
                  Browse packaging formats →
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
            {["Pricing plan in 48 hours", "No commitment until you approve", "Sample from ₹2,999", "Design from ₹1,999"].map((item, i) => (
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
