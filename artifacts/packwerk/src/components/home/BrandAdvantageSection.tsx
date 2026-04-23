import { useState, useEffect, useRef } from "react";
import {
  GitBranch, ShieldCheck, Truck, CreditCard, Cpu, Globe, Paintbrush, Leaf,
} from "lucide-react";

const NODES = [
  {
    icon: GitBranch,
    label: "Multi-Vendor\nBackup",
    title: "3 backup vendors. Always.",
    body: "Every order has 3 qualified vendors assigned simultaneously. If your primary vendor misses a deadline — a backup ships without delay. Your production line never waits.",
    stat: "0 orders delayed due to vendor failure",
  },
  {
    icon: ShieldCheck,
    label: "End-to-End\nQC",
    title: "We inspect. You approve.",
    body: "Pre-production sample approval. Mid-production check on orders above ₹2L. Pre-dispatch inspection on every order. We own the quality outcome — not your vendor.",
    stat: "98.7% QC first-pass rate",
  },
  {
    icon: Truck,
    label: "Logistics\nOwned",
    title: "Door to door. Tracked.",
    body: "We manage factory pickup, interstate freight, customs documentation, and last-mile delivery. Real-time tracking in your dashboard at every stage.",
    stat: "40+ countries delivered to",
  },
  {
    icon: CreditCard,
    label: "Net-30\nCredit",
    title: "Credit you earn. Not beg for.",
    body: "New clients start on advance terms. After 3 completed orders apply for net-30 credit up to ₹5L. Or pay upfront and save 3% on every order. Your call.",
    stat: "3% saved = ₹30,000/yr on ₹10L spend",
  },
  {
    icon: Cpu,
    label: "PackOS\nTechnology",
    title: "Your packaging runs on PackOS.",
    body: "Factory matching, production tracking, QC checkpoints, SmartStock inventory, and logistics — all in one dashboard. No WhatsApp chasing. No guesswork.",
    stat: "Real-time tracking. Always.",
  },
  {
    icon: Globe,
    label: "Global\nCompliance",
    title: "Your buyer never rejects us.",
    body: "ISO 9001, FSSC 22000, BRC, FDA, FSC — all factory partners certified. Export documentation included with every order. International buyers cleared.",
    stat: "5 global certifications on every order",
  },
  {
    icon: Paintbrush,
    label: "Packaging\nDesign",
    title: "Brief us. Done in 5 days.",
    body: "₹1,999 for print-ready packaging design. Structural dieline + artwork + source files. Works for every SKU including sustainable packs. Fully adjusted against your first order.",
    stat: "₹1,999. Adjusted against first order.",
  },
  {
    icon: Leaf,
    label: "Sustainable\nSKUs",
    title: "Eco is not an afterthought.",
    body: "12 certified sustainable SKUs available at scale. All fully customisable with your brand design. Food-safe, leak-proof, and EPR compliant — built for Indian brands that mean it.",
    stat: "12 sustainable SKUs. All customisable.",
  },
];

const RING_R = 250;
const CX = 300;
const CY = 300;

function nodePos(i: number) {
  const angleDeg = i * 45 - 90;
  const angle = (angleDeg * Math.PI) / 180;
  return {
    x: CX + RING_R * Math.cos(angle),
    y: CY + RING_R * Math.sin(angle),
  };
}

