import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Check, CircleCheck, Clock3, ExternalLink, Factory, Loader2, LockKeyhole, PackageSearch, Truck } from "lucide-react";
import { Link } from "wouter";

type TrackingResult = {
  reference: string;
  quote_reference: string;
  status: string;
  product_name: string;
  quantity: number | null;
  quantity_unit: string;
  total_price: number | null;
  estimated_delivery: string | null;
  tracking_number: string | null;
  tracking_url: string | null;
  updated_at: string | null;
};

const STAGES = [
  { key: "confirmed", title: "Order confirmed", detail: "Payment is verified and your specification is locked." },
  { key: "in_production", title: "In production", detail: "Artwork, material and production checkpoints are underway." },
  { key: "qc_check", title: "Quality check", detail: "The finished run is being checked before dispatch." },
  { key: "dispatched", title: "Dispatched", detail: "Your packaging has left the production facility." },
  { key: "delivered", title: "Delivered", detail: "The order has reached its destination." },
] as const;

const STATUS_INDEX: Record<string, number> = {
  paid: 0,
  payment_pending: 0,
  confirmed: 0,
  in_production: 1,
  production: 1,
  qc_check: 2,
  dispatched: 3,
  delivered: 4,
};

function formatDate(value: string | null): string {
  if (!value) return "To be confirmed";
  return new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" }).format(new Date(value));
}

