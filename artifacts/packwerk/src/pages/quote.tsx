import { useState, useMemo } from "react";
import { Link, useLocation } from "wouter";
import { useSubmitQuote } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { SKUS, CATEGORIES, SKU_IMAGES, getSkusByCategory } from "@/lib/skus";
import type { Sku, VariantGroup } from "@/lib/skus";
import {
  Loader2, CheckCircle2, ChevronDown, ChevronUp,
  Upload, Palette, X, Truck, Zap, Warehouse, ArrowRight, Shield, Package
} from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────────
type ArtworkOption = "upload" | "design" | "none";
type DeliveryOption = "standard" | "blitz" | "warehouse";

// ── Step labels ────────────────────────────────────────────────────────────
const STEP_LABELS = ["Contact Info", "SKU Selection", "Artwork", "Delivery", "Sample", "Review"];

// ── Stable session project ID ──────────────────────────────────────────────
const PROJECT_ID = `PX-${Math.floor(1000 + Math.random() * 9000)}-${["ALPHA","BETA","DELTA","GAMMA"][Math.floor(Math.random()*4)]}`;

// ── Price helpers ──────────────────────────────────────────────────────────
function calcPrice(sku: Sku | undefined, qty: number, delivery: DeliveryOption, artworkOption: ArtworkOption) {
  if (!sku) return { low: 0, high: 0, mat: 0, setup: 0, logistics: 0, artAdd: 0 };
  const scale = Math.max(0.5, Math.min(qty / 500, 8));
  const mat = parseFloat(String(sku.price_min)) * qty * scale * 0.001;
  const setup = parseFloat(String(sku.price_min)) * 30;
  const deliverySurcharge = delivery === "blitz" ? 240 : delivery === "warehouse" ? 15 : 0;
  const logistics = parseFloat(String(sku.price_min)) * 7 + deliverySurcharge;
  const artAdd = artworkOption === "design" ? 1999 : 0;
  const low = mat + setup + logistics + artAdd;
  const high = low * 1.1;
  return { low, high, mat, setup, logistics, artAdd };
}

