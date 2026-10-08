import { useRef, useState, type FormEvent } from "react";
import { Link, useSearch } from "wouter";
import { ArrowLeft, ArrowRight, CheckCircle2, FileUp, Loader2, X } from "lucide-react";
import { MFG_CATEGORIES, getManufacturer, type CategoryId } from "@/lib/manufacturers";
import { payForService } from "@/lib/mfg-api";
import { submitLead } from "@/lib/leads";
import { uploadArtwork } from "@/lib/artwork-upload";
import { inr, money } from "@/lib/currency";
import { trackMarketingEvent } from "@/lib/analytics";
import "./manufacturing.css";
import "./make.css";

const SERVICES = ["Private label", "Custom formulation", "Contract manufacturing", "Co-packing", "White label", "Export"];
const CERTS = ["FSSAI", "GMP", "WHO-GMP", "ISO 9001", "ISO 22000", "HACCP", "BRCGS", "FSSC 22000", "AYUSH", "Organic", "US FDA", "Halal"];
const DOCS = [
  { key: "gst", label: "GST certificate", required: true },
  { key: "licence", label: "Manufacturing licence (FSSAI / drug / cosmetic)", required: true },
  { key: "certs", label: "Quality certificates (ISO, GMP…)", required: false },
  { key: "photos", label: "Factory photos (2–4)", required: false },
] as const;

type Upload = { name: string; url?: string; error?: string };

