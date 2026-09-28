import { useEffect, useState } from "react";
import { Link } from "wouter";
import { ArrowRight, ArrowUpRight, CheckCircle2, Handshake, Loader2, Mail, MessageSquare, Newspaper, Package, Phone, Send, Truck } from "lucide-react";
import { SplitHeadline } from "@/components/marketing/motion";
import "./premium-pages.css";

const ROUTES = [
  { subject: "Sales & packaging", Icon: Package },
  { subject: "Order support", Icon: Truck },
  { subject: "Partnership", Icon: Handshake },
  { subject: "Media & press", Icon: Newspaper },
];

const INBOXES = [
  { Icon: Mail, label: "General support", email: "contact@packworkz.com", note: "Replies within 24 hours on business days" },
  { Icon: MessageSquare, label: "Sales & partnerships", email: "sales@packworkz.com", note: "Volume pricing, custom SKUs, account managers" },
  { Icon: Newspaper, label: "Media & press", email: "pr@packworkz.com", note: "Interviews, brand assets, speaking — within 48 hours" },
];

const FAQS = [
  { q: "What's your typical response time?", a: "Support and sales emails are answered within 24 hours on business days. Press queries within 48 hours." },
  { q: "Can I call instead?", a: "Yes — WhatsApp or call +91 82089 90366 and our team will respond during 9 AM–7 PM IST, Monday to Saturday." },
  { q: "I have an urgent order issue. What do I do?", a: "Log in to your dashboard and use the order support thread — that's the fastest route. Or WhatsApp us directly with your order reference." },
  { q: "Where are you based?", a: "Our owned manufacturing unit is in Kolkata and our office is in Bengaluru, with supply partners and warehouses across India for nationwide delivery." },
];

const EMPTY_FORM = { name: "", company: "", email: "", phone: "", subject: "Sales & packaging", message: "" };

/** Mon–Sat, 9 AM–7 PM IST. Evaluated on the client only to keep SSR output stable. */
function useTeamOnline() {
  const [online, setOnline] = useState<boolean | null>(null);
  useEffect(() => {
    const check = () => {
      const now = new Date();
      const ist = new Date(now.getTime() + (now.getTimezoneOffset() + 330) * 60_000);
      const hour = ist.getHours();
      setOnline(ist.getDay() !== 0 && hour >= 9 && hour < 19);
    };
    check();
    const timer = window.setInterval(check, 60_000);
    return () => window.clearInterval(timer);
  }, []);
  return online;
}

