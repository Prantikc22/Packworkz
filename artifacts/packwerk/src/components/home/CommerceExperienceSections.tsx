import { lazy, Suspense, useEffect, useState } from "react";
import { ArrowRight, BellRing, Boxes, Check, CircleDollarSign, ClipboardCheck, Leaf, PackageCheck, PenTool, RefreshCcw, Route, ShieldCheck, ShoppingCart, Sparkles, Truck } from "lucide-react";
import { Link } from "wouter";

const PackagingMockupCanvas = lazy(() => import("@/components/mockup/PackagingMockupCanvas").then((module) => ({ default: module.PackagingMockupCanvas })));

const PROCESS = [
  {
    id: "choose",
    label: "Choose",
    icon: Boxes,
    eyebrow: "01 / Product",
    title: "Start from the shelf, not a blank form.",
    body: "Browse launch-ready packaging with MOQ, quantity pricing and the right buying path already visible.",
    bullets: ["Instant-buy standard formats", "Configurable material and finish", "Production briefs for technical runs"],
  },
  {
    id: "design",
    label: "Design",
    icon: PenTool,
    eyebrow: "02 / Design",
    title: "Make it yours in a live 3D preview.",
    body: "Apply your brand direction before dielines and production samples. Rotate the pack, test color and export a review image.",
    bullets: ["Live packaging preview", "Logo and brand-color upload", "Production-ready artwork handoff"],
  },
  {
    id: "order",
    label: "Order",
    icon: ShoppingCart,
    eyebrow: "03 / Ordering",
    title: "Buy instantly, or request one managed quote.",
    body: "Standard formats show the exact quantity break and checkout path. Rollstock, tooling and regulated packs move to a managed quote with one accountable owner.",
    bullets: ["Only two clear buying paths", "GST and delivery captured once", "Enterprise quantities get a sharper reviewed rate"],
  },
  {
    id: "smartstock",
    label: "SmartStock",
    icon: RefreshCcw,
    eyebrow: "04 / SmartStock",
    title: "Turn every approved pack into an easier repeat order.",
    body: "SmartStock watches consumption, lead time and risk so the next order is prepared before packaging becomes urgent.",
    bullets: ["Earlier stockout signals", "Approved specs stay attached", "Supplier and quantity recommendation"],
  },
];

function ProductVisual() {
  return (
    <div className="pw-process-product-grid">
      {[
        ["/skus/Standup_Pouch.jpg", "Stand-up pouches", "from 500 units"],
        ["/skus/mailerbox.jpg", "Mailer boxes", "from 50 units"],
        ["/skus/plasticbottles.jpg", "Bottles and jars", "from 100 units"],
        ["/skus/compostablepacks.jpg", "Lower-impact packs", "verified options"],
      ].map(([image, title, meta]) => (
        <div key={title}>
          <img src={image} alt={title} />
          <strong>{title}</strong>
          <span>{meta}</span>
        </div>
      ))}
    </div>
  );
}

