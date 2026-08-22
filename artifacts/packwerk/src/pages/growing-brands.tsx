import { useEffect } from "react";
import { Link } from "wouter";
import { ArrowRight, Check, ChevronRight, Eye, PackageCheck, Palette, Rocket, ShoppingBag, Sparkles, Tag, Truck, Upload, WandSparkles } from "lucide-react";
import { CATALOG_SKUS, getCatalogImage, getConfigureHref } from "@/lib/catalog";
import { formatINR } from "@/lib/format";
import { trackMarketingEvent } from "@/lib/analytics";

const findSku = (code: string) => CATALOG_SKUS.find((sku) => sku.code === code);

const STARTER_CODES = ["FP-101", "EC-501", "LC-816", "BX-401", "EC-510", "BC-201", "LC-810"];
const STARTERS = STARTER_CODES.map(findSku).filter(Boolean) as NonNullable<ReturnType<typeof findSku>>[];

const BUILDING = [
  ["Food & Snacks", "food-beverage", "restaurant", "/industries/food", "/images/foodservice-containers-premium.jpg"],
  ["Coffee & Tea", "food-beverage", "coffee", "/products?industry=food-beverage", "/skus/flatbottompouch.jpg"],
  ["Beauty & Skincare", "beauty", "spa", "/industries/beauty", "/industries/beauty.jpg"],
  ["Fashion & Lifestyle", "d2c", "apparel", "/products?industry=d2c", "/industries/ecommerce.jpg"],
  ["Wellness", "beauty", "self_improvement", "/products?industry=beauty", "/skus/airlesspumpbottles.jpg"],
  ["Bakery & Gifting", "food-beverage", "cake", "/products?industry=food-beverage", "/catalog/box-options/custom-printed-folding-cartons-v2.jpg"],
  ["Ecommerce Shipping", "d2c", "local_shipping", "/products?category=ecommerce", "/skus/mailerbox.jpg"],
  ["Something Else", "all", "category", "/pack-ai", "/images/hero-products.png"],
] as const;

const FAQS = [
  ["Can I order custom packaging in small quantities?", "Yes. Selected self-serve formats start at low quantities, including labels from 25 units and mailer boxes from 50 units. Each product page shows its current minimum."],
  ["What is the minimum order quantity?", "It depends on the packaging format, size and print route. The live minimum is shown on every product card and configuration page."],
  ["Can Packworkz help design my packaging?", "Yes. You can use the packaging design service or bring existing artwork. Technical files are checked before production."],
  ["Can I see the packaging before production?", "You can create a 3D artwork preview and use the sample route where a physical production sample is appropriate."],
  ["How long does custom packaging take?", "Lead time varies by format, print method and approval route. The relevant product page shows an indicative timeline; the production schedule is confirmed with the final specification."],
  ["Can I reorder the same design?", "Yes. Approved specifications and artwork remain attached to the order record to make repeat ordering more accurate."],
  ["Does Packworkz deliver across India?", "Yes. Packworkz supports pan-India delivery. Checkout delivery charges are estimates until packed weight, volume and destination serviceability are confirmed."],
  ["Can I start small and increase quantities later?", "Yes. Start through self-service where the format is eligible, then move into repeat orders, managed sourcing and SmartStock as volume grows."],
  ["What packaging is suitable for a D2C brand?", "That depends on the product, shelf life, shipping journey and desired unboxing experience. The Packworkz planner can shortlist practical options in plain language."],
];

function eventLink(name: string, href: string, className: string, children: React.ReactNode, detail: Record<string, string> = {}) {
  return <Link href={href} className={className} onClick={() => trackMarketingEvent(name, detail)}>{children}</Link>;
}

