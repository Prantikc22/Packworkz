import { useState, useEffect, useRef, useCallback } from "react";
import { GitBranch, ShieldCheck, Truck, CreditCard, Globe } from "lucide-react";

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
];

const INTERVAL_MS = 2800;

export default function BrandAdvantageSection() {
  const [active, setActive] = useState(0);
  const [progress, setProgress] = useState(0);
  const [paused, setPaused] = useState(false);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number>(performance.now());
  const pausedAtRef = useRef<number>(0);
  const sectionRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  // Intersection observer — only run timer when visible
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

  // Progress bar + auto-advance
  useEffect(() => {
    if (paused || !inView) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      return;
    }

    const tick = (now: number) => {
      const elapsed = now - startRef.current;
      const pct = Math.min(elapsed / INTERVAL_MS, 1);
      setProgress(pct);
      if (pct >= 1) {
        advance();
      } else {
        rafRef.current = requestAnimationFrame(tick);
      }
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [paused, inView, advance, active]);

  const handleSelect = (i: number) => {
    setActive(i);
    setProgress(0);
    startRef.current = performance.now();
  };

  const activeNode = NODES[active];

  return (
    <section style={{ background: "white", padding: "100px 0" }}>
      <style>{`
        @keyframes adv-fade {
          from { opacity: 0; transform: translateX(-10px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes adv-bar {
          from { width: 0%; }
          to   { width: 100%; }
        }
      `}</style>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 40px" }}>
        <div
          ref={sectionRef}
          className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start"
        >

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
            <p style={{ color: "#64748B", fontSize: 15, lineHeight: 1.7, marginBottom: 40, maxWidth: 420 }}>
              PackOps is not another vendor. It is a managed platform with backup coverage, owned QC, global compliance, and real-time visibility — all in one place.
            </p>

            {/* Active detail panel */}
            <div
              key={active}
              style={{
                borderLeft: "3px solid #E8A838",
                paddingLeft: 24,
                animation: "adv-fade 0.28s ease both",
              }}
            >
              <p style={{ color: "#0D1B2A", fontWeight: 700, fontSize: 19, marginBottom: 10 }}>
                {activeNode.title}
              </p>
              <p style={{ color: "#64748B", fontSize: 14, lineHeight: 1.7, marginBottom: 16 }}>
                {activeNode.body}
              </p>
              <div style={{
                background: "rgba(232,168,56,0.1)",
                border: "1px solid rgba(232,168,56,0.25)",
                padding: "8px 14px", display: "inline-flex", alignItems: "center", gap: 6,
              }}>
                <span style={{ color: "#0D1B2A", fontSize: 13, fontWeight: 600 }}>
                  {activeNode.stat}
                </span>
              </div>
            </div>
          </div>

          {/* ── Right: Clean vertical node list ── */}
          <div
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => { setPaused(false); startRef.current = performance.now() - progress * INTERVAL_MS; }}
          >
            {NODES.map((node, i) => {
              const Icon = node.icon;
              const isActive = active === i;

              return (
                <div
                  key={i}
                  onClick={() => handleSelect(i)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 16,
                    padding: "18px 20px",
                    cursor: "pointer",
                    position: "relative",
                    background: isActive ? "rgba(27,108,168,0.04)" : "transparent",
                    borderLeft: `3px solid ${isActive ? "#E8A838" : "transparent"}`,
                    borderBottom: "1px solid #E2EAF4",
                    transition: "background 0.2s, border-color 0.2s",
                  }}
                >
                  {/* Icon circle */}
                  <div style={{
                    width: 44,
                    height: 44,
                    borderRadius: "50%",
                    background: isActive ? "#1B6CA8" : "#0D1B2A",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    transition: "background 0.25s",
                  }}>
                    <Icon size={18} color="white" strokeWidth={2} />
                  </div>

                  {/* Text */}
                  <div style={{ flex: 1 }}>
                    <p style={{
                      color: isActive ? "#0D1B2A" : "#374151",
                      fontWeight: isActive ? 700 : 600,
                      fontSize: 14,
                      marginBottom: 3,
                      transition: "color 0.2s, font-weight 0.2s",
                    }}>
                      {node.label}
                    </p>
                    <p style={{
                      color: isActive ? "#1B6CA8" : "#94A3B8",
                      fontSize: 12,
                      transition: "color 0.2s",
                    }}>
                      {node.stat}
                    </p>
                  </div>

                  {/* Arrow indicator */}
                  <span style={{
                    color: isActive ? "#E8A838" : "#D1D5DB",
                    fontSize: 18,
                    fontWeight: 700,
                    transition: "color 0.2s, transform 0.2s",
                    transform: isActive ? "translateX(0)" : "translateX(-4px)",
                    display: "block",
                  }}>›</span>

                  {/* Progress bar at the bottom of the active row */}
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
            <div style={{ display: "flex", gap: 6, padding: "16px 20px 0" }}>
              {NODES.map((_, i) => (
                <div
                  key={i}
                  onClick={() => handleSelect(i)}
                  style={{
                    width: i === active ? 20 : 6,
                    height: 6,
                    background: i === active ? "#E8A838" : "#E2EAF4",
                    cursor: "pointer",
                    transition: "width 0.3s, background 0.3s",
                  }}
                />
              ))}
            </div>
          </div>

          {/* ── Mobile: Accordion list ── */}
          <div className="lg:hidden space-y-3 col-span-full lg:col-auto" style={{ display: "none" }}>
            {NODES.map((node, i) => {
              const Icon = node.icon;
              const open = active === i;
              return (
                <div
                  key={i}
                  onClick={() => handleSelect(open ? 0 : i)}
                  style={{
                    border: `1px solid ${open ? "#E8A838" : "#E2EAF4"}`,
                    borderLeft: `3px solid ${open ? "#E8A838" : "#E2EAF4"}`,
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
                    <div style={{ padding: "0 20px 18px", animation: "adv-fade 0.22s ease" }}>
                      <p style={{ fontWeight: 700, color: "#0D1B2A", marginBottom: 6, fontSize: 15 }}>{node.title}</p>
                      <p style={{ color: "#64748B", fontSize: 14, lineHeight: 1.65, marginBottom: 10 }}>{node.body}</p>
                      <div style={{ background: "rgba(232,168,56,0.1)", padding: "8px 12px", display: "inline-block" }}>
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