function SmartStockVisual() {
  return (
    <div className="pw-stock-command">
      <div className="pw-stock-command-head">
        <span><Sparkles size={15} /> SMARTSTOCK AI</span>
        <b><i /> Forecast live</b>
      </div>
      <div className="pw-stock-command-main">
        <div className="pw-stock-signal">
          <small>250 g stand-up pouch</small>
          <strong>28</strong>
          <p>days before projected stockout</p>
          <span><BellRing size={14} /> Reorder window opened early</span>
        </div>
        <div className="pw-stock-chart" aria-label="Animated projected packaging stock curve">
          <div className="pw-stock-chart-head"><span>On-hand inventory</span><b>18,420 units</b></div>
          <svg viewBox="0 0 620 210" preserveAspectRatio="none" role="img">
            <defs><linearGradient id="stock-command-fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#49a3df" stopOpacity=".28"/><stop offset="1" stopColor="#49a3df" stopOpacity="0"/></linearGradient></defs>
            <path className="stock-area" d="M0 28 C85 38 145 52 205 69 S325 96 392 122 S500 158 620 184 L620 210 L0 210 Z" />
            <path className="stock-line" pathLength="1" d="M0 28 C85 38 145 52 205 69 S325 96 392 122 S500 158 620 184" />
            <line className="stock-trigger" x1="392" x2="392" y1="8" y2="205" />
            <circle className="stock-pulse" cx="392" cy="122" r="7" />
            <text x="407" y="105">REORDER TRIGGER</text>
          </svg>
          <div className="pw-stock-axis"><span>Today</span><span>Projected demand · 60 days</span><span>Day 60</span></div>
        </div>
      </div>
      <div className="pw-stock-plan">
        <div><span><Route size={16} /> SUPPLIER ROUTE</span><strong>Ahmedabad Flex</strong><small>2 backups verified</small></div>
        <div><span><PackageCheck size={16} /> RECOMMENDED</span><strong>18,000 units</strong><small>45 days + safety stock</small></div>
        <div><span><CircleDollarSign size={16} /> COST AVOIDED</span><strong>₹1.8L</strong><small>vs emergency sourcing</small></div>
      </div>
      <div className="pw-stock-command-action"><span><Check size={15} /> Approved spec, artwork and GST profile attached</span><button type="button">Review plan <ArrowRight size={16} /></button></div>
    </div>
  );
}

function OrderVisual() {
  const quantities = [
    { qty: 500, unit: 48, saving: 0 },
    { qty: 1000, unit: 39, saving: 19 },
    { qty: 2500, unit: 31, saving: 35 },
  ];
  const [selected, setSelected] = useState(1);
  const [stage, setStage] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => setStage((value) => (value + 1) % 4), 1700);
    return () => window.clearInterval(timer);
  }, []);

  const choice = quantities[selected];
  const total = choice.qty * choice.unit;

  return (
    <div className="pw-order-command">
      <div className="pw-order-command-head"><span>LIVE ORDER / EC-501</span><b><i /> Ready to buy</b></div>
      <div className="pw-order-command-main">
        <div className="pw-order-proof">
          <img src="/skus/mailerbox.jpg" alt="Custom mailer box" />
          <span><Check size={14} /> Artwork proof approved</span>
          <div><small>Custom mailer box</small><strong>9 x 6 x 3 inch</strong><p>Full-colour print · matte finish · kraft board</p></div>
        </div>
        <div className="pw-order-pricing">
          <div className="pw-order-pricing-head"><span>Choose an order quantity</span><small>Price drops as volume grows</small></div>
          <div className="pw-order-price-options">
            {quantities.map((option, index) => (
              <button key={option.qty} type="button" className={selected === index ? "active" : ""} onClick={() => setSelected(index)}>
                <span>{option.qty.toLocaleString("en-IN")}</span><b>₹{option.unit}<small>/unit</small></b>{option.saving > 0 && <em>Save {option.saving}%</em>}
              </button>
            ))}
          </div>
          <div className="pw-order-saving"><span>Quantity-break saving</span><div><i style={{ width: `${choice.saving}%` }} /></div><b>{choice.saving || 0}%</b></div>
          <div className="pw-order-price-total"><span>Total before GST</span><strong>₹{total.toLocaleString("en-IN")}</strong></div>
        </div>
      </div>
      <div className="pw-order-progress" aria-label="Order workflow">
        {["Spec checked", "Artwork approved", "Production booked", "Dispatch tracked"].map((label, index) => (
          <div key={label} className={index <= stage ? "active" : ""}><i>{index < stage ? <Check size={12} /> : index + 1}</i><span>{label}</span></div>
        ))}
      </div>
      <div className="pw-order-command-action"><span><Truck size={15} /> Delivery and GST invoice calculated at checkout</span><button type="button">Continue to checkout <ArrowRight size={16} /></button></div>
    </div>
  );
}

