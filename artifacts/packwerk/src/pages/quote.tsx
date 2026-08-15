import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { Link, useLocation } from "wouter";
import { useSubmitQuote } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { CATEGORIES } from "@/lib/skus";
import type { Sku, VariantGroup } from "@/lib/skus";
import { CATALOG_SKUS as SKUS, getCatalogImage, getCatalogSkusByCategory as getSkusByCategory, requiresQuote } from "@/lib/catalog";
import { openOrderPayment, openRazorpay, prepareOrderPayment, type PreparedOrderPayment } from "@/lib/razorpay";
import { calculateOrderEstimate } from "@/lib/pricing";
import { createConfiguredCartItem, useCart } from "@/lib/cart";
import {
  COMMERCE_PRODUCTS,
  LAUNCH_PROMOTION_CODE,
  RAZORPAY_PAYMENT_LIMIT_RUPEES,
  formatMeasurementInCm,
  getMinimumQuantityForConfiguration,
} from "@workspace/commerce";
import {
  Loader2, CheckCircle2, ChevronDown, ChevronUp,
  Upload, Palette, X, Truck, Zap, Warehouse, ArrowRight, Shield, Search,
} from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────────
type ArtworkOption = "upload" | "design" | "none";
type DeliveryOption = "standard" | "blitz" | "warehouse";

const STEP_LABELS = ["Choose", "Brand & delivery", "Your details", "Review & checkout"];
const TOTAL_STEPS = 4;

const MOBILE_SHOPPING_INTENTS = [
  { label: "Food, coffee or supplements", help: "Pouches, sachets and jars", category: "flexible", icon: "restaurant" },
  { label: "Skincare or personal care", help: "Bottles, jars and cosmetic tubes", category: "bottles", icon: "spa" },
  { label: "Shipping online orders", help: "Mailer boxes, courier bags and protection", category: "ecommerce", icon: "local_shipping" },
  { label: "Labels or stickers", help: "Paper, waterproof and clear labels", category: "labels", icon: "sell" },
  { label: "Takeaway food", help: "Bowls, containers, bags and wraps", category: "sustainable", icon: "takeout_dining" },
  { label: "I know the exact format", help: "Open the complete packaging catalog", category: "all", icon: "view_module" },
] as const;
const isAssistedSku = (sku: Sku | undefined) => sku?.purchase_mode === "brief";

function customisationNote(sku: Sku | undefined) {
  if (!sku) return "";
  if (sku.category === "labels") {
    return "Customised to your brand. Upload your logo or finished artwork in the design step.";
  }
  if (sku.code === "SP-905") {
    return "Customise the outer sleeve or applied label while keeping the food-contact container production-safe.";
  }
  if (sku.code === "SP-907") {
    return "Add your brand with direct print or an applied label. The preview shows the intended finished presentation.";
  }
  if (sku.code === "SP-912") {
    return "Start with plain compostable cups, add a brand label for shorter runs, or move to direct custom print for production quantities.";
  }
  if (sku.code === "EC-510") {
    return "Printed to your brand in a fixed, production-ready bag size. Upload artwork in the next step.";
  }
  return "";
}

// ── Draft persistence helpers ──────────────────────────────────────────────
const DRAFT_KEY = "packwerk_configure_draft";
function loadDraft(): Record<string, any> {
  try { return JSON.parse(sessionStorage.getItem(DRAFT_KEY) || "{}") ?? {}; } catch { return {}; }
}
function saveDraft(data: Record<string, any>) {
  try { sessionStorage.setItem(DRAFT_KEY, JSON.stringify(data)); } catch {}
}
function clearDraft() {
  try { sessionStorage.removeItem(DRAFT_KEY); } catch {}
}

// ── Stable session project ID ──────────────────────────────────────────────
const PROJECT_ID = `PX-${Math.floor(1000 + Math.random() * 9000)}-${["ALPHA","BETA","DELTA","GAMMA"][Math.floor(Math.random()*4)]}`;

// ── Price helpers ──────────────────────────────────────────────────────────
// Realistic market rates: at MOQ = price_max/piece, scales down toward price_min at high volume
function calcPrice(sku: Sku | undefined, qty: number, delivery: DeliveryOption, artworkOption: ArtworkOption, sizeCode?: string, configuration?: Record<string, string>) {
  const result = calculateOrderEstimate(sku, qty, delivery, artworkOption, sizeCode, configuration);
  return {
    low: result.low,
    high: result.high,
    mat: result.material,
    setup: result.setup,
    logistics: result.logistics,
    artAdd: result.artwork,
    discount: "discount" in result ? result.discount : 0,
    promotionCode: "promotionCode" in result ? result.promotionCode : undefined,
    perPiece: result.unit,
    subtotal: "subtotal" in result ? result.subtotal : result.low,
    gst: "gst" in result ? result.gst : 0,
    total: "total" in result ? result.total : result.low,
    paymentEligible: "paymentEligible" in result ? result.paymentEligible : false,
  };
}

// ── Spec unit helpers ───────────────────────────────────────────────────────
function stripUnitSuffix(label: string) {
  return label.replace(/\s*\([^)]+\)\s*$/, "").trim();
}
function fieldDisplayUnit(fieldUnit: string | undefined, du: "mm"|"cm"|"in", wu: "g"|"kg"|"t"): string {
  if (!fieldUnit) return "";
  if (fieldUnit === "mm") return du;
  if (fieldUnit === "g") return wu;
  return fieldUnit;
}
function toDisplay(stored: string, fieldUnit: string | undefined, du: "mm"|"cm"|"in", wu: "g"|"kg"|"t"): string {
  const n = parseFloat(stored); if (isNaN(n) || !fieldUnit) return stored;
  if (fieldUnit === "mm") { if (du === "cm") return String(+(n / 10).toFixed(3)); if (du === "in") return String(+(n / 25.4).toFixed(4)); }
  if (fieldUnit === "g") { if (wu === "kg") return String(+(n / 1000).toFixed(4)); if (wu === "t") return String(+(n / 1e6).toFixed(6)); }
  return stored;
}
function fromDisplay(display: string, fieldUnit: string | undefined, du: "mm"|"cm"|"in", wu: "g"|"kg"|"t"): string {
  const n = parseFloat(display); if (isNaN(n) || !fieldUnit) return display;
  if (fieldUnit === "mm") { if (du === "cm") return String(Math.round(n * 10)); if (du === "in") return String(Math.round(n * 25.4)); }
  if (fieldUnit === "g") { if (wu === "kg") return String(n * 1000); if (wu === "t") return String(n * 1e6); }
  return display;
}

