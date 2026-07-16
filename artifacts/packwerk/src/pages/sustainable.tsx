import { useState } from "react";
import { Link } from "wouter";
import {
  ArrowRight, Box, Check, CircleGauge, FileCheck2, Leaf,
  PackageCheck, Recycle, ShieldCheck, Sparkles, Waves, Wheat,
} from "lucide-react";

const MATERIAL_NEEDS = [
  {
    id: "dry",
    label: "Dry food",
    Icon: Wheat,
    headline: "Keep aroma in. Keep moisture out.",
    copy: "Coffee, spices, snacks, tea and supplements need barrier performance before they need a sustainability claim.",
    solution: "Kraft-look or mono-material stand-up pouch",
    checks: ["Oxygen and moisture barrier", "Food-contact declaration", "Seal and zipper validation"],
    accent: "#c98022",
  },
  {
    id: "liquid",
    label: "Liquid & oily",
    Icon: Waves,
    headline: "Leak control decides the material.",
    copy: "Sauces, oils and personal-care liquids need seal integrity, drop testing and product compatibility reviewed together.",
    solution: "Spout pouch, mono-PE format or glass system",
    checks: ["Product compatibility", "Drop and leak testing", "Closure torque or seal data"],
    accent: "#1879a8",
  },
  {
    id: "shipping",
    label: "E-commerce",
    Icon: Box,
    headline: "Reduce material without increasing damage.",
    copy: "The right shipper is sized around product protection, courier handling and the unboxing experience, not empty volume.",
    solution: "Recycled corrugated box or paper mailer",
    checks: ["Board strength and burst value", "Right-sized dieline", "Transit test plan"],
    accent: "#5f7441",
  },
  {
    id: "premium",
    label: "Premium retail",
    Icon: Sparkles,
    headline: "Premium can still be material-efficient.",
    copy: "Structure, print restraint and considered inserts can create shelf presence without adding unnecessary layers.",
    solution: "Recycled paperboard carton with pulp insert",
    checks: ["Recycled-content evidence", "Finish compatibility", "End-of-life instructions"],
    accent: "#9a5362",
  },
];

const MATERIALS = [
  { code: "01", name: "Recycled board", use: "Cartons, shippers, sleeves", strength: "Structure + printability", watch: "Verify recycled content and board grade" },
  { code: "02", name: "Kraft paper", use: "Secondary packs, dry formats", strength: "Natural shelf language", watch: "Barrier liners can change recyclability" },
  { code: "03", name: "Mono-material PE", use: "Pouches, mailers, films", strength: "Single-polymer construction", watch: "Collection streams vary by location" },
  { code: "04", name: "Bagasse & pulp", use: "Trays, inserts, food service", strength: "Rigid fibre protection", watch: "Confirm grease and moisture performance" },
  { code: "05", name: "Certified compostable", use: "Selected bags and films", strength: "Defined composting pathway", watch: "Use only with certificate and disposal context" },
];

const PRODUCTS = [
  { image: "/skus/kraftpaperpacks.jpg", name: "Kraft-look pouches", note: "Dry food and supplements", mode: "Configure online" },
  { image: "/skus/recycledbox.jpg", name: "Recycled board boxes", note: "Retail and e-commerce", mode: "Configure online" },
  { image: "/skus/recycledfoodbox.jpg", name: "Fibre food packs", note: "QSR and cloud kitchens", mode: "Sample first" },
  { image: "/skus/ecofriendlyroll.jpg", name: "Mono-material films", note: "High-volume conversion", mode: "Engineering quote" },
];

const DOCUMENTS = [
  { Icon: FileCheck2, title: "Material declaration", body: "The actual construction and grade used for your production run." },
  { Icon: ShieldCheck, title: "Relevant test evidence", body: "Food-contact, migration, barrier or transit evidence where the application requires it." },
  { Icon: Recycle, title: "End-of-life guidance", body: "A disposal statement matched to the finished pack, not just its outer appearance." },
  { Icon: PackageCheck, title: "Production traceability", body: "Approved specification, artwork version and supplier documents held against the order." },
];

