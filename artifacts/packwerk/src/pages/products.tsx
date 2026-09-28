import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useSearch } from "wouter";
import { ArrowRight, ArrowUpDown, Clock3, Leaf, PackageOpen, Rotate3D, Search, SlidersHorizontal, Truck, X } from "lucide-react";
import { CATEGORIES } from "@/lib/skus";
import {
  CATALOG_SKUS, INDUSTRY_CATALOGS, getCatalogImage, getCategoryLabel, isCatalogSkuInCategory, type CatalogSku,
} from "@/lib/catalog";
import { formatUnitRate, getFromUnitPrice } from "@/lib/indicative-pricing";
import { MOCKUP_FORMAT_BY_SKU } from "@/lib/studio-handoff";
import "./catalog.css";

type Mode = "all" | "instant" | "quote";
type Sort = "recommended" | "price" | "moq" | "fastest" | "name";

const SORTS: Array<{ id: Sort; label: string }> = [
  { id: "recommended", label: "Recommended" },
  { id: "price", label: "Lowest unit price" },
  { id: "moq", label: "Lowest minimum order" },
  { id: "fastest", label: "Fastest to ship" },
  { id: "name", label: "Name A–Z" },
];
const MODES: Array<{ id: Mode; label: string }> = [
  { id: "all", label: "All" },
  { id: "instant", label: "Buy online" },
  { id: "quote", label: "Price in 4 hrs" },
];
const PAGE_SIZE = 24;

const CATEGORY_TILES = CATEGORIES.map((cat) => {
  const sample = CATALOG_SKUS.find((sku) => isCatalogSkuInCategory(sku, cat.slug));
  return sample ? { ...cat, image: getCatalogImage(sample), count: CATALOG_SKUS.filter((sku) => isCatalogSkuInCategory(sku, cat.slug)).length } : null;
}).filter(Boolean) as Array<(typeof CATEGORIES)[number] & { image: string; count: number }>;

function sortSkus(skus: CatalogSku[], sort: Sort) {
  const list = [...skus];
  if (sort === "price") return list.sort((a, b) => getFromUnitPrice(a) - getFromUnitPrice(b));
  if (sort === "moq") return list.sort((a, b) => a.moq - b.moq);
  if (sort === "fastest") return list.sort((a, b) => Number(b.publicBuyingPath === "instant") - Number(a.publicBuyingPath === "instant") || a.delivery_days_india - b.delivery_days_india);
  if (sort === "name") return list.sort((a, b) => a.name.localeCompare(b.name));
  return list;
}

function ProductCard({ sku, index }: { sku: CatalogSku; index: number }) {
  const instant = sku.publicBuyingPath === "instant";
  const unit = sku.moq_unit.replace(/s$/, "");
  return (
    <Link href={`/products/${sku.slug}`} className="pc-card" style={{ animationDelay: `${Math.min(index % PAGE_SIZE, 8) * 45}ms` }}>
      <div className="pc-card-media">
        <img src={getCatalogImage(sku)} alt={sku.name} loading={index < 8 ? "eager" : "lazy"} />
        <span className={`pc-card-badge ${instant ? "is-instant" : "is-quote"}`}>
          {instant ? <><Truck size={12} /> Ships in {sku.delivery_days_india} days</> : <><Clock3 size={12} /> Price in 4 hrs</>}
        </span>
        {sku.is_eco && <span className="pc-card-eco"><Leaf size={12} /> Eco</span>}
        {MOCKUP_FORMAT_BY_SKU[sku.code] && <span className="pc-card-3d" title="3D preview available"><Rotate3D size={14} /></span>}
      </div>
      <div className="pc-card-body">
        <small>{getCategoryLabel(sku.category)}</small>
        <h3>{sku.name}</h3>
        <p>{sku.use_case}</p>
        <div className="pc-card-foot">
          <span><em>From</em> <b>{formatUnitRate(getFromUnitPrice(sku))}</b> / {unit}{!instant && <i> est.</i>}</span>
          <span>MOQ {sku.moq.toLocaleString("en-IN")}</span>
        </div>
        <span className="pc-card-cta">Customise & price <ArrowRight size={15} /></span>
      </div>
    </Link>
  );
}

