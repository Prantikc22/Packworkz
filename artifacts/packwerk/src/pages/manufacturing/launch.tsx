import { useMemo, useState, type FormEvent } from "react";
import { Link, useSearch } from "wouter";
import { ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import { MFG_CATEGORIES, getManufacturer, parseRequirementLocally, type CategoryId } from "@/lib/manufacturers";
import { payForService, useManufacturerPool } from "@/lib/mfg-api";
import { submitLead } from "@/lib/leads";
import { inr, money } from "@/lib/currency";
import { trackMarketingEvent } from "@/lib/analytics";
import "./manufacturing.css";
import "./make.css";

const SERVICES = ["Private label (their recipe)", "Custom formulation (my recipe)", "Contract manufacturing", "Co-packing only"];
const CERTS = ["FSSAI", "GMP / WHO-GMP", "ISO / HACCP", "BRCGS", "AYUSH", "Organic", "Export (US FDA / EU)"];

export default function ManufacturingLaunch() {
  const search = new URLSearchParams(useSearch());
  const pool = useManufacturerPool();
  const target = search.get("m") ? getManufacturer(search.get("m")!, pool) : undefined;
  const initialBrief = search.get("brief") || "";
  const guess = useMemo(() => (initialBrief ? parseRequirementLocally(initialBrief) : null), [initialBrief]);

  const [form, setForm] = useState({
    product: initialBrief,
    category: (guess?.category || target?.categories[0] || "") as CategoryId | "",
    quantity: guess?.monthlyUnits ? `${guess.monthlyUnits.toLocaleString("en-IN")} / month` : "",
    launch: "Within 3 months",
    location: guess?.location || "",
    notes: "",
    name: "", company: "", email: "", phone: "",
  });
  const [services, setServices] = useState<string[]>([]);
  const [certs, setCerts] = useState<string[]>([]);
  const [state, setState] = useState<"form" | "saving" | "saved" | "paying" | "paid" | "pending">("form");
  const [error, setError] = useState("");
  const [inquiryId, setInquiryId] = useState("");
  const wantsDesk = search.get("plan") === "desk";
  const update = (key: keyof typeof form, value: string) => setForm((current) => ({ ...current, [key]: value }));
  const toggle = (list: string[], set: (next: string[]) => void, value: string) => set(list.includes(value) ? list.filter((item) => item !== value) : [...list, value]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setState("saving");
    setError("");
    try {
      const id = await submitLead({
        kind: "manufacturing_requirement",
        name: form.name, company: form.company, email: form.email, phone: form.phone,
        subject: `${form.product.slice(0, 80)} · ${form.quantity || "qty ?"}${target ? ` · intro to ${target.name}` : ""}`,
        message: [
          `Product: ${form.product}`,
          `Category: ${form.category || "?"}`,
          `Quantity: ${form.quantity}`,
          `Services: ${services.join(", ") || "-"}`,
          `Certifications: ${certs.join(", ") || "-"}`,
          `Preferred location: ${form.location || "Anywhere in India"}`,
          `Launch: ${form.launch}`,
          target ? `Requested introduction: ${target.name} (${target.slug})` : "",
          form.notes && `Notes: ${form.notes}`,
        ].filter(Boolean).join("\n"),
        metadata: { product: form.product, category: form.category, quantity: form.quantity, services, certifications: certs, location: form.location, launch: form.launch, manufacturer: target?.slug || null, wants_launch_desk: wantsDesk },
      });
      setInquiryId(id);
      setState("saved");
      trackMarketingEvent("mfg_requirement_submitted", { category: form.category, manufacturer: target?.slug || "" });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Please try again.");
      setState("form");
    }
  };

  const payDesk = () => {
    setState("paying");
    setError("");
    payForService({
      service: "launch_desk", inquiryId, name: form.name, email: form.email, phone: form.phone,
      onDone: (result) => { setState(result); trackMarketingEvent("mfg_launch_desk_paid", {}); },
      onError: (message) => { setError(message); setState("saved"); },
    }).catch((cause: unknown) => { setError(cause instanceof Error ? cause.message : "Secure checkout could not open."); setState("saved"); });
  };

  return (
    <main className="mf mk">
      <section className="mf-form-page mk-form">
        <div className="mf-wrap mf-form-grid">
          <div className="mf-form-side">
            <span className="mf-eyebrow"><b>Brands</b> Post a requirement</span>
            <h1 style={{ marginTop: 22 }}>{target ? <>Meet <em>{target.name}</em>.</> : <>Tell us what you <em>want to make.</em></>}</h1>
            <p>One brief. We confirm which factories genuinely fit and have capacity, then introduce you — your details are never sold or broadcast.</p>
            <ol className="mf-steps">
              <li><span>1</span>You describe the product, volume and standards.</li>
              <li><span>2</span>We check fit and availability with 3–5 manufacturers.</li>
              <li><span>3</span>Free: we introduce you. Launch Desk: we run quotes, samples and timeline for you.</li>
              <li><span>4</span>Packworkz supplies the packaging to your manufacturer's line.</li>
            </ol>
          </div>

          <div className="mf-card">
            {state === "form" || state === "saving" ? (
              <form onSubmit={submit}>
                <h2>Your requirement</h2>
                <p>Takes about a minute.</p>
                <div className="mf-fields">
                  <label className="mf-field is-wide">What do you want to make? *<textarea required value={form.product} onChange={(event) => update("product", event.target.value)} placeholder="e.g. 20g whey protein bar, chocolate flavour, flow-wrapped" /></label>
                  <label className="mf-field">Category<select value={form.category} onChange={(event) => update("category", event.target.value)}><option value="">Choose…</option>{MFG_CATEGORIES.map((category) => <option key={category.id} value={category.id}>{category.label}</option>)}</select></label>
                  <label className="mf-field">Quantity *<input required value={form.quantity} onChange={(event) => update("quantity", event.target.value)} placeholder="e.g. 50,000 / month" /></label>
                  <div className="mf-field is-wide">Manufacturing model<div className="mf-toggles">{SERVICES.map((item) => <button type="button" key={item} className={services.includes(item) ? "is-on" : ""} onClick={() => toggle(services, setServices, item)}>{item}</button>)}</div></div>
                  <div className="mf-field is-wide">Standards you need<div className="mf-toggles">{CERTS.map((item) => <button type="button" key={item} className={certs.includes(item) ? "is-on" : ""} onClick={() => toggle(certs, setCerts, item)}>{item}</button>)}</div></div>
                  <label className="mf-field">Preferred location<input value={form.location} onChange={(event) => update("location", event.target.value)} placeholder="Anywhere in India" /></label>
                  <label className="mf-field">Target launch<select value={form.launch} onChange={(event) => update("launch", event.target.value)}>{["Within 1 month", "Within 3 months", "Within 6 months", "Just exploring"].map((item) => <option key={item}>{item}</option>)}</select></label>
                  <label className="mf-field">Your name *<input required value={form.name} onChange={(event) => update("name", event.target.value)} autoComplete="name" /></label>
                  <label className="mf-field">Brand / company *<input required value={form.company} onChange={(event) => update("company", event.target.value)} autoComplete="organization" /></label>
                  <label className="mf-field">Email *<input required type="email" value={form.email} onChange={(event) => update("email", event.target.value)} autoComplete="email" /></label>
                  <label className="mf-field">Phone / WhatsApp *<input required type="tel" value={form.phone} onChange={(event) => update("phone", event.target.value)} autoComplete="tel" /></label>
                  <label className="mf-field is-wide">Anything else?<textarea value={form.notes} onChange={(event) => update("notes", event.target.value)} placeholder="Budget per unit, formulation notes, export plans…" /></label>
                </div>
                {error && <p className="mf-error">{error}</p>}
                <div className="mf-form-foot">
                  <small>We only share your brief with factories you approve.</small>
                  <button className="mf-btn is-amber" type="submit" disabled={state === "saving"}>{state === "saving" ? <><Loader2 size={16} className="animate-spin" /> Saving…</> : <>Submit requirement <ArrowRight size={16} /></>}</button>
                </div>
              </form>
            ) : state === "paid" || state === "pending" ? (
              <div className="mf-done">
                <CheckCircle2 size={48} />
                <h2>{state === "paid" ? "Launch Desk confirmed." : "Payment processing."}</h2>
                <p>Reference {inquiryId}. Your Packworkz owner will WhatsApp you within one business day with the shortlist plan.</p>
                <Link className="mf-btn is-ghost" style={{ marginTop: 20 }} href="/products">Explore packaging meanwhile</Link>
              </div>
            ) : (
              <div className="mf-done">
                <CheckCircle2 size={48} />
                <h2>Requirement received.</h2>
                <p>Reference {inquiryId}. We'll confirm matching factories and come back within 2 business days — free.</p>
                <div className="mf-paybox">
                  <b>Want us to run it for you? Launch Desk · {money(14999)}</b>
                  <ul>
                    {["3 shortlisted factories confirmed for fit and availability", "Comparable quotes collected for you", "Samples and timeline coordinated", "Packaging planned with your manufacturer", "One Packworkz owner until first production"].map((text) => <li key={text}><CheckCircle2 size={15} /> {text}</li>)}
                  </ul>
                  <button className="mf-btn is-amber" type="button" onClick={payDesk} disabled={state === "paying"}>{state === "paying" ? <><Loader2 size={16} className="animate-spin" /> Opening checkout…</> : <>Pay {inr(14999)} securely <ArrowRight size={16} /></>}</button>
                  <small style={{ color: "rgba(226,236,248,.55)" }}>Charged in INR via Razorpay. Free option stays active either way.</small>
                </div>
                {error && <p className="mf-error">{error}</p>}
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