export default function Sustainable() {
  const [activeNeed, setActiveNeed] = useState(0);
  const need = MATERIAL_NEEDS[activeNeed];

  return (
    <main className="sustain-page">
      <section className="sustain-hero">
        <img src="/images/sustainable-bg.jpg" alt="Paper packaging and botanicals arranged on a deep green surface" />
        <div className="sustain-hero-shade" />
        <div className="sustain-hero-inner">
          <p className="sustain-kicker"><Leaf size={15} /> PACKWORKZ MATERIAL STUDIO</p>
          <h1 className="clash-display">Better material.<br /><em>Same ambition.</em></h1>
          <p>Build packaging around product protection, material efficiency and claims you can actually document.</p>
          <div className="sustain-hero-actions">
            <Link href="/configure"><button className="btn-fill btn-amber px-8 py-4"><span>Build a material brief</span><ArrowRight size={17} /></button></Link>
            <Link href="/samples" className="sustain-text-link">Compare samples <ArrowRight size={15} /></Link>
          </div>
          <div className="sustain-hero-proof">
            <span><Check size={14} /> Application-first selection</span>
            <span><Check size={14} /> Spec-level documentation</span>
            <span><Check size={14} /> Performance reviewed before print</span>
          </div>
        </div>
        <div className="sustain-scroll-cue"><span>Explore the system</span><i /></div>
      </section>

      <section className="sustain-selector">
        <div className="sustain-section-head">
          <p>01 / START WITH THE PRODUCT</p>
          <h2 className="clash-display">What must the pack protect?</h2>
          <span>Sustainability works when the material survives the job. Choose an application to see the decision logic.</span>
        </div>
        <div className="sustain-selector-shell">
          <div className="sustain-need-tabs" role="tablist" aria-label="Packaging application">
            {MATERIAL_NEEDS.map((item, index) => (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={activeNeed === index}
                onClick={() => setActiveNeed(index)}
                className={activeNeed === index ? "active" : ""}
              >
                <item.Icon size={19} /><span>{item.label}</span><ArrowRight size={15} />
              </button>
            ))}
          </div>
          <div className="sustain-need-result" role="tabpanel" style={{ "--need-accent": need.accent } as React.CSSProperties}>
            <div className="sustain-need-number">0{activeNeed + 1}</div>
            <div className="sustain-need-copy">
              <p>RECOMMENDED STARTING POINT</p>
              <h3>{need.headline}</h3>
              <span>{need.copy}</span>
              <strong>{need.solution}</strong>
            </div>
            <div className="sustain-checks">
              <p>VERIFY BEFORE PRODUCTION</p>
              {need.checks.map((check) => <span key={check}><Check size={14} /> {check}</span>)}
              <Link href="/configure">Configure this route <ArrowRight size={15} /></Link>
            </div>
          </div>
        </div>
      </section>

      <section className="sustain-materials">
        <div className="sustain-materials-intro">
          <p>02 / MATERIAL LIBRARY</p>
          <h2 className="clash-display">No perfect material.<br />A better-fit system.</h2>
          <span>Every option has a strength, a tradeoff and a right application. We expose all three before you buy.</span>
        </div>
        <div className="sustain-material-list">
          {MATERIALS.map((material) => (
            <article key={material.code}>
              <span className="sustain-material-code">{material.code}</span>
              <h3>{material.name}</h3>
              <div><small>BEST USED FOR</small><strong>{material.use}</strong></div>
              <div><small>DESIGN STRENGTH</small><strong>{material.strength}</strong></div>
              <p><CircleGauge size={15} /> {material.watch}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="sustain-range">
        <div className="sustain-range-head">
          <div><p>03 / SHOP THE RANGE</p><h2 className="clash-display">From shelf to shipper.</h2></div>
          <Link href="/products?category=sustainable">View sustainable catalog <ArrowRight size={16} /></Link>
        </div>
        <div className="sustain-product-grid">
          {PRODUCTS.map((product, index) => (
            <Link href="/configure" key={product.name} className="sustain-product">
              <div className="sustain-product-image">
                <img src={product.image} alt={product.name} loading="lazy" />
                <span>0{index + 1}</span>
              </div>
              <div className="sustain-product-copy">
                <p>{product.note}</p><h3>{product.name}</h3>
                <span>{product.mode}<ArrowRight size={15} /></span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="sustain-docs">
        <div className="sustain-docs-inner">
          <div className="sustain-docs-copy">
            <p>04 / CLAIMS NEED RECEIPTS</p>
            <h2 className="clash-display">Make the claim.<br /><em>Keep the proof.</em></h2>
            <span>Certification and compliance vary by material, converter and finished specification. Packworkz records applicable evidence against the approved order instead of applying one badge to an entire range.</span>
            <Link href="/contact">Discuss compliance needs <ArrowRight size={16} /></Link>
          </div>
          <div className="sustain-doc-grid">
            {DOCUMENTS.map((document, index) => (
              <div key={document.title}>
                <span>0{index + 1}</span><document.Icon size={21} />
                <h3>{document.title}</h3><p>{document.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="sustain-final">
        <div>
          <p><Leaf size={15} /> MATERIAL CHANGE, WITHOUT THE GUESSWORK</p>
          <h2 className="clash-display">Bring the product.<br />We’ll build the brief.</h2>
        </div>
        <div>
          <p>Tell us what you pack, how it travels and what claim matters. We’ll return a shortlist with the performance checks and buying path for each option.</p>
          <div><Link href="/configure"><button className="btn-fill btn-amber px-8 py-4"><span>Start configuration</span><ArrowRight size={17} /></button></Link><Link href="/samples">Order comparison samples</Link></div>
        </div>
      </section>
    </main>
  );
}
