import { useState } from "react";
import { Link } from "wouter";
import { ARTICLES } from "@/lib/resources-data";

const SEO_CLUSTERS = [
  { key: "All", label: "All resources", desc: "Every published guide" },
  { key: "Cost & MOQ", label: "Cost & MOQ", desc: "Pricing, quantities and print economics" },
  { key: "Start a D2C Brand", label: "Start a D2C Brand", desc: "Launch planning for founders" },
  { key: "Food Packaging", label: "Food", desc: "Barrier, shelf life and food formats" },
  { key: "Materials", label: "Materials", desc: "Technical comparisons in plain language" },
  { key: "Beauty & Cosmetics", label: "Beauty", desc: "Multi-component cosmetic packaging" },
  { key: "Ecommerce & Amazon", label: "Ecommerce", desc: "Shipping, damage and volumetric weight" },
] as const;

function articleCluster(article: typeof ARTICLES[number]) {
  const haystack = `${article.title} ${article.category} ${article.keywords.join(" ")}`.toLowerCase();
  if (/cost|overpay|price|moq|vendor/.test(haystack)) return "Cost & MOQ";
  if (/food|pouch|coffee|snack|fssai/.test(haystack)) return "Food Packaging";
  if (/ecommerce|commerce|amazon|blinkit|zepto|shipping/.test(haystack)) return "Ecommerce & Amazon";
  if (/beauty|cosmetic|skincare/.test(haystack)) return "Beauty & Cosmetics";
  if (/material|bopp|ldpe|pet|hdpe|barrier|film/.test(haystack)) return "Materials";
  return "Start a D2C Brand";
}

