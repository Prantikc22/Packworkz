export default function Terms() {
  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", background: "#020617", minHeight: "100vh" }}>
      <section style={{ maxWidth: 760, margin: "0 auto", padding: "80px 40px 120px" }}>
        <p style={{ color: "#60a5fa", fontSize: 11, fontWeight: 700, letterSpacing: "2.5px", textTransform: "uppercase", marginBottom: 16 }}>LEGAL</p>
        <h1 style={{ color: "white", fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 900, lineHeight: 1.1, letterSpacing: "-1px", marginBottom: 12 }}>Terms of Service</h1>
        <p style={{ color: "rgba(255,255,255,0.38)", fontSize: 13, marginBottom: 56 }}>Last updated: January 2025</p>

        {[
          {
            title: "1. Acceptance of Terms",
            body: "By accessing or using the Packworkz platform, website, or services, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services. These terms apply to all users, including brands, procurement teams, and visitors.",
          },
          {
            title: "2. Services",
            body: "Packworkz provides a managed B2B packaging procurement platform that connects brands with verified manufacturing partners. Our services include quote generation, sample ordering, bulk procurement, quality control management, logistics coordination, and the SmartStock™ inventory intelligence layer.",
          },
          {
            title: "3. Quotes and Orders",
            body: "All quotes provided by Packworkz are valid for 14 days from the date of issue unless otherwise stated. Orders are confirmed only upon receipt of a signed purchase order or written approval. Packworkz reserves the right to adjust pricing in the event of significant material cost fluctuations or changes to order specifications.",
          },
          {
            title: "4. Payment Terms",
            body: "New accounts require 100% advance payment. Clients with 3+ completed orders may apply for Net-30 credit terms up to ₹5,00,000. Upfront payment receives a 3% discount. Late payments are subject to 1.5% per month interest on the outstanding balance. Packworkz accepts bank transfer, UPI, and credit card via Razorpay.",
          },
          {
            title: "5. Quality and Returns",
            body: "Packworkz conducts pre-dispatch quality inspection on every order. If products do not meet the approved sample specifications, Packworkz will arrange replacement or credit at no additional cost. Claims must be raised within 7 days of delivery with photographic evidence. We do not accept returns on products that meet approved specifications.",
          },
          {
            title: "6. Intellectual Property",
            body: "All artwork, designs, and branding materials shared with Packworkz remain the intellectual property of the client. By sharing materials, you grant Packworkz a non-exclusive licence to use these materials solely for the purpose of fulfilling your order. Packworkz's platform, technology, and SmartStock™ system remain the intellectual property of Packworkz India.",
          },
          {
            title: "7. Limitation of Liability",
            body: "Packworkz's total liability to you for any claim arising from these terms or our services is limited to the value of the specific order in dispute. We are not liable for indirect, incidental, or consequential damages, including lost profits or business interruption, even if advised of the possibility of such damages.",
          },
          {
            title: "8. Governing Law",
            body: "These Terms are governed by and construed in accordance with the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts of Bengaluru, Karnataka, India. We encourage resolution through direct negotiation before formal legal proceedings.",
          },
          {
            title: "9. Contact",
            body: "For questions about these Terms, contact us at: legal@packworkz.com · Packworkz India, Bengaluru, Karnataka, India.",
          },
        ].map((section, i) => (
          <div key={i} style={{ marginBottom: 36, paddingBottom: 36, borderBottom: i < 8 ? "1px solid rgba(255,255,255,0.05)" : "none" }}>
            <h2 style={{ color: "white", fontSize: 16, fontWeight: 700, marginBottom: 12 }}>{section.title}</h2>
            <p style={{ color: "rgba(255,255,255,0.50)", fontSize: 14, lineHeight: 1.8 }}>{section.body}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
