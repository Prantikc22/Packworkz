const TESTIMONIALS = [
  {
    initials: "ZF",
    company: "Zestful Foods",
    location: "Mumbai · D2C Snacks",
    quote: "We were managing 7 vendors for our packaging. With PackOps, it's one call, one invoice, one team. Our packaging errors dropped to zero.",
    metric: "7 vendors → 1 platform",
  },
  {
    initials: "DI",
    company: "Dermatica India",
    location: "Bangalore · Cosmetics D2C",
    quote: "The QC process alone was worth the switch. Our previous vendor passed defective units consistently. PackOps's pre-dispatch check caught everything before it reached us.",
    metric: "₹3.8L saved in Year 1",
  },
  {
    initials: "NC",
    company: "NatureCraft Organics",
    location: "Pune · Organic Food Brand",
    quote: "We needed FSC certified kraft packaging with compostability certification for our export buyer. PackOps sourced, certified, and delivered in 14 days. No other vendor came close.",
    metric: "14 days · Fully certified",
  },
];

const STATS = [
  { val: "₹2.4Cr+", cap: "Annual savings generated" },
  { val: "1,200+", cap: "Orders delivered on time" },
  { val: "98.7%", cap: "QC first-pass rate" },
];

export default function TestimonialsSection() {
  return (
    <section className="py-24 px-8 md:px-20" style={{ background: "white" }}>
      <div className="max-w-7xl mx-auto">
        <p className="font-bold tracking-[0.25em] text-xs uppercase mb-4" style={{ color: "#1B6CA8" }}>WHAT BRANDS SAY</p>
        <h2 className="clash-display mb-16" style={{ color: "#0D1B2A", fontSize: "clamp(2rem,4vw,3rem)", lineHeight: 1.1 }}>
          Brands that switched.<br />Never looked back.
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {TESTIMONIALS.map((t) => (
            <div
              key={t.company}
              className="p-7 rounded-xl transition-transform hover:-translate-y-1"
              style={{ background: "white", border: "1px solid #E2EAF4", borderTop: "3px solid #E8A838", boxShadow: "0 2px 16px rgba(13,27,42,0.06)" }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center justify-center rounded-full font-bold text-white text-sm" style={{ width: 44, height: 44, background: "#0D1B2A", flexShrink: 0 }}>
                  {t.initials}
                </div>
                <div>
                  <p className="font-bold text-sm" style={{ color: "#0D1B2A" }}>{t.company}</p>
                  <p className="text-xs" style={{ color: "#94A3B8" }}>{t.location}</p>
                </div>
              </div>
              <p className="mb-1" style={{ color: "#E8A838", fontSize: 14 }}>★★★★★</p>
              <p className="italic leading-relaxed mb-4" style={{ color: "#64748B", fontSize: 15, lineHeight: 1.7 }}>"{t.quote}"</p>
              <div className="inline-block px-3 py-1.5 rounded-full font-bold text-sm" style={{ background: "rgba(232,168,56,0.1)", color: "#E8A838" }}>
                {t.metric}
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row justify-center gap-16 py-10 border-t border-slate-100">
          {STATS.map((s) => (
            <div key={s.val} className="text-center">
              <p className="clash-display" style={{ color: "#0D1B2A", fontSize: 44, lineHeight: 1 }}>{s.val}</p>
              <p className="mt-1 text-sm" style={{ color: "#94A3B8" }}>{s.cap}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
