import { useEffect, useRef, useState } from "react";
import { ArrowRight, CheckCircle2, Layers, Loader2, PackageOpen, Truck, X } from "lucide-react";
import { Link } from "wouter";

const SESSION_KEY = "packworkz_exit_offer_seen_v2";
const CAPTURED_KEY = "packworkz_exit_offer_captured_v2";
const SAMPLE_KIT_PRICE = 299;
const SAMPLE_KIT_SHIPPING = 100;
const SUPPRESSED_PATHS = ["/samples", "/cart", "/configure", "/procurement-plan", "/dashboard", "/login", "/signup", "/track-order"];

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
          subject: "Exit offer lead — ₹299 sample kit",
          message: "Visitor requested the ₹299 packaging sample kit (25–50+ samples) before leaving the website.",
          metadata: { page: location, promotion: "SAMPLEKIT299" },
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
      style={{ animation: "pwFadeIn .3s ease both" }}
    >
      <div className="relative w-full max-w-3xl overflow-hidden bg-white shadow-2xl sm:rounded-2xl" style={{ animation: "pwFadeUp .55s cubic-bezier(.22,1,.36,1) both" }}>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="absolute right-4 top-4 z-10 grid h-10 w-10 place-items-center rounded-full border border-slate-200 bg-white/90 text-slate-700 shadow-sm transition hover:rotate-90 hover:bg-white"
          aria-label="Close offer"
        >
          <X size={19} />
        </button>

        <div className="grid md:grid-cols-[1fr_1fr]">
          <div className="relative overflow-hidden bg-[#0d1b2a] text-white">
            <img src="/images/sample-kit-hero-v1.webp" alt="Open Packworkz sample kit with pouches, cartons, labels and material swatches" className="h-44 w-full object-cover opacity-90 sm:h-52 md:h-60" />
            <span className="absolute left-5 top-5 bg-[#F2B134] px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.16em] text-slate-950">Sample kit</span>
            <div className="px-7 pb-8 pt-6 sm:px-9">
              <h2 id="exit-offer-title" className="text-[2rem] font-black leading-[1.02] tracking-tight sm:text-4xl" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                Get 25–50+ samples for just <span className="text-[#F2B134]">₹{SAMPLE_KIT_PRICE}.</span>
              </h2>
              <ul className="mt-5 grid gap-2.5 text-sm text-blue-100/85">
                <li className="flex items-center gap-2.5"><PackageOpen size={16} className="shrink-0 text-[#F2B134]" /> Real pouches, boxes, labels and mailers</li>
                <li className="flex items-center gap-2.5"><Layers size={16} className="shrink-0 text-[#F2B134]" /> Material & finish swatches to compare</li>
                <li className="flex items-center gap-2.5"><Truck size={16} className="shrink-0 text-[#F2B134]" /> Flat ₹{SAMPLE_KIT_SHIPPING} shipping, dispatched in 2–3 days</li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col justify-center px-7 py-8 sm:px-9 sm:py-10">
            {state === "sent" ? (
              <div className="flex h-full min-h-64 flex-col justify-center">
                <CheckCircle2 size={42} className="text-emerald-600" />
                <h3 className="mt-5 text-2xl font-black text-slate-950">Your kit is reserved.</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">We’ve saved your details. Finish the ₹{SAMPLE_KIT_PRICE + SAMPLE_KIT_SHIPPING} checkout now, or our team will reach out to help you choose.</p>
                <Link href="/samples#sample-kit-order" onClick={() => setOpen(false)} className="mt-7 flex h-[52px] items-center justify-center gap-2 rounded-lg bg-[#F2B134] px-5 text-sm font-black text-slate-950 transition hover:bg-[#ffca59]">
                  Complete my kit order <ArrowRight size={17} />
                </Link>
                <button type="button" onClick={() => setOpen(false)} className="mt-3 h-11 text-sm font-bold text-slate-500 hover:text-slate-900">Keep browsing</button>
              </div>
            ) : (
              <form onSubmit={submit} noValidate>
                <p className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-500">Before you go</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">Feel the materials before you order. Share your details and we’ll hold a kit for you.</p>
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
                  className="mt-6 flex h-[52px] w-full items-center justify-center gap-2 rounded-lg bg-[#F2B134] px-5 text-sm font-black text-slate-950 transition hover:bg-[#ffca59] disabled:cursor-wait disabled:opacity-70"
                >
                  {state === "sending" ? <><Loader2 size={17} className="animate-spin" /> Saving…</> : <>Claim my ₹{SAMPLE_KIT_PRICE} sample kit <ArrowRight size={17} /></>}
                </button>
                <Link href="/samples" onClick={() => setOpen(false)} className="mt-3 block text-center text-xs font-bold text-slate-500 underline-offset-4 hover:text-slate-900 hover:underline">See what’s inside the kit</Link>
                <p className="mt-4 text-[10px] leading-4 text-slate-500">
                  ₹{SAMPLE_KIT_PRICE} + ₹{SAMPLE_KIT_SHIPPING} shipping across India. By submitting, you agree that Packworkz may contact you about packaging and this offer by email, phone or WhatsApp. You can opt out anytime.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
