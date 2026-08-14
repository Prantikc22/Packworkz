import { useMemo, useState } from "react";
import { Link } from "wouter";

const PROBLEM_CARDS = [
  { title: "Production halted",   desc: "One missing pouch stops 10,000 units from shipping. The real cost is lost sales, not the pouch." },
  { title: "Emergency orders",    desc: "Rush reorders compress supplier choice, freight options and quality-review time when the stock signal arrives late." },
  { title: "Forecast blindness",  desc: "Most brands order reactively — only after stock hits zero. By then, it's already too late." },
];

const HOW_STEPS = [
  { step: "01", title: "Consumption Pattern Analysis",    desc: "SmartStock monitors your order velocity across seasons, campaigns, and market cycles — building a brand-specific demand model that improves with every order.", color: "#60a5fa" },
  { step: "02", title: "Predictive Reorder Triggers",     desc: "Before your stock hits the danger zone, SmartStock raises a reorder flag — with the exact quantities, timing, and variant breakdown your production schedule needs.", color: "#a78bfa" },
  { step: "03", title: "Buffer Inventory Planning",desc: "For eligible repeat SKUs, the reorder plan can include a reviewed safety buffer based on consumption and supplier lead time.", color: "#34d399" },
  { step: "04", title: "Supply Route Review",        desc: "The order record can hold compatible supplier routes and dispatch milestones so an exception has a prepared response.", color: "#f59e0b" },
];

const VALUE_CARDS = [
  { index: "01", title: "Earlier decisions",        desc: "A reorder signal arrives while standard production and freight options are still available for review.", accent: "#60a5fa" },
  { index: "02", title: "Risk made visible", desc: "Stock coverage, daily consumption and supplier lead time are shown together instead of split across spreadsheets.", accent: "#34d399" },
  { index: "03", title: "No Manual Forecasting",   desc: "Your team stops tracking spreadsheets and starts scaling. The system raises the flag — all you do is approve.", accent: "#a78bfa" },
  { index: "04", title: "Always Getting Smarter",  desc: "Every order cycle refines the model. The longer you're on Packworkz, the more accurate your SmartStock predictions become.", accent: "#f59e0b" },
];

const PROOF_STATS = [
  { val: "30", unit: "days", label: "Forecast window shown" },
  { val: "3",   unit: "",     label: "Live demo SKUs" },
  { val: "45",  unit: "days",  label: "Coverage model" },
  { val: "1",  unit: "",    label: "Decision workspace" },
];

const ELIGIBILITY = [
  { label: "Repeat orders across", val: "2+ cycles" },
  { label: "Minimum order size",   val: "By SKU" },
  { label: "Setup",       val: "Order history review" },
];

const DEMO_SKUS = [
  { name: "Mailer Box 9x6x3", stock: 18400, daily: 920, lead: 10, buffer: 5500, vendor: "Bengaluru Node", risk: "Medium", unitCost: 24, revenueRisk: 460000 },
  { name: "Stand-up Pouch 250g", stock: 32600, daily: 740, lead: 14, buffer: 9000, vendor: "Ahmedabad Flex", risk: "Low", unitCost: 10, revenueRisk: 610000 },
  { name: "Poly Mailer M", stock: 7200, daily: 680, lead: 7, buffer: 4200, vendor: "Delhi E-com", risk: "High", unitCost: 6, revenueRisk: 380000 },
];

