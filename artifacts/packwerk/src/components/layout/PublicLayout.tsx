import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import {
  Package, Box, ShoppingBag, Layers, RotateCcw, Tag, Leaf, Gift,
  Zap, Factory, Pill, Sparkles, Cpu, UtensilsCrossed, Gem, Globe,
  ChevronDown, BookOpen, Info, Network,
  Users, Mail, Calculator, FileText, Lightbulb, Bot, Palette,
  ClipboardCheck, Truck, ShieldCheck, MapPinned, MessageSquare,
  ShoppingCart as ShoppingCartIcon,
} from "lucide-react";
import { CATALOG_SKUS } from "@/lib/catalog";
import { LAUNCH_PROMOTION_RATE } from "@workspace/commerce";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { useCart } from "@/lib/cart";

// ── Per-page SEO metadata ────────────────────────────────────────────────────
const PAGE_SEO: Record<string, { title: string; description: string; keywords: string }> = {
  "/": {
    title: "Packworkz — Packaging Manufacturer & Managed Platform India | D2C, FMCG, Pharma",
    description: "Managed packaging for D2C, FMCG, pharma and enterprise teams. Browse 49 focused product families, see quantity pricing, create 3D previews and manage repeat orders in one workflow.",
    keywords: "packaging manufacturer India, managed packaging platform, custom packaging India, D2C packaging manufacturer, FMCG packaging supplier India, packaging vendor India",
  },
  "/products": {
    title: "Packaging Products India | Pouches, Boxes, Bottles | Packworkz",
    description: "Browse 49 focused packaging families including pouches, cartons, containers, mailers, labels, food-service packs and technical rollstock. See buying paths and quantity pricing online.",
    keywords: "packaging manufacturer India, custom packaging manufacturer, stand-up pouch manufacturer India, corrugated box manufacturer, flexible packaging manufacturer India",
  },
  "/industries": {
    title: "Packaging Manufacturer for D2C, FMCG, Pharma & Exports | India | Packworkz",
    description: "Custom packaging solutions for every industry — D2C brands, FMCG manufacturers, pharma, cosmetics, food & beverage, electronics, and exporters. India's managed packaging platform.",
    keywords: "packaging manufacturer D2C India, FMCG packaging manufacturer, pharma packaging manufacturer India, cosmetics packaging supplier, B2B packaging India",
  },
  "/how-it-works": {
    title: "How to Source Custom Packaging in India | 4-Step Process | Packworkz",
    description: "Source custom packaging in 4 simple steps. Submit specs, get competitive pricing plans in 48 hours, approve samples, track production. India's simplest managed packaging sourcing process.",
    keywords: "source packaging India, custom packaging process, packaging supplier India, managed packaging procurement, B2B packaging platform",
  },
  "/about": {
    title: "About Packworkz | India's First Managed Packaging Manufacturer Platform",
    description: "Packworkz brings packaging specifications, manufacturer matching, quality checkpoints, order tracking and repeat-order planning into one managed workflow.",
    keywords: "Packworkz about, packaging manufacturer platform India, managed packaging company India",
  },
  "/configure": {
    title: "Configure Custom Packaging Online | India | Packworkz",
    description: "Build a packaging specification, compare quantity-based indicative pricing and submit a self-serve order plan or assisted technical quote for pouches, boxes, bottles, mailers and more.",
    keywords: "custom packaging pricing plan India, packaging manufacturer pricing plan, get packaging pricing plan online, bulk packaging price India",
  },
  "/procurement-plan": {
    title: "Managed Packaging Pricing Plan for Technical SKUs | Packworkz",
    description: "Plan packaging rolls, technical films, high-barrier rollstock, and high-volume custom packaging with material guidance, samples, and manufacturer matching.",
    keywords: "packaging procurement plan India, packaging roll pricing, technical packaging supplier India, managed packaging sourcing",
  },
  "/samples": {
    title: "Order Packaging Samples India | From ₹2,999 | Packworkz",
    description: "Order physical packaging samples before bulk production. Choose a standard or express sample route; dispatch timing and format availability are confirmed before fulfilment.",
    keywords: "packaging samples India, order packaging samples, custom packaging sample, packaging manufacturer sample India",
  },
  "/sustainable": {
    title: "Sustainable Packaging Materials India | Packworkz",
    description: "Compare kraft, recycled board, mono-material, bagasse and compostable packaging by product protection, tradeoffs and the evidence required for the finished specification.",
    keywords: "sustainable packaging manufacturer India, eco-friendly packaging India, compostable packaging, EPR compliant packaging India, FSC certified packaging",
  },
  "/sustainability": {
    title: "Sustainable Packaging India | Verified Materials | Packworkz",
    description: "Explore lower-impact packaging with material evidence, responsible sourcing, right-size foodservice formats, and practical end-of-life guidance.",
    keywords: "sustainable packaging manufacturer India, eco-friendly packaging India, compostable packaging, EPR compliant packaging India",
  },
  "/sustainable-catalog": {
    title: "Sustainable Packaging Catalog India | FSC, Compostable, Recycled | Packworkz",
    description: "Browse sustainable packaging SKUs with EPR documentation, FSC options, compostable mailers, recycled boxes, and food-safe eco packaging.",
    keywords: "sustainable packaging catalog India, eco packaging catalog, FSC packaging India, compostable packaging India",
  },
  "/design": {
    title: "Custom Packaging Design Service India | From ₹1,999 | Packworkz",
    description: "Packaging design and 3D previews across 49 focused product families, with print-ready artwork, dieline handoff and design management.",
    keywords: "custom packaging design India, packaging design service, packaging artwork India, D2C packaging design, print-ready packaging",
  },
  "/mockup-studio": {
    title: "Free 3D Packaging Mockup Studio | Boxes, Pouches & Bottles | Packworkz",
    description: "Create an interactive 3D packaging preview, apply a brand color or logo, rotate the pack and export a review image before production.",
    keywords: "3D packaging mockup, packaging design preview, box mockup generator, pouch mockup, bottle mockup India",
  },
  "/contact": {
    title: "Contact Packworkz | Custom Packaging India | +91 82089 90366",
    description: "Contact Packworkz for custom packaging pricing, sample orders, technical specifications, design enquiries or order support. Call +91 82089 90366 or submit an enquiry online.",
    keywords: "contact Packworkz, packaging manufacturer contact India, packaging enquiry India",
  },
  "/track-order": {
    title: "Track Packaging Order or Quote | Packworkz",
    description: "Track a Packworkz order or quote securely using its reference and the email address or mobile number used during checkout. No account is required.",
    keywords: "track Packworkz order, packaging order tracking India, track packaging quote",
  },
  "/signup": {
    title: "Create Your Packworkz Account | Orders, Quotes & Reorders",
    description: "Create a Packworkz account to view packaging orders and quotes, link earlier purchases, follow production milestones and start accurate repeat orders.",
    keywords: "Packworkz account, packaging order dashboard, packaging reorder portal",
  },
  "/login": {
    title: "Packworkz Account Login | Orders & Quotes",
    description: "Sign in to your Packworkz account to view orders, quotes, production status and repeat-order specifications.",
    keywords: "Packworkz login, packaging order dashboard login, packaging quotes account",
  },
  "/network": {
    title: "Packworkz Packaging Manufacturer Network India",
    description: "See how Packworkz matches packaging specifications to eligible production routes, quality checkpoints and applicable supplier documentation across India.",
    keywords: "packaging manufacturer network India, verified packaging factories, packaging supplier network India, B2B packaging manufacturers",
  },
  "/industries/d2c": {
    title: "D2C Packaging Manufacturer India | Custom Branded Pouches & Boxes | Packworkz",
    description: "Custom branded packaging for D2C brands. Stand-up pouches, mailers, gift boxes and more. Low MOQ from 200 units. Fast 10–15 day delivery. Trusted by 150+ D2C brands.",
    keywords: "D2C packaging manufacturer India, custom packaging D2C brand, branded packaging India, ecommerce packaging manufacturer",
  },
  "/industries/fmcg": {
    title: "FMCG Packaging Manufacturer India | Bulk Supplier | Packworkz",
    description: "High-volume FMCG packaging across flexible pouches, glass jars, cartons, labels and rollstock, with self-serve catalog routes and assisted technical quoting.",
    keywords: "FMCG packaging manufacturer India, bulk packaging supplier India, FMCG packaging platform, packaging supplier FMCG",
  },
  "/industries/pharma": {
    title: "Pharma Packaging Manufacturer India | CPCB & FDA Compliant | Packworkz",
    description: "Pharma packaging across HDPE and glass containers, folding cartons, labels and managed high-barrier formats, with documentation verified against the final specification.",
    keywords: "pharma packaging manufacturer India, pharmaceutical packaging supplier, FDA compliant packaging India, CPCB packaging India",
  },
  "/industries/beauty": {
    title: "Beauty & Cosmetics Packaging Manufacturer India | Packworkz",
    description: "Custom cosmetics packaging — airless pumps, glass jars, aluminium tubes, serum bottles and luxury boxes. Low MOQ, custom branding, pre-dispatch QC.",
    keywords: "cosmetics packaging manufacturer India, beauty packaging supplier India, skincare packaging manufacturer, cosmetic bottle manufacturer India",
  },
  "/industries/food": {
    title: "Food Packaging Manufacturer India | FSSAI Compliant | Packworkz",
    description: "FSSAI-compliant food packaging — stand-up pouches, flat bottom bags, spout pouches, kraft boxes and more. Custom printing, retort pouches, and bulk orders available.",
    keywords: "food packaging manufacturer India, FSSAI packaging India, food grade packaging supplier, snack packaging manufacturer India",
  },
  "/industries/exports": {
    title: "Export Packaging Manufacturer India | SASO, FDA, CE Compliant | Packworkz",
    description: "Packaging for Indian exporters targeting UAE, US, UK, and Europe. SASO-ready, FDA-grade, FSC-certified with full chain-of-custody documentation for every shipment.",
    keywords: "export packaging India, SASO compliant packaging, FDA grade packaging India, packaging for Indian exporters, international packaging India",
  },
  "/industries/electronics": {
    title: "Electronics Packaging Manufacturer India | Anti-Static, ESD Safe | Packworkz",
    description: "Anti-static bags, ESD-safe packaging, corrugated inserts and custom foam for electronics brands. Full compliance documentation. Low MOQ, pan-India delivery.",
    keywords: "electronics packaging manufacturer India, anti-static packaging India, ESD packaging supplier, custom packaging electronics brand",
  },
  "/products/flexible": {
    title: "Flexible Packaging Manufacturer India | Stand-Up Pouches, Rollstock | Packworkz",
    description: "Custom flexible packaging from India's verified manufacturers. Stand-up pouches, pillow pouches, spout pouches, flat bottom bags and rollstock. MOQ from 500 units.",
    keywords: "flexible packaging manufacturer India, stand-up pouch manufacturer India, pouch packaging supplier, rollstock film manufacturer",
  },
  "/products/bottles": {
    title: "Bottle & Jar Manufacturer India | PET, HDPE, Glass | Packworkz",
    description: "PET jars, HDPE bottles, glass containers and more from India's verified rigid packaging manufacturers. Custom shapes, colours, closures and labelling available.",
    keywords: "bottle manufacturer India, PET jar manufacturer India, HDPE bottle supplier, glass bottle manufacturer India, rigid packaging manufacturer",
  },
  "/products/boxes": {
    title: "Box & Carton Manufacturer India | Mono Carton, Corrugated, Gift Box | Packworkz",
    description: "Mono cartons, corrugated shippers, gift boxes and rigid boxes from India's verified packaging manufacturers. Full custom printing, embossing, foiling and finishing.",
    keywords: "box manufacturer India, mono carton manufacturer India, corrugated box supplier India, gift box manufacturer, carton packaging India",
  },
  "/products/ecommerce": {
    title: "E-commerce Packaging Manufacturer India | Poly Mailers, Courier Bags | Packworkz",
    description: "Custom poly mailers, kraft mailers, compostable mailers and courier bags for D2C and e-commerce brands. Low MOQ from 200 units. Custom branded and plain stock available.",
    keywords: "ecommerce packaging manufacturer India, poly mailer manufacturer, courier bag supplier India, D2C mailer packaging, shipping bag manufacturer",
  },
  "/products/sustainable": {
    title: "Sustainable Packaging Products India | Compostable, Kraft, Recycled | Packworkz",
    description: "Shop eco-friendly packaging — compostable mailers, kraft bags, recycled PE pouches and FSC-certified boxes. EPR compliance documentation included with every order.",
    keywords: "sustainable packaging products India, compostable packaging manufacturer, eco packaging India, recycled packaging supplier",
  },
  "/products/labels": {
    title: "Label Manufacturer India | Self-Adhesive, Shrink Sleeve, Sticker | Packworkz",
    description: "Custom labels and shrink sleeves from India's verified label manufacturers. Self-adhesive labels, shrink sleeves, tamper-evident seals and more. MOQ from 1,000 units.",
    keywords: "label manufacturer India, self-adhesive label supplier India, shrink sleeve manufacturer, sticker label manufacturer India",
  },
};

