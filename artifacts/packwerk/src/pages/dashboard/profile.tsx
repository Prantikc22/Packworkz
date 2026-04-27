import { useState, useEffect } from "react";
import { useGetDashboardProfile, useUpdateDashboardProfile } from "@workspace/api-client-react";
import { Loader2, CheckCircle, MessageCircle, Mail } from "lucide-react";

const WHATSAPP_NUM = "919999999999";
const SUPPORT_EMAIL = "support@packops.in";

const INDIA_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Delhi", "Chandigarh", "Puducherry",
];

type FormField = {
  label: string;
  key: string;
  readOnly?: boolean;
  placeholder?: string;
  type?: string;
};

export default function DashboardProfile() {
  const { data: profile, isLoading } = useGetDashboardProfile();
  const { mutate: updateProfile, isPending } = useUpdateDashboardProfile();

  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    company_name: "",
    contact_name: "",
    phone: "",
    gstin: "",
    address_line1: "",
    address_line2: "",
    city: "",
    state: "",
    pincode: "",
    country: "India",
  });

  useEffect(() => {
    if (profile) {
      const addr = (profile.default_address as any) ?? {};
      setForm({
        company_name: profile.company_name ?? "",
        contact_name: profile.contact_name ?? "",
        phone: profile.phone ?? "",
        gstin: profile.gstin ?? "",
        address_line1: addr.address_line1 ?? "",
        address_line2: addr.address_line2 ?? "",
        city: addr.city ?? "",
        state: addr.state ?? "",
        pincode: addr.pincode ?? "",
        country: addr.country ?? "India",
      });
    }
  }, [profile]);

  const field = (key: string, value: string) => setForm(f => ({ ...f, [key]: value }));

  const handleSave = () => {
    setSaved(false);
    setError(null);
    updateProfile(
      {
        data: {
          company_name: form.company_name,
          contact_name: form.contact_name,
          phone: form.phone,
          gstin: form.gstin,
          default_address: {
            address_line1: form.address_line1,
            address_line2: form.address_line2,
            city: form.city,
            state: form.state,
            pincode: form.pincode,
            country: form.country,
          },
        },
      },
      {
        onSuccess: () => {
          setSaved(true);
          setTimeout(() => setSaved(false), 3000);
        },
        onError: () => setError("Failed to save. Please try again."),
      }
    );
  };

  if (isLoading) {
    return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin" style={{ color: "#1B6CA8" }} /></div>;
  }

  const inputClass = "w-full border border-[#E7E8EB] px-4 py-2.5 text-[13px] bg-white focus:outline-none focus:border-[#1B6CA8] transition-colors";
  const labelClass = "block text-[11px] font-black uppercase tracking-widest mb-1.5" as const;
  const sectionTitle = "font-black text-[16px] uppercase tracking-wider mb-6" as const;

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", maxWidth: 720 }}>
      <h1 className="font-black text-[28px] mb-8 leading-tight" style={{ color: "#0D1B2A", letterSpacing: "-0.01em" }}>Profile</h1>

      {/* ── Company Details ── */}
      <div className="bg-white border border-[#E7E8EB] p-6 mb-6">
        <p className={sectionTitle} style={{ color: "#0D1B2A" }}>Company Details</p>

        {/* Email (read-only) */}
        <div className="mb-5">
          <label className={labelClass} style={{ color: "#94A3B8" }}>Email address</label>
          <input
            value={profile?.email ?? ""}
            disabled
            className="w-full border border-[#F1F3F5] px-4 py-2.5 text-[13px] bg-[#F8F9FC] text-[#94A3B8] cursor-not-allowed"
          />
          <p className="text-[11px] mt-1" style={{ color: "#CBD5E1" }}>Email cannot be changed</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
          <div>
            <label className={labelClass} style={{ color: "#64748B" }}>Company name</label>
            <input value={form.company_name} onChange={e => field("company_name", e.target.value)} className={inputClass} placeholder="Acme Industries Pvt Ltd" />
          </div>
          <div>
            <label className={labelClass} style={{ color: "#64748B" }}>Contact name</label>
            <input value={form.contact_name} onChange={e => field("contact_name", e.target.value)} className={inputClass} placeholder="Riya Sharma" />
          </div>
          <div>
            <label className={labelClass} style={{ color: "#64748B" }}>Phone number</label>
            <input value={form.phone} onChange={e => field("phone", e.target.value)} className={inputClass} placeholder="+91 98765 43210" type="tel" />
          </div>
          <div>
            <label className={labelClass} style={{ color: "#64748B" }}>GSTIN</label>
            <input value={form.gstin} onChange={e => field("gstin", e.target.value)} className={inputClass} placeholder="22AAAAA0000A1Z5" style={{ fontFamily: "monospace", letterSpacing: "0.05em" }} />
          </div>
        </div>
      </div>

      {/* ── Default Shipping Address ── */}
      <div className="bg-white border border-[#E7E8EB] p-6 mb-6">
        <p className={sectionTitle} style={{ color: "#0D1B2A" }}>Default Shipping Address</p>

        <div className="space-y-5">
          <div>
            <label className={labelClass} style={{ color: "#64748B" }}>Address line 1</label>
            <input value={form.address_line1} onChange={e => field("address_line1", e.target.value)} className={inputClass} placeholder="Plot 12, Industrial Area" />
          </div>
          <div>
            <label className={labelClass} style={{ color: "#64748B" }}>Address line 2 <span style={{ color: "#CBD5E1" }}>optional</span></label>
            <input value={form.address_line2} onChange={e => field("address_line2", e.target.value)} className={inputClass} placeholder="Sector 5, Phase II" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div>
              <label className={labelClass} style={{ color: "#64748B" }}>City</label>
              <input value={form.city} onChange={e => field("city", e.target.value)} className={inputClass} placeholder="Mumbai" />
            </div>
            <div>
              <label className={labelClass} style={{ color: "#64748B" }}>State</label>
              <select value={form.state} onChange={e => field("state", e.target.value)} className={inputClass} style={{ cursor: "pointer" }}>
                <option value="">Select state</option>
                {INDIA_STATES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass} style={{ color: "#64748B" }}>Pincode</label>
              <input value={form.pincode} onChange={e => field("pincode", e.target.value)} className={inputClass} placeholder="400001" maxLength={6} style={{ fontFamily: "monospace" }} />
            </div>
          </div>
          <div>
            <label className={labelClass} style={{ color: "#64748B" }}>Country</label>
            <input value={form.country} onChange={e => field("country", e.target.value)} className={inputClass} placeholder="India" />
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="mb-10 flex items-center gap-4">
        <button
          onClick={handleSave}
          disabled={isPending}
          className="btn-fill btn-amber px-8 py-3 text-[14px] min-w-[160px]">
          {isPending ? (
            <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Saving…</span>
          ) : (
            <span>Save Changes</span>
          )}
        </button>
        {saved && (
          <div className="flex items-center gap-2 text-[13px] font-bold" style={{ color: "#16A34A" }}>
            <CheckCircle className="w-4 h-4" /> Saved successfully
          </div>
        )}
        {error && (
          <p className="text-[13px] font-bold" style={{ color: "#ba1a1a" }}>{error}</p>
        )}
      </div>

      {/* ── Danger Zone / Support ── */}
      <div className="border-t border-[#E7E8EB] pt-8">
        <p className="text-[11px] font-black uppercase tracking-widest mb-4" style={{ color: "#94A3B8" }}>NEED HELP?</p>
        <div className="flex flex-col sm:flex-row gap-3">
          <a
            href={`https://wa.me/${WHATSAPP_NUM}?text=Hi+PackOps%2C+I+need+help+with+my+account.`}
            target="_blank" rel="noopener noreferrer">
            <button className="flex items-center gap-3 px-5 py-3 border border-[#E7E8EB] text-[13px] font-bold hover:border-[#25D366] hover:text-[#25D366] transition-all" style={{ color: "#64748B" }}>
              <MessageCircle className="w-4 h-4" />
              WhatsApp support
            </button>
          </a>
          <a href={`mailto:${SUPPORT_EMAIL}?subject=Account support`}>
            <button className="flex items-center gap-3 px-5 py-3 border border-[#E7E8EB] text-[13px] font-bold hover:border-[#1B6CA8] hover:text-[#1B6CA8] transition-all" style={{ color: "#64748B" }}>
              <Mail className="w-4 h-4" />
              {SUPPORT_EMAIL}
            </button>
          </a>
        </div>
      </div>
    </div>
  );
}
