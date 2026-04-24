import { useState, useEffect, useRef } from "react";
import { GitBranch, ShieldCheck, Truck, CreditCard, Globe, Paintbrush } from "lucide-react";

const NODES = [
  {
    icon: GitBranch,
    label: "Multi-Vendor Backup",
    stat: "Zero delays due to vendor failure",
    title: "3 backup vendors. Always.",
    body: "Every order has 3 qualified vendors assigned simultaneously. If your primary vendor misses a deadline — a backup ships without delay. Your production line never waits.",
  },
  {
    icon: ShieldCheck,
    label: "End-to-End QC",
    stat: "98.7% QC first-pass rate",
    title: "We inspect. You approve.",
    body: "Pre-production sample approval. Mid-production check on orders above ₹2L. Pre-dispatch inspection on every order. We own the quality outcome — not your vendor.",
  },
  {
    icon: Globe,
    label: "Global Compliance",
    stat: "5 global certifications on every order",
    title: "Your buyer never rejects us.",
    body: "ISO 9001, FSSC 22000, BRC, FDA, FSC — all factory partners certified. Export documentation included with every order. International buyers cleared.",
  },
  {
    icon: CreditCard,
    label: "Net-30 Credit",
    stat: "3% saved = ₹30,000/yr on ₹10L spend",
    title: "Credit you earn. Not beg for.",
    body: "New clients start on advance terms. After 3 completed orders apply for Net-30 credit up to ₹5L. Or pay upfront and save 3% on every order.",
  },
  {
    icon: Truck,
    label: "Logistics Owned",
    stat: "40+ countries delivered to",
    title: "Door to door. Tracked.",
    body: "We manage factory pickup, interstate freight, customs documentation, and last-mile delivery. Real-time tracking in your dashboard at every stage.",
  },
  {
    icon: Paintbrush,
    label: "Packaging Design",
    stat: "₹1,999 · adjusted against first order",
    title: "Brief us. Done in 5 days.",
    body: "₹1,999 for print-ready packaging design. Structural dieline + artwork + source files. Works for every SKU including sustainable packs. Fully adjusted against your first order.",
  },
];

const CX = -20;
const CY = 250;
const RADII = [165, 245, 325];

const RING_PLAN = [
  { ringIdx: 2, y: 55 },
  { ringIdx: 1, y: 140 },
  { ringIdx: 0, y: 210 },
  { ringIdx: 0, y: 290 },
  { ringIdx: 1, y: 360 },
  { ringIdx: 2, y: 445 },
];

const POSITIONS = RING_PLAN.map(({ ringIdx, y }) => {
  const r = RADII[ringIdx];
  const dy = y - CY;
  const dx = Math.sqrt(Math.max(0, r * r - dy * dy));
  return { x: CX + dx, y };
});

const TEXT_X = 298;

