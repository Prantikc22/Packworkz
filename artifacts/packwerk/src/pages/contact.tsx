import { Mail, MessageSquare, Newspaper, Phone, MapPin, Clock } from "lucide-react";
import { Link } from "wouter";

const CHANNELS = [
  {
    icon: Mail,
    label: "General Support",
    email: "contact@packworkz.com",
    desc: "Questions about orders, quotes, or the platform? We respond within 24 hours on business days.",
    color: "#1B6CA8",
    bg: "#F0F7FF",
    border: "#BFDBFE",
  },
  {
    icon: MessageSquare,
    label: "Sales & Partnerships",
    email: "sales@packworkz.com",
    desc: "New to Packworkz? Looking for volume pricing, custom SKUs, or a dedicated account manager?",
    color: "#16A34A",
    bg: "#F0FDF4",
    border: "#BBF7D0",
  },
  {
    icon: Newspaper,
    label: "Media & Press",
    email: "pr@packworkz.com",
    desc: "Press inquiries, interviews, brand assets, or speaking requests. Our comms team will respond within 48 hours.",
    color: "#7C3AED",
    bg: "#F5F3FF",
    border: "#DDD6FE",
  },
];

const FAQS = [
  {
    q: "What's your typical response time?",
    a: "Support and sales emails are answered within 24 hours on business days. Press queries within 48 hours.",
  },
  {
    q: "Can I call instead?",
    a: "Yes — WhatsApp us at +91 82089 90366 and our team will respond immediately during 9 AM–7 PM IST.",
  },
  {
    q: "I have an urgent order issue. What do I do?",
    a: "Log in to your dashboard and use the order support thread — that's the fastest route. Or WhatsApp us directly.",
  },
  {
    q: "Where are you based?",
    a: "We operate pan-India with warehouse partners across the country for fast nationwide delivery.",
  },
];

