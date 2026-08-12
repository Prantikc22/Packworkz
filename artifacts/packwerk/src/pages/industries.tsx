import { Link } from "wouter";
import { INDUSTRY_CATALOGS, getCatalogImage, getSkusForIndustry } from "@/lib/catalog";

const MS = ({ icon, className = "", style }: { icon: string; className?: string; style?: React.CSSProperties }) => (
  <span className={`material-symbols-outlined ${className}`} style={style}>{icon}</span>
);

export default function Industries() {
  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", background: "#F8F9FC" }}>
      <section className="relative overflow-hidden px-6 md:px-20 py-20" style={{ background: "#0D1B2A" }}>
        <div className="absolute inset-0 opacity-70 pointer-events-none" style={{
          background: "radial-gradient(circle at 18% 20%, rgba(232,168,56,0.18), transparent 32%), radial-gradient(circle at 80% 10%, rgba(27,108,168,0.22), transparent 34%)",
        }} />
        <div className="relative max-w-7xl mx-auto grid lg:grid-cols-[1fr_420px] gap-10 items-end">
          <div>
            <p className="font-black tracking-[0.22em] text-xs uppercase mb-4" style={{ color: "#E8A838" }}>Industry-wise packaging catalog</p>
            <h1 className="clash-display text-white mb-5" style={{ fontSize: "clamp(2.5rem,6vw,4.8rem)", lineHeight: 1.02 }}>
              Start with your industry. Then configure the right SKU.
            </h1>
            <p className="text-lg text-slate-300 max-w-2xl leading-relaxed">
              A Packhelp-like buying path for standard packaging, plus managed pricing for technical SKUs that need material, machine, or compliance review.
            </p>
          </div>
          <div className="rounded-lg p-5 border" style={{ background: "rgba(255,255,255,0.06)", borderColor: "rgba(255,255,255,0.12)" }}>
            {[
              ["Recognition", "Food, pharma, beauty, exports, and D2C buyers see their own examples first."],
              ["Smart defaults", "Each catalog pre-selects common SKUs, MOQs, and buying path."],
              ["Reduced risk", "Samples, certification, and managed pricing are available before production."],
            ].map(([title, body]) => (
              <div key={title} className="flex gap-3 py-3 border-b last:border-b-0" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
                <MS icon="check_circle" style={{ color: "#86EFAC" }} />
                <div>
                  <p className="text-sm font-black text-white">{title}</p>
                  <p className="text-xs text-slate-400 leading-relaxed">{body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-4 md:px-8">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 xl:grid-cols-3 gap-6">
          {INDUSTRY_CATALOGS.map((industry, index) => {
            const skus = getSkusForIndustry(industry.slug);
            const selfServe = skus.filter((sku) => sku.buyingMode === "self_serve").length;
            const heroSku = skus[0];

            return (
              <Link href={`/products?industry=${industry.slug}`} key={industry.slug}>
                <div className="group bg-white rounded-lg border border-slate-200 overflow-hidden hover:border-blue-300 hover:shadow-xl transition-all cursor-pointer h-full pw-reveal" style={{ animationDelay: `${index * 50}ms` }}>
                  <div className="h-48 relative overflow-hidden bg-slate-100">
                    {heroSku && <img src={getCatalogImage(heroSku)} alt={industry.label} className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500" />}
                    <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(13,27,42,0.72), transparent 58%)" }} />
                    <div className="absolute top-4 left-4 w-10 h-10 rounded flex items-center justify-center" style={{ background: "rgba(255,255,255,0.9)" }}>
                      <MS icon={industry.icon} className="text-2xl" style={{ color: "#1B6CA8" }} />
                    </div>
                    <div className="absolute bottom-4 left-4 right-4">
                      <p className="text-white font-black text-xl">{industry.label}</p>
                      <p className="text-xs text-white/75 mt-1">{skus.length} matched SKUs · {selfServe} self-serve</p>
                    </div>
                  </div>
                  <div className="p-5">
                    <h2 className="font-black text-lg mb-2" style={{ color: "#0D1B2A", fontFamily: "'Space Grotesk', sans-serif" }}>{industry.headline}</h2>
                    <div className="mb-3 border border-slate-200 border-l-2 border-l-red-600 bg-white p-3">
                      <p className="text-[11px] font-black text-red-600 uppercase tracking-widest">Avoid</p>
                      <p className="text-xs text-red-900 leading-relaxed">{industry.pain}</p>
                    </div>
                    <div className="mb-4 border border-slate-200 border-l-2 border-l-green-600 bg-white p-3">
                      <p className="text-[11px] font-black text-green-700 uppercase tracking-widest">Outcome</p>
                      <p className="text-xs text-green-900 leading-relaxed">{industry.outcome}</p>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-5">
                      {skus.slice(0, 4).map((sku) => (
                        <span key={sku.id} className="px-2 py-1 rounded bg-slate-100 text-[11px] font-bold text-slate-600">{sku.name}</span>
                      ))}
                    </div>
                    <button className="w-full py-3 rounded text-sm font-black text-white transition-all group-hover:translate-y-[-1px]" style={{ background: "#1B6CA8" }}>
                      Explore {industry.label} catalog
                    </button>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
