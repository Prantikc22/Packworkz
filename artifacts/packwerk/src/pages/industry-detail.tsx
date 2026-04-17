import { Link, useParams } from "wouter";
import { INDUSTRY_IMAGES } from "@/lib/images";

const MS = ({ icon, className = "", style }: { icon: string; className?: string; style?: React.CSSProperties }) => (
  <span className={`material-symbols-outlined ${className}`} style={style}>{icon}</span>
);
const MsFilled = ({ icon, className = "", style }: { icon: string; className?: string; style?: React.CSSProperties }) => (
  <span className={`material-symbols-outlined ms-filled ${className}`} style={style}>{icon}</span>
);

const INDUSTRY_DATA: Record<string, {
  label: string;
  subtitle: string;
  heroImg: string;
  heroProduct: string;
  heroRef: string;
  tagline: string;
  description: string;
  icon: string;
  complianceLevel: string;
  certs: Array<{ name: string; icon: string; desc: string }>;
  skus: Array<{ id: string; name: string; tag: string; img: string; badge?: string }>;
  caseStudy: {
    headline: string;
    highlight: string;
    body: string;
    quote: string;
    author: string;
    stat1: { val: string; label: string };
    stat2: { val: string; label: string };
  };
  nextSlug: string;
  nextLabel: string;
}> = {
  "food-beverage": {
    label: "Food Systems",
    subtitle: "Precision Packaging for Food Systems.",
    heroImg: INDUSTRY_IMAGES.food,
    heroProduct: "ULTRA-SHIELD BARRIER POUCH",
    heroRef: "PKG-FD-8802",
    tagline: "Engineered for preservation, designed for impact.",
    description: "We provide industrial-grade packaging solutions that meet the world's most stringent safety certifications without compromising on brand benchmarks.",
    icon: "restaurant",
    complianceLevel: "ALPHA",
    certs: [
      { name: "FSSC 22000", icon: "verified", desc: "Fully covered Food Safety System Certification covering the entire supply chain, from manufacturing to logistics." },
      { name: "FDA REGULATED", icon: "health_and_safety", desc: "Material sourcing and production environments strictly follow 21 CFR standards for direct food contact." },
      { name: "HACCP READY", icon: "fact_check", desc: "Hazard Analysis Critical Control Point implementation ensures zero contamination during the fabrication process." },
    ],
    skus: [
      { id: "PKG-FD-01", name: "NEXUS STAND-UP POUCH", tag: "Oxygen & Moisture Shield", img: "https://images.unsplash.com/photo-1606166187734-a4cb74079037?w=400&h=320&fit=crop&q=80", badge: "BIODEGRADABLE" },
      { id: "PKG-FD-14", name: "BIO-WINDOW BOX", tag: "Fresh Peel Window", img: "https://images.unsplash.com/photo-1589782182703-2aaa69037b5b?w=400&h=320&fit=crop&q=80", badge: "ECO-CERTIFIED" },
      { id: "PKG-FD-22", name: "VANGUARD RIGID", tag: "Luxury Confectionery", img: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=400&h=320&fit=crop&q=80" },
      { id: "PKG-FD-88", name: "ARCTIC SHIPPER", tag: "Temperature Controlled", img: "https://images.unsplash.com/photo-1553413077-190dd305871c?w=400&h=320&fit=crop&q=80", badge: "COLD CHAIN" },
    ],
    caseStudy: {
      headline: "Revitalizing Organic Harvest: A 40% Extension in Shelf Life.",
      highlight: "A 40% Extension in Shelf Life.",
      body: "By implementing our proprietary tri-layer barrier technology, Organic Harvest reduced atmospheric degradation by 63% for their premium tea line, enabling global shipping without quality compromise.",
      quote: "PackOps didn't just give us a box; they gave us a logistical advantage that redefined our entire retail strategy.",
      author: "Marcus Thomas, Supply Chain Director",
      stat1: { val: "+40%", label: "FRESHNESS DURATION" },
      stat2: { val: "-22%", label: "CARBON FOOTPRINT" },
    },
    nextSlug: "pharma",
    nextLabel: "Pharmaceutical Solutions",
  },
  "pharma": {
    label: "Pharmaceutical",
    subtitle: "Precision Packaging for Pharma.",
    heroImg: INDUSTRY_IMAGES.pharma,
    heroProduct: "SAFE-GUARD BLISTER TRAY",
    heroRef: "PKG-PH-0041",
    tagline: "Built for sterility. Engineered for trust.",
    description: "Tamper-evident, child-resistant, and serialization-ready packaging solutions compliant with global pharma regulations.",
    icon: "medical_services",
    complianceLevel: "PLATINUM",
    certs: [
      { name: "FDA 21 CFR", icon: "health_and_safety", desc: "All materials comply with FDA 21 CFR Part 211 for pharmaceutical manufacturing practices." },
      { name: "ISO 15223", icon: "verified", desc: "Symbols for medical devices and packaging used per international standards." },
      { name: "WHO-GMP", icon: "fact_check", desc: "WHO Good Manufacturing Practice certification for pharmaceutical packaging." },
    ],
    skus: [
      { id: "PKG-PH-01", name: "BLISTER TRAY", tag: "Child-Resistant", img: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=320&fit=crop&q=80" },
      { id: "PKG-PH-02", name: "TAMPER FOIL", tag: "Induction Sealed", img: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=320&fit=crop&q=80" },
      { id: "PKG-PH-03", name: "COLD CHAIN SHIPPER", tag: "2-8°C Validated", img: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400&h=320&fit=crop&q=80", badge: "COLD CHAIN" },
      { id: "PKG-PH-04", name: "UNIT DOSE POUCH", tag: "Serialization Ready", img: "https://images.unsplash.com/photo-1607344645866-009c320b63e0?w=400&h=320&fit=crop&q=80", badge: "TRACK & TRACE" },
    ],
    caseStudy: {
      headline: "Reducing Reject Rate 91% for Generic Drug Manufacturer.",
      highlight: "91% for Generic Drug Manufacturer",
      body: "By implementing our clean-room produced blister packaging, this mid-size pharma eliminated cross-contamination events and passed USFDA inspection without a single 483 observation.",
      quote: "The quality system built around our packaging line is now our competitive moat.",
      author: "Quality Head, Leading Indian Pharma Co.",
      stat1: { val: "-91%", label: "REJECTION RATE" },
      stat2: { val: "0", label: "FDA 483 OBSERVATIONS" },
    },
    nextSlug: "cosmetics",
    nextLabel: "Beauty & Cosmetics",
  },
  "cosmetics": {
    label: "Beauty & Cosmetics",
    subtitle: "Precision Packaging for Beauty.",
    heroImg: INDUSTRY_IMAGES.cosmetics,
    heroProduct: "PRESTIGE AIRLESS PUMP",
    heroRef: "PKG-CS-0072",
    tagline: "Shelf presence that commands. Structure that protects.",
    description: "Premium rigid boxes, glass bottles, and sustainable packaging built for high-street retail and luxury D2C brands.",
    icon: "spa",
    complianceLevel: "PREMIUM",
    certs: [
      { name: "ISO 22716", icon: "verified", desc: "GMP for Cosmetics certification covering production, control, storage and shipping." },
      { name: "COSMOS", icon: "nature_people", desc: "Certified organic and natural cosmetic packaging materials." },
      { name: "FSC CERTIFIED", icon: "park", desc: "All paper and cardboard materials from certified sustainable sources." },
    ],
    skus: [
      { id: "PKG-CS-01", name: "LUXURY RIGID BOX", tag: "Magnetic Closure", img: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=400&h=320&fit=crop&q=80", badge: "PREMIUM" },
      { id: "PKG-CS-02", name: "GLASS DROPPER", tag: "UV Protected", img: "https://images.unsplash.com/photo-1617897903246-719242758050?w=400&h=320&fit=crop&q=80" },
      { id: "PKG-CS-03", name: "AIRLESS PUMP", tag: "Vacuum Dispensing", img: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400&h=320&fit=crop&q=80" },
      { id: "PKG-CS-04", name: "ECO MONO CARTON", tag: "Kraft + Foil", img: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=400&h=320&fit=crop&q=80", badge: "ECO-CERTIFIED" },
    ],
    caseStudy: {
      headline: "D2C Brand Cuts Packaging Cost 28% While Going Premium.",
      highlight: "28% While Going Premium",
      body: "By consolidating 12 cosmetics packaging vendors into Packwerk's single platform, this D2C brand reduced per-unit cost, improved consistency across their SKU line, and launched a new luxury tier.",
      quote: "We went from 12 vendors to 1. Our per-unit cost dropped 28% and our packaging is now the #1 customer compliment.",
      author: "Founder, Leading Indian Skincare Brand",
      stat1: { val: "-28%", label: "UNIT COST" },
      stat2: { val: "+41%", label: "INSTAGRAM SHARES" },
    },
    nextSlug: "ecommerce",
    nextLabel: "E-commerce Solutions",
  },
  "ecommerce": {
    label: "E-commerce & D2C",
    subtitle: "Packaging Built for Last-Mile Impact.",
    heroImg: INDUSTRY_IMAGES.ecommerce,
    heroProduct: "NEXUS MAILER BOX",
    heroRef: "PKG-EC-0033",
    tagline: "Every delivery is a brand touchpoint.",
    description: "Custom mailer boxes, poly bags, and protective inserts designed for high-volume D2C fulfillment with on-brand unboxing experiences.",
    icon: "local_shipping",
    complianceLevel: "STANDARD",
    certs: [
      { name: "ASTM D4169", icon: "verified", desc: "Performance Testing of Shipping Containers and Systems." },
      { name: "ISTA 2A", icon: "fact_check", desc: "Packaged product simulation testing for small packages." },
      { name: "CPCB COMPLIANT", icon: "nature_people", desc: "Central Pollution Control Board EPR compliance for e-waste." },
    ],
    skus: [
      { id: "PKG-EC-01", name: "BRANDED MAILER BOX", tag: "Custom Printed", img: "https://images.unsplash.com/photo-1592756558430-53d8d4a50a96?w=400&h=320&fit=crop&q=80", badge: "MOST POPULAR" },
      { id: "PKG-EC-02", name: "POLY MAILER", tag: "LDPE Security", img: "https://images.unsplash.com/photo-1531973576160-7125cd663d86?w=400&h=320&fit=crop&q=80" },
      { id: "PKG-EC-03", name: "BUBBLE MAILER", tag: "Self-seal Bubble", img: "https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?w=400&h=320&fit=crop&q=80" },
      { id: "PKG-EC-04", name: "PROTECTIVE INSERT", tag: "EPE Foam Cut", img: "https://images.unsplash.com/photo-1607344645866-009c320b63e0?w=400&h=320&fit=crop&q=80" },
    ],
    caseStudy: {
      headline: "Reducing Returns 67% for Fast Fashion Brand.",
      highlight: "67% for Fast Fashion Brand",
      body: "Switched from generic poly bags to custom structural mailer boxes. Product damage in transit dropped from 4.2% to 0.3%.",
      quote: "The unboxing experience became a viral moment. Our return rate halved in 2 months.",
      author: "Head of Ops, D2C Fashion Brand",
      stat1: { val: "-67%", label: "RETURN RATE" },
      stat2: { val: "+88K", label: "UNBOXING VIEWS" },
    },
    nextSlug: "fmcg",
    nextLabel: "FMCG Solutions",
  },
  "fmcg": {
    label: "FMCG & Consumer",
    subtitle: "High-volume Consumer Packaging.",
    heroImg: INDUSTRY_IMAGES.fmcg,
    heroProduct: "VELOCITY MONO CARTON",
    heroRef: "PKG-FMC-0012",
    tagline: "Speed, volume, compliance — all in one.",
    description: "Primary and secondary packaging for high-volume FMCG brands requiring rapid replenishment, consistent quality, and shelf-ready solutions.",
    icon: "shopping_cart",
    complianceLevel: "GOLD",
    certs: [
      { name: "BRC IOP", icon: "verified", desc: "BRCGS Packaging Materials standard for global brand protection." },
      { name: "ISO 9001:2015", icon: "fact_check", desc: "Quality management system certification for all production facilities." },
      { name: "FSC CERTIFIED", icon: "nature_people", desc: "Sustainable paper and board sourcing certified by FSC." },
    ],
    skus: [
      { id: "PKG-FMC-01", name: "SHELF-READY TRAY", tag: "SRP Display Ready", img: "https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=400&h=320&fit=crop&q=80" },
      { id: "PKG-FMC-02", name: "MONO CARTON", tag: "Offset Printed", img: "https://images.unsplash.com/photo-1607344645866-009c320b63e0?w=400&h=320&fit=crop&q=80", badge: "HIGH VOLUME" },
      { id: "PKG-FMC-03", name: "SHRINK WRAP", tag: "Multi-pack Bundling", img: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400&h=320&fit=crop&q=80" },
      { id: "PKG-FMC-04", name: "LABELS ROLL", tag: "BOPP Self-adhesive", img: "https://images.unsplash.com/photo-1574634534894-89d7576c8259?w=400&h=320&fit=crop&q=80" },
    ],
    caseStudy: {
      headline: "National Brand Cuts Lead Time 55%.",
      highlight: "Lead Time 55%",
      body: "By using Packwerk's SmartStock AI, this national FMCG brand reduced packaging lead time from 21 days to 9 days across all SKUs, enabling faster product launches.",
      quote: "We launched 3 new SKUs in Q4 that we couldn't before because of packaging delays. That's gone.",
      author: "Packaging Manager, National Beverage Brand",
      stat1: { val: "-55%", label: "LEAD TIME" },
      stat2: { val: "3", label: "NEW SKU LAUNCHES" },
    },
    nextSlug: "industrial",
    nextLabel: "Industrial B2B",
  },
  "industrial": {
    label: "Industrial & B2B",
    subtitle: "Heavy-Duty Industrial Packaging.",
    heroImg: INDUSTRY_IMAGES.industrial,
    heroProduct: "TITAN CORRUGATED CRATE",
    heroRef: "PKG-IND-0077",
    tagline: "When weight matters, we don't break.",
    description: "Heavy-duty corrugated boxes, pallet wraps, and industrial shipping solutions for manufacturing and B2B supply chains.",
    icon: "precision_manufacturing",
    complianceLevel: "STANDARD",
    certs: [
      { name: "ISO 9001:2015", icon: "verified", desc: "Quality management for industrial packaging production." },
      { name: "IS 1503", icon: "fact_check", desc: "Indian Standards for corrugated fibreboard boxes." },
      { name: "CE MARK", icon: "security", desc: "European conformity for industrial transport packaging." },
    ],
    skus: [
      { id: "PKG-IND-01", name: "DOUBLE WALL RSC", tag: "Heavy Duty", img: "https://images.unsplash.com/photo-1553413077-190dd305871c?w=400&h=320&fit=crop&q=80", badge: "HIGH STRENGTH" },
      { id: "PKG-IND-02", name: "PALLET STRETCH WRAP", tag: "Manual/Machine", img: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400&h=320&fit=crop&q=80" },
      { id: "PKG-IND-03", name: "EDGE PROTECTORS", tag: "Kraft Board", img: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=400&h=320&fit=crop&q=80" },
      { id: "PKG-IND-04", name: "HEAVY DUTY BAG", tag: "HDPE Woven", img: "https://images.unsplash.com/photo-1503602642458-232111445657?w=400&h=320&fit=crop&q=80" },
    ],
    caseStudy: {
      headline: "Machine Parts Manufacturer Cuts Damage Rate 78%.",
      highlight: "Damage Rate 78%",
      body: "By switching to Packwerk's double-wall corrugated solution with custom foam inserts, this auto parts manufacturer eliminated transit damage claims.",
      quote: "We had ₹4L in damage claims per month. Now it's near zero.",
      author: "Logistics Manager, Auto Parts OEM",
      stat1: { val: "-78%", label: "DAMAGE RATE" },
      stat2: { val: "₹4L", label: "CLAIMS SAVED/MONTH" },
    },
    nextSlug: "agriculture",
    nextLabel: "Agriculture Solutions",
  },
  "agriculture": {
    label: "Agriculture & Seeds",
    subtitle: "Packaging Built for the Field.",
    heroImg: INDUSTRY_IMAGES.agriculture,
    heroProduct: "AGRI MOISTURE BARRIER",
    heroRef: "PKG-AG-0018",
    tagline: "Protect the crop. Protect the value.",
    description: "Moisture barrier pouches, woven bags, and crop protection packaging with UV stabilization for agri and seeds sectors.",
    icon: "grass",
    complianceLevel: "STANDARD",
    certs: [
      { name: "FAO STANDARDS", icon: "verified", desc: "Food and Agriculture Organization guidelines for seed packaging." },
      { name: "ISO 9001", icon: "fact_check", desc: "Quality management for agricultural packaging production." },
      { name: "IS 8543", icon: "security", desc: "Indian Standards for flexible intermediate bulk containers (FIBC)." },
    ],
    skus: [
      { id: "PKG-AG-01", name: "SEED POUCH", tag: "Moisture Barrier", img: "https://images.unsplash.com/photo-1606166187734-a4cb74079037?w=400&h=320&fit=crop&q=80" },
      { id: "PKG-AG-02", name: "WOVEN PP BAG", tag: "50kg Capacity", img: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=400&h=320&fit=crop&q=80", badge: "BULK" },
      { id: "PKG-AG-03", name: "PESTICIDE POUCH", tag: "UN Approved", img: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=320&fit=crop&q=80" },
      { id: "PKG-AG-04", name: "FIBC BAG", tag: "1 Ton Jumbo", img: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=400&h=320&fit=crop&q=80", badge: "BULK" },
    ],
    caseStudy: {
      headline: "Seed Company Extends Germination Viability 18 Months.",
      highlight: "18 Months",
      body: "By switching to our nitrogen-flushed moisture barrier pouches, germination rate after 18 months storage improved from 62% to 94%.",
      quote: "Our seed viability is now our product guarantee. Packwerk made that possible.",
      author: "Production Head, Indian Seeds Company",
      stat1: { val: "+52%", label: "GERMINATION RATE" },
      stat2: { val: "18mo", label: "SHELF EXTENSION" },
    },
    nextSlug: "electronics",
    nextLabel: "Electronics Solutions",
  },
  "electronics": {
    label: "Electronics & Tech",
    subtitle: "ESD-Safe Precision Packaging.",
    heroImg: INDUSTRY_IMAGES.electronics,
    heroProduct: "ESD SHIELD BAG",
    heroRef: "PKG-EL-0055",
    tagline: "Static kills chips. Our packaging doesn't.",
    description: "Anti-static bags, ESD foam inserts, and humidity indicator cards for sensitive electronics, PCBs, and semiconductor packaging.",
    icon: "devices",
    complianceLevel: "TECHNICAL",
    certs: [
      { name: "ESD S541", icon: "verified", desc: "ANSI/ESD standard for packaging materials for ESD sensitive items." },
      { name: "JEDEC J-STD", icon: "fact_check", desc: "Moisture sensitivity level compliance for semiconductor packaging." },
      { name: "RoHS COMPLIANT", icon: "security", desc: "Restriction of Hazardous Substances directive compliance." },
    ],
    skus: [
      { id: "PKG-EL-01", name: "ESD SHIELD BAG", tag: "Anti-static Metalized", img: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=320&fit=crop&q=80", badge: "ESD SAFE" },
      { id: "PKG-EL-02", name: "PINK POLY BAG", tag: "Anti-static PE", img: "https://images.unsplash.com/photo-1606166187734-a4cb74079037?w=400&h=320&fit=crop&q=80" },
      { id: "PKG-EL-03", name: "ESD FOAM INSERT", tag: "Conductive Foam", img: "https://images.unsplash.com/photo-1607344645866-009c320b63e0?w=400&h=320&fit=crop&q=80" },
      { id: "PKG-EL-04", name: "HIC CARD", tag: "Humidity Indicator", img: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=320&fit=crop&q=80", badge: "MSL READY" },
    ],
    caseStudy: {
      headline: "PCB Manufacturer Cuts ESD Failure Rate to Zero.",
      highlight: "ESD Failure Rate to Zero",
      body: "By implementing our certified ESD packaging protocol, this electronics manufacturer eliminated electrostatic discharge failures in their export chain.",
      quote: "Zero ESD-related returns since switching. Our overseas clients are impressed.",
      author: "Quality Manager, PCB Manufacturer",
      stat1: { val: "0", label: "ESD FAILURES" },
      stat2: { val: "+35%", label: "EXPORT ORDERS" },
    },
    nextSlug: "food-beverage",
    nextLabel: "Food & Beverage",
  },
};

export default function IndustryDetail() {
  const { slug } = useParams<{ slug: string }>();
  const industry = INDUSTRY_DATA[slug || "food-beverage"] || INDUSTRY_DATA["food-beverage"];

  const mono: React.CSSProperties = { fontFamily: "'Manrope', sans-serif", fontWeight: 700 };

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

      {/* ── HERO ── */}
      <section className="relative min-h-[65vh] flex items-end overflow-hidden" style={{ background: "#0D1B2A" }}>
        <div className="absolute inset-0">
          <img src={industry.heroImg} alt={industry.label} className="w-full h-full object-cover opacity-40" />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to right, rgba(13,27,42,0.95) 50%, rgba(13,27,42,0.3))" }} />
        </div>
        <div className="relative z-10 w-full max-w-7xl mx-auto px-8 md:px-16 pb-16 pt-32 flex justify-between items-end gap-8">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.2em] mb-4" style={{ color: "#1B6CA8" }}>SECTION 01 // GLOBAL STANDARDS</p>
            <h1 className="clash-display text-white mb-4" style={{ fontSize: "clamp(2.5rem,5vw,4rem)", lineHeight: 1.1 }}>
              {industry.subtitle.split(industry.label.split(" ")[0])[0]}
              <br />
              <span style={{ color: "#E8A838" }}>{(industry.subtitle.split("for ")[1] || industry.label).replace(/\.$/, "")}.</span>
            </h1>
            <p className="text-slate-400 text-lg mb-8 max-w-lg">{industry.description}</p>
            <div className="flex flex-wrap gap-4">
              <Link href="/quote">
                <button className="px-8 py-4 rounded font-bold hover:opacity-90" style={{ background: "#E8A838", color: "#0F1C2C" }}>GET A CUSTOM QUOTE</button>
              </Link>
              <Link href="/samples">
                <button className="px-8 py-4 rounded font-bold border border-white/30 text-white hover:bg-white/10 transition-all">VIEW CATALOG</button>
              </Link>
            </div>
          </div>
          <div className="hidden lg:flex flex-col items-end text-right">
            <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "rgba(255,255,255,0.4)" }}>PKG-ID: {industry.heroRef}</p>
            <div className="px-4 py-2 rounded" style={{ background: "#1B6CA8" }}>
              <p className="text-xs font-black text-white uppercase tracking-widest">{industry.heroProduct}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── GLOBAL COMPLIANCE ── */}
      <section className="py-16 px-8 md:px-16" style={{ background: "#F8F9FC" }}>
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
            <div>
              <h2 className="text-2xl font-bold mb-2" style={{ color: "#0D1B2A" }}>GLOBAL COMPLIANCE FRAMEWORK</h2>
              <p className="text-sm" style={{ color: "#44474c" }}>Your brand's integrity depends on uncompromising safety standards. Our processes and factories are audited to the highest global food safety benchmarks.</p>
            </div>
            <span className="px-4 py-2 rounded text-xs font-bold" style={{ background: "rgba(27,108,168,0.1)", color: "#1B6CA8" }}>COMPLIANCE LEVEL: {industry.complianceLevel}</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {industry.certs.map(cert => (
              <div key={cert.name} className="bg-white rounded p-6 border border-slate-200">
                <div className="w-10 h-10 rounded flex items-center justify-center mb-4" style={{ background: "rgba(232,168,56,0.1)" }}>
                  <MS icon={cert.icon} className="text-2xl" style={{ color: "#E8A838" }} />
                </div>
                <h3 className="font-black text-lg mb-3" style={{ color: "#0D1B2A" }}>{cert.name}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "#44474c" }}>{cert.desc}</p>
                <ul className="mt-4 space-y-1">
                  {["Factory audited", "Annual re-certification", "International auditors"].map(item => (
                    <li key={item} className="flex items-center gap-2 text-xs" style={{ color: "#74777d" }}>
                      <MsFilled icon="check_circle" className="text-xs" style={{ color: "#22C55E" }} /> {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED SKUs ── */}
      <section className="py-16 px-8 md:px-16" style={{ background: "#F2F3F6" }}>
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h2 className="font-black text-xl uppercase tracking-wider" style={{ color: "#0D1B2A" }}>FEATURED {industry.label.toUpperCase()} SKUs</h2>
            <Link href="/products">
              <button className="text-xs font-bold hover:underline flex items-center gap-1" style={{ color: "#1B6CA8" }}>
                SEE ALL {industry.label.toUpperCase()} PACKAGING <MS icon="arrow_forward" className="text-sm" />
              </button>
            </Link>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {industry.skus.map(sku => (
              <div key={sku.id} className="bg-white rounded border border-slate-200 overflow-hidden group hover:border-blue-400 hover:shadow-md transition-all">
                <div className="h-44 relative overflow-hidden">
                  <img src={sku.img} alt={sku.name} className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500" />
                  {sku.badge && (
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded text-xs font-bold" style={{ background: "#1B6CA8", color: "white" }}>{sku.badge}</span>
                  )}
                  <span className="absolute bottom-2 right-2 text-xs font-bold" style={{ ...mono, color: "rgba(255,255,255,0.7)" }}>{sku.id}</span>
                </div>
                <div className="p-4">
                  <h4 className="font-bold text-sm mb-1" style={{ color: "#0D1B2A" }}>{sku.name}</h4>
                  <p className="text-xs" style={{ color: "#74777d" }}>{sku.tag}</p>
                  <Link href="/quote">
                    <button className="w-full mt-3 py-2 rounded text-xs font-bold hover:opacity-90 text-white" style={{ background: "#1B6CA8" }}>Order</button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CASE STUDY ── */}
      <section className="py-16 px-8 md:px-16" style={{ background: "#0D1B2A" }}>
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: "#1B6CA8" }}>CASE STUDY // IMPACT REPORT</p>
            <h2 className="clash-display text-white mb-6" style={{ fontSize: "clamp(1.8rem,3vw,2.8rem)", lineHeight: 1.2 }}>
              {industry.caseStudy.headline.replace(industry.caseStudy.highlight, "").trim()}<br />
              <span style={{ color: "#E8A838" }}>{industry.caseStudy.highlight}</span>
            </h2>
            <p className="text-slate-400 mb-8 leading-relaxed">{industry.caseStudy.body}</p>
            <div className="flex gap-8">
              <div>
                <p className="text-3xl font-black" style={{ ...mono, color: "#E8A838" }}>{industry.caseStudy.stat1.val}</p>
                <p className="text-xs uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.4)" }}>{industry.caseStudy.stat1.label}</p>
              </div>
              <div>
                <p className="text-3xl font-black" style={{ ...mono, color: "#E8A838" }}>{industry.caseStudy.stat2.val}</p>
                <p className="text-xs uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.4)" }}>{industry.caseStudy.stat2.label}</p>
              </div>
            </div>
          </div>
          <div>
            <div className="p-8 rounded border" style={{ background: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.08)" }}>
              <MS icon="format_quote" className="text-5xl mb-4" style={{ color: "#E8A838" }} />
              <p className="text-white text-lg italic leading-relaxed mb-6">&ldquo;{industry.caseStudy.quote}&rdquo;</p>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold" style={{ background: "#1B6CA8" }}>
                  {industry.caseStudy.author.charAt(0)}
                </div>
                <p className="text-sm font-bold" style={{ color: "rgba(255,255,255,0.6)" }}>{industry.caseStudy.author}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── NEXT INDUSTRY ── */}
      <section className="py-12 px-8 md:px-16 border-t border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest font-bold mb-1" style={{ color: "#74777d" }}>NEXT SECTOR // TRANSITION</p>
            <Link href={`/industries/${industry.nextSlug}`}>
              <span className="text-xl font-bold cursor-pointer hover:underline flex items-center gap-2" style={{ color: "#0D1B2A" }}>
                {industry.nextLabel} <MS icon="arrow_forward" style={{ color: "#1B6CA8" }} />
              </span>
            </Link>
          </div>
          <Link href="/industries">
            <button className="px-6 py-3 rounded font-bold text-sm border hover:bg-slate-50 transition-all" style={{ borderColor: "#E7E8EB", color: "#44474c" }}>
              All Industries
            </button>
          </Link>
        </div>
      </section>
    </div>
  );
}
