import { useState } from "react";
import { Link } from "wouter";
import { useCreateDesignRequest } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { DESIGN_PORTFOLIO_IMAGES } from "@/lib/images";

const MS = ({ icon, className = "", style }: { icon: string; className?: string; style?: React.CSSProperties }) => (
  <span className={`material-symbols-outlined ${className}`} style={style}>{icon}</span>
);
const MsFilled = ({ icon, className = "", style }: { icon: string; className?: string; style?: React.CSSProperties }) => (
  <span className={`material-symbols-outlined ms-filled ${className}`} style={style}>{icon}</span>
);

const PRODUCT_TYPES = ["Corrugated", "Folding Carton", "Pouch", "Mailer", "Rigid Box", "Label"];
const SKU_SIZES = ["Standard/Black → 11×8×4", "Custom Dimensions", "A5 Mailer", "250ml Bottle", "500g Pouch", "1kg Stand-up Pouch"];
const BRAND_COLORS = ["#0D1B2A", "#1B6CA8", "#E8A838", "#22C55E", "#EF4444", "#8B5CF6"];

const INCLUSIONS = [
  { icon: "straighten", label: "Dielines", desc: "Print-ready structural drawings for your manufacturing plant" },
  { icon: "picture_as_pdf", label: "AI/PDF", desc: "High-resolution vector files compatible with all industry software" },
  { icon: "storefront", label: "Brand application", desc: "Full translation of your branding & copy into print-ready forms" },
  { icon: "repeat", label: "2 Revisions", desc: "Complete revisions rounds to ensure the final artwork is perfect" },
  { icon: "folder_zip", label: "Source files", desc: "Complete ownership of all editable project assets and layers" },
  { icon: "credit_card_off", label: "Full credit", desc: "The ₹1,999 fee is fully adjusted against your subsequent print order" },
];

