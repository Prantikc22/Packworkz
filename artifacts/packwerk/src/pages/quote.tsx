import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useSubmitQuote } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import {
  Loader2, CheckCircle2, ChevronDown, ChevronUp,
  Package, Mail, ShoppingBag, Layers, Upload, Palette, X,
  Truck, Zap, Warehouse, ArrowRight, Shield
} from "lucide-react";

// ── Types ───────────────────────────────────────────────────────────────────
type Category = { id: string; label: string; icon: React.ReactNode };
type SkuTemplate = { id: string; code: string; name: string; desc: string; eco?: boolean };
type ArtworkOption = "upload" | "design" | "none";
type DeliveryOption = "standard" | "blitz" | "warehouse";

// ── Static data ──────────────────────────────────────────────────────────────
const CATEGORIES: Category[] = [
  { id: "corrugated", label: "Corrugated Boxes", icon: <Package className="w-7 h-7" /> },
  { id: "mailers", label: "Mailers", icon: <Mail className="w-7 h-7" /> },
  { id: "paper_bags", label: "Paper Bags", icon: <ShoppingBag className="w-7 h-7" /> },
  { id: "inserts", label: "Inserts", icon: <Layers className="w-7 h-7" /> },
];

const SKU_TEMPLATES: Record<string, SkuTemplate[]> = {
  corrugated: [
    { id: "std-rsc", code: "#C-881", name: "Standard RSC", desc: "High-strength double-wall corrugated board." },
    { id: "die-cut", code: "#M-702", name: "Die-Cut Mailer", desc: "Tuck-top design for premium unboxing feel." },
    { id: "hd-box", code: "#C-944", name: "HD Shipping Box", desc: "5-ply heavy-duty for industrial freight.", eco: true },
    { id: "eco-box", code: "#C-112", name: "Recycled RSC", desc: "100% recycled fibre board.", eco: true },
  ],
  mailers: [
    { id: "poly-m", code: "#M-201", name: "Poly Mailer Bag", desc: "Lightweight courier bag, LDPE." },
    { id: "bubble-m", code: "#M-340", name: "Bubble Mailer", desc: "Built-in bubble cushioning layer." },
    { id: "eco-m", code: "#M-450", name: "Paper Mailer (Eco)", desc: "Kraft paper, fully compostable.", eco: true },
  ],
  paper_bags: [
    { id: "kraft-b", code: "#PB-101", name: "Kraft Carry Bag", desc: "Flat-bottom kraft with twisted handle." },
    { id: "luxury-b", code: "#PB-220", name: "Luxury Paper Bag", desc: "Hot-stamped with satin ribbon." },
  ],
  inserts: [
    { id: "foam-i", code: "#IN-330", name: "Foam Insert (Die-Cut)", desc: "Custom-cut EPE foam protection." },
    { id: "mould-i", code: "#IN-445", name: "Moulded Pulp Tray", desc: "Eco-friendly pulp moulded insert.", eco: true },
  ],
};

const PRICE_MAP: Record<string, { material: number; setup: number; logistics: number }> = {
  "std-rsc": { material: 1240, setup: 150, logistics: 85 },
  "die-cut": { material: 1640, setup: 180, logistics: 95 },
  "hd-box": { material: 1980, setup: 200, logistics: 110 },
  "eco-box": { material: 1120, setup: 130, logistics: 85 },
  "poly-m": { material: 480, setup: 80, logistics: 55 },
  "bubble-m": { material: 720, setup: 100, logistics: 65 },
  "eco-m": { material: 560, setup: 90, logistics: 55 },
  "kraft-b": { material: 680, setup: 120, logistics: 70 },
  "luxury-b": { material: 1440, setup: 220, logistics: 90 },
  "foam-i": { material: 860, setup: 140, logistics: 75 },
  "mould-i": { material: 740, setup: 110, logistics: 70 },
};

const DELIVERY_SURCHARGES: Record<DeliveryOption, number> = {
  standard: 0,
  blitz: 240,
  warehouse: 15,
};

const STEP_LABELS = [
  "Contact Info",
  "SKU Selection",
  "Artwork",
  "Delivery",
  "Sample",
  "Review",
];

