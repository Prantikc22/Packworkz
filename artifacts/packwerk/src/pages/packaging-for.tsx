import { Link } from "wouter";
import { ArrowRight, ArrowUpRight, Plus } from "lucide-react";
import { USE_CASES, USE_CASE_BY_SLUG, USE_CASE_GROUPS, titleCase, type UseCase } from "@/lib/use-cases";
import { COMPLIANCE, faqsFor, resolveFormats } from "@/lib/use-case-content";
import { CATEGORY_BY_ID, SEED_MANUFACTURERS } from "@/lib/manufacturers";
import { ARTICLES } from "@/lib/resources-data";
import { money } from "@/lib/currency";
import "./manufacturing/make.css";

const rate = (value: number) => `₹${value.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

function NotFound() {
  return (
    <main className="mk">
      <section className="mk-cat-hero">
        <div className="mk-wrap">
          <nav className="mk-crumbs"><Link href="/packaging">Packaging by product</Link></nav>
          <h1>We don't have that page yet.</h1>
          <p className="mk-lede">Browse packaging by product type, or describe what you sell and we'll recommend a format.</p>
          <div style={{ display: "flex", gap: 10, marginTop: 28, flexWrap: "wrap" }}>
            <Link className="mk-btn is-ink" href="/packaging">All product types</Link>
            <Link className="mk-btn is-line" href="/products">Browse packaging</Link>
          </div>
        </div>
      </section>
    </main>
  );
}

export function PackagingFor({ params }: { params: { slug: string } }) {
  const useCase = USE_CASE_BY_SLUG[params.slug];
  if (!useCase) return <NotFound />;
  const formats = resolveFormats(useCase);
  const faqs = faqsFor(useCase);
  const compliance = COMPLIANCE[useCase.compliance];
  const guides = useCase.guides.map((slug) => ARTICLES.find((article) => article.slug === slug)).filter(Boolean);
  const complianceGuide = ARTICLES.find((article) => article.slug === compliance.guide);
  const related = useCase.related.map((slug) => USE_CASE_BY_SLUG[slug]).filter(Boolean) as UseCase[];
  const mfg = useCase.mfg ? CATEGORY_BY_ID[useCase.mfg] : null;
  const makers = useCase.mfg ? SEED_MANUFACTURERS.filter((m) => m.categories.includes(useCase.mfg!)) : [];
  const minMoq = formats.length ? Math.min(...formats.slice(0, 3).map(({ sku }) => sku.moq)) : 0;
  const title = `${titleCase(useCase.name)} packaging`;

  return (
    <main className="mk">
      <section className="mk-cat-hero">
        <div className="mk-wrap mk-cat-hero-grid">
          <div>
            <nav className="mk-crumbs"><Link href="/products">Packaging</Link><span>/</span><Link href="/packaging">By product</Link><span>/</span>{titleCase(useCase.name)}</nav>
            <h1>{title} in India</h1>
            <p className="mk-lede">{useCase.intro}</p>
            <div className="pk-hero-actions">
              <a className="mk-btn is-ink" href="#formats">Compare {formats.length} formats <ArrowRight size={16} /></a>
              <Link className="mk-btn is-line" href="/samples">Get samples · {money(299)}</Link>
            </div>
            <p className="mk-fine">{minMoq ? `From ${minMoq.toLocaleString("en-IN")} units · ` : ""}instant online pricing or a confirmed price within 4 business hours.</p>
          </div>
          {formats[0] && (
            <figure className="mk-cat-hero-photo">
              <img src={formats[0].image} alt={`${formats[0].sku.name} for ${useCase.name}`} />
              <figcaption>{formats[0].sku.name}</figcaption>
            </figure>
          )}
        </div>
      </section>

      <section className="mk-section" id="formats" style={{ scrollMarginTop: 90 }}>
        <div className="mk-wrap">
          <div className="mk-intro"><p className="mk-label">Recommended formats</p><h2>What {useCase.name} brands pack in.</h2></div>
          <div className="pk-formats">
            {formats.map(({ sku, why, image, fromPrice }, i) => (
              <Link key={sku.code} href={`/products/${sku.slug}`} className="pk-format">
                <figure><img src={image} alt={`${sku.name} for ${useCase.name}`} loading={i < 3 ? "eager" : "lazy"} /></figure>
                <div>
                  <div className="pk-format-copy">
                    <b>{sku.name}</b>
                    <p>{why}</p>
                    <span>View {sku.name.toLowerCase()} <ArrowUpRight size={14} /></span>
                  </div>
                  <dl>
                    <div><dt>Minimum</dt><dd>{sku.moq.toLocaleString("en-IN")} {sku.moq_unit}</dd></div>
                    {fromPrice > 0 ? <div><dt>From</dt><dd>{rate(fromPrice)} / {sku.moq_unit.replace(/s$/, "")}</dd></div> : <div />}
                    <div><dt>Pricing</dt><dd>{sku.publicBuyingPath === "instant" ? "Instant online" : "4-hour quote"}</dd></div>
                  </dl>
                </div>
              </Link>
            ))}
          </div>
          <p className="mk-fine">Prices are indicative unit rates before GST at higher quantity tiers; each product page shows the full price ladder.</p>
        </div>
      </section>

      <section className="mk-section is-paper">
        <div className="mk-wrap pk-split">
          <div>
            <div className="mk-intro"><p className="mk-label">The brief</p><h2>What {useCase.name} packaging has to do.</h2></div>
            <ol className="pk-needs">{useCase.needs.map((need, i) => <li key={need}><span>{String(i + 1).padStart(2, "0")}</span>{need}</li>)}</ol>
          </div>
          <aside className="pk-compliance">
            <p className="mk-label">{compliance.title}</p>
            <p>{compliance.text}</p>
            {complianceGuide && <Link className="mk-link" href={`/resources/${complianceGuide.slug}`}>{complianceGuide.title} <ArrowRight size={14} /></Link>}
          </aside>
        </div>
      </section>

      {mfg && makers.length > 0 && (
        <section className="mk-section">
          <div className="mk-wrap">
            <div className="mk-head-row">
              <div className="mk-intro"><p className="mk-label">Packworkz Make</p><h2>Need a factory to make your {useCase.name}?</h2></div>
              <Link className="mk-link" href={`/manufacturing/${mfg.id}`}>All {makers.length} {mfg.label.toLowerCase()} manufacturers <ArrowRight size={15} /></Link>
            </div>
            <div className="mk-dir-list">
              {makers.slice(0, 4).map((m) => (
                <Link key={m.slug} href={`/manufacturers/${m.slug}`} className="mk-dir-row">
                  <img src={`/images/manufacturing-v2/${mfg.id}.webp`} alt="" loading="lazy" />
                  <div className="mk-dir-name"><b>{m.name}</b><small>{Array.from(new Set([m.city, m.state].filter(Boolean))).join(", ") || "India"}</small></div>
                  <div className="mk-dir-makes"><p>{m.products.slice(0, 4).join(", ")}</p><small>{m.services.slice(0, 2).join(" · ")}</small></div>
                  <div className="mk-dir-meta"><p>{m.certifications.slice(0, 3).join(", ") || "Standards not listed"}</p></div>
                  <ArrowUpRight size={18} />
                </Link>
              ))}
            </div>
            <p className="mk-fine">Free introductions, no commission. Packworkz can deliver your packaging straight to the manufacturer's line.</p>
          </div>
        </section>
      )}

      <section className="mk-section is-paper">
        <div className="mk-wrap mk-faq-grid">
          <div className="mk-intro"><p className="mk-label">Questions</p><h2>{title}: good to know.</h2></div>
          <div className="mk-faq">
            {faqs.map(([q, a]) => <details key={q}><summary>{q}<Plus size={18} /></summary><p>{a}</p></details>)}
          </div>
        </div>
      </section>

      <section className="mk-section">
        <div className="mk-wrap pk-more">
          {guides.length > 0 && (
            <div>
              <p className="mk-label">Buying guides</p>
              <ul>{guides.map((guide) => <li key={guide!.slug}><Link href={`/resources/${guide!.slug}`}>{guide!.title}</Link></li>)}</ul>
            </div>
          )}
          <div>
            <p className="mk-label">Related product types</p>
            <ul>{related.map((item) => <li key={item.slug}><Link href={`/packaging/${item.slug}`}>{titleCase(item.name)} packaging</Link></li>)}</ul>
          </div>
          <div>
            <p className="mk-label">Keep exploring</p>
            <ul>
              <li><Link href="/packaging">All packaging by product</Link></li>
              <li><Link href="/products">Full packaging catalog</Link></li>
              {mfg && <li><Link href={`/manufacturing/${mfg.id}`}>{mfg.label} manufacturers</Link></li>}
              <li><Link href="/machinery">Packaging machines</Link></li>
            </ul>
          </div>
        </div>
      </section>
    </main>
  );
}

export default function PackagingHub() {
  return (
    <main className="mk">
      <section className="mk-dir-head" style={{ paddingBottom: 56 }}>
        <div className="mk-wrap">
          <nav className="mk-crumbs"><Link href="/products">Packaging</Link><span>/</span>By product</nav>
          <div className="mk-dir-title">
            <h1>Packaging by product</h1>
            <p className="mk-lede">Pick what you sell. Each page shows the formats brands use for it, real minimum orders and prices, labelling basics and manufacturers who can make it.</p>
          </div>
        </div>
      </section>
      <section className="mk-section">
        <div className="mk-wrap pk-hub">
          {USE_CASE_GROUPS.map((group) => (
            <div key={group} className="mk-index-group">
              <p className="mk-index-group-name">{group}</p>
              {USE_CASES.filter((useCase) => useCase.group === group).map((useCase) => {
                const first = resolveFormats(useCase)[0];
                return (
                  <Link key={useCase.slug} href={`/packaging/${useCase.slug}`} className="mk-index-row pk-hub-row">
                    {first && <img src={first.image} alt="" loading="lazy" />}
                    <b>{titleCase(useCase.name)}</b>
                    <small>{useCase.formats.slice(0, 3).map(([code]) => resolveFormats({ ...useCase, formats: [[code, ""]] })[0]?.sku.name).filter(Boolean).join(", ")}</small>
                    <span>{useCase.formats.length}</span>
                    <ArrowUpRight size={18} />
                  </Link>
                );
              })}
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