export function PackagingProcessSection() {
  const [active, setActive] = useState(0);
  const item = PROCESS[active];

  useEffect(() => {
    const timer = window.setInterval(() => setActive((value) => (value + 1) % PROCESS.length), 8000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <section className="pw-platform-section">
      <div className="pw-platform-inner">
        <div className="pw-platform-heading">
          <p>THE PACKWORKZ FLOW</p>
          <h2>Making packaging simple.</h2>
          <span>Self-serve where it should be. Packaging expertise where it matters.</span>
        </div>
        <div className="pw-platform-tabs" role="tablist" aria-label="Packworkz process">
          {PROCESS.map((step, index) => {
            const Icon = step.icon;
            return <button key={step.id} type="button" className={active === index ? "active" : ""} onClick={() => setActive(index)}><Icon size={18} /> {step.label}<i /></button>;
          })}
        </div>
        <div className="pw-platform-panel">
          <div className="pw-platform-copy">
            <p>{item.eyebrow}</p>
            <h3>{item.title}</h3>
            <span>{item.body}</span>
            <ul>{item.bullets.map((bullet) => <li key={bullet}><Check size={16} /> {bullet}</li>)}</ul>
            <Link href={item.id === "design" ? "/mockup-studio" : item.id === "smartstock" ? "/smartstock" : item.id === "choose" ? "/products" : "/configure"}>
              {item.id === "design" ? "Open 3D studio" : item.id === "smartstock" ? "See SmartStock" : item.id === "choose" ? "Browse the catalog" : "Start configuration"} <ArrowRight size={17} />
            </Link>
          </div>
          <div className="pw-platform-visual">
            {item.id === "choose" && <ProductVisual />}
            {item.id === "design" && <Suspense fallback={<div className="pw-mockup-loading">Loading 3D preview...</div>}><PackagingMockupCanvas format="mailer" color="#0F4C5C" brandName="Northstar" finish="matte" autoRotate /></Suspense>}
            {item.id === "order" && <OrderVisual />}
            {item.id === "smartstock" && <SmartStockVisual />}
          </div>
        </div>
      </div>
    </section>
  );
}

const SUSTAINABILITY_ITEMS = [
  { image: "/skus/recycledbox.jpg", icon: ClipboardCheck, title: "Material transparency", body: "See the structure, recycled-content option and evidence needed before an environmental claim reaches your artwork." },
  { image: "/skus/kraftpaperpacks.jpg", icon: ShieldCheck, title: "Responsible sourcing", body: "Route paper, fibre and compostable products through suppliers that can provide the relevant certificates and declarations." },
  { image: "/skus/compostablepacks.jpg", icon: PackageCheck, title: "Right-size decisions", body: "Compare dimensions, material weight and protection needs before paying to ship unnecessary air or over-engineered layers." },
  { image: "/images/sustainable-bg.webp", icon: Leaf, title: "End-of-life guidance", body: "Give customers clear disposal language based on the actual pack structure, local collection reality and verified certification." },
];

export function SustainabilityProofSection() {
  return (
    <section id="sustainability" className="pw-sustainability-proof">
      <div className="pw-sustainability-heading">
        <p>BETTER PACKAGING, WITH PROOF</p>
        <h2>Sustainability should survive scrutiny.</h2>
        <span>Lower-impact choices are useful only when the material, supplier evidence and customer claim all agree.</span>
      </div>
      <div className="pw-sustainability-grid">
        {SUSTAINABILITY_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <article key={item.title}>
              <div className="pw-sustainability-image"><img src={item.image} alt="" /><span><Icon size={18} /> Verified path</span></div>
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </article>
          );
        })}
      </div>
      <div className="pw-sustainability-actions">
        <Link href="/sustainable" className="btn-fill btn-navy">Explore lower-impact packaging <ArrowRight size={17} /></Link>
        <span>No blanket “eco” claims. Evidence is matched to the exact material and supplier.</span>
      </div>
    </section>
  );
}
