import { useRef, useState, type FormEvent } from "react";
import { Link } from "wouter";
import { ArrowRight, Camera, CheckCircle2, FileCheck2, Loader2, Scale, Truck, X } from "lucide-react";
import { CATALOG_SKUS, getCatalogImage, type CatalogSku } from "@/lib/catalog";
import { submitLead } from "@/lib/leads";
import { uploadArtwork } from "@/lib/artwork-upload";
import { formatUnitRate, getFromUnitPrice } from "@/lib/indicative-pricing";
import { Marquee } from "@/components/marketing/motion";
import { trackMarketingEvent } from "@/lib/analytics";
import "./premium-pages.css";
import "./beyond.css";

const MATERIALS = [
  { tag: "Flexible", title: "Film & laminate trim", image: "/images/circular/film-bale.webp", streams: "Printed laminate offcuts, slitting trim, roll ends, misprints", note: "Mono-material PE, BOPP and PET trim fetch the best rates." },
  { tag: "Fibre", title: "Corrugated & paper", image: "/images/circular/corrugated-bale.webp", streams: "Carton rejects, die-cut waste, kraft cores, paper tubes", note: "Baled or loose — collected from a few hundred kilos." },
  { tag: "Rigid", title: "Rigid plastics", image: "/images/circular/rigid-plastics.webp", streams: "HDPE / PET bottles, caps, preforms and moulding runners", note: "Sorted by polymer and colour for higher value." },
];

const STEPS = [
  { Icon: Camera, title: "Share photos & volume", text: "Tell us the material, rough monthly quantity and pickup location." },
  { Icon: Scale, title: "Get recycler quotes", text: "Registered recyclers and aggregators quote per kg for your stream." },
  { Icon: Truck, title: "Pickup & weighbridge", text: "Collection from your site with a weighbridge slip for every load." },
  { Icon: FileCheck2, title: "Payment & paperwork", text: "Paid per load, with the recycler’s documentation for your records." },
];

export const FAQS = [
  ["Who can sell scrap through Packworkz?", "Packaging converters, printers, brand factories and warehouses generating regular production scrap. We focus on clean, identified industrial scrap rather than mixed household waste."],
  ["Which materials pay best?", "Clean, single-polymer streams — PE film, BOPP, PET, HDPE and corrugated. Multilayer and metallised laminates are accepted by specialist buyers at lower rates."],
  ["What is the minimum quantity?", "Usually a few hundred kilos per pickup. Smaller regular volumes can be pooled into scheduled monthly pickups."],
  ["Do I get documentation?", "Every load comes with a weighbridge slip and the recycler’s receipt. Where applicable, recyclers share documentation that supports your EPR reporting."],
  ["Can I buy recycled packaging too?", "Yes — our sustainable range includes recycled-content and compostable formats, so the loop closes on your own shelves."],
];

