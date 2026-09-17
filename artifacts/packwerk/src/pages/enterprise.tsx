import { useEffect, useState, type FormEvent } from "react";
import { Link } from "wouter";
import {
  ArrowRight, Box, Boxes, CalendarDays, Check, CheckCircle2, ClipboardCheck,
  Factory, FileCheck2, GitBranch, Globe2, Package, Search, ShieldCheck,
  Timer, Truck,
} from "lucide-react";
import { trackMarketingEvent } from "@/lib/analytics";
import "./marketing-redesign.css";

const INDUSTRIES = [
  { name: "Food & Beverage", href: "/industries/food", image: "/industries/food.webp" },
  { name: "FMCG", href: "/industries/fmcg", image: "/industries/fmcg.webp" },
  { name: "Beauty & Cosmetics", href: "/industries/beauty", image: "/industries/beauty.webp" },
  { name: "Pharma & Healthcare", href: "/industries/pharma", image: "/industries/pharma.webp" },
  { name: "E-commerce", href: "/industries/d2c", image: "/industries/ecommerce.webp" },
  { name: "Industrial", href: "/products?category=protective", image: "/industries/industrial.webp" },
];

const CAPABILITIES = [
  { Icon: Box, title: "Source", text: "Access a qualified, multi-vendor supplier network across packaging categories." },
  { Icon: ShieldCheck, title: "Control", text: "Pre-production, in-process and pre-dispatch quality checks with documentation." },
  { Icon: GitBranch, title: "Protect", text: "Backup sourcing and contingency planning to reduce supply risk." },
  { Icon: Truck, title: "Deliver", text: "Managed logistics, one order record and worldwide delivery coordination." },
];

const COMPARISON = [
  ["Multi-category sourcing", "Usually one category", "Coordinated across categories"],
  ["Backup production", "Own capacity only", "Alternative routes assessed"],
  ["QC documentation", "Factory process", "Managed against the approved spec"],
  ["One order record", "Per factory", "One managed workflow"],
  ["Cross-category procurement", "Separate suppliers", "One accountable partner"],
  ["Global delivery coordination", "Often limited", "Coordinated to destination"],
] as const;

const FAQS = [
  ["Does Packworkz replace our existing suppliers?", "No wholesale change is needed to begin. We can benchmark one current specification and evaluate where a managed route adds value."],
  ["Can we begin with one SKU?", "Yes. One approved specification and its current commercial or operational challenge are enough for an initial benchmark."],
  ["Can Packworkz manage multiple packaging categories?", "Yes. We coordinate flexible packaging, cartons, labels, containers and secondary packaging through managed sourcing routes."],
  ["How does backup sourcing work?", "We assess alternate suppliers against the same specification. A backup route is only proposed when material, tooling, compliance and approvals make it viable."],
  ["How does Packworkz ensure quality control?", "Checks are agreed against the approved specification and can include pre-production, in-process and pre-dispatch verification."],
  ["What information do you need to get started?", "Share a packaging format, current quantity or monthly volume, any existing specification or quotation, and the issue you want to improve."],
] as const;

type BenchmarkForm = {
  name: string;
  company: string;
  email: string;
  phone: string;
  format: string;
  volume: string;
  supplier: string;
  price: string;
  notes: string;
};

const initialForm: BenchmarkForm = {
  name: "", company: "", email: "", phone: "", format: "", volume: "",
  supplier: "", price: "", notes: "",
};

