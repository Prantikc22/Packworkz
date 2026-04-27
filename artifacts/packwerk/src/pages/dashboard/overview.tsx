import { useGetDashboardOverview } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Loader2, RefreshCw, Plus, Package } from "lucide-react";

const MS = ({ icon, className = "", style }: { icon: string; className?: string; style?: React.CSSProperties }) => (
  <span className={`material-symbols-outlined ${className}`} style={style}>{icon}</span>
);

const WHATSAPP_NUM = "919999999999";

const STATUS_CONFIG: Record<string, { label: string; bg: string; color: string }> = {
  confirmed:    { label: "IN PRODUCTION", bg: "rgba(27,108,168,0.12)",   color: "#1B6CA8" },
  in_production:{ label: "IN PRODUCTION", bg: "rgba(27,108,168,0.12)",   color: "#1B6CA8" },
  qc_check:     { label: "QC CHECK",      bg: "rgba(232,168,56,0.15)",   color: "#D97706" },
  dispatched:   { label: "DISPATCHED",    bg: "rgba(139,92,246,0.12)",   color: "#7C3AED" },
  delivered:    { label: "DELIVERED",     bg: "rgba(34,197,94,0.12)",    color: "#16A34A" },
  pending:      { label: "PENDING",       bg: "rgba(100,116,139,0.10)",  color: "#64748B" },
};

function StatusChip({ status }: { status: string }) {
  const c = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending;
  return (
    <span className="px-3 py-1 text-xs font-black uppercase tracking-wider"
      style={{ background: c.bg, color: c.color, borderRadius: 0 }}>
      {c.label}
    </span>
  );
}

function fmt(n: number) {
  return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(n);
}

function fmtINR(n: number) {
  return `₹${fmt(n)}`;
}