export default function Circular() {
  const [form, setForm] = useState({ name: "", company: "", phone: "", email: "", material: "Film & laminate trim", quantity: "", frequency: "Monthly", location: "", notes: "" });
  const [photos, setPhotos] = useState<Array<{ name: string; url?: string; error?: string }>>([]);
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState("");
  const [reference, setReference] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const update = (key: keyof typeof form, value: string) => setForm((current) => ({ ...current, [key]: value }));
  const uploading = photos.some((photo) => !photo.url && !photo.error);

  const addPhotos = async (files: FileList | null) => {
    if (!files) return;
    const picked = Array.from(files).slice(0, 3 - photos.length);
    setPhotos((current) => [...current, ...picked.map((file) => ({ name: file.name }))]);
    await Promise.all(picked.map(async (file) => {
      try {
        const url = await uploadArtwork(file, form.company || "circular");
        setPhotos((current) => current.map((photo) => photo.name === file.name ? { ...photo, url } : photo));
      } catch (cause) {
        setPhotos((current) => current.map((photo) => photo.name === file.name ? { ...photo, error: cause instanceof Error ? cause.message : "Upload failed" } : photo));
      }
    }));
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setState("sending");
    setError("");
    const photoUrls = photos.flatMap((photo) => photo.url ? [photo.url] : []);
    try {
      const id = await submitLead({
        kind: "circular",
        name: form.name,
        company: form.company,
        email: form.email,
        phone: form.phone,
        subject: `${form.material} · ${form.quantity || "?"} kg · ${form.frequency}`,
        message: [
          `Material: ${form.material}`,
          `Quantity: ${form.quantity} kg`,
          `Frequency: ${form.frequency}`,
          `Pickup location: ${form.location}`,
          photoUrls.length ? `Photos: ${photoUrls.join(" , ")}` : "",
          form.notes && `Notes: ${form.notes}`,
        ].filter(Boolean).join("\n"),
        metadata: { material: form.material, quantity_kg: form.quantity, frequency: form.frequency, location: form.location, photos: photoUrls },
      });
      setReference(id);
      setState("sent");
      trackMarketingEvent("circular_pickup_submitted", { material: form.material });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Please try again.");
      setState("error");
    }
  };

  const recycledPicks = ["EC-505", "SP-905", "TS-306", "TS-304"].map((code) => CATALOG_SKUS.find((sku) => sku.code === code)).filter((sku): sku is CatalogSku => Boolean(sku));

  return (
    <main className="pw-p pm">
      {/* ── HERO ── */}
      <section className="pc-hero" aria-labelledby="circular-title">
        <img className="pc-hero-image" src="/images/circular/film-bale.webp" alt="" aria-hidden="true" />
        <div className="pc-hero-shade" aria-hidden="true" />
        <div className="pw-p-wrap pc-hero-content">
          <div className="pc-hero-copy">
            <p className="pw-p-eyebrow pw-p-hero-fade" style={{ ["--d" as string]: "0ms" }}>Packworkz Circular</p>
            <h1 id="circular-title" className="pw-p-hero-fade" style={{ ["--d" as string]: "180ms" }}>Your production scrap<br /><em>has a buyer.</em></h1>
            <p className="pw-p-hero-sub pw-p-hero-fade" style={{ ["--d" as string]: "500ms" }}>
              Turn film trim, carton waste and plastic rejects into revenue. Registered recyclers quote, collect and document every load.
            </p>
            <div className="pw-p-actions pw-p-hero-fade" style={{ ["--d" as string]: "650ms" }}>
              <a className="pw-p-btn is-amber" href="#scrap-pickup" onClick={() => trackMarketingEvent("circular_pickup_started", { placement: "hero" })}>Get scrap quotes <ArrowRight size={18} /></a>
              <Link className="pw-p-btn is-ghost" href="/sustainable">Shop recycled packaging</Link>
            </div>
          </div>
          <aside className="pc-hero-proof pw-p-hero-fade" style={{ ["--d" as string]: "350ms" }}>
            <b>One documented route from factory floor to recycler.</b>
            <span>Quote · pickup · weighbridge · payment</span>
          </aside>
        </div>
      </section>

      <div className="pw-p-ticker">
        <Marquee speed={40}>{["PE film trim", "BOPP offcuts", "PET film", "Printed laminate", "Corrugated", "Kraft cores", "HDPE", "PET bottles", "Paper tubes", "Roll ends"].map((item) => <span className="pw-p-ticker-item" key={item}>{item}</span>)}</Marquee>
      </div>

      {/* ── MATERIALS ── */}
      <section className="pw-p-section">
        <div className="pw-p-wrap">
          <div className="pw-p-head-row">
            <div><p className="pw-p-eyebrow pw-reveal">What we collect</p><h2 className="pw-p-h2 pw-reveal pw-d1">Clean industrial scrap, <em>routed to the right buyer.</em></h2></div>
            <p className="pw-p-lead pw-reveal pw-d2">We start with the streams recyclers value most — sorted, identified production scrap.</p>
          </div>
          <div className="pw-p-tiles">
            {MATERIALS.map((material, index) => (
              <a key={material.title} href="#scrap-pickup" onClick={() => update("material", material.title)} className={`pw-p-tile pw-reveal pw-d${index + 1}`}>
                <img src={material.image} alt={material.title} loading="lazy" />
                <span className="pw-p-tile-arrow"><ArrowRight size={18} /></span>
                <small>{material.tag}</small>
                <h3>{material.title}</h3>
                <p>{material.streams}. {material.note}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="pw-p-section pw-p-dark">
        <div className="pw-p-wrap">
          <div className="pw-p-head-row">
            <div><p className="pw-p-eyebrow pw-reveal">How it works</p><h2 className="pw-p-h2 pw-reveal pw-d1">Four steps. <em>Paid per load.</em></h2></div>
          </div>
          <div className="pw-p-funnel" style={{ gridTemplateColumns: "repeat(4, minmax(0, 1fr))" }}>
            {STEPS.map(({ Icon, title, text }, index) => (
              <div key={title} className="pw-p-funnel-step pw-reveal" style={{ ["--pw-delay" as string]: `${index * 140}ms` }}>
                <b>0{index + 1}</b><Icon size={24} color="#f2b134" style={{ marginTop: 26 }} /><h3 style={{ marginTop: 16 }}>{title}</h3><p>{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CLOSE THE LOOP ── */}
      <section className="pw-p-section pw-p-cream">
        <div className="pw-p-wrap">
          <div className="pw-p-head-row">
            <div><p className="pw-p-eyebrow pw-reveal">Close the loop</p><h2 className="pw-p-h2 pw-reveal pw-d1">Sell scrap. <em>Buy recycled.</em></h2></div>
            <Link className="pw-p-link pw-reveal pw-d2" href="/sustainable">Full sustainable range <ArrowRight size={17} /></Link>
          </div>
          <div className="pm-recycled">
            {recycledPicks.map((sku, index) => (
              <Link key={sku.code} href={`/products/${sku.slug}`} className={`pw-reveal pw-d${index + 1}`}>
                <img src={getCatalogImage(sku)} alt={sku.name} loading="lazy" />
                <span><b>{sku.name}</b><small>From {formatUnitRate(getFromUnitPrice(sku))} / {sku.moq_unit.replace(/s$/, "")}</small></span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── PICKUP FORM ── */}
      <section className="pw-p-section" id="scrap-pickup">
        <div className="pw-p-wrap pw-p-contact">
          <div className="pw-p-contact-aside">
            <p className="pw-p-eyebrow">Scrap pickup</p>
            <h2 className="pw-p-h2">Tell us what you generate. <em>Get quotes per kg.</em></h2>
            <p className="pw-p-lead">Most enquiries receive recycler quotes within 3 business days.</p>
            <ul className="pm-hero-points" style={{ marginTop: 28 }}>
              <li><CheckCircle2 size={16} /> Registered recyclers and aggregators only</li>
              <li><CheckCircle2 size={16} /> Weighbridge slip on every load</li>
              <li><CheckCircle2 size={16} /> One-time or scheduled pickups</li>
            </ul>
          </div>
          <div className="pw-p-form">
            {state === "sent" ? (
              <div className="pw-p-success" role="status">
                <div className="pw-p-success-mark"><CheckCircle2 size={36} /></div>
                <h2>We’re finding buyers.</h2>
                <p style={{ color: "#5c6d7e" }}>Recycler quotes for your material will follow. Keep this reference.</p>
                <strong>{reference}</strong>
              </div>
            ) : (
              <form onSubmit={submit}>
                <h2>Scrap pickup request</h2>
                <p>No commitment until you accept a quote.</p>
                <div className="pw-p-fields">
                  <label className="pw-p-field"><input required value={form.name} onChange={(event) => update("name", event.target.value)} placeholder=" " autoComplete="name" /><span>Name *</span></label>
                  <label className="pw-p-field"><input required value={form.company} onChange={(event) => update("company", event.target.value)} placeholder=" " autoComplete="organization" /><span>Company *</span></label>
                  <label className="pw-p-field"><input required type="tel" value={form.phone} onChange={(event) => update("phone", event.target.value)} placeholder=" " autoComplete="tel" /><span>Phone / WhatsApp *</span></label>
                  <label className="pw-p-field"><input type="email" value={form.email} onChange={(event) => update("email", event.target.value)} placeholder=" " autoComplete="email" /><span>Email</span></label>
                  <label className="pw-p-field"><select value={form.material} onChange={(event) => update("material", event.target.value)}>{[...MATERIALS.map((item) => item.title), "Mixed / not sure"].map((option) => <option key={option}>{option}</option>)}</select><span>Material</span></label>
                  <label className="pw-p-field"><input required inputMode="numeric" value={form.quantity} onChange={(event) => update("quantity", event.target.value.replace(/[^0-9]/g, ""))} placeholder=" " /><span>Approx. quantity (kg) *</span></label>
                  <label className="pw-p-field"><select value={form.frequency} onChange={(event) => update("frequency", event.target.value)}>{["One-time", "Weekly", "Monthly", "Quarterly"].map((option) => <option key={option}>{option}</option>)}</select><span>Frequency</span></label>
                  <label className="pw-p-field"><input required value={form.location} onChange={(event) => update("location", event.target.value)} placeholder=" " /><span>City / pincode *</span></label>
                  <div className="pw-p-field is-wide pm-photos">
                    <input ref={inputRef} type="file" accept="image/png,image/jpeg" multiple hidden onChange={(event) => void addPhotos(event.target.files)} />
                    <button type="button" onClick={() => inputRef.current?.click()} disabled={photos.length >= 3}><Camera size={17} /> Add photos (up to 3, 10 MB each)</button>
                    {photos.map((photo) => (
                      <span key={photo.name} className={photo.error ? "is-error" : photo.url ? "is-done" : ""}>
                        {photo.url ? <CheckCircle2 size={14} /> : photo.error ? <X size={14} /> : <Loader2 size={14} className="animate-spin" />}
                        {photo.name}
                        <button type="button" aria-label={`Remove ${photo.name}`} onClick={() => setPhotos((current) => current.filter((item) => item.name !== photo.name))}><X size={12} /></button>
                      </span>
                    ))}
                  </div>
                  <label className="pw-p-field is-wide"><textarea rows={3} value={form.notes} onChange={(event) => update("notes", event.target.value)} placeholder=" " /><span>Notes (polymer, printed or plain, baled or loose)</span></label>
                </div>
                {state === "error" && <p className="pw-p-form-error" role="alert">{error}</p>}
                <div className="pw-p-form-foot">
                  <small>We’ll only use your details for this request.</small>
                  <button className="pw-p-btn is-amber" type="submit" disabled={state === "sending" || uploading}>
                    {state === "sending" ? <><Loader2 size={17} className="animate-spin" /> Sending</> : uploading ? "Uploading photos…" : <>Get scrap quotes <ArrowRight size={17} /></>}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>

      <section className="pw-p-section pw-p-cream">
        <div className="pw-p-wrap pw-p-faq">
          <div><p className="pw-p-eyebrow pw-reveal">Good to know</p><h2 className="pw-p-h2 pw-reveal pw-d1">Circular <em>questions.</em></h2></div>
          <div>{FAQS.map(([question, answer]) => <details key={question} className="pw-reveal"><summary>{question}<i aria-hidden="true" /></summary><p>{answer}</p></details>)}</div>
        </div>
      </section>

      <section className="pw-p-final">
        <p className="pw-p-eyebrow pw-reveal" style={{ justifyContent: "center" }}>Packworkz Circular</p>
        <h2 className="pw-reveal pw-d1">Less landfill. <em>More margin.</em></h2>
        <div className="pw-p-actions pw-reveal pw-d2">
          <a className="pw-p-btn is-amber" href="#scrap-pickup">Get scrap quotes <ArrowRight size={18} /></a>
          <Link className="pw-p-btn is-ghost" href="/machinery">Explore machinery</Link>
        </div>
      </section>
    </main>
  );
}