export default function Enterprise() {
  const [form, setForm] = useState<BenchmarkForm>(initialForm);
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [reference, setReference] = useState("");
  const [error, setError] = useState("");

  useEffect(() => trackMarketingEvent("enterprise_page_view"), []);

  const update = (key: keyof BenchmarkForm, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const submitBenchmark = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!event.currentTarget.reportValidity() || state === "sending") return;
    setState("sending");
    setError("");
    try {
      const message = [
        `Packaging format: ${form.format}`,
        `Monthly volume: ${form.volume}`,
        `Current supplier: ${form.supplier || "Not provided"}`,
        `Current unit price: ${form.price || "Not provided"}`,
        `Additional notes: ${form.notes || "Not provided"}`,
      ].join("\n");
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source: "enterprise_benchmark",
          name: form.name,
          company: form.company,
          email: form.email,
          phone: form.phone,
          subject: "Enterprise packaging SKU benchmark",
          message,
          metadata: form,
        }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "We could not save your benchmark request.");
      setReference(result.inquiry_id || "");
      setState("sent");
      trackMarketingEvent("benchmark_submitted", { category: form.format, reference: result.inquiry_id || "saved" });
      trackMarketingEvent("enterprise_contact_submitted", { route: "benchmark" });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "We could not save your benchmark request. Please try again.");
      setState("error");
    }
  };

  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "BreadcrumbList", itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: "https://packworkz.com/" },
        { "@type": "ListItem", position: 2, name: "Enterprise", item: "https://packworkz.com/enterprise" },
      ] },
      { "@type": "FAQPage", mainEntity: FAQS.map(([name, text]) => ({ "@type": "Question", name, acceptedAnswer: { "@type": "Answer", text } })) },
    ],
  };

  return (
    <main className="pw-ent pw-marketing">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

      <section className="pw-ent-hero" aria-labelledby="enterprise-title">
        <img className="pw-ent-hero-photo" src="/images/enterprise-packaging-hero-v1.webp" alt="Pouches, cartons, bottles, jars and label rolls arranged on an industrial packaging table" fetchPriority="high" />
        <div className="pw-marketing-container pw-ent-hero-inner">
          <div className="pw-ent-hero-copy">
            <p className="pw-marketing-eyebrow">ENTERPRISE PACKAGING PROCUREMENT</p>
            <h1 id="enterprise-title">Packaging procurement,<br /><em>without the vendor chaos.</em></h1>
            <p>One operating layer for sourcing, production, quality control and delivery across packaging categories.</p>
            <div className="pw-marketing-actions">
              <a className="pw-marketing-button is-amber" href="#benchmark" onClick={() => trackMarketingEvent("benchmark_started", { placement: "enterprise_hero" })}>Benchmark one SKU <ArrowRight size={18} /></a>
              <Link className="pw-marketing-button is-outline-light" href="/contact" onClick={() => trackMarketingEvent("enterprise_contact_started", { placement: "hero" })}>Talk to packaging expert</Link>
            </div>
          </div>
          <div className="pw-ent-status" aria-label="Illustrative procurement workflow">
            <div className="pw-ent-status-head"><strong>Procurement overview</strong><span><i /> Workflow</span></div>
            <div><span>Active SKUs</span><b>Approved specifications</b></div>
            <div><span>Suppliers</span><b>Primary + backup routes</b></div>
            <div><span>Production / QC</span><b>Tracked checkpoints</b></div>
            <div><span>Delivery</span><b>Dispatch milestones</b></div>
            <small>Illustrative operating view</small>
          </div>
        </div>
        <div className="pw-marketing-container pw-ent-trust" aria-label="Packworkz enterprise strengths">
          {[
            [CalendarDays, "33+ years", "manufacturing heritage"],
            [GitBranch, "Managed", "supplier network"],
            [Boxes, "Multi-category", "sourcing"],
            [Globe2, "Worldwide", "delivery"],
          ].map(([Icon, title, text]) => { const Symbol = Icon as typeof CalendarDays; return <div key={String(title)}><Symbol size={22} /><span><b>{String(title)}</b><small>{String(text)}</small></span></div>; })}
        </div>
      </section>

      <section className="pw-marketing-section pw-ent-spec" id="how-enterprise-works">
        <div className="pw-marketing-container pw-ent-spec-grid">
          <div>
            <p className="pw-marketing-eyebrow">SIMPLER PROCUREMENT. GREATER RESILIENCE.</p>
            <h2>One specification.<br />Multiple production routes.</h2>
            <p className="pw-marketing-body">You shouldn’t have to rebuild your specification for every vendor. We take one approved specification and unlock multiple production routes, with qualified suppliers, quality control and delivery managed through one accountable workflow.</p>
            <a className="pw-marketing-text-link" href="#capabilities">See how it works <ArrowRight size={17} /></a>
          </div>
          <div className="pw-ent-flow" aria-label="Approved specification moves through supplier routes, quality control and delivery">
            <div className="pw-ent-flow-spec"><FileCheck2 size={25} /><strong>Approved specification</strong><small>Material · Print · Quality</small></div>
            <div className="pw-ent-flow-routes">
              <div><Factory size={19} /><span><b>Supplier A</b><small>Primary route</small></span></div>
              <div><Factory size={19} /><span><b>Supplier B</b><small>Secondary route</small></span></div>
              <div><GitBranch size={19} /><span><b>Backup supplier</b><small>Contingency</small></span></div>
            </div>
            <div className="pw-ent-flow-end"><span><ClipboardCheck size={22} /><b>QC record</b><small>At every stage</small></span><span><Truck size={22} /><b>Delivery</b><small>On time, worldwide</small></span></div>
          </div>
        </div>
      </section>

      <section className="pw-marketing-section pw-ent-benchmark" id="benchmark" aria-labelledby="benchmark-title">
        <div className="pw-marketing-container pw-ent-benchmark-grid">
          <div className="pw-ent-benchmark-copy">
            <p className="pw-marketing-eyebrow">BENCHMARK YOUR PACKAGING</p>
            <h2 id="benchmark-title">Give us one packaging SKU.<br />We’ll show you the better route.</h2>
            <p className="pw-marketing-body">We’ll benchmark your current packaging, explore alternative sourcing options, compare lead times and production routes, and share transparent commercials.</p>
            <div className="pw-ent-benefits">
              <span><Search size={19} /> Better sourcing options</span>
              <span><Timer size={19} /> Realistic lead times</span>
              <span><CheckCircle2 size={19} /> Transparent commercials</span>
            </div>
            <img src="/images/sample-kit-hero-v1.webp" alt="Packaging formats and material swatches laid out for comparison" loading="lazy" />
          </div>
          {state === "sent" ? (
            <div className="pw-ent-benchmark-success" role="status"><CheckCircle2 size={44} /><p className="pw-marketing-eyebrow">REQUEST RECEIVED</p><h3>Your SKU benchmark is on its way.</h3><p>Our team has your packaging details and will follow up with the next steps.</p>{reference && <strong>Reference: {reference}</strong>}</div>
          ) : (
            <form className="pw-ent-form" onSubmit={submitBenchmark}>
              <h3>Request a benchmarking analysis</h3>
              <div className="pw-ent-form-fields">
                <label>Full name *<input name="name" autoComplete="name" required value={form.name} onChange={(event) => update("name", event.target.value)} placeholder="Your name" /></label>
                <label>Company name *<input name="company" autoComplete="organization" required value={form.company} onChange={(event) => update("company", event.target.value)} placeholder="Your company" /></label>
                <label>Work email *<input name="email" type="email" autoComplete="email" required value={form.email} onChange={(event) => update("email", event.target.value)} placeholder="you@company.com" /></label>
                <label>Phone number *<input name="phone" type="tel" autoComplete="tel" inputMode="tel" required value={form.phone} onChange={(event) => update("phone", event.target.value)} placeholder="+91 98765 43210" /></label>
                <label>Packaging format *<select name="format" required value={form.format} onChange={(event) => update("format", event.target.value)}><option value="">Select format</option><option>Flexible packaging</option><option>Boxes & cartons</option><option>Bottles & containers</option><option>Labels & sleeves</option><option>Foodservice</option><option>Multiple categories</option><option>Other</option></select></label>
                <label>Monthly volume (units) *<input name="volume" type="number" min="1" inputMode="numeric" required value={form.volume} onChange={(event) => update("volume", event.target.value)} placeholder="Select volume" /></label>
                <label>Current supplier (optional)<input name="supplier" value={form.supplier} onChange={(event) => update("supplier", event.target.value)} placeholder="Supplier name" /></label>
                <label>Current price (optional)<input name="price" value={form.price} onChange={(event) => update("price", event.target.value)} placeholder="Price per unit (INR/USD)" /></label>
                <label className="pw-ent-form-wide">Additional notes<textarea name="notes" rows={3} value={form.notes} onChange={(event) => update("notes", event.target.value)} placeholder="Tell us about your packaging requirements or current challenges" /></label>
              </div>
              {state === "error" && <p className="pw-ent-form-error" role="alert">{error}</p>}
              <button className="pw-marketing-button is-amber" type="submit" disabled={state === "sending"}>{state === "sending" ? "Sending your request…" : "Benchmark my SKU"}<ArrowRight size={18} /></button>
              <small><ShieldCheck size={13} /> Your information is used only to discuss your requirement.</small>
            </form>
          )}
        </div>
      </section>

      <section className="pw-marketing-section pw-ent-capabilities" id="capabilities">
        <div className="pw-marketing-container">
          <p className="pw-marketing-eyebrow">OUR ENTERPRISE CAPABILITIES</p>
          <h2>The operating layer around the packaging.</h2>
          <p className="pw-marketing-body">More than a manufacturer. We coordinate people, processes and production so you can scale with confidence.</p>
          <div className="pw-ent-capabilities-grid">
            <div className="pw-ent-pillars">{CAPABILITIES.map(({ Icon, title, text }) => <article key={title}><Icon size={28} /><h3>{title}</h3><p>{text}</p></article>)}</div>
            <img src="/images/enterprise-production-line-v1.webp" alt="Kraft cartons moving through a packaging production line" loading="lazy" />
          </div>
        </div>
      </section>

      <section className="pw-marketing-section pw-ent-smartstock">
        <div className="pw-marketing-container pw-ent-smartstock-grid">
          <div><p className="pw-marketing-eyebrow">SMARTSTOCK FOR ENTERPRISE</p><h2>Know what needs reordering before it becomes urgent.</h2><p className="pw-marketing-body">Track stock cover, lead times and supplier capacity, and get early signals for reordering so production never stops.</p><Link className="pw-marketing-button is-amber" href="/smartstock" onClick={() => trackMarketingEvent("smartstock_interaction", { placement: "enterprise" })}>Explore SmartStock <ArrowRight size={18} /></Link></div>
          <div className="pw-ent-stock" aria-label="Illustrative SmartStock reorder planning preview">
            <div className="pw-ent-stock-title"><span><Package size={20} /> SmartStock</span><b>Reorder planning</b></div>
            <div className="pw-ent-stock-table"><div className="pw-ent-stock-row is-head"><span>SKU</span><span>Stock cover</span><span>Reorder status</span></div>{[
              ["Stand-up pouch", "42 days", "On track"],
              ["Kraft mailer", "21 days", "Review soon"],
              ["Label roll", "15 days", "Plan reorder"],
              ["Carton sleeve", "34 days", "On track"],
            ].map(([name, days, status]) => <div className="pw-ent-stock-row" key={name}><span>{name}</span><span>{days}</span><span className={status === "On track" ? "is-good" : "is-warn"}>{status}</span></div>)}</div>
            <small>Illustrative planning view, not live customer data.</small>
          </div>
        </div>
      </section>

      <section className="pw-marketing-section pw-ent-industries">
        <div className="pw-marketing-container">
          <div className="pw-marketing-heading-row"><div><p className="pw-marketing-eyebrow">INDUSTRIES WE SERVE</p><h2>Built for enterprise packaging teams across industries.</h2></div><Link className="pw-marketing-text-link" href="/industries">Explore all industries <ArrowRight size={17} /></Link></div>
          <div className="pw-marketing-image-grid">{INDUSTRIES.map((industry) => <Link key={industry.name} href={industry.href} onClick={() => trackMarketingEvent("enterprise_industry_clicked", { industry: industry.name })}><img src={industry.image} alt={`${industry.name} packaging examples`} loading="lazy" /><span>{industry.name}<ArrowRight size={17} /></span></Link>)}</div>
        </div>
      </section>

      <section className="pw-marketing-section pw-ent-comparison">
        <div className="pw-marketing-container pw-ent-comparison-grid">
          <div><p className="pw-marketing-eyebrow">A BETTER WAY TO WORK</p><h2>A manufacturer makes a format.<br />Packworkz manages the workflow.</h2><p className="pw-marketing-body">Get the range, resilience and control you need without managing multiple vendors, quality checks and logistics partners yourself.</p></div>
          <div className="pw-ent-comparison-table" role="table" aria-label="Single manufacturer compared with Packworkz"><div className="pw-ent-comparison-row is-head" role="row"><span role="columnheader">Capability</span><span role="columnheader">Single manufacturer</span><span role="columnheader">Packworkz</span></div>{COMPARISON.map(([capability, single, packworkz]) => <div className="pw-ent-comparison-row" role="row" key={capability}><b role="cell">{capability}</b><span role="cell">{single}</span><strong role="cell"><Check size={15} />{packworkz}</strong></div>)}</div>
        </div>
      </section>

      <section className="pw-marketing-section pw-marketing-faq pw-ent-faq">
        <div className="pw-marketing-container pw-marketing-faq-grid"><div><p className="pw-marketing-eyebrow">FREQUENTLY ASKED QUESTIONS</p><h2>Before the first benchmark.</h2><p className="pw-marketing-body">Quick answers to common enterprise packaging questions.</p></div><div>{FAQS.map(([question, answer]) => <details key={question}><summary>{question}<span aria-hidden="true">+</span></summary><p>{answer}</p></details>)}</div></div>
      </section>

      <section className="pw-ent-final">
        <div className="pw-marketing-container"><p className="pw-marketing-eyebrow">START WITH ONE SKU</p><h2>Start with one SKU.</h2><p>Benchmark your current packaging route and see a simpler, more resilient way to procure.</p><div className="pw-marketing-actions"><a className="pw-marketing-button is-amber" href="#benchmark" onClick={() => trackMarketingEvent("benchmark_started", { placement: "enterprise_final" })}>Benchmark a SKU <ArrowRight size={18} /></a><Link className="pw-marketing-button is-outline-light" href="/contact">Talk to our team</Link></div></div>
      </section>
    </main>
  );
}
