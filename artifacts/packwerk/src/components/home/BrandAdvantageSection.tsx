import { useState, useEffect, useRef, useCallback } from "react";
import { GitBranch, ShieldCheck, Truck, CreditCard, Globe } from "lucide-react";
import { Link } from "wouter";

const NODES = [
  {
    icon: GitBranch,
    label: "Multi-Vendor Backup",
    stat: "Backup routes planned before production",
    title: "Redundancy by design.",
    body: "Eligible repeat orders can be mapped to qualified alternate suppliers before production begins. Capacity and compatibility are checked for the selected specification.",
    bigStat: "Backup",
    bigStatLabel: "sourcing routes where eligible",
  },
  {
    icon: ShieldCheck,
    label: "End-to-End QC",
    stat: "Approval checkpoints attached to the order",
    title: "We inspect. You approve.",
    body: "Pre-production approval, order-appropriate production checks, and pre-dispatch evidence stay attached to the same order record.",
    bigStat: "3-stage",
    bigStatLabel: "approval and inspection workflow",
  },
  {
    icon: Globe,
    label: "Global Compliance",
    stat: "Documents matched to format and factory",
    title: "Compliance with context.",
    body: "Available factory, material, food-contact, and sustainability documents are matched to the selected format instead of shown as blanket platform claims.",
    bigStat: "Matched",
    bigStatLabel: "documentation by specification",
  },
  {
    icon: CreditCard,
    label: "Clear Commercials",
    stat: "Payment terms shown before approval",
    title: "Commercials without surprises.",
    body: "Payment milestones, tooling, samples, taxes, and delivery charges are kept visible in the order record before anything enters production.",
    bigStat: "Clear",
    bigStatLabel: "commercial terms and approvals",
  },
  {
    icon: Truck,
    label: "Logistics Owned",
    stat: "Dispatch milestones in one record",
    title: "Door to door. Tracked.",
    body: "Factory pickup, freight, documents, and delivery milestones can be tracked against the same order instead of chased across vendor conversations.",
    bigStat: "Tracked",
    bigStatLabel: "factory to delivery milestones",
  },
];

const INTERVAL_MS = 3000;

