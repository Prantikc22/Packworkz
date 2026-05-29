import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";

function CountUp({ target, suffix = "", duration = 1500 }: {
  target: number; suffix?: string; duration?: number;
}) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || started) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setStarted(true);
        let t0: number | null = null;
        const step = (ts: number) => {
          if (!t0) t0 = ts;
          const p = Math.min((ts - t0) / duration, 1);
          const ease = 1 - Math.pow(1 - p, 3);
          setCount(Math.floor(ease * target));
          if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
        observer.disconnect();
      }
    }, { threshold: 0.5 });
    observer.observe(el);
    return () => observer.disconnect();
  }, [target, duration, started]);
  return <span ref={ref}>{count}{suffix}</span>;
}

export default function ComparisonSection() {
  const [showAllComparisons, setShowAllComparisons] = useState(false);

  return (
    <section className="relative overflow-hidden" style={{ background: "#08080f", padding: "100px 0 120px" }}>
      <div className="absolute inset-0 pointer-events-none" style={{
        background: "radial-gradient(ellipse 55% 30% at 50% 0%, rgba(27,108,168,0.13) 0%, transparent 70%)",
      }} />

      <div className="relative" style={{ zIndex: 1, maxWidth: 940, margin: "0 auto", padding: "0 24px" }}>

        <div className="scroll-animate" style={{ textAlign: "center", marginBottom: 20 }}>
          <span style={{
            display: "inline-flex", alignItems: "center",
            background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.10)",
            borderRadius: 9999, padding: "6px 18px",
            color: "rgba(255,255,255,0.45)", fontSize: 11, fontWeight: 600, letterSpacing: "2.5px", textTransform: "uppercase",
          }}>
            WHY BRANDS CHOOSE PACKWORKZ
          </span>
        </div>

        <div style={{ textAlign: "center", marginBottom: 14 }}>
          <h2 className="scroll-animate scroll-animate-delay-1" style={{ color: "white", fontSize: "clamp(2.2rem,4.5vw,3.4rem)", fontWeight: 800, lineHeight: 1.05, letterSpacing: "-1.5px" }}>
            Built for modern<br />
            <span style={{ color: "white", fontStyle: "italic", opacity: 0.75 }}>procurement teams.</span>
          </h2>
        </div>
        <p className="scroll-animate scroll-animate-delay-2" style={{ color: "rgba(255,255,255,0.40)", fontSize: 16, textAlign: "center", maxWidth: 420, margin: "0 auto 72px", lineHeight: 1.7 }}>
          Operational resilience designed into every order.
        </p>

        <div className="scroll-animate cmp-stats-grid" style={{ maxWidth: 860, margin: "0 auto 88px" }}>
          {[
            { target: 500, suffix: "+",   label: "Manufacturing Partners" },
            { target: 99,  suffix: ".2%", label: "Dispatch Reliability" },
            { target: 3,   suffix: "×",   label: "Backup Vendors / Order" },
            { target: 48,  suffix: " hr", label: "Resolution SLA" },
          ].map((s, i) => (
            <div key={i} className="cmp-stat-item" style={{ padding: "0 28px", borderRight: i < 3 ? "1px solid rgba(255,255,255,0.07)" : "none" }}>
              <p style={{ color: "white", fontSize: "clamp(2.6rem,3.8vw,3.8rem)", fontWeight: 800, lineHeight: 1, letterSpacing: "-2px" }}>
                <CountUp target={s.target} suffix={s.suffix} duration={1800} />
              </p>
              <div style={{ width: 28, height: 2, background: "#C8952A", margin: "10px 0 14px", flexShrink: 0 }} />
              <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "1.5px", lineHeight: 1.4 }}>
                {s.label}
              </p>
            </div>
          ))}
        </div>

        <div className="scroll-animate cmp-col-headers" style={{ maxWidth: 860, margin: "0 auto 10px" }}>
          <div style={{ background: "rgba(13,27,42,0.70)", border: "1px solid rgba(59,130,246,0.25)", borderBottom: "2px solid rgba(59,130,246,0.65)", padding: "16px 22px", display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#3B82F6", flexShrink: 0 }} />
            <div>
              <p style={{ color: "white", fontSize: 14, fontWeight: 700 }}>Packworkz</p>
              <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 10, textTransform: "uppercase", letterSpacing: "1.5px", marginTop: 2 }}>Managed Platform</p>
            </div>
          </div>
          <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", padding: "16px 22px", display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: "rgba(255,255,255,0.18)", flexShrink: 0 }} />
            <div>
              <p style={{ color: "rgba(255,255,255,0.50)", fontSize: 14, fontWeight: 600 }}>Traditional Vendors</p>
              <p style={{ color: "rgba(255,255,255,0.22)", fontSize: 10, textTransform: "uppercase", letterSpacing: "1.5px", marginTop: 2 }}>Direct Procurement</p>
            </div>
          </div>
        </div>

        <div style={{ maxWidth: 860, margin: "0 auto", display: "flex", flexDirection: "column", gap: 6 }}>
          {([
            { feature: "Vendor redundancy",   good: "3 vetted backup vendors per order — production never stalls.",  bad: "One vendor. Their delay is your delay." },
            { feature: "Quality control",      good: "Our team inspects every dispatch. Photo evidence in dashboard.", bad: "Vendor self-certifies. Rejection risk is yours." },
            { feature: "Pricing transparency", good: "Transparent pricing + 3% discount for upfront payment.",        bad: "Credit terms hide 10–15% markup per unit." },
            { feature: "SKU coverage",         good: "110+ SKUs across all categories. One invoice.",                 bad: "Specialised in one category. Source the rest yourself." },
            { feature: "Compliance & certs",   good: "ISO, BRC, FDA, FSC on file. Export-ready documentation.",       bad: "Certification varies by vendor. Risk sits with you." },
            { feature: "Design service",       good: "Print-ready artwork from ₹1,999. Files yours forever.",         bad: "Mostly unavailable. Third-party dependency." },
            { feature: "Order visibility",     good: "Real-time dashboard — status, dispatch, ETA in one place.",     bad: "WhatsApp updates. No audit trail." },
            { feature: "Problem resolution",   good: "48-hour resolution SLA. Dedicated account manager.",            bad: "Call them. Hope they answer." },
          ] as { feature: string; good: string; bad: string }[]).map((row, i) => (
            <div key={i} className="cmp-card-row" style={{
              display: (i < 3 || showAllComparisons) ? undefined : "none",
              animation: (showAllComparisons && i >= 3) ? `cmp-reveal 0.32s ease ${(i - 3) * 0.07}s both` : undefined,
              marginBottom: 10,
            }}>
              <div
                className="cmp-card-good"
                style={{ background: "rgba(13,27,42,0.65)", border: "1px solid rgba(255,255,255,0.07)", borderLeft: "2px solid rgba(59,130,246,0.55)", padding: "16px 18px", transition: "border-left-color 0.2s, box-shadow 0.2s", cursor: "default" }}
                onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderLeftColor = "#3B82F6"; el.style.boxShadow = "0 6px 24px rgba(0,0,0,0.28)"; }}
                onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderLeftColor = "rgba(59,130,246,0.55)"; el.style.boxShadow = "none"; }}
              >
                <div style={{ display: "flex", alignItems: "flex-start", gap: 11 }}>
                  <span style={{ width: 20, height: 20, borderRadius: "50%", background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.35)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2, color: "#22c55e", fontSize: 11, fontWeight: 800 }}>✓</span>
                  <div>
                    <p style={{ color: "rgba(255,255,255,0.38)", fontSize: 10, fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: 4 }}>
                      {row.feature}<span className="cmp-mobile-label" style={{ display: "none", marginLeft: 8, color: "#3B82F6" }}>· Packworkz</span>
                    </p>
                    <p style={{ color: "rgba(255,255,255,0.88)", fontSize: 13, lineHeight: 1.55, fontWeight: 500 }}>{row.good}</p>
                  </div>
                </div>
              </div>

              <div
                style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)", padding: "16px 18px", transition: "box-shadow 0.2s", cursor: "default" }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 14px rgba(0,0,0,0.18)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = "none"; }}
              >
                <div style={{ display: "flex", alignItems: "flex-start", gap: 11 }}>
                  <span style={{ width: 20, height: 20, borderRadius: "50%", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.22)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2, color: "rgba(239,68,68,0.60)", fontSize: 11, fontWeight: 800 }}>✗</span>
                  <div>
                    <p style={{ color: "rgba(255,255,255,0.20)", fontSize: 10, fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: 4 }}>
                      {row.feature}<span className="cmp-mobile-label" style={{ display: "none", marginLeft: 8, color: "rgba(255,255,255,0.25)" }}>· Traditional</span>
                    </p>
                    <p style={{ color: "rgba(255,255,255,0.32)", fontSize: 13, lineHeight: 1.55 }}>{row.bad}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {!showAllComparisons && (
          <div style={{ maxWidth: 860, margin: "12px auto 0", textAlign: "center" }}>
            <button
              onClick={() => setShowAllComparisons(true)}
              style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.65)", fontSize: 13, fontWeight: 600, padding: "11px 24px", cursor: "pointer", transition: "background 0.2s, color 0.2s" }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.09)"; (e.currentTarget as HTMLElement).style.color = "white"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)"; (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.65)"; }}
            >
              <span>Show all 8 comparisons</span>
              <span style={{ fontSize: 16, lineHeight: 1 }}>↓</span>
            </button>
          </div>
        )}

        <div className="scroll-animate" style={{ maxWidth: 860, margin: "20px auto 0", background: "rgba(13,27,42,0.50)", border: "1px solid rgba(59,130,246,0.18)", padding: "16px 24px", textAlign: "center" }}>
          <p style={{ color: "rgba(255,255,255,0.60)", fontSize: 13, fontWeight: 600 }}>
            Even factoring in vendor credit lines — Packworkz delivers better total cost of ownership.
          </p>
        </div>

        <div className="scroll-animate cmp-cta" style={{ maxWidth: 860, margin: "48px auto 0", background: "rgba(13,27,42,0.60)", border: "1px solid rgba(255,255,255,0.08)", borderTop: "1px solid rgba(59,130,246,0.30)", padding: "44px 48px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
          <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 11, fontWeight: 700, letterSpacing: "2.5px", textTransform: "uppercase", marginBottom: 14 }}>
            READY TO MODERNIZE
          </p>
          <h3 style={{ color: "white", fontSize: "clamp(1.5rem,3vw,2.1rem)", fontWeight: 800, lineHeight: 1.15, marginBottom: 12, letterSpacing: "-0.5px" }}>
            Operational certainty at scale.
          </h3>
          <p style={{ color: "rgba(255,255,255,0.40)", fontSize: 15, maxWidth: 400, lineHeight: 1.7, marginBottom: 32 }}>
            Talk to a packaging specialist and see exactly how Packworkz fits your supply chain.
          </p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
            <span className="animated-border animated-border-white">
              <Link href="/quote">
                <button className="btn-fill btn-amber px-8 py-3 text-sm">Get a Quote →</button>
              </Link>
            </span>
            <a href="https://wa.me/918208990366?text=Hi%20Packworkz%2C%20I%27d%20like%20to%20talk%20to%20an%20expert." target="_blank" rel="noopener noreferrer">
              <button className="btn-fill btn-outline-white px-8 py-3 text-sm">Talk to an Expert</button>
            </a>
          </div>
        </div>

      </div>
    </section>
  );
}
