import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import { ArrowRight, ArrowUpRight, Search, X } from "lucide-react";
import { CATEGORY_BY_ID, MFG_CATEGORIES, type CategoryId, type Manufacturer } from "@/lib/manufacturers";
import { useManufacturerPool } from "@/lib/mfg-api";
import { trackMarketingEvent } from "@/lib/analytics";
import { VerificationBadge } from "./index";
import "./manufacturing.css";
import "./make.css";

const STANDARDS = ["FSSAI", "GMP", "WHO-GMP", "ISO", "HACCP", "BRC", "US FDA", "Halal", "Organic", "AYUSH"];
const SERVICES = ["Private label", "Contract manufacturing", "Custom formulation", "Co-packing"];

const place = (m: Manufacturer) => Array.from(new Set([m.city, m.state].filter(Boolean))).join(", ") || "India";

/** Every word of the query must appear somewhere in the profile; name hits rank first. */
function scoreFor(m: Manufacturer, words: string[]) {
  if (!words.length) return 1;
  const name = m.name.toLowerCase();
  const products = m.products.join(" ").toLowerCase();
  const haystack = [
    m.name, m.city, m.state, m.about, ...m.products, ...m.services, ...m.certifications,
    ...m.categories.flatMap((id) => [CATEGORY_BY_ID[id].label, CATEGORY_BY_ID[id].examples, ...CATEGORY_BY_ID[id].keywords]),
  ].filter(Boolean).join(" ").toLowerCase();
  let score = 0;
  for (const word of words) {
    if (!haystack.includes(word)) return 0;
    score += name.includes(word) ? 3 : products.includes(word) ? 2 : 1;
  }
  return score;
}

function readParams() {
  if (typeof window === "undefined") return { q: "", cat: "", state: "", std: "", svc: "" };
  const p = new URLSearchParams(window.location.search);
  return { q: p.get("q") || "", cat: p.get("cat") || "", state: p.get("state") || "", std: p.get("std") || "", svc: p.get("svc") || "" };
}

