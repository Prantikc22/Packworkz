import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import { ArrowRight, BarChart3, Boxes, Check, ClipboardCheck, Factory, FileCheck2, GitBranch, Layers3, PackageSearch, RefreshCcw, Route, ShieldCheck, Truck, UploadCloud, Warehouse } from "lucide-react";
import { CATALOG_SKUS, getCatalogImage } from "@/lib/catalog";
import { trackMarketingEvent } from "@/lib/analytics";

const CAPABILITIES = [
  [GitBranch, "Multi-vendor sourcing", "Route specifications across eligible manufacturing capabilities without rebuilding the brief each time."],
  [Factory, "Backup production capacity", "Assess alternate capacity against the same specification where format, tooling and approvals allow it."],
  [Layers3, "Specification management", "Keep sizes, structures, finishes, artwork and approval history attached to the order record."],
  [ClipboardCheck, "Pre-production approval", "Lock the relevant sample, dieline and artwork route before the production run begins."],
  [ShieldCheck, "In-process QC", "Record checks against the approved specification during production where the route supports them."],
  [PackageSearch, "Pre-dispatch QC", "Review documented checks before the shipment leaves the production route."],
  [FileCheck2, "Compliance documentation", "Attach applicable material, factory and product documents to the final specification."],
  [Boxes, "Multi-SKU procurement", "Coordinate pouches, labels, cartons, bottles and secondary packaging in one commercial workflow."],
  [Truck, "Logistics tracking", "Keep pickup, dispatch and delivery milestones visible against the order."],
  [Warehouse, "SmartStock", "Surface reorder risk before packaging availability becomes a production emergency."],
  [RefreshCcw, "Repeat-order management", "Reorder from an approved specification instead of reconstructing it from messages."],
  [UploadCloud, "Design and artwork management", "Control artwork versions, dielines and approval context alongside the physical specification."],
] as const;

const INDUSTRIES = [
  ["Food & Beverage", "/industries/food", "restaurant"], ["FMCG", "/industries/fmcg", "shopping_cart"],
  ["Beauty & Cosmetics", "/industries/beauty", "spa"], ["Pharma & Healthcare", "/industries/pharma", "medical_services"],
  ["Restaurants / QSR", "/products?category=foodservice", "storefront"], ["E-commerce", "/industries/d2c", "local_shipping"],
  ["Exports", "/industries/exports", "public"], ["Industrial / B2B", "/products?category=protective", "precision_manufacturing"],
] as const;

const FAQS = [
  ["Does Packworkz replace our existing suppliers?", "Not necessarily. Packworkz can begin alongside existing suppliers, manage a pilot SKU, or work from incumbent specifications before any broader migration is considered."],
  ["Can we begin with one SKU?", "Yes. A single-SKU benchmark and pilot is the preferred low-risk starting point for many enterprise teams."],
  ["Can Packworkz work with our existing specifications?", "Yes. Existing specifications, quotations and artwork can form the starting brief. Any gaps are resolved before production approval."],
  ["How does Packworkz handle quality control?", "Quality checkpoints are defined against the approved specification and may include pre-production, in-process and pre-dispatch checks depending on the manufacturing route."],
  ["Can Packworkz manage multiple packaging categories?", `Yes. The current storefront covers ${CATALOG_SKUS.length} configured product families, with managed sourcing used for technical and multi-SKU requirements.`],
  ["How is backup sourcing handled?", "Alternate routes are assessed only where the specification, tooling, compliance and approval state make a change viable. Backup coverage is not claimed where it cannot be responsibly executed."],
  ["Can Packworkz support exports?", "Packworkz can plan export packaging and documentation requirements against the destination market and final product specification."],
  ["Can Packworkz support high-volume production?", "Yes. Enterprise quantities are reviewed against production method, eligible capacity, commercial structure and required QC before confirmation."],
  ["What information is required for a benchmark?", "One specification or current quotation, expected quantity, use case, timeline and the operational issue you want to improve are enough to start."],
  ["How are commercial terms handled?", "Tooling, samples, taxes, delivery, payment milestones and any approved terms are stated in the commercial record before production begins."],
];