function SampleKitCard() {
  return (
    <Link href="/samples" className="pc-card pc-kit">
      <img src="/images/sample-kit-hero-v1.webp" alt="Packworkz sample kit" loading="lazy" />
      <div>
        <small>Not sure yet?</small>
        <h3>Feel 25–50+ real samples for ₹299.</h3>
        <p>Pouches, boxes, labels and finishes — delivered to your desk.</p>
        <span className="pc-card-cta">Get the sample kit <ArrowRight size={15} /></span>
      </div>
    </Link>
  );
}

export default function Products() {
  const searchString = useSearch();
  const [location, navigate] = useLocation();
  const params = useMemo(() => new URLSearchParams(searchString), [searchString]);
  const category = params.get("category") || "";
  const industry = params.get("industry") || "";
  const query = params.get("q") || "";
  const mode = (params.get("mode") as Mode) || "all";
  const eco = params.get("eco") === "1";
  const sort = (params.get("sort") as Sort) || "recommended";
  const [searchDraft, setSearchDraft] = useState(query);
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const setParams = (updates: Record<string, string | null>) => {
    const next = new URLSearchParams(searchString);
    Object.entries(updates).forEach(([key, value]) => {
      if (!value || (key === "mode" && value === "all") || (key === "sort" && value === "recommended")) next.delete(key);
      else next.set(key, value);
    });
    const qs = next.toString();
    navigate(`${location}${qs ? `?${qs}` : ""}`, { replace: true });
  };

  useEffect(() => setSearchDraft(query), [query]);
  useEffect(() => {
    if (searchDraft === query) return;
    const timer = window.setTimeout(() => setParams({ q: searchDraft.trim() || null }), 280);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchDraft]);
  useEffect(() => setVisible(PAGE_SIZE), [searchString]);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    const matches = CATALOG_SKUS.filter((sku) => {
      if (category && !isCatalogSkuInCategory(sku, category)) return false;
      if (industry && !sku.industrySlugs.includes(industry)) return false;
      if (mode !== "all" && sku.publicBuyingPath !== mode) return false;
      if (eco && !sku.is_eco && sku.category !== "sustainable") return false;
      if (!term) return true;
      return [sku.name, sku.use_case, sku.description, sku.code, sku.category, ...(sku.materials || [])].some((value) => value.toLowerCase().includes(term));
    });
    return sortSkus(matches, sort);
  }, [category, eco, industry, mode, query, sort]);

  const industryLabel = INDUSTRY_CATALOGS.find((item) => item.slug === industry)?.label || industry;
  const activeChips = [
    category && { key: "category", label: getCategoryLabel(category) },
    industry && { key: "industry", label: industryLabel },
    query && { key: "q", label: `“${query}”` },
    mode !== "all" && { key: "mode", label: MODES.find((item) => item.id === mode)?.label || mode },
    eco && { key: "eco", label: "Sustainable" },
  ].filter(Boolean) as Array<{ key: string; label: string }>;
  const shown = filtered.slice(0, visible);
  const instantCount = CATALOG_SKUS.filter((sku) => sku.publicBuyingPath === "instant").length;

  return (
    <main className="pc">
      <header className="pc-head">
        <div className="pc-head-copy">
          <p className="pc-eyebrow">Packaging catalogue · {CATALOG_SKUS.length} formats</p>
          <h1>{category ? getCategoryLabel(category) : <>Custom packaging, <em>priced upfront.</em></>}</h1>
          <p className="pc-head-sub">{instantCount} formats check out instantly. Every other format shows a market-based price and is confirmed within 4 business hours — add anything to your cart.</p>
        </div>
        <label className="pc-search">
          <Search size={19} />
          <input value={searchDraft} onChange={(event) => setSearchDraft(event.target.value)} placeholder="Search pouches, mailer boxes, labels, kraft…" aria-label="Search packaging" />
          {searchDraft && <button type="button" onClick={() => setSearchDraft("")} aria-label="Clear search"><X size={16} /></button>}
        </label>
      </header>

      <nav className="pc-rail" aria-label="Categories">
        <button type="button" className={!category ? "is-active" : ""} onClick={() => setParams({ category: null })}>
          <span className="pc-rail-all">All</span><b>All packaging</b><small>{CATALOG_SKUS.length}</small>
        </button>
        {CATEGORY_TILES.map((cat) => (
          <button key={cat.slug} type="button" className={category === cat.slug ? "is-active" : ""} onClick={() => setParams({ category: category === cat.slug ? null : cat.slug })} aria-pressed={category === cat.slug}>
            <img src={cat.image} alt="" loading="lazy" /><b>{cat.label}</b><small>{cat.count}</small>
          </button>
        ))}
      </nav>

      <div className="pc-toolbar">
        <div className="pc-seg" role="radiogroup" aria-label="How you buy">
          {MODES.map((item) => <button key={item.id} type="button" role="radio" aria-checked={mode === item.id} className={mode === item.id ? "is-active" : ""} onClick={() => setParams({ mode: item.id })}>{item.label}</button>)}
        </div>
        <button type="button" className={`pc-toggle${eco ? " is-active" : ""}`} onClick={() => setParams({ eco: eco ? null : "1" })} aria-pressed={eco}><Leaf size={15} /> Sustainable</button>
        <button type="button" className="pc-toggle pc-filter-btn" onClick={() => setFiltersOpen((value) => !value)}><SlidersHorizontal size={15} /> Industry</button>
        <label className="pc-sort">
          <ArrowUpDown size={15} />
          <select value={sort} onChange={(event) => setParams({ sort: event.target.value })} aria-label="Sort products">
            {SORTS.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
          </select>
        </label>
        <span className="pc-count">{filtered.length} {filtered.length === 1 ? "format" : "formats"}</span>
      </div>

      {filtersOpen && (
        <div className="pc-industries">
          {INDUSTRY_CATALOGS.map((item) => (
            <button key={item.slug} type="button" className={industry === item.slug ? "is-active" : ""} onClick={() => setParams({ industry: industry === item.slug ? null : item.slug })}>{item.label}</button>
          ))}
        </div>
      )}

      {activeChips.length > 0 && (
        <div className="pc-chips" aria-label="Active filters">
          {activeChips.map((chip) => (
            <button key={chip.key} type="button" onClick={() => { if (chip.key === "q") setSearchDraft(""); setParams({ [chip.key]: null }); }}>{chip.label} <X size={13} /></button>
          ))}
          <button type="button" className="is-clear" onClick={() => { setSearchDraft(""); navigate(location, { replace: true }); }}>Clear all</button>
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="pc-empty">
          <PackageOpen size={40} />
          <h2>No format matches yet.</h2>
          <p>Try a broader search, or tell us what you’re packing and we’ll recommend the right format.</p>
          <div><Link href="/contact" className="pc-btn is-dark">Ask a packaging expert</Link><Link href="/samples" className="pc-btn">Order the ₹299 sample kit</Link></div>
        </div>
      ) : (
        <div className="pc-grid">
          {shown.map((sku, index) => (
            <FragmentWithKit key={sku.code} index={index} total={shown.length}>
              <ProductCard sku={sku} index={index} />
            </FragmentWithKit>
          ))}
        </div>
      )}

      {visible < filtered.length && (
        <div className="pc-more">
          <span>Showing {visible} of {filtered.length}</span>
          <button type="button" className="pc-btn is-dark" onClick={() => setVisible((count) => count + PAGE_SIZE)}>Show more formats</button>
        </div>
      )}

      <section className="pc-expert">
        <div>
          <p className="pc-eyebrow">Multiple SKUs or high volumes?</p>
          <h2>One brief. A complete commercial in 4 business hours.</h2>
          <p>Share the product, quantity and destination. We return specs, pricing, delivery milestones and payment schedule.</p>
        </div>
        <div className="pc-expert-actions">
          <Link href="/procurement-plan" className="pc-btn is-amber">Start a managed quote <ArrowRight size={16} /></Link>
          <Link href="/enterprise" className="pc-btn is-ghost">Enterprise procurement</Link>
        </div>
      </section>
    </main>
  );
}

function FragmentWithKit({ index, total, children }: { index: number; total: number; children: React.ReactNode }) {
  // The sample kit sits after the first row-and-a-bit, where undecided buyers stall.
  const kitIndex = Math.min(6, total - 1);
  return <>{children}{index === kitIndex && <SampleKitCard />}</>;
}
