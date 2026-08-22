import { useEffect, useRef, useState } from "react";
import { ArrowRight, BadgePercent, CheckCircle2, Loader2, X } from "lucide-react";
import { LAUNCH_PROMOTION_RATE } from "@workspace/commerce";

const SESSION_KEY = "packworkz_exit_offer_seen_v1";
const CAPTURED_KEY = "packworkz_exit_offer_captured_v1";
const SUPPRESSED_PATHS = ["/cart", "/configure", "/procurement-plan", "/dashboard", "/login", "/signup", "/track-order"];

type SubmitState = "idle" | "sending" | "sent" | "error";

export function ExitOfferModal({ location }: { location: string }) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [state, setState] = useState<SubmitState>("idle");
  const [error, setError] = useState("");
  const emailRef = useRef<HTMLInputElement>(null);
  const eligible = !SUPPRESSED_PATHS.some((path) => location.startsWith(path));

  useEffect(() => {
    if (!eligible || sessionStorage.getItem(SESSION_KEY) || localStorage.getItem(CAPTURED_KEY)) return;

    let armed = false;
    let shown = false;
    const show = () => {
      if (shown || sessionStorage.getItem(SESSION_KEY)) return;
      if (!armed && !window.matchMedia("(pointer: coarse)").matches) return;
      shown = true;
      sessionStorage.setItem(SESSION_KEY, "shown");
      setOpen(true);
    };
    const armTimer = window.setTimeout(() => { armed = true; }, 12_000);
    const mobileTimer = window.setTimeout(() => {
      if (window.matchMedia("(pointer: coarse)").matches && window.scrollY > 320) show();
    }, 45_000);
    const onMouseOut = (event: MouseEvent) => {
      if (event.clientY <= 4 && !event.relatedTarget) show();
    };

    document.addEventListener("mouseout", onMouseOut);
    return () => {
      window.clearTimeout(armTimer);
      window.clearTimeout(mobileTimer);
      document.removeEventListener("mouseout", onMouseOut);
    };
  }, [eligible, location]);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.setTimeout(() => emailRef.current?.focus(), 50);
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone.trim();
    const phoneDigits = cleanPhone.replace(/\D/g, "");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setError("Enter a valid business email address.");
      return;
    }
    if (phoneDigits.length < 10 || phoneDigits.length > 15) {
      setError("Enter a valid WhatsApp or phone number.");
      return;
    }

    setState("sending");
    setError("");
    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source: "exit_offer",
          email: cleanEmail,
          phone: cleanPhone,
          subject: "Exit offer lead — first online order",
          message: "Visitor requested the first-order launch offer before leaving the website.",
          metadata: { page: location, promotion: "PACK7" },
        }),
      });
      const payload = await response.json() as { error?: string };
      if (!response.ok) throw new Error(payload.error || "We could not save your details.");
      localStorage.setItem(CAPTURED_KEY, "captured");
      setState("sent");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Please try again.");
      setState("error");
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[10050] flex items-end justify-center bg-slate-950/70 p-0 backdrop-blur-sm sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="exit-offer-title"
      onMouseDown={(event) => { if (event.target === event.currentTarget) setOpen(false); }}
    >
      <div className="relative w-full max-w-2xl overflow-hidden bg-white shadow-2xl sm:rounded-2xl">
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="absolute right-4 top-4 z-10 grid h-10 w-10 place-items-center rounded-full border border-white/20 bg-slate-950/30 text-white transition hover:bg-slate-950/60"
          aria-label="Close offer"
        >
          <X size={19} />
        </button>

        <div className="grid md:grid-cols-[0.9fr_1.1fr]">
          <div className="relative overflow-hidden bg-[#0B3FA0] px-7 py-8 text-white sm:px-9 sm:py-10">
            <div className="absolute -right-14 -top-16 h-48 w-48 rounded-full border-[28px] border-white/5" />
            <BadgePercent size={32} className="mb-8 text-[#F7C95C]" />
            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-blue-200">First online order</p>
            <h2 id="exit-offer-title" className="mt-3 text-4xl font-black leading-none">
              Save {Math.round(LAUNCH_PROMOTION_RATE * 100)}% on your launch run.
            </h2>
            <p className="mt-5 text-sm leading-6 text-blue-100/80">
              Share your details and we’ll save the launch offer with your enquiry, plus help shortlist the right format and MOQ.
            </p>
            <p className="mt-7 border-l-2 border-[#F7C95C] pl-4 text-xs leading-5 text-blue-100/70">
              Eligible first online orders only. Applied at checkout while the monthly launch allocation is available.
            </p>
          </div>

          <div className="px-7 py-8 sm:px-9 sm:py-10">
            {state === "sent" ? (
              <div className="flex h-full min-h-64 flex-col justify-center">
                <CheckCircle2 size={42} className="text-emerald-600" />
                <h3 className="mt-5 text-2xl font-black text-slate-950">You’re on the list.</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">Your details are saved. Browse normally—the launch saving is already applied automatically on eligible checkout orders.</p>
                <button type="button" onClick={() => setOpen(false)} className="mt-7 h-12 bg-slate-950 px-5 text-sm font-black text-white">Continue browsing</button>
              </div>
            ) : (
              <form onSubmit={submit} noValidate>
                <p className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-500">Send me the offer</p>
                <label className="mt-6 block text-xs font-black text-slate-800" htmlFor="exit-email">Business email</label>
                <input
                  ref={emailRef}
                  id="exit-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@brand.com"
                  className="mt-2 h-12 w-full rounded-lg border border-slate-300 px-4 text-sm outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                  required
                />
                <label className="mt-5 block text-xs font-black text-slate-800" htmlFor="exit-phone">WhatsApp / phone</label>
                <input
                  id="exit-phone"
                  type="tel"
                  autoComplete="tel"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  placeholder="+91 98765 43210"
                  className="mt-2 h-12 w-full rounded-lg border border-slate-300 px-4 text-sm outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                  required
                />
                {error && <p className="mt-3 text-xs font-bold text-red-600" role="alert">{error}</p>}
                <button
                  type="submit"
                  disabled={state === "sending"}
                  className="mt-6 flex h-[52px] w-full items-center justify-center gap-2 rounded-lg bg-[#E8A838] px-5 text-sm font-black text-slate-950 transition hover:bg-[#F7C95C] disabled:cursor-wait disabled:opacity-70"
                >
                  {state === "sending" ? <><Loader2 size={17} className="animate-spin" /> Saving…</> : <>Save my launch offer <ArrowRight size={17} /></>}
                </button>
                <p className="mt-4 text-[10px] leading-4 text-slate-500">
                  By submitting, you agree that Packworkz may contact you about packaging and this offer by email, phone or WhatsApp. You can opt out anytime.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