export default function DashboardOverview() {
  const { data, isLoading } = useGetDashboardOverview();

  const today = new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-40">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: "#1B6CA8" }} />
      </div>
    );
  }

  const activeOrders = data?.active_orders ?? 0;
  const inProd = data?.in_production_count ?? 0;
  const dispatched = data?.dispatched_count ?? 0;
  const pendingQuotes = data?.pending_quotes ?? 0;
  const totalSaved = data?.total_saved ?? 0;
  const ordersCompleted = data?.orders_completed ?? 0;
  const creditEligible = data?.credit_eligible ?? false;
  const creditLimit = data?.credit_limit ?? 500000;
  const companyName = data?.company_name ?? "Your Company";
  const recentOrders = (data?.recent_orders as any[]) ?? [];
  const pendingQuotesList = (data?.pending_quotes_list as any[]) ?? [];

  const activeOrderList = recentOrders.filter((o: any) => o.status !== "delivered" && o.status !== "cancelled");

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

      {/* ── Greeting ── */}
      <div className="mb-8">
        <h1 className="font-black text-[28px] leading-tight" style={{ color: "#0D1B2A", letterSpacing: "-0.01em" }}>
          {greeting}, {companyName}
        </h1>
        <p className="text-[13px] mt-1" style={{ color: "#94A3B8" }}>{today}</p>
      </div>

      {/* ── 4 Metric Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">

        {/* Card 1: Active Orders */}
        <div className="bg-white border border-[#E7E8EB] p-6">
          <p className="text-[11px] font-black uppercase tracking-[0.18em] mb-4" style={{ color: "#94A3B8" }}>ACTIVE ORDERS</p>
          <p className="text-[36px] font-black leading-none mb-1" style={{ color: "#E8A838" }}>{activeOrders}</p>
          <p className="text-[13px] mb-4" style={{ color: "#94A3B8" }}>orders in progress</p>
          <div className="space-y-1 border-t border-[#F1F3F5] pt-3">
            <div className="flex justify-between text-[12px]">
              <span style={{ color: "#64748B" }}>In production</span>
              <span className="font-bold" style={{ color: "#1B6CA8" }}>{inProd}</span>
            </div>
            <div className="flex justify-between text-[12px]">
              <span style={{ color: "#64748B" }}>Dispatched</span>
              <span className="font-bold" style={{ color: "#7C3AED" }}>{dispatched}</span>
            </div>
          </div>
        </div>

        {/* Card 2: Pending Quotes */}
        <div className="bg-white border border-[#E7E8EB] p-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[11px] font-black uppercase tracking-[0.18em]" style={{ color: "#94A3B8" }}>PENDING QUOTES</p>
            {pendingQuotes > 0 && (
              <span className="w-2.5 h-2.5 rounded-full animate-pulse" style={{ background: "#E8A838", display: "inline-block" }} />
            )}
          </div>
          <p className="text-[36px] font-black leading-none mb-1" style={{ color: pendingQuotes > 0 ? "#E8A838" : "#0D1B2A" }}>{pendingQuotes}</p>
          <p className="text-[13px]" style={{ color: "#94A3B8" }}>quotes awaiting review</p>
          {pendingQuotes > 0 && (
            <Link href="/dashboard/quotes">
              <button className="mt-4 text-[12px] font-black uppercase tracking-wider flex items-center gap-1" style={{ color: "#E8A838" }}>
                Review now <MS icon="arrow_forward" className="text-sm" />
              </button>
            </Link>
          )}
        </div>

        {/* Card 3: Total Saved */}
        <div className="bg-white border border-[#E7E8EB] p-6">
          <p className="text-[11px] font-black uppercase tracking-[0.18em] mb-4" style={{ color: "#94A3B8" }}>TOTAL SAVED</p>
          <p className="text-[36px] font-black leading-none mb-1" style={{ color: "#16A34A" }}>
            {fmtINR(totalSaved)}
          </p>
          <p className="text-[13px]" style={{ color: "#94A3B8" }}>saved to date on all orders</p>
        </div>

        {/* Card 4: Credit Status */}
        <div className="bg-white border border-[#E7E8EB] p-6">
          <p className="text-[11px] font-black uppercase tracking-[0.18em] mb-4" style={{ color: "#94A3B8" }}>CREDIT STATUS</p>
          {creditEligible ? (
            <>
              <div className="inline-flex items-center gap-2 px-3 py-1 mb-3" style={{ background: "rgba(22,163,74,0.1)" }}>
                <span className="w-2 h-2 rounded-full" style={{ background: "#16A34A" }} />
                <span className="text-[12px] font-black uppercase tracking-wider" style={{ color: "#16A34A" }}>Net-30 Credit Active</span>
              </div>
              <p className="text-[13px] font-bold" style={{ color: "#0D1B2A" }}>Limit: {fmtINR(creditLimit)}</p>
            </>
          ) : (
            <>
              <p className="text-[13px] mb-3" style={{ color: "#64748B" }}>
                <span className="font-bold" style={{ color: "#0D1B2A" }}>{ordersCompleted}</span> of 3 orders to unlock credit
              </p>
              <div className="w-full h-2 bg-[#F1F3F5]">
                <div className="h-2 transition-all" style={{ width: `${Math.min((ordersCompleted / 3) * 100, 100)}%`, background: "#1B6CA8" }} />
              </div>
              <p className="text-[11px] mt-2" style={{ color: "#94A3B8" }}>Net-30 credit after 3 completed orders</p>
            </>
          )}
        </div>
      </div>

      {/* ── Active Orders Table ── */}
      <div className="bg-white border border-[#E7E8EB] mb-6">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#F1F3F5]">
          <h2 className="font-black text-[15px] uppercase tracking-wider" style={{ color: "#0D1B2A" }}>Active Orders</h2>
          <Link href="/dashboard/orders">
            <button className="flex items-center gap-1 text-[12px] font-black uppercase tracking-wider hover:underline" style={{ color: "#1B6CA8" }}>
              View all <MS icon="arrow_forward" className="text-sm" />
            </button>
          </Link>
        </div>

        {activeOrderList.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
            <svg width="64" height="64" viewBox="0 0 64 64" fill="none" className="mb-4">
              <rect x="8" y="16" width="48" height="36" rx="0" stroke="#CBD5E1" strokeWidth="2"/>
              <path d="M8 24h48" stroke="#CBD5E1" strokeWidth="2"/>
              <rect x="20" y="32" width="24" height="12" rx="0" stroke="#CBD5E1" strokeWidth="1.5"/>
            </svg>
            <p className="text-[15px] font-bold mb-1" style={{ color: "#94A3B8" }}>No active orders yet</p>
            <p className="text-[13px] mb-4" style={{ color: "#CBD5E1" }}>Ready to place your first order?</p>
            <Link href="/products">
              <button className="btn-fill btn-amber px-6 py-2.5 text-[13px]"><span>Browse products →</span></button>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-[#F1F3F5]">
                  {["ORDER ID", "PRODUCT", "QTY", "STATUS", "EST. DELIVERY", "TRACK"].map((h, i) => (
                    <th key={h} className="px-6 py-3 text-left font-black text-[11px] uppercase tracking-wider" style={{ color: "#94A3B8", textAlign: i === 5 ? "right" : "left" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {activeOrderList.map((order: any) => {
                  const firstItem = Array.isArray(order.items) ? order.items[0] : null;
                  return (
                    <tr key={order.id} className="border-b border-[#F8F9FC] hover:bg-[#FAFBFC] transition-colors">
                      <td className="px-6 py-4 font-black" style={{ color: "#E8A838", fontFamily: "monospace" }}>{order.order_id}</td>
                      <td className="px-6 py-4 font-medium" style={{ color: "#0D1B2A" }}>
                        {firstItem?.product_name ?? "Packaging Order"}
                      </td>
                      <td className="px-6 py-4" style={{ color: "#64748B" }}>
                        {firstItem?.quantity ? `${fmt(firstItem.quantity)} units` : "—"}
                      </td>
                      <td className="px-6 py-4"><StatusChip status={order.status} /></td>
                      <td className="px-6 py-4" style={{ color: "#64748B" }}>
                        {order.estimated_delivery
                          ? new Date(order.estimated_delivery).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
                          : "—"}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {order.tracking_url ? (
                          <a href={order.tracking_url} target="_blank" rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 font-black text-[12px] hover:underline" style={{ color: "#1B6CA8" }}>
                            Track <MS icon="open_in_new" className="text-sm" />
                          </a>
                        ) : (
                          <span style={{ color: "#CBD5E1" }}>—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Pending Quotes ── */}
      {pendingQuotesList.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-black text-[15px] uppercase tracking-wider" style={{ color: "#0D1B2A" }}>Pending Quotes</h2>
            <Link href="/dashboard/quotes">
              <button className="flex items-center gap-1 text-[12px] font-black uppercase tracking-wider hover:underline" style={{ color: "#1B6CA8" }}>
                View all <MS icon="arrow_forward" className="text-sm" />
              </button>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {pendingQuotesList.map((q: any) => {
              const daysLeft = Math.max(0, Math.round((new Date(q.created_at).getTime() + 7 * 86400000 - Date.now()) / 86400000));
              return (
                <div key={q.id} className="bg-white border border-[#E7E8EB] p-5">
                  <div className="flex items-start justify-between mb-3">
                    <span className="font-black text-[15px]" style={{ color: "#E8A838", fontFamily: "monospace" }}>{q.quote_id}</span>
                    <span className="text-[11px] font-bold px-2 py-0.5" style={{ background: daysLeft < 2 ? "rgba(186,26,26,0.1)" : "rgba(232,168,56,0.1)", color: daysLeft < 2 ? "#ba1a1a" : "#D97706" }}>
                      {daysLeft < 2 ? `⚠ ${daysLeft}d left` : `${daysLeft}d left`}
                    </span>
                  </div>
                  <p className="text-[13px] mb-1" style={{ color: "#0D1B2A" }}>
                    {Array.isArray(q.items) ? q.items.map((i: any) => i.product_name).join(", ") : "Custom packaging"}
                  </p>
                  {q.total_estimated_min && (
                    <p className="text-[13px] font-bold mb-3" style={{ color: "#64748B" }}>
                      Est. {fmtINR(q.total_estimated_min)} – {fmtINR(q.total_estimated_max ?? q.total_estimated_min)}
                    </p>
                  )}
                  <Link href="/dashboard/quotes">
                    <button className="btn-fill btn-amber px-4 py-2 text-[12px] w-full"><span>Review Quote →</span></button>
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Quick Actions ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

        {/* Reorder */}
        <div className="bg-white border border-[#E7E8EB] p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 flex items-center justify-center" style={{ background: "rgba(27,108,168,0.08)" }}>
              <RefreshCw className="w-5 h-5" style={{ color: "#1B6CA8" }} />
            </div>
            <div>
              <p className="font-black text-[13px]" style={{ color: "#0D1B2A" }}>Reorder</p>
              <p className="text-[12px]" style={{ color: "#94A3B8" }}>Reorder a past item</p>
            </div>
          </div>
          {recentOrders.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {recentOrders.slice(0, 3).map((o: any) => {
                const name = Array.isArray(o.items) && o.items[0]?.product_name ? o.items[0].product_name : o.order_id;
                return (
                  <Link key={o.id} href={`/quote?reorder=${o.id}`}>
                    <button className="px-3 py-1.5 text-[11px] font-bold border border-[#E7E8EB] hover:border-[#E8A838] hover:text-[#E8A838] transition-all" style={{ color: "#64748B" }}>
                      {name.length > 18 ? name.slice(0, 18) + "…" : name}
                    </button>
                  </Link>
                );
              })}
            </div>
          ) : (
            <p className="text-[12px]" style={{ color: "#CBD5E1" }}>No past orders yet</p>
          )}
        </div>

        {/* New Quote */}
        <div className="bg-white border border-[#E7E8EB] p-6 flex flex-col">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 flex items-center justify-center" style={{ background: "rgba(232,168,56,0.1)" }}>
              <Plus className="w-5 h-5" style={{ color: "#E8A838" }} />
            </div>
            <div>
              <p className="font-black text-[13px]" style={{ color: "#0D1B2A" }}>New Quote</p>
              <p className="text-[12px]" style={{ color: "#94A3B8" }}>Start a new quote</p>
            </div>
          </div>
          <Link href="/quote" className="mt-auto">
            <button className="btn-fill btn-amber w-full py-2.5 text-[13px]"><span>Get a Quote →</span></button>
          </Link>
        </div>

        {/* Get a Sample */}
        <div className="bg-white border border-[#E7E8EB] p-6 flex flex-col">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 flex items-center justify-center" style={{ background: "rgba(13,27,42,0.06)" }}>
              <Package className="w-5 h-5" style={{ color: "#0D1B2A" }} />
            </div>
            <div>
              <p className="font-black text-[13px]" style={{ color: "#0D1B2A" }}>Get a Sample</p>
              <p className="text-[12px]" style={{ color: "#94A3B8" }}>Order a product sample</p>
            </div>
          </div>
          <Link href="/products" className="mt-auto">
            <button className="btn-fill btn-navy w-full py-2.5 text-[13px]"><span>Browse Products →</span></button>
          </Link>
        </div>
      </div>
    </div>
  );
}
