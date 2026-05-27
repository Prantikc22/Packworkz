export default function Privacy() {
  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", background: "#020617", minHeight: "100vh" }}>
      <section style={{ maxWidth: 760, margin: "0 auto", padding: "80px 40px 120px" }}>
        <p style={{ color: "#60a5fa", fontSize: 11, fontWeight: 700, letterSpacing: "2.5px", textTransform: "uppercase", marginBottom: 16 }}>LEGAL</p>
        <h1 style={{ color: "white", fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 900, lineHeight: 1.1, letterSpacing: "-1px", marginBottom: 12 }}>Privacy Policy</h1>
        <p style={{ color: "rgba(255,255,255,0.38)", fontSize: 13, marginBottom: 56 }}>Last updated: January 2025</p>

        {[
          {
            title: "1. Information We Collect",
            body: "We collect information you provide directly to us when you request a quote, order samples, register for an account, or contact us. This includes your name, email address, phone number, company name, billing address, and packaging requirements. We also automatically collect certain technical data including IP address, browser type, and usage data through cookies and similar technologies.",
          },
          {
            title: "2. How We Use Your Information",
            body: "We use your information to process quote requests and orders, communicate with you about your orders and our services, send you transactional and promotional communications (where permitted), improve our platform and services, comply with legal obligations, and prevent fraud and ensure security.",
          },
          {
            title: "3. Sharing of Information",
            body: "We do not sell your personal information. We share your information with verified manufacturing partners only to the extent necessary to fulfil your orders. We may also share information with service providers who assist us in operating our platform (payment processors, logistics providers, cloud infrastructure), and when required by law.",
          },
          {
            title: "4. Data Retention",
            body: "We retain your personal information for as long as your account is active or as needed to provide you services. We will retain and use your information as necessary to comply with our legal obligations, resolve disputes, and enforce our agreements. You may request deletion of your account and associated data by contacting us at privacy@packworkz.com.",
          },
          {
            title: "5. Cookies",
            body: "We use cookies and similar tracking technologies to track activity on our platform and hold certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, you may not be able to use some portions of our service.",
          },
          {
            title: "6. Security",
            body: "We implement appropriate technical and organisational security measures to protect your personal information against accidental or unlawful destruction, loss, alteration, unauthorised disclosure, or access. However, no method of transmission over the Internet or electronic storage is 100% secure.",
          },
          {
            title: "7. Your Rights",
            body: "You have the right to access, correct, or delete your personal data. You may also object to or restrict certain processing activities. To exercise these rights, please contact us at privacy@packworkz.com. We will respond to your request within 30 days.",
          },
          {
            title: "8. Contact Us",
            body: "If you have questions about this Privacy Policy or our data practices, please contact us at: privacy@packworkz.com · Packworkz India, Bengaluru, Karnataka, India.",
          },
        ].map((section, i) => (
          <div key={i} style={{ marginBottom: 36, paddingBottom: 36, borderBottom: i < 7 ? "1px solid rgba(255,255,255,0.05)" : "none" }}>
            <h2 style={{ color: "white", fontSize: 16, fontWeight: 700, marginBottom: 12 }}>{section.title}</h2>
            <p style={{ color: "rgba(255,255,255,0.50)", fontSize: 14, lineHeight: 1.8 }}>{section.body}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
