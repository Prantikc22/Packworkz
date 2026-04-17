import { useState, useEffect } from "react";
import { Link, useSearch } from "wouter";
import { useListProducts, useGetCategorySummary } from "@workspace/api-client-react";
import { formatINR } from "@/lib/format";
import { getProductImage } from "@/lib/images";
import { Loader2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

const MS = ({ icon, className = "", style }: { icon: string; className?: string; style?: React.CSSProperties }) => (
  <span className={`material-symbols-outlined ${className}`} style={style}>{icon}</span>
);

const CATEGORIES = [
  { slug: "flexible", label: "Flexible Pouches" },
  { slug: "rigid", label: "Rigid Packaging" },
  { slug: "boxes", label: "Boxes & Cartons" },
  { slug: "ecommerce", label: "E-commerce" },
  { slug: "rolls", label: "Labels & Rolls" },
  { slug: "accessories", label: "Accessories" },
  { slug: "sustainable", label: "Sustainable" },
  { slug: "premium", label: "Premium & Gift" },
];

export default function Products() {
  const searchStr = useSearch();
  const params = new URLSearchParams(searchStr);
  const initialCat = params.get("category") || undefined;

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string | undefined>(initialCat);
  const [isSmartStock, setIsSmartStock] = useState(false);
  const [isEco, setIsEco] = useState(false);

  // Sync category from URL on mount
  useEffect(() => {
    if (initialCat) setCategory(initialCat);
  }, []);

  const { data, isLoading } = useListProducts(
    { search: search || undefined, category: category || undefined, is_smartstock: isSmartStock ? true : undefined, is_eco: isEco ? true : undefined },
    { query: { queryKey: ["/api/products", search, category, isSmartStock, isEco] } }
  );
  const { data: summary } = useGetCategorySummary();

  const getCategoryCount = (cat: string) => summary?.find(s => s.category === cat)?.count || 0;

  return (
    <div className="min-h-screen" style={{ background: "#F8F9FC", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

      {/* ── Header ── */}
      <div className="py-12 px-8 md:px-16 border-b border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] mb-2" style={{ color: "#1B6CA8" }}>110+ SKUS ACROSS 8 CATEGORIES</p>
            <h1 className="clash-display text-4xl" style={{ color: "#0D1B2A" }}>Product Catalogue</h1>
          </div>
          <div className="relative w-full md:w-80">
            <MS icon="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-xl" style={{ color: "#74777d" }} />
            <input
              placeholder="Search SKUs..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full h-11 pl-10 pr-4 rounded border border-slate-200 bg-white text-sm focus:outline-none focus:border-blue-400"
              style={{ color: "#0D1B2A" }}
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 flex flex-col lg:flex-row gap-8">

        {/* ── Sidebar ── */}
        <aside className="w-full lg:w-60 shrink-0">
          <div className="bg-white rounded border border-slate-200 p-5">
            <h3 className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: "#74777d" }}>CATEGORIES</h3>
            <div className="space-y-1">
              <button onClick={() => setCategory(undefined)}
                className="w-full flex justify-between items-center text-sm py-2 px-3 rounded transition-all text-left"
                style={!category ? { background: "#0D1B2A", color: "white" } : { color: "#44474c" }}>
                <span className="font-medium">All Products</span>
                <span className="text-xs opacity-60">{data?.data?.length || 0}</span>
              </button>
              {CATEGORIES.map(cat => (
                <button key={cat.slug} onClick={() => setCategory(cat.slug)}
                  className="w-full flex justify-between items-center text-sm py-2 px-3 rounded transition-all text-left"
                  style={category === cat.slug ? { background: "#0D1B2A", color: "white" } : { color: "#44474c" }}>
                  <span className="font-medium">{cat.label}</span>
                  <span className="text-xs opacity-60">{getCategoryCount(cat.slug)}</span>
                </button>
              ))}
            </div>

            <div className="mt-6 pt-5 border-t border-slate-200 space-y-5">
              <h3 className="text-xs font-bold uppercase tracking-widest" style={{ color: "#74777d" }}>FILTER</h3>
              <div className="flex items-center justify-between gap-2">
                <Label htmlFor="smartstock" className="cursor-pointer">
                  <p className="text-sm font-bold" style={{ color: "#0D1B2A" }}>SmartStock</p>
                  <p className="text-xs" style={{ color: "#74777d" }}>48-hour dispatch</p>
                </Label>
                <Switch id="smartstock" checked={isSmartStock} onCheckedChange={setIsSmartStock} />
              </div>
              <div className="flex items-center justify-between gap-2">
                <Label htmlFor="eco" className="cursor-pointer">
                  <p className="text-sm font-bold" style={{ color: "#0D1B2A" }}>Eco-Friendly</p>
                  <p className="text-xs" style={{ color: "#74777d" }}>Sustainable materials</p>
                </Label>
                <Switch id="eco" checked={isEco} onCheckedChange={setIsEco} />
              </div>
            </div>
          </div>
        </aside>

        {/* ── Product Grid ── */}
        <main className="flex-1">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="w-8 h-8 animate-spin" style={{ color: "#1B6CA8" }} />
            </div>
          ) : data?.data?.length === 0 ? (
            <div className="text-center py-24 bg-white rounded border border-slate-200">
              <MS icon="search_off" className="text-5xl mb-3" style={{ color: "#C4C6CC" }} />
              <p className="font-bold mb-3" style={{ color: "#44474c" }}>No products found.</p>
              <button onClick={() => { setSearch(""); setCategory(undefined); setIsSmartStock(false); setIsEco(false); }}
                className="px-6 py-2 rounded border border-slate-200 text-sm font-bold hover:bg-slate-50 transition-all" style={{ color: "#44474c" }}>
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {data?.data?.map(product => {
                const imgUrl = product.image_url || getProductImage(product.name, product.category);
                return (
                  <Link key={product.id} href={`/products/${product.slug}`}>
                    <div className="group bg-white border border-slate-200 rounded overflow-hidden hover:border-blue-300 hover:shadow-lg transition-all cursor-pointer h-full flex flex-col">
                      {/* Image */}
                      <div className="h-48 overflow-hidden relative bg-slate-100">
                        <img
                          src={imgUrl}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
                          onError={e => {
                            const fallback = getProductImage(product.name, product.category);
                            if ((e.target as HTMLImageElement).src !== fallback) {
                              (e.target as HTMLImageElement).src = fallback;
                            }
                          }}
                        />
                        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                          {product.is_smartstock && (
                            <span className="px-2 py-0.5 rounded text-xs font-bold" style={{ background: "#E8A838", color: "#0F1C2C" }}>SmartStock</span>
                          )}
                          {product.is_eco && (
                            <span className="px-2 py-0.5 rounded text-xs font-bold bg-green-500 text-white">Eco</span>
                          )}
                        </div>
                      </div>

                      {/* Info */}
                      <div className="p-5 flex flex-col flex-1">
                        <p className="text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: "#1B6CA8" }}>{product.category}</p>
                        <h3 className="font-bold text-base mb-1.5 line-clamp-2" style={{ color: "#0D1B2A" }}>{product.name}</h3>
                        <p className="text-xs line-clamp-2 mb-4" style={{ color: "#74777d" }}>{product.use_case}</p>
                        <div className="mt-auto flex items-center justify-between pt-4 border-t border-slate-100">
                          <div>
                            <p className="text-xs" style={{ color: "#74777d" }}>Est. per {product.moq_unit}</p>
                            <p className="font-black text-sm" style={{ fontFamily: "'Manrope', sans-serif", color: "#0D1B2A" }}>
                              {formatINR(product.price_min)} – {formatINR(product.price_max)}
                            </p>
                          </div>
                          <button className="px-4 py-2 rounded text-xs font-bold text-white hover:opacity-90 transition-all" style={{ background: "#0D1B2A" }}>
                            Quote
                          </button>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