export function SmartStockDemo({ standalone = false }: { standalone?: boolean }) {
  const [campaignLift, setCampaignLift] = useState(18);
  const [selected, setSelected] = useState(2);
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);
  const sku = DEMO_SKUS[selected];
  const adjustedDaily = Math.round(sku.daily * (1 + campaignLift / 100));
  const daysLeft = Math.max(1, Math.floor(sku.stock / adjustedDaily));
  const reorderIn = Math.max(0, daysLeft - sku.lead - 4);
  const suggestedQty = Math.ceil((adjustedDaily * 45 + sku.buffer) / 100) * 100;
  const annualEmergencySavings = Math.round(suggestedQty * sku.unitCost * 0.28 * 4);
  const revenueProtected = Math.round(sku.revenueRisk * (1 + campaignLift / 100));
  const workingCapitalReleased = Math.round(suggestedQty * sku.unitCost * 0.14);
  const annualImpact = annualEmergencySavings + revenueProtected + workingCapitalReleased;

  const alertColor = reorderIn <= 2 ? "#E8A838" : "#AFC1D2";

  const forecast = useMemo(() => {
    return Array.from({ length: 10 }, (_, i) => {
      const projected = Math.max(0, sku.stock - adjustedDaily * (i + 1) * 3);
      return {
        day: (i + 1) * 3,
        units: projected,
        height: Math.max(8, Math.round((projected / sku.stock) * 100)),
      };
    });
  }, [adjustedDaily, sku]);

  return (
    <section className={`smartstock-demo-section${standalone ? " smartstock-demo-standalone" : ""}`}>
      <div className="smartstock-demo-shell">
        <div style={{ display: "grid", gridTemplateColumns: "0.78fr 1.22fr", gap: 40, alignItems: "center" }} className="smartstock-demo-grid">
          <div>
            {standalone && (
              <Link href="/smartstock" className="smartstock-demo-back">
                <span className="material-symbols-outlined">arrow_back</span>
                About SmartStock
              </Link>
            )}
            <p style={{ color: "#1B6CA8", fontSize: 11, fontWeight: 800, letterSpacing: 0, textTransform: "uppercase", marginBottom: 14 }}>
              {standalone ? "INTERACTIVE DEMO / SAMPLE DATA" : "SMARTSTOCK™ / AI INVENTORY"}
            </p>
            <h2 style={{ color: "#0D1B2A", fontFamily: "'Space Grotesk', sans-serif", fontSize: "clamp(2.2rem,4vw,4rem)", lineHeight: 1.05, fontWeight: 900, letterSpacing: 0, marginBottom: 16 }}>
              {standalone ? "Change the forecast. See the decision." : "Your next packaging order, already anticipated."}
            </h2>
            <p style={{ color: "#64748B", fontSize: 16, lineHeight: 1.8, marginBottom: 26 }}>
              {standalone ? (
                "Adjust the expected increase in orders or switch SKUs. SmartStock instantly recalculates when to reorder, how much to buy, and the cost of waiting."
              ) : (
                <><strong style={{ color: "#0D1B2A" }}>SmartStock</strong> learns from repeat orders, signals risk early, and prepares the quantity and supplier path before a packaging shortage becomes urgent.</>
              )}
            </p>
            <div className="smartstock-try-hint">
              <span className="material-symbols-outlined">touch_app</span>
              Try it: move the slider or select a different SKU
            </div>
            <div className="smartstock-control-card">
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, marginBottom: 12 }}>
                <span className="smartstock-control-label">
                  Expected demand increase
                  <button type="button" className="smartstock-help" aria-label="What does expected demand increase mean?">
                    <span className="material-symbols-outlined">help</span>
                    <span className="smartstock-tooltip" role="tooltip">The extra orders you expect from a sale, product launch, festive period, or marketing campaign.</span>
                  </button>
                </span>
                <strong style={{ color: "#1B6CA8" }}>+{campaignLift}%</strong>
              </div>
              <input
                type="range"
                min="0"
                max="60"
                value={campaignLift}
                onChange={(event) => setCampaignLift(Number(event.target.value))}
                style={{ width: "100%", accentColor: "#1B6CA8" }}
              />
            </div>
            <Link href="/smartstock" className="smartstock-learn-more">
              Learn how SmartStock works <span className="material-symbols-outlined">arrow_forward</span>
            </Link>
          </div>

          <div className="smartstock-demo-stage">
          <div className="smartstock-dashboard">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div>
                <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 11, letterSpacing: 0, textTransform: "uppercase", fontWeight: 800 }}>SmartStock inventory view</p>
                <h3 style={{ color: "white", fontFamily: "'Space Grotesk', sans-serif", fontSize: 20, fontWeight: 900, marginTop: 4 }}>Packaging command center</h3>
              </div>
              <span style={{ background: "rgba(255,255,255,0.05)", color: "#C7D5E5", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 2, padding: "7px 10px", fontSize: 11, fontWeight: 800 }}>LIVE SIMULATION</span>
            </div>

            <div className="smartstock-impact-strip">
              <span>Simulated 12-month impact</span>
              <strong>₹{annualImpact.toLocaleString("en-IN")}</strong>
              <small>cost avoided + revenue protected + cash released</small>
            </div>

            <p className="smartstock-dashboard-hint"><span className="material-symbols-outlined">ads_click</span> Select a SKU to update the forecast</p>
            <div className="smartstock-sku-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 14 }}>
              {DEMO_SKUS.map((item, i) => (
                <button
                  key={item.name}
                  onClick={() => setSelected(i)}
                  style={{
                    textAlign: "left",
                    border: selected === i ? "1px solid #5E8FD0" : "1px solid rgba(255,255,255,0.10)",
                    background: selected === i ? "rgba(65,111,174,0.18)" : "rgba(255,255,255,0.05)",
                    color: "white",
                    borderRadius: 2,
                    padding: 12,
                    cursor: "pointer",
                  }}
                >
                  <strong style={{ display: "block", fontSize: 12, lineHeight: 1.35 }}>{item.name}</strong>
                  <span style={{ color: "rgba(255,255,255,0.48)", fontSize: 11 }}>{item.stock.toLocaleString()} units</span>
                </button>
              ))}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1.05fr 0.95fr", gap: 12 }} className="smartstock-panel-grid">
              <div style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: 2, padding: 18 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12, marginBottom: 18 }}>
                  <div>
                    <p style={{ color: "rgba(255,255,255,0.48)", fontSize: 11, textTransform: "uppercase", letterSpacing: 0, fontWeight: 800 }}>Selected SKU</p>
                    <h4 style={{ color: "white", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 900, fontSize: 18, marginTop: 4 }}>{sku.name}</h4>
                  </div>
                  <span style={{ color: alertColor, fontWeight: 900 }}>{sku.risk} risk</span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
                  {[
                    { label: "Days left", value: daysLeft },
                    { label: "Reorder in", value: `${reorderIn}d` },
                    { label: "Daily burn", value: adjustedDaily },
                  ].map((stat) => (
                    <div key={stat.label} style={{ background: "rgba(255,255,255,0.06)", borderRadius: 2, padding: 12 }}>
                      <p style={{ color: "white", fontSize: 24, fontWeight: 900, lineHeight: 1 }}>{stat.value}</p>
                      <span style={{ color: "rgba(255,255,255,0.45)", fontSize: 10, textTransform: "uppercase", letterSpacing: 0 }}>{stat.label}</span>
                    </div>
                  ))}
                </div>
                <div className="smartstock-forecast-chart">
                  {forecast.map((point, i) => (
                    <button
                      type="button"
                      key={point.day}
                      className="smartstock-forecast-bar"
                      aria-label={`Day ${point.day}: ${point.units.toLocaleString("en-IN")} units projected`}
                      onMouseEnter={() => setHoveredBar(i)}
                      onMouseLeave={() => setHoveredBar(null)}
                      onFocus={() => setHoveredBar(i)}
                      onBlur={() => setHoveredBar(null)}
                      style={{
                        height: `${point.height}%`,
                        background: point.height < 25 ? "#C7933A" : point.height < 45 ? "#70859B" : "#3F6FA8",
                      }}
                    >
                      <span className={`smartstock-chart-tooltip${hoveredBar === i ? " visible" : ""}`}>
                        <strong>Day {point.day}</strong>
                        {point.units.toLocaleString("en-IN")} units left
                      </span>
                    </button>
                  ))}
                </div>
                <div className="smartstock-chart-caption"><span>Today</span><span>Projected stock over 30 days</span><span>Day 30</span></div>
              </div>

              <div style={{ display: "grid", gap: 12 }}>
                <div style={{ background: "#ffffff", borderRadius: 2, padding: 18 }}>
                  <p style={{ color: "#64748B", fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: 0 }}>Recommended reorder</p>
                  <h4 style={{ color: "#0D1B2A", fontFamily: "'Space Grotesk', sans-serif", fontSize: 26, fontWeight: 900, margin: "8px 0 4px" }}>{suggestedQty.toLocaleString()} units</h4>
                  <p style={{ color: "#64748B", fontSize: 13, lineHeight: 1.55 }}>Place reorder through {sku.vendor}. Holds 45 days of expected demand plus safety buffer.</p>
                </div>
                <div className="smartstock-value-stack">
                  <div><span>Emergency cost avoided</span><strong>₹{annualEmergencySavings.toLocaleString("en-IN")}</strong></div>
                  <div><span>Revenue protected</span><strong>₹{revenueProtected.toLocaleString("en-IN")}</strong></div>
                  <div><span>Working capital released</span><strong>₹{workingCapitalReleased.toLocaleString("en-IN")}</strong></div>
                </div>
                <Link href="/configure">
                  <button className="btn-fill btn-amber w-full py-3 text-sm">
                    <span>Review reorder plan</span>
                  </button>
                </Link>
              </div>
            </div>
          </div>
          {!standalone && (
            <p className="smartstock-demo-note"><strong>Feel the value before signing in.</strong> This sample dashboard recalculates the reorder decision as you change demand or switch SKUs.</p>
          )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default function SmartStock() {
  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

      {/* ── HERO ── */}
      <section className="relative overflow-hidden" style={{ background: "linear-gradient(135deg, #020817 0%, #071a45 40%, #0f2d7a 100%)", padding: "140px 40px 100px", textAlign: "center", minHeight: "70vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="pw-glow-drift absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(59,130,246,0.16) 0%, transparent 70%)" }} />
        <div className="pw-glow-drift-slow absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 35% 30% at 75% 65%, rgba(96,165,250,0.07) 0%, transparent 55%)" }} />
        <div style={{ position: "relative", zIndex: 1, maxWidth: 820, margin: "0 auto" }}>
          <div className="pw-reveal" style={{ display: "inline-flex", alignItems: "center", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 9999, padding: "6px 18px", marginBottom: 28 }}>
            <span style={{ color: "#E8A838", fontSize: 10, fontWeight: 700, letterSpacing: "2.5px", textTransform: "uppercase" }}>PACKWORKZ TECHNOLOGY</span>
          </div>
          <h1 className="pw-reveal pw-d1" style={{ color: "white", fontSize: "clamp(2.8rem,6vw,5rem)", fontWeight: 900, lineHeight: 1.05, letterSpacing: "-2px", marginBottom: 28 }}>
            SmartStock™<br />
            <span style={{ color: "#60a5fa", fontStyle: "italic" }}>AI Inventory.</span>
          </h1>
          <p className="pw-reveal pw-d2" style={{ color: "rgba(255,255,255,0.50)", fontSize: "clamp(16px,2vw,20px)", lineHeight: 1.7, maxWidth: 580, margin: "0 auto 48px" }}>
            The intelligence layer that eliminates packaging stockouts before they happen. Built exclusively for Packworkz customers — no configuration required.
          </p>
          <div className="pw-reveal pw-d3" style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            <span className="animated-border animated-border-white">
              <Link href="/smartstock/demo"><button className="btn-fill btn-amber px-8 py-3 text-sm pw-btn-transition">Open Interactive Demo →</button></Link>
            </span>
            <Link href="/configure"><button className="btn-fill btn-outline-white px-8 py-3 text-sm pw-btn-transition">Get a Quote</button></Link>
          </div>
        </div>
      </section>

      {/* ── PROOF BAR ── */}
      <section style={{ background: "#08080f", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
        <div style={{ maxWidth: 860, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(4,1fr)", padding: "0 24px" }}>
          {PROOF_STATS.map((s, i) => (
            <div key={i} className={`pw-reveal pw-d${i + 1}`} style={{ padding: "32px 16px", textAlign: "center", borderRight: i < 3 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
              <p style={{ color: "white", fontSize: "clamp(2rem,3vw,2.8rem)", fontWeight: 800, lineHeight: 1, letterSpacing: "-1px" }}>{s.val}<span style={{ fontSize: "0.55em", color: "#60a5fa", marginLeft: 3 }}>{s.unit}</span></p>
              <div style={{ width: 24, height: 2, background: "#C8952A", margin: "10px auto 12px" }} />
              <p style={{ color: "rgba(255,255,255,0.38)", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "1.5px" }}>{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      <SmartStockDemo />

      {/* ── THE PROBLEM ── */}
      <section style={{ background: "#08080f", padding: "100px 40px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div className="pw-reveal" style={{ textAlign: "center", marginBottom: 64 }}>
            <p style={{ color: "#60a5fa", fontSize: 11, fontWeight: 700, letterSpacing: "2.5px", textTransform: "uppercase", marginBottom: 14 }}>THE PROBLEM WE SOLVE</p>
            <h2 style={{ color: "white", fontSize: "clamp(2rem,4vw,3rem)", fontWeight: 800, lineHeight: 1.1, letterSpacing: "-1px" }}>
              Packaging stockouts cost brands more<br />
              <span style={{ color: "rgba(255,255,255,0.42)", fontStyle: "italic" }}>than the packaging itself.</span>
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
            {PROBLEM_CARDS.map((p, i) => (
              <div key={i} className={`pw-reveal pw-lift pw-d${i + 1}`} style={{ background: "rgba(239,68,68,0.04)", border: "1px solid rgba(239,68,68,0.10)", padding: "28px 24px" }}>
                <div style={{ width: 28, height: 2, background: "rgba(239,68,68,0.40)", marginBottom: 16 }} />
                <h3 style={{ color: "rgba(255,255,255,0.82)", fontSize: 15, fontWeight: 700, marginBottom: 10 }}>{p.title}</h3>
                <p style={{ color: "rgba(255,255,255,0.38)", fontSize: 13, lineHeight: 1.7 }}>{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section style={{ background: "#0a0f1e", padding: "100px 40px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div className="pw-reveal" style={{ textAlign: "center", marginBottom: 64 }}>
            <p style={{ color: "#60a5fa", fontSize: 11, fontWeight: 700, letterSpacing: "2.5px", textTransform: "uppercase", marginBottom: 14 }}>HOW IT WORKS</p>
            <h2 style={{ color: "white", fontSize: "clamp(2rem,4vw,3rem)", fontWeight: 800, lineHeight: 1.1, letterSpacing: "-1px" }}>
              Your inventory.<br />
              <span style={{ color: "#60a5fa", fontStyle: "italic" }}>Managed by intelligence.</span>
            </h2>
          </div>
          <div style={{ display: "flex", flexDirection: "column" as const, gap: 0 }}>
            {HOW_STEPS.map((s, i) => (
              <div key={i} className={`pw-reveal pw-d${i + 1}`} style={{ display: "grid", gridTemplateColumns: "80px 1fr", gap: 24, padding: "32px 0", borderBottom: i < HOW_STEPS.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none", alignItems: "flex-start" }}>
                <div style={{ textAlign: "center", paddingTop: 4 }}>
                  <span style={{ fontSize: "clamp(2.5rem,4vw,3.5rem)", fontWeight: 900, color: s.color, opacity: 0.20, lineHeight: 1, letterSpacing: "-2px", fontFamily: "'Space Grotesk', sans-serif" }}>{s.step}</span>
                </div>
                <div>
                  <h3 style={{ color: "white", fontSize: 18, fontWeight: 700, marginBottom: 10 }}>{s.title}</h3>
                  <p style={{ color: "rgba(255,255,255,0.42)", fontSize: 14, lineHeight: 1.75 }}>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── VALUE CARDS ── */}
      <section style={{ background: "#08080f", padding: "100px 40px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div className="pw-reveal" style={{ textAlign: "center", marginBottom: 56 }}>
            <p style={{ color: "#60a5fa", fontSize: 11, fontWeight: 700, letterSpacing: "2.5px", textTransform: "uppercase", marginBottom: 14 }}>THE SMARTSTOCK ADVANTAGE</p>
            <h2 style={{ color: "white", fontSize: "clamp(1.8rem,3.5vw,2.6rem)", fontWeight: 800, lineHeight: 1.1, letterSpacing: "-1px" }}>
              Not a feature. A competitive edge.
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {VALUE_CARDS.map((v, i) => (
              <div key={i} className={`pw-reveal pw-lift pw-d${i + 1}`} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)", borderTop: `2px solid ${v.accent}28`, padding: "32px 28px" }}>
                <div style={{ color: v.accent, fontSize: 11, fontWeight: 800, letterSpacing: "2px", marginBottom: 16 }}>{v.index}</div>
                <h3 style={{ color: "white", fontSize: 16, fontWeight: 700, marginBottom: 10 }}>{v.title}</h3>
                <p style={{ color: "rgba(255,255,255,0.40)", fontSize: 13, lineHeight: 1.7 }}>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ELIGIBILITY ── */}
      <section style={{ background: "#0a0f1e", padding: "80px 40px" }}>
        <div style={{ maxWidth: 720, margin: "0 auto", textAlign: "center" }}>
          <div className="pw-reveal">
            <p style={{ color: "#60a5fa", fontSize: 11, fontWeight: 700, letterSpacing: "2.5px", textTransform: "uppercase", marginBottom: 16 }}>WHO QUALIFIES</p>
            <h2 style={{ color: "white", fontSize: "clamp(1.8rem,3.5vw,2.4rem)", fontWeight: 800, lineHeight: 1.15, marginBottom: 20, letterSpacing: "-0.5px" }}>
              SmartStock activates automatically<br />for qualifying brands.
            </h2>
            <p style={{ color: "rgba(255,255,255,0.40)", fontSize: 15, lineHeight: 1.75, marginBottom: 48 }}>
              Brands with repeat orders across 2+ cycles are automatically evaluated for SmartStock eligibility. There's no form to fill, no integration to set up.
            </p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 48 }}>
            {ELIGIBILITY.map((c, i) => (
              <div key={i} className={`pw-reveal pw-d${i + 1}`} style={{ background: "rgba(96,165,250,0.05)", border: "1px solid rgba(96,165,250,0.10)", padding: "20px 16px", textAlign: "center" }}>
                <p style={{ color: "white", fontSize: 18, fontWeight: 800, marginBottom: 6 }}>{c.val}</p>
                <p style={{ color: "rgba(255,255,255,0.36)", fontSize: 11, textTransform: "uppercase", letterSpacing: "1.5px" }}>{c.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="relative overflow-hidden" style={{ background: "#08080f", padding: "100px 40px", textAlign: "center" }}>
        <div className="pw-glow-drift absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 50% 60% at 50% 100%, rgba(59,130,246,0.12) 0%, transparent 65%)" }} />
        <div className="pw-reveal" style={{ position: "relative", zIndex: 1, maxWidth: 600, margin: "0 auto" }}>
          <p style={{ color: "rgba(255,255,255,0.28)", fontSize: 11, fontWeight: 700, letterSpacing: "2.5px", textTransform: "uppercase", marginBottom: 16 }}>READY TO ELIMINATE STOCKOUTS</p>
          <h2 style={{ color: "white", fontSize: "clamp(2rem,4vw,3rem)", fontWeight: 800, lineHeight: 1.1, letterSpacing: "-1px", marginBottom: 16 }}>
            Start your first Packworkz order.<br />
            <span style={{ color: "#60a5fa", fontStyle: "italic" }}>SmartStock kicks in automatically.</span>
          </h2>
          <p style={{ color: "rgba(255,255,255,0.36)", fontSize: 15, lineHeight: 1.7, marginBottom: 40 }}>
            No integration. No setup. Just place your order — and let the intelligence layer do the rest.
          </p>
          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            <span className="animated-border animated-border-white">
              <Link href="/configure"><button className="btn-fill btn-amber px-8 py-3 text-sm pw-btn-transition">Get a Quote →</button></Link>
            </span>
            <a href="https://wa.me/918208990366?text=Hi%2C%20I%27d%20like%20to%20know%20about%20SmartStock" target="_blank" rel="noopener noreferrer">
              <button className="btn-fill btn-outline-white px-8 py-3 text-sm pw-btn-transition">Talk to an Expert</button>
            </a>
          </div>
          <p style={{ color: "rgba(255,255,255,0.28)", fontSize: 12, marginTop: 14, letterSpacing: "0.2px" }}>
            No minimum for samples · MOQ from 500 units for bulk
          </p>
        </div>
      </section>

    </div>
  );
}
