import { useEffect, useState, type FormEvent } from "react";
import { Link, useLocation } from "wouter";
import { ArrowRight, ArrowUpRight, ExternalLink, Factory } from "lucide-react";
import { CATALOG_SKUS, getCatalogImage } from "@/lib/catalog";
import { CATEGORY_BY_ID, SEEDED_ON, getManufacturer, manufacturerSeo, matchManufacturers, parseRequirementLocally, type Manufacturer, type Match } from "@/lib/manufacturers";
import { useManufacturerPool } from "@/lib/mfg-api";
import { trackMarketingEvent } from "@/lib/analytics";
import { VerificationBadge } from "./index";
import "./manufacturing.css";
import "./make.css";

const place = (m: Manufacturer) => Array.from(new Set([m.city, m.state].filter(Boolean))).join(", ") || "India";
const hostOf = (url: string) => { try { return new URL(url).hostname.replace(/^www\./, ""); } catch { return url; } };

/** A sentence built only from the listed facts, for profiles without an "about" line. */
function summaryOf(m: Manufacturer) {
  const list = (items: string[]) => items.join(", ").toLowerCase().replace(/, ([^,]*)$/, " and $1");
  const products = list(m.products.slice(0, 3)) || "consumer products";
  const from = m.city || m.state ? `, from ${place(m)}` : "";
  const lead = m.services.length ? `${list(m.services)} for ${products}` : `Makes ${products}`;
  return `${lead.charAt(0).toUpperCase()}${lead.slice(1)}${from}.`;
}

function FitCheck({ m }: { m: Manufacturer }) {
  const [brief, setBrief] = useState("");
  const [result, setResult] = useState<Match | null | "none">(null);
  const check = (event: FormEvent) => {
    event.preventDefault();
    if (brief.trim().length < 3) return;
    const req = parseRequirementLocally(brief);
    const hit = matchManufacturers(req, [m])[0];
    setResult(hit || "none");
    trackMarketingEvent("mfg_fit_check", { manufacturer: m.slug, fit: hit ? hit.score : 0 });
  };
  return (
    <div className="mk-fit">
      <form onSubmit={check}>
        <label htmlFor="mk-fit-input">Check your fit</label>
        <div>
          <input id="mk-fit-input" value={brief} onChange={(event) => { setBrief(event.target.value); setResult(null); }} placeholder={`e.g. ${m.products[0]}, 10,000 units, ${m.certifications[0] || "FSSAI"}`} autoComplete="off" />
          <button type="submit">Check</button>
        </div>
      </form>
      {result && result !== "none" && (
        <div className="mk-fit-result">
          <b>{result.score}<small>%</small></b>
          <div><p>Capability fit with {m.name}</p><ul>{result.reasons.map((reason) => <li key={reason}>{reason}</li>)}</ul></div>
          <Link className="mk-btn is-ink" href={`/manufacturing/launch?m=${m.slug}&brief=${encodeURIComponent(brief)}`}>Request intro</Link>
        </div>
      )}
      {result === "none" && (
        <div className="mk-fit-result is-miss">
          <p>Not a strong fit on what this factory lists. Other manufacturers may suit you better.</p>
          <Link className="mk-btn is-line" href={`/manufacturing?q=${encodeURIComponent(brief)}`}>See better matches <ArrowRight size={15} /></Link>
        </div>
      )}
    </div>
  );
}

