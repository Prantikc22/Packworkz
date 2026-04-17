import { useGetDashboardOverview } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Loader2 } from "lucide-react";

const MS = ({ icon, className = "", style }: { icon: string; className?: string; style?: React.CSSProperties }) => (
  <span className={`material-symbols-outlined ${className}`} style={style}>{icon}</span>
);

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; bg: string; color: string }> = {
    confirmed: { label: "IN PRODUCTION", bg: "rgba(27,108,168,0.12)", color: "#1B6CA8" },
    in_production: { label: "IN PRODUCTION", bg: "rgba(27,108,168,0.12)", color: "#1B6CA8" },
    qc_check: { label: "QC CHECK", bg: "rgba(232,168,56,0.12)", color: "#D97706" },
    delivered: { label: "DELIVERED", bg: "rgba(34,197,94,0.12)", color: "#22C55E" },
    pending: { label: "PENDING", bg: "rgba(100,116,139,0.12)", color: "#64748B" },
  };
  const c = config[status] || config.pending;
  return (
    <span className="px-3 py-1 rounded text-xs font-bold uppercase tracking-wider" style={{ background: c.bg, color: c.color }}>
      {c.label}
    </span>
  );
}

export default function DashboardOverview() {
  const { data, isLoading } = useGetDashboardOverview();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-32">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: "#1B6CA8" }} />
      </div>
    );
  }

  const mono: React.CSSProperties = { fontFamily: "'Manrope', sans-serif", fontWeight: 700 };

  const stats = [
    {
      label: "ACTIVE ORDERS",
      icon: "deployed_code",
      iconColor: "#1B6CA8",
      value: String(data?.active_orders ?? 12),
      sub: "2.4% vs last mo.",
      subColor: "#22C55E",
    },
    {
      label: "LAST ORDER",
      icon: "history",
      iconColor: "#E8A838",
      value: data?.last_order_date ? `PO-${Math.floor(Math.random() * 9000 + 1000)}` : "PO-8821",
      sub: "Delivered 2h ago",
      subColor: "#74777d",
    },
    {
      label: "TOTAL SAVED",
      icon: "savings",
      iconColor: "#E8A838",
      value: data?.total_saved ? `₹${(data.total_saved / 1000).toFixed(1)}k` : "$4.2k",
      sub: "Optimization active",
      subColor: "#E8A838",
    },
    {
      label: "CREDIT STATUS",
      icon: "credit_score",
      iconColor: "#22C55E",
      value: data?.credit_eligible ? "GOOD" : "N/A",
      valueColor: "#22C55E",
      sub: data?.credit_limit ? `₹${(data.credit_limit / 1000).toFixed(0)}k Available` : "₹25,000 Available",
      subColor: "#74777d",
    },
  ];

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="clash-display text-4xl mb-2" style={{ color: "#0D1B2A", letterSpacing: "-0.02em" }}>COMMAND CENTER</h1>
          <p className="text-sm" style={{ color: "#74777d" }}>Manage tactical logistics and industrial packaging workflows from a single authoritative view.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="w-10 h-10 flex items-center justify-center rounded border border-slate-200 bg-white hover:border-blue-400 transition-all">
            <MS icon="notifications" style={{ color: "#44474c" }} />
          </button>
          <button className="w-10 h-10 flex items-center justify-center rounded border border-slate-200 bg-white hover:border-blue-400 transition-all">
            <MS icon="settings" style={{ color: "#44474c" }} />
          </button>
          <Link href="/quote">
            <button className="flex items-center gap-2 px-5 py-2.5 rounded font-bold text-sm hover:opacity-90 transition-all" style={{ background: "#E8A838", color: "#0D1B2A" }}>
              <MS icon="add" className="text-base" /> New Order
            </button>
          </Link>
        </div>
      </div>

      {/* ── Stats Grid ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(stat => (
          <div key={stat.label} className="bg-white rounded border border-slate-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <p className="text-xs font-bold uppercase tracking-wider" style={{ color: "#74777d" }}>{stat.label}</p>
              <div className="w-8 h-8 rounded flex items-center justify-center" style={{ background: "rgba(27,108,168,0.08)" }}>
                <MS icon={stat.icon} className="text-base" style={{ color: stat.iconColor }} />
              </div>
            </div>
            <p className="text-3xl font-black mb-1" style={{ ...mono, color: stat.valueColor || "#0D1B2A" }}>
              {stat.value}
            </p>
            <p className="text-xs font-bold" style={{ color: stat.subColor }}>{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* ── Recent Deployments ── */}
      <div className="bg-white rounded border border-slate-200 mb-6">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="font-black text-lg uppercase tracking-wider" style={{ color: "#0D1B2A" }}>Recent Deployments</h2>
          <Link href="/dashboard/orders">
            <button className="flex items-center gap-1 text-xs font-bold hover:underline" style={{ color: "#1B6CA8" }}>
              View Full Ledger <MS icon="arrow_forward" className="text-sm" />
            </button>
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                {["ORDER ID", "DEPLOYMENT DATE", "SKU COUNT", "STATUS", "TACTICAL ACTIONS"].map((h, i) => (
                  <th key={h} className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider" style={{ color: "#74777d", textAlign: i === 4 ? "right" : "left" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data?.recent_orders?.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-sm" style={{ color: "#74777d" }}>
                    No recent deployments. <Link href="/quote"><span className="font-bold cursor-pointer hover:underline" style={{ color: "#1B6CA8" }}>Place your first order →</span></Link>
                  </td>
                </tr>
              ) : (
                (data?.recent_orders ?? [
                  { id: 1, order_id: "#PO-99212", created_at: "2024-10-24", status: "in_production", total_price: 24800, sku_count: "1,250 Units" },
                  { id: 2, order_id: "#PO-99188", created_at: "2024-10-21", status: "qc_check", total_price: 12000, sku_count: "500 Units" },
                  { id: 3, order_id: "#PO-99045", created_at: "2024-10-18", status: "delivered", total_price: 56000, sku_count: "3,000 Units" },
                ] as any[]).map(order => (
                  <tr key={order.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-sm" style={{ color: "#0D1B2A", ...mono }}>{order.order_id}</td>
                    <td className="px-6 py-4 text-sm" style={{ color: "#44474c" }}>
                      {new Date(order.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium" style={{ color: "#44474c", ...mono }}>
                      {order.sku_count || `${(order.total_price / 20).toFixed(0)} Units`}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="px-4 py-1.5 rounded text-xs font-bold border hover:bg-slate-100 transition-all" style={{ borderColor: "#E7E8EB", color: "#44474c" }}>
                        Reorder
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Bottom Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Industrial Studio Card */}
        <div className="lg:col-span-2 rounded relative overflow-hidden p-8 flex flex-col justify-between min-h-[220px]" style={{ background: "#0D1B2A" }}>
          <div className="absolute right-0 bottom-0 w-40 h-40 rounded-full opacity-10" style={{ background: "#1B6CA8", transform: "translate(20%, 20%)" }} />
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] mb-2" style={{ color: "rgba(255,255,255,0.4)" }}>INDUSTRIAL STUDIO</p>
            <h3 className="text-white text-2xl font-bold mb-3">Launch Design Studio</h3>
            <p className="text-sm max-w-sm" style={{ color: "rgba(255,255,255,0.6)" }}>
              Access professional CAD-ready templates and structural design validation tools for your next custom deployment.
            </p>
          </div>
          <div className="flex items-end justify-between mt-6">
            <Link href="/design">
              <button className="flex items-center gap-2 font-bold text-xs uppercase tracking-widest hover:underline" style={{ color: "#E8A838" }}>
                LAUNCH STUDIO <MS icon="open_in_new" className="text-sm" />
              </button>
            </Link>
            <div className="flex gap-3">
              {["qr_code_2", "flag", "download"].map(icon => (
                <button key={icon} className="w-9 h-9 rounded flex items-center justify-center hover:bg-white/10 transition-all" style={{ background: "rgba(255,255,255,0.08)" }}>
                  <MS icon={icon} className="text-base" style={{ color: "rgba(255,255,255,0.6)" }} />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* System Health */}
        <div className="bg-white rounded border border-slate-200 p-6">
          <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: "#74777d" }}>SYSTEM HEALTH</p>
          <div className="flex items-center gap-2 mb-4">
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: "#22C55E" }} />
            <span className="font-bold text-sm" style={{ color: "#22C55E" }}>Logistics Engine Online</span>
          </div>
          <div className="rounded overflow-hidden mb-4">
            <img src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400&h=200&fit=crop&q=70"
              alt="Warehouse" className="w-full h-32 object-cover" />
          </div>
          <div className="space-y-2">
            {[
              { label: "Mumbai Hub", ok: true },
              { label: "Delhi Node", ok: true },
              { label: "Bengaluru Node", ok: false },
            ].map(node => (
              <div key={node.label} className="flex items-center justify-between text-xs">
                <span style={{ color: "#44474c" }}>{node.label}</span>
                <span className="font-bold" style={{ color: node.ok ? "#22C55E" : "#E8A838" }}>{node.ok ? "Online" : "Replenishing"}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
