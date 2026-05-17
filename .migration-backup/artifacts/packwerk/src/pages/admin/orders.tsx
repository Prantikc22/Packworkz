import { useState } from "react";
import { useAdminListOrders, useAdminUpdateOrderStatus } from "@workspace/api-client-react";
import { Loader2, Edit2, X, Check, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const ORDER_STATUSES = ["confirmed", "in_production", "qc_check", "dispatched", "delivered", "cancelled"];

const STATUS_COLORS: Record<string, string> = {
  confirmed:    "bg-blue-50 text-blue-700 border border-blue-200",
  in_production:"bg-blue-50 text-blue-700 border border-blue-200",
  qc_check:     "bg-amber-50 text-amber-700 border border-amber-200",
  dispatched:   "bg-purple-50 text-purple-700 border border-purple-200",
  delivered:    "bg-green-50 text-green-700 border border-green-200",
  cancelled:    "bg-red-50 text-red-700 border border-red-200",
};

function fmt(n: number) {
  return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(n);
}

interface EditState {
  status: string;
  tracking_number: string;
  tracking_url: string;
  payment_link: string;
  estimated_delivery: string;
  total_price: string;
  internal_notes: string;
}

function EditOrderModal({ order, onClose, onSave, saving }: {
  order: any;
  onClose: () => void;
  onSave: (id: string, data: Partial<EditState>) => void;
  saving: boolean;
}) {
  const [form, setForm] = useState<EditState>({
    status: order.status ?? "",
    tracking_number: order.tracking_number ?? "",
    tracking_url: order.tracking_url ?? "",
    payment_link: order.payment_link ?? "",
    estimated_delivery: order.estimated_delivery ? order.estimated_delivery.slice(0, 10) : "",
    total_price: order.total_price ? String(order.total_price) : "",
    internal_notes: order.internal_notes ?? "",
  });

  const set = (key: keyof EditState, val: string) => setForm(f => ({ ...f, [key]: val }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative bg-white w-full max-w-lg shadow-2xl overflow-y-auto max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#F1F3F5] sticky top-0 bg-white">
          <div>
            <p className="text-[11px] font-black uppercase tracking-widest mb-0.5" style={{ color: "#94A3B8" }}>EDIT ORDER</p>
            <p className="font-black text-[18px]" style={{ color: "#E8A838", fontFamily: "monospace" }}>{order.order_id}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center border border-[#E7E8EB] hover:bg-[#F8F9FC]">
            <X className="w-4 h-4" style={{ color: "#64748B" }} />
          </button>
        </div>

        <div className="px-6 py-6 space-y-5">
          {/* Status */}
          <div>
            <label className="block text-[11px] font-black uppercase tracking-widest mb-2" style={{ color: "#94A3B8" }}>Status</label>
            <select
              value={form.status}
              onChange={e => set("status", e.target.value)}
              className="w-full px-3 py-2.5 border border-[#E7E8EB] text-[13px] font-bold bg-white focus:outline-none focus:border-[#1B6CA8]"
              style={{ color: "#0D1B2A" }}
            >
              {ORDER_STATUSES.map(s => (
                <option key={s} value={s}>{s.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase())}</option>
              ))}
            </select>
          </div>

          {/* Order value */}
          <div>
            <label className="block text-[11px] font-black uppercase tracking-widest mb-2" style={{ color: "#94A3B8" }}>Order Value (₹)</label>
            <input
              type="number"
              value={form.total_price}
              onChange={e => set("total_price", e.target.value)}
              className="w-full px-3 py-2.5 border border-[#E7E8EB] text-[13px] bg-white focus:outline-none focus:border-[#1B6CA8]"
              placeholder="e.g. 150000"
            />
          </div>

          {/* Estimated delivery */}
          <div>
            <label className="block text-[11px] font-black uppercase tracking-widest mb-2" style={{ color: "#94A3B8" }}>Estimated Delivery Date</label>
            <input
              type="date"
              value={form.estimated_delivery}
              onChange={e => set("estimated_delivery", e.target.value)}
              className="w-full px-3 py-2.5 border border-[#E7E8EB] text-[13px] bg-white focus:outline-none focus:border-[#1B6CA8]"
            />
          </div>

          {/* Payment link */}
          <div>
            <label className="block text-[11px] font-black uppercase tracking-widest mb-2" style={{ color: "#94A3B8" }}>
              Payment Link <span style={{ color: "#E8A838" }}>— shared with client</span>
            </label>
            <input
              type="url"
              value={form.payment_link}
              onChange={e => set("payment_link", e.target.value)}
              className="w-full px-3 py-2.5 border border-[#E7E8EB] text-[13px] bg-white focus:outline-none focus:border-[#1B6CA8]"
              placeholder="https://razorpay.com/payment-link/..."
            />
            {form.payment_link && (
              <a href={form.payment_link} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[11px] font-bold mt-1 hover:underline" style={{ color: "#1B6CA8" }}>
                <ExternalLink className="w-3 h-3" /> Test link
              </a>
            )}
          </div>

          {/* Tracking */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-black uppercase tracking-widest mb-2" style={{ color: "#94A3B8" }}>Tracking Number</label>
              <input
                type="text"
                value={form.tracking_number}
                onChange={e => set("tracking_number", e.target.value)}
                className="w-full px-3 py-2.5 border border-[#E7E8EB] text-[13px] bg-white focus:outline-none focus:border-[#1B6CA8]"
                placeholder="DTDC-123456"
              />
            </div>
            <div>
              <label className="block text-[11px] font-black uppercase tracking-widest mb-2" style={{ color: "#94A3B8" }}>Tracking URL</label>
              <input
                type="url"
                value={form.tracking_url}
                onChange={e => set("tracking_url", e.target.value)}
                className="w-full px-3 py-2.5 border border-[#E7E8EB] text-[13px] bg-white focus:outline-none focus:border-[#1B6CA8]"
                placeholder="https://..."
              />
            </div>
          </div>

          {/* Internal notes */}
          <div>
            <label className="block text-[11px] font-black uppercase tracking-widest mb-2" style={{ color: "#94A3B8" }}>Internal Notes <span style={{ color: "#CBD5E1" }}>(admin only)</span></label>
            <textarea
              value={form.internal_notes}
              onChange={e => set("internal_notes", e.target.value)}
              rows={3}
              className="w-full px-3 py-2.5 border border-[#E7E8EB] text-[13px] bg-white focus:outline-none focus:border-[#1B6CA8] resize-none"
              placeholder="Production notes, supplier info…"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#F1F3F5] flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 border border-[#E7E8EB] text-[13px] font-bold hover:border-[#94A3B8] transition-all" style={{ color: "#64748B" }}>
            Cancel
          </button>
          <button
            onClick={() => onSave(order.id, form)}
            disabled={saving}
            className="flex-1 py-3 text-[13px] font-black flex items-center justify-center gap-2 transition-all"
            style={{ background: "#0D1B2A", color: "white" }}
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminOrders() {
  const [statusFilter, setStatusFilter] = useState("all");
  const [editingOrder, setEditingOrder] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const { data: orders, isLoading, refetch } = useAdminListOrders({ status: statusFilter !== "all" ? statusFilter : undefined });
  const { mutate: updateOrder } = useAdminUpdateOrderStatus();
  const { toast } = useToast();

  const handleSave = (orderId: string, data: Partial<EditState>) => {
    setSaving(true);
    updateOrder(
      { id: orderId, adminUpdateOrderStatusBody: data as any },
      {
        onSuccess: () => {
          toast({ title: "Order updated successfully" });
          refetch();
          setEditingOrder(null);
        },
        onError: () => {
          toast({ variant: "destructive", title: "Failed to update order" });
        },
        onSettled: () => setSaving(false),
      }
    );
  };

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-black text-[28px]" style={{ color: "#0D1B2A" }}>Orders</h1>
        <div className="flex gap-2 flex-wrap">
          {["all", ...ORDER_STATUSES].map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className="px-3 py-1.5 text-[11px] font-black uppercase tracking-wider transition-colors"
              style={{
                background: statusFilter === s ? "#0D1B2A" : "#F8F9FC",
                color: statusFilter === s ? "white" : "#64748B",
                border: "1px solid",
                borderColor: statusFilter === s ? "#0D1B2A" : "#E2EAF4",
              }}
            >
              {s.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin" style={{ color: "#1B6CA8" }} /></div>
      ) : !orders || orders.length === 0 ? (
        <div className="text-center py-16 bg-white border border-[#E7E8EB]">
          <p style={{ color: "#64748B" }}>No orders found.</p>
        </div>
      ) : (
        <div className="bg-white border border-[#E7E8EB] overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-[#F1F3F5]">
                {["ORDER ID", "CLIENT", "ITEMS", "VALUE", "STATUS", "PAYMENT LINK", "TRACKING", "EST. DELIVERY", ""].map((h, i) => (
                  <th key={i} className="px-4 py-3 text-left text-[11px] font-black uppercase tracking-wider" style={{ color: "#94A3B8" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(orders as any[]).map((order: any) => {
                const statusClass = STATUS_COLORS[order.status] ?? "bg-gray-50 text-gray-600 border border-gray-200";
                const firstItem = Array.isArray(order.items) ? order.items[0] : null;
                return (
                  <tr key={order.id} className="border-b border-[#F8F9FC] hover:bg-[#FAFBFC]">
                    <td className="px-4 py-4 font-black" style={{ color: "#E8A838", fontFamily: "monospace" }}>{order.order_id}</td>
                    <td className="px-4 py-4 text-[12px]" style={{ color: "#64748B", maxWidth: 120 }}>
                      <span className="truncate block">{order.user_id?.slice(0, 8)}…</span>
                    </td>
                    <td className="px-4 py-4 max-w-[160px]" style={{ color: "#0D1B2A" }}>
                      <span className="truncate block text-[12px]">
                        {firstItem?.product_name ?? "Packaging"}{Array.isArray(order.items) && order.items.length > 1 ? ` +${order.items.length - 1}` : ""}
                      </span>
                    </td>
                    <td className="px-4 py-4 font-bold" style={{ color: "#0D1B2A" }}>₹{fmt(Number(order.total_price))}</td>
                    <td className="px-4 py-4">
                      <span className={`px-2 py-1 text-[11px] font-black uppercase tracking-wider rounded-none ${statusClass}`}>
                        {order.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      {order.payment_link ? (
                        <a href={order.payment_link} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-1 text-[11px] font-black hover:underline" style={{ color: "#16A34A" }}>
                          <ExternalLink className="w-3 h-3" /> Set
                        </a>
                      ) : (
                        <span className="text-[12px]" style={{ color: "#CBD5E1" }}>—</span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      {order.tracking_url ? (
                        <a href={order.tracking_url} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-1 text-[11px] font-black hover:underline" style={{ color: "#7C3AED" }}>
                          <ExternalLink className="w-3 h-3" /> Track
                        </a>
                      ) : (
                        <span className="text-[12px]" style={{ color: "#CBD5E1" }}>—</span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-[12px]" style={{ color: "#64748B" }}>
                      {order.estimated_delivery
                        ? new Date(order.estimated_delivery).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })
                        : "—"}
                    </td>
                    <td className="px-4 py-4">
                      <button
                        onClick={() => setEditingOrder(order)}
                        className="flex items-center gap-1.5 px-3 py-1.5 border border-[#E7E8EB] text-[11px] font-black uppercase hover:border-[#1B6CA8] hover:text-[#1B6CA8] transition-all"
                        style={{ color: "#64748B" }}
                      >
                        <Edit2 className="w-3 h-3" /> Edit
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {editingOrder && (
        <EditOrderModal
          order={editingOrder}
          onClose={() => setEditingOrder(null)}
          onSave={handleSave}
          saving={saving}
        />
      )}
    </div>
  );
}