export default function Contact() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [reference, setReference] = useState("");
  const [error, setError] = useState("");
  const online = useTeamOnline();

  const update = (key: keyof typeof form, value: string) => setForm((current) => ({ ...current, [key]: value }));
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setState("sending");
    setError("");
    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source: "contact", ...form }),
      });
      const payload = await response.json() as { inquiry_id?: string; error?: string };
      if (!response.ok) throw new Error(payload.error || "We could not save your message.");
      setReference(payload.inquiry_id || "INQ-SAVED");
      setState("sent");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Please try again.");
      setState("error");
    }
  };

  return (
    <main className="pw-p">
      {/* ── HERO + FORM ── */}
      <section className="pw-p-section" style={{ paddingTop: 160, background: "linear-gradient(180deg,#faf7f0 0%,#fff 70%)" }} aria-labelledby="contact-title">
        <div className="pw-p-wrap pw-p-contact">
          <div className="pw-p-contact-aside">
            <p className="pw-p-eyebrow pw-p-hero-fade" style={{ ["--d" as string]: "0ms" }}>Get in touch</p>
            <SplitHeadline id="contact-title" className="pw-p-h2" lines={["Tell us what", "*needs to move."]} />
            <p className="pw-p-lead pw-p-hero-fade" style={{ ["--d" as string]: "450ms" }}>
              A packaging brief, an active order, a partnership or a press request — every message gets a reference ID and goes straight to the right team.
            </p>
            <div className={`pw-p-live pw-p-hero-fade${online === false ? " is-off" : ""}`} style={{ ["--d" as string]: "550ms" }}>
              <i aria-hidden="true" />
              {online === null ? "Mon–Sat · 9 AM–7 PM IST" : online ? "Team online now · replies on WhatsApp in minutes" : "Offline now · back 9 AM IST, Mon–Sat"}
            </div>
            <div className="pw-p-routes pw-p-hero-fade" style={{ ["--d" as string]: "650ms" }}>
              <a className="pw-p-route is-whatsapp" href="https://wa.me/918208990366" target="_blank" rel="noreferrer">
                <span><svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg></span>
                <span><b>WhatsApp the team</b><small>Fastest for pricing plans and order checks</small></span>
                <ArrowUpRight size={18} />
              </a>
              <a className="pw-p-route" href="tel:+918208990366">
                <span><Phone size={20} /></span>
                <span><b>+91 82089 90366</b><small>Call Mon–Sat, 9 AM–7 PM IST</small></span>
                <ArrowUpRight size={18} />
              </a>
              {INBOXES.map(({ Icon, label, email, note }) => (
                <a key={email} className="pw-p-route" href={`mailto:${email}`}>
                  <span><Icon size={20} /></span>
                  <span><b>{label} · {email}</b><small>{note}</small></span>
                  <ArrowUpRight size={18} />
                </a>
              ))}
            </div>
          </div>

          <div className="pw-p-form pw-p-hero-fade" style={{ ["--d" as string]: "300ms" }}>
            {state === "sent" ? (
              <div className="pw-p-success" role="status">
                <div className="pw-p-success-mark"><CheckCircle2 size={36} /></div>
                <p className="pw-p-eyebrow" style={{ marginBottom: 0 }}>Message secured</p>
                <h2>It's with the {form.subject.toLowerCase()} team.</h2>
                <p style={{ color: "#5c6d7e", fontSize: 15, lineHeight: 1.6 }}>Your request has been saved and routed. Keep this reference for follow-up.</p>
                <strong>{reference}</strong>
                <button type="button" className="pw-p-btn is-line" style={{ marginTop: 10 }} onClick={() => { setState("idle"); setForm(EMPTY_FORM); }}>Send another message</button>
              </div>
            ) : (
              <form onSubmit={submit}>
                <h2>Send a message</h2>
                <p>Include the product, quantity, deadline or order reference so the first reply is useful.</p>
                <div className="pw-p-chips" role="radiogroup" aria-label="Route this to">
                  {ROUTES.map(({ subject, Icon }) => (
                    <button key={subject} type="button" role="radio" aria-checked={form.subject === subject} className={`pw-p-chip${form.subject === subject ? " is-active" : ""}`} onClick={() => update("subject", subject)}>
                      <Icon size={16} /> {subject}
                    </button>
                  ))}
                </div>
                <div className="pw-p-fields">
                  <label className="pw-p-field"><input required value={form.name} onChange={(event) => update("name", event.target.value)} placeholder=" " autoComplete="name" /><span>Name *</span></label>
                  <label className="pw-p-field"><input value={form.company} onChange={(event) => update("company", event.target.value)} placeholder=" " autoComplete="organization" /><span>Company</span></label>
                  <label className="pw-p-field"><input required type="email" value={form.email} onChange={(event) => update("email", event.target.value)} placeholder=" " autoComplete="email" /><span>Email *</span></label>
                  <label className="pw-p-field"><input type="tel" value={form.phone} onChange={(event) => update("phone", event.target.value)} placeholder=" " autoComplete="tel" /><span>Phone / WhatsApp</span></label>
                  <label className="pw-p-field is-wide"><textarea required minLength={10} rows={5} value={form.message} onChange={(event) => update("message", event.target.value)} placeholder=" " /><span>What can we solve? *</span></label>
                </div>
                {state === "error" && <p className="pw-p-form-error" role="alert">{error}</p>}
                <div className="pw-p-form-foot">
                  <small>By submitting, you agree that Packworkz may contact you about this request.</small>
                  <button className="pw-p-btn is-amber" disabled={state === "sending"} type="submit">
                    {state === "sending" ? <><Loader2 size={17} className="animate-spin" /> Saving securely</> : <>Send to Packworkz <Send size={17} /></>}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* ── OFFICES ── */}
      <section className="pw-p-section is-tight pw-p-dark">
        <div className="pw-p-wrap">
          <div className="pw-p-head-row">
            <div><p className="pw-p-eyebrow pw-reveal">Where we are</p><h2 className="pw-p-h2 pw-reveal pw-d1">Factories in Kolkata. <em>Delivery across India.</em></h2></div>
            <p className="pw-p-lead pw-reveal pw-d2">3 owned factories in Kolkata, with additional supply lines across India.</p>
          </div>
          <div className="pw-p-offices">
            <div className="pw-p-office pw-reveal pw-d1"><small>Owned unit</small><h3>Kolkata</h3><p>2, R.N. Tagore Road, Dakshineswar,<br />Kolkata — 700076</p><p><a href="tel:+918208990366">+91 820 899 0366</a></p></div>
            <div className="pw-p-office pw-reveal pw-d2"><small>Office</small><h3>Bengaluru</h3><p>Brigade IRV Centre, Nallurhalli Road,<br />Whitefield, Bengaluru — 560066</p><p><a href="tel:+918208990366">+91 820 899 0366</a></p></div>
            <div className="pw-p-office pw-reveal pw-d3"><small>Business hours</small><h3>Mon – Sat</h3><p>9:00 AM – 7:00 PM IST<br />Dashboard order support is available anytime.</p><p><Link href="/track-order" style={{ color: "#fff" }}>Track an order →</Link></p></div>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="pw-p-section">
        <div className="pw-p-wrap pw-p-faq">
          <div>
            <p className="pw-p-eyebrow pw-reveal">Common questions</p>
            <h2 className="pw-p-h2 pw-reveal pw-d1">Before <em>you write.</em></h2>
            <div className="pw-p-actions pw-reveal pw-d2"><Link className="pw-p-link" href="/how-it-works">How Packworkz works <ArrowRight size={17} /></Link></div>
          </div>
          <div>{FAQS.map((faq) => <details key={faq.q} className="pw-reveal"><summary>{faq.q}<i aria-hidden="true" /></summary><p>{faq.a}</p></details>)}</div>
        </div>
      </section>
    </main>
  );
}
