import { useMemo, useState, type FormEvent } from "react";
import { Link } from "wouter";
import { ArrowRight, CheckCircle2, Factory, Gauge, Loader2, PackageCheck, Phone, ScanLine, Scale, Wrench } from "lucide-react";
import { CATALOG_SKUS, getCatalogImage } from "@/lib/catalog";
import { MACHINES, MACHINE_CATEGORIES, STARTER_LINES, formatLakhRange, getMachine, type MachineCategory } from "@/lib/machinery";
import { submitLead } from "@/lib/leads";
import { trackMarketingEvent } from "@/lib/analytics";
import "./premium-pages.css";
import "./beyond.css";
import { isUsd } from "@/lib/currency";

const BUDGET_OPTIONS = isUsd()
  ? ["Under $1,200", "$1,200–6,000", "$6,000–25,000", "$25,000+", "Need advice"]
  : ["Under ₹1 lakh", "₹1–5 lakh", "₹5–20 lakh", "₹20 lakh+", "Need advice"];

const skuByCode = (code: string) => CATALOG_SKUS.find((sku) => sku.code === code);

const FAQS = [
  ["Who builds and services the machines?", "Every machine comes from a vetted Indian manufacturing partner who handles installation, operator training, warranty and after-sales service. We help you shortlist, compare and buy the right model — and set up the packaging it runs."],
  ["Are the prices final?", "No — the ranges are typical market prices for guidance. Your quote depends on speed, fill range, material contact parts, add-ons like nitrogen flushing or coding, freight and installation."],
  ["Can I see the machine working before buying?", "Yes. We arrange a video demo with your product and pack wherever possible, and a factory visit for larger lines."],
  ["Do you supply packaging that runs on the machine?", "That's the point. We match pouch film, laminate thickness, seal width and label size to the machine so your first production day isn't a trial-and-error day."],
  ["What about after-sales support?", "Warranty terms and service response are confirmed in writing by the manufacturer in your quote. We stay on the thread if anything needs escalating."],
];

const CATEGORY_ICONS = { sealing: Wrench, filling: Scale, coding: ScanLine, automatic: Factory } as const;

