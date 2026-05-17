import { useState, useEffect } from "react";
import { Loader2, Plus, KeyRound, Trash2, Users, CheckCircle, XCircle } from "lucide-react";

const BASE = import.meta.env.VITE_API_BASE_URL || "";

async function adminFetch(path: string, options: RequestInit = {}) {
  const adminKey = localStorage.getItem("packwerk_admin_key") || "";
  const res = await fetch(`${BASE}/api${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "x-admin-key": adminKey,
      ...(options.headers ?? {}),
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(err.error ?? "Request failed");
  }
  return res.json();
}

type User = {
  id: string;
  email: string;
  company_name: string;
  contact_name: string;
  phone: string;
  orders_completed: number;
  credit_eligible: boolean;
  created_at: string;
};

function Toast({ msg, type, onClose }: { msg: string; type: "success" | "error"; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [onClose]);
  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 shadow-2xl text-[13px] font-bold"
      style={{ background: type === "success" ? "#0D1B2A" : "#ba1a1a", color: "white", minWidth: 280 }}>
      {type === "success" ? <CheckCircle className="w-4 h-4" style={{ color: "#E8A838" }} /> : <XCircle className="w-4 h-4" />}
      {msg}
    </div>
  );
}

function CreateUserModal({ onClose, onCreated }: { onClose: () => void; onCreated: (u: User) => void }) {
  const [form, setForm] = useState({ email: "", company_name: "", contact_name: "", phone: "", password: "", country: "India" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const f = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await adminFetch("/admin/users", {
        method: "POST",
        body: JSON.stringify(form),
      });
      onCreated(result.user);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const inputCls = "w-full border border-[#E7E8EB] px-3 py-2 text-[13px] focus:outline-none focus:border-[#1B6CA8]";
  const labelCls = "block text-[11px] font-black uppercase tracking-widest mb-1" as const;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-[2px]">
      <div className="bg-white w-full max-w-lg shadow-2xl" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#F1F3F5]">
          <h2 className="font-black text-[16px]" style={{ color: "#0D1B2A" }}>Create New Client</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center hover:bg-[#F8F9FC]">
            <span className="material-symbols-outlined text-xl" style={{ color: "#64748B" }}>close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className={labelCls} style={{ color: "#64748B" }}>Email address *</label>
              <input required value={form.email} onChange={e => f("email", e.target.value)}
                className={inputCls} placeholder="client@company.com" type="email" />
            </div>
            <div className="col-span-2">
              <label className={labelCls} style={{ color: "#64748B" }}>Company name *</label>
              <input required value={form.company_name} onChange={e => f("company_name", e.target.value)}
                className={inputCls} placeholder="Acme Industries Pvt Ltd" />
            </div>
            <div>
              <label className={labelCls} style={{ color: "#64748B" }}>Contact name</label>
              <input value={form.contact_name} onChange={e => f("contact_name", e.target.value)}
                className={inputCls} placeholder="Riya Sharma" />
            </div>
            <div>
              <label className={labelCls} style={{ color: "#64748B" }}>Phone</label>
              <input value={form.phone} onChange={e => f("phone", e.target.value)}
                className={inputCls} placeholder="+91 98765 43210" />
            </div>
            <div className="col-span-2">
              <label className={labelCls} style={{ color: "#64748B" }}>Password *</label>
              <input required value={form.password} onChange={e => f("password", e.target.value)}
                className={inputCls} placeholder="Set a strong password" type="password" minLength={8} />
              <p className="text-[11px] mt-1" style={{ color: "#94A3B8" }}>Minimum 8 characters. Share this with the client securely.</p>
            </div>
          </div>

          {error && (
            <div className="px-4 py-3 text-[13px] font-bold" style={{ background: "rgba(186,26,26,0.08)", color: "#ba1a1a" }}>
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 border border-[#E7E8EB] text-[13px] font-bold" style={{ color: "#64748B" }}>
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 py-2.5 text-[13px] font-black uppercase tracking-wider"
              style={{ background: "#E8A838", color: "#0D1B2A" }}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Create Client"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ResetPasswordModal({ user, onClose, onSuccess }: { user: User; onClose: () => void; onSuccess: () => void }) {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await adminFetch(`/admin/users/${user.id}/password`, {
        method: "PUT",
        body: JSON.stringify({ password }),
      });
      onSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-[2px]">
      <div className="bg-white w-full max-w-sm shadow-2xl" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#F1F3F5]">
          <h2 className="font-black text-[15px]" style={{ color: "#0D1B2A" }}>Reset Password</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center hover:bg-[#F8F9FC]">
            <span className="material-symbols-outlined text-xl" style={{ color: "#64748B" }}>close</span>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-6 space-y-4">
          <p className="text-[13px]" style={{ color: "#64748B" }}>
            Reset password for <strong style={{ color: "#0D1B2A" }}>{user.email}</strong>
          </p>
          <div>
            <label className="block text-[11px] font-black uppercase tracking-widest mb-1" style={{ color: "#64748B" }}>New password</label>
            <input required value={password} onChange={e => setPassword(e.target.value)}
              className="w-full border border-[#E7E8EB] px-3 py-2 text-[13px] focus:outline-none focus:border-[#1B6CA8]"
              type="password" minLength={8} placeholder="Minimum 8 characters" />
          </div>
          {error && <p className="text-[12px] font-bold" style={{ color: "#ba1a1a" }}>{error}</p>}
          <div className="flex gap-3">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 border border-[#E7E8EB] text-[13px] font-bold" style={{ color: "#64748B" }}>
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 py-2.5 text-[13px] font-black"
              style={{ background: "#1B6CA8", color: "white" }}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Reset Password"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [resetUser, setResetUser] = useState<User | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [search, setSearch] = useState("");

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
  };

  const loadUsers = async () => {
    try {
      const data = await adminFetch("/admin/users");
      setUsers(data);
    } catch (err: any) {
      showToast("Failed to load users: " + err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadUsers(); }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this user? This cannot be undone.")) return;
    try {
      await adminFetch(`/admin/users/${id}`, { method: "DELETE" });
      setUsers(prev => prev.filter(u => u.id !== id));
      showToast("User deleted");
    } catch (err: any) {
      showToast("Delete failed: " + err.message, "error");
    }
  };

  const filtered = users.filter(u =>
    !search ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    (u.company_name ?? "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black" style={{ color: "#0D1B2A" }}>Clients</h1>
          <p className="text-[13px] mt-0.5" style={{ color: "#94A3B8" }}>{users.length} registered clients</p>
        </div>
        <button onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-5 py-2.5 text-[13px] font-black uppercase tracking-wider"
          style={{ background: "#E8A838", color: "#0D1B2A" }}>
          <Plus className="w-4 h-4" /> Create Client
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-4 max-w-sm">
        <span className="material-symbols-outlined text-base absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#94A3B8" }}>search</span>
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by email or company…"
          className="w-full pl-9 pr-4 py-2 border border-[#E7E8EB] text-[13px] bg-white focus:outline-none focus:border-[#1B6CA8]" />
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin" style={{ color: "#1B6CA8" }} /></div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center py-20 bg-white border border-[#E7E8EB]">
          <Users className="w-10 h-10 mb-3" style={{ color: "#CBD5E1" }} />
          <p className="font-bold text-[15px]" style={{ color: "#94A3B8" }}>No clients yet</p>
          <p className="text-[13px] mt-1 mb-4" style={{ color: "#CBD5E1" }}>Create a client account to give them dashboard access</p>
          <button onClick={() => setShowCreate(true)}
            className="px-5 py-2.5 text-[13px] font-black" style={{ background: "#E8A838", color: "#0D1B2A" }}>
            + Create First Client
          </button>
        </div>
      ) : (
        <div className="bg-white border border-[#E7E8EB] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-[#F1F3F5]">
                  {["COMPANY", "EMAIL", "CONTACT", "PHONE", "ORDERS", "CREDIT", "JOINED", "ACTIONS"].map((h, i) => (
                    <th key={h} className="px-4 py-3 text-left text-[11px] font-black uppercase tracking-wider"
                      style={{ color: "#94A3B8", textAlign: i === 7 ? "right" : "left" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(u => (
                  <tr key={u.id} className="border-b border-[#F8F9FC] hover:bg-[#FAFBFC]">
                    <td className="px-4 py-3 font-bold" style={{ color: "#0D1B2A" }}>{u.company_name ?? "—"}</td>
                    <td className="px-4 py-3" style={{ color: "#64748B" }}>{u.email}</td>
                    <td className="px-4 py-3" style={{ color: "#64748B" }}>{u.contact_name || "—"}</td>
                    <td className="px-4 py-3" style={{ color: "#64748B" }}>{u.phone || "—"}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="font-black text-[13px]" style={{ color: "#1B6CA8" }}>{u.orders_completed ?? 0}</span>
                    </td>
                    <td className="px-4 py-3">
                      {u.credit_eligible ? (
                        <span className="px-2 py-0.5 text-[10px] font-black uppercase" style={{ background: "rgba(22,163,74,0.1)", color: "#16A34A" }}>Active</span>
                      ) : (
                        <span className="text-[12px]" style={{ color: "#CBD5E1" }}>—</span>
                      )}
                    </td>
                    <td className="px-4 py-3" style={{ color: "#94A3B8" }}>
                      {new Date(u.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => setResetUser(u)}
                          className="flex items-center gap-1 px-2.5 py-1.5 border border-[#E7E8EB] text-[11px] font-bold hover:border-[#1B6CA8] hover:text-[#1B6CA8] transition-all"
                          style={{ color: "#64748B" }}>
                          <KeyRound className="w-3 h-3" /> Reset PW
                        </button>
                        <button onClick={() => handleDelete(u.id)}
                          className="flex items-center gap-1 px-2.5 py-1.5 border border-[#E7E8EB] text-[11px] font-bold hover:border-red-400 hover:text-red-500 transition-all"
                          style={{ color: "#64748B" }}>
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showCreate && (
        <CreateUserModal
          onClose={() => setShowCreate(false)}
          onCreated={(newUser) => {
            setUsers(prev => [newUser as any, ...prev]);
            setShowCreate(false);
            showToast(`Client ${newUser.email} created successfully`);
          }}
        />
      )}

      {resetUser && (
        <ResetPasswordModal
          user={resetUser}
          onClose={() => setResetUser(null)}
          onSuccess={() => {
            setResetUser(null);
            showToast(`Password reset for ${resetUser.email}`);
          }}
        />
      )}

      {toast && (
        <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />
      )}
    </div>
  );
}
