import { useState } from "react";
import { Link } from "wouter";
import { useListProducts, useGetCategorySummary } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { formatINR } from "@/lib/format";
import { Search, Loader2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

const CATEGORIES = [
  "flexible", "rigid", "boxes", "ecommerce", "rolls", "accessories", "sustainable", "premium"
];

export default function Products() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<any>(undefined);
  const [isSmartStock, setIsSmartStock] = useState(false);
  const [isEco, setIsEco] = useState(false);

  const { data, isLoading } = useListProducts({
    search: search || undefined,
    category: category || undefined,
    is_smartstock: isSmartStock ? true : undefined,
    is_eco: isEco ? true : undefined,
  }, { query: { queryKey: ['/api/products', search, category, isSmartStock, isEco] }});

  const { data: summary } = useGetCategorySummary();

  const getCategoryCount = (cat: string) => {
    return summary?.find(s => s.category === cat)?.count || 0;
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-7xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-bold text-navy mb-2">Product Catalogue</h1>
          <p className="text-muted text-lg">Premium packaging solutions for your brand.</p>
        </div>
        
        <div className="w-full md:w-96 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted w-5 h-5" />
          <Input 
            placeholder="Search products..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-12 bg-white rounded-full border-border focus:border-blue focus:ring-blue/20"
          />
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <aside className="w-full lg:w-64 shrink-0 space-y-8">
          <div>
            <h3 className="font-bold text-navy mb-4">Categories</h3>
            <div className="flex flex-col gap-2">
              <button 
                onClick={() => setCategory(undefined)}
                className={`flex justify-between items-center text-sm py-2 px-3 rounded-md transition-colors ${!category ? 'bg-navy text-white' : 'hover:bg-surface text-navy'}`}
              >
                <span>All Products</span>
              </button>
              {CATEGORIES.map(cat => (
                <button 
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`flex justify-between items-center text-sm py-2 px-3 rounded-md transition-colors capitalize ${category === cat ? 'bg-navy text-white' : 'hover:bg-surface text-navy'}`}
                >
                  <span>{cat}</span>
                  <span className={`text-xs ${category === cat ? 'text-white/70' : 'text-muted'}`}>{getCategoryCount(cat)}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-6 pt-6 border-t border-border">
            <h3 className="font-bold text-navy mb-4">Filters</h3>
            <div className="flex items-center justify-between">
              <Label htmlFor="smartstock" className="flex flex-col gap-1 cursor-pointer">
                <span className="font-semibold text-navy">SmartStock</span>
                <span className="text-xs text-muted">48hr Delivery</span>
              </Label>
              <Switch id="smartstock" checked={isSmartStock} onCheckedChange={setIsSmartStock} />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="eco" className="flex flex-col gap-1 cursor-pointer">
                <span className="font-semibold text-navy">Sustainable</span>
                <span className="text-xs text-muted">Eco-friendly materials</span>
              </Label>
              <Switch id="eco" checked={isEco} onCheckedChange={setIsEco} />
            </div>
          </div>
        </aside>

        <main className="flex-1">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-blue" />
            </div>
          ) : data?.data?.length === 0 ? (
            <div className="text-center py-24 bg-surface rounded-2xl border border-border">
              <div className="text-muted mb-4">No products found matching your criteria.</div>
              <Button variant="outline" onClick={() => {setSearch(""); setCategory(undefined); setIsSmartStock(false); setIsEco(false);}}>Clear Filters</Button>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {data?.data?.map(product => (
                <Link
                  key={product.id}
                  href={`/products/${product.slug}`}
                  className="group bg-white border border-[#E2EAF4] rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col h-full"
                >
                  <div className="aspect-square bg-[#F8F9FC] relative overflow-hidden">
                    {product.image_url ? (
                      <img src={product.image_url} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[#64748B]">{product.name}</div>
                    )}
                    <div className="absolute top-3 left-3 flex flex-col gap-2">
                      {product.is_smartstock && (
                        <Badge className="bg-[#E8A838] text-[#0D1B2A] font-bold border-none shadow-sm">SmartStock</Badge>
                      )}
                      {product.is_eco && (
                        <Badge className="bg-[#22C55E] text-white font-bold border-none shadow-sm">Eco</Badge>
                      )}
                    </div>
                  </div>
                  <div className="p-5 flex flex-col flex-1">
                    <div className="text-xs font-semibold text-[#1B6CA8] uppercase tracking-wider mb-2">{product.category}</div>
                    <h3 className="font-bold text-[#0D1B2A] text-lg mb-2 line-clamp-2">{product.name}</h3>
                    <p className="text-sm text-[#64748B] mb-4 line-clamp-2">{product.use_case}</p>
                    <div className="mt-auto pt-4 border-t border-[#E2EAF4] flex items-end justify-between">
                      <div>
                        <div className="text-xs text-[#64748B] mb-1">Est. Price / {product.moq_unit}</div>
                        <div className="font-bold text-[#0D1B2A]">
                          {formatINR(product.price_min)} - {formatINR(product.price_max)}
                        </div>
                      </div>
                      <Button size="sm" className="bg-[#0D1B2A] text-white hover:bg-[#1B6CA8]">Quote</Button>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
