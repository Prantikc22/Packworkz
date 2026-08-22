import { useState } from "react";
import { Link } from "wouter";
import { Search, GitBranch, ShieldCheck, Truck, ChevronDown } from "lucide-react";
import { CATALOG_SKUS } from "@/lib/catalog";

const WHATSAPP_NUM = "918208990366";

const STEPS = [
  {
    num: "STEP 01",
    Icon: Search,
    title: "Configure and Price",
    intro:
      "Start by browsing our focused product catalogue or describing what you need. No sales call is required for standard formats.",
    substeps: [
      {
        title: "Browse or describe",
        detail:
          "Find your SKU in our catalogue or tell us what you need — we'll source it.",
      },
      {
        title: "Configure your spec",
        detail:
          "Select material, dimensions, print type, and quantity. Live price estimate updates as you configure.",
      },
      {
        title: "Submit your configuration request",
        detail:
          "Takes under 5 minutes. We review every request manually and respond within 48 hours.",
      },
      {
        title: "Receive itemised pricing plan",
        detail:
          "Detailed breakdown of pricing, timeline, and payment terms. You approve before anything starts.",
      },
    ],
  },
  {
    num: "STEP 02",
    Icon: GitBranch,
    title: "We Source and Match",
    intro:
      "Once you approve the plan, PackOS matches the specification to the best eligible route and plans alternate capacity where compatibility allows.",
    substeps: [
      {
        title: "SmartMatch factory selection",
        detail:
          "PackOS matches your SKU spec to the most suitable factory from our verified network.",
      },
      {
        title: "Alternate routes assessed",
        detail:
          "Compatible factories are assessed against the approved material, tooling and print specification before a backup route is recorded.",
      },
      {
        title: "Pre-production sample",
        detail:
          "A physical sample is produced and sent to you for approval before bulk production begins.",
      },
      {
        title: "You approve before bulk run",
        detail:
          "No bulk production starts without your sign-off on the sample. Your control.",
      },
    ],
  },
  {
    num: "STEP 03",
    Icon: ShieldCheck,
    title: "QC at Every Stage",
    intro:
      "Quality is not your vendor's job. It's ours. Three checkpoints on every order before anything leaves the factory.",
    substeps: [
      {
        title: "Pre-production approval",
        detail:
          "Sample approved by you. Colour, dimensions, material, and print quality confirmed against spec.",
      },
      {
        title: "In-process inspection",
        detail:
          "For orders above ₹2L, our QC team checks mid-production batches. Issues caught before they scale.",
      },
      {
        title: "Pre-dispatch photo check",
        detail:
          "Every single order. Photo evidence uploaded to your dashboard before dispatch.",
      },
      {
        title: "You see everything",
        detail:
          "Photos, batch records, and QC sign-off documents available in your dashboard. No surprises.",
      },
    ],
  },
  {
    num: "STEP 04",
    Icon: Truck,
    title: "Delivered and Tracked",
    intro:
      "We manage factory pickup, interstate freight, customs documentation for exports, and last-mile delivery. One team. One tracking link.",
    substeps: [
      {
        title: "Factory pickup coordinated",
        detail:
          "We arrange collection directly from the factory. You don't coordinate with anyone.",
      },
      {
        title: "Real-time tracking",
        detail:
          "Live tracking link in your dashboard from the moment goods are dispatched. Updated at every milestone.",
      },
      {
        title: "Export documentation handled",
        detail:
          "For international orders — shipping bill, certificate of origin, packing list, and customs docs all managed by our team.",
      },
      {
        title: "Delivered and confirmed",
        detail:
          "Delivery confirmation uploaded to your dashboard. Invoice generated. Reorder available in one click.",
      },
    ],
  },
];

const FAQS = [
  {
    q: "What is the minimum order quantity?",
    a: "MOQ varies by production method. Standard rigid boxes can start at 100 units, many bottles and jars at 200, pouches at 500–1,000, and rollstock at 100kg. Every product page shows its current starting quantity; samples remain available for pre-production evaluation.",
  },
  {
    q: "How does the 48-hour pricing plan work?",
    a: "After you submit a configuration request, our team reviews your spec manually, sources competing pricing plans from our vendor network, and sends you an itemised pricing plan within 48 business hours. No automated responses. A real person handles every request.",
  },
  {
    q: "What payment terms apply?",
    a: "Payment milestones are set out in the commercial proposal before approval. They can vary with tooling, samples, production method, account history, and order value. No credit term or discount applies unless it is written into the approved proposal.",
  },
  {
    q: "Do you handle export orders?",
    a: "Export suitability is reviewed against the destination, packaging format, material and required document set. Packworkz can coordinate the applicable shipping and supplier documents confirmed in the approved order scope; certifications are verified for the selected factory and specification.",
  },
  {
    q: "What happens if my order has a quality issue?",
    a: "We own the quality outcome. If goods fail to meet the approved sample standard, we replace at no cost. Our pre-dispatch inspection is designed to catch issues before they ever reach you — but if something does get through, raise a ticket in your dashboard and our team responds within 24 hours.",
  },
  {
    q: "Can I order packaging design separately?",
    a: "Yes. Packaging design can be ordered separately from production. The selected package, deliverables, revision scope, and any production credit are shown before payment so there is no assumption about what is included.",
  },
];

function FAQ({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      style={{ borderBottom: "1px solid #E2EAF4", padding: "20px 0", cursor: "pointer" }}
      onClick={() => setOpen(!open)}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <p style={{ color: "#0D1B2A", fontSize: 16, fontWeight: 600, paddingRight: 24 }}>{q}</p>
        <ChevronDown
          size={18}
          color="#64748B"
          style={{
            flexShrink: 0,
            transition: "transform 0.2s",
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
          }}
        />
      </div>
      {open && (
        <p style={{
          color: "#64748B", fontSize: 15, lineHeight: 1.7,
          padding: "12px 0 4px",
          animation: "caseFadeIn 0.2s ease",
        }}>
          {a}
        </p>
      )}
    </div>
  );
}

