import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { Link, useLocation } from "wouter";
import { ArrowRight, ArrowUpRight, BadgeCheck, Plus, ShieldCheck } from "lucide-react";
import { CATALOG_SKUS } from "@/lib/catalog";
import { CATEGORY_BY_ID, MFG_CATEGORIES, SEEDED_ON, matchManufacturers, type CategoryId, type Manufacturer, type Match, type ParsedRequirement } from "@/lib/manufacturers";
import { parseRequirement, useManufacturerPool } from "@/lib/mfg-api";
import { money } from "@/lib/currency";
import { trackMarketingEvent } from "@/lib/analytics";
import "./manufacturing.css";
import "./make.css";

const EXAMPLES = [
  "20g protein bar, 50,000 a month, flow-wrap, FSSAI",
  "Vitamin C face serum, 5,000 dropper bottles, private label",
  "Peanut butter in glass jars, 10,000 jars a month, Gujarat",
  "Sugar-free gummies for a supplement brand, WHO-GMP",
  "Liquid detergent, 1L bottles, private label, Maharashtra",
  "Dog treats for an export brand, HACCP",
];

const GROUPS = ["Food & Beverage", "Health & Wellness", "Beauty & Personal Care", "Home & Pet"] as const;

/** Points on /images/manufacturing-v2/hero.webp (percent of the 1800×1000 frame). */
const HOTSPOTS: Array<{ id: CategoryId; label: string; x: number; y: number; side?: "left" }> = [
  { id: "bars", label: "Protein bars", x: 74, y: 70 },
  { id: "nutraceuticals", label: "Supplements", x: 60, y: 47, side: "left" },
  { id: "skincare", label: "Serums", x: 88, y: 53 },
  { id: "beverages", label: "Beverages", x: 94, y: 33, side: "left" },
];

const BRIEF_PARTS: Array<[string, string | null]> = [
  ["20g whey ", null],
  ["protein bar", "Category"],
  [", chocolate, ", null],
  ["50,000 a month", "Volume"],
  [", ", null],
  ["flow-wrapped", "Pack format"],
  [", ", null],
  ["FSSAI", "Licence"],
  [", ideally in ", null],
  ["South India", "Region"],
  [".", null],
];

export const FAQS: Array<[string, string]> = [
  ["Is it free to find a manufacturer?", "Yes. Direct Connect is free for brands and manufacturers. Packworkz takes no commission and does not mark up the factory quote. Launch Desk is an optional one-time paid service if you want us to manage the shortlist, quotes and samples."],
  ["Are these manufacturers verified?", "Only profiles marked Verified have passed Packworkz checks. Profiles marked Unclaimed are compiled from the manufacturer's own public website and haven't been reviewed by us yet — always confirm licences, capacity and pricing before you commit."],
  ["How is this different from a B2B directory?", "You don't pay to unlock phone numbers and your details aren't sold to dozens of sellers. You describe one requirement, we rank factories by capability fit and introduce you to the few that fit."],
  ["I run a factory. How do I get listed?", "List your factory for free. Basic checks (GST, licences) are free and online; the Verified badge adds a video factory walkthrough and capacity review for a one-time fee."],
  ["Can Packworkz supply packaging for my product?", "Yes — that's the point. Once your manufacturer is fixed, we supply the pouches, rollstock, jars, bottles, cartons and labels to their line."],
];

const CATEGORY_IMAGE = (id: CategoryId) => `/images/manufacturing-v2/${id}.webp`;
const place = (m: Manufacturer) => Array.from(new Set([m.city, m.state].filter(Boolean))).join(", ") || "India";
const shortName = (name: string) => name.replace(/\s*\(.*\)$/, "");

function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll(".mk-reveal:not(.is-in)");
    const io = new IntersectionObserver((entries) => entries.forEach((entry) => { if (entry.isIntersecting) { entry.target.classList.add("is-in"); io.unobserve(entry.target); } }), { threshold: 0.15 });
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  });
}