export default function BrandAdvantageSection() {
  const [active, setActive] = useState(0);
  const [progress, setProgress] = useState(0);
  const [paused, setPaused] = useState(false);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number>(performance.now());
  const sectionRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.2 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const advance = useCallback(() => {
    setActive(prev => (prev + 1) % NODES.length);
    setProgress(0);
    startRef.current = performance.now();
  }, []);

  useEffect(() => {
    if (paused || !inView) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      return;
    }
    const tick = (now: number) => {
      const elapsed = now - startRef.current;
      const pct = Math.min(elapsed / INTERVAL_MS, 1);
      setProgress(pct);
      if (pct >= 1) advance();
      else rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [paused, inView, advance, active]);

  const handleSelect = (i: number) => {
    setActive(i);
    setProgress(0);
    startRef.current = performance.now();
  };

  const node = NODES[active];

  return (
    <section id="packworkz-advantage" style={{ background: "white", padding: "100px 0", overflow: "hidden", scrollMarginTop: 92 }}>
      <style>{`
        @keyframes adv-fade {
          from { opacity: 0; transform: translateX(-12px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes stat-pop {
          from { opacity: 0; transform: scale(0.85); }
          to   { opacity: 1; transform: scale(1); }
        }
      `}</style>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 40px" }}>
        <div ref={sectionRef} className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-start">

          {/* ── Left: Heading + Big Stat + Active Detail ── */}
          <div>
            <span style={{
              color: "#1B6CA8", fontSize: 11, fontWeight: 600,
              letterSpacing: "2px", textTransform: "uppercase",
              display: "block", marginBottom: 14,
            }}>
              THE PACKWORKZ ADVANTAGE
            </span>
            <h2 style={{
              color: "#0D1B2A", fontSize: "clamp(1.9rem, 3vw, 2.75rem)",
              fontWeight: 700, lineHeight: 1.15, marginBottom: 20, maxWidth: 420,
            }}>
              Why growing brands choose Packworkz over a single vendor.
            </h2>
            <p style={{ color: "#64748B", fontSize: 15, lineHeight: 1.7, marginBottom: 48, maxWidth: 400 }}>
              Packworkz is not another vendor. It is a managed platform with backup coverage, owned QC, global compliance, and real-time visibility.
            </p>

            {/* Big animated stat */}
            <div key={`stat-${active}`} style={{
              borderLeft: "3px solid #E8A838",
              paddingLeft: 28,
              marginBottom: 36,
              animation: "stat-pop 0.3s ease both",
            }}>
              <p style={{
                color: "#E8A838", fontSize: "clamp(3rem, 6vw, 4.5rem)",
                fontWeight: 800, lineHeight: 1, letterSpacing: "-2px", marginBottom: 4,
              }}>
                {node.bigStat}
              </p>
              <p style={{ color: "#94A3B8", fontSize: 13, fontWeight: 500, textTransform: "uppercase", letterSpacing: "1px" }}>
                {node.bigStatLabel}
              </p>
            </div>

            {/* Active detail */}
            <div key={`detail-${active}`} style={{ animation: "adv-fade 0.28s ease both" }}>
              <p style={{ color: "#0D1B2A", fontWeight: 700, fontSize: 18, marginBottom: 10 }}>
                {node.title}
              </p>
              <p style={{ color: "#64748B", fontSize: 14, lineHeight: 1.7, marginBottom: 16 }}>
                {node.body}
              </p>
            </div>
          </div>

          {/* ── Right: Clean numbered feature list ── */}
          <div
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => { setPaused(false); startRef.current = performance.now() - progress * INTERVAL_MS; }}
          >
            {NODES.map((n, i) => {
              const isActive = active === i;
              return (
                <div
                  key={i}
                  onClick={() => handleSelect(i)}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 20,
                    padding: "22px 0",
                    cursor: "pointer",
                    position: "relative",
                    borderBottom: "1px solid rgba(232,236,244,0.45)",
                    borderLeft: `3px solid ${isActive ? "#E8A838" : "transparent"}`,
                    paddingLeft: isActive ? 20 : 3,
                    transition: "all 0.25s ease",
                    background: isActive ? "rgba(232,168,56,0.03)" : "transparent",
                  }}
                >
                  {/* Number */}
                  <span style={{
                    fontSize: 11, fontWeight: 700, fontFamily: "monospace",
                    color: isActive ? "#E8A838" : "#D1D5DB",
                    minWidth: 24, paddingTop: 2,
                    transition: "color 0.25s",
                  }}>
                    {String(i + 1).padStart(2, "0")}
                  </span>

                  {/* Text */}
                  <div style={{ flex: 1 }}>
                    <p style={{
                      color: isActive ? "#0D1B2A" : "#64748B",
                      fontWeight: isActive ? 700 : 500,
                      fontSize: 15, marginBottom: 3,
                      transition: "color 0.25s",
                    }}>
                      {n.label}
                    </p>
                    <p style={{
                      color: isActive ? "#1B6CA8" : "#CBD5E1",
                      fontSize: 12,
                      transition: "color 0.25s",
                    }}>
                      {n.stat}
                    </p>
                  </div>

                  {/* Arrow */}
                  <span style={{
                    color: isActive ? "#E8A838" : "#E2EAF4",
                    fontSize: 18, fontWeight: 700,
                    transform: isActive ? "translateX(0)" : "translateX(-4px)",
                    transition: "all 0.25s",
                  }}>›</span>

                  {/* Progress bar */}
                  {isActive && (
                    <div style={{
                      position: "absolute",
                      left: 3, bottom: 0, height: 2,
                      background: "#E8A838",
                      width: `${progress * 100}%`,
                      transition: "none",
                    }} />
                  )}
                </div>
              );
            })}

            {/* Step dots */}
            <div style={{ display: "flex", gap: 6, paddingTop: 20, marginBottom: 24 }}>
              {NODES.map((_, i) => (
                <div
                  key={i}
                  onClick={() => handleSelect(i)}
                  style={{
                    width: i === active ? 24 : 6, height: 4,
                    background: i === active ? "#E8A838" : "#E2EAF4",
                    cursor: "pointer",
                    transition: "width 0.3s, background 0.3s",
                  }}
                />
              ))}
            </div>

            {/* Small CTA */}
            <div style={{
              background: "#0D1B2A",
              padding: "20px 24px",
              display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16,
            }}>
              <div>
                <p style={{ color: "white", fontSize: 14, fontWeight: 700, marginBottom: 3 }}>
                  Ready to switch from vendor to platform?
                </p>
                <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 12 }}>
                  Get your pricing plan in 48 hours. No commitment.
                </p>
              </div>
              <Link href="/configure">
                <button style={{
                  background: "#E8A838", color: "#0D1B2A",
                  padding: "11px 22px", fontSize: 13, fontWeight: 800,
                  border: "none", cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0,
                }}>
                  Start Configuration →
                </button>
              </Link>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
