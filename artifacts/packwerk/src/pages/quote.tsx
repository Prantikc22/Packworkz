import { useState, useMemo, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import { useSubmitQuote } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { SKUS, CATEGORIES, SKU_IMAGES, getSkusByCategory } from "@/lib/skus";
import type { Sku, VariantGroup } from "@/lib/skus";
import { openRazorpay } from "@/lib/razorpay";
import {
  Loader2, CheckCircle2, ChevronDown, ChevronUp,
  Upload, Palette, X, Truck, Zap, Warehouse, ArrowRight, Shield, Package,
  Package2, Mail, Clock, Star
} from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────────
type ArtworkOption = "upload" | "design" | "none";
type DeliveryOption = "standard" | "blitz" | "warehouse";

// ── Step labels — now 5 steps (removed redundant artwork step) ─────────────
const STEP_LABELS = ["Contact", "Product & Qty", "Design & Delivery", "Sample", "Review"];
const TOTAL_STEPS = 5;

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
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <>SUBMIT REQUEST <ArrowRight className="w-4 h-4" /></>}
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
function StepHeader({ step, total, title, subtitle }: { step: number; total: number; title: string; subtitle?: string }) {
  return (
    <div className="flex items-start justify-between mb-8">
      <div>
        <div className="text-xs font-bold tracking-[0.2em] uppercase mb-2" style={{ color: "#1B6CA8" }}>
          STEP {String(step).padStart(2, "0")} OF {String(total).padStart(2, "0")}
        </div>
        <h1 className="text-4xl font-black text-slate-900" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          {title}
        </h1>
        {subtitle && <p className="text-slate-400 text-sm mt-2">{subtitle}</p>}
        <div className="h-1 w-16 mt-3 rounded" style={{ background: "#1B6CA8" }} />
      </div>
      <div className="text-right">
        <div className="text-xs text-slate-400 uppercase tracking-wider">Project ID</div>
        <div className="font-mono font-bold text-slate-700 text-sm mt-1">{PROJECT_ID}</div>
      </div>
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

// ── Animated Confirmation Screen ───────────────────────────────────────────
function ConfirmationScreen({ quoteId, email, designPaid, sampleOption, samplePaid }: {
  quoteId: string;
  email: string;
  designPaid: boolean;
  sampleOption: string;
  samplePaid: boolean;
}) {
  const [show, setShow] = useState(false);
  const [showItems, setShowItems] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setShow(true), 100);
    const t2 = setTimeout(() => setShowItems(true), 800);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  const needsAction = (sampleOption === "express" && !samplePaid);
  const designNeedsPayment = false; // design is paid inline before reaching here

  const items = [
    { icon: <Package2 className="w-5 h-5" />, label: "Quote received", sub: "Our engineers are reviewing your spec", color: "#22c55e" },
    { icon: <Mail className="w-5 h-5" />, label: "Confirmation email sent", sub: email ? `Sent to ${email}` : "Check your inbox", color: "#1B6CA8" },
    { icon: <Clock className="w-5 h-5" />, label: "Quote in 24–48 hours", sub: "Market-best pricing, guaranteed", color: "#E8A838" },
    ...(needsAction ? [{ icon: <Star className="w-5 h-5" />, label: "Action needed: Sample payment", sub: "Your express sample slot is held for 48 hrs", color: "#E8A838" }] : []),
  ];

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16" style={{ background: "#F8F9FC" }}>
      <div className="max-w-lg w-full">

        {/* Animated success circle */}
        <div className="flex justify-center mb-10">
          <div
            className="relative flex items-center justify-center"
            style={{
              width: 120, height: 120,
              transition: "all 0.6s cubic-bezier(0.34,1.56,0.64,1)",
              transform: show ? "scale(1)" : "scale(0)",
              opacity: show ? 1 : 0,
            }}
          >
            {/* Outer pulse ring */}
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background: "rgba(34,197,94,0.12)",
                animation: show ? "ping-slow 2s ease-in-out infinite" : "none",
              }}
            />
            {/* Inner circle */}
            <div
              className="absolute inset-3 rounded-full flex items-center justify-center"
              style={{ background: "rgba(34,197,94,0.15)" }}
            />
            {/* Check */}
            <CheckCircle2
              className="relative z-10"
              style={{ color: "#22c55e", width: 52, height: 52 }}
            />
          </div>
        </div>

        {/* Headline */}
        <div
          className="text-center mb-8"
          style={{
            transition: "all 0.5s ease",
            transform: show ? "translateY(0)" : "translateY(16px)",
            opacity: show ? 1 : 0,
            transitionDelay: "0.2s",
          }}
        >
          <div className="text-xs font-bold tracking-[0.2em] uppercase mb-3" style={{ color: "#1B6CA8" }}>
            Quote Submitted
          </div>
          <h1 className="text-4xl font-black mb-3" style={{ fontFamily: "'Space Grotesk', sans-serif", color: "#0D1B2A", lineHeight: 1.1 }}>
            Your packaging<br />is sorted. 🎉
          </h1>
          <p className="text-slate-500 text-base">
            We'll get back with the market's best quote in your email.
          </p>
        </div>

        {/* Quote ID chip */}
        <div
          className="flex justify-center mb-8"
          style={{
            transition: "all 0.5s ease",
            transform: show ? "translateY(0)" : "translateY(12px)",
            opacity: show ? 1 : 0,
            transitionDelay: "0.35s",
          }}
        >
          <div
            className="px-6 py-3 rounded-lg text-center"
            style={{ background: "#0D1B2A" }}
          >
            <div className="text-xs text-slate-500 uppercase tracking-widest mb-1">Your Quote ID</div>
            <div className="font-mono font-black text-xl" style={{ color: "#E8A838" }}>{quoteId}</div>
          </div>
        </div>

        {/* Status items */}
        <div className="space-y-3 mb-8">
          {items.map((item, i) => (
            <div
              key={i}
              className="flex items-start gap-4 p-4 rounded-lg bg-white border border-slate-100"
              style={{
                transition: "all 0.4s ease",
                transform: showItems ? "translateX(0)" : "translateX(-20px)",
                opacity: showItems ? 1 : 0,
                transitionDelay: `${i * 0.1}s`,
              }}
            >
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: `${item.color}18`, color: item.color }}
              >
                {item.icon}
              </div>
              <div>
                <div className="font-bold text-slate-800 text-sm">{item.label}</div>
                <div className="text-xs text-slate-400 mt-0.5">{item.sub}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Payment notices */}
        {needsAction && (
          <div
            className="p-4 rounded-lg mb-6"
            style={{
              background: "rgba(232,168,56,0.08)", border: "1px solid rgba(232,168,56,0.3)",
              transition: "all 0.4s ease",
              opacity: showItems ? 1 : 0,
              transitionDelay: "0.5s",
            }}
          >
            <p className="text-sm font-bold mb-1" style={{ color: "#92600A" }}>⚡ Express sample slot held — payment required</p>
            <p className="text-xs text-slate-500">Your express sample slot is reserved for 48 hours. Pay ₹4,999 to confirm it, or it will be released automatically.</p>
          </div>
        )}

        {/* CTA buttons */}
        <div
          className="flex gap-3"
          style={{
            transition: "all 0.5s ease",
            opacity: showItems ? 1 : 0,
            transitionDelay: "0.6s",
          }}
        >
          <Link href="/dashboard" className="flex-1">
            <button className="w-full py-3 rounded-lg font-black text-sm text-white uppercase tracking-wider transition-all hover:opacity-90" style={{ background: "#0D1B2A" }}>
              Go to Dashboard
            </button>
          </Link>
          <Link href="/products" className="flex-1">
            <button className="w-full py-3 rounded-lg font-bold text-sm border border-slate-200 text-slate-700 hover:border-slate-400 transition-colors">
              Browse SKUs
            </button>
          </Link>
        </div>

      </div>

      {/* CSS for ping animation */}
      <style>{`
        @keyframes ping-slow {
          0%, 100% { transform: scale(1); opacity: 0.7; }
          50% { transform: scale(1.18); opacity: 0.3; }
        }
      `}</style>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// Main Quote Component