export default function Contact() {
  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

      {/* ── Hero ── */}
      <section style={{
        background: "linear-gradient(135deg, #020617 0%, #0D1B2A 60%, #0C2340 100%)",
        padding: "100px 64px 80px",
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          backgroundImage: "radial-gradient(rgba(27,108,168,0.10) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }} />
        <div style={{ position: "relative" }}>
          <p style={{ color: "#E8A838", fontSize: 11, fontWeight: 700, letterSpacing: "3px", textTransform: "uppercase", marginBottom: 16 }}>GET IN TOUCH</p>
          <h1 style={{ color: "white", fontSize: "clamp(36px,5vw,64px)", fontWeight: 900, lineHeight: 1.05, marginBottom: 24, letterSpacing: "-0.03em" }}>
            We're Here to Help
          </h1>
          <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 18, lineHeight: 1.7, maxWidth: 560, margin: "0 auto" }}>
            Whether you're a brand owner, journalist, or just curious — reach us at the right inbox and we'll get back to you fast.
          </p>
        </div>
      </section>

      {/* ── Contact Cards ── */}
      <section style={{ background: "#F8F9FC", padding: "80px 64px" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24 }}>
            {CHANNELS.map(ch => (
              <div key={ch.label} style={{
                background: "white", borderRadius: 20, padding: "36px 32px",
                border: `1px solid ${ch.border}`,
                display: "flex", flexDirection: "column", gap: 0,
                transition: "transform 0.2s, box-shadow 0.2s",
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(-4px)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 16px 48px rgba(13,27,42,0.09)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; (e.currentTarget as HTMLElement).style.boxShadow = "none"; }}
              >
                <div style={{ width: 52, height: 52, borderRadius: 14, background: ch.bg, border: `1px solid ${ch.border}`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
                  <ch.icon size={24} color={ch.color} />
                </div>
                <div style={{ color: ch.color, fontSize: 11, fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", marginBottom: 8 }}>{ch.label}</div>
                <h3 style={{ color: "#0D1B2A", fontSize: 15, fontWeight: 600, marginBottom: 12, lineHeight: 1.4 }}>{ch.desc}</h3>
                <a
                  href={`mailto:${ch.email}`}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 8,
                    background: ch.bg, color: ch.color,
                    fontWeight: 700, fontSize: 14, padding: "11px 20px",
                    borderRadius: 10, textDecoration: "none", marginTop: "auto",
                    border: `1.5px solid ${ch.border}`,
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={e => (e.currentTarget.style.filter = "brightness(0.95)")}
                  onMouseLeave={e => (e.currentTarget.style.filter = "none")}
                >
                  <Mail size={15} />
                  {ch.email}
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WhatsApp CTA + Office ── */}
      <section style={{ background: "#0D1B2A", padding: "72px 64px" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "center" }}>

          {/* WhatsApp */}
          <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 20, border: "1px solid rgba(255,255,255,0.1)", padding: "40px 36px" }}>
            <div style={{ width: 52, height: 52, borderRadius: 14, background: "rgba(37,211,102,0.12)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="#25D366">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
            </div>
            <h3 style={{ color: "white", fontSize: 22, fontWeight: 800, marginBottom: 12 }}>Prefer WhatsApp?</h3>
            <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7, marginBottom: 24 }}>
              Our team is available on WhatsApp from 9 AM to 7 PM IST, Monday to Saturday. Fastest way to get a quote or check an order.
            </p>
            <a
              href="https://wa.me/918208990366"
              target="_blank" rel="noreferrer"
              style={{
                display: "inline-flex", alignItems: "center", gap: 10,
                background: "#25D366", color: "white",
                fontWeight: 800, fontSize: 14, padding: "13px 24px",
                borderRadius: 10, textDecoration: "none",
                transition: "background 0.15s",
              }}
              onMouseEnter={e => (e.currentTarget.style.background = "#1da851")}
              onMouseLeave={e => (e.currentTarget.style.background = "#25D366")}
            >
              <Phone size={16} /> Chat on WhatsApp
            </a>
          </div>

          {/* Office info */}
          <div>
            <h3 style={{ color: "white", fontSize: 22, fontWeight: 800, marginBottom: 32 }}>Our Office</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              <div style={{ display: "flex", gap: 16 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(232,168,56,0.12)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Clock size={18} color="#E8A838" />
                </div>
                <div>
                  <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 12, fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", marginBottom: 4 }}>Business Hours</p>
                  <p style={{ color: "white", fontSize: 14, lineHeight: 1.6, margin: 0 }}>
                    Monday – Saturday<br />
                    9:00 AM – 7:00 PM IST
                  </p>
                </div>
              </div>
              <div style={{ display: "flex", gap: 16 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(232,168,56,0.12)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Phone size={18} color="#E8A838" />
                </div>
                <div>
                  <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 12, fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", marginBottom: 4 }}>Phone / WhatsApp</p>
                  <a href="tel:+918208990366" style={{ color: "white", fontSize: 14, textDecoration: "none" }}>+91 82089 90366</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section style={{ background: "white", padding: "80px 64px" }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 52 }}>
            <p style={{ color: "#1B6CA8", fontSize: 11, fontWeight: 700, letterSpacing: "3px", textTransform: "uppercase", marginBottom: 12 }}>COMMON QUESTIONS</p>
            <h2 style={{ color: "#0D1B2A", fontSize: "clamp(24px,3vw,36px)", fontWeight: 900, margin: 0 }}>Before you write…</h2>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {FAQS.map(faq => (
              <div key={faq.q} style={{ background: "#F8F9FC", borderRadius: 14, padding: "24px 28px", border: "1px solid #E2EAF4" }}>
                <p style={{ color: "#0D1B2A", fontSize: 15, fontWeight: 700, marginBottom: 8 }}>{faq.q}</p>
                <p style={{ color: "#64748B", fontSize: 14, lineHeight: 1.7, margin: 0 }}>{faq.a}</p>
              </div>
            ))}
          </div>
          <div style={{ textAlign: "center", marginTop: 48 }}>
            <p style={{ color: "#64748B", fontSize: 14, marginBottom: 20 }}>Still have questions? Browse our help resources.</p>
            <Link href="/how-it-works" style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: "#0D1B2A", color: "white",
              fontWeight: 700, fontSize: 14, padding: "12px 24px",
              borderRadius: 8, textDecoration: "none",
            }}>
              How It Works →
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