// ── Generate stable project ID (session-scoped) ───────────────────────────────
const PROJECT_ID = `PX-${Math.floor(1000 + Math.random() * 9000)}-ALPHA`;
// Note: component-level const is fine since this module is only evaluated once per session

// ── Helpers ───────────────────────────────────────────────────────────────────
function fmt(n: number) {
  return new Intl.NumberFormat("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
}

// ── Order Summary Sidebar ─────────────────────────────────────────────────────
function OrderSummary({
  skuId, qty, delivery, artworkOption, onSubmit, submitting
}: {
  skuId: string; qty: number; delivery: DeliveryOption; artworkOption: ArtworkOption;
  onSubmit?: () => void; submitting?: boolean;
}) {
  const prices = PRICE_MAP[skuId] || { material: 0, setup: 0, logistics: 0 };
  const scaleQty = qty / 500;
  const mat = prices.material * Math.max(0.5, Math.min(scaleQty, 4));
  const setup = prices.setup;
  const log = prices.logistics + DELIVERY_SURCHARGES[delivery];
  const artAdd = artworkOption === "design" ? 1999 : 0;
  const low = mat + setup + log + artAdd;
  const high = low * 1.1;

  const allTemplates = Object.values(SKU_TEMPLATES).flat();
  const sku = allTemplates.find(s => s.id === skuId);

  return (
    <div className="rounded-lg overflow-hidden sticky top-24" style={{ background: "#0F1C2C", border: "1px solid rgba(255,255,255,0.08)" }}>
      <div className="px-6 py-5 border-b" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
        <h3 className="text-white font-bold text-sm uppercase tracking-[0.15em]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          Order Summary
        </h3>
      </div>
      <div className="px-6 py-5 space-y-4">
        <div className="flex justify-between items-start">
          <div>
            <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Product</div>
            <div className="text-white font-bold text-sm">{sku?.name || "—"}</div>
          </div>
          <div className="text-right">
            <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">&nbsp;</div>
            <div className="text-slate-300 font-mono text-sm">{qty.toLocaleString()}x</div>
          </div>
        </div>

        <div className="space-y-2 pt-2 border-t" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Material Cost</span>
            <span className="text-white font-medium" style={{ fontFamily: "'Manrope', sans-serif" }}>₹{fmt(mat)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Print Setup (1 Color)</span>
            <span className="text-white font-medium" style={{ fontFamily: "'Manrope', sans-serif" }}>₹{fmt(setup)}</span>
          </div>
          {artAdd > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Design Services</span>
              <span className="text-white font-medium" style={{ fontFamily: "'Manrope', sans-serif" }}>₹{fmt(artAdd)}</span>
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Logistics ({delivery === "blitz" ? "Express" : delivery === "warehouse" ? "Hold" : "Zone A"})</span>
            <span className="text-white font-medium" style={{ fontFamily: "'Manrope', sans-serif" }}>₹{fmt(log)}</span>
          </div>
        </div>

        <div className="pt-3 border-t" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
          <div className="text-xs text-slate-500 uppercase tracking-wider mb-2">Estimated Range</div>
          <div className="font-black text-white leading-none" style={{ fontFamily: "'Manrope', sans-serif", fontSize: "clamp(1.4rem,2.5vw,1.75rem)" }}>
            ₹{fmt(low)} <span className="text-slate-400 font-bold text-base">–</span> ₹{fmt(high)}
          </div>
          <div className="text-xs text-slate-500 mt-1">Final quote subject to artwork review and volume discounts. Prices include GST.</div>
        </div>

        {onSubmit && (
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

// ── Step Header ───────────────────────────────────────────────────────────────
function StepHeader({ step, total, title, projectId }: { step: number; total: number; title: string; projectId: string }) {
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
        <div className="font-mono font-bold text-slate-700 text-sm mt-1">{projectId}</div>
      </div>
    </div>
  );
}

// ── Accordion Item ────────────────────────────────────────────────────────────
function AccordionItem({ num, title, subtitle, open, onToggle, children }: {
  num: string; title: string; subtitle?: string; open: boolean; onToggle: () => void; children: React.ReactNode;
}) {
  return (
    <div className="border border-slate-200 rounded-lg overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-5 py-4 bg-white hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0" style={{ background: "#1B6CA8" }}>{num}</span>
          <div className="text-left">
            <div className="font-bold text-slate-800 text-sm" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{title}</div>
            {subtitle && <div className="text-xs text-slate-400 mt-0.5">{subtitle}</div>}
          </div>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
      </button>
      {open && (
        <div className="px-5 pb-5 pt-2 bg-white border-t border-slate-100">
          {children}
        </div>
      )}
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

  // ── Form state ──────────────────────────────────────────────────────────────
  const [contactName, setContactName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [selectedCategory, setSelectedCategory] = useState("corrugated");
  const [ecoFilter, setEcoFilter] = useState(false);
  const [selectedSku, setSelectedSku] = useState("std-rsc");
  const [qty, setQty] = useState(500);

  const [openAccordion, setOpenAccordion] = useState<string | null>("artwork");
  const [artworkOption, setArtworkOption] = useState<ArtworkOption>("upload");
  const [deliveryOption, setDeliveryOption] = useState<DeliveryOption>("standard");

  const [sampleRequested, setSampleRequested] = useState(false);
  const [sampleTier, setSampleTier] = useState("standard");
  const [notes, setNotes] = useState("");

  const submitMutation = useSubmitQuote();

  const handleNext = () => setLocation(`/quote/step/${stepNum + 1}`);
  const handleBack = () => stepNum > 1 ? setLocation(`/quote/step/${stepNum - 1}`) : setLocation("/");

  const handleSubmit = () => {
    submitMutation.mutate({
      data: {
        contact_name: contactName, company_name: company, email, phone,
        delivery_country: "India", delivery_pincode: "",
        preferred_timeline: deliveryOption, notes,
        items: [{ product_id: selectedSku, product_name: SKU_TEMPLATES[selectedCategory]?.find(s => s.id === selectedSku)?.name || selectedSku, quantity: qty, artwork_status: artworkOption, sample_requested: sampleRequested, sample_tier: sampleTier }]
      }
    }, {
      onSuccess: (res) => {
        setLocation(`/quote/confirmed/${res.quote_id}`);
        toast({ title: "Quote Submitted", description: "We'll respond within 24 hours." });
      },
      onError: () => {
        toast({ variant: "destructive", title: "Submission Failed", description: "Please try again." });
      }
    });
  };

  // ── Confirmed screen ────────────────────────────────────────────────────────
  if (params?.id) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="max-w-lg w-full text-center">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{ background: "rgba(27,108,168,0.1)" }}>
            <CheckCircle2 className="w-10 h-10" style={{ color: "#1B6CA8" }} />
          </div>
          <div className="text-xs font-bold tracking-[0.2em] uppercase mb-3" style={{ color: "#1B6CA8" }}>Quote Confirmed</div>
          <h1 className="text-4xl font-black mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif", color: "#0D1B2A" }}>
            Request Received
          </h1>
          <p className="text-slate-500 mb-3">Your Quote ID is</p>
          <div className="font-mono font-black text-2xl mb-6" style={{ color: "#0D1B2A" }}>{params.id}</div>
          <p className="text-slate-500 mb-10">Our packaging engineers are reviewing your spec and will send a detailed quotation within 24–48 hours.</p>
          <div className="flex justify-center gap-4">
            <Link href="/dashboard">
              <button className="px-6 py-3 rounded font-bold text-sm text-white" style={{ background: "#0D1B2A" }}>Go to Dashboard</button>
            </Link>
            <Link href="/products">
              <button className="px-6 py-3 rounded font-bold text-sm border border-slate-200 text-slate-700 hover:border-slate-400 transition-colors">Browse SKUs</button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Layout ──────────────────────────────────────────────────────────────────
  const isLastStep = stepNum === 6;
  const skus = (SKU_TEMPLATES[selectedCategory] || []).filter(s => ecoFilter ? s.eco : true);

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
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black transition-all"
                    style={{
                      background: done ? "#1B6CA8" : active ? "#0D1B2A" : "#E2E8F0",
                      color: done || active ? "white" : "#94A3B8"
                    }}
                  >
                    {done ? "✓" : s}
                  </div>
                  <span className="text-xs font-bold hidden sm:block" style={{ color: active ? "#0D1B2A" : done ? "#1B6CA8" : "#94A3B8" }}>{label}</span>
                </div>
                {i < STEP_LABELS.length - 1 && (
                  <div className="flex-1 h-px mx-3" style={{ background: done ? "#1B6CA8" : "#E2E8F0" }} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Main content ── */}
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

          {/* ── Left panel ── */}
          <div className="lg:col-span-2 space-y-6">

            {/* ── STEP 1: Contact Info ── */}
            {stepNum === 1 && (
              <>
                <StepHeader step={1} total={6} title="Contact Info" projectId={PROJECT_ID} />
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
                        <input
                          type={type}
                          value={value}
                          onChange={e => set(e.target.value)}
                          className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-400 transition-colors bg-slate-50 focus:bg-white"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* ── STEP 2: SKU Selection ── */}
            {stepNum === 2 && (
              <>
                <StepHeader step={2} total={6} title="SKU Selection" projectId={PROJECT_ID} />

                {/* Primary Category */}
                <div className="bg-white rounded-lg border border-slate-200 p-5">
                  <div className="flex justify-between items-center mb-4">
                    <span className="font-bold text-slate-800 text-sm" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Primary Category</span>
                    <button className="text-xs font-bold transition-colors" style={{ color: "#1B6CA8" }}>Change Category</button>
                  </div>
                  <div className="grid grid-cols-4 gap-3">
                    {CATEGORIES.map(cat => (
                      <button
                        key={cat.id}
                        onClick={() => { setSelectedCategory(cat.id); setSelectedSku(SKU_TEMPLATES[cat.id]?.[0]?.id || ""); }}
                        className="flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all"
                        style={{
                          borderColor: selectedCategory === cat.id ? "#1B6CA8" : "#E2E8F0",
                          background: selectedCategory === cat.id ? "rgba(27,108,168,0.06)" : "white",
                          color: selectedCategory === cat.id ? "#1B6CA8" : "#94A3B8"
                        }}
                      >
                        {cat.icon}
                        <span className="text-xs font-bold text-center leading-tight" style={{ color: selectedCategory === cat.id ? "#1B6CA8" : "#64748B" }}>{cat.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Select Template SKU */}
                <div className="bg-white rounded-lg border border-slate-200 p-5">
                  <div className="flex justify-between items-center mb-4">
                    <span className="font-bold text-slate-800 text-sm" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Select Template SKU</span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEcoFilter(false)}
                        className="px-3 py-1 rounded-full text-xs font-bold transition-all"
                        style={{ background: !ecoFilter ? "#0D1B2A" : "#F1F5F9", color: !ecoFilter ? "white" : "#64748B" }}
                      >All Specs</button>
                      <button
                        onClick={() => setEcoFilter(true)}
                        className="px-3 py-1 rounded-full text-xs font-bold transition-all"
                        style={{ background: ecoFilter ? "#16A34A" : "#F1F5F9", color: ecoFilter ? "white" : "#64748B" }}
                      >Eco-Friendly</button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {skus.length === 0 ? (
                      <p className="text-sm text-slate-400 col-span-2 py-4 text-center">No eco-friendly SKUs in this category.</p>
                    ) : skus.map(sku => (
                      <button
                        key={sku.id}
                        onClick={() => setSelectedSku(sku.id)}
                        className="flex items-start gap-3 p-4 rounded-lg border-2 text-left transition-all"
                        style={{
                          borderColor: selectedSku === sku.id ? "#1B6CA8" : "#E2E8F0",
                          background: selectedSku === sku.id ? "rgba(27,108,168,0.04)" : "white"
                        }}
                      >
                        <div className="w-12 h-12 rounded bg-slate-100 flex items-center justify-center shrink-0">
                          <Package className="w-6 h-6 text-slate-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="font-black text-xs text-slate-400">{sku.code}</span>
                            {sku.eco && <span className="text-xs px-1.5 py-0.5 rounded font-bold" style={{ background: "rgba(22,163,74,0.1)", color: "#16A34A" }}>ECO</span>}
                          </div>
                          <div className="font-bold text-slate-800 text-sm mb-1">{sku.name}</div>
                          <div className="text-xs text-slate-400 leading-snug">{sku.desc}</div>
                        </div>
                        {selectedSku === sku.id && (
                          <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0" style={{ background: "#1B6CA8" }}>
                            <svg className="w-3 h-3 text-white fill-current" viewBox="0 0 12 12"><path d="M10 3L5 8.5 2 5.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Configuration Details accordion */}
                <div className="space-y-2">
                  <div className="font-bold text-slate-800 text-sm mb-3" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Configuration Details</div>

                  <AccordionItem
                    num="01" title="Quantity & Dimensions"
                    subtitle={`${qty.toLocaleString()} Units • 12" × 8" × 4"`}
                    open={openAccordion === "qty"}
                    onToggle={() => setOpenAccordion(openAccordion === "qty" ? null : "qty")}
                  >
                    <div className="space-y-4 mt-2">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Order Quantity</label>
                        <div className="flex gap-2 flex-wrap">
                          {[250, 500, 1000, 2500, 5000].map(q => (
                            <button key={q} onClick={() => setQty(q)}
                              className="px-4 py-2 rounded-lg border text-sm font-bold transition-all"
                              style={{ borderColor: qty === q ? "#1B6CA8" : "#E2E8F0", background: qty === q ? "rgba(27,108,168,0.08)" : "white", color: qty === q ? "#1B6CA8" : "#64748B" }}
                            >{q.toLocaleString()}</button>
                          ))}
                          <input
                            type="number" value={qty} onChange={e => setQty(Math.max(50, parseInt(e.target.value) || 500))}
                            className="w-28 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400 bg-slate-50"
                            placeholder="Custom"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        {["Length (cm)", "Width (cm)", "Height (cm)"].map(dim => (
                          <div key={dim}>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">{dim}</label>
                            <input type="number" defaultValue={dim.includes("Length") ? 30 : dim.includes("Width") ? 20 : 10}
                              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400 bg-slate-50" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </AccordionItem>

                  <AccordionItem
                    num="02" title="Artwork & Branding"
                    subtitle="Configure visual treatment"
                    open={openAccordion === "artwork"}
                    onToggle={() => setOpenAccordion(openAccordion === "artwork" ? null : "artwork")}
                  >
                    <div className="grid grid-cols-3 gap-3 mt-2">
                      {([
                        { id: "upload" as ArtworkOption, icon: <Upload className="w-6 h-6" />, label: "Upload Artwork", sub: "PDF, AI, SVG" },
                        { id: "design" as ArtworkOption, icon: <Palette className="w-6 h-6" />, label: "Need Design", sub: "Expert assistance" },
                        { id: "none" as ArtworkOption, icon: <X className="w-6 h-6" />, label: "No Artwork", sub: "Plain/unprinted" },
                      ]).map(opt => (
                        <button
                          key={opt.id}
                          onClick={() => setArtworkOption(opt.id)}
                          className="flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all"
                          style={{
                            borderColor: artworkOption === opt.id ? "#1B6CA8" : "#E2E8F0",
                            background: artworkOption === opt.id ? "rgba(27,108,168,0.06)" : "white",
                            color: artworkOption === opt.id ? "#1B6CA8" : "#94A3B8"
                          }}
                        >
                          {opt.icon}
                          <div className="text-center">
                            <div className="font-bold text-xs" style={{ color: artworkOption === opt.id ? "#1B6CA8" : "#374151" }}>{opt.label}</div>
                            <div className="text-xs" style={{ color: "#94A3B8" }}>{opt.sub}</div>
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
                        <span className="text-slate-500"> — Print-ready files in 5 days, fully adjusted against production order.</span>
                      </div>
                    )}
                  </AccordionItem>

                  <AccordionItem
                    num="03" title="Delivery & Timeline"
                    subtitle="Standard Shipping (12–14 Days)"
                    open={openAccordion === "delivery"}
                    onToggle={() => setOpenAccordion(openAccordion === "delivery" ? null : "delivery")}
                  >
                    <div className="mt-2">
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Delivery Pincode</label>
                      <input type="text" className="w-full max-w-xs border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400 bg-slate-50" placeholder="e.g. 400001" />
                    </div>
                  </AccordionItem>
                </div>

                {/* Delivery Strategy */}
                <div className="bg-white rounded-lg border border-slate-200 p-5">
                  <div className="mb-4">
                    <div className="font-bold text-slate-800 text-sm mb-1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Delivery Strategy</div>
                    <div className="text-xs text-slate-400">Select a timeline that matches your project urgency. All shipments are trackable via the Command Center.</div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {([
                      { id: "standard" as DeliveryOption, icon: <Truck className="w-6 h-6" />, label: "Standard Pro", time: "12–14 Business Days", price: "Free", recommended: true },
                      { id: "blitz" as DeliveryOption, icon: <Zap className="w-6 h-6" />, label: "Blitz Logistics", time: "5–7 Business Days", price: "+₹240.00", recommended: false },
                      { id: "warehouse" as DeliveryOption, icon: <Warehouse className="w-6 h-6" />, label: "Warehouse Hold", time: "Store for up to 30 days", price: "₹15.00 / mo", recommended: false },
                    ]).map(opt => (
                      <button
                        key={opt.id}
                        onClick={() => setDeliveryOption(opt.id)}
                        className="relative flex flex-col items-start gap-2 p-4 rounded-lg border-2 text-left transition-all"
                        style={{
                          borderColor: deliveryOption === opt.id ? "#1B6CA8" : "#E2E8F0",
                          background: deliveryOption === opt.id ? "rgba(27,108,168,0.04)" : "white"
                        }}
                      >
                        {opt.recommended && (
                          <span className="absolute -top-2 left-3 px-2 py-0.5 rounded text-xs font-black" style={{ background: "#1B6CA8", color: "white" }}>RECOMMENDED</span>
                        )}
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
                <StepHeader step={3} total={6} title="Artwork" projectId={PROJECT_ID} />
                <div className="bg-white rounded-lg border border-slate-200 p-6 space-y-4">
                  <div className="font-bold text-slate-700 mb-2">Artwork for <span style={{ color: "#1B6CA8" }}>{SKU_TEMPLATES[selectedCategory]?.find(s => s.id === selectedSku)?.name || "your product"}</span></div>
                  <div className="grid grid-cols-3 gap-4">
                    {([
                      { id: "upload" as ArtworkOption, icon: <Upload className="w-8 h-8" />, label: "Upload Artwork", sub: "PDF, AI, SVG" },
                      { id: "design" as ArtworkOption, icon: <Palette className="w-8 h-8" />, label: "Need Design", sub: "₹1,999 — Expert help" },
                      { id: "none" as ArtworkOption, icon: <X className="w-8 h-8" />, label: "No Artwork", sub: "Plain / unprinted" },
                    ]).map(opt => (
                      <button key={opt.id} onClick={() => setArtworkOption(opt.id)}
                        className="flex flex-col items-center gap-3 p-5 rounded-lg border-2 transition-all"
                        style={{ borderColor: artworkOption === opt.id ? "#1B6CA8" : "#E2E8F0", background: artworkOption === opt.id ? "rgba(27,108,168,0.06)" : "white", color: artworkOption === opt.id ? "#1B6CA8" : "#94A3B8" }}
                      >
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
                <StepHeader step={4} total={6} title="Delivery" projectId={PROJECT_ID} />
                <div className="bg-white rounded-lg border border-slate-200 p-6 space-y-6">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Delivery Pincode</label>
                    <input type="text" className="w-full max-w-xs border border-slate-200 rounded-lg px-4 py-2.5 text-sm bg-slate-50 focus:outline-none focus:border-blue-400" placeholder="e.g. 400001" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-700 mb-3">Shipping Strategy</div>
                    <div className="grid grid-cols-3 gap-4">
                      {([
                        { id: "standard" as DeliveryOption, icon: <Truck className="w-7 h-7" />, label: "Standard Pro", time: "12–14 Business Days", price: "Free", recommended: true },
                        { id: "blitz" as DeliveryOption, icon: <Zap className="w-7 h-7" />, label: "Blitz Logistics", time: "5–7 Business Days", price: "+₹240" },
                        { id: "warehouse" as DeliveryOption, icon: <Warehouse className="w-7 h-7" />, label: "Warehouse Hold", time: "Up to 30 days", price: "₹15/mo" },
                      ]).map(opt => (
                        <button key={opt.id} onClick={() => setDeliveryOption(opt.id)}
                          className="relative flex flex-col items-start gap-2 p-4 rounded-lg border-2 transition-all"
                          style={{ borderColor: deliveryOption === opt.id ? "#1B6CA8" : "#E2E8F0", background: deliveryOption === opt.id ? "rgba(27,108,168,0.04)" : "white" }}
                        >
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
                <StepHeader step={5} total={6} title="Sample Request" projectId={PROJECT_ID} />
                <div className="bg-white rounded-lg border border-slate-200 p-6 space-y-6">
                  <p className="text-sm text-slate-500">Get a physical sample before bulk production. Sampling fee fully adjusted against your production order.</p>
                  <div className="flex items-center gap-3">
                    <button onClick={() => setSampleRequested(!sampleRequested)}
                      className="w-6 h-6 rounded border-2 flex items-center justify-center transition-all shrink-0"
                      style={{ borderColor: sampleRequested ? "#1B6CA8" : "#CBD5E1", background: sampleRequested ? "#1B6CA8" : "white" }}
                    >
                      {sampleRequested && <svg className="w-3.5 h-3.5" viewBox="0 0 12 12"><path d="M10 3L5 8.5 2 5.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>}
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
                          style={{ borderColor: sampleTier === tier.id ? "#1B6CA8" : "#E2E8F0", background: sampleTier === tier.id ? "rgba(27,108,168,0.04)" : "white" }}
                        >
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
                <StepHeader step={6} total={6} title="Review & Submit" projectId={PROJECT_ID} />
                <div className="bg-white rounded-lg border border-slate-200 p-6 space-y-5">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Additional Notes / Special Requirements</label>
                    <textarea
                      value={notes} onChange={e => setNotes(e.target.value)}
                      className="w-full border border-slate-200 rounded-lg px-4 py-3 text-sm bg-slate-50 focus:outline-none focus:border-blue-400 h-28 resize-none"
                      placeholder="Any special requirements, sustainability preferences, or compliance needs..."
                    />
                  </div>
                  <div className="rounded-lg p-5 border" style={{ background: "#0F1C2C", borderColor: "rgba(255,255,255,0.08)" }}>
                    <div className="text-xs font-bold uppercase tracking-wider mb-4" style={{ color: "#1B6CA8" }}>Configuration Summary</div>
                    <div className="space-y-2">
                      {[
                        ["Company", company || "—"],
                        ["Contact", contactName || "—"],
                        ["Email", email || "—"],
                        ["SKU", SKU_TEMPLATES[selectedCategory]?.find(s => s.id === selectedSku)?.name || "—"],
                        ["Quantity", `${qty.toLocaleString()} units`],
                        ["Artwork", artworkOption === "upload" ? "Upload Ready" : artworkOption === "design" ? "Design Service (+₹1,999)" : "No Artwork"],
                        ["Delivery", deliveryOption === "standard" ? "Standard Pro (Free)" : deliveryOption === "blitz" ? "Blitz Logistics (+₹240)" : "Warehouse Hold (₹15/mo)"],
                        ["Sample", sampleRequested ? `Yes — ${sampleTier.charAt(0).toUpperCase() + sampleTier.slice(1)}` : "Not requested"],
                      ].map(([k, v]) => (
                        <div key={k} className="flex justify-between text-sm">
                          <span className="text-slate-400">{k}</span>
                          <span className="font-bold text-white">{v}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* ── Navigation ── */}
            <div className="flex justify-between pt-4">
              <button
                onClick={handleBack}
                className="px-6 py-2.5 rounded-lg border border-slate-200 text-sm font-bold text-slate-600 hover:border-slate-400 transition-colors"
              >
                ← Back
              </button>
              {!isLastStep ? (
                <button
                  onClick={handleNext}
                  className="px-8 py-2.5 rounded-lg text-sm font-black uppercase tracking-wider text-white transition-all hover:opacity-90"
                  style={{ background: "#0D1B2A" }}
                >
                  Continue →
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={submitMutation.isPending}
                  className="px-8 py-2.5 rounded-lg text-sm font-black uppercase tracking-wider transition-all hover:opacity-90 flex items-center gap-2"
                  style={{ background: "#E8A838", color: "#0F1C2C" }}
                >
                  {submitMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Submit Request <ArrowRight className="w-4 h-4" /></>}
                </button>
              )}
            </div>
          </div>

          {/* ── Right panel: Order Summary ── */}
          <div className="lg:col-span-1">
            <OrderSummary
              skuId={selectedSku}
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
