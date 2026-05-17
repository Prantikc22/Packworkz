import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";

// ── Calculator logic (mirrors home.tsx) ─────────────────────────────────────
type VendorBucket = "Just 1" | "2 to 4" | "5+";
type CreditOption = "Yes" | "No";

function calcSavings(monthly: number, vendors: VendorBucket, credit: CreditOption) {
  const savingPct = vendors === "Just 1" ? 0.08 : vendors === "2 to 4" ? 0.10 : 0.12;
  const annual = monthly * 12;
  const annualSaving = annual * savingPct;
  const creditMarkup = credit === "Yes" ? annual * 0.12 : 0;
  const upfrontSaving = annual * 0.03;
  const timeSaved = vendors === "Just 1" ? 4 : vendors === "2 to 4" ? 8 : 14;
  return { annual, annualSaving, creditMarkup, upfrontSaving, totalValue: annualSaving + creditMarkup, timeSaved };
}

const inr = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

// ── Trust stats ──────────────────────────────────────────────────────────────
const STATS = [
  { value: "220+", label: "D2C & FMCG brands" },
  { value: "110+", label: "Packaging SKUs" },
  { value: "14", label: "Days brief to doorstep" },
  { value: "98.7%", label: "On-time delivery" },
];

// ── Comparison table ─────────────────────────────────────────────────────────
const COMPARE = [
  { aspect: "Quote turnaround", old: "3–7 days", packworkz: "48 hours" },
  { aspect: "First sample", old: "2–4 weeks", packworkz: "7–10 days" },
  { aspect: "Draft to delivery", old: "6–12 weeks", packworkz: "14 days" },
  { aspect: "Re-order", old: "Call / email vendor", packworkz: "One click in dashboard" },
  { aspect: "QC process", old: "Hope for the best", packworkz: "Owned QC team + 3 backup factories" },
  { aspect: "Vendor risk", old: "1 vendor = 1 point of failure", packworkz: "3 backup vendors per order" },
  { aspect: "Payment", old: "Net-30/60 with hidden markup", packworkz: "50/50 milestone, no credit markup" },
];

// ── Testimonials ─────────────────────────────────────────────────────────────
const TESTIMONIALS = [
  {
    quote: "We switched 8 packaging SKUs in 6 weeks. Delivery was on time, quality was identical to what we approved on the sample. The one-click reorder alone saves my ops team 3 hours a week.",
    name: "Priya Mehta",
    title: "Co-Founder, Zestful Foods",
    initials: "PM",
  },
  {
    quote: "Packworkz matched our previous vendor's price on our stand-up pouches — then beat it by 9% on the second order. Price match guarantee is real.",
    name: "Rahul Desai",
    title: "Head of Operations, NutriCore",
    initials: "RD",
  },
  {
    quote: "From WhatsApp brief to production samples in 8 days. We were launching a new SKU under pressure and this was the fastest packaging experience we've ever had.",
    name: "Aisha Khan",
    title: "Brand Manager, Botanica",
    initials: "AK",
  },
];

// ── How it works steps ───────────────────────────────────────────────────────
const STEPS = [
  { n: "01", title: "Brief us in 10 minutes", desc: "Tell us your product, target MOQ, timeline, and any design files. Via WhatsApp, form, or a 10-minute call." },
  { n: "02", title: "Receive sample in 7–10 days", desc: "We source from our factory network and ship a physical sample to your door. From ₹2,999, no commitment." },
  { n: "03", title: "Approve & pay first milestone", desc: "50% on order confirmation. We begin production immediately — no waiting." },
  { n: "04", title: "Approve sample, product ships", desc: "50% on sample approval or before dispatch. Doorstep in 14 days total." },
];