const COMPARISON = [
  ["Product/category coverage", "One manufacturing category", "Multiple packaging categories"],
  ["Supplier redundancy", "Limited to own capacity", "Alternate routes assessed where eligible"],
  ["QC accountability", "Factory-specific process", "Managed checkpoints against the approved spec"],
  ["Specification records", "Often split across teams", "One attached specification record"],
  ["Compliance/documentation", "Requested per supplier", "Attached to the final specification"],
  ["Logistics visibility", "Ends at dispatch", "Pickup through delivery milestones"],
  ["Multi-SKU management", "Multiple vendor threads", "One commercial and order workflow"],
  ["Reorder planning", "Reactive PO cycle", "Approved-spec repeat and stock-risk visibility"],
  ["Escalation ownership", "Buyer coordinates parties", "Packworkz owns workflow escalation"],
];

const findSku = (code: string) => CATALOG_SKUS.find((sku) => sku.code === code);
const ENTERPRISE_PRODUCTS = ["FP-101", "BX-401", "BC-206", "EC-502", "LC-804", "RL-701"]
  .map(findSku)
  .filter(Boolean) as NonNullable<ReturnType<typeof findSku>>[];
const OPERATING_ROUTES = [
  ["FP-101", "Stand-up pouch", "F-02", "Printing", "62%"],
  ["BX-401", "Folding carton", "F-11", "QC review", "86%"],
  ["LC-804", "Pressure label", "F-07", "Dispatched", "100%"],
  ["BC-201", "PET bottle", "F-04", "Artwork", "24%"],
] as const;

type BenchmarkForm = {
  name: string; company: string; email: string; phone: string; spend: string; skuCount: string;
  vendorCount: string; category: string; quantity: string; challenge: string;
};

