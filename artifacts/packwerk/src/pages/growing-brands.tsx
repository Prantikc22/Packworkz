import { useEffect } from "react";
import { Link } from "wouter";
import {
  ArrowRight, CheckCircle2, ClipboardList, Gem, Headphones, Package,
  PackageCheck, PenLine, ShoppingBag, Truck, Upload,
} from "lucide-react";
import { CATALOG_SKUS, getCatalogImage } from "@/lib/catalog";
import { trackMarketingEvent } from "@/lib/analytics";
import "./marketing-redesign.css";

const INDUSTRIES = [
  { name: "Food & Beverage", href: "/industries/food", image: "/industries/food.webp", event: "food-beverage" },
  { name: "Coffee & Tea", href: "/products?industry=food-beverage", image: "/skus/flatbottompouch.jpg", event: "food-beverage" },
  { name: "Beauty & Cosmetics", href: "/industries/beauty", image: "/industries/beauty.webp", event: "beauty" },
  { name: "Pharma & Healthcare", href: "/industries/pharma", image: "/industries/pharma.webp", event: "pharma" },
  { name: "E-commerce", href: "/industries/d2c", image: "/industries/ecommerce.webp", event: "d2c" },
  { name: "Industrial", href: "/products?category=protective", image: "/industries/industrial.webp", event: "industrial" },
];

const FORMATS = [
  { code: "FP-101", name: "Stand-up Pouch", use: "Food, snacks, powders & more" },
  { code: "EC-501", name: "Mailer Box", use: "E-commerce & D2C" },
  { code: "LC-816", name: "Round Labels", use: "Bottles, jars & packaging" },
  { code: "BX-401", name: "Folding Carton", use: "Retail & consumer goods" },
  { code: "BC-201", name: "Bottles & Jars", use: "Liquids, supplements & more" },
  { code: "LC-810", name: "Tissue & Wrapping", use: "A premium unboxing experience" },
].map((item) => ({ ...item, sku: CATALOG_SKUS.find((sku) => sku.code === item.code) })).filter((item) => Boolean(item.sku));

const FAQS = [
  ["What is the minimum order quantity (MOQ)?", "It depends on the format and production route. Some eligible labels start at 25 units and selected boxes start at 50. The minimum for each product is shown on its product page."],
  ["Can I customize my packaging with my own design?", "Yes. Bring your artwork or use design support. We check print-ready files against the chosen format before production."],
  ["Can Packworkz help with packaging design?", "Yes. You can add design support during configuration or discuss your requirements with our team."],
  ["How long does production take?", "Lead time varies with the format, quantity, printing method and artwork approval. We confirm the schedule before production begins."],
  ["Can I reorder the same design later?", "Yes. Approved specifications and artwork remain attached to your order record to make repeat ordering easier."],
  ["Can I start small and scale in the future?", "Yes. Start with a suitable low-quantity format, then move into repeat orders and managed sourcing as your volumes grow."],
] as const;

