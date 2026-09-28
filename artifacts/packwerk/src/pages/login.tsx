import { useState } from "react";
import { useLogin } from "@workspace/api-client-react";
import { Link, useLocation } from "wouter";
import { ArrowRight, ChevronRight, Eye, EyeOff, Loader2, LockKeyhole, MessageCircle, PackageSearch } from "lucide-react";
import { AuthShell } from "@/components/auth/AuthShell";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [, setLocation] = useLocation();
  const loginMutation = useLogin();

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    loginMutation.mutate({ data: { email, password } }, {
      onSuccess: (data: any) => {
        localStorage.setItem("packwerk_access_token", data.access_token);
        // Merge must_change_password into user object so change-password page can read it
        localStorage.setItem("packwerk_user", JSON.stringify({
          ...data.user,
          must_change_password: !!data.must_change_password,
        }));
        setLocation(data.must_change_password ? "/change-password" : "/dashboard");
      },
      onError: () => setError("That email and password don’t match an account. Check them, or reset access via WhatsApp."),
    });
  };

  return (
    <AuthShell title="Sign in | Packworkz">
            <h1 className="pa-title">Sign in to Packworkz</h1>
      <p className="pa-sub">Don’t have an account? <Link href="/signup">Create one in a minute</Link></p>

      <form onSubmit={handleSubmit} className="pa-form">
        <label className="pa-field">
          <input id="email" type="email" required autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder=" " />
          <span>Work email</span>
        </label>
        <label className="pa-field has-toggle">
          <input id="password" type={showPassword ? "text" : "password"} required autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder=" " />
          <span>Password</span>
          <button type="button" className="pa-eye" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
        </label>
        <div className="pa-meta">
          <a className="pa-link" href="https://wa.me/918208990366?text=Hi%20Packworkz%2C%20I%20need%20help%20signing%20in." target="_blank" rel="noreferrer">Forgot password?</a>
        </div>
        {error && <p className="pa-error" role="alert">{error}</p>}
        <button type="submit" className="pa-submit" disabled={loginMutation.isPending}>
          {loginMutation.isPending ? <><Loader2 size={18} className="animate-spin" /> Signing in</> : <>Sign in <ArrowRight size={18} /></>}
        </button>
      </form>

      <div className="pa-divider" />
      <div className="pa-alt">
        <Link href="/track-order"><span><PackageSearch size={18} /> Track an order without an account</span><ChevronRight size={16} /></Link>
        <a href="https://wa.me/918208990366" target="_blank" rel="noreferrer"><span><MessageCircle size={18} /> Get help on WhatsApp</span><ChevronRight size={16} /></a>
      </div>
      <p className="pa-fine"><LockKeyhole size={14} /> Guest orders can be linked to your account later with their order reference.</p>
    </AuthShell>
  );
}
