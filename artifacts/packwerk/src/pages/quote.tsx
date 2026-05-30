import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { Link, useLocation } from "wouter";
import { useSubmitQuote } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { SKUS, CATEGORIES, SKU_IMAGES, getSkusByCategory } from "@/lib/skus";
import type { Sku, VariantGroup } from "@/lib/skus";
import { openRazorpay } from "@/lib/razorpay";
import {
  Loader2, CheckCircle2, ChevronDown, ChevronUp,
  Upload, Palette, X, Truck, Zap, Warehouse, ArrowRight, Shield, Package,
} from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────────
type ArtworkOption = "upload" | "design" | "none";
type DeliveryOption = "standard" | "blitz" | "warehouse";

// ── Step labels — now 5 steps (removed redundant artwork step) ─────────────
const STEP_LABELS = ["Contact", "Product & Qty", "Design & Delivery", "Sample", "Review"];
const TOTAL_STEPS = 5;

// ── Draft persistence helpers ──────────────────────────────────────────────
const DRAFT_KEY = "packwerk_quote_draft";
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
          <>
            <button
              onClick={onSubmit}
              disabled={submitting}
              className="w-full py-3 rounded font-black uppercase tracking-widest text-sm transition-all hover:opacity-90 active:scale-95 flex items-center justify-center gap-2 mt-2"
              style={{ background: "#E8A838", color: "#0F1C2C" }}
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <>SUBMIT REQUEST <ArrowRight className="w-4 h-4" /></>}
            </button>

            <div className="mt-4 pt-4 border-t" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
              <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#94A3B8" }}>What happens next</p>
              <div className="flex flex-col gap-2.5">
                {[
                  { n: "1", text: "We review your specs & call within 24 hours" },
                  { n: "2", text: "You receive a detailed quote on WhatsApp & email" },
                  { n: "3", text: "Accept & we source from 3 backup-verified factories" },
                ].map(({ n, text }) => (
                  <div key={n} className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-black mt-0.5"
                      style={{ background: "rgba(27,108,168,0.18)", color: "#1B6CA8" }}>
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
          <p className="text-xs text-slate-500">Verified by Packworkz Quality Assurance. 100% Recyclable materials guaranteed.</p>
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
function ConfirmationScreen({ quoteId, email, designPaid, sampleOption, samplePaid }: {
  quoteId: string;
  email: string;
  designPaid: boolean;
  sampleOption: string;
  samplePaid: boolean;
}) {
  const [show, setShow] = useState(false);
  const [showSteps, setShowSteps] = useState(false);
  const [checkDone, setCheckDone] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setShow(true), 80);
    const t2 = setTimeout(() => setCheckDone(true), 500);
    const t3 = setTimeout(() => setShowSteps(true), 900);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  const samplePaidFinal = sampleOption === "express" && samplePaid;
  const waMsg = encodeURIComponent(`Hi, my quote ID is ${quoteId}. Can you share an update?`);

  const STEPS = [
    {
      num: "STEP 01",
      title: "We review your specs",
      body: "Our team manually reviews every quote and sources competing prices from our factory network.",
    },
    {
      num: "STEP 02",
      title: "You receive your quote",
      body: "Itemised pricing, timeline, and payment terms sent to your email and WhatsApp within 48 hours.",
    },
    {
      num: "STEP 03",
      title: "You approve, we produce",
      body: "Accept your quote and your dashboard is activated. Track every stage from production to delivery.",
    },
  ];

  return (
    <div style={{ position: "relative", minHeight: "100vh", background: "#0D1B2A", overflow: "hidden" }}>
      <Particles />

      <div style={{
        position: "relative", zIndex: 1,
        maxWidth: 600, margin: "0 auto",
        padding: "80px 40px",
        textAlign: "center",
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}>

        {/* ── Animated checkmark circle ── */}
        <div style={{
          width: 120, height: 120,
          border: "2px solid #E8A838",
          borderRadius: "50%",
          margin: "0 auto 32px",
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "all 0.6s cubic-bezier(0.34,1.56,0.64,1)",
          transform: show ? "scale(1)" : "scale(0)",
          opacity: show ? 1 : 0,
        }}>
          <svg viewBox="0 0 52 52" width="72" height="72">
            <circle cx="26" cy="26" r="25" fill="none" stroke="#E8A838" strokeWidth="2" />
            <path
              fill="none"
              stroke="#E8A838"
              strokeWidth="3"
              strokeLinecap="round"
              d="M14 27 L22 35 L38 19"
              style={{
                strokeDasharray: 60,
                strokeDashoffset: checkDone ? 0 : 60,
                transition: "stroke-dashoffset 0.6s ease 0.3s",
              }}
            />
          </svg>
        </div>

        {/* ── Eyebrow ── */}
        <div style={{
          color: "#E8A838", fontSize: 11, fontWeight: 600,
          letterSpacing: "2px", textTransform: "uppercase",
          marginBottom: 12,
          transition: "all 0.5s ease 0.2s",
          opacity: show ? 1 : 0, transform: show ? "translateY(0)" : "translateY(10px)",
        }}>
          YOUR QUOTE IS CONFIRMED
        </div>

        {/* ── Headline ── */}
        <h1 style={{
          color: "white",
          fontSize: "clamp(2.4rem, 5vw, 3.25rem)",
          fontWeight: 700, lineHeight: 1.1,
          margin: "0 0 8px",
          fontFamily: "'Space Grotesk', sans-serif",
          transition: "all 0.5s ease 0.3s",
          opacity: show ? 1 : 0, transform: show ? "translateY(0)" : "translateY(10px)",
        }}>
          We're on it.
        </h1>

        {/* ── Quote ID ── */}
        <div style={{
          fontFamily: "'JetBrains Mono', 'Courier New', monospace",
          fontSize: 22, fontWeight: 600, letterSpacing: "2px",
          color: "#E8A838", marginBottom: 16,
          transition: "all 0.5s ease 0.4s",
          opacity: show ? 1 : 0, transform: show ? "translateY(0)" : "translateY(10px)",
        }}>
          {quoteId}
        </div>

        {/* ── Subtext ── */}
        <p style={{
          color: "rgba(255,255,255,0.6)",
          fontSize: 17, lineHeight: 1.7,
          maxWidth: 420, margin: "0 auto 48px",
          transition: "all 0.5s ease 0.5s",
          opacity: show ? 1 : 0, transform: show ? "translateY(0)" : "translateY(10px)",
        }}>
          Our team is reviewing your specs. You'll receive a detailed quote within 48 hours on WhatsApp and email.
        </p>

        {/* ── What Happens Next ── */}
        <div style={{
          display: "flex", gap: 16, marginBottom: 48,
          flexWrap: "wrap",
          transition: "all 0.5s ease",
          opacity: showSteps ? 1 : 0, transform: showSteps ? "translateY(0)" : "translateY(16px)",
        }}>
          {STEPS.map((step, i) => (
            <div
              key={i}
              style={{
                flex: "1 1 160px",
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 14,
                padding: "24px 20px",
                textAlign: "left",
                transition: `all 0.4s ease ${i * 0.1}s`,
                opacity: showSteps ? 1 : 0,
                transform: showSteps ? "translateY(0)" : "translateY(12px)",
              }}
            >
              <div style={{ color: "#E8A838", fontSize: 11, fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: 8 }}>
                {step.num}
              </div>
              <div style={{ color: "white", fontSize: 15, fontWeight: 700, marginBottom: 6 }}>
                {step.title}
              </div>
              <div style={{ color: "rgba(255,255,255,0.55)", fontSize: 13, lineHeight: 1.6 }}>
                {step.body}
              </div>
            </div>
          ))}
        </div>

        {/* ── CTA Buttons ── */}
        <div style={{
          display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap", marginBottom: 32,
          transition: "all 0.5s ease 0.6s",
          opacity: showSteps ? 1 : 0, transform: showSteps ? "translateY(0)" : "translateY(10px)",
        }}>
          <a
            href={`https://wa.me/918208990366?text=${waMsg}`}
            target="_blank" rel="noopener noreferrer"
            style={{
              display: "inline-flex", alignItems: "center", gap: 10,
              padding: "14px 24px", borderRadius: 10,
              background: "#E8A838", color: "#0D1B2A",
              fontSize: 14, fontWeight: 800,
              textDecoration: "none",
              transition: "background 0.2s, transform 0.15s",
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#D4941E"; (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "#E8A838"; (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#0D1B2A">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            WhatsApp us for faster response
          </a>

          <Link href="/products"
            style={{
              display: "inline-flex", alignItems: "center",
              padding: "14px 24px", borderRadius: 10,
              border: "1px solid rgba(255,255,255,0.25)",
              color: "rgba(255,255,255,0.85)",
              fontSize: 14, fontWeight: 700,
              textDecoration: "none",
              transition: "border-color 0.2s, background 0.2s, transform 0.15s",
            }}
            onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => { e.currentTarget.style.background = "rgba(255,255,255,0.08)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
            onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.transform = "translateY(0)"; }}
          >
            Browse more products
          </Link>
        </div>

        {/* ── Design brief card ── */}
        {designPaid && (
          <div style={{
            background: "rgba(27,108,168,0.15)",
            border: "1px solid rgba(27,108,168,0.3)",
            borderRadius: 12, padding: "20px 24px",
            textAlign: "left",
            display: "flex", alignItems: "center", gap: 16,
            marginBottom: 16,
            transition: "all 0.5s ease 0.7s",
            opacity: showSteps ? 1 : 0,
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1B6CA8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <div style={{ flex: 1 }}>
              <div style={{ color: "white", fontSize: 14, fontWeight: 700, marginBottom: 4 }}>Complete your design brief</div>
              <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, lineHeight: 1.5 }}>Your designer needs a few details to get started. Takes 3 minutes.</div>
              <a href="/design/brief" style={{ color: "#1B6CA8", fontSize: 13, fontWeight: 600, textDecoration: "none", display: "inline-block", marginTop: 6 }}>Complete brief →</a>
            </div>
          </div>
        )}

        {/* ── Sample confirmed card ── */}
        {samplePaidFinal && (
          <div style={{
            background: "rgba(27,108,168,0.15)",
            border: "1px solid rgba(27,108,168,0.3)",
            borderRadius: 12, padding: "20px 24px",
            textAlign: "left",
            display: "flex", alignItems: "center", gap: 16,
            transition: "all 0.5s ease 0.8s",
            opacity: showSteps ? 1 : 0,
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1B6CA8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <div>
              <div style={{ color: "white", fontSize: 14, fontWeight: 700, marginBottom: 4 }}>Sample request confirmed</div>
              <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, lineHeight: 1.5 }}>
                Your sample will be dispatched in 5–7 days. We'll send tracking details to your email.
              </div>
            </div>
          </div>
        )}

      </div>
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
  const [contactName, setContactName] = useState<string>(() => loadDraft().contactName || "");
  const [company, setCompany] = useState<string>(() => loadDraft().company || "");
  const [email, setEmail] = useState<string>(() => loadDraft().email || "");
  const [phone, setPhone] = useState<string>(() => loadDraft().phone || "");

  // ── SKU selection ────────────────────────────────────────────────────────
  const [selectedCategory, setSelectedCategory] = useState<string>(() => loadDraft().selectedCategory || CATEGORIES[0].slug);
  const [ecoFilter, setEcoFilter] = useState<boolean>(() => loadDraft().ecoFilter ?? false);
  const [selectedSkuId, setSelectedSkuId] = useState<string>(() => loadDraft().selectedSkuId || SKUS[0].id);
  const [qty, setQty] = useState<number>(() => loadDraft().qty || 500);
  const [qtyUnit, setQtyUnit] = useState<'pieces' | 'kg'>(() => loadDraft().qtyUnit || 'pieces');
  const [variantSelections, setVariantSelections] = useState<Record<string, string>>(() => loadDraft().variantSelections || {});
  const [customFieldValues, setCustomFieldValues] = useState<Record<string, string>>(() => loadDraft().customFieldValues || {});

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
  }, []);

  // ── Delivery ─────────────────────────────────────────────────────────────
  const [deliveryOption, setDeliveryOption] = useState<DeliveryOption>(() => loadDraft().deliveryOption || "standard");
  const [pincode, setPincode] = useState<string>(() => loadDraft().pincode || "");

  // ── Sample ───────────────────────────────────────────────────────────────
  const [sampleOption, setSampleOption] = useState<"express" | "standard" | "none">(() => loadDraft().sampleOption || "none");
  const [samplePaid, setSamplePaid] = useState<boolean>(() => loadDraft().samplePaid ?? false);
  const [notes, setNotes] = useState<string>(() => loadDraft().notes || "");

  const submitMutation = useSubmitQuote();

  // ── Read URL params on mount to pre-select SKU from product pages ─────────
  useEffect(() => {
    const search = new URLSearchParams(window.location.search);
    const skuParam = search.get("sku");
    const productParam = search.get("product");
    const qtyParam = search.get("qty");
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
      setVariantSelections(defaults);
    }
    if (qtyParam) {
      const q = parseInt(qtyParam);
      if (q > 0) setQty(q);
    }
  }, []);

  // ── Helper: collect all state into one object for saving ──────────────────
  const getAllState = () => ({
    contactName, company, email, phone,
    selectedCategory, selectedSkuId, qty, qtyUnit, variantSelections, customFieldValues, ecoFilter,
    artworkOption, designPaid,
    deliveryOption, pincode,
    sampleOption, samplePaid, notes,
  });

  // ── Navigation with save ──────────────────────────────────────────────────
  const handleNext = () => {
    if (stepNum === 1) {
      if (!contactName.trim()) { toast({ variant: "destructive", title: "Required field missing", description: "Please enter your contact name." }); return; }
      if (!company.trim()) { toast({ variant: "destructive", title: "Required field missing", description: "Please enter your company name." }); return; }
      if (!email.trim() || !email.includes("@")) { toast({ variant: "destructive", title: "Required field missing", description: "Please enter a valid business email." }); return; }
      if (!phone.trim()) { toast({ variant: "destructive", title: "Required field missing", description: "Please enter your phone / WhatsApp number." }); return; }
    }
    if (stepNum === 3 && !pincode.trim()) {
      toast({ variant: "destructive", title: "Required field missing", description: "Please enter your delivery pincode." }); return;
    }
    saveDraft(getAllState());
    setLocation(`/quote/step/${stepNum + 1}`);
  };
  const handleBack = () => {
    saveDraft(getAllState());
    stepNum > 1 ? setLocation(`/quote/step/${stepNum - 1}`) : setLocation("/");
  };

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
        notes: [notes, artworkFile ? `Artwork file: ${artworkFile.name}` : ""].filter(Boolean).join("\n"),
        total_estimated_min: low,
        total_estimated_max: high,
        items: [{
          product_id: selectedSkuId,
          product_name: selectedSku?.name || selectedSkuId,
          quantity: qty, quantity_unit: qtyUnit, artwork_status: artworkOption, custom_specs: Object.keys(customFieldValues).length ? customFieldValues : undefined,
          sample_requested: sampleOption !== "none", sample_tier: sampleOption === "express" ? "premium" : sampleOption === "standard" ? "standard" : "none"
        }],
        artwork_option: artworkOption,
        artwork_file_url: artworkFileUrl || undefined,
        sample_option: sampleOption,
        design_paid: designPaid,
        sample_paid: samplePaid,
      } as any
    }, {
      onSuccess: (res) => {
        clearDraft();
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

                {/* Package Size & Specs */}
                {selectedSku && selectedSku.customization_fields.length > 0 && selectedSku.category !== "rolls" && (
                  <div className="bg-white rounded-lg border border-slate-200 p-5">
                    <div className="font-bold text-slate-800 text-sm mb-1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                      Package Size &amp; Specs
                    </div>
                    <p className="text-xs text-slate-400 mb-4">Enter your required dimensions and print specifications.</p>
                    <div className="grid grid-cols-2 gap-3">
                      {selectedSku.customization_fields.map(field => (
                        <div key={field.key}>
                          <label className="text-xs font-medium text-slate-600 mb-1 block">
                            {field.label}{field.unit ? ` (${field.unit})` : ""}
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
                              value={customFieldValues[field.key] || ""}
                              onChange={e => setCustomFieldValues(prev => ({ ...prev, [field.key]: e.target.value }))}
                              placeholder={field.placeholder || ""}
                              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400 bg-slate-50"
                            />
                          )}
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-slate-400 mt-3">All dimensions in mm unless stated. Leave blank if flexible.</p>
                  </div>
                )}

                {/* Quantity selector */}
                <div className="bg-white rounded-lg border border-slate-200 p-5">
                  <div className="font-bold text-slate-800 text-sm mb-3" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    Quantity
                  </div>
                  <div className="space-y-3">
                    {/* Unit toggle */}
                    <div className="flex gap-0 rounded-lg border border-slate-200 overflow-hidden w-fit">
                      {(["pieces", "kg"] as const).map(u => (
                        <button key={u} onClick={() => { setQtyUnit(u); setQty(u === "pieces" ? 500 : 50); }}
                          className="px-4 py-1.5 text-sm font-semibold transition-all"
                          style={{ background: qtyUnit === u ? "#1B6CA8" : "white", color: qtyUnit === u ? "white" : "#64748B" }}>
                          {u === "pieces" ? "Pieces" : "Kg (film)"}
                        </button>
                      ))}
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      {(qtyUnit === "pieces" ? [500, 1000, 2500, 5000, 10000] : [50, 100, 250, 500, 1000]).map(q => (
                        <button key={q} onClick={() => setQty(q)}
                          className="px-4 py-2 rounded-lg border text-sm font-bold transition-all"
                          style={{ borderColor: qty === q ? "#1B6CA8" : "#E2E8F0", background: qty === q ? "rgba(27,108,168,0.08)" : "white", color: qty === q ? "#1B6CA8" : "#64748B" }}>
                          {q.toLocaleString()}
                        </button>
                      ))}
                      <input type="number" value={qty}
                        onChange={e => setQty(Math.max(qtyUnit === "pieces" ? 500 : 50, parseInt(e.target.value) || (qtyUnit === "pieces" ? 500 : 50)))}
                        className="w-28 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400 bg-slate-50" placeholder="Custom" />
                    </div>
                    <p className="text-xs text-slate-400">
                      {qtyUnit === "pieces" ? "Minimum: 500 pieces" : "Minimum: 50 kg of packaging film"}
                    </p>
                    {qtyUnit === "pieces" && qty <= 1000 && (
                      <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 border border-amber-200">
                        <span className="text-amber-500 text-base leading-none mt-0.5">⚠️</span>
                        <p className="text-xs text-amber-800 leading-snug">
                          <strong>Prices are higher at low quantities.</strong> Ordering 2,500+ pieces can reduce your unit cost by 30–50%. The estimate shown reflects your current quantity — your actual savings will be shown in the full quote.
                        </p>
                      </div>
                    )}
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
                  <div className="font-bold text-slate-800 text-sm mb-1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Artwork &amp; Dieline</div>
                  <div className="text-xs text-slate-400 mb-5">Upload your artwork or dieline file, or let us design it.</div>
                  <div className="grid grid-cols-3 gap-4">
                    {([
                      { id: "upload" as ArtworkOption, icon: <Upload className="w-8 h-8" />, label: "Upload My File", sub: "PDF, AI, CDR, SVG — artwork or dieline", badge: null },
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
                    <div
                      className="mt-5 border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors"
                      style={{ borderColor: artworkFile ? "#1B6CA8" : "#CBD5E1", background: artworkFile ? "rgba(27,108,168,0.04)" : "white" }}
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
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                      Delivery Pincode<span style={{ color: "#E04B4B" }}> *</span>
                    </label>
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
                        ["Quantity", `${qty.toLocaleString()} ${qtyUnit}`],
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

                  {/* What happens next */}
                  <div style={{ background: "#F8F9FC", border: "1px solid #E2EAF4", borderTop: "2px solid #1B6CA8", borderRadius: 10, padding: "20px 20px 16px" }}>
                    <p style={{ color: "#1B6CA8", fontSize: 10, fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", marginBottom: 14 }}>WHAT HAPPENS NEXT</p>
                    <div style={{ display: "flex", gap: 0, flexDirection: "column" as const }}>
                      {[
                        { n: "1", title: "We review your spec", body: "Same day — our team checks SKU, quantity, and delivery requirements.", color: "#1B6CA8" },
                        { n: "2", title: "You receive an itemised quote", body: "Within 48 hours via WhatsApp and email — line-item breakdown, no surprises.", color: "#E8A838" },
                        { n: "3", title: "You approve before anything starts", body: "Nothing is ordered or produced until you give the green light.", color: "#22C55E" },
                      ].map((step, i) => (
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