const PRODUCT_GROUPS = [
  {
    eyebrow: "PRIMARY PACKAGING",
    description: "The pack customers see, hold and open.",
    items: [
      { icon: Package, label: "Flexible Packaging", desc: "Pouches and printed flexible packs", href: "/products?category=flexible" },
      { icon: Box, label: "Bottles & Containers", desc: "Bottles, jars, pumps and closures", href: "/products?category=bottles" },
      { icon: Pill, label: "Tubes & Small Packs", desc: "Cosmetic tubes and compact formats", href: "/products?category=tubes" },
    ],
  },
  {
    eyebrow: "SHIP & PROTECT",
    description: "Retail-ready packs through final delivery.",
    items: [
      { icon: ShoppingBag, label: "Boxes & Cartons", desc: "Folding cartons and premium boxes", href: "/products?category=boxes" },
      { icon: Layers, label: "E-commerce Packaging", desc: "Mailers, courier bags and shippers", href: "/products?category=ecommerce" },
      { icon: Gift, label: "Protective Packaging", desc: "Wrap, void fill and protective inserts", href: "/products?category=protective" },
    ],
  },
  {
    eyebrow: "FINISH & SCALE",
    description: "Brand details and high-volume production.",
    items: [
      { icon: Tag, label: "Labels & Accessories", desc: "Labels, inserts, tissue and tape", href: "/products?category=labels" },
      { icon: Leaf, label: "Sustainable Foodservice", desc: "Bagasse, paper containers and wraps", href: "/products?category=sustainable" },
      { icon: RotateCcw, label: "Packaging Rolls", desc: "Managed rollstock and technical films", href: "/products?category=rolls" },
    ],
  },
];

// ── Industry mega-menu data ───────────────────────────────────────────────────
const INDUSTRIES = [
  { icon: Zap,              label: "D2C Brands",           href: "/industries/d2c" },
  { icon: Factory,          label: "FMCG Manufacturers",   href: "/industries/fmcg" },
  { icon: Pill,             label: "Pharma & Healthcare",  href: "/industries/pharma" },
  { icon: Sparkles,         label: "Cosmetics & Beauty",   href: "/industries/beauty" },
  { icon: Cpu,              label: "Electronics",          href: "/industries/electronics" },
  { icon: UtensilsCrossed,  label: "Food & Beverage",      href: "/industries/food" },
  { icon: Gem,              label: "Jewellery & Luxury",   href: "/industries/luxury" },
  { icon: Globe,            label: "Exports & Global",     href: "/industries/exports" },
];

const ABOUT_ITEMS = [
  { icon: Info,     label: "Our Story",       href: "/about" },
  { icon: BookOpen, label: "How It Works",    href: "/how-it-works" },
  { icon: Network,  label: "Factory Network", href: "/network" },
  { icon: Users,    label: "Careers",         href: "/careers" },
  { icon: Mail,     label: "Contact Us",      href: "/contact" },
];