export default function Resources() {
  const [activeCategory, setActiveCategory] = useState<string>("All");

  const filtered = activeCategory === "All"
    ? ARTICLES
    : ARTICLES.filter(a => articleCluster(a) === activeCategory);

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", background: "#FFFFFF" }}>

      {/* SEO head content rendered inline for crawlers */}

      {/* Hero */}
      <section style={{ background: "linear-gradient(135deg, #020817 0%, #071a45 50%, #0f2d6b 100%)", padding: "80px 0 60px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 32px" }}>
          <p style={{ color: "#93c5fd", fontSize: 11, fontWeight: 700, letterSpacing: "2.5px", textTransform: "uppercase", marginBottom: 16 }}>
            RESOURCES
          </p>
          <h1 style={{ color: "white", fontSize: "clamp(2rem, 5vw, 3rem)", fontWeight: 800, lineHeight: 1.15, marginBottom: 16, maxWidth: 640 }}>
            Packaging answers buyers search for before they choose a supplier.
          </h1>
          <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 17, lineHeight: 1.7, maxWidth: 560, marginBottom: 0 }}>
            Commercial guides organised around cost, MOQ, launch decisions, materials, food, beauty and ecommerce packaging in India.
          </p>
        </div>
      </section>

      {/* Filter bar */}
      <div style={{ background: "white", borderBottom: "1px solid #E2EAF4", position: "sticky", top: 68, zIndex: 30 }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 32px", display: "flex", gap: 4, overflowX: "auto", paddingTop: 12, paddingBottom: 12 }}>
          {SEO_CLUSTERS.map(cluster => (
            <button
              key={cluster.key}
              onClick={() => setActiveCategory(cluster.key)}
              style={{
                padding: "6px 16px",
                borderRadius: 99,
                border: `1px solid ${activeCategory === cluster.key ? "#0D1B2A" : "#E2EAF4"}`,
                background: activeCategory === cluster.key ? "#0D1B2A" : "white",
                color: activeCategory === cluster.key ? "white" : "#64748B",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                whiteSpace: "nowrap",
                transition: "all 0.15s",
              }}
            >
              {cluster.label}
            </button>
          ))}
        </div>
      </div>

      {/* Article grid */}
      <section id="insights" style={{ maxWidth: 1100, margin: "0 auto", padding: "56px 32px 96px" }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
          gap: 32,
        }}>
          {filtered.map(article => (
            <ArticleCard key={article.slug} article={article} />
          ))}
        </div>

        {filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "64px 0", color: "#94A3B8" }}>
            <p style={{ fontSize: 18 }}>No articles in this category yet.</p>
          </div>
        )}
      </section>

      <section id="case-studies" style={{ background: "#F7F4ED", padding: "72px 32px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 28, alignItems: "center" }}>
          <div>
            <p style={{ color: "#1B6CA8", fontSize: 11, fontWeight: 800, letterSpacing: "2px", textTransform: "uppercase", marginBottom: 12 }}>Case studies</p>
            <h2 style={{ color: "#0D1B2A", fontSize: "clamp(2rem,4vw,3rem)", fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 1.05 }}>Evidence, not anonymous claims.</h2>
          </div>
          <div>
            <p style={{ color: "#64748B", lineHeight: 1.8, marginBottom: 20 }}>Customer operating stories are published only when the brand approves the scope and outcome. Until then, explore the production network and documented workflow behind every order.</p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}><Link href="/network" style={{ color: "#0B4CB4", fontWeight: 800, textDecoration: "none" }}>Explore the network →</Link><Link href="/how-it-works" style={{ color: "#0D1B2A", fontWeight: 800, textDecoration: "none" }}>See how orders work →</Link></div>
          </div>
        </div>
      </section>

      <section id="faqs" style={{ maxWidth: 900, margin: "0 auto", padding: "72px 32px 88px" }}>
        <p style={{ color: "#1B6CA8", fontSize: 11, fontWeight: 800, letterSpacing: "2px", textTransform: "uppercase", marginBottom: 12 }}>Packaging FAQs</p>
        <h2 style={{ color: "#0D1B2A", fontSize: "clamp(2rem,4vw,3rem)", fontWeight: 900, letterSpacing: "-0.04em", marginBottom: 28 }}>Answers before you choose a format.</h2>
        {[ ["What determines a packaging MOQ?", "Printing process, material conversion, tooling and the production route determine MOQ. Selected digital and stock formats can start lower; custom industrial runs usually need more units."], ["Can I buy packaging directly online?", "Eligible configurations with a payable total below the online checkout threshold can be bought directly. High-value, complex or quote-only configurations move to a managed quote."], ["Is delivery included in the displayed estimate?", "The configurator shows delivery as an estimate based on the current order context. The final charge is confirmed against packed weight, volumetric weight, destination and service level."], ["Can Packworkz support several packaging SKUs?", "Yes. Growing brands can start with one product, while enterprise buyers can use the managed route for multi-SKU sourcing, quality checkpoints, repeat orders and stock planning."] ].map(([q,a]) => <details key={q} style={{ borderTop: "1px solid #E2E8F0", padding: "20px 0" }}><summary style={{ cursor: "pointer", color: "#0D1B2A", fontWeight: 800, fontSize: 17 }}>{q}</summary><p style={{ color: "#64748B", lineHeight: 1.75, marginTop: 12, maxWidth: 760 }}>{a}</p></details>)}
      </section>

      {/* Bottom CTA */}
      <section style={{ background: "#0D1B2A", padding: "72px 32px" }}>
        <div style={{ maxWidth: 640, margin: "0 auto", textAlign: "center" }}>
          <h2 style={{ color: "white", fontSize: 28, fontWeight: 800, marginBottom: 16 }}>
            Ready to optimise your packaging?
          </h2>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 16, lineHeight: 1.7, marginBottom: 32 }}>
            Browse the focused packaging catalogue, request a managed quote, or order a sample before committing to a run.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/products" style={{
              background: "#E8A838", color: "#0D1B2A",
              padding: "14px 28px", fontWeight: 800, fontSize: 14,
              textDecoration: "none", letterSpacing: "0.03em",
            }}>
              Browse Products →
            </Link>
            <Link href="/configure" style={{
              background: "transparent", color: "white",
              border: "1px solid rgba(255,255,255,0.3)",
              padding: "14px 28px", fontWeight: 600, fontSize: 14,
              textDecoration: "none",
            }}>
              Get a Quote
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function ArticleCard({ article }: { article: typeof ARTICLES[0] }) {
  return (
    <Link href={`/resources/${article.slug}`} style={{ textDecoration: "none" }}>
      <article style={{
        border: "1px solid #E2EAF4",
        borderRadius: 12,
        overflow: "hidden",
        background: "white",
        transition: "box-shadow 0.2s, transform 0.2s",
        cursor: "pointer",
        display: "block",
      }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 32px rgba(13,27,42,0.12)";
          (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLElement).style.boxShadow = "none";
          (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
        }}
      >
        {/* Hero image */}
        <div style={{ height: 200, overflow: "hidden", background: "#F1F5F9" }}>
          <img
            src={article.heroImage}
            alt={article.heroImageAlt}
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            loading="lazy"
          />
        </div>

        {/* Content */}
        <div style={{ padding: "24px 24px 28px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <span style={{
              background: "#EFF6FF", color: "#1B6CA8",
              padding: "3px 10px", borderRadius: 99,
              fontSize: 11, fontWeight: 700, letterSpacing: "0.5px",
            }}>
              {article.category}
            </span>
            <span style={{ color: "#94A3B8", fontSize: 12 }}>{article.readTime}</span>
          </div>

          <h2 style={{
            color: "#0D1B2A", fontSize: 17, fontWeight: 700,
            lineHeight: 1.4, marginBottom: 10,
          }}>
            {article.title}
          </h2>

          <p style={{ color: "#64748B", fontSize: 14, lineHeight: 1.65, marginBottom: 16 }}>
            {article.description}
          </p>

          <span style={{ color: "#1B6CA8", fontSize: 13, fontWeight: 700 }}>
            Read article →
          </span>
        </div>
      </article>
    </Link>
  );
}
