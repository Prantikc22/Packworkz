import { useMemo, useState } from "react";
import { ArrowRight, Check, Loader2, LockKeyhole } from "lucide-react";
import { Link, useLocation } from "wouter";

type SignupResponse = {
  access_token: string;
  user: Record<string, unknown>;
};

export default function Signup() {
  const [, navigate] = useLocation();
  const claimReference = useMemo(() => {
    if (typeof window === "undefined") return "";
    return new URLSearchParams(window.location.search).get("claim")?.trim().toUpperCase() || "";
  }, []);
  const [form, setForm] = useState({ contactName: "", companyName: "", email: "", phone: "", password: "", confirmPassword: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const setField = (key: keyof typeof form) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setForm((current) => ({ ...current, [key]: event.target.value }));
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    if (form.password !== form.confirmPassword) {
      setError("The passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contact_name: form.contactName,
          company_name: form.companyName,
          email: form.email,
          phone: form.phone,
          password: form.password,
        }),
      });
      const body = await response.json().catch(() => ({})) as SignupResponse & { error?: string };
      if (!response.ok) throw new Error(body.error || "Could not create the account.");

      localStorage.setItem("packwerk_access_token", body.access_token);
      localStorage.setItem("packwerk_user", JSON.stringify(body.user));

      if (claimReference) {
        localStorage.setItem("packwerk_claim_reference", claimReference);
        const claimResponse = await fetch("/api/dashboard/claim-history", {
          method: "POST",
          headers: { "Authorization": `Bearer ${body.access_token}`, "Content-Type": "application/json" },
          body: JSON.stringify({ reference: claimReference, contact: form.email }),
        });
        if (claimResponse.ok) localStorage.removeItem("packwerk_claim_reference");
      }

      navigate("/dashboard");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Could not create the account.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#eef3f7] px-5 sm:px-8 pt-32 sm:pt-36 pb-16 text-[#0d1b2a]">
      <section className="max-w-6xl mx-auto grid lg:grid-cols-[0.9fr_1.1fr] border border-[#c9d6e1] bg-white">
        <div className="bg-[#0d1b2a] text-white p-8 sm:p-12 lg:p-14 flex flex-col justify-between">
          <div>
            <p className="text-[11px] font-black tracking-[0.2em] text-[#75b5e4] mb-5">YOUR PACKWORKZ WORKSPACE</p>
            <h1 className="text-4xl sm:text-5xl font-black leading-[1.02]" style={{ fontFamily: "'Space Grotesk', sans-serif", letterSpacing: 0 }}>Every order, brief and reorder in one place.</h1>
            <p className="text-[#9eb0bf] leading-relaxed mt-6 max-w-lg">Create an account before or after buying. New work is saved automatically, and earlier guest records can be linked securely with their reference.</p>
          </div>
          <div className="mt-12 border-y border-[#294257] divide-y divide-[#294257]">
            {["See production and dispatch status", "Review managed pricing plans", "Repeat an approved specification"].map((item) => (
              <div key={item} className="py-4 flex items-center gap-3 text-sm font-bold"><span className="w-6 h-6 grid place-items-center bg-[#163349] text-[#51c68a]"><Check size={15} strokeWidth={3} /></span>{item}</div>
            ))}
          </div>
          {claimReference && <div className="mt-8 border border-[#6b552c] bg-[#1a2630] p-4"><span className="block text-[10px] tracking-[0.16em] text-[#e8a838] mb-1">RECORD TO LINK</span><strong className="font-mono">{claimReference}</strong></div>}
        </div>

        <div className="p-8 sm:p-12 lg:p-14">
          <p className="text-[11px] font-black tracking-[0.18em] text-[#2374ad] mb-3">CREATE ACCOUNT</p>
          <h2 className="text-3xl font-black" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Open your customer workspace</h2>
          <p className="text-sm text-[#64748b] mt-2 mb-8">No invitation required. Use the same work email you use for packaging orders.</p>

          <form onSubmit={submit} className="space-y-5">
            <div className="grid sm:grid-cols-2 gap-5">
              <label className="block"><span className="account-label">FULL NAME</span><input className="account-input" required autoComplete="name" value={form.contactName} onChange={setField("contactName")} /></label>
              <label className="block"><span className="account-label">COMPANY OR BRAND</span><input className="account-input" required autoComplete="organization" value={form.companyName} onChange={setField("companyName")} /></label>
            </div>
            <label className="block"><span className="account-label">WORK EMAIL</span><input className="account-input" required type="email" autoComplete="email" value={form.email} onChange={setField("email")} /></label>
            <label className="block"><span className="account-label">MOBILE <span className="font-medium text-[#94a3b8]">OPTIONAL</span></span><input className="account-input" type="tel" autoComplete="tel" value={form.phone} onChange={setField("phone")} /></label>
            <div className="grid sm:grid-cols-2 gap-5">
              <label className="block"><span className="account-label">PASSWORD</span><input className="account-input" required minLength={8} type="password" autoComplete="new-password" value={form.password} onChange={setField("password")} /></label>
              <label className="block"><span className="account-label">CONFIRM PASSWORD</span><input className="account-input" required minLength={8} type="password" autoComplete="new-password" value={form.confirmPassword} onChange={setField("confirmPassword")} /></label>
            </div>

            {error && <p role="alert" className="border border-[#e8b4b4] bg-[#fff4f4] p-4 text-sm text-[#a52b2b]">{error}</p>}
            <button disabled={loading} className="w-full min-h-14 bg-[#e8a838] text-[#071522] font-black inline-flex items-center justify-center gap-3 hover:bg-[#f2bd4d] disabled:opacity-60">
              {loading ? <><Loader2 className="animate-spin" size={19} /> Creating workspace</> : <>Create account <ArrowRight size={19} /></>}
            </button>
          </form>

          <p className="mt-5 flex gap-2 text-xs leading-relaxed text-[#718397]"><LockKeyhole size={15} className="shrink-0" /> Earlier records are linked only after the checkout reference and contact detail are verified.</p>
          <p className="mt-7 text-sm text-[#64748b]">Already have an account? <Link href="/login" className="font-black text-[#2374ad]">Sign in</Link></p>
        </div>
      </section>
    </main>
  );
}