const RESOURCE_ITEMS = [
  { icon: BookOpen, label: "Packaging Guides", desc: "Materials, print and format decisions", href: "/resources" },
  { icon: FileText, label: "Case Studies", desc: "How brands improved cost and reliability", href: "/resources?type=case-study" },
  { icon: Calculator, label: "Savings Calculator", desc: "Estimate the value of managed sourcing", href: "/#savings-calculator" },
  { icon: Lightbulb, label: "Packaging Insights", desc: "Practical procurement and compliance advice", href: "/resources?type=insight" },
];

// ── Styles injected once ──────────────────────────────────────────────────────
const GLOBAL_STYLES = `
  @keyframes dropIn {
    from { opacity: 0; transform: translateY(-8px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes slideUpChat {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  /* ── Mobile responsive footer ── */
  @media (max-width: 768px) {
    .po-footer-grid {
      grid-template-columns: 1fr 1fr !important;
      padding: 32px 24px !important;
      gap: 24px !important;
    }
    .po-footer-topbar {
      padding: 20px 24px !important;
      flex-direction: column !important;
      align-items: flex-start !important;
    }
    .po-footer-bottom {
      padding: 16px 24px !important;
      flex-direction: column !important;
      align-items: flex-start !important;
    }
  }
  @media (max-width: 480px) {
    .po-footer-grid {
      grid-template-columns: 1fr !important;
      padding: 24px 20px !important;
    }
  }

  /* ── Mobile content padding ── */
  @media (max-width: 640px) {
    .po-section-pad {
      padding-left: 20px !important;
      padding-right: 20px !important;
    }
  }

  .po-menu-item {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 10px 12px;
    border-radius: 8px;
    cursor: pointer;
    transition: background 0.15s;
    text-decoration: none;
    color: inherit;
  }
  .po-menu-item:hover { background: #F8F9FC; }

  /* Fill-left hover for nav text links */
  .po-nav-link {
    position: relative;
    overflow: hidden;
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 6px 10px;
    border-radius: 6px;
    font-size: 13px;
    font-weight: 600;
    letter-spacing: 0.03em;
    text-decoration: none;
    cursor: pointer;
    background: transparent;
    border: none;
    color: rgba(255,255,255,0.72);
    transition: color 0.2s;
    white-space: nowrap;
    font-family: inherit;
  }
  .po-nav-link::after {
    content: '';
    position: absolute;
    inset: 0;
    background: rgba(255,255,255,0.12);
    border-radius: 6px;
    transform: translateX(-101%);
    transition: transform 0.25s ease;
  }
  .po-nav-link:hover::after { transform: translateX(0); }
  .po-nav-link:hover { color: #FFFFFF; }
  .po-nav-link.active { color: #F7C95C; }

  /* Amber CTA button fill animation */
  .po-cta-btn {
    position: relative;
    overflow: hidden;
    display: inline-block;
    padding: 8px 20px;
    border-radius: 0;
    font-size: 13px;
    font-weight: 800;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    text-decoration: none;
    color: #0D1B2A;
    background: #E8A838;
    transition: color 0.25s;
  }
  .po-cta-btn::before {
    content: '';
    position: absolute;
    inset: 0;
    background: #F6C65B;
    transform: translateX(-101%);
    transition: transform 0.3s ease;
  }
  .po-mega-panel {
    position: absolute;
    top: 100%;
    left: 0;
    width: 100%;
    background: #FFFFFF;
    border: 1px solid #D9E2EC;
    border-top: 0;
    box-shadow: 0 24px 60px rgba(13, 27, 42, 0.18);
    color: #0D1B2A;
    animation: dropIn 0.18s ease forwards;
    z-index: 100;
  }
  .po-mega-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
  .po-mega-column {
    min-width: 0;
    padding: 28px 30px 24px;
  }
  .po-mega-column + .po-mega-column {
    border-left: 1px solid #D9E2EC;
  }
  .po-mega-link {
    display: grid;
    grid-template-columns: 38px minmax(0, 1fr) 18px;
    align-items: center;
    gap: 12px;
    min-height: 62px;
    padding: 8px 0;
    color: #0D1B2A;
    text-decoration: none;
    border-bottom: 1px solid #EDF2F7;
    transition: color 0.16s ease, transform 0.16s ease;
  }
  .po-mega-link:last-child { border-bottom: 0; }
  .po-mega-link:hover { color: #0B3FA0; transform: translateX(3px); }
  .po-mega-link:hover .po-mega-arrow { opacity: 1; transform: translateX(0); }
  .po-mega-arrow {
    color: #0B3FA0;
    opacity: 0;
    transform: translateX(-4px);
    transition: opacity 0.16s ease, transform 0.16s ease;
  }
  .po-mega-footer {
    display: grid;
    grid-template-columns: 1.2fr 1fr 1fr 1fr;
    border-top: 1px solid #D9E2EC;
    background: #F7F9FC;
  }
  .po-mega-footer-link {
    min-width: 0;
    padding: 17px 24px;
    color: #0D1B2A;
    text-decoration: none;
    font-size: 12px;
    font-weight: 800;
    letter-spacing: 0.02em;
    border-right: 1px solid #D9E2EC;
    transition: background 0.16s ease, color 0.16s ease;
  }
  .po-mega-footer-link:last-child { border-right: 0; }
  .po-mega-footer-link:hover { background: #0B3FA0; color: #FFFFFF; }
  @media (max-width: 1180px) {
    .po-mega-column { padding-left: 20px; padding-right: 20px; }
    .po-mega-footer-link { padding-left: 16px; padding-right: 16px; }
  }
  .po-cta-btn:hover { color: #0D1B2A; }
  .po-cta-btn:hover::before { transform: translateX(0); }
  .po-cta-btn span { position: relative; z-index: 1; }
`;

// ── Icon wrapper for dropdown items ──────────────────────────────────────────
function IconBox({ Icon }: { Icon: React.ElementType }) {
  return (
    <div style={{
      width: 32, height: 32, borderRadius: 8,
      background: "rgba(11,63,160,0.08)",
      display: "flex", alignItems: "center", justifyContent: "center",
      flexShrink: 0,
    }}>
      <Icon size={16} color="#0B3FA0" />
    </div>
  );
}

// ── Products mega-menu ────────────────────────────────────────────────────────
function ProductsMenu() {
  return (
    <div className="po-mega-panel" aria-label="Products menu">
      <div className="po-mega-grid">
        {PRODUCT_GROUPS.map(group => (
          <section key={group.eyebrow} className="po-mega-column">
            <div style={{ color: "#1B6CA8", fontSize: 11, fontWeight: 800, letterSpacing: "0.13em" }}>{group.eyebrow}</div>
            <p style={{ color: "#718096", fontSize: 12, lineHeight: 1.5, margin: "5px 0 12px" }}>{group.description}</p>
            {group.items.map(item => (
              <Link key={item.href} href={item.href} className="po-mega-link">
                <IconBox Icon={item.icon} />
                <span style={{ minWidth: 0 }}>
                  <strong style={{ display: "block", fontSize: 14, lineHeight: 1.3 }}>{item.label}</strong>
                  <small style={{ display: "block", color: "#718096", fontSize: 11, lineHeight: 1.45, marginTop: 3 }}>{item.desc}</small>
                </span>
                <span className="po-mega-arrow" aria-hidden="true">→</span>
              </Link>
            ))}
          </section>
        ))}
      </div>
      <div className="po-mega-footer">
        <Link href="/products" className="po-mega-footer-link">BROWSE ALL 49 PRODUCTS →</Link>
        <Link href="/mockup-studio" className="po-mega-footer-link">OPEN 3D STUDIO →</Link>
        <Link href="/pack-ai" className="po-mega-footer-link">ASK PACKWORKZ AI →</Link>
        <Link href="/smartstock" className="po-mega-footer-link">EXPLORE SMARTSTOCK →</Link>
      </div>
    </div>
  );
}