export default function Enterprise() {
  const [form, setForm] = useState<BenchmarkForm>({ name: "", company: "", email: "", phone: "", spend: "₹5L–₹20L", skuCount: "", vendorCount: "", category: "Flexible packaging", quantity: "", challenge: "" });
  const [submitState, setSubmitState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [reference, setReference] = useState("");
  const [monthlySpend, setMonthlySpend] = useState(1000000);
  const [suppliers, setSuppliers] = useState(4);
  const [rushOrders, setRushOrders] = useState(2);
  const [skus, setSkus] = useState(12);

  useEffect(() => trackMarketingEvent("enterprise_page_view"), []);

  const scenario = useMemo(() => {
    const coordinationHours = suppliers * 3 + skus * 0.35 + rushOrders * 4;
    const spendAtRisk = monthlySpend * Math.min(0.12, 0.025 + suppliers * 0.008 + rushOrders * 0.006);
    return { coordinationHours: Math.round(coordinationHours), spendAtRisk: Math.round(spendAtRisk) };
  }, [monthlySpend, rushOrders, skus, suppliers]);

  const update = (key: keyof BenchmarkForm, value: string) => setForm((current) => ({ ...current, [key]: value }));
  const submitBenchmark = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitState("sending");
    trackMarketingEvent("benchmark_submitted", { category: form.category, spend: form.spend });
    try {
      const message = [
        `Monthly packaging spend: ${form.spend}`, `Packaging SKUs: ${form.skuCount || "Not provided"}`,
        `Vendors: ${form.vendorCount || "Not provided"}`, `Category: ${form.category}`,
        `Approx. monthly quantity: ${form.quantity || "Not provided"}`, `Current challenge: ${form.challenge}`,
      ].join("\n");
      const response = await fetch("/api/leads", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ source: "enterprise_benchmark", name: form.name, company: form.company, email: form.email, phone: form.phone, subject: "Enterprise packaging benchmark", message, metadata: form }) });
      const payload = await response.json() as { inquiry_id?: string; error?: string };
      if (!response.ok) throw new Error(payload.error || "Benchmark request could not be saved.");
      setReference(payload.inquiry_id || "INQ-SAVED");
      setSubmitState("sent");
      trackMarketingEvent("enterprise_contact_submitted", { route: "benchmark", reference: payload.inquiry_id || "saved" });
    } catch {
      setSubmitState("error");
    }
  };

  const schema = { "@context": "https://schema.org", "@graph": [
    { "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: "https://packworkz.com/" }, { "@type": "ListItem", position: 2, name: "Enterprise", item: "https://packworkz.com/enterprise" }] },
    { "@type": "FAQPage", mainEntity: FAQS.map(([name, text]) => ({ "@type": "Question", name, acceptedAnswer: { "@type": "Answer", text } })) },
  ] };

  return (
    <div className="bg-[#07131f] text-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

      <section className="relative overflow-hidden px-5 pb-10 pt-[104px] md:px-10 lg:px-16">
        <div className="absolute inset-0 opacity-40" style={{ backgroundImage: "linear-gradient(rgba(97,169,255,.08) 1px, transparent 1px), linear-gradient(90deg, rgba(97,169,255,.08) 1px, transparent 1px)", backgroundSize: "54px 54px" }} />
        <div className="relative mx-auto grid max-w-[1500px] gap-14 lg:grid-cols-[1.08fr_.92fr] lg:items-center">
          <div><p className="text-xs font-black uppercase tracking-[.24em] text-[#e8a838]">Packworkz Enterprise</p><h1 className="mt-3 text-[clamp(2.75rem,4.5vw,5rem)] font-black leading-[.94] tracking-[-.05em]">Stop managing packaging vendors. <span className="text-[#79b5ff]">Start managing packaging.</span></h1><p className="mt-4 max-w-xl text-lg leading-8 text-white/60">One operating layer for sourcing, QC, logistics and repeat orders.</p><div className="mt-6 flex flex-col gap-3 sm:flex-row"><a href="#benchmark" onClick={() => trackMarketingEvent("benchmark_started", { placement: "hero" })} className="inline-flex min-h-14 items-center justify-center gap-2 bg-[#e8a838] px-7 font-black text-[#07131f]">Get a Packaging Benchmark <ArrowRight size={18}/></a><Link href="/contact" onClick={() => trackMarketingEvent("enterprise_contact_started", { placement: "hero" })} className="inline-flex min-h-14 items-center justify-center border border-white/25 px-7 font-black">Talk to a Packaging Specialist</Link></div><div className="mt-5 hidden flex-wrap gap-2 text-xs font-bold text-white/65 sm:flex"><span className="border border-white/15 px-3 py-2">{CATALOG_SKUS.length} configured product families</span><span className="border border-white/15 px-3 py-2">Documented QC</span><span className="border border-white/15 px-3 py-2">Pan-India workflow</span></div></div>

          <div className="relative border border-[#31516d] bg-[#0b1d2c] p-3 shadow-2xl md:p-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3"><div><p className="text-[10px] font-black uppercase tracking-[.2em] text-[#79b5ff]">PackOS operating view</p><strong className="mt-1 block text-xl">Portfolio control room</strong></div><span className="flex items-center gap-2 text-xs text-emerald-300"><i className="h-2 w-2 rounded-full bg-emerald-400"/> Live workflow</span></div>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">{[["24","Active SKUs"],["05","Production routes"],["03","Reorder risks"]].map(([v,l],i)=><div key={l} className={`p-3 ${i===2?"bg-[#e8a838] text-[#07131f]":"bg-white/5"}`}><strong className="text-2xl">{v}</strong><span className="mt-1 block text-[10px] font-bold uppercase tracking-wider opacity-65">{l}</span></div>)}</div>
            <div className="mt-3 grid gap-3 md:grid-cols-[1.15fr_.85fr]">
              <div className="bg-white/5 p-4">
                <div className="mb-4 flex justify-between text-xs text-white/45"><span>SKU / ROUTE</span><span>STATUS</span></div>
                {OPERATING_ROUTES.map(([code, name, route, status, progress]) => {
                  const sku = findSku(code);
                  return (
                    <div key={code} className="mb-3 grid grid-cols-[40px_1fr] items-center gap-3">
                      <img src={sku ? getCatalogImage(sku) : ""} alt="" className="h-10 w-10 bg-white object-cover" />
                      <div>
                        <div className="flex justify-between gap-3 text-xs"><strong>{name} · {route}</strong><span className="text-[#79b5ff]">{status}</span></div>
                        <div className="mt-2 h-1 bg-white/10"><div className="h-full bg-[#e8a838]" style={{ width: progress }} /></div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="bg-[#10283a] p-4">
                <p className="text-xs font-black uppercase tracking-widest text-white/45">Flow</p>
                <div className="mt-4 space-y-3">{[[Factory,"Factories"],[ClipboardCheck,"QC checkpoints"],[Truck,"Dispatch"],[Warehouse,"Stock risk"]].map(([Icon,label],i)=>{const C=Icon as typeof Factory; return <div key={String(label)} className="flex items-center gap-3"><span className={`grid h-8 w-8 place-items-center ${i===3?"bg-red-400/15 text-red-300":"bg-[#79b5ff]/10 text-[#79b5ff]"}`}><C size={17}/></span><span className="text-sm font-bold">{String(label)}</span></div>})}</div>
              </div>
            </div>
            <p className="mt-3 text-xs leading-5 text-white/35">Illustrative operating view using genuine PackOS workflow concepts; not a representation of live customer data.</p>
          </div>
        </div>
      </section>

      <section className="px-5 pb-16 md:px-10 lg:px-16"><div className="mx-auto max-w-[1500px]"><div className="mb-6 flex items-end justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-[.2em] text-[#79b5ff]">One managed portfolio</p><h2 className="mt-2 text-3xl font-black tracking-[-.04em]">Flexible, rigid and secondary packaging.</h2></div><Link href="/products" className="hidden items-center gap-2 text-sm font-black text-[#e8a838] sm:flex">View all formats <ArrowRight size={16}/></Link></div><div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">{ENTERPRISE_PRODUCTS.map((sku)=><Link key={sku.code} href={`/products/${sku.slug}`} className="group relative aspect-[4/3] overflow-hidden border border-white/15 bg-white/5"><img src={getCatalogImage(sku)} alt={sku.name} loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-105"/><span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#07131f] via-[#07131f]/75 to-transparent px-4 pb-3 pt-10"><strong className="block text-sm">{sku.name}</strong><small className="text-white/50">{sku.code}</small></span></Link>)}</div></div></section>

      <section className="bg-[#f5f7fa] px-5 py-20 text-[#0d1b2a] md:px-10 lg:px-16"><div className="mx-auto max-w-[1450px]"><p className="text-xs font-black uppercase tracking-[.2em] text-[#1b6ca8]">The coordination problem</p><h2 className="mt-3 max-w-4xl text-4xl font-black tracking-[-.05em] md:text-5xl">One specification layer instead of another vendor thread.</h2><div className="mt-12 grid overflow-hidden border border-slate-300 lg:grid-cols-2"><div className="bg-white p-7 md:p-10"><span className="text-xs font-black uppercase tracking-widest text-slate-500">Traditional procurement</span><div className="mt-8 grid gap-3 sm:grid-cols-2">{["Vendor 1 → pouches","Vendor 2 → labels","Vendor 3 → cartons","Vendor 4 → bottles","WhatsApp approvals","Spreadsheet status"].map(x=><div key={x} className="border border-slate-200 bg-[#f4f6f8] p-4 text-sm font-bold">{x}</div>)}</div></div><div className="bg-[#0b4cb4] p-7 text-white md:p-10"><span className="text-xs font-black uppercase tracking-widest text-[#bcd8ff]">Packworkz managed platform</span><div className="mt-8 space-y-3">{["One specification layer","Managed supplier routing","Documented QC","One order record","Tracked dispatch"].map(x=><div key={x} className="flex items-center gap-3 border-b border-white/15 pb-3 font-bold"><Check size={17} className="text-[#e8a838]"/>{x}</div>)}</div></div></div></div></section>

      <section id="benchmark" className="bg-[#e8a838] px-5 py-20 text-[#07131f] md:px-10 lg:px-16"><div className="mx-auto grid max-w-[1350px] gap-12 lg:grid-cols-[.8fr_1.2fr]"><div><p className="text-xs font-black uppercase tracking-[.22em]">Free packaging benchmark</p><h2 className="mt-4 text-5xl font-black leading-[.95] tracking-[-.055em] md:text-6xl">Give us one packaging SKU.</h2><p className="mt-6 max-w-xl text-lg leading-8 text-[#07131f]/70">We’ll benchmark sourcing, lead time and operating friction.</p><div className="mt-10 space-y-4">{["No portfolio commitment","Use an existing specification","One commercial review"].map(x=><div key={x} className="flex items-center gap-3 font-bold"><span className="grid h-7 w-7 place-items-center rounded-full bg-[#07131f] text-white"><Check size={15}/></span>{x}</div>)}</div></div>
          <form onSubmit={submitBenchmark} onFocus={() => trackMarketingEvent("benchmark_started", { placement: "form" })} className="bg-white p-6 shadow-2xl md:p-9">{submitState === "sent" ? <div className="grid min-h-[520px] place-items-center text-center"><div><div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-100 text-emerald-700"><Check size={30}/></div><h3 className="mt-6 text-3xl font-black">Benchmark request saved.</h3><p className="mt-3 text-slate-600">Reference {reference}. The enterprise team has your context.</p></div></div> : <><div className="grid gap-4 md:grid-cols-2">{[["name","Name","Your name","text"],["company","Company","Company name","text"],["email","Work email","you@company.com","email"],["phone","Phone (optional)","+91","tel"]].map(([key,label,placeholder,type])=><label key={key} className="text-sm font-black">{label}<input required={key!=="phone"} value={form[key as keyof BenchmarkForm]} onChange={e=>update(key as keyof BenchmarkForm,e.target.value)} placeholder={placeholder} type={type} className="mt-2 h-12 w-full border border-slate-300 px-4 font-medium outline-none focus:border-[#0b4cb4]"/></label>)}</div><div className="mt-4 grid gap-4 md:grid-cols-2"><label className="text-sm font-black">Monthly packaging spend<select value={form.spend} onChange={e=>update("spend",e.target.value)} className="mt-2 h-12 w-full border border-slate-300 bg-white px-4"><option>Under ₹1L</option><option>₹1L–₹5L</option><option>₹5L–₹20L</option><option>₹20L–₹50L</option><option>₹50L+</option></select></label><label className="text-sm font-black">Packaging category<select value={form.category} onChange={e=>update("category",e.target.value)} className="mt-2 h-12 w-full border border-slate-300 bg-white px-4"><option>Flexible packaging</option><option>Boxes and cartons</option><option>Bottles and containers</option><option>Labels</option><option>Food service</option><option>Multiple categories</option></select></label>{[["skuCount","Number of packaging SKUs"],["vendorCount","Number of vendors"],["quantity","Approx. monthly quantity"]].map(([key,label])=><label key={key} className="text-sm font-black">{label}<input value={form[key as keyof BenchmarkForm]} onChange={e=>update(key as keyof BenchmarkForm,e.target.value)} className="mt-2 h-12 w-full border border-slate-300 px-4"/></label>)}</div><label className="mt-4 block text-sm font-black">Current challenge<textarea required minLength={10} value={form.challenge} onChange={e=>update("challenge",e.target.value)} placeholder="Lead time, MOQ, quality consistency, supplier coordination, cost..." className="mt-2 min-h-28 w-full border border-slate-300 p-4"/></label><p className="mt-3 text-xs leading-5 text-slate-500">Have a specification, quotation or artwork? Mention it here. Sensitive files are requested through a secure follow-up channel; they are not uploaded publicly.</p>{submitState==="error"&&<p className="mt-3 text-sm font-bold text-red-600">We could not save this request. Please retry or use the contact page.</p>}<button disabled={submitState==="sending"} className="mt-6 flex min-h-14 w-full items-center justify-center gap-2 bg-[#07131f] px-6 text-lg font-black text-white disabled:opacity-60">{submitState==="sending"?"Saving benchmark...":"Benchmark a Packaging SKU"}<ArrowRight size={18}/></button></>}</form>
        </div></section>

      <section className="px-5 py-20 md:px-10 lg:px-16"><div className="mx-auto max-w-[1450px]"><p className="text-xs font-black uppercase tracking-[.2em] text-[#79b5ff]">Enterprise capabilities</p><h2 className="mt-3 max-w-4xl text-4xl font-black tracking-[-.05em] md:text-5xl">The operating layer around the packaging.</h2><div className="mt-12 grid gap-px overflow-hidden bg-white/10 sm:grid-cols-2 lg:grid-cols-3">{CAPABILITIES.slice(0,6).map(([Icon,title])=><article key={title} className="flex min-h-40 flex-col justify-between bg-[#07131f] p-7 transition hover:bg-[#0b2031]"><Icon className="text-[#e8a838]" size={30}/><h3 className="mt-8 text-xl font-black">{title}</h3></article>)}</div></div></section>

      <section className="bg-white px-5 py-20 text-[#0d1b2a] md:px-10 lg:px-16"><div className="mx-auto max-w-[1350px]"><div className="grid gap-10 lg:grid-cols-[.8fr_1.2fr] lg:items-center"><div><p className="text-xs font-black uppercase tracking-[.2em] text-[#1b6ca8]">Land with one SKU</p><h2 className="mt-3 text-5xl font-black leading-[.98] tracking-[-.05em]">You do not have to move everything to Packworkz.</h2><p className="mt-6 leading-7 text-slate-600">Reduce buying risk with a controlled pilot and evidence at every expansion point.</p></div><div className="grid gap-2 sm:grid-cols-3">{["1 SKU","Pilot production","QC validation","Repeat order","Additional SKUs","Managed portfolio"].map((x,i)=><div key={x} className={`${i===5?"border border-[#e8a838] bg-[#fff8e8]":"bg-[#f3f6f9]"} min-h-36 p-5`}><span className="font-mono text-[#e8a838]">0{i+1}</span><strong className="mt-12 block">{x}</strong></div>)}</div></div></div></section>

      <section className="bg-[#0b4cb4] px-5 py-20 md:px-10 lg:px-16"><div className="mx-auto grid max-w-[1350px] gap-12 lg:grid-cols-2 lg:items-center"><div><p className="text-xs font-black uppercase tracking-[.2em] text-[#c5dcff]">SmartStock</p><h2 className="mt-3 text-5xl font-black leading-[.98] tracking-[-.05em]">Know what needs to be reordered before packaging becomes a production emergency.</h2><p className="mt-6 max-w-xl leading-7 text-white/65">Keep approved specs, expected demand and reorder risk in the same operating context. The value is earlier action—not an AI label.</p><Link href="/smartstock" onClick={()=>trackMarketingEvent("smartstock_interaction",{placement:"enterprise"})} className="mt-8 inline-flex min-h-14 items-center gap-2 bg-white px-7 font-black text-[#0b4cb4]">Explore SmartStock <ArrowRight size={17}/></Link></div><div className="border border-white/20 bg-[#073889] p-6"><div className="flex items-center justify-between"><strong>Packaging availability</strong><span className="text-xs text-white/50">Illustrative scenario</span></div>{[["Coffee pouch","42 days","Healthy"],["Shipping carton","18 days","Plan reorder"],["Bottle label","9 days","At risk"],["Pump bottle","31 days","Healthy"]].map(([sku,days,status],i)=><div key={sku} className="mt-4 grid grid-cols-[1fr_auto] items-center border-t border-white/15 pt-4"><div><strong>{sku}</strong><span className="mt-1 block text-xs text-white/50">Estimated cover · {days}</span></div><span className={`px-3 py-2 text-xs font-black ${i===2?"bg-red-300 text-red-950":i===1?"bg-[#e8a838] text-[#07131f]":"bg-emerald-300 text-emerald-950"}`}>{status}</span></div>)}</div></div></section>

      <section className="bg-[#f5f7fa] px-5 py-20 text-[#0d1b2a] md:px-10 lg:px-16"><div className="mx-auto max-w-[1450px]"><p className="text-xs font-black uppercase tracking-[.2em] text-[#1b6ca8]">Enterprise industries</p><div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{INDUSTRIES.map(([label,href,icon])=><Link key={label} href={href} onClick={()=>trackMarketingEvent("enterprise_industry_clicked",{industry:label})} className="group flex min-h-40 flex-col justify-between border border-slate-200 bg-white p-6 transition hover:-translate-y-1 hover:shadow-xl"><span className="material-symbols-outlined text-4xl text-[#0b4cb4]">{icon}</span><strong className="flex items-center justify-between text-xl">{label}<ArrowRight size={17} className="transition group-hover:translate-x-1"/></strong></Link>)}</div></div></section>

      <section className="bg-white px-5 py-20 text-[#0d1b2a] md:px-10 lg:px-16"><div className="mx-auto grid max-w-[1350px] gap-12 lg:grid-cols-[.8fr_1.2fr]"><div><p className="text-xs font-black uppercase tracking-[.2em] text-[#1b6ca8]">Packaging friction scenario</p><h2 className="mt-3 text-5xl font-black leading-[.98] tracking-[-.05em]">See where coordination may be hiding cost.</h2><p className="mt-5 leading-7 text-slate-600">This calculator is a directional scenario, not a savings guarantee. Results use transparent coordination and risk assumptions only.</p><a href="#benchmark" onClick={()=>trackMarketingEvent("benchmark_started",{placement:"calculator"})} className="mt-7 inline-flex min-h-14 items-center gap-2 bg-[#07131f] px-7 font-black text-white">Get My Packaging Benchmark <ArrowRight size={17}/></a></div><div className="border border-slate-200 bg-[#f5f7fa] p-6 md:p-8"><div className="grid gap-5 sm:grid-cols-2">{[["Monthly packaging spend",monthlySpend,setMonthlySpend,100000,5000000,100000,"₹"],["Number of suppliers",suppliers,setSuppliers,1,12,1,""],["Rush buys / month",rushOrders,setRushOrders,0,10,1,""],["Packaging SKUs",skus,setSkus,1,80,1,""]].map(([label,value,setter,min,max,step,prefix])=><label key={String(label)} className="text-sm font-black">{String(label)}<strong className="float-right text-[#0b4cb4]">{String(prefix)}{Number(value).toLocaleString("en-IN")}</strong><input type="range" value={Number(value)} min={Number(min)} max={Number(max)} step={Number(step)} onChange={e=>(setter as (n:number)=>void)(Number(e.target.value))} className="mt-4 w-full accent-[#0b4cb4]"/></label>)}</div><div className="mt-8 grid gap-3 sm:grid-cols-2"><div className="bg-[#07131f] p-6 text-white"><span className="text-xs uppercase tracking-widest text-white/50">Coordination scenario</span><strong className="mt-3 block text-4xl">{scenario.coordinationHours} hrs</strong><small className="text-white/45">estimated team time per month</small></div><div className="bg-[#e8a838] p-6"><span className="text-xs uppercase tracking-widest opacity-60">Spend exposed to friction</span><strong className="mt-3 block text-4xl">₹{scenario.spendAtRisk.toLocaleString("en-IN")}</strong><small className="opacity-60">scenario estimate, not guaranteed savings</small></div></div></div></div></section>

      <section className="px-5 py-20 md:px-10 lg:px-16"><div className="mx-auto max-w-[1350px]"><p className="text-xs font-black uppercase tracking-[.2em] text-[#79b5ff]">Why not buy directly?</p><h2 className="mt-3 max-w-4xl text-4xl font-black tracking-[-.05em] md:text-5xl">A manufacturer makes a format. A managed platform owns the workflow.</h2><div className="mt-10 overflow-x-auto border border-white/15"><table className="min-w-[760px] w-full text-left"><thead><tr className="bg-white/5"><th className="p-5 text-xs uppercase tracking-widest text-white/40">Capability</th><th className="p-5">Single manufacturer</th><th className="bg-[#0b4cb4] p-5">Packworkz managed platform</th></tr></thead><tbody>{COMPARISON.slice(0,5).map(([a,b,c])=><tr key={a} className="border-t border-white/10"><th className="p-5 text-sm">{a}</th><td className="p-5 text-sm text-white/50">{b}</td><td className="bg-[#0b4cb4]/30 p-5 text-sm font-bold">{c}</td></tr>)}</tbody></table></div></div></section>

      <section className="bg-[#f5f7fa] px-5 py-20 text-[#0d1b2a] md:px-10 lg:px-16"><div className="mx-auto max-w-[1200px]"><p className="text-xs font-black uppercase tracking-[.2em] text-[#1b6ca8]">Procurement FAQ</p><h2 className="mt-3 text-4xl font-black tracking-[-.04em] md:text-5xl">Before the first benchmark.</h2><div className="mt-10 divide-y divide-slate-200 border-y border-slate-200">{FAQS.map(([q,a])=><details key={q} className="group py-5"><summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-lg font-black">{q}<span className="text-2xl text-[#0b4cb4] group-open:rotate-45">+</span></summary><p className="max-w-3xl pt-4 leading-7 text-slate-600">{a}</p></details>)}</div></div></section>

      <section className="bg-[#e8a838] px-5 py-16 text-[#07131f] md:px-10"><div className="mx-auto flex max-w-[1200px] flex-col justify-between gap-7 lg:flex-row lg:items-center"><div><h2 className="text-4xl font-black tracking-[-.04em]">Start with one SKU.</h2><p className="mt-2 text-[#07131f]/65">Benchmark the current state before changing the operating model.</p></div><div className="flex flex-col gap-3 sm:flex-row"><a href="#benchmark" className="inline-flex min-h-14 items-center justify-center bg-[#07131f] px-7 font-black text-white">Get a Packaging Benchmark</a><Link href="/products" className="inline-flex min-h-14 items-center justify-center border border-[#07131f] px-7 font-black">Need a smaller online order? Shop Packaging</Link></div></div></section>
    </div>
  );
}
