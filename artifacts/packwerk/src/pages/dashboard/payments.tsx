import { useGetDashboardInvoices, useGetDashboardProfile, useGetDashboardOrders } from "@workspace/api-client-react";
import { Loader2, FileText, Download, CreditCard, ExternalLink } from "lucide-react";

const MS = ({ icon, className = "", style }: { icon: string; className?: string; style?: React.CSSProperties }) => (
  <span className={`material-symbols-outlined ${className}`} style={style}>{icon}</span>
);

const WHATSAPP_NUM = "918208990366";

function fmt(n: number) {
  return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(n);
}

const INVOICE_STATUS: Record<string, { label: string; color: string; bg: string }> = {
  pending: { label: "PENDING",  color: "#D97706", bg: "rgba(232,168,56,0.12)" },
  paid:    { label: "PAID",     color: "#16A34A", bg: "rgba(22,163,74,0.10)"  },
  overdue: { label: "OVERDUE",  color: "#ba1a1a", bg: "rgba(186,26,26,0.10)" },
};

export default function DashboardPayments() {
  const { data: invoices, isLoading: invoicesLoading } = useGetDashboardInvoices();
  const { data: profile, isLoading: profileLoading } = useGetDashboardProfile();
  const { data: ordersData, isLoading: ordersLoading } = useGetDashboardOrders({});

  if (invoicesLoading || profileLoading || ordersLoading) {
    return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin" style={{ color: "#1B6CA8" }} /></div>;
  }

  const creditOrders = profile?.orders_completed ?? 0;
  const creditEligible = profile?.credit_eligible ?? false;
  const creditLimit = Number(profile?.credit_limit ?? 0);
  const invoiceList = (invoices as any[]) ?? [];
  const allOrders = (ordersData as any[]) ?? [];

  // Orders that have a payment link set (pending payment from client)
  const payableOrders = allOrders.filter((o: any) => o.payment_link && o.status !== "delivered" && o.status !== "cancelled");

  const paidInvoices = invoiceList.filter((i: any) => i.status === "paid");
  const totalPaid = paidInvoices.reduce((sum: number, i: any) => sum + Number(i.amount), 0);

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <h1 className="font-black text-[28px] mb-6 leading-tight" style={{ color: "#0D1B2A", letterSpacing: "-0.01em" }}>Payments & Invoices</h1>

      {/* ── Credit Status Banner ── */}
      {creditEligible ? (
        <div className="flex items-center justify-between px-6 py-5 mb-6" style={{ background: "rgba(22,163,74,0.08)", border: "1px solid rgba(22,163,74,0.25)" }}>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 flex items-center justify-center" style={{ background: "rgba(22,163,74,0.15)" }}>
              <MS icon="verified" className="text-xl" style={{ color: "#16A34A" }} />
            </div>
            <div>
              <p className="font-black text-[14px]" style={{ color: "#16A34A" }}>Net-30 Credit Active</p>
              <p className="text-[13px]" style={{ color: "#64748B" }}>You can pay up to 30 days after delivery</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[11px] font-black uppercase tracking-widest mb-0.5" style={{ color: "#94A3B8" }}>AVAILABLE LIMIT</p>
            <p className="font-black text-[18px]" style={{ color: "#16A34A" }}>₹{fmt(creditLimit)}</p>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between px-6 py-5 mb-6" style={{ background: "#0D1B2A" }}>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 flex items-center justify-center" style={{ background: "rgba(255,255,255,0.08)" }}>
              <MS icon="lock" className="text-xl" style={{ color: "rgba(255,255,255,0.5)" }} />
            </div>
            <div>
              <p className="font-black text-[14px] text-white">Net-30 credit unlocks after 3 completed orders</p>
              <p className="text-[13px]" style={{ color: "rgba(255,255,255,0.5)" }}>Complete your orders to unlock credit terms</p>
            </div>
          </div>
          <div className="text-right min-w-[120px]">
            <div className="flex items-center gap-1.5 justify-end mb-2">
              {[0, 1, 2].map(i => (
                <div key={i} className="w-3 h-3 rounded-full" style={{ background: i < creditOrders ? "#E8A838" : "rgba(255,255,255,0.2)" }} />
              ))}
            </div>
            <p className="text-[12px] font-bold" style={{ color: "rgba(255,255,255,0.5)" }}>{creditOrders} of 3 orders</p>
          </div>
        </div>
      )}

      {/* ── Pending Payments ── */}
      {payableOrders.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <CreditCard className="w-4 h-4" style={{ color: "#D97706" }} />
            <h2 className="font-black text-[15px] uppercase tracking-wider" style={{ color: "#0D1B2A" }}>Action Required — Pending Payments</h2>
          </div>
          <div className="space-y-3">
            {payableOrders.map((order: any) => (
              <div key={order.id} className="flex items-center justify-between px-6 py-5" style={{ background: "rgba(232,168,56,0.06)", border: "1px solid rgba(232,168,56,0.3)" }}>
                <div>
                  <p className="font-black text-[13px]" style={{ color: "#E8A838", fontFamily: "monospace" }}>{order.order_id}</p>
                  <p className="text-[14px] font-bold mt-0.5" style={{ color: "#0D1B2A" }}>₹{fmt(Number(order.total_price))}</p>
                  <p className="text-[12px] mt-0.5" style={{ color: "#64748B" }}>
                    {Array.isArray(order.items) ? order.items.map((i: any) => i.product_name).filter(Boolean).join(", ") : "Packaging order"}
                  </p>
                </div>
                <a
                  href={order.payment_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-6 py-3 font-black text-[13px] transition-all hover:opacity-90"
                  style={{ background: "#E8A838", color: "#0D1B2A", textDecoration: "none" }}
                >
                  <CreditCard className="w-4 h-4" />
                  Pay Now
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Invoices Table ── */}
      <div className="bg-white border border-[#E7E8EB] mb-8">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#F1F3F5]">
          <h2 className="font-black text-[15px] uppercase tracking-wider" style={{ color: "#0D1B2A" }}>Invoices</h2>
          {invoiceList.length > 0 && (
            <p className="text-[12px] font-bold" style={{ color: "#94A3B8" }}>
              Total paid: <span style={{ color: "#16A34A" }}>₹{fmt(totalPaid)}</span>
            </p>
          )}
        </div>

        {invoiceList.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <FileText className="w-12 h-12 mb-4" style={{ color: "#CBD5E1" }} />
            <p className="font-bold text-[15px] mb-1" style={{ color: "#94A3B8" }}>No invoices yet</p>
            <p className="text-[13px]" style={{ color: "#CBD5E1" }}>Invoices appear here after orders are confirmed</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-[#F1F3F5]">
                  {["INVOICE ID", "ORDER", "AMOUNT", "STATUS", "DUE DATE", "DOWNLOAD"].map((h, i) => (
                    <th key={h} className="px-5 py-3 text-left text-[11px] font-black uppercase tracking-wider" style={{ color: "#94A3B8", textAlign: i === 5 ? "right" : "left" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {invoiceList.map((inv: any) => {
                  const s = INVOICE_STATUS[inv.status] ?? INVOICE_STATUS.pending;
                  const isOverdue = inv.status === "pending" && new Date(inv.due_date) < new Date();
                  const eff = isOverdue ? INVOICE_STATUS.overdue : s;
                  return (
                    <tr key={inv.id} className="border-b border-[#F8F9FC] hover:bg-[#FAFBFC]">
                      <td className="px-5 py-4 font-black" style={{ color: "#E8A838", fontFamily: "monospace" }}>{inv.invoice_id}</td>
                      <td className="px-5 py-4 font-medium" style={{ color: "#64748B", fontFamily: "monospace" }}>
                        {inv.order_id ? inv.order_id.slice(0, 12) + "…" : "—"}
                      </td>
                      <td className="px-5 py-4 font-black" style={{ color: "#0D1B2A" }}>₹{fmt(Number(inv.amount))}</td>
                      <td className="px-5 py-4">
                        <span className="px-2.5 py-1 text-[11px] font-black uppercase tracking-wider" style={{ background: eff.bg, color: eff.color, borderRadius: 0 }}>
                          {isOverdue ? "OVERDUE" : eff.label}
                        </span>
                      </td>
                      <td className="px-5 py-4" style={{ color: isOverdue ? "#ba1a1a" : "#64748B", fontWeight: isOverdue ? 700 : 400 }}>
                        {new Date(inv.due_date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                      </td>
                      <td className="px-5 py-4 text-right">
                        {inv.pdf_url ? (
                          <a href={inv.pdf_url} target="_blank" rel="noreferrer"
                            className="inline-flex items-center gap-1.5 text-[12px] font-black hover:underline" style={{ color: "#1B6CA8" }}>
                            <Download className="w-3.5 h-3.5" /> PDF
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

      {/* ── Payment History ── */}
      {paidInvoices.length > 0 && (
        <div className="bg-white border border-[#E7E8EB]">
          <div className="px-6 py-4 border-b border-[#F1F3F5]">
            <h2 className="font-black text-[15px] uppercase tracking-wider" style={{ color: "#0D1B2A" }}>Payment History</h2>
          </div>
          <div className="divide-y divide-[#F8F9FC]">
            {paidInvoices.map((inv: any) => (
              <div key={inv.id} className="flex items-center justify-between px-6 py-4">
                <div>
                  <p className="font-bold text-[13px]" style={{ color: "#0D1B2A" }}>₹{fmt(Number(inv.amount))}</p>
                  <p className="text-[12px] mt-0.5" style={{ color: "#94A3B8" }}>
                    {inv.payment_method ?? "Bank transfer"} ·{" "}
                    {inv.razorpay_payment_id ? (
                      <span style={{ fontFamily: "monospace" }}>{inv.razorpay_payment_id}</span>
                    ) : (
                      inv.invoice_id
                    )}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[12px] font-bold" style={{ color: "#94A3B8" }}>
                    {new Date(inv.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                  </p>
                  <span className="text-[11px] font-black px-2 py-0.5" style={{ background: "rgba(22,163,74,0.1)", color: "#16A34A", borderRadius: 0 }}>PAID</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Contact for payment questions ── */}
      <div className="mt-8 flex items-center justify-center gap-3 py-5 border border-dashed border-[#E7E8EB]">
        <a
          href={`https://wa.me/${WHATSAPP_NUM}?text=Hi+Packworkz%2C+I+have+a+payment+question`}
          target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-2 text-[13px] font-bold hover:underline"
          style={{ color: "#25D366", textDecoration: "none" }}
        >
          <MS icon="chat" className="text-base" /> Questions about payment? WhatsApp us →
        </a>
      </div>
    </div>
  );
}
