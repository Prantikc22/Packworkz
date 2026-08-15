import { useEffect, useMemo, useState } from "react";
import { Link, useSearch } from "wouter";
import { formatINR } from "@/lib/format";
import { CATEGORIES } from "@/lib/skus";
import {
  CATALOG_SKUS,
  getCatalogImage,
  getCategoryLabel,
  getConfigureHref,
  isCatalogSkuInCategory,
} from "@/lib/catalog";
type PublicPath = "instant" | "quote";

const MS = ({ icon, className = "", style }: { icon: string; className?: string; style?: React.CSSProperties }) => (
  <span className={`material-symbols-outlined ${className}`} style={style}>{icon}</span>
);

const FILTERS: Array<{ key: PublicPath | "all"; label: string; hint: string; icon: string }> = [
  { key: "all", label: "All packaging", hint: "Full D2C + enterprise range", icon: "inventory_2" },
  { key: "instant", label: "Instant buy", hint: "Tier price shown", icon: "shopping_cart" },
  { key: "quote", label: "Request quote", hint: "Technical or high-volume", icon: "precision_manufacturing" },
];

const MOCKUP_FORMAT_BY_SKU: Record<string, string> = {
  "EC-501": "mailer",
  "EC-502": "shipping",
  "BX-401": "carton",
  "BX-402": "rigid",
  "FP-101": "pouch",
  "BC-201": "bottle",
  "BC-207": "jar",
  "TS-301": "tube",
};

