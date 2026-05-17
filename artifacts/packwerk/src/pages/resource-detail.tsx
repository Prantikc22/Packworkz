import { Link, useRoute } from "wouter";
import { ARTICLES } from "@/lib/resources-data";
import type { ResourceSection } from "@/lib/resources-data";

export default function ResourceDetail() {
  const [, params] = useRoute("/resources/:slug");
  const slug = params?.slug ?? "";
  const article = ARTICLES.find(a => a.slug === slug);

  if (!article) {
    return (
      <div style={{ textAlign: "center", padding: "120px 32px", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: "#0D1B2A", marginBottom: 12 }}>Article not found</h1>
        <Link href="/resources" style={{ color: "#1B6CA8", fontWeight: 600 }}>← Back to Resources</Link>
      </div>
    );
  }

  const otherArticles = ARTICLES.filter(a => a.slug !== slug).slice(0, 3);

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", background: "white" }}>

      {/* Hero */}
      <section style={{ background: "linear-gradient(135deg, #020817 0%, #0c1f47 100%)", padding: "64px 0 0" }}>
        <div style={{ maxWidth: 780, margin: "0 auto", padding: "0 32px 0" }}>
          {/* Breadcrumb */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24, fontSize: 13, color: "rgba(255,255,255,0.45)" }}>
            <Link href="/" style={{ color: "inherit", textDecoration: "none" }}>Home</Link>
            <span>›</span>
            <Link href="/resources" style={{ color: "inherit", textDecoration: "none" }}>Resources</Link>
            <span>›</span>
            <span style={{ color: "rgba(255,255,255,0.7)" }}>{article.category}</span>
          </div>

          {/* Category + read time */}
          <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 20 }}>
            <span style={{
              background: "rgba(27,108,168,0.3)", color: "#93c5fd",
              padding: "4px 12px", borderRadius: 99,
              fontSize: 11, fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase",
            }}>
              {article.category}
            </span>
            <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 13 }}>{article.readTime}</span>
            <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 13 }}>· {article.publishedDate}</span>
          </div>

          <h1 style={{
            color: "white", fontSize: "clamp(1.6rem, 4vw, 2.5rem)",
            fontWeight: 800, lineHeight: 1.2, marginBottom: 20,
          }}>
            {article.title}
          </h1>
          <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 17, lineHeight: 1.7, marginBottom: 40 }}>
            {article.description}
          </p>
        </div>

        {/* Hero image */}
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 32px" }}>
          <div style={{ borderRadius: "12px 12px 0 0", overflow: "hidden", maxHeight: 440 }}>
            <img
              src={article.heroImage}
              alt={article.heroImageAlt}
              style={{ width: "100%", height: 440, objectFit: "cover", display: "block" }}
            />
          </div>
        </div>
      </section>

      {/* Article body */}
      <section style={{ maxWidth: 780, margin: "0 auto", padding: "56px 32px 80px" }}>
        <ArticleBody sections={article.content} />

        {/* Tags */}
        <div style={{ marginTop: 48, paddingTop: 32, borderTop: "1px solid #E2EAF4" }}>
          <p style={{ color: "#94A3B8", fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 12 }}>Keywords</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {article.keywords.map(kw => (
              <span key={kw} style={{
                background: "#F1F5F9", color: "#475569",
                padding: "4px 12px", borderRadius: 99,
                fontSize: 12,
              }}>
                {kw}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Related articles */}
      <section style={{ background: "#F8F9FC", padding: "64px 32px 80px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <h2 style={{ color: "#0D1B2A", fontSize: 22, fontWeight: 800, marginBottom: 32 }}>More from Packworkz Resources</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 24 }}>
            {otherArticles.map(a => (
              <Link key={a.slug} href={`/resources/${a.slug}`} style={{ textDecoration: "none" }}>
                <div style={{
                  background: "white", border: "1px solid #E2EAF4", borderRadius: 12,
                  overflow: "hidden", cursor: "pointer",
                  transition: "box-shadow 0.2s",
                }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 16px rgba(13,27,42,0.10)"}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.boxShadow = "none"}
                >
                  <img src={a.heroImage} alt={a.heroImageAlt} style={{ width: "100%", height: 160, objectFit: "cover", display: "block" }} loading="lazy" />
                  <div style={{ padding: "18px 20px 22px" }}>
                    <span style={{ color: "#1B6CA8", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px" }}>{a.category}</span>
                    <h3 style={{ color: "#0D1B2A", fontSize: 15, fontWeight: 700, lineHeight: 1.4, margin: "8px 0 0" }}>{a.title}</h3>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          <div style={{ marginTop: 40, textAlign: "center" }}>
            <Link href="/resources" style={{
              display: "inline-block", background: "#0D1B2A", color: "white",
              padding: "12px 28px", fontWeight: 700, fontSize: 14,
              textDecoration: "none",
            }}>
              View All Resources →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function ArticleBody({ sections }: { sections: ResourceSection[] }) {
  return (
    <div>
      {sections.map((section, i) => {
        if (section.type === "p") {
          return (
            <p key={i} style={{ color: "#334155", fontSize: 17, lineHeight: 1.8, marginBottom: 20 }}>
              {section.text}
            </p>
          );
        }
        if (section.type === "h2") {
          return (
            <h2 key={i} style={{ color: "#0D1B2A", fontSize: 22, fontWeight: 800, lineHeight: 1.3, margin: "40px 0 16px" }}>
              {section.text}
            </h2>
          );
        }
        if (section.type === "h3") {
          return (
            <h3 key={i} style={{ color: "#0D1B2A", fontSize: 18, fontWeight: 700, lineHeight: 1.3, margin: "28px 0 12px" }}>
              {section.text}
            </h3>
          );
        }
        if (section.type === "ul") {
          return (
            <ul key={i} style={{ paddingLeft: 0, listStyle: "none", margin: "4px 0 20px" }}>
              {(section.items ?? []).map((item, j) => (
                <li key={j} style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 10, color: "#334155", fontSize: 16, lineHeight: 1.7 }}>
                  <span style={{ color: "#E8A838", fontWeight: 800, flexShrink: 0, marginTop: 2 }}>→</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          );
        }
        if (section.type === "ol") {
          return (
            <ol key={i} style={{ paddingLeft: 0, listStyle: "none", margin: "4px 0 20px", counterReset: "item" }}>
              {(section.items ?? []).map((item, j) => (
                <li key={j} style={{ display: "flex", gap: 14, alignItems: "flex-start", marginBottom: 12, color: "#334155", fontSize: 16, lineHeight: 1.7 }}>
                  <span style={{
                    background: "#0D1B2A", color: "white",
                    width: 26, height: 26, borderRadius: "50%",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 13, fontWeight: 700, flexShrink: 0, marginTop: 2,
                  }}>
                    {j + 1}
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ol>
          );
        }
        if (section.type === "callout") {
          return (
            <div key={i} style={{
              background: "#EFF6FF", border: "1px solid #BFDBFE",
              borderLeft: "4px solid #1B6CA8",
              borderRadius: 8, padding: "16px 20px", margin: "24px 0",
            }}>
              {section.label && (
                <p style={{ color: "#1B6CA8", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 6 }}>
                  {section.label}
                </p>
              )}
              <p style={{ color: "#1e3a5f", fontSize: 16, lineHeight: 1.65, margin: 0 }}>
                {section.text}
              </p>
            </div>
          );
        }
        if (section.type === "cta") {
          return (
            <div key={i} style={{ margin: "32px 0", textAlign: "center" }}>
              <Link href={section.ctaHref ?? "/quote"} style={{
                display: "inline-block",
                background: "#E8A838", color: "#0D1B2A",
                padding: "14px 32px", fontWeight: 800, fontSize: 15,
                textDecoration: "none", borderRadius: 4,
                letterSpacing: "0.02em",
              }}>
                {section.ctaText ?? "Get a Quote →"}
              </Link>
            </div>
          );
        }
        return null;
      })}
    </div>
  );
}