export default function ListYourFactory() {
  const search = new URLSearchParams(useSearch());
  const claim = search.get("claim") ? getManufacturer(search.get("claim")!) : undefined;
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    company: claim?.name || "", website: claim?.website || "", city: claim?.city || "", state: claim?.state || "", since: claim?.since || "", gstin: "",
    products: claim?.products.join(", ") || "", moq: claim?.moq || "", capacity: claim?.capacity || "", lines: "",
    name: "", role: "", email: "", phone: "",
  });
  const [categories, setCategories] = useState<CategoryId[]>(claim?.categories || []);
  const [services, setServices] = useState<string[]>(claim?.services.filter((item) => SERVICES.includes(item)) || []);
  const [certs, setCerts] = useState<string[]>([]);
  const [uploads, setUploads] = useState<Record<string, Upload[]>>({});
  const [state, setState] = useState<"form" | "saving" | "saved" | "paying" | "paid" | "pending">("form");
  const [error, setError] = useState("");
  const [inquiryId, setInquiryId] = useState("");
  const inputs = useRef<Record<string, HTMLInputElement | null>>({});
  const update = (key: keyof typeof form, value: string) => setForm((current) => ({ ...current, [key]: value }));
  const toggle = <T,>(list: T[], set: (next: T[]) => void, value: T) => set(list.includes(value) ? list.filter((item) => item !== value) : [...list, value]);
  const uploading = Object.values(uploads).flat().some((file) => !file.url && !file.error);

  const addFiles = async (key: string, files: FileList | null) => {
    if (!files) return;
    const picked = Array.from(files).slice(0, 4);
    setUploads((current) => ({ ...current, [key]: [...(current[key] || []), ...picked.map((file) => ({ name: file.name }))] }));
    await Promise.all(picked.map(async (file) => {
      try {
        const url = await uploadArtwork(file, form.company || "factory");
        setUploads((current) => ({ ...current, [key]: (current[key] || []).map((item) => item.name === file.name ? { ...item, url } : item) }));
      } catch (cause) {
        setUploads((current) => ({ ...current, [key]: (current[key] || []).map((item) => item.name === file.name ? { ...item, error: cause instanceof Error ? cause.message : "Upload failed" } : item) }));
      }
    }));
  };

  const next = (event: FormEvent) => {
    event.preventDefault();
    if (step === 1 && !categories.length) { setError("Pick at least one category you manufacture."); return; }
    setError("");
    setStep((value) => value + 1);
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const missing = DOCS.filter((doc) => doc.required && !(uploads[doc.key] || []).some((file) => file.url));
    if (missing.length) { setError(`Please upload: ${missing.map((doc) => doc.label).join(", ")}.`); return; }
    setState("saving");
    setError("");
    const documents = Object.fromEntries(Object.entries(uploads).map(([key, files]) => [key, files.flatMap((file) => (file.url ? [file.url] : []))]));
    const profile = {
      slug: claim?.slug || form.company,
      city: form.city, state: form.state, since: form.since, website: form.website,
      categories, products: form.products.split(",").map((item) => item.trim()).filter(Boolean),
      services, certifications: certs, moq: form.moq, capacity: form.capacity, lines: form.lines,
    };
    try {
      const id = await submitLead({
        kind: "manufacturer_application",
        name: form.name, company: form.company, email: form.email, phone: form.phone,
        subject: `${claim ? "Claim" : "New listing"}: ${form.company} · ${form.city || "?"}`,
        message: [
          `Company: ${form.company} (${form.website || "no website"})`,
          `Location: ${form.city}, ${form.state} · GSTIN ${form.gstin}`,
          `Categories: ${categories.join(", ")}`,
          `Products: ${form.products}`,
          `Services: ${services.join(", ")}`,
          `Certifications: ${certs.join(", ") || "-"}`,
          `MOQ: ${form.moq} · Capacity: ${form.capacity}`,
          `Packaging lines: ${form.lines || "-"}`,
          `Contact: ${form.name} (${form.role})`,
          claim ? `Claiming seeded profile: ${claim.slug}` : "",
        ].filter(Boolean).join("\n"),
        metadata: { profile, documents, gstin: form.gstin, contact_role: form.role, claim: claim?.slug || null, approved: false, verification_level: "none" },
      });
      setInquiryId(id);
      setState("saved");
      trackMarketingEvent("mfg_factory_listed", { claim: claim?.slug || "" });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Please try again.");
      setState("form");
    }
  };

  const payVerified = () => {
    setState("paying");
    setError("");
    payForService({
      service: "factory_verified", inquiryId, name: form.name, email: form.email, phone: form.phone,
      onDone: (result) => setState(result),
      onError: (message) => { setError(message); setState("saved"); },
    }).catch((cause: unknown) => { setError(cause instanceof Error ? cause.message : "Secure checkout could not open."); setState("saved"); });
  };

  const titles = ["Your factory", "What you make", "Verification"];

  return (
    <main className="mf mk">
      <section className="mf-form-page mk-form">
        <div className="mf-wrap mf-form-grid">
          <div className="mf-form-side">
            <span className="mf-eyebrow"><b>Factories</b> {claim ? "Claim your profile" : "List for free"}</span>
            <h1 style={{ marginTop: 22 }}>{claim ? <>Claim <em>{claim.name}</em>.</> : <>Get matched with brands <em>that fit your line.</em></>}</h1>
            <p>No lead credits. No paying to see enquiries. Brands describe what they want to make, and we introduce the factories whose capabilities actually fit.</p>
            <ol className="mf-steps">
              <li><span>1</span>List your factory and upload GST + licence — free.</li>
              <li><span>2</span>We check documents online (usually 2–3 business days) and publish your profile.</li>
              <li><span>3</span>Optional Verified badge ({money(4999)} one-time): live video walkthrough + capacity review. Verified factories rank higher.</li>
              <li><span>4</span>Matched brands come to you — and Packworkz can supply your packaging too.</li>
            </ol>
          </div>

          <div className="mf-card">
            {state === "form" || state === "saving" ? (
              <>
                <div className="mf-progress">{titles.map((title, i) => <span key={title} className={i <= step ? "is-on" : ""} />)}</div>
                <h2>{titles[step]}</h2>
                <p>Step {step + 1} of 3</p>
                {step === 0 && (
                  <form onSubmit={next}>
                    <div className="mf-fields">
                      <label className="mf-field is-wide">Registered company name *<input required value={form.company} onChange={(event) => update("company", event.target.value)} autoComplete="organization" /></label>
                      <label className="mf-field">City *<input required value={form.city} onChange={(event) => update("city", event.target.value)} /></label>
                      <label className="mf-field">State *<input required value={form.state} onChange={(event) => update("state", event.target.value)} /></label>
                      <label className="mf-field">GSTIN *<input required pattern="[0-9A-Za-z]{15}" title="15-character GSTIN" value={form.gstin} onChange={(event) => update("gstin", event.target.value.toUpperCase())} /></label>
                      <label className="mf-field">Established (year)<input inputMode="numeric" value={form.since} onChange={(event) => update("since", event.target.value)} /></label>
                      <label className="mf-field is-wide">Website<input type="url" placeholder="https://" value={form.website} onChange={(event) => update("website", event.target.value)} /></label>
                    </div>
                    <div className="mf-form-foot"><small>Free listing. You can edit later.</small><button className="mf-btn is-amber" type="submit">Continue <ArrowRight size={16} /></button></div>
                  </form>
                )}
                {step === 1 && (
                  <form onSubmit={next}>
                    <div className="mf-fields">
                      <div className="mf-field is-wide">Categories you manufacture *<div className="mf-toggles">{MFG_CATEGORIES.map((category) => <button type="button" key={category.id} className={categories.includes(category.id) ? "is-on" : ""} onClick={() => toggle(categories, setCategories, category.id)}>{category.label}</button>)}</div></div>
                      <label className="mf-field is-wide">Products (comma separated) *<input required value={form.products} onChange={(event) => update("products", event.target.value)} placeholder="Protein bars, granola bars, energy bites" /></label>
                      <div className="mf-field is-wide">Services<div className="mf-toggles">{SERVICES.map((item) => <button type="button" key={item} className={services.includes(item) ? "is-on" : ""} onClick={() => toggle(services, setServices, item)}>{item}</button>)}</div></div>
                      <div className="mf-field is-wide">Certifications you hold<div className="mf-toggles">{CERTS.map((item) => <button type="button" key={item} className={certs.includes(item) ? "is-on" : ""} onClick={() => toggle(certs, setCerts, item)}>{item}</button>)}</div></div>
                      <label className="mf-field">Minimum order *<input required value={form.moq} onChange={(event) => update("moq", event.target.value)} placeholder="e.g. 5,000 units" /></label>
                      <label className="mf-field">Monthly capacity *<input required value={form.capacity} onChange={(event) => update("capacity", event.target.value)} placeholder="e.g. 1M units / month" /></label>
                      <label className="mf-field is-wide">Packaging lines you run<input value={form.lines} onChange={(event) => update("lines", event.target.value)} placeholder="Flow wrap, pouch filling, jar filling, sachets…" /></label>
                    </div>
                    {error && <p className="mf-error">{error}</p>}
                    <div className="mf-form-foot"><button className="mf-btn is-ghost" type="button" onClick={() => setStep(0)}><ArrowLeft size={16} /> Back</button><button className="mf-btn is-amber" type="submit">Continue <ArrowRight size={16} /></button></div>
                  </form>
                )}
                {step === 2 && (
                  <form onSubmit={submit}>
                    <div className="mf-fields">
                      {DOCS.map((doc) => (
                        <div key={doc.key} className="mf-field is-wide">
                          {doc.label}{doc.required ? " *" : ""}
                          <div className="mf-upload">
                            <input ref={(el) => { inputs.current[doc.key] = el; }} type="file" accept="application/pdf,image/png,image/jpeg" multiple hidden onChange={(event) => void addFiles(doc.key, event.target.files)} />
                            <button type="button" onClick={() => inputs.current[doc.key]?.click()}><FileUp size={16} /> Upload</button>
                            {(uploads[doc.key] || []).map((file) => (
                              <span key={file.name}>{file.url ? <CheckCircle2 size={13} /> : file.error ? <X size={13} /> : <Loader2 size={13} className="animate-spin" />} {file.name.slice(0, 28)}</span>
                            ))}
                          </div>
                        </div>
                      ))}
                      <label className="mf-field">Your name *<input required value={form.name} onChange={(event) => update("name", event.target.value)} autoComplete="name" /></label>
                      <label className="mf-field">Role *<input required value={form.role} onChange={(event) => update("role", event.target.value)} placeholder="Owner, Director, BD…" /></label>
                      <label className="mf-field">Work email *<input required type="email" value={form.email} onChange={(event) => update("email", event.target.value)} autoComplete="email" /></label>
                      <label className="mf-field">Phone / WhatsApp *<input required type="tel" value={form.phone} onChange={(event) => update("phone", event.target.value)} autoComplete="tel" /></label>
                    </div>
                    {error && <p className="mf-error">{error}</p>}
                    <div className="mf-form-foot">
                      <button className="mf-btn is-ghost" type="button" onClick={() => setStep(1)}><ArrowLeft size={16} /> Back</button>
                      <button className="mf-btn is-amber" type="submit" disabled={state === "saving" || uploading}>{state === "saving" ? <><Loader2 size={16} className="animate-spin" /> Submitting…</> : <>Submit for verification <ArrowRight size={16} /></>}</button>
                    </div>
                  </form>
                )}
              </>
            ) : state === "paid" || state === "pending" ? (
              <div className="mf-done">
                <CheckCircle2 size={48} />
                <h2>{state === "paid" ? "Verified review booked." : "Payment processing."}</h2>
                <p>Reference {inquiryId}. We'll WhatsApp you to schedule the video factory walkthrough within 2 business days.</p>
              </div>
            ) : (
              <div className="mf-done">
                <CheckCircle2 size={48} />
                <h2>Submitted for review.</h2>
                <p>Reference {inquiryId}. We'll check your documents online and publish your profile, usually within 2–3 business days.</p>
                <div className="mf-paybox">
                  <b>Get the Verified badge · {money(4999)} one-time</b>
                  <ul>
                    {["Live video walkthrough of your production floor", "Capacity and licence review by our team", "Verified badge + higher ranking in brand matches", "Priority for Launch Desk projects"].map((text) => <li key={text}><CheckCircle2 size={15} /> {text}</li>)}
                  </ul>
                  <button className="mf-btn is-amber" type="button" onClick={payVerified} disabled={state === "paying"}>{state === "paying" ? <><Loader2 size={16} className="animate-spin" /> Opening checkout…</> : <>Pay {inr(4999)} securely <ArrowRight size={16} /></>}</button>
                  <small style={{ color: "rgba(226,236,248,.55)" }}>Optional. Your free listing goes live either way.</small>
                </div>
                {error && <p className="mf-error">{error}</p>}
                <Link className="mf-btn is-ghost" style={{ marginTop: 18 }} href="/manufacturing">Back to Manufacturing</Link>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
