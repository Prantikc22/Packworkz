export default function Refund() {
  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", background: "#020617", minHeight: "100vh" }}>
      <section style={{ maxWidth: 760, margin: "0 auto", padding: "80px 40px 120px" }}>
        <p style={{ color: "#60a5fa", fontSize: 11, fontWeight: 700, letterSpacing: "2.5px", textTransform: "uppercase", marginBottom: 16 }}>LEGAL</p>
        <h1 style={{ color: "white", fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 900, lineHeight: 1.1, letterSpacing: "-1px", marginBottom: 12 }}>Refund Policy</h1>
        <p style={{ color: "rgba(255,255,255,0.38)", fontSize: 13, marginBottom: 56 }}>Last updated: January 2025</p>

        {[
          {
            title: "Our Quality Commitment",
            body: "Packworkz conducts three-stage quality inspection — pre-production sample approval, mid-production check (orders above ₹2L), and pre-dispatch inspection on every order. Our 98.7% QC first-pass rate means most orders ship without issue. When something isn't right, we make it right.",
            highlight: true,
          },
          {
            title: "Quality-Based Claims",
            body: "If delivered products do not meet the approved sample specifications — in dimensions, print quality, material grade, or structural integrity — Packworkz will arrange one of the following at our cost: full replacement within the original lead time, partial replacement for affected units, or full credit to your Packworkz account. Claims must be raised within 7 days of delivery with photographic or video evidence.",
            highlight: false,
          },
          {
            title: "Sample Orders",
            body: "Sample orders (₹2,999 Standard · ₹4,999 Express) are non-refundable once production has commenced. If the sample does not meet specifications agreed at the time of order, Packworkz will produce a revised sample at no additional charge. The ₹1,999 design service fee is fully adjustable against your first bulk order.",
            highlight: false,
          },
          {
            title: "Bulk Order Cancellations",
            body: "Cancellations before production commencement: full refund minus any design or tooling costs already incurred. Cancellations after production commencement: refund of materials not yet committed, minus setup costs and completed work. Orders dispatched cannot be cancelled. All cancellation requests must be submitted in writing to orders@packworkz.com.",
            highlight: false,
          },
          {
            title: "Refund Timeline",
            body: "Approved refunds are processed within 7–10 business days to the original payment method. For NEFT/IMPS transfers, processing may take an additional 2–3 banking days depending on your bank. Packworkz account credits are applied immediately and can be used toward any future order.",
            highlight: false,
          },
          {
            title: "Non-Refundable Scenarios",
            body: "Refunds are not applicable for: products that meet approved sample specifications, customised products approved by the client that cannot be resold, orders where incorrect specifications were provided by the client, or delays caused by the client (artwork approvals, payment delays, incorrect delivery details).",
            highlight: false,
          },
          {
            title: "How to Raise a Claim",
            body: "Email orders@packworkz.com with your Order ID, photos or video of the affected units, a description of the discrepancy, and your preferred resolution (replacement, credit, or refund). Our quality team will respond within 24 hours and resolve the issue within 5 business days.",
            highlight: false,
          },
        ].map((section, i) => (
          <div key={i} style={{
            marginBottom: 36, paddingBottom: 36,
            borderBottom: i < 6 ? "1px solid rgba(255,255,255,0.05)" : "none",
            ...(section.highlight ? { background: "rgba(96,165,250,0.05)", border: "1px solid rgba(96,165,250,0.12)", padding: "24px", marginLeft: -24, marginRight: -24, borderRadius: 8 } : {}),
          }}>
            <h2 style={{ color: section.highlight ? "#60a5fa" : "white", fontSize: 16, fontWeight: 700, marginBottom: 12 }}>{section.title}</h2>
            <p style={{ color: "rgba(255,255,255,0.50)", fontSize: 14, lineHeight: 1.8 }}>{section.body}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