export default function BrandAdvantageSection() {
  const [active, setActive] = useState<number | null>(null);
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const [accordionOpen, setAccordionOpen] = useState<number | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.2 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const activeNode = active !== null ? NODES[active] : null;

  return (
    <section className="py-24 px-8 md:px-20" style={{ background: "white" }}>
      <div className="max-w-7xl mx-auto">
        <p className="font-bold tracking-[0.2em] text-xs uppercase mb-4" style={{ color: "#1B6CA8" }}>
          THE PACKOPS ADVANTAGE
        </p>
        <h2 className="clash-display mb-6" style={{ color: "#0D1B2A", fontSize: "clamp(2rem,4vw,3.25rem)", lineHeight: 1.1, maxWidth: 720 }}>
          Why the best packaging brands choose a platform over a vendor.
        </h2>

        {/* ── Desktop: Orbital Diagram ── */}
        <div ref={ref} className="hidden md:flex items-center justify-center relative" style={{ minHeight: 600 }}>
          {/* Orbital ring */}
          <div className="absolute" style={{
            width: 500, height: 500,
            borderRadius: "50%",
            border: "1px dashed rgba(27,108,168,0.3)",
            left: "50%", top: "50%",
            transform: "translate(-50%, -50%)",
          }} />

          {/* Centre node */}
          <div className="absolute flex flex-col items-center justify-center z-10" style={{
            width: 180, height: 180,
            borderRadius: "50%",
            background: "#0D1B2A",
            left: "50%", top: "50%",
            transform: "translate(-50%, -50%)",
            animation: "pulse-glow 3s ease infinite",
          }}>
            <span className="font-bold text-white text-base text-center leading-tight">PackOps</span>
            <span className="font-bold uppercase tracking-widest mt-1" style={{ color: "#1B6CA8", fontSize: 10 }}>
              Your Packaging OS
            </span>
          </div>

          {/* Feature nodes */}
          {NODES.map((node, i) => {
            const { x, y } = nodePos(i);
            const Icon = node.icon;
            const isActive = active === i;
            const delay = i * 100;
            return (
              <div
                key={i}
                className="absolute cursor-pointer"
                style={{
                  left: `calc(50% + ${x - CX}px)`,
                  top: `calc(50% + ${y - CY}px)`,
                  width: 80, height: 80,
                  transform: "translate(-50%, -50%)",
                  opacity: visible ? 1 : 0,
                  scale: visible ? "1" : "0",
                  transition: `opacity 0.4s ease ${delay}ms, scale 0.4s ease ${delay}ms`,
                }}
                onMouseEnter={() => setActive(i)}
                onMouseLeave={() => setActive(null)}
              >
                <div style={{
                  width: 80, height: 80,
                  borderRadius: "50%",
                  background: "#0D1B2A",
                  border: `2px solid ${isActive ? "#E8A838" : "#1B6CA8"}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transform: isActive ? "scale(1.15)" : "scale(1)",
                  transition: "transform 0.2s, border-color 0.2s",
                }}>
                  <Icon size={24} color="#E8A838" />
                </div>
                <div style={{
                  fontSize: 11, fontWeight: 600,
                  color: "#0D1B2A", textAlign: "center",
                  marginTop: 8, maxWidth: 80, lineHeight: 1.3,
                  whiteSpace: "pre-line",
                }}>
                  {node.label}
                </div>
              </div>
            );
          })}

          {/* Detail panel */}
          {activeNode && (
            <div style={{
              position: "absolute",
              right: 0,
              top: "50%",
              transform: "translateY(-50%)",
              width: 360,
              background: "white",
              borderLeft: "3px solid #E8A838",
              borderRadius: 12,
              padding: 28,
              boxShadow: "0 8px 32px rgba(13,27,42,0.12)",
              opacity: 1,
              animation: "slideIn 0.2s ease",
              zIndex: 20,
            }}>
              <h3 className="font-bold mb-2" style={{ color: "#0D1B2A", fontSize: 20 }}>{activeNode.title}</h3>
              <p className="mb-4 leading-relaxed" style={{ color: "#64748B", fontSize: 15, lineHeight: 1.6 }}>{activeNode.body}</p>
              <div style={{
                background: "rgba(232,168,56,0.1)",
                borderRadius: 8, padding: "10px 14px",
                color: "#0D1B2A", fontSize: 14, fontWeight: 600,
              }}>
                {activeNode.stat}
              </div>
            </div>
          )}
        </div>

        {/* ── Mobile: Accordion ── */}
        <div className="md:hidden mt-8 space-y-3">
          {NODES.map((node, i) => {
            const Icon = node.icon;
            const open = accordionOpen === i;
            return (
              <div key={i} style={{ borderLeft: `3px solid ${open ? "#E8A838" : "#E2EAF4"}`, borderRadius: "0 8px 8px 0", background: "white", border: "1px solid #E2EAF4", borderLeftWidth: 3, borderLeftColor: open ? "#E8A838" : "#E2EAF4" }}>
                <button
                  className="w-full flex items-center gap-3 px-4 py-4 text-left"
                  onClick={() => setAccordionOpen(open ? null : i)}
                >
                  <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#0D1B2A", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Icon size={18} color="#E8A838" />
                  </div>
                  <span className="font-bold" style={{ color: "#0D1B2A", fontSize: 14, whiteSpace: "pre-line" }}>{node.label.replace("\n", " ")}</span>
                  <span className="ml-auto text-slate-400">{open ? "−" : "+"}</span>
                </button>
                {open && (
                  <div className="px-4 pb-4 pt-1">
                    <p className="font-bold mb-2" style={{ color: "#0D1B2A" }}>{node.title}</p>
                    <p className="mb-3" style={{ color: "#64748B", fontSize: 14, lineHeight: 1.6 }}>{node.body}</p>
                    <div style={{ background: "rgba(232,168,56,0.1)", borderRadius: 8, padding: "8px 12px", color: "#0D1B2A", fontSize: 13, fontWeight: 600 }}>
                      {node.stat}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
