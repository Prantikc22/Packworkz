import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import { ArrowRight, CheckCircle2, GitBranch, MessageCircle, Search, ShieldCheck, Truck, X } from "lucide-react";
import { CATALOG_SKUS } from "@/lib/catalog";
import { Marquee, SplitHeadline } from "@/components/marketing/motion";
import "./premium-pages.css";

const WHATSAPP_NUM = "918208990366";

const STEPS = [
  {
    Icon: Search,
    short: "Configure",
    title: "Configure and price",
    image: "/images/flow-packaging-still-life-v2.webp",
    intro: "Browse the catalogue or describe what you need. No sales call is required for standard formats.",
    substeps: [
      { title: "Browse or describe", detail: "Find your SKU in the catalogue or tell us what you need — we'll source it." },
      { title: "Configure your spec", detail: "Select material, dimensions, print type and quantity. The price estimate updates as you configure." },
      { title: "Submit in under 5 minutes", detail: "Every request is reviewed manually, with a response within 48 hours." },
      { title: "Receive an itemised pricing plan", detail: "Pricing, timeline and payment terms broken down. You approve before anything starts." },
    ],
  },
  {
    Icon: GitBranch,
    short: "Source",
    title: "We source and match",
    image: "/images/enterprise-production-line-v1.webp",
    intro: "Once you approve the plan, PackOS matches the specification to the best eligible route and plans alternate capacity where compatibility allows.",
    substeps: [
      { title: "SmartMatch factory selection", detail: "PackOS matches your spec to the most suitable factory in our verified network." },
      { title: "Alternate routes assessed", detail: "Compatible factories are checked against the approved material, tooling and print spec before a backup route is recorded." },
      { title: "Pre-production sample", detail: "A physical sample is produced and sent to you before bulk production begins." },
      { title: "You approve before the bulk run", detail: "No bulk production starts without your sign-off on the sample." },
    ],
  },
  {
    Icon: ShieldCheck,
    short: "Quality",
    title: "QC at every stage",
    image: "/images/sustainability-material-layers-v1.webp",
    intro: "Quality isn't your vendor's job. It's ours. Three checkpoints on every order before anything leaves the factory.",
    substeps: [
      { title: "Pre-production approval", detail: "Colour, dimensions, material and print quality confirmed against spec on your approved sample." },
      { title: "In-process inspection", detail: "For orders above ₹2L, our QC team checks mid-production batches so issues are caught before they scale." },
      { title: "Pre-dispatch photo check", detail: "Every order. Photo evidence is uploaded to your dashboard before dispatch." },
      { title: "You see everything", detail: "Photos, batch records and QC sign-off documents live in your dashboard. No surprises." },
    ],
  },
  {
    Icon: Truck,
    short: "Deliver",
    title: "Delivered and tracked",
    image: "/images/enterprise-packaging-hero-v1.webp",
    intro: "Factory pickup, interstate freight, export documentation and last-mile delivery. One team. One tracking link.",
    substeps: [
      { title: "Factory pickup coordinated", detail: "We arrange collection directly from the factory. You don't coordinate with anyone." },
      { title: "Real-time tracking", detail: "A live tracking link in your dashboard from dispatch, updated at every milestone." },
      { title: "Export documentation handled", detail: "Shipping bill, certificate of origin, packing list and customs docs managed for international orders." },
      { title: "Delivered and confirmed", detail: "Delivery confirmation and invoice in your dashboard. Reorder in one click." },
    ],
  },
];

const OLD_WAY = ["Chasing five vendors on WhatsApp", "Quotes that change after approval", "Quality checked after it arrives", "No backup when a factory slips"];
const NEW_WAY = ["One team accountable end to end", "Itemised plan approved before production", "QC documented before dispatch", "Alternate routes planned in advance"];

