const CERTS = ["ISO 9001:2015", "FSSC 22000", "BRC Packaging", "US FDA Compliant", "FSC Certified"];

export default function CertificationsSection() {
  return (
    <section className="py-12 px-8 text-center" style={{ background: "#0D1B2A" }}>
      <p className="font-bold tracking-[0.25em] text-xs uppercase mb-6" style={{ color: "rgba(255,255,255,0.6)" }}>
        EVERY FACTORY PARTNER. EVERY ORDER. CERTIFIED.
      </p>
      <div className="flex flex-wrap justify-center gap-4 mb-4">
        {CERTS.map((c) => (
          <span key={c} className="font-bold" style={{
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.2)",
            borderRadius: 999,
            padding: "10px 20px",
            color: "white",
            fontSize: 13,
          }}>{c}</span>
        ))}
      </div>
      <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 12 }}>
        Certification documentation provided with every order.
      </p>
    </section>
  );
}
