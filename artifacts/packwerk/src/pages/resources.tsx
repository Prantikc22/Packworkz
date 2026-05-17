import { useState } from "react";
import { Link } from "wouter";
import { ARTICLES, CATEGORIES } from "@/lib/resources-data";

export default function Resources() {
  const [activeCategory, setActiveCategory] = useState<string>("All");

  const filtered = activeCategory === "All"
    ? ARTICLES
    : ARTICLES.filter(a => a.category === activeCategory);

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
            Packaging Intelligence for D2C, FMCG &amp; Pharma Brands
          </h1>
          <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 17, lineHeight: 1.7, maxWidth: 560, marginBottom: 0 }}>
            Practical guides on cost optimisation, compliance, vendor management, and packaging strategy — written by practitioners, not consultants.
          </p>
        </div>
      </section>

      {/* Filter bar */}
      <div style={{ background: "white", borderBottom: "1px solid #E2EAF4", position: "sticky", top: 68, zIndex: 30 }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 32px", display: "flex", gap: 4, overflowX: "auto", paddingTop: 12, paddingBottom: 12 }}>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              style={{
                padding: "6px 16px",
                borderRadius: 99,
                border: `1px solid ${activeCategory === cat ? "#0D1B2A" : "#E2EAF4"}`,
                background: activeCategory === cat ? "#0D1B2A" : "white",
                color: activeCategory === cat ? "white" : "#64748B",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                whiteSpace: "nowrap",
                transition: "all 0.15s",
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Article grid */}
      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "56px 32px 96px" }}>
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

      {/* Bottom CTA */}
      <section style={{ background: "#0D1B2A", padding: "72px 32px" }}>
        <div style={{ maxWidth: 640, margin: "0 auto", textAlign: "center" }}>
          <h2 style={{ color: "white", fontSize: 28, fontWeight: 800, marginBottom: 16 }}>
            Ready to optimise your packaging?
          </h2>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 16, lineHeight: 1.7, marginBottom: 32 }}>
            Browse 110+ packaging SKUs, get a quote in 48 hours, or order a sample from ₹2,999.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/products" style={{
              background: "#E8A838", color: "#0D1B2A",
              padding: "14px 28px", fontWeight: 800, fontSize: 14,
              textDecoration: "none", letterSpacing: "0.03em",
            }}>
              Browse Products →
            </Link>
            <Link href="/quote" style={{
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