export default function ManufacturerProfile({ params }: { params: { slug: string } }) {
  const pool = useManufacturerPool();
  const [, navigate] = useLocation();
  const m = getManufacturer(params.slug, pool);
  const [brief, setBrief] = useState("");
  const [qty, setQty] = useState("");

  // Self-listed factories arrive after the layout sets its title, so set it here too.
  useEffect(() => { if (m) document.title = manufacturerSeo(m).title; }, [m?.slug]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!m) {
    return (
      <main className="mk">
        <section className="mk-cat-hero">
          <div className="mk-wrap">
            <nav className="mk-crumbs"><Link href="/manufacturing">Packworkz Make</Link><span>/</span>Not found</nav>
            <h1>We couldn't find that manufacturer.</h1>
            <p className="mk-lede">The profile may have been renamed or removed.</p>
            <div style={{ display: "flex", gap: 10, marginTop: 28, flexWrap: "wrap" }}>
              <Link className="mk-btn is-ink" href="/manufacturers">Browse the directory</Link>
              <Link className="mk-btn is-line" href="/manufacturing">Match my product</Link>
            </div>
          </div>
        </section>
      </main>
    );
  }

  const categories = m.categories.map((id) => CATEGORY_BY_ID[id]).filter(Boolean);
  const primary = categories[0];
  const packaging = Array.from(new Set(categories.flatMap((category) => category.packaging))).map((code) => CATALOG_SKUS.find((sku) => sku.code === code)).filter(Boolean).slice(0, 4);
  const similar = pool.filter((other) => other.slug !== m.slug && other.categories.some((id) => m.categories.includes(id))).slice(0, 5);
  const sourced = m.sourcedOn || SEEDED_ON;

  const facts: Array<[string, string]> = [
    ["Standards stated", m.certifications.slice(0, 3).join(", ") || "Not listed"],
    ["Minimum order", m.moq || "On request"],
    ["Capacity", m.capacity || "On request"],
    ["Established", m.since || "Not stated"],
  ];
  const spec: Array<[string, string]> = [
    ["Location", place(m)],
    ["Categories", categories.map((category) => category.label).join(", ")],
    ["Services", m.services.join(", ")],
    ["Standards stated", m.certifications.length ? m.certifications.join(", ") : "Not listed on their website"],
    ["Minimum order", m.moq || "Confirmed during introduction"],
    ["Capacity", m.capacity || "Confirmed during introduction"],
    ["Established", m.since || "Not stated"],
  ];

  const requestIntro = (event: FormEvent) => {
    event.preventDefault();
    const text = [brief.trim(), qty.trim() && `${qty.trim()}`].filter(Boolean).join(", ");
    trackMarketingEvent("mfg_intro_clicked", { manufacturer: m.slug, from: "profile" });
    navigate(`/manufacturing/launch?m=${m.slug}${text ? `&brief=${encodeURIComponent(text)}` : ""}`);
  };

  return (
    <main className="mk">
      <section className="mk-pro-hero">
        <div className="mk-wrap mk-pro-hero-grid">
          <div>
            <nav className="mk-crumbs">
              <Link href="/manufacturing">Packworkz Make</Link><span>/</span>
              <Link href="/manufacturers">Directory</Link>
              {primary && <><span>/</span><Link href={`/manufacturing/${primary.id}`}>{primary.label}</Link></>}
            </nav>
            <p className="mk-label" style={{ marginTop: 36 }}>{m.services.slice(0, 2).join(" · ")}</p>
            <h1>{m.name}</h1>
            <p className="mk-pro-loc">{place(m)}{m.website && <> · <a href={m.website} target="_blank" rel="noopener noreferrer nofollow">{hostOf(m.website)} <ExternalLink size={13} /></a></>}</p>
            <p className="mk-lede">{m.about || summaryOf(m)}</p>
            <div className="mk-pro-status"><VerificationBadge m={m} />{!m.claimed && <span>Compiled from their website, {sourced}</span>}</div>
          </div>
          <figure className="mk-pro-photo">
            <img src={`/images/manufacturing-v2/${primary?.id || "snacks"}.webp`} alt={`${primary?.label || "Consumer"} products`} />
            <figcaption>Category image · not this manufacturer's facility</figcaption>
          </figure>
        </div>
        <div className="mk-wrap mk-pro-facts">
          {facts.map(([label, value]) => <div key={label}><small>{label}</small><b>{value}</b></div>)}
        </div>
      </section>

      <section className="mk-pro-body">
        <div className="mk-wrap mk-pro-grid">
          <div className="mk-pro-main">
            <div className="mk-pro-block">
              <h2>What they make</h2>
              <ol className="mk-pro-products">
                {m.products.map((product, i) => <li key={product}><span>{String(i + 1).padStart(2, "0")}</span>{product}</li>)}
              </ol>
            </div>

            <div className="mk-pro-block">
              <h2>Capabilities</h2>
              <dl className="mk-pro-spec">{spec.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
            </div>

            <div className="mk-pro-block">
              <h2>Is it a fit for you?</h2>
              <p className="mk-pro-note">Describe your product and we'll score it against what {m.name} lists.</p>
              <FitCheck m={m} />
            </div>

            {packaging.length > 0 && (
              <div className="mk-pro-block">
                <h2>Packaging for this line</h2>
                <p className="mk-pro-note">Packworkz supplies these formats straight to the manufacturer's line.</p>
                <div className="mk-pro-packs">
                  {packaging.map((sku) => (
                    <Link key={sku!.code} href={`/products/${sku!.slug}`}>
                      <figure><img src={getCatalogImage(sku!)} alt="" loading="lazy" /></figure>
                      <b>{sku!.name}</b>
                      <small>View pack <ArrowUpRight size={13} /></small>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {!m.claimed && (
              <p className="mk-pro-source">
                This profile was compiled from {m.name}'s own public website on {sourced} and has not been reviewed by Packworkz. Confirm licences, capacity and pricing directly before committing.
                {m.website && <> Source: <a href={m.website} target="_blank" rel="noopener noreferrer nofollow">{hostOf(m.website)}</a>.</>}
              </p>
            )}
          </div>

          <aside className="mk-pro-aside">
            <form className="mk-pro-intro pw-glow-tl" onSubmit={requestIntro}>
              <h3>Request an introduction</h3>
              <p>We confirm fit and availability with {m.name}, then connect you directly.</p>
              <label>What do you want to make?<textarea value={brief} onChange={(event) => setBrief(event.target.value)} placeholder={`e.g. ${m.products[0]}`} rows={3} /></label>
              <label>Quantity<input value={qty} onChange={(event) => setQty(event.target.value)} placeholder="e.g. 10,000 units / month" /></label>
              <button className="mk-btn is-white" type="submit">Continue <ArrowRight size={16} /></button>
              <ul><li>Free, no commission</li><li>Factory quotes you directly</li><li>Brief shared only with this factory</li></ul>
            </form>
            {!m.claimed && (
              <div className="mk-pro-claim">
                <h3>Is this your factory?</h3>
                <p>Claim it for free to correct details, add capacity and get the Packworkz Verified badge.</p>
                <Link className="mk-link" href={`/manufacturing/list-your-factory?claim=${m.slug}`}><Factory size={15} /> Claim this profile</Link>
              </div>
            )}
          </aside>
        </div>
      </section>

      {similar.length > 0 && (
        <section className="mk-section is-paper">
          <div className="mk-wrap">
            <div className="mk-head-row">
              <div className="mk-intro"><p className="mk-label">Compare</p><h2>Similar manufacturers.</h2></div>
              <Link className="mk-link" href={`/manufacturers${primary ? `?cat=${primary.id}` : ""}`}>All {primary?.label.toLowerCase()} makers <ArrowRight size={15} /></Link>
            </div>
            <div className="mk-dir-list">
              {similar.map((other) => (
                <Link key={other.slug} href={`/manufacturers/${other.slug}`} className="mk-dir-row">
                  <img src={`/images/manufacturing-v2/${other.categories[0]}.webp`} alt="" loading="lazy" />
                  <div className="mk-dir-name"><b>{other.name}</b><small>{place(other)}</small></div>
                  <div className="mk-dir-makes"><p>{other.products.slice(0, 4).join(", ")}</p><small>{other.services.slice(0, 2).join(" · ")}</small></div>
                  <div className="mk-dir-meta"><p>{other.certifications.slice(0, 3).join(", ") || "Standards not listed"}</p><VerificationBadge m={other} /></div>
                  <ArrowUpRight size={18} />
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