export default function HowItWorks() {
  return (
    <div>
      {/* ── Hero ─────────────────────────────────────── */}
      <section style={{ background: "#0D1B2A", padding: "80px 0", textAlign: "center" }}>
        <div style={{ maxWidth: 720, margin: "0 auto", padding: "0 40px" }}>
          <span style={{
            color: "#E8A838", fontSize: 11, fontWeight: 600,
            letterSpacing: "2.5px", textTransform: "uppercase",
            display: "block", marginBottom: 20,
          }}>
            THE PROCESS
          </span>
          <h1 style={{
            color: "white", fontSize: "clamp(1.5rem, 3vw, 2.25rem)", fontWeight: 700,
            lineHeight: 1.1, marginBottom: 20,
          }}>
            How to source custom packaging in India — and never chase a vendor again.
          </h1>
          <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 18, lineHeight: 1.65 }}>
            Four stages. Zero ambiguity. One team responsible for all of it.
          </p>
        </div>
      </section>

      {/* ── 4 Step Sections ──────────────────────────── */}
      <section style={{ background: "white" }}>
        {STEPS.map((step, si) => {
          const Icon = step.Icon;
          return (
            <div
              key={si}
              style={{
                maxWidth: 900, margin: "0 auto",
                padding: "72px 40px",
                borderBottom: "1px solid #E2EAF4",
              }}
            >
              <div
                className="grid grid-cols-1 md:grid-cols-[280px_1fr]"
                style={{ gap: 64, alignItems: "start" }}
              >
                {/* Left */}
                <div>
                  <span style={{
                    color: "#E8A838", fontSize: 11, fontWeight: 600,
                    textTransform: "uppercase", letterSpacing: "2px",
                    display: "block",
                  }}>
                    {step.num}
                  </span>
                  <div style={{
                    width: 64, height: 64, borderRadius: "50%",
                    background: "#0D1B2A",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    margin: "16px 0",
                  }}>
                    <Icon size={26} color="#E8A838" />
                  </div>
                  <h2 style={{ color: "#0D1B2A", fontSize: 28, fontWeight: 700, lineHeight: 1.2 }}>
                    {step.title}
                  </h2>
                </div>

                {/* Right */}
                <div>
                  <p style={{ color: "#64748B", fontSize: 17, lineHeight: 1.7, marginBottom: 28 }}>
                    {step.intro}
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    {step.substeps.map((sub, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                        <div style={{
                          width: 8, height: 8, borderRadius: "50%",
                          background: "#E8A838", flexShrink: 0, marginTop: 6,
                        }} />
                        <div>
                          <p style={{ color: "#0D1B2A", fontSize: 15, fontWeight: 600, marginBottom: 3 }}>
                            {sub.title}
                          </p>
                          <p style={{ color: "#64748B", fontSize: 14, lineHeight: 1.6 }}>
                            {sub.detail}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </section>

      {/* ── FAQ ──────────────────────────────────────── */}
      <section style={{ background: "#F8F9FC", padding: "80px 0" }}>
        <div style={{ maxWidth: 720, margin: "0 auto", padding: "0 40px" }}>
          <h2 style={{ color: "#0D1B2A", fontSize: 36, fontWeight: 700, marginBottom: 40 }}>
            Common questions
          </h2>
          {FAQS.map((faq, i) => (
            <FAQ key={i} q={faq.q} a={faq.a} />
          ))}
        </div>
      </section>

      {/* ── Final CTA ────────────────────────────────── */}
      <section
        className="relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #0D1B2A 0%, #0F2744 40%, #1B3A5C 100%)",
          padding: "120px 0",
          textAlign: "center",
        }}
      >
        {/* Box pattern */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Crect x='0.5' y='0.5' width='59' height='59' rx='3' fill='none' stroke='white' stroke-opacity='0.04'/%3E%3C/svg%3E")`,
            backgroundSize: "60px 60px",
          }}
        />
        {/* Radial glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "radial-gradient(ellipse 80% 60% at 50% 100%, rgba(27,108,168,0.25) 0%, transparent 70%)",
          }}
        />

        <div className="relative" style={{ zIndex: 1, maxWidth: 540, margin: "0 auto", padding: "0 40px" }}>
          <span style={{
            color: "#E8A838", fontSize: 11, fontWeight: 600,
            letterSpacing: "2.5px", textTransform: "uppercase",
            display: "block", marginBottom: 20,
          }}>
            READY TO START
          </span>
          <h2 style={{
            color: "white", fontSize: "clamp(2rem,5vw,3rem)",
            fontWeight: 700, lineHeight: 1.1, marginBottom: 20,
          }}>
            Ready to place your first order?
          </h2>
          <p style={{
            color: "rgba(255,255,255,0.6)", fontSize: 17,
            margin: "0 auto 44px", lineHeight: 1.65,
          }}>
            Browse {CATALOG_SKUS.length} packaging product families or speak to our team today.
          </p>

          <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/configure">
              <button className="btn-fill btn-amber px-10 py-4 text-base">
                <span>Get a pricing plan →</span>
              </button>
            </Link>
            <a
              href={`https://wa.me/${WHATSAPP_NUM}?text=Hi%20Packworkz%2C%20I%27d%20like%20to%20discuss%20packaging.`}
              target="_blank" rel="noopener noreferrer"
            >
              <button className="btn-fill btn-outline-white px-10 py-4 text-base">
                <span>WhatsApp us</span>
              </button>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
