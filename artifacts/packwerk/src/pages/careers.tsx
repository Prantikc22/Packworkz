import { useState } from "react";
import { Link } from "wouter";
import {
  Heart, Zap, Globe, Shield, Users, TrendingUp,
  MapPin, Clock, Briefcase, ChevronRight, CheckCircle,
  Package, Star, ArrowRight,
} from "lucide-react";

const VALUES = [
  {
    icon: Heart,
    title: "Obsess Over the Customer",
    desc: "Every decision — from packaging specs to delivery windows — starts with the brand on the other end. Their success is our metric.",
    color: "#E8A838",
  },
  {
    icon: Zap,
    title: "Move Fast, Ship Clean",
    desc: "Speed without quality is noise. We move fast and build things right — no shortcuts on code, factory QC, or customer communication.",
    color: "#1B6CA8",
  },
  {
    icon: Globe,
    title: "Build for Bharat & Beyond",
    desc: "We're solving an Indian supply chain problem, but the platform we're building serves brands worldwide. Think local, build global.",
    color: "#10B981",
  },
  {
    icon: Shield,
    title: "Own Your Work",
    desc: "No politics, no hand-offs for the sake of it. You own your domain end to end — from spec to shipped. Accountability is a feature.",
    color: "#8B5CF6",
  },
  {
    icon: Users,
    title: "Radical Transparency",
    desc: "We share numbers, strategy, and mistakes openly. The best ideas come from everyone seeing the full picture.",
    color: "#EF4444",
  },
  {
    icon: TrendingUp,
    title: "Raise the Floor",
    desc: "We invest in our team's growth because a stronger team builds a better product. We expect you to level up — and we'll help you get there.",
    color: "#F59E0B",
  },
];

const OPEN_ROLES = [
  {
    title: "Senior Full-Stack Engineer",
    dept: "Engineering",
    type: "Full-time",
    location: "Mumbai / Remote",
    tags: ["React", "Node.js", "PostgreSQL"],
  },
  {
    title: "Supply Chain Manager",
    dept: "Operations",
    type: "Full-time",
    location: "Mumbai",
    tags: ["Procurement", "Vendor Management", "QC"],
  },
  {
    title: "D2C Brand Partnerships Lead",
    dept: "Growth",
    type: "Full-time",
    location: "Bangalore / Remote",
    tags: ["B2B Sales", "D2C", "Packaging"],
  },
  {
    title: "Product Designer (UI/UX)",
    dept: "Design",
    type: "Full-time",
    location: "Remote",
    tags: ["Figma", "Design Systems", "B2B SaaS"],
  },
  {
    title: "Customer Success Manager",
    dept: "Customer Success",
    type: "Full-time",
    location: "Mumbai",
    tags: ["Account Management", "Onboarding", "FMCG"],
  },
];

const PERKS = [
  "Competitive salary + ESOP",
  "Full remote flexibility",
  "₹30,000 learning budget / year",
  "Best-in-class health insurance",
  "Monthly offsites & team retreats",
  "Work directly with founders",
];

const STATS = [
  { num: "40+", label: "Team members" },
  { num: "4.8★", label: "Glassdoor rating" },
  { num: "92%", label: "Retention rate" },
  { num: "2022", label: "Founded" },
];

type FormData = {
  name: string;
  email: string;
  role: string;
  linkedin: string;
  message: string;
};