const FAQS = [
  { q: "What is the minimum order quantity?", a: "MOQ varies by production method. Standard rigid boxes can start at 100 units, many bottles and jars at 200, pouches at 500–1,000, and rollstock at 100kg. Every product page shows its current starting quantity; samples remain available for pre-production evaluation." },
  { q: "How does the 48-hour pricing plan work?", a: "After you submit a configuration request, our team reviews your spec manually, sources competing pricing from our vendor network, and sends an itemised pricing plan within 48 business hours. A real person handles every request." },
  { q: "What payment terms apply?", a: "Payment milestones are set out in the commercial proposal before approval. They can vary with tooling, samples, production method, account history and order value. No credit term or discount applies unless it is written into the approved proposal." },
  { q: "Do you handle export orders?", a: "Export suitability is reviewed against the destination, packaging format, material and required document set. Packworkz coordinates the shipping and supplier documents confirmed in the approved order scope; certifications are verified for the selected factory and specification." },
  { q: "What happens if my order has a quality issue?", a: "We own the quality outcome. If goods fail to meet the approved sample standard, we replace at no cost. If something gets through, raise a ticket in your dashboard and our team responds within 24 hours." },
  { q: "Can I order packaging design separately?", a: "Yes. The selected design package, deliverables, revision scope and any production credit are shown before payment, so there is no assumption about what is included." },
];

function Process() {
  const [active, setActive] = useState(0);
  const stepRefs = useRef<Array<HTMLElement | null>>([]);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) setActive(Number((entry.target as HTMLElement).dataset.index));
      });
    }, { rootMargin: "-45% 0px -45% 0px" });
    stepRefs.current.forEach((node) => node && observer.observe(node));
    return () => observer.disconnect();
  }, []);

  const jumpTo = (index: number) => stepRefs.current[index]?.scrollIntoView({ behavior: "smooth", block: "center" });

  return (
    <div className="pw-p-process">
      <div className="pw-p-process-sticky">
        <p className="pw-p-eyebrow">The process</p>
        <h2 className="pw-p-h2">Four stages. <em>Zero ambiguity.</em></h2>
        <nav className="pw-p-process-nav" aria-label="Process stages">
          {STEPS.map((step, index) => (
            <button key={step.short} type="button" className={active === index ? "is-active" : ""} onClick={() => jumpTo(index)} aria-current={active === index ? "step" : undefined}>
              <b>0{index + 1}</b><span>{step.short}</span><i />
            </button>
          ))}
        </nav>
        <div className="pw-p-process-visual" aria-hidden="true">
          {STEPS.map((step, index) => <img key={step.image} src={step.image} alt="" loading="lazy" className={active === index ? "is-active" : ""} />)}
          <span>Stage 0{active + 1} · {STEPS[active].short}</span>
        </div>
      </div>
      <div className="pw-p-process-steps">
        {STEPS.map(({ Icon, title, intro, substeps }, index) => (
          <article key={title} data-index={index} ref={(node) => { stepRefs.current[index] = node; }} className={`pw-p-step${active === index ? " is-active" : ""}`}>
            <div className="pw-p-step-head"><span className="pw-p-card-icon"><Icon size={22} /></span><small>STEP 0{index + 1}</small></div>
            <h3>{title}</h3>
            <p>{intro}</p>
            <ul>{substeps.map((sub) => <li key={sub.title}><CheckCircle2 size={18} /><div><b>{sub.title}</b><span>{sub.detail}</span></div></li>)}</ul>
          </article>
        ))}
      </div>
    </div>
  );
}