export default function Machinery() {
  const [category, setCategory] = useState<MachineCategory | "all">("all");
  const [selected, setSelected] = useState<string[]>([]);
  const [form, setForm] = useState({ name: "", company: "", email: "", phone: "", product: "", format: "Pouches", output: "", budget: BUDGET_OPTIONS[0], notes: "" });
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState("");
  const [reference, setReference] = useState("");

  const machines = useMemo(() => category === "all" ? MACHINES : MACHINES.filter((machine) => machine.category === category), [category]);
  const update = (key: keyof typeof form, value: string) => setForm((current) => ({ ...current, [key]: value }));
  const toggle = (slug: string) => setSelected((current) => current.includes(slug) ? current.filter((item) => item !== slug) : [...current, slug]);
  const requestQuote = (slugs: string[]) => {
    setSelected((current) => Array.from(new Set([...current, ...slugs])));
    document.getElementById("machine-enquiry")?.scrollIntoView({ behavior: "smooth", block: "start" });
    trackMarketingEvent("machinery_quote_started", { machines: slugs.join(",") });
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setState("sending");
    setError("");
    const names = selected.map((slug) => getMachine(slug)?.name || slug);
    try {
      const id = await submitLead({
        kind: "machinery",
        name: form.name,
        company: form.company,
        email: form.email,
        phone: form.phone,
        subject: names.length ? names.join(", ") : `Machine advice for ${form.product || "a new line"}`,
        message: [
          `Product: ${form.product}`,
          `Pack format: ${form.format}`,
          `Target output: ${form.output || "Not specified"}`,
          `Budget: ${form.budget}`,
          `Machines: ${names.join(", ") || "Needs recommendation"}`,
          form.notes && `Notes: ${form.notes}`,
        ].filter(Boolean).join("\n"),
        metadata: { machines: selected, product: form.product, format: form.format, output: form.output, budget: form.budget },
      });
      setReference(id);
      setState("sent");
      trackMarketingEvent("machinery_quote_submitted", { machines: selected.length });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Please try again.");
      setState("error");
    }
  };

  return (
    <main className="pw-p pm">
      {/* ── HERO ── */}
      <section className="pm-hero" aria-labelledby="machinery-title">
        <img className="pm-hero-image" src="/images/machinery/packaging-line-hero-v1.webp" alt="" aria-hidden="true" />
        <div className="pm-hero-shade" aria-hidden="true" />
        <div className="pw-p-wrap pm-hero-content">
          <div className="pm-hero-copy">
            <p className="pw-p-eyebrow pw-p-hero-fade" style={{ ["--d" as string]: "0ms" }}>Packworkz Machinery</p>
            <h1 id="machinery-title" className="pw-p-hero-fade" style={{ ["--d" as string]: "180ms" }}>Fill it. Seal it.<br /><em>Ship it ready.</em></h1>
            <p className="pw-p-hero-sub pw-p-hero-fade" style={{ ["--d" as string]: "500ms" }}>
              Practical filling, sealing, coding and labelling equipment for D2C brands and manufacturers — selected around your product, output and the packaging you buy from us.
            </p>
            <div className="pw-p-actions pw-p-hero-fade" style={{ ["--d" as string]: "650ms" }}>
              <a className="pw-p-btn is-amber" href="#machine-enquiry" onClick={() => trackMarketingEvent("machinery_quote_started", { placement: "hero" })}>Get machine quotes <ArrowRight size={18} /></a>
              <a className="pw-p-btn is-ghost" href="#machines">Browse machines</a>
            </div>
            <ul className="pm-hero-points pw-p-hero-fade" style={{ ["--d" as string]: "800ms" }}>
              <li><CheckCircle2 size={16} /> Installed & serviced by the manufacturer</li>
              <li><CheckCircle2 size={16} /> Packaging matched to the machine</li>
              <li><CheckCircle2 size={16} /> Quotes from multiple makers</li>
            </ul>
          </div>
          <div className="pm-hero-proof pw-p-hero-fade" style={{ ["--d" as string]: "300ms" }}><small>PACKWORKZ MATCHING DESK</small><b>Machine + pack + service</b><span>Specified as one working system.</span></div>
        </div>
      </section>

      {/* ── CATALOGUE ── */}
      <section className="pw-p-section" id="machines">
        <div className="pw-p-wrap">
          <div className="pw-p-head-row">
            <div><p className="pw-p-eyebrow pw-reveal">Find by job</p><h2 className="pw-p-h2 pw-reveal pw-d1">What do you need <em>the machine to do?</em></h2></div>
            <p className="pw-p-lead pw-reveal pw-d2">Indicative Indian price bands from published supplier listings and market guides. Exact model, output, warranty, installation, freight and GST are confirmed in your quote.</p>
          </div>
          <div className="pm-tabs" role="tablist" aria-label="Machine categories">
            <button type="button" role="tab" aria-selected={category === "all"} className={category === "all" ? "is-active" : ""} onClick={() => setCategory("all")}>All machines <small>{MACHINES.length}</small></button>
            {MACHINE_CATEGORIES.map((item) => (
              <button key={item.id} type="button" role="tab" aria-selected={category === item.id} className={category === item.id ? "is-active" : ""} onClick={() => setCategory(item.id)}>
                {item.label} <small>{MACHINES.filter((machine) => machine.category === item.id).length}</small>
              </button>
            ))}
          </div>
          <div className="pm-grid">
            {machines.map((machine) => {
              const chosen = selected.includes(machine.slug);
              const CategoryIcon = CATEGORY_ICONS[machine.category];
              const outputSku = machine.worksWith.map(skuByCode).find(Boolean);
              return (
                <article key={machine.slug} className={`pm-card${chosen ? " is-chosen" : ""}`}>
                  <div className="pm-card-media">
                    <img src={machine.image} alt={machine.imageAlt} loading="lazy" />
                    {outputSku && (
                      <figure className="pm-card-output">
                        <img src={getCatalogImage(outputSku)} alt="" loading="lazy" />
                        <figcaption><small>{machine.packVerb}</small>{outputSku.name}</figcaption>
                      </figure>
                    )}
                  </div>
                  <div className="pm-card-body">
                    <span className="pm-card-kicker"><CategoryIcon size={14} /> {MACHINE_CATEGORIES.find((item) => item.id === machine.category)?.label}</span>
                    <h3>{machine.name}</h3>
                    <p>{machine.summary}</p>
                    <dl>
                      <div><dt><Gauge size={14} /> Output</dt><dd>{machine.output}</dd></div>
                      <div><dt><Factory size={14} /> Best for</dt><dd>{machine.bestFor}</dd></div>
                    </dl>
                    <div className="pm-works">
                      <small>Runs our</small>
                      {machine.worksWith.map((code) => skuByCode(code)).filter(Boolean).slice(0, 2).map((sku) => (
                        <Link key={sku!.code} href={`/products/${sku!.slug}`}>{sku!.name}</Link>
                      ))}
                    </div>
                    <div className="pm-card-foot">
                      <span><small>Typical price</small><b>{formatLakhRange(machine.priceFrom, machine.priceTo)}</b></span>
                      <button type="button" className={chosen ? "is-chosen" : ""} onClick={() => toggle(machine.slug)} aria-pressed={chosen}>
                        {chosen ? <><CheckCircle2 size={16} /> Added</> : "Add to quote"}
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── STARTER LINES ── */}
      <section className="pw-p-section pw-p-cream">
        <div className="pw-p-wrap">
          <div className="pw-p-head-row">
            <div><p className="pw-p-eyebrow pw-reveal">Starter lines</p><h2 className="pw-p-h2 pw-reveal pw-d1">Starting production? <em>Start here.</em></h2></div>
            <p className="pw-p-lead pw-reveal pw-d2">Pre-matched machine sets for the most common first lines — with the packaging that runs on them.</p>
          </div>
          <div className="pm-lines">
            {STARTER_LINES.map((line, index) => (
              <article key={line.title} className={`pm-line-card pw-reveal pw-d${index + 1}`}>
                <header className="pm-line-head"><b className="pm-line-num">0{index + 1}</b><div><h3>{line.title}</h3><p>{line.note}</p></div></header>
                <ol>{line.machines.map((slug, machineIndex) => <li key={slug}><span>{String(machineIndex + 1).padStart(2, "0")}</span><b>{getMachine(slug)?.name}</b></li>)}</ol>
                <div className="pm-line-packs">
                  <small>Packaging</small>
                  {line.packs.map((code) => skuByCode(code)).filter(Boolean).map((sku) => (
                    <Link key={sku!.code} href={`/products/${sku!.slug}`}>{sku!.name}</Link>
                  ))}
                </div>
                <div className="pm-line-foot">
                  <span><small>Typical budget</small><b>{formatLakhRange(line.budget[0], line.budget[1])}</b></span>
                  <button type="button" onClick={() => requestQuote(line.machines)}>Quote this line <ArrowRight size={16} /></button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="pw-p-section pw-p-dark">
        <div className="pw-p-wrap">
          <div className="pw-p-head-row">
            <div><p className="pw-p-eyebrow pw-reveal">How it works</p><h2 className="pw-p-h2 pw-reveal pw-d1">From “which machine?” <em>to first batch.</em></h2></div>
          </div>
          <div className="pw-p-card-grid is-4">
            {[
              [PackageCheck, "Tell us the job", "Your product, pack size, format and the output you need per day."],
              [Factory, "Compare vetted makers", "Shortlisted options with specs, price, lead time and service terms side by side."],
              [Wrench, "Demo, buy & install", "Video or factory demo, then installation and operator training by the manufacturer."],
              [Gauge, "Run it with our packs", "Film, pouches and labels specified for the machine — ready on day one."],
            ].map(([Icon, title, text], index) => {
              const StepIcon = Icon as typeof Gauge;
              return <div key={String(title)} className={`pw-p-card pw-reveal pw-d${index + 1}`}><span className="pw-p-card-num">0{index + 1}</span><span className="pw-p-card-icon"><StepIcon size={22} /></span><h3>{String(title)}</h3><p>{String(text)}</p></div>;
            })}
          </div>
        </div>
      </section>

      {/* ── ENQUIRY ── */}
      <section className="pw-p-section" id="machine-enquiry">
        <div className="pw-p-wrap pw-p-contact">
          <div className="pw-p-contact-aside">
            <p className="pw-p-eyebrow">Get machine quotes</p>
            <h2 className="pw-p-h2">Tell us what you pack. <em>We’ll match the machine.</em></h2>
            <p className="pw-p-lead">Quotes from vetted manufacturers usually arrive within 2 business days.</p>
            <div className="pm-selected">
              <small>Selected machines</small>
              {selected.length ? (
                <div>{selected.map((slug) => <button key={slug} type="button" onClick={() => toggle(slug)}>{getMachine(slug)?.name} ×</button>)}</div>
              ) : <p>None yet — pick from the catalogue, or leave blank and we’ll recommend.</p>}
            </div>
            <a className="pw-p-route is-whatsapp" href="https://wa.me/918208990366?text=Hi%20Packworkz%2C%20I%20need%20a%20packaging%20machine." target="_blank" rel="noreferrer" style={{ marginTop: 24 }}>
              <span><Phone size={20} /></span><span><b>Prefer WhatsApp?</b><small>Share a photo of your product and pack</small></span><ArrowRight size={18} />
            </a>
          </div>
          <div className="pw-p-form">
            {state === "sent" ? (
              <div className="pw-p-success" role="status">
                <div className="pw-p-success-mark"><CheckCircle2 size={36} /></div>
                <h2>Request received.</h2>
                <p style={{ color: "#5c6d7e" }}>We’re shortlisting machines for your line. Keep this reference for follow-up.</p>
                <strong>{reference}</strong>
                <Link href="/products" className="pw-p-btn is-line" style={{ marginTop: 10 }}>Browse packaging meanwhile</Link>
              </div>
            ) : (
              <form onSubmit={submit}>
                <h2>Machine enquiry</h2>
                <p>Takes a minute. No obligation.</p>
                <div className="pw-p-fields">
                  <label className="pw-p-field"><input required value={form.name} onChange={(event) => update("name", event.target.value)} placeholder=" " autoComplete="name" /><span>Name *</span></label>
                  <label className="pw-p-field"><input required value={form.company} onChange={(event) => update("company", event.target.value)} placeholder=" " autoComplete="organization" /><span>Brand / company *</span></label>
                  <label className="pw-p-field"><input required type="tel" value={form.phone} onChange={(event) => update("phone", event.target.value)} placeholder=" " autoComplete="tel" /><span>Phone / WhatsApp *</span></label>
                  <label className="pw-p-field"><input type="email" value={form.email} onChange={(event) => update("email", event.target.value)} placeholder=" " autoComplete="email" /><span>Email</span></label>
                  <label className="pw-p-field is-wide"><input required value={form.product} onChange={(event) => update("product", event.target.value)} placeholder=" " /><span>What are you packing? * (e.g. chilli powder 200 g)</span></label>
                  <label className="pw-p-field"><select value={form.format} onChange={(event) => update("format", event.target.value)}>{["Pouches", "Bottles / jars", "Cartons / boxes", "Film roll (automatic)", "Not sure yet"].map((option) => <option key={option}>{option}</option>)}</select><span>Pack format</span></label>
                  <label className="pw-p-field"><input value={form.output} onChange={(event) => update("output", event.target.value)} placeholder=" " /><span>Packs per day</span></label>
                  <label className="pw-p-field is-wide"><select value={form.budget} onChange={(event) => update("budget", event.target.value)}>{BUDGET_OPTIONS.map((option) => <option key={option}>{option}</option>)}</select><span>Budget</span></label>
                  <label className="pw-p-field is-wide"><textarea rows={3} value={form.notes} onChange={(event) => update("notes", event.target.value)} placeholder=" " /><span>Anything else? (space, power supply, timeline)</span></label>
                </div>
                {state === "error" && <p className="pw-p-form-error" role="alert">{error}</p>}
                <div className="pw-p-form-foot">
                  <small>We’ll only use your details for this request.</small>
                  <button className="pw-p-btn is-amber" type="submit" disabled={state === "sending"}>
                    {state === "sending" ? <><Loader2 size={17} className="animate-spin" /> Sending</> : <>Get quotes <ArrowRight size={17} /></>}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="pw-p-section pw-p-cream">
        <div className="pw-p-wrap pw-p-faq">
          <div><p className="pw-p-eyebrow pw-reveal">Good to know</p><h2 className="pw-p-h2 pw-reveal pw-d1">Machinery <em>questions.</em></h2></div>
          <div>{FAQS.map(([question, answer]) => <details key={question} className="pw-reveal"><summary>{question}<i aria-hidden="true" /></summary><p>{answer}</p></details>)}</div>
        </div>
      </section>

      <section className="pw-p-final">
        <p className="pw-p-eyebrow pw-reveal" style={{ justifyContent: "center" }}>Machine + packaging</p>
        <h2 className="pw-reveal pw-d1">One partner for the line <em>and what runs on it.</em></h2>
        <div className="pw-p-actions pw-reveal pw-d2">
          <a className="pw-p-btn is-amber" href="#machine-enquiry">Get machine quotes <ArrowRight size={18} /></a>
          <Link className="pw-p-btn is-ghost" href="/products">Shop packaging</Link>
        </div>
      </section>
    </main>
  );
}
