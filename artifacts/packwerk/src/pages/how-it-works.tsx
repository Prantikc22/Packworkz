import { useState } from "react";
import { Link } from "wouter";
import { Search, GitBranch, ShieldCheck, Truck, ChevronDown } from "lucide-react";

const WHATSAPP_NUM = "919999999999";

const STEPS = [
  {
    num: "STEP 01",
    Icon: Search,
    title: "Configure and Quote",
    intro:
      "Start by browsing our catalogue of 110+ SKUs or describing what you need. No sales call required. No commitment until you approve.",
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
        title: "Submit your quote request",
        detail:
          "Takes under 5 minutes. We review every quote manually and respond within 48 hours.",
      },
      {
        title: "Receive itemised quote",
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
      "Once you approve the quote, PackOS gets to work. We don't just assign one vendor — we assign the best one with backups in place.",
    substeps: [
      {
        title: "SmartMatch factory selection",
        detail:
          "PackOS matches your SKU spec to the most suitable factory from our verified network.",
      },
      {
        title: "3 backup vendors assigned",
        detail:
          "Two additional qualified vendors are confirmed for your order. If the primary delays — a backup ships immediately.",
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
    a: "MOQ varies by SKU — from 200 units for premium rigid boxes to 10,000 units for standard flexible pouches. Every product page shows the exact MOQ. If you need a smaller quantity, order a sample first.",
  },
  {
    q: "How does the 48-hour quote work?",
    a: "After you submit a quote request, our team reviews your spec manually, sources competing quotes from our vendor network, and sends you an itemised quote within 48 business hours. No automated responses. A real person handles every quote.",
  },
  {
    q: "Can I get credit terms?",
    a: "Yes — after 3 completed orders you can apply for net-30 credit up to ₹5L. New clients start on 50% advance, 50% before dispatch. If you pay 100% upfront, you get a 3% discount on every order.",
  },
  {
    q: "Do you handle export orders?",
    a: "Yes. We deliver to 40+ countries. All factory partners are internationally certified — ISO 9001, FSSC 22000, BRC, FDA, and FSC. We handle all export documentation including shipping bill, certificate of origin, and customs paperwork.",
  },
  {
    q: "What happens if my order has a quality issue?",
    a: "We own the quality outcome. If goods fail to meet the approved sample standard, we replace at no cost. Our pre-dispatch inspection is designed to catch issues before they ever reach you — but if something does get through, raise a ticket in your dashboard and our team responds within 24 hours.",
  },
  {
    q: "Can I order packaging design separately?",
    a: "Yes. Packaging design starts at ₹1,999 and is completely independent of a production order. You get a structural dieline, print-ready artwork, and all source files. The fee is fully adjusted against your first production order above ₹50,000.",
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
            color: "white", fontSize: 52, fontWeight: 700,
            lineHeight: 1.1, marginBottom: 20,
          }}>
            How every PackOps order works.
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
            Browse 110+ packaging SKUs or speak to our team today.
          </p>

          <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/quote">
              <button className="btn-fill btn-amber px-10 py-4 text-base">
                <span>Get a quote →</span>
              </button>
            </Link>
            <a
              href={`https://wa.me/${WHATSAPP_NUM}?text=Hi%20PackOps%2C%20I%27d%20like%20to%20discuss%20packaging.`}
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