export default function ManufacturerDirectory() {
  const pool = useManufacturerPool();
  const [filters, setFilters] = useState({ q: "", cat: "", state: "", std: "", svc: "" });
  const [sort, setSort] = useState<"relevance" | "name" | "standards">("relevance");

  useEffect(() => { setFilters(readParams()); }, []);

  // Keep the URL shareable without adding history entries per keystroke.
  useEffect(() => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => { if (value) params.set(key, value); });
    const next = `${window.location.pathname}${params.toString() ? `?${params}` : ""}`;
    window.history.replaceState(null, "", next);
  }, [filters]);

  useEffect(() => {
    if (!filters.q) return;
    const timer = window.setTimeout(() => trackMarketingEvent("mfg_directory_search", { query: filters.q.slice(0, 80) }), 1200);
    return () => window.clearTimeout(timer);
  }, [filters.q]);

  const states = useMemo(() => Array.from(new Set(pool.map((m) => m.state).filter(Boolean) as string[])).sort(), [pool]);

  const results = useMemo(() => {
    const words = filters.q.toLowerCase().split(/[\s,]+/).filter((word) => word.length > 1);
    return pool
      .map((m) => ({ m, score: scoreFor(m, words) }))
      .filter(({ m, score }) =>
        score > 0
        && (!filters.cat || m.categories.includes(filters.cat as CategoryId))
        && (!filters.state || m.state === filters.state)
        && (!filters.std || m.certifications.some((cert) => cert.toLowerCase().includes(filters.std.toLowerCase())))
        && (!filters.svc || m.services.some((service) => service.toLowerCase().includes(filters.svc.toLowerCase().split(" ")[0]))))
      .sort((a, b) => {
        if (sort === "name") return a.m.name.localeCompare(b.m.name);
        if (sort === "standards") return b.m.certifications.length - a.m.certifications.length;
        const verified = Number(b.m.verification !== "none") - Number(a.m.verification !== "none");
        return verified || b.score - a.score || b.m.certifications.length - a.m.certifications.length;
      })
      .map(({ m }) => m);
  }, [pool, filters, sort]);

  const set = (key: keyof typeof filters, value: string) => setFilters((current) => ({ ...current, [key]: value }));
  const active = Object.entries(filters).filter(([, value]) => value);
  const clear = () => setFilters({ q: "", cat: "", state: "", std: "", svc: "" });

  return (
    <main className="mk">
      <section className="mk-dir-head">
        <div className="mk-wrap">
          <nav className="mk-crumbs"><Link href="/manufacturing">Packworkz Make</Link><span>/</span>Directory</nav>
          <div className="mk-dir-title">
            <h1>Manufacturer directory</h1>
            <p className="mk-lede">{pool.length} contract and private-label manufacturers across {MFG_CATEGORIES.length} consumer categories. Search by product, company, city or standard.</p>
          </div>
          <div className="mk-dir-search">
            <Search size={20} />
            <input value={filters.q} onChange={(event) => set("q", event.target.value)} placeholder="Search “gummies”, “retort”, “Surat”, “BRC”…" aria-label="Search manufacturers" autoComplete="off" />
            {filters.q && <button type="button" onClick={() => set("q", "")} aria-label="Clear search"><X size={18} /></button>}
          </div>
          <div className="mk-dir-filters">
            <label><span>Category</span>
              <select value={filters.cat} onChange={(event) => set("cat", event.target.value)}>
                <option value="">All categories</option>
                {MFG_CATEGORIES.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
              </select>
            </label>
            <label><span>State</span>
              <select value={filters.state} onChange={(event) => set("state", event.target.value)}>
                <option value="">Anywhere in India</option>
                {states.map((state) => <option key={state}>{state}</option>)}
              </select>
            </label>
            <label><span>Standard</span>
              <select value={filters.std} onChange={(event) => set("std", event.target.value)}>
                <option value="">Any</option>
                {STANDARDS.map((std) => <option key={std}>{std}</option>)}
              </select>
            </label>
            <label><span>Service</span>
              <select value={filters.svc} onChange={(event) => set("svc", event.target.value)}>
                <option value="">Any</option>
                {SERVICES.map((svc) => <option key={svc}>{svc}</option>)}
              </select>
            </label>
            <label><span>Sort</span>
              <select value={sort} onChange={(event) => setSort(event.target.value as typeof sort)}>
                <option value="relevance">Best match</option>
                <option value="name">Name A–Z</option>
                <option value="standards">Most standards stated</option>
              </select>
            </label>
          </div>
        </div>
      </section>

      <section className="mk-dir-body">
        <div className="mk-wrap">
          <div className="mk-dir-count">
            <p><b>{results.length}</b> {results.length === 1 ? "manufacturer" : "manufacturers"}{active.length > 0 && <> · <button type="button" onClick={clear}>Clear all filters</button></>}</p>
            <Link className="mk-link" href={`/manufacturing${filters.q ? `?q=${encodeURIComponent(filters.q)}` : ""}`}>Let AI match your brief instead <ArrowRight size={15} /></Link>
          </div>
          {results.length ? (
            <div className="mk-dir-list">
              {results.map((m) => (
                <Link key={m.slug} href={`/manufacturers/${m.slug}`} className="mk-dir-row">
                  <img src={`/images/manufacturing-v2/${m.categories[0] || "snacks"}.webp`} alt="" loading="lazy" />
                  <div className="mk-dir-name"><b>{m.name}</b><small>{place(m)}</small></div>
                  <div className="mk-dir-makes">
                    <p>{m.products.slice(0, 4).join(", ")}</p>
                    <small>{m.categories.map((id) => CATEGORY_BY_ID[id].label).join(" · ")}</small>
                  </div>
                  <div className="mk-dir-meta">
                    <p>{m.certifications.slice(0, 3).join(", ") || "Standards not listed"}</p>
                    <VerificationBadge m={m} />
                  </div>
                  <ArrowUpRight size={18} />
                </Link>
              ))}
            </div>
          ) : (
            <div className="mk-empty">
              <p>No listed manufacturer matches all of that. Post the requirement and we'll source factories directly.</p>
              <Link className="mk-btn is-ink" href={`/manufacturing/launch?brief=${encodeURIComponent(filters.q)}`}>Post this requirement <ArrowRight size={16} /></Link>
            </div>
          )}
          <div className="mk-dir-foot">
            <div><b>Not finding the right fit?</b><p>Post one requirement and we'll check fit and capacity with factories for you — free.</p></div>
            <Link className="mk-btn is-ink" href="/manufacturing/launch">Post a requirement</Link>
            <Link className="mk-btn is-line" href="/manufacturing/list-your-factory">List your factory</Link>
          </div>
          <p className="mk-fine">Unclaimed profiles are compiled from each manufacturer's own public website and haven't been audited by Packworkz. Confirm licences, capacity and pricing before you commit.</p>
        </div>
      </section>
    </main>
  );
}