export default function GrowingBrands() {
  useEffect(() => trackMarketingEvent("growing_brand_page_view"), []);

  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "BreadcrumbList", itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: "https://packworkz.com/" },
        { "@type": "ListItem", position: 2, name: "Growing Brands", item: "https://packworkz.com/solutions/growing-brands" },
      ] },
      { "@type": "FAQPage", mainEntity: FAQS.map(([name, text]) => ({ "@type": "Question", name, acceptedAnswer: { "@type": "Answer", text } })) },
    ],
  };

  return (
    <main className="pw-grow pw-marketing">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

      <section className="pw-grow-hero" aria-labelledby="growing-title">
        <img src="/images/growing-brands-hero-v1.webp" alt="Consumer packaging pouch, mailer box, carton, jar and label roll on a dark studio table" fetchPriority="high" />
        <div className="pw-marketing-container pw-grow-hero-inner">
          <div className="pw-grow-hero-copy">
            <p className="pw-marketing-eyebrow">PACKAGING FOR GROWING BRANDS</p>
            <h1 id="growing-title">Launch packaging<br />that makes your<br /><em>brand look bigger.</em></h1>
            <p>Premium packaging, lower MOQs and end-to-end support for startups, D2C brands and growing businesses.</p>
            <div className="pw-marketing-actions">
              <Link className="pw-marketing-button is-amber" href="/products" onClick={() => trackMarketingEvent("product_clicked", { placement: "growing_hero" })}>Shop Packaging <ArrowRight size={18} /></Link>
              <Link className="pw-marketing-button is-outline-light" href="/samples">Get a Sample Kit</Link>
            </div>
          </div>
          <div className="pw-grow-trust" aria-label="Growing brand support">
            <span><Package size={22} /><b>Lower MOQs</b><small>Start small</small></span>
            <span><Gem size={22} /><b>Premium quality</b><small>At competitive prices</small></span>
            <span><Headphones size={22} /><b>End-to-end support</b><small>From design to delivery</small></span>
          </div>
        </div>
      </section>

      <section className="pw-marketing-section pw-grow-industries">
        <div className="pw-marketing-container">
          <div className="pw-marketing-heading-row"><div><p className="pw-marketing-eyebrow">FIND PACKAGING BY INDUSTRY</p><h2>What are you building?</h2></div><Link className="pw-marketing-text-link" href="/industries">View all industries <ArrowRight size={17} /></Link></div>
          <div className="pw-marketing-image-grid">{INDUSTRIES.map((item) => <Link key={item.name} href={item.href} onClick={() => trackMarketingEvent("category_selected", { category: item.event })}><img src={item.image} alt={`${item.name} packaging examples`} loading="lazy" /><span>{item.name}<ArrowRight size={17} /></span></Link>)}</div>
        </div>
      </section>

      <section className="pw-marketing-section pw-grow-formats">
        <div className="pw-marketing-container">
          <div className="pw-marketing-heading-row"><div><p className="pw-marketing-eyebrow">POPULAR PACKAGING FORMATS</p><h2>Start with proven formats.</h2></div><Link className="pw-marketing-text-link" href="/products">View all packaging <ArrowRight size={17} /></Link></div>
          <div className="pw-grow-formats-grid">{FORMATS.map(({ code, name, use, sku }) => <Link key={code} href={`/products/${sku!.slug}`} onClick={() => trackMarketingEvent("product_clicked", { sku: code, placement: "growing_formats" })}><img src={getCatalogImage(sku!)} alt={`${name} packaging example`} loading="lazy" /><span><b>{name}</b><small>{use}</small><ArrowRight size={18} /></span></Link>)}</div>
        </div>
      </section>

      <section className="pw-marketing-section pw-grow-preview">
        <div className="pw-marketing-container pw-grow-preview-grid">
          <div><p className="pw-marketing-eyebrow">SEE IT BEFORE YOU PRODUCE</p><h2>Your product is ready.<br />Make the packaging feel ready too.</h2><p className="pw-marketing-body">Visualise your packaging in 3D, explore different materials and finishes, and get production-ready artwork before you place an order.</p><Link className="pw-marketing-button is-navy" href="/mockup-studio" onClick={() => trackMarketingEvent("configurator_started", { tool: "mockup_studio" })}>Try 3D Preview <ArrowRight size={18} /></Link></div>
          <div className="pw-grow-editor" aria-label="Illustrative packaging preview interface">
            <div className="pw-grow-editor-head"><strong>Packworkz Studio</strong><span>Packaging preview</span></div>
            <div className="pw-grow-editor-body"><div className="pw-grow-editor-art"><img src="/skus/Standup_Pouch.jpg" alt="Stand-up pouch shown in the packaging preview" loading="lazy" /></div><div className="pw-grow-editor-controls"><b>Make it yours</b><span>Format <strong>Stand-up pouch</strong></span><span>Material <strong>Kraft laminate</strong></span><span>Finish <strong>Matte</strong></span><div>Upload artwork <Upload size={15} /></div></div></div>
          </div>
        </div>
      </section>

      <section className="pw-marketing-section pw-grow-steps">
        <div className="pw-marketing-container"><p className="pw-marketing-eyebrow">HOW IT WORKS</p><h2>From idea to delivered packaging.</h2><div className="pw-grow-steps-grid">{[
          [ClipboardList, "Choose", "Select your format, size and material."],
          [PenLine, "Customize", "Add your design or get design support."],
          [CheckCircle2, "Approve", "Review your specification and confirm."],
          [PackageCheck, "Produce & Deliver", "We manufacture and deliver to your doorstep."],
        ].map(([Icon, title, text], index) => { const Symbol = Icon as typeof ClipboardList; return <article key={String(title)}><Symbol size={30} /><strong>{index + 1}. {String(title)}</strong><p>{String(text)}</p></article>; })}</div></div>
      </section>

      <section className="pw-marketing-section pw-grow-scale">
        <div className="pw-marketing-container pw-grow-scale-grid"><div><p className="pw-marketing-eyebrow">BUILT FOR EVERY STAGE</p><h2>Your first 50 packs.<br />Your next 5 million.</h2><p className="pw-marketing-body">The same packaging partner, from launch to scale.</p></div><div className="pw-grow-scale-stages">{[
          ["Launch", "50–500 packs", "/skus/Standup_Pouch.jpg"],
          ["Repeat", "500–5,000 packs", "/skus/mailerbox.jpg"],
          ["Scale", "5,000–50,000+", "/skus/corrugatedbox.jpg"],
          ["Managed Packaging", "Ongoing supply", "/categories/boxes-cartons-v2.png"],
        ].map(([title, quantity, image], index) => <article key={title}><span><b>{title}</b><small>{quantity}</small></span><img src={image} alt={`${title} stage packaging`} loading="lazy" />{index < 3 && <ArrowRight className="pw-grow-stage-arrow" size={19} />}</article>)}</div></div>
      </section>

      <section className="pw-grow-help"><div className="pw-marketing-container"><span><Headphones size={27} /></span><div><h2>Not sure what packaging you need?</h2><p>Tell us about your product and our packaging experts will recommend the right solution.</p></div><Link className="pw-marketing-button is-navy" href="/contact">Talk to a packaging expert <ArrowRight size={18} /></Link></div></section>

      <section className="pw-marketing-section pw-marketing-faq pw-grow-faq"><div className="pw-marketing-container pw-marketing-faq-grid"><div><p className="pw-marketing-eyebrow">COMMON QUESTIONS</p><h2>Straight answers before you order.</h2></div><div>{FAQS.map(([question, answer]) => <details key={question}><summary>{question}<span aria-hidden="true">+</span></summary><p>{answer}</p></details>)}</div></div></section>

      <section className="pw-grow-final"><div className="pw-marketing-container"><p className="pw-marketing-eyebrow">READY TO LAUNCH?</p><h2>Start your packaging journey today.</h2><p>Premium packaging, lower MOQs and a partner you can grow with.</p><div className="pw-marketing-actions"><Link className="pw-marketing-button is-amber" href="/products">Shop Packaging <ArrowRight size={18} /></Link><Link className="pw-marketing-button is-outline-light" href="/contact">Talk to our team</Link></div></div></section>

      <div className="pw-grow-mobile-cta"><Link href="/products"><ShoppingBag size={18} /> Shop Packaging</Link><Link href="/samples">Get a Sample Kit</Link></div>
    </main>
  );
}