export default function BrandAdvantageSection() {
  const [active, setActive] = useState(0);
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) setVisible(true);
    }, { threshold: 0.15 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const activeNode = NODES[active];

  return (
    <section style={{ background: "white", padding: "100px 0" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 40px" }}>

        <div ref={ref} className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

          {/* ── Left: Heading + Active Detail ── */}
          <div>
            <span style={{
              color: "#1B6CA8", fontSize: 11, fontWeight: 600,
              letterSpacing: "2px", textTransform: "uppercase",
              display: "block", marginBottom: 14,
            }}>
              THE PACKOPS ADVANTAGE
            </span>
            <h2 style={{
              color: "#0D1B2A", fontSize: "clamp(2rem, 3.5vw, 3rem)",
              fontWeight: 700, lineHeight: 1.1, marginBottom: 20, maxWidth: 440,
            }}>
              Why the best packaging brands choose a platform over a vendor.
            </h2>
            <p style={{ color: "#64748B", fontSize: 15, lineHeight: 1.7, marginBottom: 36, maxWidth: 420 }}>
              PackOps is not another vendor. It is a managed platform with backup coverage, owned QC, global compliance, and real-time visibility — all in one place.
            </p>

            <div
              key={active}
              style={{
                borderLeft: "3px solid #E8A838",
                paddingLeft: 20,
                animation: "fadeInLeft 0.2s ease",
              }}
            >
              <p style={{ color: "#0D1B2A", fontWeight: 700, fontSize: 18, marginBottom: 10 }}>
                {activeNode.title}
              </p>
              <p style={{ color: "#64748B", fontSize: 14, lineHeight: 1.7, marginBottom: 14 }}>
                {activeNode.body}
              </p>
              <div style={{
                background: "rgba(232,168,56,0.1)",
                borderRadius: 8, padding: "8px 14px", display: "inline-block",
              }}>
                <span style={{ color: "#0D1B2A", fontSize: 13, fontWeight: 600 }}>
                  {activeNode.stat}
                </span>
              </div>
            </div>
          </div>

          {/* ── Right: SVG Arc Diagram (desktop) ── */}
          <div
            className="hidden lg:block"
            style={{
              position: "relative", height: 500,
              opacity: visible ? 1 : 0,
              transition: "opacity 0.6s ease",
            }}
          >
            <svg
              viewBox="0 0 560 500"
              width="100%"
              height="100%"
              style={{ overflow: "visible" }}
            >
              {/* Concentric circle arcs */}
              {RADII.map((r, i) => (
                <circle
                  key={i}
                  cx={CX}
                  cy={CY}
                  r={r}
                  fill="none"
                  stroke="#E2EAF4"
                  strokeWidth="1"
                />
              ))}

              {/* Nodes + lines + labels */}
              {NODES.map((node, i) => {
                const pos = POSITIONS[i];
                const isActive = active === i;
                const Icon = node.icon;
                return (
                  <g
                    key={i}
                    style={{ cursor: "pointer" }}
                    onMouseEnter={() => setActive(i)}
                  >
                    {/* Dashed connector line */}
                    <line
                      x1={pos.x + 23}
                      y1={pos.y}
                      x2={TEXT_X - 6}
                      y2={pos.y}
                      stroke={isActive ? "#E8A838" : "#C8D5E8"}
                      strokeWidth="1"
                      strokeDasharray="4 3"
                      style={{ transition: "stroke 0.2s" }}
                    />

                    {/* Node circle */}
                    <circle
                      cx={pos.x}
                      cy={pos.y}
                      r={22}
                      fill={isActive ? "#1B6CA8" : "#0D1B2A"}
                      style={{ transition: "fill 0.2s, r 0.2s" }}
                    />

                    {/* Hover ring */}
                    {isActive && (
                      <circle
                        cx={pos.x}
                        cy={pos.y}
                        r={29}
                        fill="none"
                        stroke="rgba(27,108,168,0.2)"
                        strokeWidth="1.5"
                      />
                    )}

                    {/* Icon via foreignObject */}
                    <foreignObject
                      x={pos.x - 12}
                      y={pos.y - 12}
                      width={24}
                      height={24}
                      style={{ pointerEvents: "none", overflow: "visible" }}
                    >
                      <div
                        style={{
                          width: 24, height: 24,
                          display: "flex", alignItems: "center", justifyContent: "center",
                        }}
                      >
                        <Icon size={13} color="white" strokeWidth={2.5} />
                      </div>
                    </foreignObject>

                    {/* Invisible large hover target */}
                    <circle cx={pos.x} cy={pos.y} r={34} fill="transparent" />

                    {/* Label */}
                    <text
                      x={TEXT_X}
                      y={pos.y - 3}
                      fill={isActive ? "#0D1B2A" : "#374151"}
                      fontSize={13}
                      fontWeight={isActive ? 700 : 600}
                      fontFamily="'Plus Jakarta Sans', sans-serif"
                      style={{ transition: "fill 0.2s" }}
                    >
                      {node.label}
                    </text>

                    {/* Stat sub-label */}
                    <text
                      x={TEXT_X}
                      y={pos.y + 14}
                      fill={isActive ? "#1B6CA8" : "#94A3B8"}
                      fontSize={11}
                      fontFamily="'Plus Jakarta Sans', sans-serif"
                      style={{ transition: "fill 0.2s" }}
                    >
                      {node.stat.length > 34 ? node.stat.slice(0, 34) + "…" : node.stat}
                    </text>
                  </g>
                );
              })}
            </svg>

            <style>{`
              @keyframes fadeInLeft {
                from { opacity: 0; transform: translateX(-8px); }
                to   { opacity: 1; transform: translateX(0); }
              }
            `}</style>
          </div>

          {/* ── Mobile: Accordion list ── */}
          <div className="lg:hidden space-y-3">
            {NODES.map((node, i) => {
              const Icon = node.icon;
              const open = active === i;
              return (
                <div
                  key={i}
                  onClick={() => setActive(open ? 0 : i)}
                  style={{
                    border: `1px solid ${open ? "#E8A838" : "#E2EAF4"}`,
                    borderLeft: `3px solid ${open ? "#E8A838" : "#E2EAF4"}`,
                    borderRadius: "0 10px 10px 0",
                    background: "white",
                    overflow: "hidden",
                    cursor: "pointer",
                    transition: "border-color 0.2s",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px 20px" }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: "50%",
                      background: open ? "#1B6CA8" : "#0D1B2A",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      flexShrink: 0, transition: "background 0.2s",
                    }}>
                      <Icon size={18} color="white" />
                    </div>
                    <span style={{ fontWeight: 700, color: "#0D1B2A", fontSize: 15 }}>{node.label}</span>
                    <span style={{ marginLeft: "auto", color: "#94A3B8", fontSize: 20, lineHeight: 1 }}>{open ? "−" : "+"}</span>
                  </div>
                  {open && (
                    <div style={{ padding: "0 20px 18px" }}>
                      <p style={{ fontWeight: 700, color: "#0D1B2A", marginBottom: 6, fontSize: 15 }}>{node.title}</p>
                      <p style={{ color: "#64748B", fontSize: 14, lineHeight: 1.65, marginBottom: 10 }}>{node.body}</p>
                      <div style={{ background: "rgba(232,168,56,0.1)", borderRadius: 8, padding: "8px 12px", display: "inline-block" }}>
                        <span style={{ color: "#0D1B2A", fontSize: 13, fontWeight: 600 }}>{node.stat}</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