export default function Products() {
  const searchStr = useSearch();
  const params = new URLSearchParams(searchStr);
  const initialCat = params.get("category") || undefined;
  const initialIndustry = params.get("industry") || undefined;

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string | undefined>(initialCat);
  const [industry, setIndustry] = useState<string | undefined>(initialIndustry);
  const [mode, setMode] = useState<PublicPath | "all">("all");
  const [ecoOnly, setEcoOnly] = useState(false);
  const [visibleCount, setVisibleCount] = useState(24);

  useEffect(() => {
    setCategory(initialCat);
    setIndustry(initialIndustry);
  }, [initialCat, initialIndustry]);

  const filteredSkus = useMemo(() => {
    const term = search.trim().toLowerCase();

    return CATALOG_SKUS.filter((sku) => {
      if (category && !isCatalogSkuInCategory(sku, category)) return false;
      if (industry && !sku.industrySlugs.includes(industry)) return false;
      if (mode !== "all" && sku.publicBuyingPath !== mode) return false;
      if (ecoOnly && !sku.is_eco && sku.category !== "sustainable") return false;
      if (!term) return true;

      return [sku.name, sku.use_case, sku.description, sku.code, sku.category]
        .some((value) => value.toLowerCase().includes(term));
    });
  }, [category, ecoOnly, industry, mode, search]);

  useEffect(() => setVisibleCount(24), [category, ecoOnly, industry, mode, search]);

  const visibleSkus = filteredSkus.slice(0, visibleCount);

  const totalInstant = CATALOG_SKUS.filter((sku) => sku.publicBuyingPath === "instant").length;
  const totalQuote = CATALOG_SKUS.filter((sku) => sku.publicBuyingPath === "quote").length;

  return (
    <div className="products-page min-h-screen" style={{ background: "#F8F9FC", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <section className="relative overflow-hidden bg-white border-b border-slate-200">
        <div className="absolute inset-0 pointer-events-none opacity-70" style={{
          background: "linear-gradient(120deg, rgba(27,108,168,0.08), transparent 38%), radial-gradient(circle at 80% 10%, rgba(232,168,56,0.18), transparent 28%)",
        }} />
        <div className="relative max-w-7xl mx-auto px-6 md:px-8 pt-28 pb-12 md:pt-32 md:pb-16">
          <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-8 items-end">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.22em] mb-3" style={{ color: "#1B6CA8" }}>
                Instant-buy packaging catalog
              </p>
              <h1 className="text-4xl md:text-5xl font-black leading-tight" style={{ fontFamily: "'Space Grotesk', sans-serif", color: "#0D1B2A" }}>
                Buy standard packaging online. Get expert help when specifications need it.
              </h1>
              <p className="text-slate-600 mt-4 max-w-2xl text-base leading-relaxed">
                Compare ready sizes, MOQ, lead times and quantity pricing, then buy online or send a technical brief.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                {[
                  `${CATALOG_SKUS.length} product families`,
                  `${totalInstant} instant-buy`,
                  `${totalQuote} request-quote`,
                ].map((item) => (
                  <span key={item} className="px-3 py-2 rounded-full bg-slate-100 text-xs font-bold" style={{ color: "#334155" }}>{item}</span>
                ))}
              </div>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link href="/mockup-studio" className="pw-catalog-studio-cta">
                  <MS icon="view_in_ar" className="text-xl" /> Design in 3D <MS icon="arrow_forward" className="text-base" />
                </Link>
                <Link href="/configure" className="pw-catalog-brief-cta">Start a packaging plan</Link>
              </div>
            </div>
            <div className="bg-slate-950 text-white rounded-lg p-5 shadow-xl">
              <div className="flex items-center gap-2 mb-4">
                <MS icon="checklist" style={{ color: "#E8A838" }} />
                <p className="font-black text-sm">Your buying path</p>
              </div>
              {[
                ["1", "Choose a product", "Browse by packaging type or search by what you sell."],
                ["2", "Pick your options", "Select a ready size, material, print and quantity."],
                ["3", "Buy or get a quote", "Pay online for standard packs; send technical runs to a specialist."],
              ].map(([num, title, body]) => (
                <div key={num} className="flex gap-3 pb-4 last:pb-0">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shrink-0" style={{ background: "#E8A838", color: "#0D1B2A" }}>{num}</div>
                  <div>
                    <p className="font-bold text-sm">{title}</p>
                    <p className="text-xs text-slate-400 leading-relaxed">{body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white border-b border-slate-200 sticky top-[68px] z-30">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-3 flex flex-col lg:flex-row gap-3 lg:items-center">
          <div className="relative flex-1">
            <MS icon="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-xl" style={{ color: "#74777d" }} />
            <input
              placeholder="Search pouches, boxes, bottles, labels..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="w-full h-11 pl-10 pr-4 rounded border border-slate-200 bg-white text-sm focus:outline-none focus:border-blue-400"
              style={{ color: "#0D1B2A" }}
            />
          </div>
          <div className="flex gap-2 overflow-x-auto">
            {FILTERS.map((filter) => (
              <button
                key={filter.key}
                onClick={() => setMode(filter.key)}
                className="px-4 py-2 rounded border text-left whitespace-nowrap transition-all"
                style={{
                  borderColor: mode === filter.key ? "#1B6CA8" : "#E2E8F0",
                  background: mode === filter.key ? "rgba(27,108,168,0.08)" : "white",
                  color: "#0D1B2A",
                }}
              >
                <span className="flex items-center gap-2 text-xs font-black"><MS icon={filter.icon} className="text-base" />{filter.label}</span>
                <span className="block text-[11px] text-slate-500 mt-0.5">{filter.hint}</span>
              </button>
            ))}
            <button
              onClick={() => setEcoOnly((value) => !value)}
              className="px-4 py-2 rounded border text-left whitespace-nowrap transition-all"
              style={{
                borderColor: ecoOnly ? "#16A34A" : "#E2E8F0",
                background: ecoOnly ? "rgba(22,163,74,0.08)" : "white",
                color: "#0D1B2A",
              }}
            >
              <span className="flex items-center gap-2 text-xs font-black"><MS icon="eco" className="text-base" />Sustainable</span>
              <span className="block text-[11px] text-slate-500 mt-0.5">Certified & recyclable</span>
            </button>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 flex flex-col lg:flex-row gap-8">
        <aside className="w-full lg:w-60 shrink-0">
          <div className="bg-white rounded-lg border border-slate-200 p-4 sticky top-40">
            <p className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: "#74777d" }}>Categories</p>
            <button
              onClick={() => setCategory(undefined)}
              className="w-full flex justify-between items-center text-sm py-2 px-3 rounded transition-all text-left"
              style={!category ? { background: "#0D1B2A", color: "white" } : { color: "#44474c" }}
            >
              <span className="font-bold">All products</span>
              <span className="text-xs opacity-60">{CATALOG_SKUS.length}</span>
            </button>
            <div className="mt-1 space-y-0.5">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.slug}
                  onClick={() => setCategory(cat.slug)}
                  className="w-full flex justify-between items-center text-sm py-2 px-3 rounded transition-all text-left gap-2"
                  style={category === cat.slug ? { background: "#0D1B2A", color: "white" } : { color: "#44474c" }}
                >
                  <span className="font-medium truncate text-xs">{cat.label}</span>
                  <span className="text-xs opacity-60 shrink-0">{CATALOG_SKUS.filter((sku) => isCatalogSkuInCategory(sku, cat.slug)).length}</span>
                </button>
              ))}
            </div>
            <div className="mt-5 pt-4 border-t border-slate-200">
              <p className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: "#74777d" }}>Shortcut catalogs</p>
              <div className="grid gap-2">
                <Link href="/sustainable">
                  <button className="w-full flex items-center justify-between border border-slate-300 border-l-2 border-l-green-600 bg-white px-3 py-2 text-xs font-bold text-slate-900 transition hover:border-slate-900">
                    Sustainable catalog <MS icon="arrow_forward" className="text-sm" />
                  </button>
                </Link>
                <Link href="/industries">
                  <button className="w-full flex items-center justify-between border border-slate-300 border-l-2 border-l-blue-600 bg-white px-3 py-2 text-xs font-bold text-slate-900 transition hover:border-slate-900">
                    Industry catalog <MS icon="arrow_forward" className="text-sm" />
                  </button>
                </Link>
                <Link href="/mockup-studio">
                  <button className="w-full flex items-center justify-between border border-slate-300 border-l-2 border-l-amber-500 bg-white px-3 py-2 text-xs font-bold text-slate-900 transition hover:border-slate-900">
                    3D mockup studio <MS icon="view_in_ar" className="text-sm" />
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </aside>

        <main className="flex-1">
          <div className="flex items-center justify-between gap-4 mb-5">
            <div>
              <h2 className="text-lg font-black" style={{ fontFamily: "'Space Grotesk', sans-serif", color: "#0D1B2A" }}>
                {category ? getCategoryLabel(category) : "All packaging SKUs"}
              </h2>
              <p className="text-xs text-slate-500 mt-1">{filteredSkus.length} matching SKUs. Recommended path is pre-selected.</p>
            </div>
            {(category || search || mode !== "all" || ecoOnly || industry) && (
              <button
                onClick={() => { setSearch(""); setCategory(undefined); setIndustry(undefined); setMode("all"); setEcoOnly(false); }}
                className="text-xs font-black text-slate-500 hover:text-slate-900"
              >
                Clear filters
              </button>
            )}
          </div>

          {filteredSkus.length === 0 ? (
            <div className="text-center py-24 bg-white rounded-lg border border-slate-200">
              <MS icon="search_off" className="text-5xl mb-3" style={{ color: "#C4C6CC" }} />
              <p className="font-bold mb-2" style={{ color: "#44474c" }}>No matching packaging found.</p>
              <p className="text-sm text-slate-500">Try clearing filters or browse by industry.</p>
            </div>
          ) : (
            <div className="pw-catalog-card-grid">
              {visibleSkus.map((sku, index) => {
                const mockupFormat = MOCKUP_FORMAT_BY_SKU[sku.code];
                return (
                  <article key={sku.id} className="pw-catalog-card pw-reveal" style={{ animationDelay: `${Math.min(index, 8) * 40}ms` }}>
                    <Link href={`/products/${sku.slug}`} className="pw-catalog-card-media" aria-label={`View ${sku.name}`}>
                      <img src={getCatalogImage(sku)} alt={sku.name} loading="lazy" />
                      <span className="pw-catalog-card-index">{String(index + 1).padStart(2, "0")}</span>
                      <div className="pw-catalog-card-badges">
                        <span className={sku.publicBuyingPath === "instant" ? "instant" : "quote"}>{sku.publicBuyingPath === "instant" ? "Instant buy" : "Managed quote"}</span>
                        <span className="custom">Custom printed</span>
                        {sku.is_eco && <span className="eco">Eco option</span>}
                      </div>
                    </Link>

                    <div className="pw-catalog-card-body">
                      <div className="pw-catalog-card-heading">
                        <div><span>{getCategoryLabel(sku.category)}</span><small>{sku.code}</small></div>
                        <Link href={`/products/${sku.slug}`} aria-label={`View ${sku.name}`}><MS icon="north_east" /></Link>
                      </div>
                      <h3>{sku.name}</h3>
                      <p>{sku.use_case}</p>

                      <div className="pw-catalog-card-facts">
                        <span><small>Minimum</small><b>{sku.moq.toLocaleString("en-IN")} {sku.moq_unit}</b></span>
                        <span><small>Production</small><b>{sku.speedLabel}</b></span>
                      </div>

                      <div className="pw-catalog-card-commerce">
                        <div>
                          <small>{sku.publicBuyingPath === "quote" ? "Indicative unit range" : "Starting unit price"}</small>
                          <strong>{sku.publicBuyingPath === "quote" ? `${formatINR(sku.price_min)} - ${formatINR(sku.price_max)}` : `${formatINR(sku.price_tiers?.[0]?.unit_price ?? sku.price_max)} / ${sku.moq_unit.replace(/s$/, "")}`}</strong>
                        </div>
                        {sku.publicBuyingPath === "instant" ? (
                          <div className="pw-catalog-card-actions">
                            <Link href={`${getConfigureHref(sku)}&intent=cart`} className="pw-catalog-card-secondary">
                              <MS icon="add_shopping_cart" /> Add to cart
                            </Link>
                            <Link href={`${getConfigureHref(sku)}&intent=buy`} className="pw-catalog-card-primary">
                              Buy now <MS icon="arrow_forward" />
                            </Link>
                          </div>
                        ) : (
                          <Link href={getConfigureHref(sku)} className="pw-catalog-card-primary is-quote">
                            Get a quote <MS icon="arrow_forward" />
                          </Link>
                        )}
                      </div>

                      {mockupFormat && (
                        <Link href={`/mockup-studio?format=${mockupFormat}&sku=${sku.code}`} className="pw-catalog-card-mockup">
                          <MS icon="view_in_ar" /> Preview this format in 3D
                        </Link>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
          {visibleCount < filteredSkus.length && (
            <div className="mt-8 flex items-center justify-between border-t border-slate-200 pt-6">
              <p className="text-sm text-slate-500">Showing {visibleCount} of {filteredSkus.length} matching families</p>
              <button type="button" onClick={() => setVisibleCount((count) => Math.min(count + 24, filteredSkus.length))} className="btn-fill btn-navy px-6 py-3 text-sm">
                Show 24 more
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