function fmt(n: number) {
  return new Intl.NumberFormat("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
}

// ── Material-symbols icon shorthand ───────────────────────────────────────
const MS = ({ icon, className = "" }: { icon: string; className?: string }) => (
  <span className={`material-symbols-outlined ${className}`}>{icon}</span>
);

// ── Order Summary Sidebar ──────────────────────────────────────────────────
function OrderSummary({
  sku, qty, delivery, artworkOption, onSubmit, submitting
}: {
  sku: Sku | undefined; qty: number; delivery: DeliveryOption;
  artworkOption: ArtworkOption; onSubmit?: () => void; submitting?: boolean;
}) {
  const { low, high, mat, setup, logistics, artAdd } = calcPrice(sku, qty, delivery, artworkOption);

  return (
    <div className="rounded-lg overflow-hidden sticky top-24" style={{ background: "#0F1C2C", border: "1px solid rgba(255,255,255,0.08)" }}>
      <div className="px-6 py-5 border-b" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
        <div className="text-xs font-bold uppercase tracking-[0.18em] text-white">Order Summary</div>
      </div>
      <div className="px-6 py-5 space-y-4">
        <div className="flex justify-between items-start">
          <div>
            <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Product</div>
            <div className="text-white font-bold text-sm leading-snug">{sku?.name || "—"}</div>
            {sku && <div className="text-xs text-slate-500 mt-0.5 font-mono">{(sku as any).specs?.code || (sku as any).code || ""}</div>}
          </div>
          <div className="text-right">
            <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Qty</div>
            <div className="text-slate-300 font-mono text-sm">{qty.toLocaleString()}</div>
          </div>
        </div>

        {sku && (
          <div className="space-y-2 pt-2 border-t" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Material Cost</span>
              <span className="text-white font-medium" style={{ fontFamily: "'Manrope', sans-serif" }}>₹{fmt(mat)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Print Setup</span>
              <span className="text-white font-medium" style={{ fontFamily: "'Manrope', sans-serif" }}>₹{fmt(setup)}</span>
            </div>
            {artAdd > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Design Service</span>
                <span className="text-white font-medium" style={{ fontFamily: "'Manrope', sans-serif" }}>₹{fmt(artAdd)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Logistics</span>
              <span className="text-white font-medium" style={{ fontFamily: "'Manrope', sans-serif" }}>₹{fmt(logistics)}</span>
            </div>
          </div>
        )}

        <div className="pt-3 border-t" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
          <div className="text-xs text-slate-500 uppercase tracking-wider mb-2">Estimated Range</div>
          {sku ? (
            <>
              <div className="font-black text-white leading-none" style={{ fontFamily: "'Manrope', sans-serif", fontSize: "clamp(1.2rem,2.2vw,1.6rem)" }}>
                ₹{fmt(low)} <span className="text-slate-400 font-bold text-base">–</span> ₹{fmt(high)}
              </div>
              <div className="text-xs text-slate-500 mt-1.5">Prices include GST. Final quote after artwork review.</div>
            </>
          ) : (
            <div className="text-slate-500 text-sm">Select a product to see estimate</div>
          )}
        </div>

        {onSubmit && sku && (
          <button
            onClick={onSubmit}
            disabled={submitting}
            className="w-full py-3 rounded font-black uppercase tracking-widest text-sm transition-all hover:opacity-90 active:scale-95 flex items-center justify-center gap-2 mt-2"
            style={{ background: "#E8A838", color: "#0F1C2C" }}
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <>REVIEW & SUBMIT <ArrowRight className="w-4 h-4" /></>}
          </button>
        )}

        <div className="flex items-start gap-2 pt-2">
          <Shield className="w-4 h-4 text-slate-500 mt-0.5 shrink-0" />
          <p className="text-xs text-slate-500">Verified by PackOps Quality Assurance. 100% Recyclable materials guaranteed.</p>
        </div>
      </div>
    </div>
  );
}

// ── Step Header ────────────────────────────────────────────────────────────
function StepHeader({ step, total, title }: { step: number; total: number; title: string }) {
  return (
    <div className="flex items-start justify-between mb-8">
      <div>
        <div className="text-xs font-bold tracking-[0.2em] uppercase mb-2" style={{ color: "#1B6CA8" }}>
          STEP {String(step).padStart(2, "0")} OF {String(total).padStart(2, "0")}
        </div>
        <h1 className="text-4xl font-black text-slate-900" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          {title}
        </h1>
        <div className="h-1 w-16 mt-3 rounded" style={{ background: "#1B6CA8" }} />
      </div>
      <div className="text-right">
        <div className="text-xs text-slate-400 uppercase tracking-wider">Project ID</div>
        <div className="font-mono font-bold text-slate-700 text-sm mt-1">{PROJECT_ID}</div>
      </div>
    </div>
  );
}

// ── Accordion ─────────────────────────────────────────────────────────────
function AccordionItem({ num, title, subtitle, open, onToggle, children }: {
  num: string; title: string; subtitle?: string; open: boolean; onToggle: () => void; children: React.ReactNode;
}) {
  return (
    <div className="border border-slate-200 rounded-lg overflow-hidden">
      <button onClick={onToggle} className="w-full flex items-center justify-between px-5 py-4 bg-white hover:bg-slate-50 transition-colors">
        <div className="flex items-center gap-3">
          <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0" style={{ background: "#1B6CA8" }}>{num}</span>
          <div className="text-left">
            <div className="font-bold text-slate-800 text-sm">{title}</div>
            {subtitle && <div className="text-xs text-slate-400 mt-0.5">{subtitle}</div>}
          </div>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
      </button>
      {open && <div className="px-5 pb-5 pt-2 bg-white border-t border-slate-100">{children}</div>}
    </div>
  );
}

// ── Variant Selectors ──────────────────────────────────────────────────────
function VariantSelector({ group, selected, onSelect }: {
  group: VariantGroup; selected: string; onSelect: (v: string) => void;
}) {
  return (
    <div>
      <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">{group.label}</div>
      <div className="flex flex-wrap gap-2">
        {group.options.map(opt => (
          <button
            key={opt}
            onClick={() => onSelect(opt)}
            className="px-3 py-1.5 rounded-lg border text-xs font-bold transition-all"
            style={{
              borderColor: selected === opt ? "#1B6CA8" : "#E2E8F0",
              background: selected === opt ? "rgba(27,108,168,0.08)" : "white",
              color: selected === opt ? "#1B6CA8" : "#64748B"
            }}
          >{opt}</button>
        ))}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// Main Quote Component
// ══════════════════════════════════════════════════════════════════════════════
export default function Quote({ params }: { params?: { step?: string; id?: string } }) {
  const stepNum = params?.step ? parseInt(params.step) : params?.id ? 7 : 1;
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // ── Contact ──────────────────────────────────────────────────────────────
  const [contactName, setContactName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  // ── SKU selection ────────────────────────────────────────────────────────
  const [selectedCategory, setSelectedCategory] = useState(CATEGORIES[0].slug);
  const [ecoFilter, setEcoFilter] = useState(false);
  const [selectedSkuId, setSelectedSkuId] = useState(SKUS[0].id);
  const [qty, setQty] = useState(500);
  const [variantSelections, setVariantSelections] = useState<Record<string, string>>({});

  // ── Config ───────────────────────────────────────────────────────────────
  const [openAccordion, setOpenAccordion] = useState<string | null>("artwork");
  const [artworkOption, setArtworkOption] = useState<ArtworkOption>("upload");
  const [deliveryOption, setDeliveryOption] = useState<DeliveryOption>("standard");
  const [pincode, setPincode] = useState("");

  // ── Sample ───────────────────────────────────────────────────────────────
  const [sampleRequested, setSampleRequested] = useState(false);
  const [sampleTier, setSampleTier] = useState("standard");
  const [notes, setNotes] = useState("");

  const submitMutation = useSubmitQuote();

  const handleNext = () => setLocation(`/quote/step/${stepNum + 1}`);
  const handleBack = () => stepNum > 1 ? setLocation(`/quote/step/${stepNum - 1}`) : setLocation("/");

  // Derived data
  const currentCatSkus = useMemo(() =>
    getSkusByCategory(selectedCategory).filter(s => ecoFilter ? s.is_eco : true),
    [selectedCategory, ecoFilter]
  );

  const selectedSku = useMemo(() => SKUS.find(s => s.id === selectedSkuId), [selectedSkuId]);

  // Initialize variant selections when SKU changes
  const initVariants = (sku: Sku) => {
    const defaults: Record<string, string> = {};
    sku.variants.forEach(g => { defaults[g.key] = g.options[0]; });
    setVariantSelections(defaults);
  };

  const handleSelectSku = (skuId: string) => {
    setSelectedSkuId(skuId);
    const sku = SKUS.find(s => s.id === skuId);
    if (sku) initVariants(sku);
  };

  const handleSelectCategory = (slug: string) => {
    setSelectedCategory(slug);
    const first = getSkusByCategory(slug)[0];
    if (first) { setSelectedSkuId(first.id); initVariants(first); }
  };

  const handleSubmit = () => {
    submitMutation.mutate({
      data: {
        contact_name: contactName, company_name: company, email, phone,
        delivery_country: "India", delivery_pincode: pincode,
        preferred_timeline: deliveryOption, notes,
        items: [{
          product_id: selectedSkuId,
          product_name: selectedSku?.name || selectedSkuId,
          quantity: qty, artwork_status: artworkOption,
          sample_requested: sampleRequested, sample_tier: sampleTier
        }]
      }
    }, {
      onSuccess: (res) => {
        setLocation(`/quote/confirmed/${res.quote_id}`);
        toast({ title: "Quote Submitted", description: "We'll respond within 24 hours." });
      },
      onError: () => toast({ variant: "destructive", title: "Submission Failed", description: "Please try again." })
    });
  };

  // ── Confirmed screen ──────────────────────────────────────────────────────
  if (params?.id) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="max-w-lg w-full text-center">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{ background: "rgba(27,108,168,0.1)" }}>
            <CheckCircle2 className="w-10 h-10" style={{ color: "#1B6CA8" }} />
          </div>
          <div className="text-xs font-bold tracking-[0.2em] uppercase mb-3" style={{ color: "#1B6CA8" }}>Quote Confirmed</div>
          <h1 className="text-4xl font-black mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif", color: "#0D1B2A" }}>Request Received</h1>
          <p className="text-slate-500 mb-3">Your Quote ID is</p>
          <div className="font-mono font-black text-2xl mb-6" style={{ color: "#0D1B2A" }}>{params.id}</div>
          <p className="text-slate-500 mb-10">Our packaging engineers are reviewing your spec and will send a detailed quotation within 24–48 hours.</p>
          <div className="flex justify-center gap-4">
            <Link href="/dashboard"><button className="px-6 py-3 rounded font-bold text-sm text-white" style={{ background: "#0D1B2A" }}>Go to Dashboard</button></Link>
            <Link href="/products"><button className="px-6 py-3 rounded font-bold text-sm border border-slate-200 text-slate-700 hover:border-slate-400 transition-colors">Browse SKUs</button></Link>
          </div>
        </div>
      </div>
    );
  }

  const isLastStep = stepNum === 6;

  return (
    <div className="min-h-screen" style={{ background: "#F8F9FC", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* ── Progress strip ── */}
      <div className="bg-white border-b border-slate-100 px-8 py-3">
        <div className="max-w-6xl mx-auto flex items-center gap-0">
          {STEP_LABELS.map((label, i) => {
            const s = i + 1;
            const done = stepNum > s;
            const active = stepNum === s;
            return (
              <div key={s} className="flex items-center flex-1 last:flex-none">
                <div className="flex items-center gap-2 shrink-0">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black transition-all"
                    style={{ background: done ? "#1B6CA8" : active ? "#0D1B2A" : "#E2E8F0", color: done || active ? "white" : "#94A3B8" }}>
                    {done ? "✓" : s}
                  </div>
                  <span className="text-xs font-bold hidden sm:block" style={{ color: active ? "#0D1B2A" : done ? "#1B6CA8" : "#94A3B8" }}>{label}</span>
                </div>
                {i < STEP_LABELS.length - 1 && <div className="flex-1 h-px mx-3" style={{ background: done ? "#1B6CA8" : "#E2E8F0" }} />}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Content ── */}
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

          {/* ── Left panel ── */}
          <div className="lg:col-span-2 space-y-6">

            {/* ── STEP 1 ── */}
            {stepNum === 1 && (
              <>
                <StepHeader step={1} total={6} title="Contact Info" />
                <div className="bg-white rounded-lg border border-slate-200 p-6">
                  <div className="grid md:grid-cols-2 gap-5">
                    {[
                      { label: "Contact Name", value: contactName, set: setContactName, type: "text" },
                      { label: "Company Name", value: company, set: setCompany, type: "text" },
                      { label: "Business Email", value: email, set: setEmail, type: "email" },
                      { label: "Phone / WhatsApp", value: phone, set: setPhone, type: "tel" },
                    ].map(({ label, value, set, type }) => (
                      <div key={label}>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">{label}</label>
                        <input type={type} value={value} onChange={e => set(e.target.value)}
                          className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-400 transition-colors bg-slate-50 focus:bg-white" />
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* ── STEP 2: SKU Selection ── */}
            {stepNum === 2 && (
              <>
                <StepHeader step={2} total={6} title="SKU Selection" />

                {/* Category grid */}
                <div className="bg-white rounded-lg border border-slate-200 p-5">
                  <div className="flex justify-between items-center mb-4">
                    <span className="font-bold text-slate-800 text-sm" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Product Category</span>
                    <div className="flex gap-2">
                      <button onClick={() => setEcoFilter(false)}
                        className="px-3 py-1 rounded-full text-xs font-bold transition-all"
                        style={{ background: !ecoFilter ? "#0D1B2A" : "#F1F5F9", color: !ecoFilter ? "white" : "#64748B" }}>
                        All
                      </button>
                      <button onClick={() => setEcoFilter(true)}
                        className="px-3 py-1 rounded-full text-xs font-bold transition-all"
                        style={{ background: ecoFilter ? "#16A34A" : "#F1F5F9", color: ecoFilter ? "white" : "#64748B" }}>
                        Eco
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {CATEGORIES.map(cat => (
                      <button key={cat.slug}
                        onClick={() => handleSelectCategory(cat.slug)}
                        className="flex flex-col items-center gap-1.5 p-3 rounded-lg border-2 transition-all"
                        style={{
                          borderColor: selectedCategory === cat.slug ? "#1B6CA8" : "#E2E8F0",
                          background: selectedCategory === cat.slug ? "rgba(27,108,168,0.06)" : "white",
                        }}
                      >
                        <MS icon={cat.icon} className={`text-2xl ${selectedCategory === cat.slug ? "" : "text-slate-400"}`}
                          style={{ color: selectedCategory === cat.slug ? "#1B6CA8" : undefined } as any} />
                        <span className="text-xs font-bold text-center leading-tight"
                          style={{ color: selectedCategory === cat.slug ? "#1B6CA8" : "#64748B" }}>
                          {cat.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* SKU cards */}
                <div className="bg-white rounded-lg border border-slate-200 p-5">
                  <div className="font-bold text-slate-800 text-sm mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    Select Template SKU
                    <span className="ml-2 text-xs text-slate-400 font-normal">
                      {CATEGORIES.find(c => c.slug === selectedCategory)?.label}
                    </span>
                  </div>
                  {currentCatSkus.length === 0 ? (
                    <p className="text-sm text-slate-400 py-4 text-center">No eco-friendly SKUs in this category.</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {currentCatSkus.map(sku => (
                        <button key={sku.id} onClick={() => handleSelectSku(sku.id)}
                          className="flex items-start gap-3 p-4 rounded-lg border-2 text-left transition-all"
                          style={{
                            borderColor: selectedSkuId === sku.id ? "#1B6CA8" : "#E2E8F0",
                            background: selectedSkuId === sku.id ? "rgba(27,108,168,0.04)" : "white"
                          }}
                        >
                          <div className="w-14 h-14 rounded-lg bg-slate-100 shrink-0 overflow-hidden">
                            {SKU_IMAGES[sku.code] ? (
                              <img src={SKU_IMAGES[sku.code]} alt={sku.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Package className="w-6 h-6 text-slate-400" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className="font-black text-xs text-slate-400">{sku.code}</span>
                              {sku.is_eco && <span className="text-xs px-1.5 py-0.5 rounded font-bold" style={{ background: "rgba(22,163,74,0.1)", color: "#16A34A" }}>ECO</span>}
                              {sku.is_smartstock && <span className="text-xs px-1.5 py-0.5 rounded font-bold" style={{ background: "rgba(232,168,56,0.12)", color: "#E8A838" }}>SmartStock</span>}
                            </div>
                            <div className="font-bold text-slate-800 text-sm mb-0.5">{sku.name}</div>
                            <div className="text-xs text-slate-400 leading-snug line-clamp-2">{sku.description}</div>
                          </div>
                          {selectedSkuId === sku.id && (
                            <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0" style={{ background: "#1B6CA8" }}>
                              <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none"><path d="M10 3L5 8.5 2 5.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Variant selectors for selected SKU */}
                {selectedSku && selectedSku.variants.length > 0 && (
                  <div className="bg-white rounded-lg border border-slate-200 p-5">
                    <div className="font-bold text-slate-800 text-sm mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                      Configure Variants — {selectedSku.name}
                    </div>
                    <div className="space-y-4">
                      {selectedSku.variants.map(group => (
                        <VariantSelector
                          key={group.key}
                          group={group}
                          selected={variantSelections[group.key] || group.options[0]}
                          onSelect={v => setVariantSelections(prev => ({ ...prev, [group.key]: v }))}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Config accordion */}
                <div className="space-y-2">
                  <div className="font-bold text-slate-800 text-sm mb-3" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Configuration Details</div>

                  <AccordionItem num="01" title="Quantity"
                    subtitle={`${qty.toLocaleString()} ${selectedSku?.moq_unit || "units"}`}
                    open={openAccordion === "qty"} onToggle={() => setOpenAccordion(openAccordion === "qty" ? null : "qty")}>
                    <div className="space-y-3 mt-2">
                      <div className="flex gap-2 flex-wrap">
                        {[250, 500, 1000, 2500, 5000].map(q => (
                          <button key={q} onClick={() => setQty(q)}
                            className="px-4 py-2 rounded-lg border text-sm font-bold transition-all"
                            style={{ borderColor: qty === q ? "#1B6CA8" : "#E2E8F0", background: qty === q ? "rgba(27,108,168,0.08)" : "white", color: qty === q ? "#1B6CA8" : "#64748B" }}>
                            {q.toLocaleString()}
                          </button>
                        ))}
                        <input type="number" value={qty} onChange={e => setQty(Math.max(50, parseInt(e.target.value) || 500))}
                          className="w-28 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400 bg-slate-50" placeholder="Custom" />
                      </div>
                      {selectedSku && <p className="text-xs text-slate-400">Min order qty: {selectedSku.moq.toLocaleString()} {selectedSku.moq_unit}</p>}
                    </div>
                  </AccordionItem>

                  <AccordionItem num="02" title="Artwork & Branding" subtitle="Configure visual treatment"
                    open={openAccordion === "artwork"} onToggle={() => setOpenAccordion(openAccordion === "artwork" ? null : "artwork")}>
                    <div className="grid grid-cols-3 gap-3 mt-2">
                      {([
                        { id: "upload" as ArtworkOption, icon: <Upload className="w-6 h-6" />, label: "Upload Artwork", sub: "PDF, AI, SVG" },
                        { id: "design" as ArtworkOption, icon: <Palette className="w-6 h-6" />, label: "Need Design", sub: "+₹1,999" },
                        { id: "none" as ArtworkOption, icon: <X className="w-6 h-6" />, label: "No Artwork", sub: "Plain/unprinted" },
                      ]).map(opt => (
                        <button key={opt.id} onClick={() => setArtworkOption(opt.id)}
                          className="flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all"
                          style={{ borderColor: artworkOption === opt.id ? "#1B6CA8" : "#E2E8F0", background: artworkOption === opt.id ? "rgba(27,108,168,0.06)" : "white", color: artworkOption === opt.id ? "#1B6CA8" : "#94A3B8" }}>
                          {opt.icon}
                          <div className="text-center">
                            <div className="font-bold text-xs" style={{ color: artworkOption === opt.id ? "#1B6CA8" : "#374151" }}>{opt.label}</div>
                            <div className="text-xs text-slate-400">{opt.sub}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                    {artworkOption === "upload" && (
                      <div className="mt-4 border-2 border-dashed border-slate-200 rounded-lg p-6 text-center hover:border-blue-300 transition-colors cursor-pointer">
                        <Upload className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                        <div className="text-sm font-bold text-slate-400">Drop files here or click to upload</div>
                        <div className="text-xs text-slate-300 mt-1">PDF, AI, SVG — max 50MB</div>
                      </div>
                    )}
                    {artworkOption === "design" && (
                      <div className="mt-4 p-4 rounded-lg text-sm" style={{ background: "rgba(27,108,168,0.06)", border: "1px solid rgba(27,108,168,0.15)" }}>
                        <span className="font-bold" style={{ color: "#1B6CA8" }}>Design services: ₹1,999</span>
                        <span className="text-slate-500"> — Print-ready files in 5 business days, fully adjusted against production order.</span>
                      </div>
                    )}
                  </AccordionItem>

                  <AccordionItem num="03" title="Delivery Pincode" subtitle={pincode || "Enter delivery location"}
                    open={openAccordion === "delivery"} onToggle={() => setOpenAccordion(openAccordion === "delivery" ? null : "delivery")}>
                    <div className="mt-2">
                      <input type="text" value={pincode} onChange={e => setPincode(e.target.value)}
                        className="w-full max-w-xs border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400 bg-slate-50" placeholder="e.g. 400001" />
                    </div>
                  </AccordionItem>
                </div>

                {/* Delivery strategy */}
                <div className="bg-white rounded-lg border border-slate-200 p-5">
                  <div className="mb-4">
                    <div className="font-bold text-slate-800 text-sm mb-1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Delivery Strategy</div>
                    <div className="text-xs text-slate-400">All shipments are trackable via the Command Center.</div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {([
                      { id: "standard" as DeliveryOption, icon: <Truck className="w-6 h-6" />, label: "Standard Pro", time: `${selectedSku?.delivery_days_india || 12}–${(selectedSku?.delivery_days_india || 12) + 2} Days`, price: "Free", recommended: true },
                      { id: "blitz" as DeliveryOption, icon: <Zap className="w-6 h-6" />, label: "Blitz Logistics", time: "5–7 Days", price: "+₹240", recommended: false },
                      { id: "warehouse" as DeliveryOption, icon: <Warehouse className="w-6 h-6" />, label: "Warehouse Hold", time: "Up to 30 days", price: "₹15/mo", recommended: false },
                    ]).map(opt => (
                      <button key={opt.id} onClick={() => setDeliveryOption(opt.id)}
                        className="relative flex flex-col items-start gap-2 p-4 rounded-lg border-2 text-left transition-all"
                        style={{ borderColor: deliveryOption === opt.id ? "#1B6CA8" : "#E2E8F0", background: deliveryOption === opt.id ? "rgba(27,108,168,0.04)" : "white" }}>
                        {opt.recommended && <span className="absolute -top-2 left-3 px-2 py-0.5 rounded text-xs font-black" style={{ background: "#1B6CA8", color: "white" }}>RECOMMENDED</span>}
                        <div style={{ color: deliveryOption === opt.id ? "#1B6CA8" : "#94A3B8" }}>{opt.icon}</div>
                        <div>
                          <div className="font-bold text-sm text-slate-800">{opt.label}</div>
                          <div className="text-xs text-slate-400 mt-0.5">{opt.time}</div>
                        </div>
                        <div className="font-black text-sm mt-1" style={{ color: deliveryOption === opt.id ? "#1B6CA8" : "#374151", fontFamily: "'Manrope', sans-serif" }}>{opt.price}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* ── STEP 3: Artwork ── */}
            {stepNum === 3 && (
              <>
                <StepHeader step={3} total={6} title="Artwork" />
                <div className="bg-white rounded-lg border border-slate-200 p-6 space-y-4">
                  <div className="font-bold text-slate-700 mb-2">Artwork for <span style={{ color: "#1B6CA8" }}>{selectedSku?.name || "your product"}</span></div>
                  <div className="grid grid-cols-3 gap-4">
                    {([
                      { id: "upload" as ArtworkOption, icon: <Upload className="w-8 h-8" />, label: "Upload Artwork", sub: "PDF, AI, SVG" },
                      { id: "design" as ArtworkOption, icon: <Palette className="w-8 h-8" />, label: "Need Design", sub: "₹1,999 expert help" },
                      { id: "none" as ArtworkOption, icon: <X className="w-8 h-8" />, label: "No Artwork", sub: "Plain / unprinted" },
                    ]).map(opt => (
                      <button key={opt.id} onClick={() => setArtworkOption(opt.id)}
                        className="flex flex-col items-center gap-3 p-5 rounded-lg border-2 transition-all"
                        style={{ borderColor: artworkOption === opt.id ? "#1B6CA8" : "#E2E8F0", background: artworkOption === opt.id ? "rgba(27,108,168,0.06)" : "white", color: artworkOption === opt.id ? "#1B6CA8" : "#94A3B8" }}>
                        {opt.icon}
                        <div className="text-center">
                          <div className="font-bold text-sm" style={{ color: artworkOption === opt.id ? "#1B6CA8" : "#374151" }}>{opt.label}</div>
                          <div className="text-xs text-slate-400">{opt.sub}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                  {artworkOption === "upload" && (
                    <div className="border-2 border-dashed border-slate-200 rounded-lg p-8 text-center cursor-pointer hover:border-blue-300 transition-colors">
                      <Upload className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                      <div className="text-sm font-bold text-slate-400">Drop files here or click to upload</div>
                      <div className="text-xs text-slate-300 mt-1">PDF, AI, SVG — max 50MB per file</div>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* ── STEP 4: Delivery ── */}
            {stepNum === 4 && (
              <>
                <StepHeader step={4} total={6} title="Delivery" />
                <div className="bg-white rounded-lg border border-slate-200 p-6 space-y-6">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Delivery Pincode</label>
                    <input type="text" value={pincode} onChange={e => setPincode(e.target.value)}
                      className="w-full max-w-xs border border-slate-200 rounded-lg px-4 py-2.5 text-sm bg-slate-50 focus:outline-none focus:border-blue-400" placeholder="e.g. 400001" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-700 mb-3">Shipping Strategy</div>
                    <div className="grid grid-cols-3 gap-4">
                      {([
                        { id: "standard" as DeliveryOption, icon: <Truck className="w-7 h-7" />, label: "Standard Pro", time: `${selectedSku?.delivery_days_india || 12}–${(selectedSku?.delivery_days_india || 12) + 2} Days`, price: "Free", recommended: true },
                        { id: "blitz" as DeliveryOption, icon: <Zap className="w-7 h-7" />, label: "Blitz Logistics", time: "5–7 Days", price: "+₹240" },
                        { id: "warehouse" as DeliveryOption, icon: <Warehouse className="w-7 h-7" />, label: "Warehouse Hold", time: "Up to 30 days", price: "₹15/mo" },
                      ]).map(opt => (
                        <button key={opt.id} onClick={() => setDeliveryOption(opt.id)}
                          className="relative flex flex-col items-start gap-2 p-4 rounded-lg border-2 transition-all"
                          style={{ borderColor: deliveryOption === opt.id ? "#1B6CA8" : "#E2E8F0", background: deliveryOption === opt.id ? "rgba(27,108,168,0.04)" : "white" }}>
                          {opt.recommended && <span className="absolute -top-2.5 left-3 px-2 py-0.5 rounded text-xs font-black" style={{ background: "#1B6CA8", color: "white" }}>RECOMMENDED</span>}
                          <div style={{ color: deliveryOption === opt.id ? "#1B6CA8" : "#94A3B8" }}>{opt.icon}</div>
                          <div>
                            <div className="font-bold text-sm text-slate-800">{opt.label}</div>
                            <div className="text-xs text-slate-400">{opt.time}</div>
                          </div>
                          <div className="font-black text-sm" style={{ color: "#374151", fontFamily: "'Manrope', sans-serif" }}>{opt.price}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* ── STEP 5: Sample ── */}
            {stepNum === 5 && (
              <>
                <StepHeader step={5} total={6} title="Sample Request" />
                <div className="bg-white rounded-lg border border-slate-200 p-6 space-y-6">
                  <p className="text-sm text-slate-500">Get a physical sample before bulk production. Sampling fee fully adjusted against your production order.</p>
                  <div className="flex items-center gap-3">
                    <button onClick={() => setSampleRequested(!sampleRequested)}
                      className="w-6 h-6 rounded border-2 flex items-center justify-center transition-all shrink-0"
                      style={{ borderColor: sampleRequested ? "#1B6CA8" : "#CBD5E1", background: sampleRequested ? "#1B6CA8" : "white" }}>
                      {sampleRequested && <svg className="w-3.5 h-3.5" viewBox="0 0 12 12" fill="none"><path d="M10 3L5 8.5 2 5.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                    </button>
                    <span className="font-bold text-slate-800 text-sm">Yes, request a physical sample</span>
                  </div>
                  {sampleRequested && (
                    <div className="grid grid-cols-3 gap-4">
                      {([
                        { id: "standard", name: "Standard", price: "₹2,999", desc: "1–2 samples, basic spec verification" },
                        { id: "premium", name: "Premium", price: "₹4,999", desc: "3–5 samples, full print+structure test" },
                        { id: "complex", name: "Complex", price: "₹7,999", desc: "Full production run test, destructive testing" },
                      ]).map(tier => (
                        <button key={tier.id} onClick={() => setSampleTier(tier.id)}
                          className="p-4 rounded-lg border-2 text-left transition-all"
                          style={{ borderColor: sampleTier === tier.id ? "#1B6CA8" : "#E2E8F0", background: sampleTier === tier.id ? "rgba(27,108,168,0.04)" : "white" }}>
                          <div className="font-black text-sm text-slate-800 mb-1">{tier.name}</div>
                          <div className="font-black mb-2" style={{ fontFamily: "'Manrope', sans-serif", color: "#1B6CA8" }}>{tier.price}</div>
                          <div className="text-xs text-slate-400">{tier.desc}</div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}

            {/* ── STEP 6: Review ── */}
            {stepNum === 6 && (
              <>
                <StepHeader step={6} total={6} title="Review & Submit" />
                <div className="bg-white rounded-lg border border-slate-200 p-6 space-y-5">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Additional Notes / Special Requirements</label>
                    <textarea value={notes} onChange={e => setNotes(e.target.value)}
                      className="w-full border border-slate-200 rounded-lg px-4 py-3 text-sm bg-slate-50 focus:outline-none focus:border-blue-400 h-28 resize-none"
                      placeholder="Any special requirements, certifications, sustainability preferences..." />
                  </div>
                  <div className="rounded-lg p-5 border" style={{ background: "#0F1C2C", borderColor: "rgba(255,255,255,0.08)" }}>
                    <div className="text-xs font-bold uppercase tracking-wider mb-4" style={{ color: "#1B6CA8" }}>Configuration Summary</div>
                    <div className="space-y-2">
                      {[
                        ["Company", company || "—"],
                        ["Contact", contactName || "—"],
                        ["Email", email || "—"],
                        ["Category", CATEGORIES.find(c => c.slug === selectedCategory)?.label || selectedCategory],
                        ["SKU", selectedSku?.name || "—"],
                        ["SKU Code", selectedSku?.code || "—"],
                        ["Quantity", `${qty.toLocaleString()} ${selectedSku?.moq_unit || "units"}`],
                        ...Object.entries(variantSelections).map(([k, v]) => {
                          const group = selectedSku?.variants.find(g => g.key === k);
                          return [group?.label || k, v];
                        }),
                        ["Artwork", artworkOption === "upload" ? "Upload Ready" : artworkOption === "design" ? "Design Service (+₹1,999)" : "No Artwork"],
                        ["Delivery", deliveryOption === "standard" ? "Standard Pro (Free)" : deliveryOption === "blitz" ? "Blitz Logistics (+₹240)" : "Warehouse Hold (₹15/mo)"],
                        ["Sample", sampleRequested ? `Yes — ${sampleTier.charAt(0).toUpperCase() + sampleTier.slice(1)}` : "Not requested"],
                      ].map(([k, v]) => (
                        <div key={String(k)} className="flex justify-between text-sm">
                          <span className="text-slate-400">{k}</span>
                          <span className="font-bold text-white text-right max-w-[60%]">{v}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* ── Navigation ── */}
            <div className="flex justify-between pt-4">
              <button onClick={handleBack} className="px-6 py-2.5 rounded-lg border border-slate-200 text-sm font-bold text-slate-600 hover:border-slate-400 transition-colors">
                ← Back
              </button>
              {!isLastStep ? (
                <button onClick={handleNext} className="px-8 py-2.5 rounded-lg text-sm font-black uppercase tracking-wider text-white transition-all hover:opacity-90" style={{ background: "#0D1B2A" }}>
                  Continue →
                </button>
              ) : (
                <button onClick={handleSubmit} disabled={submitMutation.isPending}
                  className="px-8 py-2.5 rounded-lg text-sm font-black uppercase tracking-wider transition-all hover:opacity-90 flex items-center gap-2"
                  style={{ background: "#E8A838", color: "#0F1C2C" }}>
                  {submitMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Submit Request <ArrowRight className="w-4 h-4" /></>}
                </button>
              )}
            </div>
          </div>

          {/* ── Right: Order Summary ── */}
          <div className="lg:col-span-1">
            <OrderSummary
              sku={selectedSku}
              qty={qty}
              delivery={deliveryOption}
              artworkOption={artworkOption}
              onSubmit={isLastStep ? handleSubmit : undefined}
              submitting={submitMutation.isPending}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