function fmt(n: number) {
  return new Intl.NumberFormat("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
}

const MS = ({ icon, className = "", style }: { icon: string; className?: string; style?: React.CSSProperties }) => (
  <span className={`material-symbols-outlined ${className}`} style={style}>{icon}</span>
);

// ── Order Summary Sidebar ──────────────────────────────────────────────────
function OrderSummary({
  sku, qty, delivery, artworkOption, designPaid, sizeCode, configuration, buyingMode, purchaseIntent, onSubmit, submitting
}: {
  sku: Sku | undefined; qty: number; delivery: DeliveryOption;
  artworkOption: ArtworkOption; designPaid?: boolean; sizeCode?: string; configuration?: Record<string, string>; buyingMode: "self" | "assisted"; purchaseIntent?: "cart" | "buy"; onSubmit?: () => void; submitting?: boolean;
}) {
  const pricedArtwork = artworkOption === "design" && designPaid ? "upload" : artworkOption;
  const { low, high, mat, setup, logistics, artAdd, discount, promotionCode, gst, total, paymentEligible, perPiece } = calcPrice(sku, qty, delivery, pricedArtwork, sizeCode, configuration);
  const selectedSize = sku ? COMMERCE_PRODUCTS[sku.code]?.sizes.find((item) => item.code === sizeCode) : undefined;

  return (
    <div className="rounded-none overflow-y-auto pw-order-summary" style={{ background: "#0F1C2C", border: "1px solid rgba(255,255,255,0.08)" }}>
      <div className="px-6 py-5 border-b" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
        <div className="text-xs font-bold uppercase tracking-[0.18em] text-white">Order Summary</div>
      </div>
      <div className="px-6 py-5 space-y-4">
        <div className="flex justify-between items-start">
          <div>
            <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Product</div>
            <div className="text-white font-bold text-sm leading-snug">{sku?.name || "—"}</div>
            {selectedSize && <div className="text-xs mt-1" style={{ color: "#7CB5E4" }}>{formatMeasurementInCm(selectedSize.label)} · {formatMeasurementInCm(selectedSize.detail)}</div>}
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
              <span className="text-white font-medium" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>₹{fmt(mat)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Print Setup</span>
              <span className="text-white font-medium" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>₹{fmt(setup)}</span>
            </div>
            {artAdd > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Design Service</span>
                <span className="text-white font-medium" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>₹{fmt(artAdd)}</span>
              </div>
            )}
            {discount > 0 && (
              <div className="flex justify-between text-sm" style={{ color: "#62D39B" }}>
                <span>Launch saving · {promotionCode}</span>
                <span className="font-bold">−₹{fmt(discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Logistics</span>
              <span className="text-white font-medium" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>₹{fmt(logistics)}</span>
            </div>
            {buyingMode === "self" && (
              <div className="flex justify-between text-sm pt-2 border-t" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
                <span className="text-slate-400">GST (18%)</span>
                <span className="text-white font-medium">₹{fmt(gst ?? 0)}</span>
              </div>
            )}
          </div>
        )}

        <div className="pt-3 border-t" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
          <div className="text-xs text-slate-500 uppercase tracking-wider mb-2">{buyingMode === "self" ? "Payable total" : "Estimated range"}</div>
          {sku ? (
            <>
              <div className="font-black text-white leading-none" style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "clamp(1.2rem,2.2vw,1.6rem)" }}>
                {buyingMode === "self" ? `₹${fmt(total ?? low)}` : <>₹{fmt(low)} <span className="text-slate-400 font-bold text-base">–</span> ₹{fmt(high)}</>}
              </div>
              <div className="mt-3 flex items-center gap-1.5 border-t px-0 pt-2" style={{ borderColor: "rgba(255,255,255,0.16)" }}>
                <span className="text-xs font-bold" style={{ color: "#60a5fa" }}>
                  {buyingMode === "self"
                    ? `₹${fmt(perPiece)} packaging rate per piece, before GST and delivery`
                    : `₹${fmt(low / qty)} – ₹${fmt(high / qty)} estimated per piece`}
                </span>
              </div>
              {qty >= ((sku as any).moq || 500) * 3 && (
                <div className="mt-2 border-l-2 border-emerald-400 pl-2 text-xs" style={{ color: "#86efac" }}>
                  ✓ Volume discount applied — order more, pay less per piece
                </div>
              )}
              <div className="text-xs text-slate-500 mt-1.5">{buyingMode === "self" ? "Payable total includes GST, setup and the delivery shown above. The product rate is shown separately for a fair comparison." : "Excludes GST. Final pricing follows engineering and artwork review."}</div>
              {buyingMode === "self" && !paymentEligible && (
                <div className="mt-3 border border-slate-600 border-l-[3px] border-l-amber-400 bg-transparent p-3 text-xs leading-relaxed" style={{ color: "#FBD38D" }}>
                  Online payment is currently available up to ₹{RAZORPAY_PAYMENT_LIMIT_RUPEES.toLocaleString("en-IN")}. Submit this order plan and our team will confirm the payment route and production slot.
                </div>
              )}
            </>
          ) : (
            <div className="text-slate-500 text-sm">Select a product to see estimate</div>
          )}
        </div>

        {onSubmit && sku && (
          <>
            <button
              onClick={onSubmit}
              disabled={submitting}
              className="w-full py-3 rounded font-black uppercase tracking-widest text-sm transition-all hover:opacity-90 active:scale-95 flex items-center justify-center gap-2 mt-2"
              style={{ background: "#E8A838", color: "#0F1C2C" }}
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <>{buyingMode === "assisted" ? "REQUEST MANAGED QUOTE" : purchaseIntent === "cart" ? "ADD CONFIGURED ITEM TO CART" : "CONTINUE TO CHECKOUT"} <ArrowRight className="w-4 h-4" /></>}
            </button>

            <div className="mt-4 pt-4 border-t" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
              <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#94A3B8" }}>What happens next</p>
              <div className="flex flex-col gap-2.5">
                {(buyingMode === "assisted" ? [
                  { n: "1", text: "A packaging engineer checks compatibility and tooling" },
                  { n: "2", text: "You receive a production-ready technical quote" },
                  { n: "3", text: "Approve the specification before production starts" },
                ] : purchaseIntent === "cart" ? [
                  { n: "1", text: "Every selected size, material, finish and option stays attached" },
                  { n: "2", text: "Review this configured item alongside the rest of your cart" },
                  { n: "3", text: "Checkout once when your packaging order is complete" },
                ] : [
                  { n: "1", text: "Your selected size, material, finish and artwork stay attached" },
                  { n: "2", text: "Enter delivery and invoice details once at checkout" },
                  { n: "3", text: paymentEligible ? "Pay securely with Razorpay and track with your order reference" : "Packworkz confirms the payment route for totals above ₹50,000" },
                ]).map(({ n, text }) => (
                  <div key={n} className="flex items-start gap-2.5">
                    <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center border border-slate-600 text-xs font-black"
                      style={{ background: "transparent", color: "#7dd3fc" }}>
                      {n}
                    </span>
                    <p className="text-xs leading-relaxed" style={{ color: "#94A3B8" }}>{text}</p>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        <div className="flex items-start gap-2 pt-2">
          <Shield className="w-4 h-4 text-slate-500 mt-0.5 shrink-0" />
          <p className="text-xs text-slate-500">Reviewed by Packworkz Quality Assurance. Material certifications are provided where applicable.</p>
        </div>
      </div>
    </div>
  );
}

// ── Step Header ────────────────────────────────────────────────────────────
function StepHeader({ step, total, title, subtitle }: { step: number; total: number; title: string; subtitle?: string }) {
  return (
    <div className="flex items-start justify-between gap-4 mb-8">
      <div className="min-w-0">
        <div className="text-xs font-bold tracking-[0.2em] uppercase mb-2" style={{ color: "#1B6CA8" }}>
          STEP {String(step).padStart(2, "0")} OF {String(total).padStart(2, "0")}
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 break-words" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          {title}
        </h1>
        {subtitle && <p className="text-slate-400 text-sm mt-2">{subtitle}</p>}
        <div className="h-1 w-16 mt-3 rounded" style={{ background: "#1B6CA8" }} />
      </div>
      <div className="hidden sm:block text-right shrink-0">
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
            className="px-3 py-1.5 border text-xs font-bold transition-all"
            style={{
              borderColor: selected === opt ? "#0D1B2A" : "#D5DEE7",
              background: "#FFFFFF",
              color: selected === opt ? "#0D1B2A" : "#64748B",
              boxShadow: selected === opt ? "inset 0 -3px 0 #1B6CA8" : "none"
            }}
          >{opt}</button>
        ))}
      </div>
    </div>
  );
}

// ── Particle canvas ────────────────────────────────────────────────────────
function Particles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    let raf: number;

    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener("resize", resize);

    const DOTS = Array.from({ length: 70 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      r: Math.random() * 1.8 + 0.4,
      speed: Math.random() * 0.35 + 0.15,
      opacity: Math.random() * 0.18 + 0.04,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      DOTS.forEach(d => {
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${d.opacity})`;
        ctx.fill();
        d.y -= d.speed;
        if (d.y < -4) { d.y = canvas.height + 4; d.x = Math.random() * canvas.width; }
      });
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);
  return (
    <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }} />
  );
}

// ── Animated Confirmation Screen ───────────────────────────────────────────
type ConfirmationQuote = {
  contact_name?: string;
  company_name?: string;
  email?: string;
  phone?: string;
  items?: Array<{ product_name?: string; sku_code?: string; quantity?: number; custom_specs?: { standard_size?: string } }>;
};

const recoveryTokenKey = (quoteId: string) => `packworkz_checkout_${quoteId}`;
const paidOrderKey = (quoteId: string) => `packworkz_paid_${quoteId}`;

function readRecoveryToken(quoteId: string) {
  if (typeof window === "undefined") return null;
  return window.sessionStorage.getItem(recoveryTokenKey(quoteId));
}

function saveRecoveryToken(quoteId: string, token?: string) {
  if (typeof window === "undefined" || !token) return;
  window.sessionStorage.setItem(recoveryTokenKey(quoteId), token);
}

function readPaidOrder(quoteId: string): { orderId: string; recoveryMode: boolean } | null {
  if (typeof window === "undefined") return null;
  try {
    const value = JSON.parse(window.sessionStorage.getItem(paidOrderKey(quoteId)) || "null");
    return value?.orderId ? value : null;
  } catch {
    return null;
  }
}

function savePaidOrder(quoteId: string, orderId: string, recoveryMode = false) {
  if (typeof window === "undefined" || !orderId) return;
  window.sessionStorage.setItem(paidOrderKey(quoteId), JSON.stringify({ orderId, recoveryMode }));
}

function ConfirmationScreen({ quoteId, buyingMode }: { quoteId: string; buyingMode: "self" | "assisted" }) {
  const paidOrder = readPaidOrder(quoteId);
  const [quote, setQuote] = useState<ConfirmationQuote | null>(null);
  const [prepared, setPrepared] = useState<PreparedOrderPayment | null>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [orderId, setOrderId] = useState(paidOrder?.orderId || "");
  const [recoveryPaid, setRecoveryPaid] = useState(Boolean(paidOrder?.recoveryMode));
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const checkoutToken = readRecoveryToken(quoteId);
        const quoteResponse = await fetch(`/api/quotes/${encodeURIComponent(quoteId)}`, {
          headers: checkoutToken ? { "x-packworkz-checkout-token": checkoutToken } : undefined,
        });
        if (!quoteResponse.ok) throw new Error("We could not load this order plan.");
        const quoteData = await quoteResponse.json();
        if (!active) return;
        setQuote(quoteData);
        if (buyingMode === "self" && !paidOrder?.orderId) {
          const payment = await prepareOrderPayment(quoteId, checkoutToken);
          if (!active) return;
          setPrepared(payment);
          if (payment.status === "already_paid" && payment.order_id) setOrderId(payment.order_id);
        }
      } catch (cause) {
        if (active) setError(cause instanceof Error ? cause.message : "We could not prepare the next step.");
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => { active = false; };
  }, [buyingMode, quoteId]);

  const item = quote?.items?.[0];
  const isPaid = Boolean(orderId);
  const isQuote = buyingMode === "assisted";
  const gatewayPending = prepared?.status === "gateway_not_configured";
  const requiresConfirmation = prepared?.status === "manual_confirmation" || prepared?.status === "gateway_not_configured";
  const size = item?.sku_code && item.custom_specs?.standard_size
    ? COMMERCE_PRODUCTS[item.sku_code]?.sizes.find((candidate) => candidate.code === item.custom_specs?.standard_size)
    : undefined;
  const waMsg = encodeURIComponent(`Hi, my Packworkz reference is ${orderId || quoteId}. Please share the next update.`);

  const pay = async () => {
    if (!prepared) return;
    setPaying(true);
    setError("");
    try {
      await openOrderPayment({
        prepared,
        name: quote?.contact_name,
        email: quote?.email,
        contact: quote?.phone,
        description: `${item?.product_name || "Packaging"} · ${quoteId}`,
        onDismiss: () => setPaying(false),
        onError: (message) => {
          setPaying(false);
          setError(message);
        },
        onSuccess: (result) => {
          savePaidOrder(quoteId, result.order_id, Boolean(prepared.recovery_mode));
          setOrderId(result.order_id);
          setRecoveryPaid(Boolean(prepared.recovery_mode));
          setPaying(false);
        },
      });
    } catch (cause) {
      setPaying(false);
      setError(cause instanceof Error ? cause.message : "Payment could not be started.");
    }
  };

  const eyebrow = isPaid ? "PAYMENT VERIFIED" : isQuote ? "PRODUCTION BRIEF RECEIVED" : gatewayPending ? "ONLINE CHECKOUT PENDING" : requiresConfirmation ? "ORDER PLAN RECEIVED" : "SPECIFICATION LOCKED";
  const title = isPaid ? "Your order is confirmed." : isQuote ? "Your packaging brief is with our engineers." : gatewayPending ? "Online checkout is not active yet." : requiresConfirmation ? "We’ll confirm your payment route." : "One secure step remains.";
  const body = isPaid
    ? recoveryPaid
      ? "Payment is verified and your order is with the Packworkz order desk. We will send the production and tracking update to your checkout email and mobile."
      : "Payment is verified and the prepress review is queued. Nothing enters production until your artwork and specification pass the final check."
    : isQuote
      ? "Compatibility, tooling, supplier capacity and the production rate will be reviewed before we send an itemised commercial plan."
      : requiresConfirmation
        ? prepared?.message || "Your specification is saved. Our team will confirm payment and the production slot directly."
        : "Your size, quantity, artwork route, delivery and GST are already attached. Pay without configuring anything again.";

  const steps = isPaid && recoveryPaid ? [
    ["01", "Payment verified", "Your payment and specification are tied to this Packworkz reference."],
    ["02", "Order desk sync", "Our team restores the order record and confirms the production slot."],
    ["03", "Production updates", "Tracking updates are sent to your checkout email and mobile."],
  ] : isPaid ? [
    ["01", "Payment verified", "Your payment and specification are tied to one Packworkz order."],
    ["02", "Artwork preflight", "We check dimensions, bleed, colour and print readiness before production."],
    ["03", "Production + SmartStock", "Track production now and get an earlier reorder signal after delivery."],
  ] : isQuote ? [
    ["01", "Technical review", "Material, dimensions, tooling and compliance are checked."],
    ["02", "Itemised commercial", "You receive final pricing, lead time and payment milestones."],
    ["03", "Approval before production", "No tooling or manufacturing begins without your approval."],
  ] : gatewayPending ? [
    ["01", "Specification saved", "Your exact product, size, quantity and artwork route are already in Packworkz."],
    ["02", "Online checkout activation", "Once the payment gateway is live, eligible orders continue directly to secure payment here."],
    ["03", "Prepress and production", "Artwork is checked before the approved production slot begins."],
  ] : requiresConfirmation ? [
    ["01", "Specification saved", "Your exact order plan is already in Packworkz."],
    ["02", "Payment route confirmed", "We confirm bank transfer, split payment or a secure payment link."],
    ["03", "Prepress and production", "Artwork is checked before the approved production slot begins."],
  ] : [
    ["01", "Specification locked", "No product or size needs to be selected again."],
    ["02", "Razorpay checkout", "Pay securely on this page with UPI, card or netbanking."],
    ["03", "Order confirmation", "Receive an order ID and move directly into prepress review."],
  ];

  return (
    <main className="min-h-[calc(100vh-68px)] relative overflow-hidden" style={{ background: "#071522", color: "white" }}>
      <Particles />
      <div className="relative z-10 max-w-6xl mx-auto px-5 sm:px-8 py-16 sm:py-24">
        <div className="grid lg:grid-cols-[1.05fr_0.95fr] border" style={{ borderColor: "rgba(255,255,255,0.14)", background: "rgba(11,28,43,0.96)" }}>
          <section className="p-7 sm:p-12 lg:p-16 border-b lg:border-b-0 lg:border-r" style={{ borderColor: "rgba(255,255,255,0.12)" }}>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-11 h-11 flex items-center justify-center" style={{ background: isPaid ? "#1B8A5A" : "#E8A838", color: "#071522" }}>
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-6 h-6" />}
              </div>
              <span className="text-[11px] font-black tracking-[0.2em]" style={{ color: isPaid ? "#62D39B" : "#E8A838" }}>{eyebrow}</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-black leading-[1.04] mb-5" style={{ fontFamily: "'Space Grotesk', sans-serif", letterSpacing: 0 }}>{title}</h1>
            <p className="text-base sm:text-lg leading-relaxed max-w-xl" style={{ color: "#9FB0C2" }}>{body}</p>

            <div className="mt-9 py-5 border-y grid grid-cols-2 gap-5" style={{ borderColor: "rgba(255,255,255,0.1)" }}>
              <div>
                <span className="block text-[10px] uppercase tracking-[0.16em] mb-1" style={{ color: "#71859A" }}>{isPaid ? "Order ID" : "Reference"}</span>
                <strong className="font-mono text-sm sm:text-base" style={{ color: "#E8A838" }}>{orderId || quoteId}</strong>
              </div>
              <div>
                <span className="block text-[10px] uppercase tracking-[0.16em] mb-1" style={{ color: "#71859A" }}>Order plan</span>
                <strong className="text-sm sm:text-base">{item?.product_name || (loading ? "Loading…" : "Packaging")}</strong>
                {size && <span className="block text-xs mt-1" style={{ color: "#8CA0B4" }}>{formatMeasurementInCm(size.label)} · {formatMeasurementInCm(size.detail)}</span>}
              </div>
            </div>

            {prepared?.amount_rupees ? (
              <div className="mt-7 flex items-end justify-between gap-4">
                <div>
                  <span className="block text-[10px] uppercase tracking-[0.16em] mb-1" style={{ color: "#71859A" }}>{isPaid ? "Amount paid" : requiresConfirmation ? "Order value" : "Secure payment"}</span>
                  <strong className="text-3xl font-black">₹{prepared.amount_rupees.toLocaleString("en-IN", { maximumFractionDigits: 2 })}</strong>
                  <span className="block text-xs mt-1" style={{ color: "#71859A" }}>GST and listed delivery included</span>
                  {!!prepared.discount_rupees && (
                    <span className="inline-flex mt-3 px-3 py-1.5 text-xs font-black" style={{ background: "rgba(98,211,155,0.12)", color: "#62D39B", border: "1px solid rgba(98,211,155,0.3)" }}>
                      {prepared.promotion_code || LAUNCH_PROMOTION_CODE} saved ₹{prepared.discount_rupees.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                    </span>
                  )}
                </div>
              </div>
            ) : null}

            {!loading && prepared?.status === "ready" && !isPaid && (
              <button type="button" onClick={pay} disabled={paying} className="mt-8 w-full sm:w-auto px-7 py-4 font-black flex items-center justify-center gap-3 transition-transform hover:-translate-y-0.5 disabled:opacity-60" style={{ background: "#E8A838", color: "#071522" }}>
                {paying ? <><Loader2 className="w-5 h-5 animate-spin" /> Opening secure payment</> : <>Pay securely with Razorpay <ArrowRight className="w-5 h-5" /></>}
              </button>
            )}

            {error && <div className="mt-6 p-4 text-sm" style={{ background: "rgba(220,38,38,0.12)", border: "1px solid rgba(248,113,113,0.35)", color: "#FCA5A5" }}>{error}</div>}
          </section>

          <aside className="p-7 sm:p-12 lg:p-14" style={{ background: "#0E2030" }}>
            <p className="text-[11px] font-black uppercase tracking-[0.2em] mb-7" style={{ color: "#7CB5E4" }}>What happens next</p>
            <div>
              {steps.map(([number, heading, detail], index) => (
                <div key={number} className="grid grid-cols-[42px_1fr] gap-4 pb-7 mb-7 border-b last:border-b-0 last:mb-0 last:pb-0" style={{ borderColor: "rgba(255,255,255,0.1)" }}>
                  <span className="font-mono text-sm pt-0.5" style={{ color: index === 0 ? "#E8A838" : "#577087" }}>{number}</span>
                  <div>
                    <h2 className="font-bold text-base mb-2">{heading}</h2>
                    <p className="text-sm leading-relaxed" style={{ color: "#8FA3B6" }}>{detail}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-9 flex flex-col sm:flex-row lg:flex-col gap-3">
              <a href={`https://wa.me/918208990366?text=${waMsg}`} target="_blank" rel="noopener noreferrer" className="px-5 py-3.5 text-center font-bold text-sm border" style={{ borderColor: "rgba(255,255,255,0.24)", color: "white" }}>Message order desk</a>
              <Link href={isPaid && !recoveryPaid ? `/track-order?reference=${encodeURIComponent(orderId || quoteId)}` : "/products"} className="px-5 py-3.5 text-center font-bold text-sm" style={{ background: "#18344A", color: "#D7E5F0" }}>{isPaid && !recoveryPaid ? "Track without an account" : "Browse products"}</Link>
              {isPaid && !recoveryPaid && (
                <Link href={`/signup?claim=${encodeURIComponent(orderId || quoteId)}`} className="px-5 py-3.5 text-center font-bold text-sm border" style={{ borderColor: "#E8A838", color: "#E8A838" }}>
                  Create account and save this order
                </Link>
              )}
            </div>
            {isPaid && <p className="mt-4 text-xs leading-relaxed" style={{ color: "#71859A" }}>{recoveryPaid ? "Keep this reference. The order desk will send the next update to the checkout email and mobile." : "Track as a guest with this order ID and the checkout email or mobile, or create an account to keep orders, quotes and reorders together."}</p>}
          </aside>
        </div>
      </div>
    </main>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// Main configure component
// ══════════════════════════════════════════════════════════════════════════════
export default function Quote({ params }: { params?: { step?: string; id?: string } }) {
  const stepNum = params?.step ? parseInt(params.step) : params?.id ? 99 : 1;
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { addItem } = useCart();
  const [purchaseIntent] = useState<"cart" | "buy">(() => {
    if (typeof window === "undefined") return "buy";
    const intent = new URLSearchParams(window.location.search).get("intent") || loadDraft().purchaseIntent;
    return intent === "cart" ? "cart" : "buy";
  });

  // ── Contact ──────────────────────────────────────────────────────────────
  const [contactName, setContactName] = useState<string>(() => loadDraft().contactName || "");
  const [company, setCompany] = useState<string>(() => loadDraft().company || "");
  const [email, setEmail] = useState<string>(() => loadDraft().email || "");
  const [phone, setPhone] = useState<string>(() => loadDraft().phone || "");
  const [buyingAsBusiness, setBuyingAsBusiness] = useState<boolean>(() => loadDraft().buyingAsBusiness ?? true);
  const [gstRegistered, setGstRegistered] = useState<boolean>(() => loadDraft().gstRegistered ?? true);
  const [gstin, setGstin] = useState<string>(() => loadDraft().gstin || "");
  const [poReference, setPoReference] = useState<string>(() => loadDraft().poReference || "");

  // ── SKU selection ────────────────────────────────────────────────────────
  const [selectedCategory, setSelectedCategory] = useState<string>(() => loadDraft().selectedCategory || CATEGORIES[0].slug);
  const [ecoFilter, setEcoFilter] = useState<boolean>(() => loadDraft().ecoFilter ?? false);
  const [catalogQuery, setCatalogQuery] = useState("");
  const [selectedSkuId, setSelectedSkuId] = useState<string>(() => {
    const savedSkuId = loadDraft().selectedSkuId;
    if (savedSkuId === "LC-801") return SKUS.find((sku) => sku.code === "LC-816")?.id || SKUS[0].id;
    return SKUS.some((sku) => sku.id === savedSkuId) ? savedSkuId : SKUS[0].id;
  });
  const [catalogOpen, setCatalogOpen] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    const search = new URLSearchParams(window.location.search);
    return !search.get("sku") && !search.get("product");
  });
  const [mobileIntentChosen, setMobileIntentChosen] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    const search = new URLSearchParams(window.location.search);
    return Boolean(search.get("sku") || search.get("product"));
  });
  const [mobileBrowseAll, setMobileBrowseAll] = useState(false);
  const [mobileShowAllResults, setMobileShowAllResults] = useState(false);
  const [showCategories, setShowCategories] = useState(false);
  const [qty, setQty] = useState<number>(() => loadDraft().qty || SKUS[0].moq);
  const [qtyUnit, setQtyUnit] = useState<'pieces' | 'kg'>(() => loadDraft().qtyUnit || 'pieces');
  const [variantSelections, setVariantSelections] = useState<Record<string, string>>(() => loadDraft().variantSelections || {});
  const [customFieldValues, setCustomFieldValues] = useState<Record<string, string>>(() => loadDraft().customFieldValues || {});
  const [selectedSizeCode, setSelectedSizeCode] = useState<string>(() => loadDraft().selectedSizeCode || COMMERCE_PRODUCTS[SKUS[0].code]?.sizes[0]?.code || "");
  const [dimUnit, setDimUnit] = useState<"mm"|"cm"|"in">("cm");
  const [weightUnit, setWeightUnit] = useState<"g"|"kg"|"t">("g");

  // ── Artwork / Design ─────────────────────────────────────────────────────
  const [artworkOption, setArtworkOption] = useState<ArtworkOption>(() => loadDraft().artworkOption || "upload");
  const [designPaid, setDesignPaid] = useState<boolean>(() => loadDraft().designPaid ?? false);
  const [designPaying, setDesignPaying] = useState(false);
  const [artworkFile, setArtworkFile] = useState<File | null>(null);
  const [artworkUploading, setArtworkUploading] = useState(false);
  const [artworkFileUrl, setArtworkFileUrl] = useState<string>(() => loadDraft().artworkFileUrl || "");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleArtworkFile = useCallback(async (file: File) => {
    setArtworkFile(file);
    setArtworkUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("company", company);
      formData.append("originalName", file.name);
      const res = await fetch("/api/upload/artwork", { method: "POST", body: formData });
      if (res.ok) {
        const { url } = await res.json();
        setArtworkFileUrl(url);
        saveDraft({ ...loadDraft(), artworkFileUrl: url });
      } else {
        // fallback: store filename only
        setArtworkFileUrl(`local:${file.name}`);
        saveDraft({ ...loadDraft(), artworkFileUrl: `local:${file.name}` });
      }
    } catch {
      setArtworkFileUrl(`local:${file.name}`);
      saveDraft({ ...loadDraft(), artworkFileUrl: `local:${file.name}` });
    } finally {
      setArtworkUploading(false);
    }
  }, [company]);

  // ── Delivery ─────────────────────────────────────────────────────────────
  const [deliveryOption, setDeliveryOption] = useState<DeliveryOption>(() => loadDraft().deliveryOption || "standard");

  // ── Sample ───────────────────────────────────────────────────────────────
  const [sampleOption, setSampleOption] = useState<"express" | "standard" | "none">(() => loadDraft().sampleOption || "none");
  const [samplePaid, setSamplePaid] = useState<boolean>(() => loadDraft().samplePaid ?? false);
  const [notes, setNotes] = useState<string>(() => loadDraft().notes || "");
  const [checkoutLaunching, setCheckoutLaunching] = useState(false);

  const submitMutation = useSubmitQuote();

  // ── Read URL params on mount to pre-select SKU from product pages ─────────
  useEffect(() => {
    const search = new URLSearchParams(window.location.search);
    const rawSkuParam = search.get("sku");
    const skuParam = rawSkuParam === "LC-801" ? "LC-816" : rawSkuParam;
    const productParam = search.get("product");
    const qtyParam = search.get("qty");
    const structureParam = search.get("structure");
    const match = skuParam
      ? SKUS.find(s => s.code === skuParam || s.id === skuParam || s.slug === skuParam)
      : productParam
      ? SKUS.find(s => s.code === productParam || s.id === productParam || s.slug === productParam)
      : null;
    if (match) {
      setSelectedSkuId(match.id);
      setSelectedCategory(match.category);
      const defaults: Record<string, string> = {};
      match.variants.forEach(g => { defaults[g.key] = g.options[0]; });
      if (structureParam) {
        const structureGroup = match.variants.find((group) => group.key === "structure");
        if (structureGroup?.options.includes(structureParam)) defaults.structure = structureParam;
      }
      setVariantSelections(defaults);
      setSelectedSizeCode(COMMERCE_PRODUCTS[match.code]?.sizes[0]?.code || "");
    }
    if (qtyParam) {
      const q = parseInt(qtyParam);
      if (q > 0) setQty(q);
    }
  }, []);

  // ── Helper: collect all state into one object for saving ──────────────────
  const getAllState = () => ({
    contactName, company, email, phone, buyingAsBusiness, gstRegistered, gstin, poReference,
    selectedCategory, selectedSkuId, qty, qtyUnit, variantSelections, customFieldValues, selectedSizeCode, ecoFilter,
    artworkOption, designPaid, artworkFileUrl,
    deliveryOption,
    sampleOption, samplePaid, notes,
    purchaseIntent,
  });

  // ── Navigation with save ──────────────────────────────────────────────────
  const handleNext = () => {
    if (stepNum === 1 && !selectedSku) {
      toast({ variant: "destructive", title: "Choose a product", description: "Select the packaging you want before continuing." }); return;
    }
    if (stepNum === 3) {
      if (!contactName.trim()) { toast({ variant: "destructive", title: "Required field missing", description: "Please enter your contact name." }); return; }
      if (!company.trim()) { toast({ variant: "destructive", title: "Required field missing", description: "Please enter your company name." }); return; }
      if (!email.trim() || !email.includes("@")) { toast({ variant: "destructive", title: "Required field missing", description: "Please enter a valid business email." }); return; }
      if (!phone.trim()) { toast({ variant: "destructive", title: "Required field missing", description: "Please enter your phone / WhatsApp number." }); return; }
      if (buyingAsBusiness && gstRegistered && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/.test(gstin.trim().toUpperCase())) {
        toast({ variant: "destructive", title: "Check GSTIN", description: "Enter a valid 15-character GSTIN or choose 'Not GST registered'." }); return;
      }
    }
    saveDraft(getAllState());
    setLocation(`/configure/step/${stepNum + 1}?intent=${purchaseIntent}`);
  };
  const handleBack = () => {
    saveDraft(getAllState());
    stepNum > 1 ? setLocation(`/configure/step/${stepNum - 1}?intent=${purchaseIntent}`) : setLocation("/");
  };

  const normalizedCatalogQuery = catalogQuery.trim().toLowerCase();
  const currentCatSkus = useMemo(() => {
    const source = normalizedCatalogQuery || mobileBrowseAll ? SKUS : getSkusByCategory(selectedCategory);
    return source.filter((sku) => {
      if (ecoFilter && !sku.is_eco) return false;
      if (!normalizedCatalogQuery) return true;
      const category = CATEGORIES.find((item) => item.slug === sku.category)?.label || "";
      return [
        sku.name,
        sku.code,
        sku.description,
        sku.use_case,
        category,
      ].join(" ").toLowerCase().includes(normalizedCatalogQuery);
    });
  }, [ecoFilter, mobileBrowseAll, normalizedCatalogQuery, selectedCategory]);

  const selectedSku = useMemo(() => SKUS.find(s => s.id === selectedSkuId), [selectedSkuId]);
  const selectedSkuMoq = selectedSku
    ? getMinimumQuantityForConfiguration(selectedSku.code, variantSelections) || selectedSku.moq
    : 500;
  const commerceProduct = selectedSku ? COMMERCE_PRODUCTS[selectedSku.code] : undefined;
  const selectedSkuBuyingMode = selectedSku && !isAssistedSku(selectedSku) && !requiresQuote(selectedSku, qty) ? "self" : "assisted";
  const quantityPresets = useMemo(() => {
    if (!selectedSku || qtyUnit !== "pieces") return [50, 100, 250, 500, 1000];
    const tierQuantities = (selectedSku.price_tiers || [])
      .map((tier) => tier.min_qty)
      .filter((quantity) => quantity >= selectedSkuMoq)
      .filter((quantity) => !selectedSku.quote_threshold || quantity < selectedSku.quote_threshold);
    return tierQuantities.length ? tierQuantities : [selectedSkuMoq, selectedSkuMoq * 2, selectedSkuMoq * 5];
  }, [qtyUnit, selectedSku, selectedSkuMoq]);

  useEffect(() => {
    if (qtyUnit === "pieces" && selectedSku && qty < selectedSkuMoq) setQty(selectedSkuMoq);
  }, [qty, qtyUnit, selectedSku, selectedSkuMoq]);

  useEffect(() => {
    if (!commerceProduct) return;
    if (!commerceProduct.sizes.some((item) => item.code === selectedSizeCode)) {
      setSelectedSizeCode(commerceProduct.sizes[0].code);
    }
    if (qtyUnit !== "pieces") setQtyUnit("pieces");
  }, [commerceProduct, qtyUnit, selectedSizeCode]);

  const initVariants = (sku: Sku) => {
    const defaults: Record<string, string> = {};
    sku.variants.forEach(g => { defaults[g.key] = g.options[0]; });
    setVariantSelections(defaults);
    return defaults;
  };

  const handleSelectSku = (skuId: string) => {
    setSelectedSkuId(skuId);
    const sku = SKUS.find(s => s.id === skuId);
    if (sku) {
      setSelectedCategory(sku.category);
      const defaults = initVariants(sku);
      setSelectedSizeCode(COMMERCE_PRODUCTS[sku.code]?.sizes[0]?.code || "");
      if (qtyUnit === "pieces") setQty(prev => Math.max(prev, getMinimumQuantityForConfiguration(sku.code, defaults)));
    }
    setCatalogOpen(false);
    if (typeof window !== "undefined" && window.innerWidth < 640) {
      setCatalogOpen(false);
      window.requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: "smooth" }));
    }
  };

  const handleSelectCategory = (slug: string) => {
    setCatalogQuery("");
    setMobileIntentChosen(true);
    setSelectedCategory(slug);
    const first = getSkusByCategory(slug)[0];
    if (first) {
      setSelectedSkuId(first.id);
      const defaults = initVariants(first);
      setSelectedSizeCode(COMMERCE_PRODUCTS[first.code]?.sizes[0]?.code || "");
      if (qtyUnit === "pieces") setQty(getMinimumQuantityForConfiguration(first.code, defaults));
    }
  };

  const handleMobileIntent = (category: string) => {
    setMobileIntentChosen(true);
    setCatalogOpen(true);
    setMobileBrowseAll(category === "all");
    setMobileShowAllResults(category === "all");
    if (category === "all") return;
    handleSelectCategory(category);
  };

  useEffect(() => {
    if (stepNum > TOTAL_STEPS && stepNum !== 99) setLocation(`/configure/step/${TOTAL_STEPS}`);
  }, [setLocation, stepNum]);

  const handleSubmit = () => {
    if (selectedSku && selectedSkuBuyingMode === "self") {
      const item = createConfiguredCartItem(selectedSku, {
        quantity: qty,
        sizeCode: selectedSizeCode,
        variantSelections,
        customSpecs: customFieldValues,
        artworkOption,
        artworkFileUrl: artworkFileUrl || undefined,
        deliveryOption,
        sampleOption,
      });
      if (!item) {
        toast({
          variant: "destructive",
          title: "This order needs a specialist review",
          description: "The selected configuration or quantity requires a managed quote.",
        });
        return;
      }
      addItem(item);
      try {
        sessionStorage.setItem("packworkz_checkout_prefill", JSON.stringify({
          contactName,
          company,
          email,
          phone,
          gstin: buyingAsBusiness && gstRegistered ? gstin.trim().toUpperCase() : "",
        }));
      } catch {}
      clearDraft();
      setLocation(purchaseIntent === "cart" ? "/cart" : "/cart/checkout");
      return;
    }
    const pricedArtwork = artworkOption === "design" && designPaid ? "upload" : artworkOption;
    const { low, high } = calcPrice(selectedSku, qty, deliveryOption, pricedArtwork, selectedSizeCode, variantSelections);
    submitMutation.mutate({
      data: {
        contact_name: contactName, company_name: company, email, phone,
        delivery_country: "India",
        delivery_pincode: "",
        preferred_timeline: (deliveryOption as any),
        notes: [
          notes,
          artworkFile ? `Artwork file: ${artworkFile.name}` : "",
          buyingAsBusiness ? `Business purchase: ${gstRegistered ? `GSTIN ${gstin.trim().toUpperCase()}` : "Not GST registered"}` : "Consumer purchase",
          poReference.trim() ? `PO reference: ${poReference.trim()}` : "",
        ].filter(Boolean).join("\n"),
        total_estimated_min: low,
        total_estimated_max: high,
        items: [{
          product_id: selectedSkuId,
          sku_code: selectedSku?.code,
          product_name: selectedSku?.name || selectedSkuId,
          category: selectedCategory,
          quantity: qty, quantity_unit: qtyUnit,
          artwork_status: artworkOption,
          artwork_file_url: artworkFileUrl || undefined,
          variant_selections: {
            ...variantSelections,
            promotion_code: LAUNCH_PROMOTION_CODE,
          },
          custom_specs: {
            ...(Object.keys(customFieldValues).length ? customFieldValues : {}),
            ...(selectedSizeCode ? { standard_size: selectedSizeCode } : {}),
          },
          sample_requested: sampleOption !== "none",
          sample_tier: sampleOption === "express" ? "premium" : sampleOption === "standard" ? "standard" : "none",
          design_paid: designPaid,
          sample_paid: samplePaid,
        }],
        artwork_option: artworkOption,
        sample_option: sampleOption,
        design_paid: designPaid,
        sample_paid: samplePaid,
        buying_mode: selectedSkuBuyingMode,
      } as any
    }, {
      onSuccess: async (res) => {
        const response = res as typeof res & { checkout_token?: string };
        saveRecoveryToken(response.quote_id, response.checkout_token);
        clearDraft();
        const confirmationPath = `/configure/confirmed/${response.quote_id}?mode=${selectedSkuBuyingMode}`;
        if (selectedSkuBuyingMode === "assisted") {
          setLocation(confirmationPath);
          return;
        }

        setCheckoutLaunching(true);
        try {
          const prepared = await prepareOrderPayment(response.quote_id, response.checkout_token);
          if (prepared.status !== "ready") {
            setCheckoutLaunching(false);
            setLocation(confirmationPath);
            return;
          }

          await openOrderPayment({
            prepared,
            name: contactName,
            email,
            contact: phone,
            description: `${selectedSku?.name || "Packaging order"} · ${response.quote_id}`,
            onSuccess: (result) => {
              savePaidOrder(response.quote_id, result.order_id, Boolean(prepared.recovery_mode));
              setCheckoutLaunching(false);
              setLocation(confirmationPath);
            },
            onDismiss: () => {
              setCheckoutLaunching(false);
              setLocation(confirmationPath);
            },
            onError: (message) => {
              setCheckoutLaunching(false);
              toast({
                variant: "destructive",
                title: "Payment was not completed",
                description: `${message} Your order plan is saved and can be paid safely from the next screen.`,
              });
              setLocation(confirmationPath);
            },
          });
        } catch (error) {
          setCheckoutLaunching(false);
          toast({
            variant: "destructive",
            title: "Secure checkout could not open",
            description: "Your order plan is saved. Retry payment safely from the next screen.",
          });
          setLocation(confirmationPath);
        }
      },
      onError: () => toast({ variant: "destructive", title: "Submission Failed", description: "Please try again." })
    });
  };

  // ── Confirmed screen ──────────────────────────────────────────────────────
  if (params?.id) {
    return (
      <ConfirmationScreen
        quoteId={params.id}
        buyingMode={new URLSearchParams(window.location.search).get("mode") === "assisted" ? "assisted" : "self"}
      />
    );
  }

  const isLastStep = stepNum === TOTAL_STEPS;

  return (
    <div className="min-h-screen pt-[104px] md:pt-[108px]" style={{ background: "#F8F9FC", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* ── Progress strip ── */}
      <div className="bg-white border-b border-slate-100 px-4 md:px-8 py-3">
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
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-7 md:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

          {/* ── Left panel ── */}
          <div className="lg:col-span-2 space-y-6">

            {/* ── STEP 3: Contact Info ── */}
            {stepNum === 3 && (
              <>
                <StepHeader step={3} total={TOTAL_STEPS} title="Where should we send updates?" subtitle="Checkout works without an account. Add the contact details for this order." />
                <div className="bg-white rounded-lg border border-slate-200 p-6">
                  <div className="grid md:grid-cols-2 gap-5">
                    {[
                      { label: "Contact Name", value: contactName, set: setContactName, type: "text", placeholder: "Rahul Sharma", required: true },
                      { label: "Company Name", value: company, set: setCompany, type: "text", placeholder: "Acme Foods Pvt. Ltd.", required: true },
                      { label: "Business Email", value: email, set: setEmail, type: "email", placeholder: "rahul@acmefoods.in", required: true },
                      { label: "Phone / WhatsApp", value: phone, set: setPhone, type: "tel", placeholder: "+91 98765 43210", required: true },
                    ].map(({ label, value, set, type, placeholder, required }) => (
                      <div key={label}>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                          {label}{required && <span style={{ color: "#E04B4B" }}> *</span>}
                        </label>
                        <input type={type} value={value} onChange={e => set(e.target.value)} placeholder={placeholder}
                          className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-400 transition-colors bg-slate-50 focus:bg-white" />
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 pt-6 border-t border-slate-200">
                    <label className="flex items-center justify-between gap-4 cursor-pointer">
                      <span><strong className="block text-sm text-slate-800">Buying as a business</strong><small className="text-slate-500">Add tax identity and purchase-order details to the order record.</small></span>
                      <input type="checkbox" checked={buyingAsBusiness} onChange={(event) => setBuyingAsBusiness(event.target.checked)} className="w-5 h-5 accent-slate-900" />
                    </label>
                    {buyingAsBusiness && (
                      <div className="mt-5 grid md:grid-cols-2 gap-5">
                        <div>
                          <div className="flex items-center justify-between gap-3 mb-1.5">
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">GSTIN{gstRegistered && <span style={{ color: "#E04B4B" }}> *</span>}</label>
                            <label className="flex items-center gap-2 text-xs text-slate-500 cursor-pointer"><input type="checkbox" checked={!gstRegistered} onChange={(event) => { setGstRegistered(!event.target.checked); if (event.target.checked) setGstin(""); }} /> Not GST registered</label>
                          </div>
                          <input value={gstin} disabled={!gstRegistered} maxLength={15} onChange={(event) => setGstin(event.target.value.toUpperCase().replace(/[^0-9A-Z]/g, ""))} placeholder={gstRegistered ? "22AAAAA0000A1Z5" : "Not required"} className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-400 transition-colors bg-slate-50 disabled:opacity-55" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">PO reference <span className="normal-case font-normal">(optional)</span></label>
                          <input value={poReference} onChange={(event) => setPoReference(event.target.value)} placeholder="e.g. PO-2026-041" className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-400 transition-colors bg-slate-50" />
                        </div>
                        <p className="md:col-span-2 text-xs text-slate-500">GST and HSN are verified against the final product specification before the tax invoice is issued.</p>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* ── STEP 1: Product & Quantity ── */}
            {stepNum === 1 && (
              <>
                <StepHeader step={1} total={TOTAL_STEPS} title="What do you need to package?" subtitle="Choose the closest match. You can change it later, and we check every specification before production." />

                {catalogOpen && <div className="bg-white border border-slate-200 p-4 sm:p-5">
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div>
                      <p className="text-sm font-black text-slate-900">What are you selling?</p>
                      <p className="mt-1 text-xs leading-relaxed text-slate-500">Start here if packaging terms are unfamiliar.</p>
                    </div>
                    {mobileIntentChosen && (
                      <button type="button" onClick={() => setMobileIntentChosen(false)} className="text-xs font-bold text-blue-700 shrink-0">Change</button>
                    )}
                  </div>
                  {!mobileIntentChosen ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                      {MOBILE_SHOPPING_INTENTS.map((intent) => (
                        <button
                          key={intent.label}
                          type="button"
                          onClick={() => handleMobileIntent(intent.category)}
                          className="w-full min-h-[72px] border border-slate-200 bg-white px-3 py-2.5 flex items-center gap-3 text-left hover:border-slate-500 active:bg-slate-50"
                        >
                          <span className="w-10 h-10 bg-slate-100 flex items-center justify-center shrink-0">
                            <MS icon={intent.icon} className="text-xl text-slate-700" />
                          </span>
                          <span className="min-w-0 flex-1">
                            <strong className="block text-sm text-slate-900 leading-tight">{intent.label}</strong>
                            <span className="block mt-1 text-xs text-slate-500 leading-tight">{intent.help}</span>
                          </span>
                          <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 border-l-4 border-navy bg-white px-3 py-3">
                      <CheckCircle2 className="w-5 h-5 text-navy shrink-0" />
                      <div>
                        <strong className="block text-sm text-slate-900">Recommended formats ready</strong>
                        <span className="block text-xs text-slate-500">Pick one below, then choose a standard size and quantity.</span>
                      </div>
                    </div>
                  )}
                  <div className="relative mt-4">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    <input
                      type="search"
                      value={catalogQuery}
                      onChange={(event) => {
                        setCatalogQuery(event.target.value);
                        if (event.target.value) {
                          setMobileIntentChosen(true);
                          setMobileBrowseAll(true);
                        }
                      }}
                      placeholder="Or search: coffee pouch, shampoo bottle, shipping box…"
                      aria-label="Search packaging products"
                      className="w-full h-12 border border-slate-300 bg-white pl-10 pr-11 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-navy"
                    />
                    {catalogQuery && <button type="button" onClick={() => setCatalogQuery("")} aria-label="Clear product search" className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-slate-400 hover:text-navy"><X className="w-4 h-4" /></button>}
                  </div>
                  <button type="button" onClick={() => setShowCategories((open) => !open)} className="mt-4 inline-flex items-center gap-2 text-xs font-black text-navy">
                    {showCategories ? "Hide packaging types" : "Browse all packaging types"}
                    <ChevronDown className={`w-4 h-4 transition-transform ${showCategories ? "rotate-180" : ""}`} />
                  </button>
                </div>}

                {/* Category grid */}
                {catalogOpen && showCategories && <div className="bg-white rounded-none border border-slate-200 p-5">
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
                        className="flex flex-col items-center gap-1.5 p-3 rounded-none border-2 transition-all"
                        style={{ borderColor: selectedCategory === cat.slug ? "#0D1B2A" : "#E2E8F0", background: "white" }}
                      >
                        <MS icon={cat.icon} className={`text-2xl ${selectedCategory === cat.slug ? "" : "text-slate-400"}`}
                          style={{ color: selectedCategory === cat.slug ? "#1B6CA8" : undefined } as any} />
                        <span className="text-xs font-bold text-center leading-tight" style={{ color: selectedCategory === cat.slug ? "#1B6CA8" : "#64748B" }}>
                          {cat.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>}

                {/* SKU cards */}
                <div className={`${catalogOpen && !mobileIntentChosen ? "hidden" : "block"} bg-white rounded-none border border-slate-200 p-4 sm:p-5`}>
                  <div className="flex items-center justify-between gap-4 mb-4">
                    <div className="font-bold text-slate-800 text-sm" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                      {catalogOpen ? (normalizedCatalogQuery ? "Search results" : "Choose a product") : "Your selected product"}
                      {catalogOpen && !normalizedCatalogQuery && <span className="font-normal text-slate-400"> — {CATEGORIES.find(c => c.slug === selectedCategory)?.label}</span>}
                    </div>
                    {!catalogOpen && (
                      <button type="button" onClick={() => setCatalogOpen(true)} className="text-xs font-bold text-blue hover:text-navy">
                        Change product
                      </button>
                    )}
                  </div>
                  {selectedSku && !catalogOpen && (
                    <div className="mb-5 grid md:grid-cols-[minmax(0,1.2fr)_minmax(250px,0.8fr)] border border-slate-200 bg-slate-50">
                      <div className="relative aspect-[4/3] md:aspect-auto md:min-h-[310px] overflow-hidden bg-white border-b md:border-b-0 md:border-r border-slate-200">
                        <img
                          src={getCatalogImage(selectedSku)}
                          alt={`${selectedSku.name} customised packaging example`}
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                        <span className="absolute left-4 top-4 bg-navy px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.14em] text-white">
                          Selected · {selectedSku.code}
                        </span>
                      </div>
                      <div className="p-5 md:p-6 flex flex-col justify-center">
                        <div className="flex flex-wrap gap-2 mb-3">
                          {selectedSku.is_eco && <span className="text-[10px] px-2 py-1 font-black uppercase tracking-wider" style={{ background: "rgba(22,163,74,0.1)", color: "#15803D" }}>Lower impact</span>}
                          <span className="text-[10px] px-2 py-1 font-black uppercase tracking-wider" style={{ background: isAssistedSku(selectedSku) ? "rgba(232,168,56,0.14)" : "rgba(27,108,168,0.10)", color: isAssistedSku(selectedSku) ? "#92600A" : "#1B6CA8" }}>
                            {isAssistedSku(selectedSku) ? "Managed quote" : "Instant buy"}
                          </span>
                          <span className="text-[10px] px-2 py-1 font-black uppercase tracking-wider" style={{ background: "#0D1B2A", color: "#FFFFFF" }}>Custom printed</span>
                        </div>
                        <h3 className="text-xl md:text-2xl font-black text-navy leading-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{selectedSku.name}</h3>
                        <p className="mt-3 text-sm leading-relaxed text-slate-600">{selectedSku.description}</p>
                        {customisationNote(selectedSku) && (
                          <div className="mt-4 border-l-4 border-gold bg-white px-4 py-3">
                            <p className="text-xs font-black uppercase tracking-[0.12em] text-navy mb-1">Customised as per your brand</p>
                            <p className="text-xs leading-relaxed text-slate-600">{customisationNote(selectedSku)}</p>
                          </div>
                        )}
                        <div className="mt-5 pt-4 border-t border-slate-200 text-xs font-bold text-slate-600">
                          MOQ {selectedSku.moq.toLocaleString()} {selectedSku.moq_unit} · ₹{selectedSku.price_min.toFixed(2)}-₹{selectedSku.price_max.toFixed(2)}/unit
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="mb-4 rounded-none border border-slate-300 bg-white px-4 py-3">
                    <p className="text-xs leading-relaxed text-slate-700">
                      <strong>{selectedSkuBuyingMode === "assisted" ? "Managed quote:" : "Instant buy:"}</strong>{" "}
                      {selectedSkuBuyingMode === "assisted"
                        ? "This product needs a quick expert check before we confirm price and production timing."
                        : "Choose a standard size and quantity now. You will see the current order value before sharing contact details."}
                    </p>
                  </div>
                  {catalogOpen && currentCatSkus.length === 0 ? (
                    <p className="text-sm text-slate-500 py-8 text-center">
                      {normalizedCatalogQuery ? <>No packaging products match “{catalogQuery.trim()}”.</> : "No lower-impact products are available in this category yet."}
                    </p>
                  ) : catalogOpen ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {currentCatSkus.map((sku, index) => (
                        <button key={sku.id} onClick={() => handleSelectSku(sku.id)}
                          className={`${index >= 4 && !normalizedCatalogQuery && !mobileShowAllResults ? "hidden sm:flex" : "flex"} group flex-col overflow-hidden rounded-none border-2 text-left transition-colors`}
                          style={{ borderColor: selectedSkuId === sku.id ? "#0D1B2A" : "#E2E8F0", background: "white" }}
                        >
                          <div className="relative w-full aspect-[4/3] bg-slate-100 shrink-0 overflow-hidden border-b border-slate-200">
                            <img src={getCatalogImage(sku)} alt={`${sku.name} packaging example`} loading="lazy" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.025]" />
                            <span className="absolute left-3 top-3 bg-white/95 px-2 py-1 font-black text-[10px] text-slate-600">{sku.code}</span>
                            {selectedSkuId === sku.id && (
                              <div className="absolute right-3 top-3 w-7 h-7 flex items-center justify-center" style={{ background: "#1B6CA8" }}>
                                <svg className="w-4 h-4" viewBox="0 0 12 12" fill="none"><path d="M10 3L5 8.5 2 5.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                              </div>
                            )}
                          </div>
                          <div className="p-4 flex-1 min-w-0 w-full">
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                              {sku.is_eco && <span className="text-[10px] px-1.5 py-0.5 font-bold" style={{ background: "rgba(22,163,74,0.1)", color: "#16A34A" }}>ECO</span>}
                              <span className="text-[10px] px-1.5 py-0.5 font-bold border" style={{ background: "#FFFFFF", borderColor: isAssistedSku(sku) ? "#D6A647" : "#0D1B2A", color: isAssistedSku(sku) ? "#7A5109" : "#0D1B2A" }}>
                                {isAssistedSku(sku) ? "Managed quote" : "Instant buy"}
                              </span>
                              <span className="text-[10px] px-1.5 py-0.5 font-bold" style={{ background: "#0D1B2A", color: "#FFFFFF" }}>Custom printed</span>
                            </div>
                            <div className="font-black text-navy text-base mb-1">{sku.name}</div>
                            <div className="text-xs text-slate-500 leading-relaxed line-clamp-2">{sku.description}</div>
                            <div className="text-xs font-bold mt-2" style={{ color: "#64748B" }}>
                              MOQ {sku.moq.toLocaleString()} {sku.moq_unit} · ₹{sku.price_min.toFixed(2)}-₹{sku.price_max.toFixed(2)}/unit
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : null}
                  {catalogOpen && currentCatSkus.length > 4 && !normalizedCatalogQuery && !mobileShowAllResults && (
                    <button type="button" onClick={() => setMobileShowAllResults(true)} className="sm:hidden mt-3 w-full border border-slate-300 bg-white py-3 text-sm font-bold text-slate-800">
                      Show all {currentCatSkus.length} formats
                    </button>
                  )}
                </div>

                {!catalogOpen && <>
                {/* Variant selectors */}
                {selectedSku && selectedSku.variants.length > 0 && (
                  <>
                    <div className="hidden sm:block bg-white rounded-lg border border-slate-200 p-5">
                      <div className="font-bold text-slate-800 text-sm mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                        Material and finish — {selectedSku.name}
                      </div>
                      <div className="space-y-4">
                        {selectedSku.variants.map(group => (
                          <VariantSelector key={group.key} group={group}
                            selected={variantSelections[group.key] || group.options[0]}
                            onSelect={v => setVariantSelections(prev => ({ ...prev, [group.key]: v }))} />
                        ))}
                      </div>
                    </div>
                    <details className="sm:hidden bg-white border border-slate-200">
                      <summary className="min-h-[56px] px-4 py-3 flex items-center justify-between gap-3 cursor-pointer list-none">
                        <span>
                          <strong className="block text-sm text-slate-900">Material and finish</strong>
                          <small className="block mt-0.5 text-slate-500">Recommended choices are already selected</small>
                        </span>
                        <ChevronDown className="w-5 h-5 text-slate-400 shrink-0" />
                      </summary>
                      <div className="px-4 pb-4 pt-2 border-t border-slate-100 space-y-4">
                        {selectedSku.variants.map(group => (
                          <VariantSelector key={group.key} group={group}
                            selected={variantSelections[group.key] || group.options[0]}
                            onSelect={v => setVariantSelections(prev => ({ ...prev, [group.key]: v }))} />
                        ))}
                      </div>
                    </details>
                  </>
                )}

                {["SP-907", "SP-912"].includes(selectedSku?.code || "") && (
                  <div className="border border-slate-300 border-l-[3px] border-l-amber-500 bg-white px-4 py-3 text-sm text-slate-700">
                    <strong className="block text-slate-900">
                      {(variantSelections.branding || "Plain stock") === "Custom printed"
                        ? "Direct custom print starts at 10,000 units"
                        : (variantSelections.branding || "Plain stock") === "Applied label"
                          ? "Branded short runs start at 500 units"
                        : selectedSku?.code === "SP-912"
                          ? "Plain stock starts at 100 units"
                          : "Plain stock starts at 300 units"}
                    </strong>
                    <span className="mt-1 block text-xs leading-relaxed text-slate-600">
                      Plain stock is best for trials. Applied labels suit smaller branded launches. Direct printing uses a production run with plate and colour setup.
                    </span>
                  </div>
                )}

                {/* Fixed, priced size menu for every instant-buy family. */}
                {selectedSkuBuyingMode === "self" && commerceProduct && (
                  <div className="bg-white border border-slate-200 p-5">
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div>
                        <div className="font-bold text-slate-800 text-sm" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Choose a standard size</div>
                        <p className="text-xs text-slate-500 mt-1">These sizes are ready to order with clear pricing. Need a different size? We will confirm it for you.</p>
                      </div>
                      <span className="border border-emerald-700 bg-white px-2 py-1 text-[10px] font-black uppercase tracking-wider text-emerald-800">Price locked</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {commerceProduct.sizes.map((item) => {
                        const active = selectedSizeCode === item.code;
                        return (
                          <button
                            key={item.code}
                            type="button"
                            onClick={() => setSelectedSizeCode(item.code)}
                            className="text-left p-3 border transition-colors"
                            style={{ borderColor: active ? "#0D1B2A" : "#DCE4EE", background: "#FFFFFF", boxShadow: active ? "inset 0 -3px 0 #1B6CA8" : "none" }}
                          >
                            <span className="block text-sm font-black" style={{ color: active ? "#155A8C" : "#0D1B2A" }}>{formatMeasurementInCm(item.label)}</span>
                            <span className="block text-[11px] mt-1 leading-snug text-slate-500">{formatMeasurementInCm(item.detail)}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Package Size & Specs */}
                {selectedSku && selectedSkuBuyingMode === "assisted" && selectedSku.customization_fields.length > 0 && selectedSku.category !== "rolls" && (
                  <div className="bg-white rounded-lg border border-slate-200 p-5">
                    <div className="font-bold text-slate-800 text-sm mb-1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                      Package Size &amp; Specs
                    </div>
                    <p className="text-xs text-slate-400 mb-3">Enter your required dimensions and print specifications.</p>

                    {/* Unit switchers */}
                    <div className="flex flex-wrap gap-3 mb-4 pb-3 border-b border-slate-100">
                      {/* Dimension unit */}
                      {selectedSku.customization_fields.some(f => f.unit === "mm") && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-500 font-medium">Dimensions:</span>
                          <div className="flex rounded border border-slate-200 overflow-hidden">
                            {(["mm","cm","in"] as const).map(u => (
                              <button key={u} onClick={() => setDimUnit(u)}
                                className="px-2.5 py-1 text-xs font-semibold transition-all"
                                style={{ background: dimUnit === u ? "#0D1B2A" : "#F8FAFC", color: dimUnit === u ? "white" : "#64748B" }}>
                                {u}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                      {/* Weight unit */}
                      {selectedSku.customization_fields.some(f => f.unit === "g") && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-500 font-medium">Weight:</span>
                          <div className="flex rounded border border-slate-200 overflow-hidden">
                            {(["g","kg","t"] as const).map(u => (
                              <button key={u} onClick={() => setWeightUnit(u)}
                                className="px-2.5 py-1 text-xs font-semibold transition-all"
                                style={{ background: weightUnit === u ? "#0D1B2A" : "#F8FAFC", color: weightUnit === u ? "white" : "#64748B" }}>
                                {u}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      {selectedSku.customization_fields.map(field => {
                        const dispUnit = fieldDisplayUnit(field.unit, dimUnit, weightUnit);
                        const dispVal = toDisplay(customFieldValues[field.key] || "", field.unit, dimUnit, weightUnit);
                        return (
                          <div key={field.key}>
                            <label className="text-xs font-medium text-slate-600 mb-1 block">
                              {stripUnitSuffix(field.label)}{dispUnit ? ` (${dispUnit})` : ""}
                            </label>
                            {field.type === "select" ? (
                              <select
                                value={customFieldValues[field.key] || field.options?.[0] || ""}
                                onChange={e => setCustomFieldValues(prev => ({ ...prev, [field.key]: e.target.value }))}
                                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400 bg-slate-50"
                              >
                                {field.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                              </select>
                            ) : (
                              <input
                                type="number"
                                step="any"
                                min="0"
                                value={dispVal}
                                onChange={e => setCustomFieldValues(prev => ({ ...prev, [field.key]: fromDisplay(e.target.value, field.unit, dimUnit, weightUnit) }))}
                                placeholder={field.placeholder || ""}
                                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400 bg-slate-50"
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>
                    <p className="text-xs text-slate-400 mt-3">Approximate dimensions are enough. Engineering confirms the production specification before pricing is approved.</p>
                  </div>
                )}

                {/* Quantity selector */}
                <div className="bg-white rounded-lg border border-slate-200 p-5">
                  <div className="font-bold text-slate-800 text-sm mb-3" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    Quantity
                  </div>
                  <div className="space-y-3">
                    {/* Unit toggle */}
                    {selectedSku?.category === "rolls" && <div className="flex gap-0 rounded-lg border border-slate-200 overflow-hidden w-fit">
                      {(["pieces", "kg"] as const).map(u => (
                        <button key={u} onClick={() => { setQtyUnit(u); setQty(u === "pieces" ? selectedSkuMoq : 50); }}
                          className="px-4 py-1.5 text-sm font-semibold transition-all"
                          style={{ background: qtyUnit === u ? "#1B6CA8" : "white", color: qtyUnit === u ? "white" : "#64748B" }}>
                          {u === "pieces" ? "Pieces" : "Kg (film)"}
                        </button>
                      ))}
                    </div>}
                    <div className="flex gap-2 flex-wrap">
                      {quantityPresets.map(q => (
                        <button key={q} onClick={() => setQty(q)}
                          className="px-4 py-2 border text-sm font-bold transition-all"
                          style={{ borderColor: qty === q ? "#0D1B2A" : "#E2E8F0", background: "white", color: qty === q ? "#0D1B2A" : "#64748B", boxShadow: qty === q ? "inset 0 -3px 0 #1B6CA8" : "none" }}>
                          {q.toLocaleString()}
                        </button>
                      ))}
                      {selectedSkuBuyingMode === "assisted" && (
                        <input type="number" value={qty}
                          onChange={e => setQty(Math.max(qtyUnit === "pieces" ? selectedSkuMoq : 50, parseInt(e.target.value) || (qtyUnit === "pieces" ? selectedSkuMoq : 50)))}
                          className="w-28 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400 bg-slate-50" placeholder="Custom" />
                      )}
                    </div>
                    <p className="text-xs text-slate-400">
                      {selectedSkuBuyingMode === "self"
                        ? "Choose one of the production quantities above. Larger or custom runs move to a managed volume quote."
                        : qtyUnit === "pieces" ? `Minimum: ${selectedSkuMoq.toLocaleString()} pieces for ${selectedSku?.name || "this product"}` : "Minimum: 50 kg of packaging film"}
                    </p>
                    {selectedSkuBuyingMode === "assisted" && (
                      <div className="flex items-start gap-2 border border-slate-300 border-l-[3px] border-l-amber-500 bg-white p-3">
                        <span className="text-amber-500 text-base leading-none mt-0.5">ⓘ</span>
                        <p className="text-xs leading-snug" style={{ color: "#8A5A00" }}>
                          <strong>Managed quote needed.</strong> This format, custom quantity, or enterprise volume needs a reviewed production rate. Submit the same specification and our team will price it manually.
                        </p>
                      </div>
                    )}
                    {qtyUnit === "pieces" && qty <= 1000 && (
                      <div className="flex items-start gap-2 border border-slate-300 border-l-[3px] border-l-amber-500 bg-white p-3">
                        <span className="text-amber-500 text-base leading-none mt-0.5">⚠️</span>
                        <p className="text-xs text-amber-800 leading-snug">
                          <strong>Prices are higher at low quantities.</strong> Increasing quantity generally lowers the unit rate by spreading setup and print costs. Compare quantities in this step; the final rate is confirmed after specification and artwork review.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                </>}
              </>
            )}

            {/* ── STEP 2: Design & Delivery (consolidated) ── */}
            {stepNum === 2 && (
              <>
                <StepHeader step={2} total={TOTAL_STEPS} title="Brand and delivery" subtitle="Add your design, choose delivery, and decide whether you need a sample first." />

                {/* Artwork section */}
                <div className="bg-white rounded-lg border border-slate-200 p-6">
                  <div className="font-bold text-slate-800 text-sm mb-1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Artwork &amp; Dieline</div>
                  <div className="text-xs text-slate-400 mb-5">Upload your artwork or dieline file, or let us design it.</div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                    {([
                      { id: "upload" as ArtworkOption, icon: <Upload className="w-8 h-8" />, label: "Upload My File", sub: "PDF, AI, CDR, SVG — artwork or dieline", badge: null },
                      { id: "design" as ArtworkOption, icon: <Palette className="w-8 h-8" />, label: "Design It For Me", sub: "Expert design + dieline", badge: "+₹1,999" },
                      { id: "none" as ArtworkOption, icon: <X className="w-8 h-8" />, label: "Plain / Unprinted", sub: "No artwork needed", badge: null },
                    ]).map(opt => (
                      <button key={opt.id} onClick={() => setArtworkOption(opt.id)}
                        className="relative flex flex-col items-center gap-3 border-2 bg-white p-5 transition-all"
                        style={{ borderColor: artworkOption === opt.id ? "#0D1B2A" : "#E2E8F0", color: artworkOption === opt.id ? "#1B6CA8" : "#94A3B8", boxShadow: artworkOption === opt.id ? "inset 0 -3px 0 #1B6CA8" : "none" }}>
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
                    <div
                      className="mt-5 cursor-pointer border-2 border-dashed bg-white p-8 text-center transition-colors"
                      style={{ borderColor: artworkFile ? "#0D1B2A" : "#CBD5E1" }}
                      onClick={() => fileInputRef.current?.click()}
                      onDragOver={e => { e.preventDefault(); e.stopPropagation(); }}
                      onDrop={e => {
                        e.preventDefault();
                        const file = e.dataTransfer.files[0];
                        if (file) handleArtworkFile(file);
                      }}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf,.ai,.svg,.eps,.png,.jpg,.jpeg,.zip"
                        className="hidden"
                        onChange={e => {
                          const file = e.target.files?.[0];
                          if (file) handleArtworkFile(file);
                        }}
                      />
                      {artworkUploading ? (
                        <><Loader2 className="w-10 h-10 text-blue-400 mx-auto mb-3 animate-spin" /><div className="text-sm font-bold text-blue-500">Uploading…</div></>
                      ) : artworkFile ? (
                        <>
                          <CheckCircle2 className="w-10 h-10 mx-auto mb-3" style={{ color: "#1B6CA8" }} />
                          <div className="text-sm font-bold" style={{ color: "#1B6CA8" }}>{artworkFile.name}</div>
                          <div className="text-xs text-slate-400 mt-1">File attached — click to change</div>
                        </>
                      ) : (
                        <>
                          <Upload className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                          <div className="text-sm font-bold text-slate-500">Drop your file here or click to browse</div>
                          <div className="text-xs text-slate-400 mt-1">PDF, AI, SVG, EPS, PNG — max 50 MB</div>
                        </>
                      )}
                    </div>
                  )}

                  {artworkOption === "design" && (
                    <div className="mt-5 border border-slate-300 border-l-[3px] border-l-blue-700 bg-white p-5">
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
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-5">
                    {([
                      { id: "standard" as DeliveryOption, icon: <Truck className="w-7 h-7" />, label: "Standard Pro", time: `${selectedSku?.delivery_days_india || 12}–${(selectedSku?.delivery_days_india || 12) + 2} Days`, price: "Free", recommended: true },
                      { id: "blitz" as DeliveryOption, icon: <Zap className="w-7 h-7" />, label: "Blitz Logistics", time: "5–7 Days", price: "+₹1,200" },
                      { id: "warehouse" as DeliveryOption, icon: <Warehouse className="w-7 h-7" />, label: "Warehouse Hold", time: "Up to 30 days", price: "+₹300 handling" },
                    ]).map(opt => (
                      <button key={opt.id} onClick={() => setDeliveryOption(opt.id)}
                        className="relative flex flex-col items-start gap-2 border-2 bg-white p-4 text-left transition-all"
                        style={{ borderColor: deliveryOption === opt.id ? "#0D1B2A" : "#E2E8F0", boxShadow: deliveryOption === opt.id ? "inset 0 -3px 0 #1B6CA8" : "none" }}>
                        {opt.recommended && <span className="absolute -top-2.5 left-3 px-2 py-0.5 rounded text-xs font-black" style={{ background: "#1B6CA8", color: "white" }}>RECOMMENDED</span>}
                        <div style={{ color: deliveryOption === opt.id ? "#1B6CA8" : "#94A3B8" }}>{opt.icon}</div>
                        <div>
                          <div className="font-bold text-sm text-slate-800">{opt.label}</div>
                          <div className="text-xs text-slate-400 mt-0.5">{opt.time}</div>
                        </div>
                        <div className="font-black text-sm" style={{ color: "#374151", fontFamily: "'Space Grotesk', sans-serif" }}>{opt.price}</div>
                      </button>
                    ))}
                  </div>

                  <div className="border-t border-slate-200 pt-4 text-sm text-slate-600">
                    Your delivery address is collected once, at secure checkout. It is not attached separately to each configured item.
                  </div>
                </div>

                <div className="bg-white border border-slate-200 p-5">
                  <div className="font-bold text-slate-800 text-sm mb-1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Do you need a sample first?</div>
                  <p className="text-xs text-slate-500 mb-4">Most repeat orders skip this. First-time or high-risk packs can request a physical sample before bulk production.</p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {([
                      { id: "none" as const, title: "No, continue", body: "Go directly to artwork review and production." },
                      { id: "standard" as const, title: "Yes, standard", body: "We confirm format, timing and the ₹2,999 sample fee." },
                      { id: "express" as const, title: "Yes, priority", body: "We confirm the fastest available sample route and ₹4,999 fee." },
                    ]).map((option) => (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => { setSampleOption(option.id); setSamplePaid(false); }}
                        className="min-h-[78px] border p-3 text-left transition-colors"
                        style={{ borderColor: sampleOption === option.id ? "#0D1B2A" : "#DCE4EE", background: "#FFFFFF", boxShadow: sampleOption === option.id ? "inset 0 -3px 0 #1B6CA8" : "none" }}
                      >
                        <strong className="block text-sm text-slate-900">{option.title}</strong>
                        <span className="block mt-1 text-xs leading-relaxed text-slate-500">{option.body}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Sampling now lives inside Brand & delivery; keep this retired screen unreachable. */}
            {false && (
              <>
                <StepHeader step={3} total={TOTAL_STEPS} title="Sample Request" subtitle="Validate structure and print before bulk production." />
                <div className="bg-white rounded-lg border border-slate-200 p-6">
                  <p className="text-sm text-slate-500 mb-6">Sampling fee is fully adjusted against your production order. No extra charge.</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Card A: Express */}
                    <div
                      className="p-5 rounded-xl border-2 cursor-pointer transition-all"
                      style={{ borderColor: sampleOption === "express" ? "#0D1B2A" : "#E2E8F0", background: "white", boxShadow: sampleOption === "express" ? "inset 0 -3px 0 #E8A838" : "none" }}
                      onClick={() => { setSampleOption("express"); setSamplePaid(false); }}
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
                      style={{ borderColor: sampleOption === "standard" ? "#0D1B2A" : "#E2E8F0", background: "white", boxShadow: sampleOption === "standard" ? "inset 0 -3px 0 #1B6CA8" : "none" }}
                      onClick={() => { setSampleOption("standard"); setSamplePaid(false); }}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <span className="border border-blue-700 bg-white px-2 py-1 text-xs font-black uppercase tracking-wider text-blue-800">STANDARD</span>
                        {sampleOption === "standard" && <CheckCircle2 className="w-5 h-5" style={{ color: "#1B6CA8" }} />}
                      </div>
                      <p className="font-black text-slate-800 mb-1">Standard Sample</p>
                      <p className="font-black text-lg mb-3" style={{ color: "#1B6CA8" }}>₹2,999</p>
                      <ul className="space-y-1 mb-4">
                        {["1–2 samples", "Standard manufacturing", "10-day delivery", "Basic spec verification"].map(f => (
                          <li key={f} className="text-xs text-slate-500 flex items-center gap-1.5"><span style={{ color: "#1B6CA8" }}>✓</span> {f}</li>
                        ))}
                      </ul>
                      {sampleOption === "standard" && (
                        samplePaid ? (
                          <div className="flex items-center gap-2 text-xs font-bold" style={{ color: "#16a34a" }}><CheckCircle2 className="w-4 h-4" /> Standard sample confirmed</div>
                        ) : (
                          <button
                            onClick={async (event) => {
                              event.stopPropagation();
                              try { await openRazorpay({ amount: 299900, description: "Standard Sample", notes: { service: "sample_standard" }, onSuccess: () => setSamplePaid(true), onDismiss: () => {} }); } catch {}
                            }}
                            className="w-full py-2.5 rounded-lg text-sm font-bold transition-all hover:brightness-110"
                            style={{ background: "#1B6CA8", color: "white" }}>
                            Pay ₹2,999 — Order Sample
                          </button>
                        )
                      )}
                    </div>

                    {/* Card C: Skip */}
                    <div
                      className="p-5 rounded-xl border-2 cursor-pointer transition-all"
                      style={{ borderColor: sampleOption === "none" ? "#94A3B8" : "#E2E8F0", background: sampleOption === "none" ? "rgba(148,163,184,0.06)" : "white" }}
                      onClick={() => { setSampleOption("none"); setSamplePaid(false); }}
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

            {/* ── STEP 4: Review ── */}
            {stepNum === 4 && (
              <>
                <StepHeader step={4} total={TOTAL_STEPS} title={selectedSkuBuyingMode === "assisted" ? "Review your request" : "Review your order"} subtitle="Check the essentials before saving your request." />
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
                        ["Tax profile", buyingAsBusiness ? (gstRegistered ? `GSTIN ${gstin.toUpperCase()}` : "Business - not GST registered") : "Consumer purchase"],
                        ...(poReference.trim() ? [["PO reference", poReference.trim()]] : []),
                        ["Category", CATEGORIES.find(c => c.slug === selectedCategory)?.label || selectedCategory],
                        ["SKU", selectedSku?.name || "—"],
                        ["SKU Code", selectedSku?.code || "—"],
                        ["Quantity", `${qty.toLocaleString()} ${qtyUnit}`],
                        ...(selectedSkuBuyingMode === "self" && commerceProduct ? [["Production size", formatMeasurementInCm(commerceProduct.sizes.find((item) => item.code === selectedSizeCode)?.label || selectedSizeCode)]] : []),
                        ...Object.entries(variantSelections).map(([k, v]) => {
                          const group = selectedSku?.variants.find(g => g.key === k);
                          return [group?.label || k, v];
                        }),
                        ...Object.entries(customFieldValues).filter(([, v]) => v).map(([k, v]) => {
                          const field = selectedSku?.customization_fields.find(f => f.key === k);
                          const displayValue = field ? toDisplay(v, field.unit, dimUnit, weightUnit) : v;
                          const displayUnit = field ? fieldDisplayUnit(field.unit, dimUnit, weightUnit) : "";
                          return [(field?.label || k), displayUnit ? `${displayValue} ${displayUnit}` : displayValue];
                        }),
                        ["Artwork", artworkOption === "upload"
                          ? (artworkUploading ? "⏳ Uploading…" : artworkFileUrl && !artworkFileUrl.startsWith("local:") ? `✓ ${artworkFileUrl.split("/").pop()?.substring(0, 28) || "File uploaded"}` : artworkFile ? `⚠ ${artworkFile.name} (not uploaded)` : "Upload ready-to-print file")
                          : artworkOption === "design" ? `Design Service — ₹1,999 ${designPaid ? "✓ Paid" : "(pending payment)"}` : "Plain / unprinted"],
                        ["Delivery", deliveryOption === "standard" ? "Standard Pro (Free)" : deliveryOption === "blitz" ? "Blitz Logistics (+₹1,200)" : "Warehouse Hold (+₹300 handling)"],
                        ["Delivery address", selectedSkuBuyingMode === "self" ? "Collected at checkout" : "Confirmed after quote approval"],
                        ["Sample", sampleOption === "express" ? `Express Kit — ₹4,999 ${samplePaid ? "✓ Paid" : "(pending payment)"}` : sampleOption === "standard" ? `Standard — ₹2,999 ${samplePaid ? "✓ Paid" : "(pending payment)"}` : "Skipped"],
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
                    <div className="border border-slate-300 border-l-[3px] border-l-amber-500 bg-white p-4 text-sm">
                      <span className="font-bold" style={{ color: "#92600A" }}>Design payment pending —</span>
                      <span className="text-slate-500"> you can pay now or we'll follow up before starting design.</span>
                    </div>
                  )}
                  {(sampleOption !== "none" && !samplePaid) && (
                    <div className="border border-slate-300 border-l-[3px] border-l-amber-500 bg-white p-4 text-sm">
                      <span className="font-bold" style={{ color: "#92600A" }}>Sample confirmation pending —</span>
                      <span className="text-slate-500"> we will confirm availability, timing and the fee before production.</span>
                    </div>
                  )}

                  {selectedSkuBuyingMode === "self" && (
                    <div className="border border-slate-200 bg-slate-50 p-5">
                      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">Useful additions</p>
                      <h2 className="mt-1 text-base font-black text-slate-900">Add only what helps this order</h2>
                      <div className="mt-4 grid sm:grid-cols-3 gap-2">
                        <button type="button" onClick={() => { setArtworkOption("design"); setDesignPaid(false); }} className="min-h-20 border border-slate-300 bg-white p-3 text-left hover:border-blue-500">
                          <strong className="block text-sm text-slate-900">Artwork support</strong>
                          <span className="mt-1 block text-xs leading-relaxed text-slate-500">₹1,999, added once at checkout</span>
                        </button>
                        <button type="button" onClick={() => {
                          setSampleOption("standard");
                          setSamplePaid(false);
                          toast({ title: "Sample requested", description: "We will confirm availability and timing before production." });
                        }} className="min-h-20 border border-slate-300 bg-white p-3 text-left hover:border-blue-500">
                          <strong className="block text-sm text-slate-900">Review a sample</strong>
                          <span className="mt-1 block text-xs leading-relaxed text-slate-500">Compare sample routes before bulk production</span>
                        </button>
                        <a href="/configure?sku=LC-816" target="_blank" rel="noopener noreferrer" className="min-h-20 border border-slate-300 bg-white p-3 text-left hover:border-blue-500">
                          <strong className="block text-sm text-slate-900">Matching labels</strong>
                          <span className="mt-1 block text-xs leading-relaxed text-slate-500">Open a separate label order without losing this one</span>
                        </a>
                      </div>
                    </div>
                  )}

                  {/* What happens next */}
                  <div style={{ background: "#F8F9FC", border: "1px solid #E2EAF4", borderTop: "2px solid #1B6CA8", borderRadius: 10, padding: "20px 20px 16px" }}>
                    <p style={{ color: "#1B6CA8", fontSize: 10, fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", marginBottom: 14 }}>WHAT HAPPENS NEXT</p>
                    <div style={{ display: "flex", gap: 0, flexDirection: "column" as const }}>
                      {(selectedSkuBuyingMode === "self" ? [
                        { n: "1", title: "Save the Packworkz specification", body: "The exact SKU, quantity, artwork route, and delivery choice are attached to the order.", color: "#1B6CA8" },
                        { n: "2", title: "Complete secure payment", body: "Razorpay collects payment on Packworkz without asking you to configure the product again.", color: "#E8A838" },
                        { n: "3", title: "Track now, create an account when useful", body: "Checkout works as a guest. Track with your reference and contact detail, or create an account after payment to keep orders and quotes together.", color: "#22C55E" },
                      ] : [
                        { n: "1", title: "We review your spec", body: "Same day — our team checks SKU, quantity, and delivery requirements.", color: "#1B6CA8" },
                        { n: "2", title: "You receive an itemised pricing plan", body: "Within 48 hours via WhatsApp and email — line-item breakdown, no surprises.", color: "#E8A838" },
                        { n: "3", title: "You approve before anything starts", body: "Nothing is ordered or produced until you give the green light.", color: "#22C55E" },
                      ]).map((step, i) => (
                        <div key={i} style={{ display: "flex", gap: 12, padding: "10px 0", borderBottom: i < 2 ? "1px solid #E8ECF4" : "none", alignItems: "flex-start" }}>
                          <div style={{ width: 22, height: 22, borderRadius: "50%", background: step.color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                            <span style={{ color: "white", fontSize: 11, fontWeight: 800 }}>{step.n}</span>
                          </div>
                          <div>
                            <p style={{ color: "#0D1B2A", fontSize: 13, fontWeight: 700, marginBottom: 2 }}>{step.title}</p>
                            <p style={{ color: "#64748B", fontSize: 12, lineHeight: 1.5 }}>{step.body}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}

            {!isLastStep && selectedSku && !(stepNum === 1 && catalogOpen) && (
              <div className="lg:hidden border border-slate-200 bg-white px-4 py-3 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-slate-900">{selectedSku.name}</p>
                  <p className="text-xs text-slate-500">{qty.toLocaleString("en-IN")} {qtyUnit}</p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Current total</p>
                  <p className="text-base font-black text-slate-900">₹{fmt(calculateOrderEstimate(selectedSku, qty, deliveryOption, artworkOption, selectedSizeCode, variantSelections).total || 0)}</p>
                </div>
              </div>
            )}

            {/* ── Navigation ── */}
            <div className="flex items-center justify-between gap-3 pt-4">
              <button onClick={handleBack} className="px-4 sm:px-6 py-2.5 rounded-lg border border-slate-200 text-sm font-bold text-slate-600 hover:border-slate-400 transition-colors shrink-0">
                ← Back
              </button>
              {stepNum === 1 && catalogOpen ? (
                <button type="button" disabled className="flex-1 sm:flex-none px-4 sm:px-8 py-3 text-sm font-black text-slate-500 bg-slate-100 border border-slate-200 cursor-not-allowed min-w-0">
                  Choose a product above
                </button>
              ) : !isLastStep ? (
                <button onClick={handleNext} className="flex-1 sm:flex-none px-4 sm:px-8 py-3 text-sm font-black text-white transition-all hover:opacity-90 min-w-0" style={{ background: "#0D1B2A" }}>
                  {stepNum === 1 ? "Continue to brand & delivery" : stepNum === 2 ? "Continue to your details" : "Review order"} →
                </button>
              ) : (
                <button onClick={handleSubmit} disabled={submitMutation.isPending || artworkUploading || checkoutLaunching}
                  className="px-5 sm:px-8 py-2.5 rounded-lg text-sm font-black uppercase tracking-wider transition-all hover:opacity-90 flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed min-w-0"
                  style={{ background: "#E8A838", color: "#0F1C2C" }}>
                  {artworkUploading ? <><Loader2 className="w-4 h-4 animate-spin" /> Uploading artwork…</> : submitMutation.isPending ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving order…</> : checkoutLaunching ? <><Loader2 className="w-4 h-4 animate-spin" /> Opening secure checkout…</> : <>{selectedSkuBuyingMode === "assisted" ? "Request managed quote" : purchaseIntent === "cart" ? "Add configured item to cart" : "Continue to checkout"} <ArrowRight className="w-4 h-4" /></>}
                </button>
              )}
            </div>
          </div>

          {/* ── Right: Order Summary ── */}
          <aside className="hidden lg:block lg:col-span-1 lg:self-start lg:sticky lg:top-28 pw-order-summary-rail" aria-label="Live order summary">
            <OrderSummary
              sku={selectedSku}
              qty={qty}
              delivery={deliveryOption}
              artworkOption={artworkOption}
              designPaid={designPaid}
              sizeCode={selectedSizeCode}
              configuration={variantSelections}
              buyingMode={selectedSkuBuyingMode}
              purchaseIntent={purchaseIntent}
              onSubmit={isLastStep ? handleSubmit : undefined}
              submitting={submitMutation.isPending || checkoutLaunching}
            />
          </aside>
        </div>
      </div>
    </div>
  );
}