// ── Industries mega-menu ──────────────────────────────────────────────────────
function IndustriesMenu() {
  return (
    <div className="po-mega-panel" aria-label="Industries menu">
      <div className="po-mega-grid">
        <section className="po-mega-column">
          <div style={{ color: "#1B6CA8", fontSize: 11, fontWeight: 800, letterSpacing: "0.13em" }}>BUILD & LAUNCH</div>
          <p style={{ color: "#718096", fontSize: 12, lineHeight: 1.5, margin: "5px 0 12px" }}>Low-MOQ packs for brands building repeat demand.</p>
          {INDUSTRIES.slice(0, 3).map(ind => (
            <Link key={ind.href} href={ind.href} className="po-mega-link">
              <IconBox Icon={ind.icon} /><strong style={{ fontSize: 14 }}>{ind.label}</strong><span className="po-mega-arrow">→</span>
            </Link>
          ))}
        </section>
        <section className="po-mega-column">
          <div style={{ color: "#1B6CA8", fontSize: 11, fontWeight: 800, letterSpacing: "0.13em" }}>SCALE OPERATIONS</div>
          <p style={{ color: "#718096", fontSize: 12, lineHeight: 1.5, margin: "5px 0 12px" }}>Managed formats for growing and regulated teams.</p>
          {INDUSTRIES.slice(3, 6).map(ind => (
            <Link key={ind.href} href={ind.href} className="po-mega-link">
              <IconBox Icon={ind.icon} /><strong style={{ fontSize: 14 }}>{ind.label}</strong><span className="po-mega-arrow">→</span>
            </Link>
          ))}
        </section>
        <section className="po-mega-column">
          <div style={{ color: "#B8780A", fontSize: 11, fontWeight: 800, letterSpacing: "0.13em" }}>PREMIUM & GLOBAL</div>
          <p style={{ color: "#718096", fontSize: 12, lineHeight: 1.5, margin: "5px 0 12px" }}>Presentation-led and export-ready buying paths.</p>
          {INDUSTRIES.slice(6).map(ind => (
            <Link key={ind.href} href={ind.href} className="po-mega-link">
              <IconBox Icon={ind.icon} /><strong style={{ fontSize: 14 }}>{ind.label}</strong><span className="po-mega-arrow">→</span>
            </Link>
          ))}
          <Link href="/configure" className="po-mega-link">
            <IconBox Icon={Sparkles} /><span><strong style={{ display: "block", fontSize: 14 }}>Not sure where to start?</strong><small style={{ color: "#718096", fontSize: 11 }}>Build a packaging plan</small></span><span className="po-mega-arrow">→</span>
          </Link>
        </section>
      </div>
      <div className="po-mega-footer">
        <Link href="/industries" className="po-mega-footer-link">VIEW ALL INDUSTRIES →</Link>
        <Link href="/how-it-works" className="po-mega-footer-link">HOW PACKWORKZ WORKS →</Link>
        <Link href="/samples" className="po-mega-footer-link">ORDER A SAMPLE →</Link>
        <Link href="/contact" className="po-mega-footer-link">TALK TO A SPECIALIST →</Link>
      </div>
    </div>
  );
}

function ResourcesMenu() {
  return (
    <div className="po-mega-panel" aria-label="Resources menu">
      <div className="po-mega-grid">
        <section className="po-mega-column">
          <div style={{ color: "#1B6CA8", fontSize: 11, fontWeight: 800, letterSpacing: "0.13em" }}>LEARN PACKAGING</div>
          <p style={{ color: "#718096", fontSize: 12, lineHeight: 1.5, margin: "5px 0 12px" }}>Clear answers for materials, formats and buying decisions.</p>
          {RESOURCE_ITEMS.filter((item) => ["Packaging Guides", "Packaging Insights", "Case Studies"].includes(item.label)).map(item => (
            <Link key={item.label} href={item.href} className="po-mega-link">
              <IconBox Icon={item.icon} />
              <span><strong style={{ display: "block", fontSize: 14 }}>{item.label}</strong><small style={{ color: "#718096", fontSize: 11 }}>{item.desc}</small></span>
              <span className="po-mega-arrow">→</span>
            </Link>
          ))}
        </section>
        <section className="po-mega-column">
          <div style={{ color: "#1B6CA8", fontSize: 11, fontWeight: 800, letterSpacing: "0.13em" }}>PLAN YOUR PACK</div>
          <p style={{ color: "#718096", fontSize: 12, lineHeight: 1.5, margin: "5px 0 12px" }}>Tools that turn an idea into a usable specification.</p>
          {[
            { icon: Calculator, label: "Savings Calculator", desc: "Model packaging and sourcing savings", href: "/#savings-calculator" },
            { icon: Palette, label: "3D Mockup Studio", desc: "See artwork on a pack before production", href: "/mockup-studio" },
            { icon: Bot, label: "Ask Packworkz AI", desc: "Get a practical packaging shortlist", href: "/pack-ai" },
          ].map(item => (
            <Link key={item.label} href={item.href} className="po-mega-link">
              <IconBox Icon={item.icon} />
              <span><strong style={{ display: "block", fontSize: 14 }}>{item.label}</strong><small style={{ color: "#718096", fontSize: 11 }}>{item.desc}</small></span>
              <span className="po-mega-arrow">→</span>
            </Link>
          ))}
        </section>
        <section className="po-mega-column">
          <div style={{ color: "#B8780A", fontSize: 11, fontWeight: 800, letterSpacing: "0.13em" }}>BUY WITH CONFIDENCE</div>
          <p style={{ color: "#718096", fontSize: 12, lineHeight: 1.5, margin: "5px 0 12px" }}>Proof, support and status after you choose a format.</p>
          {[
            { icon: ClipboardCheck, label: "Order Samples", desc: "Compare materials and print in hand", href: "/samples" },
            { icon: Truck, label: "Track an Order", desc: "Check production and delivery status", href: "/track-order" },
            { icon: MessageSquare, label: "Packaging Support", desc: "Talk through a specific requirement", href: "/contact" },
          ].map(item => (
            <Link key={item.label} href={item.href} className="po-mega-link">
              <IconBox Icon={item.icon} />
              <span><strong style={{ display: "block", fontSize: 14 }}>{item.label}</strong><small style={{ color: "#718096", fontSize: 11 }}>{item.desc}</small></span>
              <span className="po-mega-arrow">→</span>
            </Link>
          ))}
        </section>
      </div>
      <div className="po-mega-footer">
        <Link href="/resources" className="po-mega-footer-link">VIEW ALL RESOURCES →</Link>
        <Link href="/mockup-studio" className="po-mega-footer-link">OPEN 3D STUDIO →</Link>
        <Link href="/pack-ai" className="po-mega-footer-link">ASK PACKWORKZ AI →</Link>
        <Link href="/contact" className="po-mega-footer-link">GET PACKAGING HELP →</Link>
      </div>
    </div>
  );
}