export default function TrackOrder() {
  const initialReference = useMemo(() => {
    if (typeof window === "undefined") return "";
    return new URLSearchParams(window.location.search).get("reference") || "";
  }, []);
  const [reference, setReference] = useState(initialReference);
  const [contact, setContact] = useState("");
  const [result, setResult] = useState<TrackingResult | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.title = "Track your order | Packworkz";
  }, []);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const response = await fetch("/api/orders/guest-track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reference, contact }),
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.error || "We could not verify that order.");
      setResult(body);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "We could not verify that order.");
    } finally {
      setLoading(false);
    }
  };

  const currentStage = result ? (STATUS_INDEX[result.status] ?? 0) : 0;
  const isCancelled = result?.status === "cancelled";

  return (
    <main className="min-h-[calc(100vh-76px)] bg-[#eef3f7] text-[#0d1b2a]">
      <section className="max-w-7xl mx-auto px-5 sm:px-8 pt-32 sm:pt-36 pb-16 sm:pb-20">
        <div className="grid lg:grid-cols-[0.78fr_1.22fr] border border-[#c9d6e1] bg-white">
          <div className="p-7 sm:p-12 lg:p-14 border-b lg:border-b-0 lg:border-r border-[#c9d6e1]">
            <div className="w-12 h-12 grid place-items-center bg-[#e8a838] mb-8"><PackageSearch size={25} /></div>
            <p className="text-[11px] font-black tracking-[0.2em] text-[#2374ad] mb-4">GUEST ORDER TRACKING</p>
            <h1 className="text-4xl sm:text-5xl font-black leading-[1.02] mb-5" style={{ fontFamily: "'Space Grotesk', sans-serif", letterSpacing: 0 }}>Know exactly where your packaging stands.</h1>
            <p className="text-[#64748b] leading-relaxed mb-9">No account is required. Enter the order reference from your confirmation and the same email or mobile number used at checkout.</p>

            <form onSubmit={submit} className="space-y-5">
              <label className="block">
                <span className="block text-[11px] font-black tracking-[0.12em] text-[#516579] mb-2">ORDER OR PLAN REFERENCE</span>
                <input value={reference} onChange={(event) => setReference(event.target.value.toUpperCase())} required autoComplete="off" placeholder="PO-2026-10001 or PKG-2026-10001" className="w-full h-14 border border-[#bdcbd8] px-4 bg-white font-mono text-sm outline-none focus:border-[#2374ad]" />
              </label>
              <label className="block">
                <span className="block text-[11px] font-black tracking-[0.12em] text-[#516579] mb-2">CHECKOUT EMAIL OR MOBILE</span>
                <input value={contact} onChange={(event) => setContact(event.target.value)} required autoComplete="email" placeholder="you@company.com or 98XXXXXXXX" className="w-full h-14 border border-[#bdcbd8] px-4 bg-white text-sm outline-none focus:border-[#2374ad]" />
              </label>
              <button disabled={loading} className="w-full min-h-14 px-5 bg-[#0d1b2a] text-white font-black inline-flex items-center justify-center gap-3 hover:bg-[#18344a] disabled:opacity-60">
                {loading ? <><Loader2 className="animate-spin" size={19} /> Verifying order</> : <>View order status <ArrowRight size={19} /></>}
              </button>
            </form>

            {error && <p role="alert" className="mt-5 border border-[#e8b4b4] bg-[#fff4f4] p-4 text-sm text-[#a52b2b]">{error}</p>}
            <p className="mt-7 flex items-start gap-2 text-xs leading-relaxed text-[#718397]"><LockKeyhole size={15} className="shrink-0 mt-0.5" /> Your contact detail is used only to verify this order and is never shown on this page.</p>
            <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm font-bold">
              <Link href="/login" className="text-[#2374ad]">Have an account? Sign in</Link>
              <Link href={`/signup${reference ? `?claim=${encodeURIComponent(reference)}` : ""}`} className="text-[#0d1b2a]">Create an account</Link>
            </div>
          </div>

          <div className="p-7 sm:p-10 lg:p-12 bg-[#0d1b2a] text-white min-h-[560px]">
            {!result ? (
              <div className="h-full flex flex-col">
                <div>
                  <p className="text-[11px] font-black tracking-[0.18em] text-[#7cb5e4]">YOUR PRODUCTION VIEW</p>
                  <h2 className="text-3xl sm:text-4xl font-black mt-3 max-w-xl" style={{ fontFamily: "'Space Grotesk', sans-serif", letterSpacing: 0 }}>One status view from artwork approval to delivery.</h2>
                </div>

                <div className="mt-8 border border-[#38536a] bg-[#102438]">
                  <div className="px-5 py-4 flex flex-wrap items-center justify-between gap-3 border-b border-[#38536a]">
                    <div><span className="block text-[9px] font-black tracking-[0.16em] text-[#718da4] mb-1">SAMPLE ORDER</span><strong className="font-mono text-[#e8a838]">PO-2026-10284</strong></div>
                    <span className="inline-flex items-center gap-2 text-[10px] font-black tracking-[0.12em] text-[#55d394]"><span className="w-2 h-2 bg-[#55d394] animate-pulse" /> LIVE UPDATE</span>
                  </div>

                  <div className="p-5 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                      <div><span className="block text-xs text-[#8fa4b5] mb-1">250g stand-up pouch</span><strong className="text-xl">10,000 units</strong></div>
                      <div className="sm:text-right"><span className="block text-[9px] tracking-[0.14em] text-[#718da4] mb-1">ESTIMATED DELIVERY</span><strong className="text-sm">28 Jul 2026</strong></div>
                    </div>

                    <div className="mt-8 grid grid-cols-[auto_1fr_auto_1fr_auto] items-center gap-2" aria-hidden="true">
                      <span className="w-8 h-8 grid place-items-center bg-[#2aa36b] text-[#071522]"><CircleCheck size={17} /></span><span className="h-0.5 bg-[#2aa36b]" /><span className="w-8 h-8 grid place-items-center border-2 border-[#e8a838] text-[#e8a838] relative"><Factory size={16} /><i className="absolute inset-[-6px] border border-[#e8a838]/40 animate-pulse" /></span><span className="h-0.5 bg-[#38536a]" /><span className="w-8 h-8 grid place-items-center border border-[#4b6377] text-[#718da4]"><Truck size={16} /></span>
                    </div>
                    <div className="mt-3 grid grid-cols-3 text-[10px] font-bold text-[#7890a4]"><span>Approved</span><span className="text-center text-[#e8a838]">In production</span><span className="text-right">Dispatch</span></div>
                  </div>

                  <div className="grid sm:grid-cols-3 border-t border-[#38536a]">
                    {[{ icon: Check, label: "Artwork", value: "Approved" }, { icon: Clock3, label: "Current step", value: "Printing" }, { icon: Truck, label: "Next update", value: "QC booked" }].map(({ icon: Icon, label, value }) => <div key={label} className="p-4 border-b last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0 border-[#38536a] flex items-center gap-3"><Icon size={17} className="text-[#55d394] shrink-0" /><div><span className="block text-[9px] tracking-[0.12em] text-[#718da4]">{label.toUpperCase()}</span><strong className="text-xs">{value}</strong></div></div>)}
                  </div>
                </div>

                <p className="mt-5 text-xs leading-relaxed text-[#8fa4b5]">Enter your reference to replace this sample with the verified status, delivery estimate, and courier link for your order.</p>
              </div>
            ) : (
              <div>
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-5 pb-8 border-b border-[#294257]">
                  <div><p className="text-[10px] font-black tracking-[0.18em] text-[#7cb5e4] mb-2">ORDER REFERENCE</p><h2 className="font-mono text-xl text-[#e8a838]">{result.reference}</h2></div>
                  <div className="sm:text-right"><p className="text-sm font-bold">{result.product_name}</p>{result.quantity && <span className="text-xs text-[#91a6b8]">{Number(result.quantity).toLocaleString("en-IN")} {result.quantity_unit}</span>}</div>
                </div>

                {isCancelled ? <div className="my-8 border border-[#8e4b4b] bg-[#321f25] p-5"><strong>Order cancelled</strong><p className="text-sm text-[#d8a9aa] mt-2">Please contact the order desk if you need help with this order.</p></div> : (
                  <div className="py-8">
                    {STAGES.map((stage, index) => {
                      const complete = index <= currentStage;
                      return <div key={stage.key} className="grid grid-cols-[38px_1fr] gap-4 pb-7 last:pb-0">
                        <div className={`w-8 h-8 grid place-items-center border ${complete ? "bg-[#2aa36b] border-[#2aa36b] text-[#071522]" : "border-[#496075] text-[#718397]"}`}>{complete ? <Check size={17} strokeWidth={3} /> : index + 1}</div>
                        <div className="pt-1"><h3 className={complete ? "font-bold text-white" : "font-bold text-[#718397]"}>{stage.title}</h3><p className="text-xs leading-relaxed mt-1 text-[#91a6b8]">{stage.detail}</p></div>
                      </div>;
                    })}
                  </div>
                )}

                <div className="grid sm:grid-cols-3 border border-[#294257]">
                  <div className="p-4 border-b sm:border-b-0 sm:border-r border-[#294257]"><span className="block text-[9px] tracking-[0.14em] text-[#718397] mb-1">STATUS</span><strong className="text-sm capitalize">{result.status.replace(/_/g, " ")}</strong></div>
                  <div className="p-4 border-b sm:border-b-0 sm:border-r border-[#294257]"><span className="block text-[9px] tracking-[0.14em] text-[#718397] mb-1">ESTIMATED DELIVERY</span><strong className="text-sm">{formatDate(result.estimated_delivery)}</strong></div>
                  <div className="p-4"><span className="block text-[9px] tracking-[0.14em] text-[#718397] mb-1">LAST UPDATED</span><strong className="text-sm">{formatDate(result.updated_at)}</strong></div>
                </div>

                {result.tracking_url && <a href={result.tracking_url} target="_blank" rel="noopener noreferrer" className="mt-6 min-h-13 px-5 bg-[#e8a838] text-[#071522] font-black inline-flex items-center gap-2">Open courier tracking <ExternalLink size={17} /></a>}
                {result.tracking_number && <p className="mt-3 text-xs text-[#91a6b8]">Courier reference: <span className="font-mono text-white">{result.tracking_number}</span></p>}
                <div className="mt-8 border-t border-[#294257] pt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div><strong className="text-sm">Keep this order in your Packworkz workspace</strong><p className="text-xs text-[#91a6b8] mt-1">See this order, its brief and future reorders after signing in.</p></div>
                  <Link href={`/signup?claim=${encodeURIComponent(result.reference)}`} className="shrink-0 min-h-11 px-4 bg-white text-[#0d1b2a] font-black text-sm inline-flex items-center justify-center gap-2">Create account <ArrowRight size={16} /></Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