export default function Careers() {
  const [selectedRole, setSelectedRole] = useState("");
  const [form, setForm] = useState<FormData>({ name: "", email: "", role: "", linkedin: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

      {/* ── Hero ── */}
      <section style={{
        background: "linear-gradient(135deg, #020617 0%, #0D1B2A 50%, #0C2340 100%)",
        padding: "100px 64px 80px",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Grid overlay */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          backgroundImage: "radial-gradient(rgba(27,108,168,0.12) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }} />
        {/* Glow */}
        <div style={{
          position: "absolute", top: "-20%", right: "10%",
          width: 500, height: 500, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(27,108,168,0.18) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />

        <div style={{ maxWidth: 860, margin: "0 auto", textAlign: "center", position: "relative" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(232,168,56,0.12)", border: "1px solid rgba(232,168,56,0.3)", borderRadius: 999, padding: "6px 16px", marginBottom: 28 }}>
            <Package size={13} color="#E8A838" />
            <span style={{ color: "#E8A838", fontSize: 11, fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase" }}>We're Hiring</span>
          </div>
          <h1 style={{ color: "white", fontSize: "clamp(36px,5vw,68px)", fontWeight: 900, lineHeight: 1.05, marginBottom: 24, letterSpacing: "-0.03em" }}>
            Build India's Packaging<br />
            <span style={{ color: "#E8A838" }}>Infrastructure</span> With Us
          </h1>
          <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 18, lineHeight: 1.7, maxWidth: 640, margin: "0 auto 48px" }}>
            We're a small team solving a massive problem — the way India's ₹3.5 lakh crore packaging industry operates. If you want work that matters, this is it.
          </p>

          {/* Stats */}
          <div style={{ display: "flex", justifyContent: "center", gap: 48, flexWrap: "wrap" }}>
            {STATS.map(s => (
              <div key={s.label} style={{ textAlign: "center" }}>
                <div style={{ color: "#E8A838", fontSize: 28, fontWeight: 900, lineHeight: 1 }}>{s.num}</div>
                <div style={{ color: "rgba(255,255,255,0.45)", fontSize: 12, fontWeight: 600, marginTop: 4 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Team photo strip ── */}
      <div style={{ height: 320, position: "relative", overflow: "hidden" }}>
        <img
          src="/industries/fmcg.webp"
          alt="Packworkz team at work"
          loading="lazy"
          style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 40%" }}
        />
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(to right, rgba(2,6,23,0.6) 0%, transparent 40%, transparent 60%, rgba(2,6,23,0.6) 100%)",
        }} />
        <div style={{
          position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <div style={{
            background: "rgba(2,6,23,0.72)", backdropFilter: "blur(12px)",
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: 16, padding: "24px 40px", textAlign: "center",
          }}>
            <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 15, lineHeight: 1.6, maxWidth: 480, margin: 0 }}>
              "We don't just ship boxes — we ship possibilities for brands that are changing how India eats, heals, and looks."
            </p>
            <p style={{ color: "#E8A838", fontSize: 13, fontWeight: 700, marginTop: 12, marginBottom: 0 }}>— Packworkz founding team</p>
          </div>
        </div>
      </div>

      {/* ── Values ── */}
      <section style={{ background: "#F8F9FC", padding: "96px 64px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <p style={{ color: "#1B6CA8", fontSize: 11, fontWeight: 700, letterSpacing: "3px", textTransform: "uppercase", marginBottom: 12 }}>WHAT DRIVES US</p>
            <h2 style={{ color: "#0D1B2A", fontSize: "clamp(28px,3.5vw,44px)", fontWeight: 900, lineHeight: 1.15, margin: 0 }}>
              Our Values
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24 }}>
            {VALUES.map(v => (
              <div key={v.title} style={{
                background: "white", borderRadius: 16, padding: "32px 28px",
                border: "1px solid #E2EAF4",
                transition: "transform 0.2s, box-shadow 0.2s",
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(-4px)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 12px 40px rgba(13,27,42,0.10)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; (e.currentTarget as HTMLElement).style.boxShadow = "none"; }}
              >
                <div style={{ width: 48, height: 48, borderRadius: 12, background: `${v.color}18`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
                  <v.icon size={22} color={v.color} />
                </div>
                <h3 style={{ color: "#0D1B2A", fontSize: 17, fontWeight: 800, marginBottom: 10, lineHeight: 1.3 }}>{v.title}</h3>
                <p style={{ color: "#64748B", fontSize: 14, lineHeight: 1.7, margin: 0 }}>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Perks ── */}
      <section style={{ background: "#0D1B2A", padding: "80px 64px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "center" }}>
          <div>
            <p style={{ color: "#E8A838", fontSize: 11, fontWeight: 700, letterSpacing: "3px", textTransform: "uppercase", marginBottom: 16 }}>WHY JOIN US</p>
            <h2 style={{ color: "white", fontSize: "clamp(28px,3vw,42px)", fontWeight: 900, lineHeight: 1.2, marginBottom: 24 }}>
              Work that's challenging.<br />Benefits that actually help.
            </h2>
            <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 15, lineHeight: 1.7, marginBottom: 0 }}>
              We're a lean team with big ambitions. You'll have real ownership, real impact, and the support to grow fast — not just professionally, but as a person.
            </p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {PERKS.map(perk => (
              <div key={perk} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                <CheckCircle size={17} color="#E8A838" style={{ flexShrink: 0, marginTop: 2 }} />
                <span style={{ color: "rgba(255,255,255,0.8)", fontSize: 14, lineHeight: 1.5 }}>{perk}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Open Roles ── */}
      <section style={{ background: "white", padding: "96px 64px" }} id="open-roles">
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <p style={{ color: "#1B6CA8", fontSize: 11, fontWeight: 700, letterSpacing: "3px", textTransform: "uppercase", marginBottom: 12 }}>JOIN THE TEAM</p>
            <h2 style={{ color: "#0D1B2A", fontSize: "clamp(28px,3.5vw,44px)", fontWeight: 900, marginBottom: 16 }}>Open Positions</h2>
            <p style={{ color: "#64748B", fontSize: 16, maxWidth: 500, margin: "0 auto" }}>
              Don't see the right fit? Apply anyway — we're always looking for exceptional people.
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {OPEN_ROLES.map(role => (
              <button
                key={role.title}
                onClick={() => { setSelectedRole(role.title); setForm(f => ({ ...f, role: role.title })); document.getElementById("apply-form")?.scrollIntoView({ behavior: "smooth" }); }}
                style={{
                  background: selectedRole === role.title ? "#F0F7FF" : "white",
                  border: selectedRole === role.title ? "1.5px solid #1B6CA8" : "1.5px solid #E2EAF4",
                  borderRadius: 14, padding: "22px 28px",
                  display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16,
                  cursor: "pointer", textAlign: "left",
                  transition: "border-color 0.2s, background 0.2s, box-shadow 0.2s",
                  boxShadow: selectedRole === role.title ? "0 4px 20px rgba(27,108,168,0.12)" : "none",
                  width: "100%",
                }}
                onMouseEnter={e => { if (selectedRole !== role.title) { (e.currentTarget as HTMLElement).style.borderColor = "#CBD5E1"; (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 16px rgba(13,27,42,0.06)"; } }}
                onMouseLeave={e => { if (selectedRole !== role.title) { (e.currentTarget as HTMLElement).style.borderColor = "#E2EAF4"; (e.currentTarget as HTMLElement).style.boxShadow = "none"; } }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8, flexWrap: "wrap" }}>
                    <span style={{ color: "#0D1B2A", fontSize: 16, fontWeight: 800 }}>{role.title}</span>
                    <span style={{ background: "#F0F7FF", color: "#1B6CA8", fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 999 }}>{role.dept}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: 4, color: "#64748B", fontSize: 12 }}>
                      <MapPin size={12} />{role.location}
                    </span>
                    <span style={{ display: "flex", alignItems: "center", gap: 4, color: "#64748B", fontSize: 12 }}>
                      <Clock size={12} />{role.type}
                    </span>
                    <span style={{ display: "flex", alignItems: "center", gap: 4, color: "#64748B", fontSize: 12 }}>
                      <Briefcase size={12} />{role.dept}
                    </span>
                  </div>
                  <div style={{ display: "flex", gap: 6, marginTop: 10, flexWrap: "wrap" }}>
                    {role.tags.map(tag => (
                      <span key={tag} style={{ background: "#F8F9FC", color: "#475569", fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 6, border: "1px solid #E2EAF4" }}>{tag}</span>
                    ))}
                  </div>
                </div>
                <ChevronRight size={20} color={selectedRole === role.title ? "#1B6CA8" : "#CBD5E1"} style={{ flexShrink: 0 }} />
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Application Form ── */}
      <section id="apply-form" style={{ background: "#F8F9FC", padding: "80px 64px" }}>
        <div style={{ maxWidth: 640, margin: "0 auto" }}>
          {submitted ? (
            <div style={{ textAlign: "center", padding: "64px 32px" }}>
              <div style={{ width: 72, height: 72, borderRadius: "50%", background: "#DCFCE7", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
                <CheckCircle size={36} color="#16A34A" />
              </div>
              <h2 style={{ color: "#0D1B2A", fontSize: 28, fontWeight: 900, marginBottom: 12 }}>Application Received!</h2>
              <p style={{ color: "#64748B", fontSize: 15, lineHeight: 1.7, marginBottom: 32 }}>
                Thanks for your interest in joining Packworkz. Our team will review your application and reach out within 5 business days.
              </p>
              <Link href="/" style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                background: "#0D1B2A", color: "white",
                fontWeight: 700, fontSize: 14, padding: "12px 24px",
                borderRadius: 8, textDecoration: "none",
              }}>
                Back to Home <ArrowRight size={16} />
              </Link>
            </div>
          ) : (
            <>
              <div style={{ textAlign: "center", marginBottom: 48 }}>
                <Star size={28} color="#E8A838" style={{ marginBottom: 16 }} />
                <h2 style={{ color: "#0D1B2A", fontSize: "clamp(24px,3vw,36px)", fontWeight: 900, marginBottom: 12 }}>Apply Now</h2>
                <p style={{ color: "#64748B", fontSize: 15 }}>
                  {selectedRole ? `Applying for: ${selectedRole}` : "Select a role above or apply to join us generally."}
                </p>
              </div>

              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <div>
                    <label style={{ display: "block", color: "#374151", fontSize: 13, fontWeight: 700, marginBottom: 6 }}>Full Name *</label>
                    <input
                      required value={form.name}
                      onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      placeholder="Jane Smith"
                      style={{ width: "100%", padding: "11px 14px", border: "1.5px solid #E2EAF4", borderRadius: 8, fontSize: 14, outline: "none", background: "white", boxSizing: "border-box" }}
                      onFocus={e => (e.target.style.borderColor = "#1B6CA8")}
                      onBlur={e => (e.target.style.borderColor = "#E2EAF4")}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", color: "#374151", fontSize: 13, fontWeight: 700, marginBottom: 6 }}>Email *</label>
                    <input
                      required type="email" value={form.email}
                      onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                      placeholder="jane@company.com"
                      style={{ width: "100%", padding: "11px 14px", border: "1.5px solid #E2EAF4", borderRadius: 8, fontSize: 14, outline: "none", background: "white", boxSizing: "border-box" }}
                      onFocus={e => (e.target.style.borderColor = "#1B6CA8")}
                      onBlur={e => (e.target.style.borderColor = "#E2EAF4")}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", color: "#374151", fontSize: 13, fontWeight: 700, marginBottom: 6 }}>Role you're interested in *</label>
                  <select
                    required value={form.role}
                    onChange={e => { setForm(f => ({ ...f, role: e.target.value })); setSelectedRole(e.target.value); }}
                    style={{ width: "100%", padding: "11px 14px", border: "1.5px solid #E2EAF4", borderRadius: 8, fontSize: 14, outline: "none", background: "white" }}
                  >
                    <option value="">Select a role…</option>
                    {OPEN_ROLES.map(r => <option key={r.title} value={r.title}>{r.title}</option>)}
                    <option value="Other / General Application">Other / General Application</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", color: "#374151", fontSize: 13, fontWeight: 700, marginBottom: 6 }}>LinkedIn / Portfolio URL</label>
                  <input
                    type="url" value={form.linkedin}
                    onChange={e => setForm(f => ({ ...f, linkedin: e.target.value }))}
                    placeholder="https://linkedin.com/in/yourprofile"
                    style={{ width: "100%", padding: "11px 14px", border: "1.5px solid #E2EAF4", borderRadius: 8, fontSize: 14, outline: "none", background: "white", boxSizing: "border-box" }}
                    onFocus={e => (e.target.style.borderColor = "#1B6CA8")}
                    onBlur={e => (e.target.style.borderColor = "#E2EAF4")}
                  />
                </div>

                <div>
                  <label style={{ display: "block", color: "#374151", fontSize: 13, fontWeight: 700, marginBottom: 6 }}>Why Packworkz? *</label>
                  <textarea
                    required rows={5} value={form.message}
                    onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                    placeholder="Tell us about yourself, what excites you about this role, and what you'd bring to the team…"
                    style={{ width: "100%", padding: "11px 14px", border: "1.5px solid #E2EAF4", borderRadius: 8, fontSize: 14, outline: "none", background: "white", resize: "vertical", lineHeight: 1.6, boxSizing: "border-box" }}
                    onFocus={e => (e.target.style.borderColor = "#1B6CA8")}
                    onBlur={e => (e.target.style.borderColor = "#E2EAF4")}
                  />
                </div>

                <button
                  type="submit"
                  style={{
                    background: "#0D1B2A", color: "white",
                    fontWeight: 800, fontSize: 15, padding: "14px",
                    border: "none", borderRadius: 10, cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                    transition: "background 0.2s",
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = "#1B3A5C")}
                  onMouseLeave={e => (e.currentTarget.style.background = "#0D1B2A")}
                >
                  Submit Application <ArrowRight size={18} />
                </button>

                <p style={{ color: "#94A3B8", fontSize: 12, textAlign: "center", margin: 0 }}>
                  We review every application carefully and respond within 5 business days.
                </p>
              </form>
            </>
          )}
        </div>
      </section>

    </div>
  );
}