function AboutMenu() {
  return (
    <div className="po-mega-panel" aria-label="About Packworkz menu">
      <div className="po-mega-grid">
        <section className="po-mega-column">
          <div style={{ color: "#1B6CA8", fontSize: 11, fontWeight: 800, letterSpacing: "0.13em" }}>PACKWORKZ</div>
          <p style={{ color: "#718096", fontSize: 12, lineHeight: 1.5, margin: "5px 0 12px" }}>Why we are building a simpler packaging operating system.</p>
          {ABOUT_ITEMS.filter((item) => ["Our Story", "How It Works", "Careers"].includes(item.label)).map(item => (
            <Link key={item.href} href={item.href} className="po-mega-link">
              <IconBox Icon={item.icon} /><strong style={{ fontSize: 14 }}>{item.label}</strong><span className="po-mega-arrow">→</span>
            </Link>
          ))}
        </section>
        <section className="po-mega-column">
          <div style={{ color: "#1B6CA8", fontSize: 11, fontWeight: 800, letterSpacing: "0.13em" }}>HOW WE DELIVER</div>
          <p style={{ color: "#718096", fontSize: 12, lineHeight: 1.5, margin: "5px 0 12px" }}>The production network and systems behind each order.</p>
          {[
            { icon: Network, label: "Factory Network", desc: "Production routes matched to your spec", href: "/network" },
            { icon: ShieldCheck, label: "Quality Workflow", desc: "Documented checkpoints before dispatch", href: "/how-it-works" },
            { icon: Zap, label: "SmartStock", desc: "Plan repeat orders before stock becomes urgent", href: "/smartstock" },
          ].map(item => (
            <Link key={item.label} href={item.href} className="po-mega-link">
              <IconBox Icon={item.icon} />
              <span><strong style={{ display: "block", fontSize: 14 }}>{item.label}</strong><small style={{ color: "#718096", fontSize: 11 }}>{item.desc}</small></span>
              <span className="po-mega-arrow">→</span>
            </Link>
          ))}
        </section>
        <section className="po-mega-column">
          <div style={{ color: "#B8780A", fontSize: 11, fontWeight: 800, letterSpacing: "0.13em" }}>WORK WITH US</div>
          <p style={{ color: "#718096", fontSize: 12, lineHeight: 1.5, margin: "5px 0 12px" }}>Start, support or follow a Packworkz relationship.</p>
          {[
            { icon: Mail, label: "Contact Us", desc: "Sales, support and partnerships", href: "/contact" },
            { icon: MapPinned, label: "Track an Order", desc: "Guest and account order tracking", href: "/track-order" },
            { icon: Users, label: "Customer Dashboard", desc: "Orders, quotes and repeat buying", href: "/dashboard" },
          ].map(item => (
            <Link key={item.label} href={item.href} className="po-mega-link">
              <IconBox Icon={item.icon} />
              <span><strong style={{ display: "block", fontSize: 14 }}>{item.label}</strong><small style={{ color: "#718096", fontSize: 11 }}>{item.desc}</small></span>
              <span className="po-mega-arrow">→</span>
            </Link>
          ))}
        </section>
      </div>
      <div className="po-mega-footer">
        <Link href="/about" className="po-mega-footer-link">ABOUT PACKWORKZ →</Link>
        <Link href="/how-it-works" className="po-mega-footer-link">SEE HOW IT WORKS →</Link>
        <Link href="/network" className="po-mega-footer-link">EXPLORE THE NETWORK →</Link>
        <Link href="/contact" className="po-mega-footer-link">TALK TO THE TEAM →</Link>
      </div>
    </div>
  );
}

// ── NavItem with optional dropdown ───────────────────────────────────────────
function NavItem({
  label, children, href, active, mega = false,
}: {
  label: string;
  children?: React.ReactNode;
  href?: string;
  active?: boolean;
  mega?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancelClose = () => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };

  const openMenu = () => {
    cancelClose();
    setOpen(true);
  };

  const scheduleClose = () => {
    cancelClose();
    closeTimer.current = setTimeout(() => {
      setOpen(false);
      closeTimer.current = null;
    }, 320);
  };

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  useEffect(() => () => cancelClose(), []);

  if (href && !children) {
    return (
      <Link href={href} className={`po-nav-link${active ? " active" : ""}`}>
        {label}
      </Link>
    );
  }

  return (
    <div
      ref={ref}
      style={{
        position: mega ? "static" : "relative",
        alignSelf: "stretch",
        display: "flex",
        alignItems: "center",
      }}
      onMouseEnter={openMenu}
      onMouseLeave={scheduleClose}
      onFocus={openMenu}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          cancelClose();
          setOpen(false);
          ref.current?.querySelector("button")?.focus();
        }
      }}
    >
      <button
        onClick={() => setOpen(o => !o)}
        className={`po-nav-link${active ? " active" : ""}`}
      >
        {label}
        <ChevronDown size={13} style={{ transition: "transform 0.2s", transform: open ? "rotate(180deg)" : "rotate(0deg)" }} />
      </button>
      {open && children}
    </div>
  );
}

// ── Simple markdown renderer for PackAI messages ─────────────────────────────
function renderMd(text: string) {
  return text.split('\n').map((line, li, arr) => {
    const segments = line.split(/(\*\*[^*\n]+?\*\*)/g);
    return (
      <span key={li} style={{ display: 'block' }}>
        {segments.map((seg, si) =>
          seg.startsWith('**') && seg.endsWith('**')
            ? <strong key={si}>{seg.slice(2, -2)}</strong>
            : seg
        )}
        {li < arr.length - 1 && line === '' && <br />}
      </span>
    );
  });
}

// ── PackAI Widget ─────────────────────────────────────────────────────────────
const WA_NUM = "918208990366";
const WA_ICON = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="#25D366">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

type Msg = { role: "user" | "assistant"; content: string };
type Stage = "name" | "email" | "phone" | "chat";

const WELCOME_MSG: Msg = {
  role: "assistant",
  content: "Hi! I'm PackAI — your intelligent packaging advisor from Packworkz 👋\n\nI'll help you find the right packaging for your product, optimise costs, and connect you to the best factories in India.\n\nBefore we start, what's your name?",
};

function TypingDots() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 4, padding: "10px 14px", background: "white", borderRadius: "4px 14px 14px 14px", width: "fit-content", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
      {[0, 1, 2].map(i => (
        <span key={i} style={{
          width: 7, height: 7, borderRadius: "50%", background: "#94A3B8",
          display: "inline-block",
          animation: `packaiDot 1.2s ${i * 0.2}s infinite ease-in-out`,
        }} />
      ))}
    </div>
  );
}

