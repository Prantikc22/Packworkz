import { useMemo, useState } from "react";
import { Link } from "wouter";
import { FileText, PackageCheck, ShieldCheck } from "lucide-react";

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
  { code: "EC-501", name: "Mailer box · 9 × 6 × 3 in", stock: 18400, daily: 920, lead: 10, buffer: 5500, vendor: "Bengaluru corrugation route", lastReceipt: "12 Aug" },
  { code: "FP-101", name: "Stand-up pouch · 250 g", stock: 32600, daily: 740, lead: 14, buffer: 9000, vendor: "Ahmedabad flexible route", lastReceipt: "08 Aug" },
  { code: "EC-504", name: "Courier mailer · M", stock: 7200, daily: 680, lead: 7, buffer: 4200, vendor: "Delhi ecommerce route", lastReceipt: "19 Aug" },
];

function getStockStatus(stock: number, daily: number, lead: number) {
  const cover = stock / daily;
  if (cover <= lead + 4) return { label: "Action due", tone: "critical" };
  if (cover <= lead + 14) return { label: "Plan soon", tone: "watch" };
  return { label: "Healthy", tone: "healthy" };
}

export function SmartStockDemo({ standalone = false }: { standalone?: boolean }) {
  const [campaignLift, setCampaignLift] = useState(standalone ? 18 : 0);
  const [selected, setSelected] = useState(standalone ? 2 : 1);
  const sku = DEMO_SKUS[selected];
  const adjustedDaily = Math.round(sku.daily * (1 + campaignLift / 100));
  const daysLeft = Math.max(1, Math.floor(sku.stock / adjustedDaily));
  const reorderIn = Math.max(0, daysLeft - sku.lead - 4);
  const suggestedQty = Math.ceil((adjustedDaily * 45 + sku.buffer) / 100) * 100;
  const projectedAtArrival = Math.max(0, sku.stock - adjustedDaily * sku.lead);
  const selectedStatus = getStockStatus(sku.stock, adjustedDaily, sku.lead);

  const forecast = useMemo(() => {
    return Array.from({ length: 11 }, (_, index) => {
      const day = index * 3;
      return { day, units: Math.max(0, sku.stock - adjustedDaily * day) };
    });
  }, [adjustedDaily, sku]);

  const chartPoints = forecast.map((point, index) => {
    const x = 18 + (index / (forecast.length - 1)) * 524;
    const y = 18 + (1 - point.units / sku.stock) * 134;
    return `${x.toFixed(1)},${Math.min(152, y).toFixed(1)}`;
  }).join(" ");
  const safetyLineY = Math.min(152, 18 + (1 - sku.buffer / sku.stock) * 134);

  return (
    <section className={`smartstock-demo-section${standalone ? " smartstock-demo-standalone" : ""}`}>
      <div className="smartstock-demo-shell">
        <div className="smartstock-demo-grid">
          <div className="smartstock-demo-copy">
            {standalone && (
              <Link href="/smartstock" className="smartstock-demo-back">
                <span className="material-symbols-outlined">arrow_back</span>
                About SmartStock
              </Link>
            )}
            <p className="smartstock-demo-eyebrow">SmartStock™ · Reorder planning</p>
            <h2>{standalone ? "Change one assumption. See the plan update." : "Know what needs ordering before it becomes urgent."}</h2>
            <p className="smartstock-demo-intro">
              Stock on hand, recent consumption and supplier lead times are reviewed together, so your team can reorder confidently and avoid last-minute shortages.
            </p>
            {!standalone && <div className="smartstock-home-benefits">
              <div><span><PackageCheck size={25} strokeWidth={1.8} /></span><p><strong>See stock cover clearly</strong><small>Get a real-time view of stock on hand and days of cover.</small></p></div>
              <div><span><FileText size={25} strokeWidth={1.8} /></span><p><strong>Review reorder recommendations</strong><small>See what to order, when and why.</small></p></div>
              <div><span><ShieldCheck size={25} strokeWidth={1.8} /></span><p><strong>Avoid last-minute stockouts</strong><small>Stay ahead of demand and keep operations moving.</small></p></div>
            </div>}
            {standalone && <div className="smartstock-control-card">
              <p className="smartstock-assumption-label">Planning assumption</p>
              <div className="smartstock-control-head">
                <span className="smartstock-control-label">
                  Expected demand change
                  <button type="button" className="smartstock-help" aria-label="What does expected demand increase mean?">
                    <span className="material-symbols-outlined">help</span>
                    <span className="smartstock-tooltip" role="tooltip">The extra orders you expect from a sale, product launch, festive period, or marketing campaign.</span>
                  </button>
                </span>
                <strong>+{campaignLift}%</strong>
              </div>
              <input
                type="range"
                min="0"
                max="60"
                value={campaignLift}
                onChange={(event) => setCampaignLift(Number(event.target.value))}
                aria-label="Expected demand change"
              />
              <div className="smartstock-range-labels"><span>No change</span><span>+60%</span></div>
            </div>}
            <Link href={standalone ? "/smartstock" : "/smartstock/demo"} className="smartstock-learn-more">
              {standalone ? "See eligibility and workflow" : "See SmartStock in action"} <span className="material-symbols-outlined">arrow_forward</span>
            </Link>
          </div>

          <div className="smartstock-demo-stage">
            <div className="smartstock-workspace">
              <div className="smartstock-brand-head"><span className="smartstock-brand-lockup" aria-label="Packworkz"><span className="smartstock-brand-mark" aria-hidden="true"><i /><b /></span><span>Packworkz</span></span><small>Smart procurement for<br />what moves the world.</small></div>
              <header className="smartstock-workspace-head">
                <div>
                  <h3>Packaging reorder plan</h3>
                </div>
                <span className="smartstock-data-state">Sample data · updated today</span>
              </header>

              <div className="smartstock-table" role="listbox" aria-label="Packaging SKUs">
                <div className="smartstock-table-head" aria-hidden="true">
                  <span>Packaging SKU</span><span>On hand</span><span>Cover</span><span>Lead time</span><span>Status</span>
                </div>
                {DEMO_SKUS.map((item, index) => {
                  const itemDaily = Math.round(item.daily * (1 + campaignLift / 100));
                  const itemCover = Math.max(1, Math.floor(item.stock / itemDaily));
                  const itemStatus = getStockStatus(item.stock, itemDaily, item.lead);
                  return (
                    <button
                      type="button"
                      role="option"
                      aria-selected={selected === index}
                      key={item.code}
                      className={`smartstock-table-row${selected === index ? " is-selected" : ""}`}
                      onClick={() => setSelected(index)}
                    >
                      <span className="smartstock-sku-name"><img src={item.code === "EC-501" ? "/skus/mailerbox.jpg" : item.code === "FP-101" ? "/skus/Standup_Pouch.jpg" : "/skus/courierbag.jpg"} alt="" /><span><strong>{item.code}</strong><small>{item.name}</small></span></span>
                      <span>{item.stock.toLocaleString("en-IN")}</span>
                      <span>{itemCover} days</span>
                      <span>{item.lead} days</span>
                      <span className={`smartstock-status smartstock-status-${itemStatus.tone}`}><i />{itemStatus.label}</span>
                    </button>
                  );
                })}
              </div>

              <div className="smartstock-plan-grid">
                <section className="smartstock-forecast-panel">
                  <div className="smartstock-panel-head">
                    <div><p>{sku.code} · Selected SKU</p><h4>{sku.name}</h4></div>
                    <span className={`smartstock-status smartstock-status-${selectedStatus.tone}`}><i />{selectedStatus.label}</span>
                  </div>
                  <dl className="smartstock-metrics">
                    <div><dt>On hand</dt><dd>{sku.stock.toLocaleString("en-IN")}</dd></div>
                    <div><dt>Daily usage</dt><dd>{adjustedDaily.toLocaleString("en-IN")}</dd></div>
                    <div><dt>Days of cover</dt><dd>{daysLeft}</dd></div>
                    <div><dt>Supplier lead</dt><dd>{sku.lead} days</dd></div>
                  </dl>
                  <div className="smartstock-chart-head"><strong>Projected stock</strong><span>Next 30 days</span></div>
                  <div className="smartstock-line-chart">
                    <svg viewBox="0 0 560 176" role="img" aria-label={`Projected stock for ${sku.name} over 30 days`}>
                      <defs>
                        <linearGradient id="smartstockArea" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#2368b3" stopOpacity="0.22" />
                          <stop offset="100%" stopColor="#2368b3" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      <line x1="18" y1={safetyLineY} x2="542" y2={safetyLineY} className="smartstock-safety-line" />
                      <text x="538" y={Math.max(12, safetyLineY - 7)} textAnchor="end" className="smartstock-safety-label">Safety stock</text>
                      <polygon points={`18,152 ${chartPoints} 542,152`} fill="url(#smartstockArea)" />
                      <polyline points={chartPoints} className="smartstock-chart-line" />
                      {forecast.map((point, index) => {
                        const [cx, cy] = chartPoints.split(" ")[index].split(",");
                        return <circle key={point.day} cx={cx} cy={cy} r="3.5"><title>{`Day ${point.day}: ${point.units.toLocaleString("en-IN")} units`}</title></circle>;
                      })}
                    </svg>
                    <div className="smartstock-chart-axis"><span>Today</span><span>Day 15</span><span>Day 30</span></div>
                  </div>
                </section>

                <aside className="smartstock-reorder-panel">
                  <div>
                    <p className="smartstock-next-label">Recommended next step</p>
                    <span className={`smartstock-review-timing smartstock-review-${selectedStatus.tone}`}>
                      {reorderIn === 0 ? "Review now" : `Review in ${reorderIn} days`}
                    </span>
                    <h4>Order {suggestedQty.toLocaleString("en-IN")} units</h4>
                    <p>Draft quantity for 45 days of demand plus the current safety-stock policy.</p>
                  </div>
                  <dl className="smartstock-plan-details">
                    <div><dt>Route</dt><dd>{sku.vendor}</dd></div>
                    <div><dt>Stock at arrival</dt><dd>{projectedAtArrival.toLocaleString("en-IN")} units</dd></div>
                    <div><dt>Safety stock</dt><dd>{sku.buffer.toLocaleString("en-IN")} units</dd></div>
                    <div><dt>Last receipt</dt><dd>{sku.lastReceipt}</dd></div>
                  </dl>
                  <Link href={`/configure?sku=${sku.code}`} className="smartstock-review-button">
                    Draft reorder request <span className="material-symbols-outlined">arrow_forward</span>
                  </Link>
                </aside>
              </div>
              <footer className="smartstock-workspace-foot">
                <span className="material-symbols-outlined">info</span>
                Sample planning view. Recommendations depend on confirmed stock, order history and supplier lead times, and are reviewed before placement.
              </footer>
            </div>
            {!standalone && (
              <p className="smartstock-demo-note">Use the demand assumption or choose a row to see the plan recalculate.</p>
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
            MOQs from 25 units on selected formats · enterprise volumes supported
          </p>
        </div>
      </section>

    </div>
  );
}