export default function HowItWorks() {
  return (
    <main className="pw-p">
      {/* ── HERO ── */}
      <section className="pw-p-hero is-light" aria-labelledby="how-title" style={{ minHeight: "min(760px, 100svh)" }}>
        <div className="pw-p-hero-grid" aria-hidden="true" />
        <div className="pw-p-hero-inner">
          <div className="pw-p-hero-copy" style={{ maxWidth: 1040 }}>
            <p className="pw-p-eyebrow pw-p-hero-fade" style={{ ["--d" as string]: "0ms" }}>How Packworkz works</p>
            <SplitHeadline id="how-title" lines={["Source custom packaging.", "*Never chase a vendor again."]} />
            <p className="pw-p-hero-sub pw-p-hero-fade" style={{ ["--d" as string]: "550ms" }}>Four stages, one team responsible for all of it — from the first spec to the delivered carton.</p>
            <div className="pw-p-actions pw-p-hero-fade" style={{ ["--d" as string]: "700ms" }}>
              <Link className="pw-p-btn is-navy" href="/configure">Get a pricing plan <ArrowRight size={18} /></Link>
              <Link className="pw-p-btn is-line" href="/samples">Order a sample kit</Link>
            </div>
          </div>
          <div className="pw-p-hero-foot pw-p-hero-fade" style={{ ["--d" as string]: "900ms", borderColor: "#dde3e9" }}>
            {STEPS.map((step, index) => (
              <div key={step.short} style={{ borderColor: "#dde3e9" }}>
                <b style={{ fontSize: "clamp(1.4rem,2vw,2rem)", display: "flex", alignItems: "center", gap: 12 }}><step.Icon size={22} color="#245e92" /> {step.short}</b>
                <small style={{ color: "#5c6d7e" }}>Stage 0{index + 1}</small>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="pw-p-ticker is-dark">
        <Marquee speed={40}>{["Configure online", "Itemised pricing plan", "Sample before bulk", "Three QC checkpoints", "Photo proof before dispatch", "One tracking link", "One-click reorders"].map((item) => <span className="pw-p-ticker-item" key={item}>{item}</span>)}</Marquee>
      </div>

      {/* ── PROCESS ── */}
      <section className="pw-p-section">
        <div className="pw-p-wrap"><Process /></div>
      </section>

      {/* ── OLD VS NEW ── */}
      <section className="pw-p-section pw-p-dark">
        <div className="pw-p-wrap">
          <div className="pw-p-head-row">
            <div><p className="pw-p-eyebrow pw-reveal">Why it matters</p><h2 className="pw-p-h2 pw-reveal pw-d1">The old way vs. <em>the Packworkz way.</em></h2></div>
          </div>
          <div className="pw-p-card-grid is-2">
            <div className="pw-p-card pw-reveal pw-d1">
              <small style={{ color: "rgba(226,235,244,.5)", fontSize: 11, fontWeight: 900, letterSpacing: ".18em" }}>TRADITIONAL SOURCING</small>
              <ul style={{ listStyle: "none", padding: 0, margin: "12px 0 0", display: "grid", gap: 18 }}>
                {OLD_WAY.map((item) => <li key={item} style={{ display: "flex", gap: 14, alignItems: "center", color: "rgba(226,235,244,.55)", fontSize: 17, textDecoration: "line-through", textDecorationColor: "rgba(226,235,244,.25)" }}><X size={18} color="#e76f6f" style={{ flex: "none" }} />{item}</li>)}
              </ul>
            </div>
            <div className="pw-p-card pw-reveal pw-d2" style={{ background: "#12283f" }}>
              <small style={{ color: "#f2b134", fontSize: 11, fontWeight: 900, letterSpacing: ".18em" }}>WITH PACKWORKZ</small>
              <ul style={{ listStyle: "none", padding: 0, margin: "12px 0 0", display: "grid", gap: 18 }}>
                {NEW_WAY.map((item) => <li key={item} style={{ display: "flex", gap: 14, alignItems: "center", color: "#fff", fontSize: 17, fontWeight: 700 }}><CheckCircle2 size={18} color="#f2b134" style={{ flex: "none" }} />{item}</li>)}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="pw-p-section pw-p-cream">
        <div className="pw-p-wrap pw-p-faq">
          <div>
            <p className="pw-p-eyebrow pw-reveal">Common questions</p>
            <h2 className="pw-p-h2 pw-reveal pw-d1">Straight answers <em>before you start.</em></h2>
            <p className="pw-p-lead pw-reveal pw-d2">Still unsure? Our team replies on WhatsApp from 9 AM to 7 PM IST, Monday to Saturday.</p>
            <div className="pw-p-actions pw-reveal pw-d3"><a className="pw-p-link" href={`https://wa.me/${WHATSAPP_NUM}`} target="_blank" rel="noopener noreferrer"><MessageCircle size={17} /> Ask on WhatsApp</a></div>
          </div>
          <div>{FAQS.map((faq) => <details key={faq.q} className="pw-reveal"><summary>{faq.q}<i aria-hidden="true" /></summary><p>{faq.a}</p></details>)}</div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="pw-p-final">
        <p className="pw-p-eyebrow pw-reveal" style={{ justifyContent: "center" }}>Ready to start</p>
        <h2 className="pw-reveal pw-d1">Ready to place <em>your first order?</em></h2>
        <p className="pw-reveal pw-d2">Browse {CATALOG_SKUS.length} packaging product families or speak to our team today.</p>
        <div className="pw-p-actions pw-reveal pw-d3">
          <Link className="pw-p-btn is-amber" href="/configure">Get a pricing plan <ArrowRight size={18} /></Link>
          <a className="pw-p-btn is-ghost" href={`https://wa.me/${WHATSAPP_NUM}?text=Hi%20Packworkz%2C%20I%27d%20like%20to%20discuss%20packaging.`} target="_blank" rel="noopener noreferrer">WhatsApp us</a>
        </div>
      </section>
    </main>
  );
}