export default function GrowingBrands() {
  useEffect(() => trackMarketingEvent("growing_brand_page_view"), []);

  const heroImages = ["FP-101", "EC-501", "BX-401", "BC-204"].map(findSku).filter(Boolean) as NonNullable<ReturnType<typeof findSku>>[];
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: "https://packworkz.com/" }, { "@type": "ListItem", position: 2, name: "Growing Brands", item: "https://packworkz.com/solutions/growing-brands" }] },
      { "@type": "FAQPage", mainEntity: FAQS.map(([name, text]) => ({ "@type": "Question", name, acceptedAnswer: { "@type": "Answer", text } })) },
    ],
  };

  return (
    <div className="bg-[#f7f4ed] text-[#0d1b2a]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

      <section className="relative overflow-hidden bg-[#07182a] px-5 pb-4 pt-[112px] text-white md:px-10 lg:px-16">
        <div className="absolute inset-0 opacity-30" style={{ backgroundImage: "radial-gradient(circle at 76% 25%, #2d79ff 0, transparent 31%), radial-gradient(circle at 14% 85%, #e8a838 0, transparent 24%)" }} />
        <div className="relative mx-auto grid max-w-[1450px] items-center gap-12 lg:grid-cols-[1.03fr_.97fr]">
          <div>
            <p className="mb-5 text-xs font-black uppercase tracking-[.22em] text-[#f5bd4f]">Packaging for growing brands</p>
            <h1 className="max-w-3xl font-black leading-[.96] tracking-[-.05em] text-[clamp(2.75rem,4.4vw,4.8rem)]">Launch packaging that makes your brand look bigger.</h1>
            <p className="mt-5 max-w-2xl text-2xl font-black text-[#f5bd4f]">Without ordering thousands.</p>
            <p className="mt-6 max-w-xl text-base leading-7 text-white/68 md:text-lg">Pouches, boxes, labels and bottles—with low-MOQ buying paths and expert help.</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              {eventLink("product_clicked", "/products", "inline-flex min-h-14 items-center justify-center gap-2 bg-[#f2ad2f] px-7 font-black text-[#07182a] transition hover:-translate-y-0.5", <>Shop Packaging <ArrowRight size={18} /></>, { placement: "growing_hero" })}
              {eventLink("help_me_choose_started", "/pack-ai", "inline-flex min-h-14 items-center justify-center gap-2 border border-white/30 px-7 font-black text-white transition hover:bg-white/10", <>Help Me Choose <WandSparkles size={18} /></>)}
            </div>
            <div className="mt-7 hidden max-w-xl grid-cols-3 border-y border-white/15 py-4 sm:grid">
              {[[Tag, "25 units", "Selected formats"], [Eye, "3D preview", "Before production"], [Truck, "Pan-India", "Delivery coverage"]].map(([Icon, value, label], index) => { const C = Icon as typeof Tag; return <div key={String(value)} className={`${index ? "border-l border-white/15 pl-4" : "pr-4"} flex items-center gap-3`}><C className="shrink-0 text-[#f5bd4f]" size={19}/><span><strong className="block text-sm">{String(value)}</strong><small className="text-[10px] uppercase tracking-wider text-white/45">{String(label)}</small></span></div>; })}
            </div>
          </div>

          <div className="relative min-h-[360px] md:min-h-[420px] lg:min-h-[430px]">
            <div className="absolute inset-[8%] rounded-full bg-[#2f7df4]/20 blur-3xl" />
            {heroImages.map((sku, index) => (
              <div key={sku.code} className={`absolute overflow-hidden border border-white/15 bg-white shadow-2xl ${index === 0 ? "left-[2%] top-[4%] h-[64%] w-[43%] -rotate-3" : index === 1 ? "right-[1%] top-[9%] h-[46%] w-[46%] rotate-3" : index === 2 ? "bottom-[2%] left-[25%] h-[45%] w-[48%] -rotate-1" : "bottom-[7%] right-[0%] h-[34%] w-[29%] rotate-6"}`}>
                <img src={getCatalogImage(sku)} alt={`${sku.name} example`} className="h-full w-full object-cover" fetchPriority={index < 2 ? "high" : "auto"} />
                <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#07182a]/95 to-transparent px-4 pb-4 pt-12 text-sm font-black">{sku.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1450px] px-5 py-20 md:px-10 lg:px-16">
        <div className="mb-10 flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div><p className="text-xs font-black uppercase tracking-[.2em] text-[#1b6ca8]">Choose your starting point</p><h2 className="mt-3 max-w-3xl text-4xl font-black tracking-[-.04em] md:text-5xl">What are you building?</h2></div>
          <p className="max-w-md text-sm leading-6 text-slate-600">Choose what you sell. We’ll show the right formats.</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {BUILDING.map(([label, industry, icon, href, image]) => (
            <Link key={label} href={href} onClick={() => trackMarketingEvent("category_selected", { category: industry })} className="group overflow-hidden border border-[#d9d4c8] bg-white transition hover:-translate-y-1 hover:shadow-xl">
              <div className="relative h-36 overflow-hidden bg-slate-100"><img src={image} alt="" loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-105"/><span className="material-symbols-outlined absolute left-4 top-4 grid h-10 w-10 place-items-center bg-white/90 text-2xl text-[#0b4cb4] shadow">{icon}</span></div>
              <div className="p-5"><h3 className="text-lg font-black">{label}</h3><span className="mt-2 flex items-center gap-1 text-xs font-bold text-slate-500">Explore formats <ChevronRight size={15} className="transition group-hover:translate-x-1" /></span></div>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-white px-5 py-20 md:px-10 lg:px-16">
        <div className="mx-auto max-w-[1450px]">
          <div className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-end"><div><p className="text-xs font-black uppercase tracking-[.2em] text-[#1b6ca8]">Popular starter packaging</p><h2 className="mt-3 text-4xl font-black tracking-[-.04em] md:text-5xl">Start with proven formats.</h2></div><Link href="/products" className="inline-flex items-center gap-2 font-black text-[#0b4cb4]">See all {CATALOG_SKUS.length} families <ArrowRight size={17} /></Link></div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {STARTERS.map((sku) => (
              <article key={sku.code} className="group border border-slate-200 bg-[#fafafa]">
                <Link href={`/products/${sku.slug}`} onClick={() => trackMarketingEvent("product_clicked", { sku: sku.code, placement: "growing_starters" })} className="block aspect-[4/3] overflow-hidden bg-slate-100"><img src={getCatalogImage(sku)} alt={sku.name} loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" /></Link>
                <div className="p-5"><p className="text-[10px] font-black uppercase tracking-[.18em] text-[#1b6ca8]">MOQ {sku.moq.toLocaleString("en-IN")} {sku.moq_unit}</p><h3 className="mt-2 text-xl font-black">{sku.name}</h3><div className="mt-4 flex items-end justify-between gap-3"><div>{sku.publicBuyingPath === "instant" && <><span className="block text-[10px] uppercase text-slate-400">Indicative from</span><strong>{formatINR(sku.price_min)} / unit</strong></>}</div><Link href={getConfigureHref(sku)} onClick={() => trackMarketingEvent("configurator_started", { sku: sku.code })} className="bg-[#0d1b2a] px-4 py-3 text-xs font-black text-white">{sku.publicBuyingPath === "instant" ? "Configure" : "Get quote"}</Link></div></div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="overflow-hidden bg-[#e9f1ff] px-5 py-20 md:px-10 lg:px-16">
        <div className="mx-auto grid max-w-[1450px] gap-12 lg:grid-cols-2 lg:items-center">
          <div><p className="text-xs font-black uppercase tracking-[.2em] text-[#1b6ca8]">From generic to unmistakably yours</p><h2 className="mt-3 text-4xl font-black tracking-[-.045em] md:text-5xl">Your product is ready. Make the packaging feel ready too.</h2><p className="mt-6 max-w-xl leading-7 text-slate-600">Preview the direction before production—not after.</p><Link href="/mockup-studio" onClick={() => trackMarketingEvent("configurator_started", { tool: "mockup_studio" })} className="mt-8 inline-flex min-h-14 items-center gap-2 bg-[#0b4cb4] px-7 font-black text-white"><Eye size={18} /> Preview artwork in 3D</Link></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="mt-12 border border-slate-300 bg-[#f7f4ed] p-4"><span className="text-xs font-black uppercase tracking-widest text-slate-500">Before</span><img src="/images/generic-unbranded-packaging-before-v1.jpg" alt="Plain unbranded stock pouch, carton and mailer before custom printing" loading="lazy" className="mt-5 aspect-[4/5] w-full object-cover" /><p className="mt-4 text-sm text-slate-500">Generic stock packaging</p></div>
            <div className="border border-[#0b4cb4] bg-white p-4 shadow-2xl"><span className="text-xs font-black uppercase tracking-widest text-[#0b4cb4]">After</span><img src={getCatalogImage(findSku("BX-401")!)} alt="Custom printed folding carton" loading="lazy" className="mt-5 aspect-[4/5] w-full object-cover" /><p className="mt-4 text-sm font-bold">Branded and shelf-ready</p></div>
          </div>
        </div>
      </section>

      <section className="bg-[#07182a] px-5 py-20 text-white md:px-10 lg:px-16">
        <div className="mx-auto max-w-[1450px]"><p className="text-xs font-black uppercase tracking-[.2em] text-[#f2ad2f]">Four simple steps</p><h2 className="mt-3 max-w-3xl text-4xl font-black tracking-[-.045em] md:text-5xl">From idea to delivered packaging.</h2><div className="mt-12 grid gap-px bg-white/10 md:grid-cols-4">{[[ShoppingBag,"Choose","Format + quantity"],[Upload,"Add artwork","Upload or design"],[Palette,"Approve","Preview + sample"],[PackageCheck,"Produce","QC + delivery"]].map(([Icon,title,copy], index) => { const C = Icon as typeof ShoppingBag; return <article key={String(title)} className="bg-[#07182a] p-7"><span className="font-mono text-[#f2ad2f]">0{index+1}</span><C className="mt-10" size={30}/><h3 className="mt-5 text-xl font-black">{String(title)}</h3><p className="mt-2 text-xs font-bold uppercase tracking-wider text-white/45">{String(copy)}</p></article>; })}</div></div>
      </section>

      <section className="px-5 py-20 md:px-10 lg:px-16"><div className="mx-auto max-w-[1450px]"><div className="grid gap-10 lg:grid-cols-[.9fr_1.1fr] lg:items-end"><div><p className="text-xs font-black uppercase tracking-[.2em] text-[#1b6ca8]">Start small. Scale later.</p><h2 className="mt-3 text-4xl font-black tracking-[-.045em] md:text-5xl">Your first 50 packs. Your next 5 million. Same packaging partner.</h2></div><p className="max-w-xl text-base leading-7 text-slate-600">Start online. Move into managed sourcing when volume grows.</p></div><div className="mt-12 grid gap-3 md:grid-cols-4">{[["Launch","First run"],["Repeat","Approved spec"],["Scale","Volume routing"],["Managed Packaging","Multi-SKU control"]].map(([title,copy],i)=><div key={title} className={`${i===3?"border-[#e8a838] bg-[#fff8e8]":"border-slate-200 bg-white"} border p-6`}><span className="font-mono text-[#c47d00]">0{i+1}</span><h3 className="mt-10 text-2xl font-black">{title}</h3><p className="mt-2 text-sm text-slate-500">{copy}</p></div>)}</div></div></section>

      <section className="bg-[#f2ad2f] px-5 py-20 md:px-10 lg:px-16"><div className="mx-auto grid max-w-[1200px] gap-8 lg:grid-cols-[1fr_auto] lg:items-center"><div><div className="mb-5 inline-grid h-14 w-14 place-items-center rounded-full bg-[#07182a] text-white"><Sparkles /></div><h2 className="text-4xl font-black tracking-[-.04em] md:text-5xl">Not sure what packaging you need?</h2><p className="mt-4 max-w-2xl text-lg text-[#132941]/70">Tell the Packworkz planner what you sell, your quantity and what matters most. It will turn plain language into a practical shortlist.</p></div><Link href="/pack-ai" onClick={() => trackMarketingEvent("help_me_choose_started", { placement: "growing_recommender" })} className="inline-flex min-h-16 items-center justify-center gap-2 bg-[#07182a] px-8 text-lg font-black text-white">Tell us what you sell <ArrowRight /></Link></div></section>

      <section className="bg-white px-5 py-20 md:px-10 lg:px-16"><div className="mx-auto max-w-[1200px]"><p className="text-xs font-black uppercase tracking-[.2em] text-[#1b6ca8]">Questions founders ask</p><h2 className="mt-3 text-4xl font-black tracking-[-.04em] md:text-5xl">Straight answers before you order.</h2><div className="mt-10 divide-y divide-slate-200 border-y border-slate-200">{FAQS.map(([q,a])=><details key={q} className="group py-5"><summary className="flex cursor-pointer list-none items-center justify-between gap-5 text-lg font-black">{q}<span className="text-2xl text-[#1b6ca8] group-open:rotate-45">+</span></summary><p className="max-w-3xl pt-4 leading-7 text-slate-600">{a}</p></details>)}</div></div></section>

      <section className="bg-[#0b4cb4] px-5 py-20 text-white md:px-10 lg:px-16"><div className="mx-auto max-w-[1200px] text-center"><Rocket className="mx-auto text-[#f2ad2f]" size={38} /><h2 className="mx-auto mt-5 max-w-4xl text-4xl font-black tracking-[-.05em] md:text-6xl">Make your first impression look like your hundredth.</h2><div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row"><Link href="/products" className="inline-flex min-h-14 items-center justify-center bg-[#f2ad2f] px-8 font-black text-[#07182a]">Shop Packaging</Link><Link href="/pack-ai" className="inline-flex min-h-14 items-center justify-center border border-white/35 px-8 font-black">Tell Us What You Sell</Link></div><Link href="/enterprise" className="mt-8 inline-flex items-center gap-2 text-sm font-bold text-white/70">Need higher volumes or multiple packaging SKUs? Explore Packworkz Enterprise <ArrowRight size={16} /></Link></div></section>

      <div className="fixed inset-x-3 bottom-3 z-40 flex gap-2 border border-slate-200 bg-white p-2 shadow-2xl md:hidden"><Link href="/products" className="flex min-h-12 flex-1 items-center justify-center bg-[#f2ad2f] font-black">Shop packaging</Link><Link href="/pack-ai" className="grid min-h-12 w-14 place-items-center bg-[#07182a] text-white" aria-label="Help me choose"><WandSparkles size={20}/></Link></div>
    </div>
  );
}