function PackAIWidget() {
  const [open, setOpen] = useState(false);
  const [stage, setStage] = useState<Stage>("name");
  const [lead, setLead] = useState({ name: "", email: "", phone: "" });
  const [messages, setMessages] = useState<Msg[]>([WELCOME_MSG]);
  const [inputVal, setInputVal] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const addMsg = (role: Msg["role"], content: string) =>
    setMessages(prev => [...prev, { role, content }]);

  const handleSend = async () => {
    const text = inputVal.trim();
    if (!text || loading) return;
    setInputVal("");

    // Lead capture stages
    if (stage === "name") {
      const name = text;
      setLead(l => ({ ...l, name }));
      addMsg("user", text);
      setTimeout(() => {
        addMsg("assistant", `Nice to meet you, ${name}! 😊\n\nWhat's your email address? We'll send your packaging recommendations there.`);
        setStage("email");
      }, 400);
      return;
    }

    if (stage === "email") {
      setLead(l => ({ ...l, email: text }));
      addMsg("user", text);
      setTimeout(() => {
        addMsg("assistant", `Got it! And your WhatsApp / phone number? Our team will follow up with samples and pricing.`);
        setStage("phone");
      }, 400);
      return;
    }

    if (stage === "phone") {
      const phone = text;
      setLead(l => ({ ...l, phone }));
      addMsg("user", text);
      setLoading(true);
      try {
        await fetch("/api/leads", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            source: "support",
            name: lead.name,
            email: lead.email,
            phone,
            subject: "Packworkz AI support handoff",
            message: "Visitor completed the Packworkz AI contact handoff and is ready to discuss packaging.",
          }),
        });
        addMsg("assistant", `Perfect, thanks ${lead.name}. Your details are saved.\n\nNow tell me what product you are packaging, the quantity, and the deadline.`);
      } catch {
        addMsg("assistant", `Thanks, ${lead.name}. We can continue planning here. Tell me what product you are packaging, the quantity, and the deadline.`);
      } finally {
        setStage("chat");
        setLoading(false);
      }
      return;
    }

    // Real AI chat
    addMsg("user", text);
    setLoading(true);

    const historyForAI: Msg[] = [
      {
        role: "assistant",
        content: `[Client info — Name: ${lead.name}, Email: ${lead.email}, Phone: ${lead.phone}. They are chatting via PackAI on Packworkz.com. Use their name naturally in responses.]`,
      },
      ...messages.filter(m => m.role !== "assistant" || !m.content.startsWith("[Client info")),
      { role: "user", content: text },
    ];

    try {
      const res = await fetch("/api/pack-ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: historyForAI }),
      });
      const data = await res.json() as { reply?: string; error?: string };
      if (data.reply) {
        addMsg("assistant", data.reply);
      } else {
        addMsg("assistant", data.error ?? "I'm having trouble right now — please try again or WhatsApp us at +91 82089 90366!");
      }
    } catch {
      addMsg("assistant", "Network error — please check your connection or WhatsApp us at +91 82089 90366!");
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const placeholder = stage === "name" ? "Your name…"
    : stage === "email" ? "your@email.com"
    : stage === "phone" ? "+91 98765 43210"
    : "Ask about packaging, SKUs, pricing, MOQs…";

  return (
    <>
      {open && (
        <div style={{
          position: "fixed", bottom: 90, right: 24, zIndex: 998,
          width: 360, borderRadius: 18,
          background: "white",
          boxShadow: "0 16px 64px rgba(13,27,42,0.22)",
          display: "flex", flexDirection: "column",
          overflow: "hidden",
          maxHeight: "80vh",
          animation: "slideUpChat 0.25s ease",
        }}>
          {/* Header */}
          <div style={{ background: "#0D1B2A", padding: "14px 18px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: "#1B6CA8", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="10" rx="2"/>
                  <circle cx="12" cy="5" r="2"/>
                  <line x1="12" y1="7" x2="12" y2="11"/>
                  <line x1="8" y1="15" x2="8" y2="17"/>
                  <line x1="16" y1="15" x2="16" y2="17"/>
                </svg>
              </div>
              <div>
                <p style={{ color: "white", fontWeight: 800, fontSize: 14, margin: 0 }}>PackAI</p>
                <p style={{ color: "#64B5E8", fontSize: 11, fontWeight: 600, margin: 0 }}>Your Intelligent Packaging Advisor</p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} style={{ color: "rgba(255,255,255,0.5)", background: "none", border: "none", cursor: "pointer", fontSize: 22, lineHeight: 1, padding: "0 4px" }}>×</button>
          </div>

          {/* Stage progress */}
          {stage !== "chat" && (
            <div style={{ background: "#F8F9FC", padding: "8px 18px", borderBottom: "1px solid #E2EAF4", display: "flex", gap: 4, flexShrink: 0 }}>
              {(["name", "email", "phone", "chat"] as Stage[]).map((s, i) => (
                <div key={s} style={{
                  flex: 1, height: 3, borderRadius: 99,
                  background: ["name", "email", "phone", "chat"].indexOf(stage) >= i ? "#1B6CA8" : "#E2EAF4",
                  transition: "background 0.3s",
                }} />
              ))}
            </div>
          )}

          {/* Messages */}
          <div style={{ flex: 1, overflowY: "auto", padding: "16px 14px 8px", display: "flex", flexDirection: "column", gap: 10, background: "#F8F9FC", minHeight: 240 }}>
            {messages.map((m, i) => (
              <div key={i} style={{
                alignSelf: m.role === "assistant" ? "flex-start" : "flex-end",
                maxWidth: "88%",
                background: m.role === "assistant" ? "white" : "#1B6CA8",
                color: m.role === "assistant" ? "#0D1B2A" : "white",
                borderRadius: m.role === "assistant" ? "4px 14px 14px 14px" : "14px 4px 14px 14px",
                padding: "10px 14px", fontSize: 13, lineHeight: 1.6,
                boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
              }}>
                {renderMd(m.content)}
              </div>
            ))}
            {loading && <TypingDots />}
            <div ref={bottomRef} />
          </div>

          {/* WhatsApp link */}
          <div style={{ padding: "8px 14px", background: "#F0F9FF", borderTop: "1px solid #BAD7F2", textAlign: "center", flexShrink: 0 }}>
            <a
              href={`https://wa.me/${WA_NUM}?text=Hi%20Packworkz%2C%20I%27d%20like%20to%20discuss%20packaging.`}
              target="_blank" rel="noopener noreferrer"
              style={{ fontSize: 12, color: "#25D366", fontWeight: 700, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 5 }}
            >
              {WA_ICON} Prefer WhatsApp? Chat directly with our team →
            </a>
          </div>

          {/* Input */}
          <div style={{ padding: "10px 14px", background: "white", borderTop: "1px solid #E2EAF4", display: "flex", gap: 8, flexShrink: 0 }}>
            <input
              value={inputVal}
              onChange={e => setInputVal(e.target.value)}
              onKeyDown={handleKey}
              placeholder={placeholder}
              disabled={loading}
              style={{
                flex: 1, padding: "9px 12px", borderRadius: 8,
                border: "1.5px solid #E2EAF4", fontSize: 13,
                background: loading ? "#F8F9FC" : "white",
                color: "#0D1B2A", outline: "none",
                transition: "border-color 0.2s",
              }}
              onFocus={e => { (e.target as HTMLInputElement).style.borderColor = "#1B6CA8"; }}
              onBlur={e => { (e.target as HTMLInputElement).style.borderColor = "#E2EAF4"; }}
            />
            <button
              onClick={handleSend}
              disabled={loading || !inputVal.trim()}
              style={{
                padding: "9px 14px", borderRadius: 8,
                background: loading || !inputVal.trim() ? "#E2EAF4" : "#1B6CA8",
                border: "none", cursor: loading || !inputVal.trim() ? "not-allowed" : "pointer",
                transition: "background 0.2s",
                flexShrink: 0,
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
            </button>
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen(!open)}
        style={{
          position: "fixed", bottom: 24, right: 24, zIndex: 999,
          background: open ? "#334155" : "#1B6CA8",
          borderRadius: 999, border: "none", cursor: "pointer",
          padding: "13px 22px",
          display: "flex", alignItems: "center", gap: 8,
          boxShadow: "0 4px 20px rgba(27,108,168,0.35)",
          transition: "background 0.2s, transform 0.15s",
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "scale(1.04)"; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = "scale(1)"; }}
      >
        {open ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="10" rx="2"/>
            <circle cx="12" cy="5" r="2"/>
            <line x1="12" y1="7" x2="12" y2="11"/>
            <line x1="8" y1="15" x2="8" y2="17"/>
            <line x1="16" y1="15" x2="16" y2="17"/>
          </svg>
        )}
        <span style={{ color: "white", fontWeight: 800, fontSize: 14, letterSpacing: "0.04em" }}>PackAI</span>
        {!open && <span style={{ background: "#E8A838", color: "#0D1B2A", fontSize: 9, fontWeight: 900, padding: "2px 5px", borderRadius: 4, letterSpacing: "0.05em" }}>AI</span>}
      </button>

      <style>{GLOBAL_STYLES + `
        @keyframes packaiDot {
          0%, 80%, 100% { transform: scale(0.7); opacity: 0.5; }
          40% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </>
  );
}

// ── Public Layout ─────────────────────────────────────────────────────────────
export function PublicLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileAboutOpen, setMobileAboutOpen] = useState(false);
  const [mobileResourcesOpen, setMobileResourcesOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(() => !!localStorage.getItem("packwerk_access_token"));
  const { count: cartCount, openCart } = useCart();

  const isHome = location === "/";
  const navFloating = scrolled;
  const navSolid = scrolled || !isHome;

  useEffect(() => {
    document.documentElement.classList.remove("dark");
    document.documentElement.style.colorScheme = "light";
    localStorage.removeItem("packworkz_theme");
  }, []);

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem("packwerk_access_token"));

    const canonicalUrl = `https://packworkz.com${location === "/" ? "" : location}`;

    // Resolve SEO: exact match → longest prefix → homepage fallback
    const productSlug = location.match(/^\/products\/([^/?#]+)/)?.[1];
    const product = productSlug
      ? CATALOG_SKUS.find((item) => item.slug === decodeURIComponent(productSlug))
      : undefined;
    const productSeo = product
      ? {
          title: `${product.name} Packaging India | Packworkz`,
          description: `${product.description} Review standard sizes, configuration options, quantity pricing and the correct buying path with Packworkz.`,
          keywords: `${product.name} India, custom ${product.name}, packaging supplier India, Packworkz`,
        }
      : undefined;
    const seo = productSeo ?? PAGE_SEO[location] ??
      (Object.entries(PAGE_SEO)
        .filter(([k]) => k !== "/" && location.startsWith(k))
        .sort((a, b) => b[0].length - a[0].length)[0]?.[1]) ??
      PAGE_SEO["/"];

    // Title
    document.title = seo.title;

    // Meta description
    const descEl = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
    if (descEl) descEl.content = seo.description;

    // Meta keywords
    const kwEl = document.querySelector('meta[name="keywords"]') as HTMLMetaElement | null;
    if (kwEl) kwEl.content = seo.keywords;

    // Open Graph
    const setMeta = (selector: string, content: string) => {
      const el = document.querySelector(selector) as HTMLMetaElement | null;
      if (el) el.setAttribute("content", content);
    };
    setMeta('meta[property="og:title"]', seo.title);
    setMeta('meta[property="og:description"]', seo.description);
    setMeta('meta[property="og:url"]', canonicalUrl);
    setMeta('meta[name="twitter:title"]', seo.title);
    setMeta('meta[name="twitter:description"]', seo.description);

    // Canonical
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = canonicalUrl;
  }, [location]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="min-h-screen flex flex-col" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <style>{GLOBAL_STYLES}</style>

      <Link
        href="/configure"
        className="pw-launch-strip h-10 flex items-center justify-center px-4 text-center no-underline"
        style={{ background: "#F7F9FC", color: "#0B3FA0", borderBottom: "1px solid #DCE5F2" }}
        aria-label={`Claim ${Math.round(LAUNCH_PROMOTION_RATE * 100)}% launch saving on your order`}
      >
        <span className="text-[10px] sm:text-xs font-black uppercase tracking-[0.08em] sm:tracking-[0.12em]">
          Launch offer: {Math.round(LAUNCH_PROMOTION_RATE * 100)}% off your first online order
          <span className="hidden sm:inline font-bold opacity-75"> · applied automatically at checkout</span>
        </span>
      </Link>

      {/* ── NAV ── */}
      <header
        className={`fixed flex items-center justify-between px-6 md:px-10 h-[68px] ${navSolid ? "pw-nav-floating" : "pw-nav-top"}`}
        style={{
          zIndex: 1000,
          top: navFloating ? 0 : 40,
          left: "50%",
          width: "100%",
          transform: "translateX(-50%)",
          borderRadius: 0,
          background: navFloating ? "#0B3FA0" : navSolid ? "#0D1B2A" : "transparent",
          border: navFloating ? "0 solid transparent" : navSolid ? "1px solid #20364B" : "1px solid transparent",
          boxShadow: navFloating ? "0 10px 30px rgba(3, 31, 86, 0.22)" : "none",
          transition: "top 0.24s ease, width 0.24s ease, border-radius 0.24s ease, background-color 0.24s ease, border-color 0.24s ease, box-shadow 0.24s ease",
          willChange: "top, width, background-color, box-shadow",
        }}
      >
        {/* Logo */}
        <Link href="/" style={{ textDecoration: "none" }}>
          <span className="pw-logo-reveal" style={{
            fontSize: 32, fontWeight: 900, letterSpacing: "-0.03em",
            color: "white", fontFamily: "'Space Grotesk', sans-serif",
            cursor: "pointer", userSelect: "none",
          }}>
            Packworkz
          </span>
        </Link>

        {/* Centre navigation */}
        <nav className="hidden lg:flex h-full items-center gap-2">
          <NavItem label="Products" active={location.startsWith("/products")} mega>
            <ProductsMenu />
          </NavItem>
          <NavItem label="Industries" active={location.startsWith("/industries")} mega>
            <IndustriesMenu />
          </NavItem>
          <NavItem label="Sustainability" href="/sustainable" active={location.startsWith("/sustainable")} />
          <NavItem label="Resources" active={location.startsWith("/resources")} mega>
            <ResourcesMenu />
          </NavItem>
          <NavItem label="About" active={location.startsWith("/about") || location.startsWith("/how-it-works") || location.startsWith("/network") || location.startsWith("/careers") || location.startsWith("/contact")} mega>
            <AboutMenu />
          </NavItem>
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-1">
          {/* Desktop-only buttons */}
          <div className="hidden lg:flex items-center gap-1">
            {isLoggedIn ? (
              <Link href="/dashboard" className="po-nav-link" style={{ color: "#E8A838" }}>
                Dashboard
              </Link>
            ) : (
              <Link href="/login" className="po-nav-link">
                Login
              </Link>
            )}
            <span style={{ marginLeft: 8 }}>
              <Link href="/configure" className="po-cta-btn">
                <span>START YOUR ORDER</span>
              </Link>
            </span>
          </div>

          <button
            type="button"
            onClick={openCart}
            className="relative grid h-11 w-11 place-items-center text-white transition-colors hover:text-amber"
            style={{ background: "transparent", border: "none", cursor: "pointer" }}
            aria-label={`Open cart${cartCount ? `, ${cartCount} items` : ""}`}
          >
            <ShoppingCartIcon size={21} />
            {cartCount > 0 && (
              <span className="absolute right-0.5 top-0.5 grid h-5 min-w-5 place-items-center bg-amber px-1 text-[10px] font-black text-navy">
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            )}
          </button>

          {/* Mobile hamburger only */}
          <button className="lg:hidden p-2 ml-1" style={{ color: "white", background: "none", border: "none", cursor: "pointer", lineHeight: 1 }} onClick={() => setMobileOpen(!mobileOpen)}>
            <span className="material-symbols-outlined" style={{ fontSize: 28 }}>{mobileOpen ? "close" : "menu"}</span>
          </button>
        </div>
      </header>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-x-0 bottom-0 z-40 overflow-y-auto" style={{ top: navFloating ? 68 : 108, background: "#0D1B2A" }}>
          <nav className="flex flex-col px-8 py-8 gap-1">
            {[
              { label: "Products", href: "/products" },
              { label: "Industries", href: "/industries" },
              { label: "Sustainability", href: "/sustainable" },
            ].map(item => (
              <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)}
                style={{ fontSize: 22, fontWeight: 900, textTransform: "uppercase", color: "white", textDecoration: "none", padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                {item.label}
              </Link>
            ))}

            <button
              onClick={() => setMobileResourcesOpen(o => !o)}
              style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                fontSize: 22, fontWeight: 900, textTransform: "uppercase", color: "white",
                background: "none", border: "none", borderBottom: "1px solid rgba(255,255,255,0.07)",
                padding: "10px 0", cursor: "pointer", width: "100%", textAlign: "left",
              }}
            >
              Resources
              <ChevronDown size={18} color="rgba(255,255,255,0.5)" style={{ transition: "transform 0.2s", transform: mobileResourcesOpen ? "rotate(180deg)" : "rotate(0deg)", flexShrink: 0 }} />
            </button>
            {mobileResourcesOpen && (
              <div style={{ paddingLeft: 8, paddingBottom: 4, borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                {[
                  ...RESOURCE_ITEMS,
                  { icon: Palette, label: "3D Mockup Studio", desc: "", href: "/mockup-studio" },
                  { icon: Bot, label: "Ask Packworkz AI", desc: "", href: "/pack-ai" },
                  { icon: Truck, label: "Track an Order", desc: "", href: "/track-order" },
                ].map(item => (
                  <Link key={`${item.label}-${item.href}`} href={item.href} onClick={() => { setMobileOpen(false); setMobileResourcesOpen(false); }}
                    style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 4px", fontSize: 15, fontWeight: 700, color: "rgba(255,255,255,0.7)", textDecoration: "none" }}>
                    <item.icon size={16} color="#E8A838" />
                    {item.label}
                  </Link>
                ))}
              </div>
            )}

            {/* About accordion */}
            <button
              onClick={() => setMobileAboutOpen(o => !o)}
              style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                fontSize: 22, fontWeight: 900, textTransform: "uppercase", color: "white",
                background: "none", border: "none", borderBottom: "1px solid rgba(255,255,255,0.07)",
                padding: "10px 0", cursor: "pointer", width: "100%", textAlign: "left",
              }}
            >
              About
              <ChevronDown size={18} color="rgba(255,255,255,0.5)" style={{ transition: "transform 0.2s", transform: mobileAboutOpen ? "rotate(180deg)" : "rotate(0deg)", flexShrink: 0 }} />
            </button>
            {mobileAboutOpen && (
              <div style={{ paddingLeft: 8, paddingBottom: 4, borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                {ABOUT_ITEMS.map(item => (
                  <Link key={item.href} href={item.href} onClick={() => { setMobileOpen(false); setMobileAboutOpen(false); }}
                    style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 4px", fontSize: 15, fontWeight: 700, color: "rgba(255,255,255,0.7)", textDecoration: "none" }}>
                    <item.icon size={16} color="#E8A838" />
                    {item.label}
                  </Link>
                ))}
              </div>
            )}

            <div className="pt-6 flex flex-col gap-4">
              <Link href="/design" onClick={() => setMobileOpen(false)}
                style={{ fontSize: 16, fontWeight: 700, color: "rgba(255,255,255,0.55)", textDecoration: "none" }}>
                Design Service
              </Link>
              <Link href="/mockup-studio" onClick={() => setMobileOpen(false)}
                style={{ fontSize: 16, fontWeight: 700, color: "rgba(255,255,255,0.55)", textDecoration: "none" }}>
                3D Mockup Studio
              </Link>
              <Link href="/samples" onClick={() => setMobileOpen(false)}
                style={{ fontSize: 16, fontWeight: 700, color: "rgba(255,255,255,0.55)", textDecoration: "none" }}>
                Order a Sample
              </Link>
              {isLoggedIn ? (
                <Link href="/dashboard" onClick={() => setMobileOpen(false)}
                  style={{ fontSize: 16, fontWeight: 700, color: "#E8A838", textDecoration: "none" }}>
                  Dashboard
                </Link>
              ) : (
                <Link href="/login" onClick={() => setMobileOpen(false)}
                  style={{ fontSize: 16, fontWeight: 700, color: "rgba(255,255,255,0.55)", textDecoration: "none" }}>
                  Login
                </Link>
              )}
              <Link href="/configure" onClick={() => setMobileOpen(false)}
                style={{ display: "inline-block", marginTop: 8, padding: "14px 28px", background: "#E8A838", color: "#0D1B2A", fontWeight: 800, fontSize: 14, textDecoration: "none", borderRadius: 8, textTransform: "uppercase", letterSpacing: "0.05em", textAlign: "center" }}>
                Start your order →
              </Link>
            </div>
          </nav>
        </div>
      )}

      <CartDrawer />

      <main className="flex-1">
        {children}
      </main>

      {/* ── FOOTER ── */}
      <footer style={{ background: "#020617", fontFamily: "'Space Grotesk', sans-serif" }}>

        {/* Top bar: logo + socials + CTA */}
        <div className="po-footer-topbar" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)", padding: "28px 64px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
          <span style={{ fontSize: 34, fontWeight: 900, color: "white", letterSpacing: "-0.03em" }}>Packworkz</span>
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            {/* Social icons */}
            {[
              { label: "Packworkz on LinkedIn", href: "https://www.linkedin.com/company/packworkz/", path: "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" },
              { label: "Packworkz on Facebook", href: "https://facebook.com/packworkz", path: "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" },
            ].map(s => (
              <a key={s.label} href={s.href} target="_blank" rel="noreferrer" aria-label={s.label}
                style={{ color: "rgba(255,255,255,0.45)", transition: "color 0.15s" }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "white"}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.45)"}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d={s.path}/></svg>
              </a>
            ))}
            <Link href="/configure" className="po-cta-btn">
              <span>START YOUR ORDER →</span>
            </Link>
          </div>
        </div>

        {/* Main link grid + newsletter */}
        <div className="po-footer-grid" style={{ padding: "48px 64px", display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr 280px", gap: 32 }}>
          {/* Products */}
          <div className="flex flex-col gap-3">
            <h4 style={{ color: "white", fontWeight: 700, fontSize: 11, letterSpacing: "2px", textTransform: "uppercase", marginBottom: 4 }}>PRODUCTS</h4>
            {[
              { label: "Flexible Packaging", href: "/products?category=flexible" },
              { label: "Bottles & Containers", href: "/products?category=bottles" },
              { label: "E-commerce Packaging", href: "/products?category=ecommerce" },
              { label: "Sustainable Foodservice", href: "/products?category=sustainable" },
              { label: "Boxes & Cartons", href: "/products?category=boxes" },
            ].map(l => (
              <Link key={l.href} href={l.href}
                style={{ color: "#94A3B8", textDecoration: "none", fontSize: 14, transition: "color 0.15s" }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "white"}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "#94A3B8"}>
                {l.label}
              </Link>
            ))}
          </div>

          {/* Industries */}
          <div className="flex flex-col gap-3">
            <h4 style={{ color: "white", fontWeight: 700, fontSize: 11, letterSpacing: "2px", textTransform: "uppercase", marginBottom: 4 }}>INDUSTRIES</h4>
            {[
              { label: "D2C Brands", href: "/industries/d2c" },
              { label: "FMCG Manufacturers", href: "/industries/fmcg" },
              { label: "Pharma & Healthcare", href: "/industries/pharma" },
              { label: "Food & Beverage", href: "/industries/food" },
              { label: "Cosmetics & Beauty", href: "/industries/beauty" },
              { label: "Electronics", href: "/industries/electronics" },
            ].map(l => (
              <Link key={l.href} href={l.href}
                style={{ color: "#94A3B8", textDecoration: "none", fontSize: 14, transition: "color 0.15s" }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "white"}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "#94A3B8"}>
                {l.label}
              </Link>
            ))}
          </div>

          {/* Company */}
          <div className="flex flex-col gap-3">
            <h4 style={{ color: "white", fontWeight: 700, fontSize: 11, letterSpacing: "2px", textTransform: "uppercase", marginBottom: 4 }}>COMPANY</h4>
            {[
              { label: "About Us", href: "/about" },
              { label: "How It Works", href: "/how-it-works" },
              { label: "Sustainability", href: "/sustainable" },
              { label: "Resources", href: "/resources" },
              { label: "Careers", href: "/careers" },
              { label: "Contact Us", href: "/contact" },
            ].map(l => (
              <Link key={l.href} href={l.href}
                style={{ color: "#94A3B8", textDecoration: "none", fontSize: 14, transition: "color 0.15s" }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "white"}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "#94A3B8"}>
                {l.label}
              </Link>
            ))}
          </div>

          {/* Support */}
          <div className="flex flex-col gap-3">
            <h4 style={{ color: "white", fontWeight: 700, fontSize: 11, letterSpacing: "2px", textTransform: "uppercase", marginBottom: 4 }}>SUPPORT</h4>
            {[
              { label: "Order a Sample", href: "/samples" },
              { label: "Design Service", href: "/design" },
              { label: "3D Mockup Studio", href: "/mockup-studio" },
              { label: "Track an Order", href: "/track-order" },
              { label: "Get a Quote", href: "/configure" },
              { label: "WhatsApp Us", href: "https://wa.me/918208990366" },
              { label: "Dashboard Login", href: "/login" },
            ].map(l => (
              <a key={l.label} href={l.href}
                style={{ color: "#94A3B8", textDecoration: "none", fontSize: 14, transition: "color 0.15s" }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "white"}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "#94A3B8"}>
                {l.label}
              </a>
            ))}
          </div>

          {/* Newsletter */}
          <div className="flex flex-col gap-4">
            <h4 style={{ color: "white", fontWeight: 700, fontSize: 13, lineHeight: 1.4 }}>Subscribe To Packworkz Newsletter</h4>
            <input
              type="email"
              placeholder="Your Email Address"
              style={{
                background: "transparent", border: "1px solid rgba(255,255,255,0.2)",
                color: "white", padding: "10px 14px", fontSize: 13,
                outline: "none", width: "100%",
              }}
            />
            <button style={{
              background: "white", color: "#020617",
              fontWeight: 700, fontSize: 13, padding: "10px 14px",
              border: "none", cursor: "pointer", width: "100%",
              transition: "background 0.15s",
            }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#E8A838"; (e.currentTarget as HTMLElement).style.color = "#0D1B2A"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "white"; (e.currentTarget as HTMLElement).style.color = "#020617"; }}>
              Subscribe
            </button>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="po-footer-bottom" style={{ borderTop: "1px solid rgba(255,255,255,0.08)", padding: "18px 64px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <p style={{ color: "#94A3B8", fontSize: 13, margin: 0 }}>© {new Date().getFullYear()} Packworkz India. All rights reserved.</p>
          <div style={{ display: "flex", gap: 20 }}>
            {[{ label: "Privacy Policy", href: "/privacy" }, { label: "Terms of Service", href: "/terms" }, { label: "Refund Policy", href: "/refund" }].map(l => (
              <Link key={l.label} href={l.href}
                style={{ color: "#94A3B8", fontSize: 13, textDecoration: "none", transition: "color 0.15s" }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "white"}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "#94A3B8"}>
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
