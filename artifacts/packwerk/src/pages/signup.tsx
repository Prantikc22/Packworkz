import { useMemo, useState } from "react";
import { ArrowRight, Check, Loader2, LockKeyhole } from "lucide-react";
import { Link, useLocation } from "wouter";
import { AuthShell } from "@/components/auth/AuthShell";

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

  const field = (key: keyof typeof form, label: string, props: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <label className="pa-field">
      <input value={form[key]} onChange={setField(key)} placeholder=" " {...props} />
      <span>{label}</span>
    </label>
  );

  return (
    <AuthShell wide title="Create your account | Packworkz" aside={claimReference ? <div className="pa-claim"><small>RECORD TO LINK</small><strong>{claimReference}</strong></div> : undefined}>
                <h1 className="pa-title">Create your Packworkz account</h1>
        <p className="pa-sub">Already have an account? <Link href="/login">Sign in</Link></p>

        <form onSubmit={submit} className="pa-form">
          <div className="pa-row">
            {field("contactName", "Full name", { required: true, autoComplete: "name" })}
            {field("companyName", "Company or brand", { required: true, autoComplete: "organization" })}
          </div>
          {field("email", "Work email", { required: true, type: "email", autoComplete: "email" })}
          {field("phone", "Mobile / WhatsApp (optional)", { type: "tel", autoComplete: "tel" })}
          <div className="pa-row">
            {field("password", "Password (8+ characters)", { required: true, minLength: 8, type: "password", autoComplete: "new-password" })}
            {field("confirmPassword", "Confirm password", { required: true, minLength: 8, type: "password", autoComplete: "new-password" })}
          </div>
          {error && <p role="alert" className="pa-error">{error}</p>}
          <button disabled={loading} className="pa-submit is-amber">
            {loading ? <><Loader2 className="animate-spin" size={18} /> Creating workspace</> : <>Create account <ArrowRight size={18} /></>}
          </button>
        </form>

        <p className="pa-fine"><LockKeyhole size={14} /> Earlier guest orders are linked only after the order reference and contact detail are verified.</p>
        <p className="pa-fine"><Check size={14} /> No invitation needed. Use the same email you use for packaging orders.</p>
    </AuthShell>
  );
}