/** Example quote that builds line by line when scrolled into view. */
function Receipt() {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);
  const [total, setTotal] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      setShown(true);
      io.disconnect();
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduce) { setTotal(18.4); return; }
      const start = performance.now() + 900;
      const tick = (now: number) => {
        const t = Math.min(1, Math.max(0, (now - start) / 700));
        setTotal(18.4 * (1 - Math.pow(1 - t, 3)));
        if (t < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, { threshold: 0.35 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const rows: Array<[string, string]> = [["Manufacturer's price", "₹18.40"], ["Packworkz commission", "₹0.00"], ["Lead or unlock fees", "₹0.00"]];
  return (
    <div ref={ref} className={`mk-receipt${shown ? " is-in" : ""}`} aria-label="Example of how a factory quote reaches you">
      <p className="mk-receipt-head"><span>Example quote</span><span>per bar</span></p>
      <dl>
        {rows.map(([label, value], i) => (
          <div key={label} className={value === "₹0.00" ? "is-zero" : ""} style={{ ["--d" as string]: `${120 + i * 160}ms` }}><dt>{label}</dt><dd>{value}</dd></div>
        ))}
        <div className="is-total" style={{ ["--d" as string]: "640ms" }}><dt>You pay the factory</dt><dd>₹{total.toFixed(2)}</dd></div>
      </dl>
      <p className="mk-receipt-foot">Illustrative figures. Your manufacturer sets the price.</p>
    </div>
  );
}

export function VerificationBadge({ m }: { m: Manufacturer }) {
  if (m.verification === "verified") return <span className="mf-status is-verified"><BadgeCheck size={14} /> Packworkz verified</span>;
  if (m.verification === "basic") return <span className="mf-status is-basic"><ShieldCheck size={14} /> Documents checked</span>;
  return <span className="mf-status is-unclaimed">Unclaimed · public info</span>;
}

function MatchRow({ match, index, brief }: { match: Match; index: number; brief: string }) {
  const m = match.manufacturer;
  return (
    <article className="mk-result" style={{ ["--i" as string]: index }}>
      <span className="mk-result-rank">{String(index + 1).padStart(2, "0")}</span>
      <div className="mk-result-main">
        <h3><Link href={`/manufacturers/${m.slug}`}>{m.name}</Link></h3>
        <p>{place(m)} · {m.products.slice(0, 4).join(", ")}</p>
        <ul>{match.reasons.slice(0, 3).map((reason) => <li key={reason}>{reason}</li>)}</ul>
        <VerificationBadge m={m} />
      </div>
      <div className="mk-result-fit">
        <b>{match.score}<small>%</small></b>
        <span><i style={{ width: `${match.score}%` }} /></span>
        <small>capability fit</small>
      </div>
      <div className="mk-result-actions">
        <Link className="mk-btn is-ink" href={`/manufacturing/launch?m=${m.slug}&brief=${encodeURIComponent(brief)}`} onClick={() => trackMarketingEvent("mfg_intro_clicked", { manufacturer: m.slug })}>Request intro</Link>
        <Link className="mk-btn is-quiet" href={`/manufacturers/${m.slug}`}>Profile</Link>
      </div>
    </article>
  );
}

export default function Manufacturing({ params }: { params?: { category?: string } }) {
  const [location] = useLocation();
  const presetCategory = params?.category && params.category in CATEGORY_BY_ID ? (params.category as CategoryId) : null;
  const pool = useManufacturerPool();
  const [query, setQuery] = useState("");
  const [placeholder, setPlaceholder] = useState(0);
  const [phase, setPhase] = useState(-1);
  const [parsed, setParsed] = useState<ParsedRequirement | null>(null);
  const [matches, setMatches] = useState<Match[] | null>(null);
  const [hovered, setHovered] = useState<CategoryId>("bars");
  const resultsRef = useRef<HTMLDivElement>(null);
  useReveal();

  useEffect(() => {
    const timer = window.setInterval(() => setPlaceholder((value) => (value + 1) % EXAMPLES.length), 3600);
    return () => window.clearInterval(timer);
  }, []);

  const countFor = (id: CategoryId) => pool.filter((m) => m.categories.includes(id)).length;

  // Category pages open with that category already ranked.
  const categoryMatches = useMemo(() => {
    if (!presetCategory) return null;
    const item = CATEGORY_BY_ID[presetCategory];
    return matchManufacturers({ category: presetCategory, product: item.label, monthlyUnits: null, certifications: [], services: [], location: null, packaging: null, summary: item.label, ai: false }, pool);
  }, [presetCategory, pool]);

  const run = async (text: string) => {
    const brief = text.trim();
    if (brief.length < 3) return;
    setQuery(brief);
    setMatches(null);
    setPhase(0);
    trackMarketingEvent("mfg_search", { query: brief.slice(0, 80) });
    const started = Date.now();
    const parsePromise = parseRequirement(brief);
    window.setTimeout(() => setPhase(1), 600);
    const req = await parsePromise;
    const wait = Math.max(0, 1300 - (Date.now() - started));
    window.setTimeout(() => setPhase(2), wait);
    window.setTimeout(() => {
      setParsed(req);
      setMatches(matchManufacturers(req, pool).slice(0, 9));
      setPhase(3);
      window.setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
    }, wait + 600);
  };

  useEffect(() => {
    const q = new URLSearchParams(location.split("?")[1] || window.location.search).get("q");
    if (q) void run(q);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submit = (event: FormEvent) => { event.preventDefault(); void run(query); };
  const reset = () => { setMatches(null); setParsed(null); setPhase(-1); };

  const packSuggestions = useMemo(() => {
    const id = parsed?.category || presetCategory;
    if (!id) return [];
    return CATEGORY_BY_ID[id].packaging.map((code) => CATALOG_SKUS.find((sku) => sku.code === code)).filter(Boolean).slice(0, 3);
  }, [parsed, presetCategory]);

  const spotlight = pool.filter((m) => m.spotlight || m.verification === "verified").slice(0, 6);
  const demoRows = ["food-innovators", "lerel-health-foods", "fermentis-life-sciences"].map((slug) => pool.find((m) => m.slug === slug)).filter(Boolean) as Manufacturer[];
  const shownMatches = matches ?? categoryMatches;
  const category = presetCategory ? CATEGORY_BY_ID[presetCategory] : null;
  const busy = phase >= 0 && phase < 3;
  const scanSteps = ["Reading brief", `Checking ${pool.length} manufacturers`, "Ranking by fit"];

  const searchForm = (
    <>
      <form className="mk-search" onSubmit={submit}>
        <label htmlFor="mk-brief">What do you want to make?</label>
        <div>
          <input id="mk-brief" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={EXAMPLES[placeholder]} autoComplete="off" />
          <button type="submit" disabled={busy}>{busy ? "Matching…" : <>Find manufacturers <ArrowRight size={16} /></>}</button>
        </div>
      </form>
      {busy ? (
        <ol className="mk-scan" role="status" aria-live="polite">
          {scanSteps.map((step, i) => <li key={step} className={i < phase ? "is-done" : i === phase ? "is-on" : ""}>{step}</li>)}
        </ol>
      ) : (
        <p className="mk-try">Try <button type="button" onClick={() => void run(EXAMPLES[0])}>protein bars</button>, <button type="button" onClick={() => void run(EXAMPLES[1])}>face serum</button>, <button type="button" onClick={() => void run(EXAMPLES[2])}>peanut butter</button> or <button type="button" onClick={() => void run(EXAMPLES[3])}>gummies</button>.</p>
      )}
    </>
  );

  return (
    <main className="mk">
      {category ? (
        <section className="mk-cat-hero">
          <div className="mk-wrap mk-cat-hero-grid">
            <div>
              <nav className="mk-crumbs"><Link href="/manufacturing">Packworkz Make</Link><span>/</span>{category.group}</nav>
              <h1>{category.label} manufacturers</h1>
              <p className="mk-lede">Private-label and contract makers of {category.examples.toLowerCase()}, ranked by stated capability — with the packaging to match.</p>
              {searchForm}
            </div>
            <figure className="mk-cat-hero-photo"><img src={CATEGORY_IMAGE(category.id)} alt={`${category.label} products`} /><figcaption>{countFor(category.id)} manufacturers listed</figcaption></figure>
          </div>
        </section>
      ) : (
        <section className="mk-hero">
          <div className="mk-hero-frame">
            <div className="mk-hero-copy">
              <p className="mk-label">Packworkz Make</p>
              <h1>Find the factory that makes your product.</h1>
              <p className="mk-lede">Describe what you want to make. We shortlist contract and private-label manufacturers that can actually make it, and introduce you directly — at factory price.</p>
              {searchForm}
            </div>
            <div className="mk-hero-photo">
              <img className="mk-hero-img" src="/images/manufacturing-v2/hero.webp" alt="Consumer product manufacturing line with protein bars, supplement jars, serums and bottled drinks" fetchPriority="high" />
              {HOTSPOTS.map((spot, i) => (
                <Link key={spot.id} href={`/manufacturing/${spot.id}`} className={`mk-spot${spot.side === "left" ? " is-left" : ""}`} style={{ left: `${spot.x}%`, top: `${spot.y}%`, ["--d" as string]: `${700 + i * 140}ms` }}>
                  <i />
                  <span><b>{spot.label}</b>{countFor(spot.id)} makers</span>
                </Link>
              ))}
            </div>
          </div>
          <div className="mk-wrap mk-hero-facts">
            <Link href="/manufacturers"><b>{pool.length}</b><span>manufacturers indexed from their own published capabilities. <u>Browse the directory</u></span></Link>
            <div><b>{MFG_CATEGORIES.length}</b><span>consumer categories, from namkeen to nutraceuticals</span></div>
            <div><b>0%</b><span>commission. The factory's quote is the price you pay.</span></div>
          </div>
        </section>
      )}

      {shownMatches && (
        <section className="mk-results" ref={resultsRef}>
          <div className="mk-wrap">
            <div className="mk-results-head">
              <div>
                <p className="mk-label">{matches ? (parsed?.ai ? "Shortlist · AI-read brief" : "Shortlist") : "Directory"}</p>
                <h2>{matches ? `${shownMatches.length} manufacturer${shownMatches.length === 1 ? "" : "s"} fit your brief.` : `Every ${category?.label.toLowerCase()} maker we list.`}</h2>
              </div>
              {parsed && matches && (
                <dl className="mk-brief">
                  {parsed.category && <div><dt>Category</dt><dd>{CATEGORY_BY_ID[parsed.category].label}</dd></div>}
                  {parsed.monthlyUnits && <div><dt>Volume</dt><dd>{parsed.monthlyUnits.toLocaleString("en-IN")} / month</dd></div>}
                  {parsed.packaging && <div><dt>Pack</dt><dd>{parsed.packaging}</dd></div>}
                  {parsed.certifications.length > 0 && <div><dt>Standards</dt><dd>{parsed.certifications.join(", ")}</dd></div>}
                  {parsed.location && <div><dt>Region</dt><dd>{parsed.location}</dd></div>}
                  <button type="button" onClick={reset}>Clear</button>
                </dl>
              )}
            </div>
            {shownMatches.length ? (
              <div className="mk-result-list">{shownMatches.map((match, i) => <MatchRow key={match.manufacturer.slug} match={match} index={i} brief={query || category?.label || ""} />)}</div>
            ) : (
              <div className="mk-empty">
                <p>No strong match is listed yet. Post the requirement and we'll source factories for you directly.</p>
                <Link className="mk-btn is-ink" href={`/manufacturing/launch?brief=${encodeURIComponent(query)}`}>Post this requirement <ArrowRight size={16} /></Link>
              </div>
            )}
            <p className="mk-fine">Ranked on each factory's stated capabilities. We confirm availability before any introduction. <Link href={`/manufacturers${category ? `?cat=${category.id}` : ""}`}>Search the full directory</Link>.</p>
            {packSuggestions.length > 0 && (
              <div className="mk-packline">
                <p><b>Packaging, sorted too.</b> We supply your pack straight to the manufacturer's line.</p>
                <div>{packSuggestions.map((sku) => <Link key={sku!.code} href={`/products/${sku!.slug}`}>{sku!.name} <ArrowUpRight size={14} /></Link>)}</div>
              </div>
            )}
          </div>
        </section>
      )}

      {!category && (
        <section className="mk-section">
          <div className="mk-wrap">
            <div className="mk-intro mk-reveal">
              <p className="mk-label">How matching works</p>
              <h2>Write it the way you'd say it. <span>We read it like a sourcing manager.</span></h2>
            </div>
            <div className="mk-demo mk-reveal">
              <div className="mk-demo-brief">
                <p className="mk-demo-tag">Your brief</p>
                <p className="mk-annotated">
                  {BRIEF_PARTS.map(([text, tag], i) => tag
                    ? <mark key={i} style={{ ["--d" as string]: `${i * 90}ms` }}>{text}<small>{tag}</small></mark>
                    : <span key={i}>{text}</span>)}
                </p>
              </div>
              <div className="mk-demo-list">
                <p className="mk-demo-tag">Shortlist <span>illustrative</span></p>
                {demoRows.map((m, i) => (
                  <Link key={m.slug} href={`/manufacturers/${m.slug}`} className="mk-demo-row" style={{ ["--d" as string]: `${900 + i * 160}ms` }}>
                    <span>{String(i + 1).padStart(2, "0")}</span>
                    <div><b>{shortName(m.name)}</b><small>{place(m)} · {m.products.slice(0, 2).join(", ")}</small></div>
                    <em>{[94, 88, 82][i]}%</em>
                  </Link>
                ))}
                <p className="mk-demo-foot">Each point of fit is explained — category, product, standards, services and region.</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {!category && (
        <section className="mk-section is-paper">
          <div className="mk-wrap mk-index">
            <div className="mk-index-side">
              <div className="mk-intro mk-reveal">
                <p className="mk-label">The network</p>
                <h2>Sixteen categories. <span>Start with what you make.</span></h2>
                <Link className="mk-link" style={{ marginTop: 24 }} href="/manufacturers">Search all {pool.length} manufacturers <ArrowRight size={15} /></Link>
              </div>
              <figure className="mk-index-photo" aria-hidden="true">
                {MFG_CATEGORIES.map((item) => <img key={item.id} src={CATEGORY_IMAGE(item.id)} alt="" loading="lazy" className={hovered === item.id ? "is-on" : ""} />)}
                <figcaption>{CATEGORY_BY_ID[hovered].examples}</figcaption>
              </figure>
            </div>
            <div className="mk-index-list">
              {GROUPS.map((group) => (
                <div key={group} className="mk-index-group">
                  <p className="mk-index-group-name">{group}</p>
                  {MFG_CATEGORIES.filter((item) => item.group === group).map((item) => (
                    <Link key={item.id} href={`/manufacturing/${item.id}`} className={`mk-index-row${hovered === item.id ? " is-on" : ""}`} onMouseEnter={() => setHovered(item.id)} onFocus={() => setHovered(item.id)}>
                      <img src={CATEGORY_IMAGE(item.id)} alt="" loading="lazy" />
                      <b>{item.label}</b>
                      <small>{item.examples}</small>
                      <span>{countFor(item.id)}</span>
                      <ArrowUpRight size={18} />
                    </Link>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="mk-section is-ink pw-glow-tl">
        <div className="mk-wrap mk-ledger">
          <div className="mk-intro mk-reveal">
            <p className="mk-label">The commercial model</p>
            <h2>Factory price means factory price.</h2>
            <p className="mk-body">Introductions are free on both sides. The manufacturer quotes you directly, you contract with them directly, and Packworkz adds nothing in between. We earn when you buy packaging from us — or if you choose Launch Desk.</p>
          </div>
          <Receipt />
        </div>
        <div className="mk-wrap">
          <table className="mk-compare mk-reveal">
            <thead><tr><th scope="col"><span className="sr-only">Topic</span></th><th scope="col">Typical B2B directory</th><th scope="col">Packworkz Make</th></tr></thead>
            <tbody>
              {[
                ["Contacts", "Pay to unlock numbers or buy lead credits", "Free, direct introductions"],
                ["Your brief", "Broadcast to unrelated sellers", "Shared only with factories you approve"],
                ["Listings", "Generic catalogue pages", "Products, MOQ, licences and services, structured"],
                ["Fit", "You call factories one by one", "Ranked by capability, availability confirmed"],
                ["Packaging", "Separate search, separate vendor", "Supplied to your manufacturer's line"],
              ].map(([topic, them, us]) => <tr key={topic}><th scope="row">{topic}</th><td>{them}</td><td>{us}</td></tr>)}
            </tbody>
          </table>
        </div>
      </section>

      {spotlight.length > 0 && !category && (
        <section className="mk-section">
          <div className="mk-wrap">
            <div className="mk-head-row mk-reveal">
              <div className="mk-intro"><p className="mk-label">From the network</p><h2>Manufacturers worth a look.</h2></div>
              <Link className="mk-link" href="/manufacturing/list-your-factory">Run one of these? Claim the profile <ArrowRight size={15} /></Link>
            </div>
            <div className="mk-spot-list">
              {spotlight.map((m) => (
                <Link key={m.slug} href={`/manufacturers/${m.slug}`} className="mk-spot-row mk-reveal">
                  <img src={CATEGORY_IMAGE(m.categories[0])} alt="" loading="lazy" />
                  <div><b>{m.name}</b><small>{place(m)}</small></div>
                  <p>{m.products.slice(0, 4).join(", ")}</p>
                  <p className="mk-spot-services">{m.services.slice(0, 2).join(" · ")}</p>
                  <VerificationBadge m={m} />
                  <ArrowUpRight size={18} />
                </Link>
              ))}
            </div>
            <p className="mk-fine">Chosen by our editors from each manufacturer's own public information (compiled {SEEDED_ON}). Unless marked Verified, profiles have not been audited by Packworkz, and none paid for placement.</p>
          </div>
        </section>
      )}

      <section className="mk-section is-paper" id="pricing">
        <div className="mk-wrap">
          <div className="mk-intro mk-reveal"><p className="mk-label">Ways to work with us</p><h2>Do it yourself, <span>or let us run it.</span></h2></div>
          <div className="mk-plans mk-reveal">
            <div className="mk-plan">
              <p className="mk-plan-for">Brands</p>
              <h3>Direct Connect</h3>
              <p className="mk-plan-price">Free</p>
              <p className="mk-plan-copy">Match against every listed factory and request introductions to up to three. You take it from there.</p>
              <Link className="mk-btn is-line" href="/manufacturing/launch">Post a requirement</Link>
            </div>
            <div className="mk-plan is-feature">
              <p className="mk-plan-for">Brands</p>
              <h3>Launch Desk</h3>
              <p className="mk-plan-price">{money(14999)} <small>one-time</small></p>
              <p className="mk-plan-copy">We shortlist three factories that fit and have capacity, collect comparable quotes, coordinate samples and plan your packaging with the line. One Packworkz owner until first production.</p>
              <Link className="mk-btn is-ink" href="/manufacturing/launch?plan=desk">Start with Launch Desk <ArrowRight size={16} /></Link>
            </div>
            <div className="mk-plan">
              <p className="mk-plan-for">Manufacturers</p>
              <h3>List your factory</h3>
              <p className="mk-plan-price">Free <small>· Verified {money(4999)}</small></p>
              <p className="mk-plan-copy">A structured profile that ranks on capability, with a free online document check. The Verified badge adds a video walkthrough and capacity review.</p>
              <Link className="mk-btn is-line" href="/manufacturing/list-your-factory">List your factory</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mk-section">
        <div className="mk-wrap mk-faq-grid">
          <div className="mk-intro mk-reveal"><p className="mk-label">Questions</p><h2>Good to know.</h2></div>
          <div className="mk-faq">
            {FAQS.map(([q, a]) => <details key={q}><summary>{q}<Plus size={18} /></summary><p>{a}</p></details>)}
          </div>
        </div>
      </section>

      <section className="mk-close">
        <div className="mk-close-copy pw-glow-br">
          <h2>Make it. Pack it.<br />Ship it.</h2>
          <p>From the factory that makes your product to the pack it ships in — one platform, one team.</p>
          <div>
            <a className="mk-btn is-white" href="#top" onClick={(event) => { event.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); window.setTimeout(() => document.getElementById("mk-brief")?.focus(), 500); }}>Find a manufacturer</a>
            <Link className="mk-btn is-ghost" href="/products">Browse packaging</Link>
          </div>
        </div>
        <img src="/images/manufacturing-v2/landing-card.webp" alt="A protein bar, serum bottle, supplement jar and bottled drink on a factory line" loading="lazy" />
      </section>
    </main>
  );
}