// ══════════════════════════════════════════════════════════════════════════════
export default function Quote({ params }: { params?: { step?: string; id?: string } }) {
  const stepNum = params?.step ? parseInt(params.step) : params?.id ? 99 : 1;
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

  // ── Artwork / Design ─────────────────────────────────────────────────────
  const [artworkOption, setArtworkOption] = useState<ArtworkOption>("upload");
  const [designPaid, setDesignPaid] = useState(false);
  const [designPaying, setDesignPaying] = useState(false);

  // ── Delivery ─────────────────────────────────────────────────────────────
  const [deliveryOption, setDeliveryOption] = useState<DeliveryOption>("standard");
  const [pincode, setPincode] = useState("");

  // ── Sample ───────────────────────────────────────────────────────────────
  const [sampleOption, setSampleOption] = useState<"express" | "standard" | "none">("none");
  const [samplePaid, setSamplePaid] = useState(false);
  const [notes, setNotes] = useState("");

  const submitMutation = useSubmitQuote();

  const handleNext = () => setLocation(`/quote/step/${stepNum + 1}`);
  const handleBack = () => stepNum > 1 ? setLocation(`/quote/step/${stepNum - 1}`) : setLocation("/");

  const currentCatSkus = useMemo(() =>
    getSkusByCategory(selectedCategory).filter(s => ecoFilter ? s.is_eco : true),
    [selectedCategory, ecoFilter]
  );

  const selectedSku = useMemo(() => SKUS.find(s => s.id === selectedSkuId), [selectedSkuId]);

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
    const { low, high } = calcPrice(selectedSku, qty, deliveryOption, artworkOption);
    submitMutation.mutate({
      data: {
        contact_name: contactName, company_name: company, email, phone,
        delivery_country: "India", delivery_pincode: pincode,
        preferred_timeline: (deliveryOption as any),
        notes,
        total_estimated_min: low,
        total_estimated_max: high,
        items: [{
          product_id: selectedSkuId,
          product_name: selectedSku?.name || selectedSkuId,
          quantity: qty, artwork_status: artworkOption,
          sample_requested: sampleOption !== "none", sample_tier: sampleOption === "express" ? "premium" : sampleOption === "standard" ? "standard" : "none"
        }],
        artwork_option: artworkOption,
        sample_option: sampleOption,
        design_paid: designPaid,
        sample_paid: samplePaid,
      } as any
    }, {
      onSuccess: (res) => {
        setLocation(`/quote/confirmed/${res.quote_id}`);
      },
      onError: () => toast({ variant: "destructive", title: "Submission Failed", description: "Please try again." })
    });
  };

  // ── Confirmed screen ──────────────────────────────────────────────────────
  if (params?.id) {
    return (
      <ConfirmationScreen
        quoteId={params.id}
        email={email}
        designPaid={designPaid}
        sampleOption={sampleOption}
        samplePaid={samplePaid}
      />
    );
  }

  const isLastStep = stepNum === TOTAL_STEPS;

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

            {/* ── STEP 1: Contact Info ── */}
            {stepNum === 1 && (
              <>
                <StepHeader step={1} total={TOTAL_STEPS} title="Contact Info" subtitle="Tell us who you are — takes 30 seconds." />
                <div className="bg-white rounded-lg border border-slate-200 p-6">
                  <div className="grid md:grid-cols-2 gap-5">
                    {[
                      { label: "Contact Name", value: contactName, set: setContactName, type: "text", placeholder: "Rahul Sharma" },
                      { label: "Company Name", value: company, set: setCompany, type: "text", placeholder: "Acme Foods Pvt. Ltd." },
                      { label: "Business Email", value: email, set: setEmail, type: "email", placeholder: "rahul@acmefoods.in" },
                      { label: "Phone / WhatsApp", value: phone, set: setPhone, type: "tel", placeholder: "+91 98765 43210" },
                    ].map(({ label, value, set, type, placeholder }) => (
                      <div key={label}>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">{label}</label>
                        <input type={type} value={value} onChange={e => set(e.target.value)} placeholder={placeholder}
                          className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-400 transition-colors bg-slate-50 focus:bg-white" />
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* ── STEP 2: Product & Quantity ── */}
            {stepNum === 2 && (
              <>
                <StepHeader step={2} total={TOTAL_STEPS} title="Product & Quantity" subtitle="Choose your packaging format and how many you need." />

                {/* Category grid */}
                <div className="bg-white rounded-lg border border-slate-200 p-5">
                  <div className="flex justify-between items-center mb-4">
                    <span className="font-bold text-slate-800 text-sm" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Product Category</span>
                    <div className="flex gap-2">
                      <button onClick={() => setEcoFilter(false)}
                        className="px-3 py-1 rounded-full text-xs font-bold transition-all"
                        style={{ background: !ecoFilter ? "#0D1B2A" : "#F1F5F9", color: !ecoFilter ? "white" : "#64748B" }}>All</button>
                      <button onClick={() => setEcoFilter(true)}
                        className="px-3 py-1 rounded-full text-xs font-bold transition-all"
                        style={{ background: ecoFilter ? "#16A34A" : "#F1F5F9", color: ecoFilter ? "white" : "#64748B" }}>🌿 Eco</button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {CATEGORIES.map(cat => (
                      <button key={cat.slug}
                        onClick={() => handleSelectCategory(cat.slug)}
                        className="flex flex-col items-center gap-1.5 p-3 rounded-lg border-2 transition-all"
                        style={{ borderColor: selectedCategory === cat.slug ? "#1B6CA8" : "#E2E8F0", background: selectedCategory === cat.slug ? "rgba(27,108,168,0.06)" : "white" }}
                      >
                        <MS icon={cat.icon} className={`text-2xl ${selectedCategory === cat.slug ? "" : "text-slate-400"}`}
                          style={{ color: selectedCategory === cat.slug ? "#1B6CA8" : undefined } as any} />
                        <span className="text-xs font-bold text-center leading-tight" style={{ color: selectedCategory === cat.slug ? "#1B6CA8" : "#64748B" }}>
                          {cat.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* SKU cards */}
                <div className="bg-white rounded-lg border border-slate-200 p-5">
                  <div className="font-bold text-slate-800 text-sm mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    Select Template — <span className="font-normal text-slate-400">{CATEGORIES.find(c => c.slug === selectedCategory)?.label}</span>
                  </div>
                  {currentCatSkus.length === 0 ? (
                    <p className="text-sm text-slate-400 py-4 text-center">No eco-friendly SKUs in this category.</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {currentCatSkus.map(sku => (
                        <button key={sku.id} onClick={() => handleSelectSku(sku.id)}
                          className="flex items-start gap-3 p-4 rounded-lg border-2 text-left transition-all"
                          style={{ borderColor: selectedSkuId === sku.id ? "#1B6CA8" : "#E2E8F0", background: selectedSkuId === sku.id ? "rgba(27,108,168,0.04)" : "white" }}
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

                {/* Variant selectors */}
                {selectedSku && selectedSku.variants.length > 0 && (
                  <div className="bg-white rounded-lg border border-slate-200 p-5">
                    <div className="font-bold text-slate-800 text-sm mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                      Configure — {selectedSku.name}
                    </div>
                    <div className="space-y-4">
                      {selectedSku.variants.map(group => (
                        <VariantSelector key={group.key} group={group}
                          selected={variantSelections[group.key] || group.options[0]}
                          onSelect={v => setVariantSelections(prev => ({ ...prev, [group.key]: v }))} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Quantity selector */}
                <div className="bg-white rounded-lg border border-slate-200 p-5">
                  <div className="font-bold text-slate-800 text-sm mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    Quantity
                  </div>
                  <div className="space-y-3">
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
                    {selectedSku && <p className="text-xs text-slate-400">Min order: {selectedSku.moq.toLocaleString()} {selectedSku.moq_unit}</p>}
                  </div>
                </div>
              </>
            )}

            {/* ── STEP 3: Design & Delivery (consolidated) ── */}
            {stepNum === 3 && (
              <>
                <StepHeader step={3} total={TOTAL_STEPS} title="Design & Delivery" subtitle="How should we print it, and how fast do you need it?" />

                {/* Artwork section */}
                <div className="bg-white rounded-lg border border-slate-200 p-6">
                  <div className="font-bold text-slate-800 text-sm mb-1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Artwork / Branding</div>
                  <div className="text-xs text-slate-400 mb-5">How will your packaging be printed?</div>
                  <div className="grid grid-cols-3 gap-4">
                    {([
                      { id: "upload" as ArtworkOption, icon: <Upload className="w-8 h-8" />, label: "Upload My File", sub: "PDF, AI, SVG — ready to print", badge: null },
                      { id: "design" as ArtworkOption, icon: <Palette className="w-8 h-8" />, label: "Design It For Me", sub: "Expert design + dieline", badge: "+₹1,999" },
                      { id: "none" as ArtworkOption, icon: <X className="w-8 h-8" />, label: "Plain / Unprinted", sub: "No artwork needed", badge: null },
                    ]).map(opt => (
                      <button key={opt.id} onClick={() => setArtworkOption(opt.id)}
                        className="relative flex flex-col items-center gap-3 p-5 rounded-lg border-2 transition-all"
                        style={{ borderColor: artworkOption === opt.id ? "#1B6CA8" : "#E2E8F0", background: artworkOption === opt.id ? "rgba(27,108,168,0.06)" : "white", color: artworkOption === opt.id ? "#1B6CA8" : "#94A3B8" }}>
                        {opt.badge && (
                          <span className="absolute -top-2 -right-2 text-xs font-black px-2 py-0.5 rounded" style={{ background: "#E8A838", color: "#0D1B2A" }}>{opt.badge}</span>
                        )}
                        {opt.icon}
                        <div className="text-center">
                          <div className="font-bold text-sm" style={{ color: artworkOption === opt.id ? "#1B6CA8" : "#374151" }}>{opt.label}</div>
                          <div className="text-xs text-slate-400 mt-0.5">{opt.sub}</div>
                        </div>
                      </button>
                    ))}
                  </div>

                  {artworkOption === "upload" && (
                    <div className="mt-5 border-2 border-dashed border-slate-200 rounded-lg p-8 text-center cursor-pointer hover:border-blue-300 transition-colors">
                      <Upload className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                      <div className="text-sm font-bold text-slate-400">Drop files here or click to upload</div>
                      <div className="text-xs text-slate-300 mt-1">PDF, AI, SVG — max 50MB per file</div>
                    </div>
                  )}

                  {artworkOption === "design" && (
                    <div className="mt-5 p-5 rounded-lg" style={{ background: "rgba(27,108,168,0.05)", border: "1px solid rgba(27,108,168,0.15)" }}>
                      {designPaid ? (
                        <div className="flex items-center gap-3">
                          <CheckCircle2 className="w-6 h-6 shrink-0" style={{ color: "#16a34a" }} />
                          <div>
                            <div className="font-bold text-sm" style={{ color: "#16a34a" }}>Design fee paid — ₹1,999 ✓</div>
                            <div className="text-xs text-slate-500 mt-0.5">Our design team will reach out within 24 hours.</div>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <p className="text-sm font-bold" style={{ color: "#1B6CA8" }}>Design Service — ₹1,999</p>
                              <p className="text-xs text-slate-500 mt-0.5">Print-ready dieline + artwork in 5 business days. Fee adjusted against production order.</p>
                            </div>
                          </div>
                          <button
                            disabled={designPaying}
                            onClick={async () => {
                              setDesignPaying(true);
                              try {
                                await openRazorpay({ amount: 199900, description: "Packaging Design Service", notes: { service: "design" }, onSuccess: () => setDesignPaid(true), onDismiss: () => setDesignPaying(false) });
                              } catch { setDesignPaying(false); }
                            }}
                            className="px-6 py-2.5 rounded text-sm font-bold transition-all hover:opacity-90 active:scale-95 flex items-center gap-2"
                            style={{ background: "#1B6CA8", color: "white" }}>
                            {designPaying ? <><Loader2 className="w-4 h-4 animate-spin" /> Opening payment…</> : "Pay ₹1,999 to Book Design"}
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Delivery section */}
                <div className="bg-white rounded-lg border border-slate-200 p-5">
                  <div className="font-bold text-slate-800 text-sm mb-1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Delivery</div>
                  <div className="text-xs text-slate-400 mb-5">How fast do you need it?</div>
                  <div className="grid grid-cols-3 gap-4 mb-5">
                    {([
                      { id: "standard" as DeliveryOption, icon: <Truck className="w-7 h-7" />, label: "Standard Pro", time: `${selectedSku?.delivery_days_india || 12}–${(selectedSku?.delivery_days_india || 12) + 2} Days`, price: "Free", recommended: true },
                      { id: "blitz" as DeliveryOption, icon: <Zap className="w-7 h-7" />, label: "Blitz Logistics", time: "5–7 Days", price: "+₹240" },
                      { id: "warehouse" as DeliveryOption, icon: <Warehouse className="w-7 h-7" />, label: "Warehouse Hold", time: "Up to 30 days", price: "₹15/mo" },
                    ]).map(opt => (
                      <button key={opt.id} onClick={() => setDeliveryOption(opt.id)}
                        className="relative flex flex-col items-start gap-2 p-4 rounded-lg border-2 text-left transition-all"
                        style={{ borderColor: deliveryOption === opt.id ? "#1B6CA8" : "#E2E8F0", background: deliveryOption === opt.id ? "rgba(27,108,168,0.04)" : "white" }}>
                        {opt.recommended && <span className="absolute -top-2.5 left-3 px-2 py-0.5 rounded text-xs font-black" style={{ background: "#1B6CA8", color: "white" }}>RECOMMENDED</span>}
                        <div style={{ color: deliveryOption === opt.id ? "#1B6CA8" : "#94A3B8" }}>{opt.icon}</div>
                        <div>
                          <div className="font-bold text-sm text-slate-800">{opt.label}</div>
                          <div className="text-xs text-slate-400 mt-0.5">{opt.time}</div>
                        </div>
                        <div className="font-black text-sm" style={{ color: "#374151", fontFamily: "'Manrope', sans-serif" }}>{opt.price}</div>
                      </button>
                    ))}
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Delivery Pincode</label>
                    <input type="text" value={pincode} onChange={e => setPincode(e.target.value)}
                      className="w-full max-w-xs border border-slate-200 rounded-lg px-4 py-2.5 text-sm bg-slate-50 focus:outline-none focus:border-blue-400" placeholder="e.g. 400001" />
                  </div>
                </div>
              </>
            )}

            {/* ── STEP 4: Sample ── */}
            {stepNum === 4 && (
              <>
                <StepHeader step={4} total={TOTAL_STEPS} title="Sample Request" subtitle="Get a physical sample before bulk production." />
                <div className="bg-white rounded-lg border border-slate-200 p-6">
                  <p className="text-sm text-slate-500 mb-6">Sampling fee is fully adjusted against your production order. No extra charge.</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Card A: Express */}
                    <div
                      className="p-5 rounded-xl border-2 cursor-pointer transition-all"
                      style={{ borderColor: sampleOption === "express" ? "#E8A838" : "#E2E8F0", background: sampleOption === "express" ? "rgba(232,168,56,0.04)" : "white" }}
                      onClick={() => setSampleOption("express")}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <span className="text-xs font-black uppercase tracking-wider px-2 py-1 rounded" style={{ background: "#E8A838", color: "#0D1B2A" }}>EXPRESS</span>
                        {sampleOption === "express" && <CheckCircle2 className="w-5 h-5" style={{ color: "#E8A838" }} />}
                      </div>
                      <p className="font-black text-slate-800 mb-1">Express Sample Kit</p>
                      <p className="font-black text-lg mb-3" style={{ color: "#E8A838" }}>₹4,999</p>
                      <ul className="space-y-1 mb-4">
                        {["3–5 samples", "Priority manufacturing", "5-day delivery", "Full print + structure test"].map(f => (
                          <li key={f} className="text-xs text-slate-500 flex items-center gap-1.5"><span style={{ color: "#E8A838" }}>✓</span> {f}</li>
                        ))}
                      </ul>
                      {sampleOption === "express" && (
                        samplePaid ? (
                          <div className="flex items-center gap-2 text-xs font-bold" style={{ color: "#16a34a" }}>
                            <CheckCircle2 className="w-4 h-4" /> Express slot confirmed ✓
                          </div>
                        ) : (
                          <button
                            onClick={async (e) => {
                              e.stopPropagation();
                              try {
                                await openRazorpay({ amount: 499900, description: "Express Sample Kit", notes: { service: "sample_express" }, onSuccess: () => setSamplePaid(true), onDismiss: () => {} });
                              } catch {}
                            }}
                            className="w-full py-2.5 rounded-lg text-sm font-bold transition-all hover:brightness-110"
                            style={{ background: "#E8A838", color: "#0D1B2A" }}>
                            Pay ₹4,999 — Book Express Slot
                          </button>
                        )
                      )}
                    </div>

                    {/* Card B: Standard */}
                    <div
                      className="p-5 rounded-xl border-2 cursor-pointer transition-all"
                      style={{ borderColor: sampleOption === "standard" ? "#1B6CA8" : "#E2E8F0", background: sampleOption === "standard" ? "rgba(27,108,168,0.04)" : "white" }}
                      onClick={() => setSampleOption("standard")}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <span className="text-xs font-black uppercase tracking-wider px-2 py-1 rounded" style={{ background: "rgba(27,108,168,0.12)", color: "#1B6CA8" }}>STANDARD</span>
                        {sampleOption === "standard" && <CheckCircle2 className="w-5 h-5" style={{ color: "#1B6CA8" }} />}
                      </div>
                      <p className="font-black text-slate-800 mb-1">Standard Sample</p>
                      <p className="font-black text-lg mb-3" style={{ color: "#1B6CA8" }}>₹2,999</p>
                      <ul className="space-y-1 mb-4">
                        {["1–2 samples", "Standard manufacturing", "10-day delivery", "Basic spec verification"].map(f => (
                          <li key={f} className="text-xs text-slate-500 flex items-center gap-1.5"><span style={{ color: "#1B6CA8" }}>✓</span> {f}</li>
                        ))}
                      </ul>
                      <p className="text-xs text-slate-400">Fee adjusted against production order.</p>
                    </div>

                    {/* Card C: Skip */}
                    <div
                      className="p-5 rounded-xl border-2 cursor-pointer transition-all"
                      style={{ borderColor: sampleOption === "none" ? "#94A3B8" : "#E2E8F0", background: sampleOption === "none" ? "rgba(148,163,184,0.06)" : "white" }}
                      onClick={() => setSampleOption("none")}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <span className="text-xs font-black uppercase tracking-wider px-2 py-1 rounded" style={{ background: "rgba(148,163,184,0.15)", color: "#64748B" }}>SKIP</span>
                        {sampleOption === "none" && <CheckCircle2 className="w-5 h-5" style={{ color: "#94A3B8" }} />}
                      </div>
                      <p className="font-black text-slate-800 mb-1">Skip for Now</p>
                      <p className="font-black text-lg mb-3 text-slate-400">Free</p>
                      <p className="text-xs text-slate-500">Go straight to bulk production. You can request a sample later from your dashboard.</p>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* ── STEP 5: Review ── */}
            {stepNum === 5 && (
              <>
                <StepHeader step={5} total={TOTAL_STEPS} title="Review & Submit" subtitle="Double-check everything before we get started." />
                <div className="bg-white rounded-lg border border-slate-200 p-6 space-y-5">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Additional Notes / Special Requirements</label>
                    <textarea value={notes} onChange={e => setNotes(e.target.value)}
                      className="w-full border border-slate-200 rounded-lg px-4 py-3 text-sm bg-slate-50 focus:outline-none focus:border-blue-400 h-28 resize-none"
                      placeholder="Any special certifications, sustainability preferences, or customisations…" />
                  </div>
                  <div className="rounded-lg p-5 border" style={{ background: "#0F1C2C", borderColor: "rgba(255,255,255,0.08)" }}>
                    <div className="text-xs font-bold uppercase tracking-wider mb-4" style={{ color: "#1B6CA8" }}>Configuration Summary</div>
                    <div className="space-y-2">
                      {[
                        ["Company", company || "—"],
                        ["Contact", contactName || "—"],
                        ["Email", email || "—"],
                        ["Phone", phone || "—"],
                        ["Category", CATEGORIES.find(c => c.slug === selectedCategory)?.label || selectedCategory],
                        ["SKU", selectedSku?.name || "—"],
                        ["SKU Code", selectedSku?.code || "—"],
                        ["Quantity", `${qty.toLocaleString()} ${selectedSku?.moq_unit || "units"}`],
                        ...Object.entries(variantSelections).map(([k, v]) => {
                          const group = selectedSku?.variants.find(g => g.key === k);
                          return [group?.label || k, v];
                        }),
                        ["Artwork", artworkOption === "upload" ? "Upload ready-to-print file" : artworkOption === "design" ? `Design Service — ₹1,999 ${designPaid ? "✓ Paid" : "(pending payment)"}` : "Plain / unprinted"],
                        ["Delivery", deliveryOption === "standard" ? "Standard Pro (Free)" : deliveryOption === "blitz" ? "Blitz Logistics (+₹240)" : "Warehouse Hold (₹15/mo)"],
                        ["Pincode", pincode || "—"],
                        ["Sample", sampleOption === "express" ? `Express Kit — ₹4,999 ${samplePaid ? "✓ Paid" : "(pending payment)"}` : sampleOption === "standard" ? "Standard — ₹2,999" : "Skipped"],
                      ].map(([k, v]) => (
                        <div key={String(k)} className="flex justify-between text-sm">
                          <span className="text-slate-400">{k}</span>
                          <span className="font-bold text-white text-right max-w-[60%] leading-snug">{v}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Pending payment notices */}
                  {(artworkOption === "design" && !designPaid) && (
                    <div className="p-4 rounded-lg text-sm" style={{ background: "rgba(232,168,56,0.08)", border: "1px solid rgba(232,168,56,0.3)" }}>
                      <span className="font-bold" style={{ color: "#92600A" }}>Design payment pending —</span>
                      <span className="text-slate-500"> you can pay now or we'll follow up before starting design.</span>
                    </div>
                  )}
                  {(sampleOption === "express" && !samplePaid) && (
                    <div className="p-4 rounded-lg text-sm" style={{ background: "rgba(232,168,56,0.08)", border: "1px solid rgba(232,168,56,0.3)" }}>
                      <span className="font-bold" style={{ color: "#92600A" }}>Express sample payment pending —</span>
                      <span className="text-slate-500"> your slot will be held for 48 hrs after submission.</span>
                    </div>
                  )}
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