export default function LpD2c() {
  const [monthlySpend, setMonthlySpend] = useState(500000);
  const [vendorBucket, setVendorBucket] = useState<VendorBucket>("2 to 4");
  const [useCredit, setUseCredit] = useState<CreditOption>("Yes");

  const calc = calcSavings(monthlySpend, vendorBucket, useCredit);
  const sliderPct = Math.round(((monthlySpend - 50000) / (5000000 - 50000)) * 100);

  const [displayedSaving, setDisplayedSaving] = useState(calc.annualSaving);
  const animRef = useRef<number | null>(null);
  const fromRef = useRef(calc.annualSaving);

  useEffect(() => {
    const from = fromRef.current;
    const to = calc.annualSaving;
    if (from === to) return;
    const start = performance.now();
    const duration = 400;
    if (animRef.current) cancelAnimationFrame(animRef.current);
    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplayedSaving(Math.round(from + (to - from) * eased));
      if (t < 1) animRef.current = requestAnimationFrame(tick);
      else fromRef.current = to;
    };
    animRef.current = requestAnimationFrame(tick);
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [calc.annualSaving]);

  // Lead form
  const [form, setForm] = useState({ name: "", email: "", phone: "", company: "", spend: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch("/api/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contact_name: form.name,
          company_name: form.company,
          email: form.email,
          phone: form.phone,
          notes: `Monthly packaging spend: ${form.spend}. Enquiry from D2C landing page.`,
          products: [],
        }),
      });
    } catch {}
    setSubmitted(true);
  };

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", background: "#ffffff" }}>

      {/* ── Minimal sticky header ── */}
      <header style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        background: "rgba(2,8,23,0.95)", backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 32px", height: 60,
      }}>
        <Link href="/" style={{ textDecoration: "none" }}>
          <span style={{ color: "white", fontWeight: 900, fontSize: 22, fontFamily: "'Space Grotesk', sans-serif", letterSpacing: "-0.03em" }}>
            Packworkz
          </span>
        </Link>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <a href="https://wa.me/918208990366" target="_blank" rel="noreferrer"
            style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, fontWeight: 600, textDecoration: "none", display: "flex", alignItems: "center", gap: 6 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="#25D366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
            WhatsApp
          </a>
          <a href="#get-quote" style={{
            background: "#E8A838", color: "#0D1B2A",
            padding: "8px 18px", fontWeight: 800, fontSize: 13,
            textDecoration: "none", letterSpacing: "0.03em",
          }}>
            Get Free Quote
          </a>
        </div>
      </header>

      {/* ── Hero ── */}
      <section style={{
        background: "linear-gradient(135deg, #020817 0%, #071a45 45%, #153e9f 100%)",
        paddingTop: 120, paddingBottom: 80, minHeight: "90vh",
        display: "flex", alignItems: "center",
      }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 32px", width: "100%" }}>
          <div style={{ maxWidth: 720 }}>
            {/* Social proof bar */}
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: "rgba(232,168,56,0.12)", border: "1px solid rgba(232,168,56,0.3)",
              borderRadius: 99, padding: "6px 16px", marginBottom: 32,
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="#E8A838"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
              <span style={{ color: "#E8A838", fontSize: 12, fontWeight: 700 }}>220+ D2C &amp; FMCG brands trust Packworkz</span>
            </div>

            <h1 style={{
              color: "white", fontSize: "clamp(2.2rem, 5vw, 3.8rem)",
              fontWeight: 900, lineHeight: 1.1, marginBottom: 24,
              fontFamily: "'Space Grotesk', sans-serif",
              letterSpacing: "-0.02em",
            }}>
              Order Packaging Like You Order from Amazon.{" "}
              <span style={{ color: "#E8A838" }}>Brief to Doorstep in 14 Days.</span>
            </h1>

            <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 19, lineHeight: 1.7, marginBottom: 40, maxWidth: 580 }}>
              India's first managed packaging platform. 110+ SKUs, 3 backup vendors per order, owned QC. No vendor chaos. No delays. No surprises.
            </p>

            {/* Price match guarantee badge */}
            <div style={{
              background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.15)",
              borderRadius: 12, padding: "20px 24px", marginBottom: 36, maxWidth: 560,
            }}>
              <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                <div style={{
                  width: 40, height: 40, background: "#E8A838", borderRadius: 8,
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0D1B2A" strokeWidth="2.5" strokeLinecap="round"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <div>
                  <p style={{ color: "white", fontWeight: 800, fontSize: 15, marginBottom: 4 }}>
                    First Order Price Match Guarantee
                  </p>
                  <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.6, margin: 0 }}>
                    We match your current vendor's price — or we cover the difference. Sample from ₹2,999. No commitment until you approve.
                  </p>
                </div>
              </div>
            </div>

            {/* CTAs */}
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <a href="#get-quote" style={{
                background: "#E8A838", color: "#0D1B2A",
                padding: "16px 32px", fontWeight: 800, fontSize: 15,
                textDecoration: "none", letterSpacing: "0.02em", display: "inline-block",
              }}>
                Get My Free Quote in 48hrs →
              </a>
              <Link href="/samples" style={{
                background: "transparent", color: "white",
                border: "1px solid rgba(255,255,255,0.3)",
                padding: "16px 28px", fontWeight: 600, fontSize: 15,
                textDecoration: "none", display: "inline-block",
              }}>
                Order a Sample ₹2,999
              </Link>
            </div>
          </div>

          {/* Stats row */}
          <div style={{
            display: "flex", gap: 0, marginTop: 64,
            borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: 40,
            flexWrap: "wrap",
          }}>
            {STATS.map((s, i) => (
              <div key={i} style={{
                flex: "1 1 160px", padding: "0 32px 0 0",
                borderRight: i < STATS.length - 1 ? "1px solid rgba(255,255,255,0.1)" : "none",
                marginRight: i < STATS.length - 1 ? 32 : 0,
                marginBottom: 24,
              }}>
                <p style={{ color: "#E8A838", fontSize: 36, fontWeight: 900, lineHeight: 1, marginBottom: 4 }}>{s.value}</p>
                <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 13, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── "Not your typical packaging vendor" ── */}
      <section style={{ background: "white", padding: "88px 32px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <p style={{ color: "#1B6CA8", fontSize: 11, fontWeight: 700, letterSpacing: "2.5px", textTransform: "uppercase", marginBottom: 14 }}>
            THE DIFFERENCE
          </p>
          <h2 style={{ color: "#0D1B2A", fontSize: "clamp(1.8rem, 4vw, 2.6rem)", fontWeight: 800, lineHeight: 1.15, marginBottom: 12 }}>
            This is not your typical packaging vendor.
          </h2>
          <p style={{ color: "#64748B", fontSize: 17, lineHeight: 1.7, marginBottom: 48, maxWidth: 560 }}>
            Traditional packaging procurement is slow, fragmented, and full of hidden costs. We rebuilt it from scratch.
          </p>

          {/* Comparison table */}
          <div style={{ border: "1px solid #E2EAF4", borderRadius: 12, overflow: "hidden" }}>
            {/* Header */}
            <div style={{
              display: "grid", gridTemplateColumns: "2fr 2fr 2.5fr",
              background: "#F8F9FC", borderBottom: "1px solid #E2EAF4",
            }}>
              <div style={{ padding: "14px 24px", color: "#94A3B8", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px" }}>
                What you're evaluating
              </div>
              <div style={{ padding: "14px 24px", color: "#94A3B8", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", borderLeft: "1px solid #E2EAF4" }}>
                Traditional vendor
              </div>
              <div style={{ padding: "14px 24px", color: "#1B6CA8", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", borderLeft: "1px solid #E2EAF4" }}>
                Packworkz
              </div>
            </div>
            {COMPARE.map((row, i) => (
              <div key={i} style={{
                display: "grid", gridTemplateColumns: "2fr 2fr 2.5fr",
                borderBottom: i < COMPARE.length - 1 ? "1px solid #E2EAF4" : "none",
                background: i % 2 === 0 ? "white" : "#FAFBFC",
              }}>
                <div style={{ padding: "16px 24px", color: "#0D1B2A", fontSize: 15, fontWeight: 600 }}>{row.aspect}</div>
                <div style={{ padding: "16px 24px", color: "#64748B", fontSize: 14, borderLeft: "1px solid #E2EAF4", display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ color: "#EF4444", fontWeight: 700, fontSize: 16 }}>✕</span>
                  {row.old}
                </div>
                <div style={{ padding: "16px 24px", color: "#0D1B2A", fontSize: 14, fontWeight: 600, borderLeft: "1px solid #E2EAF4", display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ color: "#22C55E", fontWeight: 700, fontSize: 16 }}>✓</span>
                  {row.packworkz}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section style={{ background: "#F8F9FC", padding: "88px 32px" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <p style={{ color: "#1B6CA8", fontSize: 11, fontWeight: 700, letterSpacing: "2.5px", textTransform: "uppercase", marginBottom: 14, textAlign: "center" }}>
            THE PROCESS
          </p>
          <h2 style={{ color: "#0D1B2A", fontSize: "clamp(1.8rem, 4vw, 2.6rem)", fontWeight: 800, lineHeight: 1.15, marginBottom: 56, textAlign: "center" }}>
            From brief to your door in 14 days.
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 24 }}>
            {STEPS.map((step, i) => (
              <div key={i} style={{
                background: "white", border: "1px solid #E2EAF4",
                borderRadius: 12, padding: "28px 24px",
                position: "relative", overflow: "hidden",
              }}>
                <span style={{
                  position: "absolute", top: 16, right: 20,
                  color: "#E2EAF4", fontSize: 48, fontWeight: 900,
                  fontFamily: "'Space Grotesk', sans-serif",
                  lineHeight: 1,
                }}>
                  {step.n}
                </span>
                <div style={{
                  width: 36, height: 36, background: "#0D1B2A", borderRadius: 8,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  marginBottom: 16,
                }}>
                  <span style={{ color: "#E8A838", fontSize: 16, fontWeight: 900 }}>{i + 1}</span>
                </div>
                <h3 style={{ color: "#0D1B2A", fontSize: 16, fontWeight: 700, marginBottom: 10 }}>{step.title}</h3>
                <p style={{ color: "#64748B", fontSize: 14, lineHeight: 1.6, margin: 0 }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Savings Calculator ── */}
      <section id="calculator" style={{ background: "white", padding: "88px 32px" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <p style={{ color: "#1B6CA8", fontSize: 11, fontWeight: 700, letterSpacing: "2.5px", textTransform: "uppercase", marginBottom: 14 }}>
            THE NUMBERS
          </p>
          <h2 style={{ color: "#0D1B2A", fontSize: "clamp(1.8rem, 4vw, 2.6rem)", fontWeight: 800, lineHeight: 1.15, marginBottom: 12 }}>
            How much is vendor chaos costing you?
          </h2>
          <p style={{ color: "#64748B", fontSize: 17, marginBottom: 48 }}>Most D2C brands overpay by 8–15% without realising it.</p>

          <div style={{
            maxWidth: 880, margin: "0 auto",
            background: "white", border: "1px solid #E2EAF4",
            boxShadow: "0 8px 40px rgba(13,27,42,0.08)", overflow: "hidden",
          }}>
            <div className="calc-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
              {/* Left panel */}
              <div className="calc-left" style={{ background: "white", padding: "36px 44px", borderRight: "1px solid #E2EAF4" }}>
                <label style={{ display: "block", color: "#0D1B2A", fontSize: 13, fontWeight: 600, marginBottom: 20 }}>
                  Monthly packaging spend
                </label>
                <input
                  type="range"
                  className="calc-slider"
                  min={50000} max={5000000} step={10000}
                  value={monthlySpend}
                  onChange={e => setMonthlySpend(Number(e.target.value))}
                  style={{ background: `linear-gradient(to right, #E8A838 0%, #E8A838 ${sliderPct}%, #E2EAF4 ${sliderPct}%, #E2EAF4 100%)` }}
                />
                <div style={{ marginTop: 12, textAlign: "center" }}>
                  <span style={{ color: "#0D1B2A", fontSize: 26, fontWeight: 700 }}>{inr(monthlySpend)}</span>
                  <span style={{ color: "#94A3B8", fontSize: 13, marginLeft: 4 }}>/month</span>
                </div>
                <div style={{ height: 1, background: "#F1F5F9", margin: "24px 0" }} />
                <label style={{ display: "block", color: "#0D1B2A", fontSize: 13, fontWeight: 600, marginBottom: 12 }}>Vendors you currently manage</label>
                <div style={{ display: "flex", gap: 8 }}>
                  {(["Just 1", "2 to 4", "5+"] as VendorBucket[]).map(opt => {
                    const sel = vendorBucket === opt;
                    return (
                      <button key={opt} onClick={() => setVendorBucket(opt)} style={{
                        padding: "9px 0", flex: 1, borderRadius: 8,
                        border: `1px solid ${sel ? "#0D1B2A" : "#E2EAF4"}`,
                        fontSize: 14, fontWeight: 500, cursor: "pointer",
                        background: sel ? "#0D1B2A" : "#F8F9FC",
                        color: sel ? "white" : "#64748B",
                      }}>
                        {opt}
                      </button>
                    );
                  })}
                </div>
                <div style={{ height: 1, background: "#F1F5F9", margin: "20px 0" }} />
                <label style={{ display: "block", color: "#0D1B2A", fontSize: 13, fontWeight: 600, marginBottom: 12 }}>Do you use vendor credit?</label>
                <div style={{ display: "flex", gap: 8 }}>
                  {(["Yes", "No"] as CreditOption[]).map(opt => {
                    const sel = useCredit === opt;
                    return (
                      <button key={opt} onClick={() => setUseCredit(opt)} style={{
                        padding: "9px 0", flex: 1, borderRadius: 8,
                        border: `1px solid ${sel ? "#0D1B2A" : "#E2EAF4"}`,
                        fontSize: 14, fontWeight: 500, cursor: "pointer",
                        background: sel ? "#0D1B2A" : "#F8F9FC",
                        color: sel ? "white" : "#64748B",
                      }}>
                        {opt}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Right panel */}
              <div className="calc-right" style={{ background: "#0D1B2A", padding: "48px 44px" }}>
                <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 10, fontWeight: 600, letterSpacing: "2px", textTransform: "uppercase", marginBottom: 8 }}>
                  YOUR ESTIMATED SAVINGS
                </p>
                <p className="calc-hero-num" style={{ color: "#E8A838", fontSize: 52, fontWeight: 700, lineHeight: 1, letterSpacing: "-1px", marginBottom: 6 }}>
                  {inr(displayedSaving)}
                </p>
                <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 13, marginBottom: 36 }}>estimated annual saving</p>
                <div style={{ height: 1, background: "rgba(255,255,255,0.08)", marginBottom: 28 }} />
                {[
                  { label: "Hidden credit markup", value: useCredit === "Yes" ? inr(calc.creditMarkup) : "Not applicable" },
                  { label: "Extra saving if upfront", value: inr(calc.upfrontSaving) },
                  { label: "Time saved per month", value: `${calc.timeSaved} hours` },
                ].map(row => (
                  <div key={row.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
                    <span style={{ color: "rgba(255,255,255,0.55)", fontSize: 13 }}>{row.label}</span>
                    <span style={{ color: "rgba(255,255,255,0.9)", fontSize: 15, fontWeight: 600 }}>{row.value}</span>
                  </div>
                ))}
                <div style={{ height: 1, background: "rgba(255,255,255,0.08)", margin: "24px 0" }} />
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <span style={{ color: "white", fontSize: 15, fontWeight: 700 }}>Total annual value</span>
                  <span style={{ color: "white", fontSize: 28, fontWeight: 700 }}>{inr(calc.totalValue)}</span>
                </div>
                <a href="#get-quote" style={{ display: "block", marginTop: 28 }}>
                  <button style={{
                    width: "100%", padding: "16px", background: "#E8A838",
                    color: "#0D1B2A", fontWeight: 800, fontSize: 14,
                    border: "none", cursor: "pointer", letterSpacing: "0.02em",
                  }}>
                    Lock in these savings — get a quote →
                  </button>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Payment terms ── */}
      <section style={{ background: "#0D1B2A", padding: "72px 32px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <h2 style={{ color: "white", fontSize: "clamp(1.6rem, 3.5vw, 2.2rem)", fontWeight: 800, lineHeight: 1.2, marginBottom: 12 }}>
            Simple, fair payment terms. No credit surprises.
          </h2>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 14, fontStyle: "italic", marginBottom: 48 }}>
            "We don't do credit because we don't do delays. Paid orders ship on time. Every time."
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20 }}>
            {[
              {
                step: "50%",
                title: "On order confirmation",
                desc: "We begin production immediately once your order is confirmed. No waiting, no delays.",
                icon: "✓",
                color: "#1B6CA8",
              },
              {
                step: "50%",
                title: "On sample approval or dispatch",
                desc: "Balance due when you approve your production sample — or before dispatch if you're in a rush.",
                icon: "✓",
                color: "#E8A838",
              },
            ].map((item, i) => (
              <div key={i} style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 12, padding: "28px 28px",
              }}>
                <div style={{
                  display: "inline-flex", alignItems: "center", gap: 10,
                  background: "rgba(255,255,255,0.08)", borderRadius: 8,
                  padding: "8px 16px", marginBottom: 20,
                }}>
                  <span style={{ color: item.color, fontSize: 28, fontWeight: 900 }}>{item.step}</span>
                  <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 12 }}>payment</span>
                </div>
                <h3 style={{ color: "white", fontSize: 16, fontWeight: 700, marginBottom: 10 }}>{item.title}</h3>
                <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 14, lineHeight: 1.6, margin: 0 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section style={{ background: "#F8F9FC", padding: "88px 32px" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <p style={{ color: "#1B6CA8", fontSize: 11, fontWeight: 700, letterSpacing: "2.5px", textTransform: "uppercase", marginBottom: 14, textAlign: "center" }}>
            WHAT BRANDS SAY
          </p>
          <h2 style={{ color: "#0D1B2A", fontSize: "clamp(1.6rem, 3.5vw, 2.2rem)", fontWeight: 800, textAlign: "center", marginBottom: 48 }}>
            220+ brands made the switch.
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 24 }}>
            {TESTIMONIALS.map((t, i) => (
              <div key={i} style={{
                background: "white", border: "1px solid #E2EAF4",
                borderRadius: 12, padding: "28px 28px",
              }}>
                <div style={{ display: "flex", gap: 2, marginBottom: 16 }}>
                  {[...Array(5)].map((_, j) => (
                    <svg key={j} width="16" height="16" viewBox="0 0 24 24" fill="#E8A838"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                  ))}
                </div>
                <p style={{ color: "#334155", fontSize: 15, lineHeight: 1.7, marginBottom: 20 }}>
                  "{t.quote}"
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: "50%",
                    background: "#0D1B2A", color: "#E8A838",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 14, fontWeight: 800, flexShrink: 0,
                  }}>
                    {t.initials}
                  </div>
                  <div>
                    <p style={{ color: "#0D1B2A", fontWeight: 700, fontSize: 14, margin: 0 }}>{t.name}</p>
                    <p style={{ color: "#94A3B8", fontSize: 12, margin: 0 }}>{t.title}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Lead form ── */}
      <section id="get-quote" style={{ background: "linear-gradient(135deg, #020817 0%, #0f2d6b 100%)", padding: "88px 32px" }}>
        <div style={{ maxWidth: 600, margin: "0 auto" }}>
          {submitted ? (
            <div style={{ textAlign: "center", padding: "32px 0" }}>
              <div style={{
                width: 64, height: 64, background: "#22C55E", borderRadius: "50%",
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 24px",
              }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>
              </div>
              <h2 style={{ color: "white", fontSize: 28, fontWeight: 800, marginBottom: 12 }}>We'll be in touch within 48 hours!</h2>
              <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 16, lineHeight: 1.7, marginBottom: 28 }}>
                Our team will review your requirements and send a tailored quote. For urgent needs, WhatsApp us directly.
              </p>
              <a href="https://wa.me/918208990366?text=Hi%2C%20I%20just%20filled%20your%20quote%20form%20and%20need%20faster%20assistance."
                target="_blank" rel="noreferrer"
                style={{
                  background: "#25D366", color: "white",
                  padding: "14px 28px", fontWeight: 700, fontSize: 14,
                  textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 8,
                }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                WhatsApp for faster response
              </a>
            </div>
          ) : (
            <>
              <p style={{ color: "#93c5fd", fontSize: 11, fontWeight: 700, letterSpacing: "2.5px", textTransform: "uppercase", marginBottom: 16, textAlign: "center" }}>
                GET YOUR FREE QUOTE
              </p>
              <h2 style={{ color: "white", fontSize: "clamp(1.6rem, 3.5vw, 2.2rem)", fontWeight: 800, textAlign: "center", marginBottom: 12 }}>
                Get a personalised quote in 48 hours.
              </h2>
              <p style={{ color: "rgba(255,255,255,0.5)", textAlign: "center", fontSize: 15, lineHeight: 1.7, marginBottom: 40 }}>
                Tell us what you need. We'll match your current vendor price — or beat it.
              </p>

              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {[
                  { key: "name", label: "Your Name *", placeholder: "e.g. Priya Sharma", required: true, type: "text" },
                  { key: "company", label: "Company / Brand Name *", placeholder: "e.g. ZestFoods India", required: true, type: "text" },
                  { key: "email", label: "Email Address *", placeholder: "you@company.com", required: true, type: "email" },
                  { key: "phone", label: "WhatsApp / Phone *", placeholder: "+91 98765 43210", required: true, type: "tel" },
                  { key: "spend", label: "Monthly Packaging Spend (approx)", placeholder: "e.g. ₹2 lakh/month", required: false, type: "text" },
                ].map(field => (
                  <div key={field.key}>
                    <label style={{ display: "block", color: "rgba(255,255,255,0.65)", fontSize: 13, fontWeight: 600, marginBottom: 8 }}>
                      {field.label}
                    </label>
                    <input
                      type={field.type}
                      placeholder={field.placeholder}
                      required={field.required}
                      value={(form as any)[field.key]}
                      onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value }))}
                      style={{
                        width: "100%", background: "rgba(255,255,255,0.06)",
                        border: "1px solid rgba(255,255,255,0.15)",
                        color: "white", padding: "12px 16px", fontSize: 15,
                        outline: "none", boxSizing: "border-box",
                        borderRadius: 0,
                      }}
                    />
                  </div>
                ))}
                <button type="submit" style={{
                  background: "#E8A838", color: "#0D1B2A",
                  padding: "16px", fontWeight: 800, fontSize: 15,
                  border: "none", cursor: "pointer", marginTop: 8,
                  letterSpacing: "0.02em",
                }}>
                  Get My Free Quote in 48 Hours →
                </button>
                <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 12, textAlign: "center", margin: "4px 0 0" }}>
                  No commitment. Price match guarantee on first order.
                </p>
              </form>
            </>
          )}
        </div>
      </section>

      {/* ── Minimal footer ── */}
      <div style={{
        background: "#020617", padding: "24px 32px",
        borderTop: "1px solid rgba(255,255,255,0.06)",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        flexWrap: "wrap", gap: 12,
      }}>
        <span style={{ color: "#475569", fontSize: 13 }}>© {new Date().getFullYear()} Packworkz India</span>
        <div style={{ display: "flex", gap: 20 }}>
          <Link href="/" style={{ color: "#475569", fontSize: 13, textDecoration: "none" }}>Main site</Link>
          <Link href="/products" style={{ color: "#475569", fontSize: 13, textDecoration: "none" }}>Products</Link>
          <a href="https://wa.me/918208990366" target="_blank" rel="noreferrer" style={{ color: "#475569", fontSize: 13, textDecoration: "none" }}>WhatsApp</a>
        </div>
      </div>
    </div>
  );
}