export default function Design() {
  const [step, setStep] = useState(0); // 0 = landing page, 1 = brief, 2 = brand, 3 = checkout, 4 = success
  const [productType, setProductType] = useState("Corrugated");
  const [skuSize, setSkuSize] = useState("Standard/Black → 11×8×4");
  const [brandName, setBrandName] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#0D1B2A");
  const [isRush, setIsRush] = useState(false);
  const [designId, setDesignId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ contact_name: "", email: "", phone: "", brand_description: "", notes: "", logo_url: "" });
  const { toast } = useToast();
  const createDesignMutation = useCreateDesignRequest();

  const amount = isRush ? 3499 : 1999;

  const handleSubmit = () => {
    createDesignMutation.mutate({
      data: {
        ...formData,
        product_type: productType,
        brand_colors: primaryColor,
        is_rush: isRush,
        amount_paid: amount,
        razorpay_payment_id: "pay_" + Math.random().toString(36).substring(7),
      }
    }, {
      onSuccess: (res) => { setDesignId(res.design_id); setStep(4); },
      onError: () => toast({ variant: "destructive", title: "Error", description: "Failed to submit" }),
    });
  };

  // ── Success ──────────────────────────────────
  if (step === 4 && designId) {
    return (
      <div className="min-h-screen flex items-center justify-center px-8" style={{ background: "#F8F9FC" }}>
        <div className="max-w-lg text-center">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-8" style={{ background: "rgba(34,197,94,0.1)" }}>
            <MsFilled icon="check_circle" className="text-5xl" style={{ color: "#22C55E" }} />
          </div>
          <h1 className="clash-display text-3xl mb-4" style={{ color: "#0D1B2A" }}>Design Brief Confirmed!</h1>
          <p className="text-lg mb-3" style={{ color: "#44474c" }}>Your Design ID: <strong style={{ color: "#0D1B2A" }}>{designId}</strong></p>
          <p className="mb-8" style={{ color: "#74777d" }}>Our packaging designers will share the first concept within {isRush ? "24" : "72"} hours.</p>
          <Link href="/dashboard/designs">
            <button className="btn-fill btn-navy px-8 py-4"><span>View in Dashboard</span></button>
          </Link>
        </div>
      </div>
    );
  }

  // ── Landing Page (step 0) ─────────────────────
  if (step === 0) {
    return (
      <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

        {/* Hero */}
        <section className="relative overflow-hidden" style={{ background: "#0D1B2A" }}>
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 items-center min-h-[60vh]">
            <div className="px-8 md:px-16 py-20">
              <h1 className="clash-display text-white mb-4" style={{ fontSize: "clamp(2.5rem,5vw,4rem)", lineHeight: 1.1 }}>
                Your packaging,<br />
                <span style={{ color: "#E8A838" }}>designed right.</span>
              </h1>
              <p className="text-slate-400 text-lg mb-8">
                <strong className="text-white" style={{ fontFamily: "'Manrope', sans-serif" }}>₹1,999.</strong>{" "}
                Print-ready files in 5 days, adjusted against order.
              </p>
              <div className="flex gap-4 flex-wrap">
                <button onClick={() => setStep(1)}
                  className="px-8 py-4 rounded font-bold text-sm uppercase tracking-wide hover:opacity-90 active:scale-95 transition-all"
                  style={{ background: "#E8A838", color: "#0F1C2C" }}>
                  START DESIGN BRIEF
                </button>
                <button className="border border-white/30 text-white px-8 py-4 rounded font-bold text-sm uppercase tracking-wide hover:bg-white/10 transition-all">
                  VIEW PORTFOLIO
                </button>
              </div>
            </div>
            <div className="hidden lg:block h-full">
              <img src="https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=700&h=600&fit=crop&q=80"
                alt="Premium packaging design" className="w-full h-full object-cover opacity-90" />
            </div>
          </div>
        </section>

        {/* Inclusions */}
        <section className="py-20 px-8 md:px-20" style={{ background: "#F8F9FC" }}>
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-16">
              <div>
                <div className="flex items-center gap-4 mb-2 flex-wrap">
                  <span className="text-xs font-bold uppercase tracking-widest px-3 py-1 rounded" style={{ background: "rgba(34,197,94,0.1)", color: "#22C55E" }}>✓ DESIGN INCLUSIONS</span>
                  <span className="text-xs font-bold uppercase tracking-widest px-3 py-1 rounded" style={{ background: "rgba(27,108,168,0.1)", color: "#1B6CA8" }}>₹1,999 PRICE</span>
                  <span className="text-xs font-bold uppercase tracking-widest px-3 py-1 rounded bg-amber-50 text-amber-700">VIEW BRIEF</span>
                </div>
                <h2 className="clash-display text-3xl mt-4" style={{ color: "#0D1B2A" }}>Professional output, guaranteed.</h2>
              </div>
              <p className="text-sm max-w-xs leading-relaxed" style={{ color: "#44474c" }}>
                Everything you need to go from concept to the production line without a single trip.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-x-12 gap-y-8">
              {INCLUSIONS.map(inc => (
                <div key={inc.label} className="flex gap-4 items-start">
                  <MS icon={inc.icon} className="text-2xl shrink-0 mt-0.5" style={{ color: "#1B6CA8" }} />
                  <div>
                    <h4 className="font-bold mb-1" style={{ color: "#0D1B2A" }}>{inc.label}</h4>
                    <p className="text-sm" style={{ color: "#44474c" }}>{inc.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Portfolio Grid */}
        <section className="grid grid-cols-3 gap-1">
          {DESIGN_PORTFOLIO_IMAGES.map((img, i) => (
            <div key={i} className="aspect-square overflow-hidden">
              <img src={img} alt="" className="w-full h-full object-cover hover:scale-105 transition-all duration-500" />
            </div>
          ))}
        </section>

        {/* CTA into brief */}
        <section className="py-20 px-8 text-center" style={{ background: "#F8F9FC" }}>
          <h2 className="clash-display text-3xl mb-4" style={{ color: "#0D1B2A" }}>Let&rsquo;s build your brief.</h2>
          <p className="text-lg mb-8" style={{ color: "#44474c" }}>5 minutes to fill. 5 days to your inbox.</p>
          <button onClick={() => setStep(1)}
            className="px-10 py-5 rounded font-bold text-base hover:opacity-90 active:scale-95 transition-all text-white inline-flex items-center gap-2"
            style={{ background: "#0D1B2A" }}>
            Start Now <MS icon="arrow_forward" />
          </button>
        </section>
      </div>
    );
  }

  // ── Brief Form (steps 1-3) ────────────────────
  return (
    <div className="min-h-screen py-12 px-4" style={{ background: "#F8F9FC", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <div className="max-w-3xl mx-auto">

        {/* Step indicator */}
        <div className="flex items-center gap-2 text-xs uppercase tracking-widest font-bold mb-6" style={{ color: "#74777d" }}>
          <span style={{ color: "#1B6CA8" }}>STEP {String(step).padStart(2, "0")} OF 03</span>
          <div className="w-full h-0.5 bg-slate-200 rounded">
            <div className="h-full rounded transition-all" style={{ width: `${(step / 3) * 100}%`, background: "#1B6CA8" }} />
          </div>
        </div>
        <h1 className="clash-display text-3xl mb-8" style={{ color: "#0D1B2A" }}>
          {step === 1 ? "What are you packaging?" : step === 2 ? "02 Brand Assets" : "03 Checkout & Pay"}
        </h1>

        <div className="bg-white rounded-lg border border-slate-200 p-8 md:p-10">

          {/* ── Step 1: Product type + size ─── */}
          {step === 1 && (
            <div className="space-y-8">
              <div>
                <label className="text-xs font-bold uppercase tracking-widest mb-4 block" style={{ color: "#74777d" }}>WHAT ARE YOU PACKAGING?</label>
                <div className="flex flex-wrap gap-3">
                  {PRODUCT_TYPES.map(t => (
                    <button key={t} onClick={() => setProductType(t)}
                      className="px-5 py-2.5 rounded text-sm font-bold transition-all"
                      style={productType === t ? { background: "#0D1B2A", color: "white" } : { background: "#F2F3F6", color: "#44474c" }}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-widest mb-4 block" style={{ color: "#74777d" }}>SKU PICKER</label>
                <select value={skuSize} onChange={e => setSkuSize(e.target.value)}
                  className="w-full border border-slate-200 rounded p-3 text-sm focus:outline-none focus:border-blue-400"
                  style={{ color: "#0D1B2A" }}>
                  {SKU_SIZES.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-widest mb-4 block" style={{ color: "#74777d" }}>YOUR CONTACT DETAILS</label>
                <div className="grid md:grid-cols-2 gap-4">
                  <input placeholder="Full Name" value={formData.contact_name} onChange={e => setFormData({ ...formData, contact_name: e.target.value })}
                    className="w-full border border-slate-200 rounded p-3 text-sm focus:outline-none focus:border-blue-400" />
                  <input placeholder="Phone Number" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full border border-slate-200 rounded p-3 text-sm focus:outline-none focus:border-blue-400" />
                  <input type="email" placeholder="Email Address" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })}
                    className="w-full border border-slate-200 rounded p-3 text-sm focus:outline-none focus:border-blue-400 md:col-span-2" />
                </div>
              </div>
            </div>
          )}

          {/* ── Step 2: Brand Assets ─── */}
          {step === 2 && (
            <div className="space-y-8">
              <div className="border-2 border-dashed rounded-lg p-10 text-center" style={{ borderColor: "#C4C6CC" }}>
                <MS icon="cloud_upload" className="text-5xl mb-3" style={{ color: "#74777d" }} />
                <p className="font-bold mb-1" style={{ color: "#0D1B2A" }}>Upload Brand Logo</p>
                <p className="text-sm" style={{ color: "#74777d" }}>PDF, AI, SVG — or paste a URL below</p>
                <input placeholder="https://drive.google.com/your-logo.pdf" value={formData.logo_url}
                  onChange={e => setFormData({ ...formData, logo_url: e.target.value })}
                  className="mt-4 w-full max-w-sm border border-slate-200 rounded p-2.5 text-sm focus:outline-none focus:border-blue-400 mx-auto block" />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-widest mb-3 block" style={{ color: "#74777d" }}>BRAND NAME & MODEL</label>
                <input placeholder="e.g. Bluu Coffee — Premium Single Origin" value={brandName} onChange={e => setBrandName(e.target.value)}
                  className="w-full border border-slate-200 rounded p-3 text-sm focus:outline-none focus:border-blue-400" />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-widest mb-3 block" style={{ color: "#74777d" }}>COLOUR PICKER — PRIMARY BRAND COLOUR</label>
                <div className="flex gap-3 flex-wrap">
                  {BRAND_COLORS.map(c => (
                    <button key={c} onClick={() => setPrimaryColor(c)}
                      className="w-8 h-8 rounded-full border-2 transition-all"
                      style={{ background: c, borderColor: primaryColor === c ? "#1B6CA8" : "transparent", transform: primaryColor === c ? "scale(1.2)" : "scale(1)" }} />
                  ))}
                  <input type="color" value={primaryColor} onChange={e => setPrimaryColor(e.target.value)}
                    className="w-8 h-8 rounded-full cursor-pointer border-0 p-0" />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-widest mb-3 block" style={{ color: "#74777d" }}>DESCRIBE YOUR BRAND</label>
                <textarea placeholder="e.g. Premium, minimalist, earthy — aimed at urban professionals who value sustainability..." value={formData.brand_description}
                  onChange={e => setFormData({ ...formData, brand_description: e.target.value })}
                  className="w-full border border-slate-200 rounded p-3 text-sm focus:outline-none focus:border-blue-400 h-24 resize-none" />
              </div>
            </div>
          )}

          {/* ── Step 3: Checkout ─── */}
          {step === 3 && (
            <div className="space-y-6">
              {/* Project Summary */}
              <div className="rounded p-6" style={{ background: "#F2F3F6" }}>
                <h3 className="font-bold mb-4" style={{ color: "#0D1B2A" }}>Project Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span style={{ color: "#44474c" }}>Packaging Type</span>
                    <span className="font-bold" style={{ color: "#0D1B2A" }}>{productType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: "#44474c" }}>SKU Size</span>
                    <span className="font-bold" style={{ color: "#0D1B2A" }}>{skuSize}</span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: "#44474c" }}>Base Fee</span>
                    <span className="font-bold" style={{ color: "#0D1B2A" }}>₹1,999</span>
                  </div>
                  {isRush && (
                    <div className="flex justify-between">
                      <span style={{ color: "#44474c" }}>Rush Delivery (24h)</span>
                      <span className="font-bold" style={{ color: "#0D1B2A" }}>+₹1,500</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-3 border-t border-slate-200 font-bold text-base">
                    <span>TOTAL DUE</span>
                    <span style={{ fontFamily: "'Manrope', sans-serif" }}>₹{amount.toLocaleString("en-IN")}</span>
                  </div>
                </div>
              </div>

              {/* Rush toggle */}
              <label className="flex items-center justify-between p-5 rounded border cursor-pointer hover:border-blue-400 transition-all"
                style={{ border: "1px solid #E7E8EB" }}>
                <div>
                  <p className="font-bold" style={{ color: "#0D1B2A" }}>Rush Delivery Add-on</p>
                  <p className="text-xs" style={{ color: "#74777d" }}>First concept within 24 hours instead of 72 hours (+₹1,500)</p>
                </div>
                <div className="relative ml-6">
                  <input type="checkbox" className="sr-only" checked={isRush} onChange={e => setIsRush(e.target.checked)} />
                  <div className="w-11 h-6 rounded-full transition-colors relative" style={{ background: isRush ? "#1B6CA8" : "#C4C6CC" }}>
                    <div className="absolute top-0.5 w-5 h-5 bg-white rounded-full transition-all" style={{ left: isRush ? "calc(100% - 22px)" : "2px" }} />
                  </div>
                </div>
              </label>

              {/* Pay button */}
              <button onClick={handleSubmit} disabled={createDesignMutation.isPending}
                className="w-full py-5 rounded font-bold text-base flex items-center justify-center gap-3 hover:opacity-90 active:scale-[0.99] transition-all disabled:opacity-60 text-white"
                style={{ background: "#1B6CA8" }}>
                {createDesignMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <MS icon="lock" />}
                Pay ₹{amount.toLocaleString("en-IN")} with Razorpay
              </button>
              <p className="text-center text-xs" style={{ color: "#74777d" }}>Secured payment. Fee is 100% adjusted against bulk order.</p>
            </div>
          )}
        </div>

        {/* Navigation */}
        {step < 4 && (
          <div className="flex justify-between mt-6">
            <button onClick={() => setStep(s => Math.max(0, s - 1))}
              className="flex items-center gap-2 px-6 py-3 rounded font-bold text-sm transition-all"
              style={{ background: "#F2F3F6", color: "#0D1B2A" }}>
              <MS icon="arrow_back" className="text-base" /> Back
            </button>
            {step < 3 && (
              <button onClick={() => setStep(s => s + 1)}
                className="flex items-center gap-2 px-8 py-3 rounded font-bold text-sm text-white hover:opacity-90 transition-all"
                style={{ background: "#0D1B2A" }}>
                Continue <MS icon="arrow_forward" className="text-base" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
