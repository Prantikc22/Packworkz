import { useState, useMemo } from "react";
import { useGetDashboardOrders } from "@workspace/api-client-react";
import { Loader2, ExternalLink, RotateCcw, Download, Package, CheckCircle } from "lucide-react";
import { Link, useLocation } from "wouter";

const MS = ({ icon, className = "", style }: { icon: string; className?: string; style?: React.CSSProperties }) => (
  <span className={`material-symbols-outlined ${className}`} style={style}>{icon}</span>
);

const STATUS_CONFIG: Record<string, { label: string; bg: string; color: string }> = {
  confirmed:    { label: "IN PRODUCTION", bg: "rgba(27,108,168,0.12)",   color: "#1B6CA8" },
  in_production:{ label: "IN PRODUCTION", bg: "rgba(27,108,168,0.12)",   color: "#1B6CA8" },
  qc_check:     { label: "QC CHECK",      bg: "rgba(232,168,56,0.15)",   color: "#D97706" },
  dispatched:   { label: "DISPATCHED",    bg: "rgba(139,92,246,0.12)",   color: "#7C3AED" },
  delivered:    { label: "DELIVERED",     bg: "rgba(34,197,94,0.12)",    color: "#16A34A" },
  cancelled:    { label: "CANCELLED",     bg: "rgba(186,26,26,0.10)",    color: "#ba1a1a" },
  pending:      { label: "PENDING",       bg: "rgba(100,116,139,0.10)",  color: "#64748B" },
};

function StatusChip({ status }: { status: string }) {
  const c = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending;
  return (
    <span className="px-2.5 py-1 text-[11px] font-black uppercase tracking-wider" style={{ background: c.bg, color: c.color, borderRadius: 0 }}>
      {c.label}
    </span>
  );
}

const FILTER_TABS = [
  { key: "all", label: "All" },
  { key: "in_production", label: "In Production" },
  { key: "dispatched", label: "Dispatched" },
  { key: "delivered", label: "Delivered" },
];

const PRODUCTION_STEPS = [
  { key: "confirmed", label: "Confirmed" },
  { key: "in_production", label: "In Production" },
  { key: "qc_check", label: "QC Check" },
  { key: "dispatched", label: "Dispatched" },
  { key: "delivered", label: "Delivered" },
];

const STATUS_ORDER: Record<string, number> = {
  confirmed: 0, in_production: 1, qc_check: 2, dispatched: 3, delivered: 4,
};

function fmt(n: number) {
  return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(n);
}

type ReorderState = "idle" | "loading" | "done";

interface ReorderItem {
  product_name: string;
  sku_id: string;
  quantity: number;
  artwork_option: string;
}

function ReorderDialog({ order, onClose, onSuccess }: {
  order: any;
  onClose: () => void;
  onSuccess: (quoteId: string) => void;
}) {
  const rawItems: ReorderItem[] = (Array.isArray(order.items) ? order.items : []).map((i: any) => ({
    product_name: i.product_name ?? "Custom packaging",
    sku_id: i.sku_id ?? "",
    quantity: Number(i.quantity) || 0,
    artwork_option: i.artwork_option ?? "none",
  }));
  const [items, setItems] = useState<ReorderItem[]>(rawItems);
  const [notes, setNotes] = useState(`Reorder of ${order.order_id}`);
  const [loading, setLoading] = useState(false);

  const updateItem = (idx: number, key: keyof ReorderItem, val: string | number) =>
    setItems(prev => prev.map((it, i) => i === idx ? { ...it, [key]: val } : it));

  const handleConfirm = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("packwerk_access_token") || "";
      const res = await fetch(`/api/dashboard/reorder/${order.id}`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ items, notes }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      onSuccess(data.quote_id);
    } catch {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative bg-white w-full max-w-md shadow-2xl overflow-y-auto max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#F1F3F5] sticky top-0 bg-white">
          <div>
            <p className="text-[11px] font-black uppercase tracking-widest mb-0.5" style={{ color: "#94A3B8" }}>REORDER</p>
            <p className="font-black text-[18px]" style={{ color: "#E8A838", fontFamily: "monospace" }}>{order.order_id}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center border border-[#E7E8EB] hover:bg-[#F8F9FC]">
            <span className="material-symbols-outlined text-base" style={{ color: "#64748B" }}>close</span>
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">
          <p className="text-[13px]" style={{ color: "#64748B" }}>
            Review and adjust quantities or artwork before submitting your reorder request.
          </p>

          {items.map((item, idx) => (
            <div key={idx} className="border border-[#E7E8EB] p-4 space-y-3">
              <div>
                <p className="text-[11px] font-black uppercase tracking-widest mb-1" style={{ color: "#94A3B8" }}>PRODUCT</p>
                <p className="font-bold text-[14px]" style={{ color: "#0D1B2A" }}>{item.product_name}</p>
                {item.sku_id && <p className="text-[11px] font-mono mt-0.5" style={{ color: "#94A3B8" }}>{item.sku_id}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-black uppercase tracking-widest mb-1.5" style={{ color: "#94A3B8" }}>Quantity</label>
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={e => updateItem(idx, "quantity", Number(e.target.value))}
                    className="w-full px-3 py-2 border border-[#E7E8EB] text-[13px] font-bold bg-white focus:outline-none focus:border-[#1B6CA8]"
                    min={1}
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-black uppercase tracking-widest mb-1.5" style={{ color: "#94A3B8" }}>Artwork</label>
                  <select
                    value={item.artwork_option}
                    onChange={e => updateItem(idx, "artwork_option", e.target.value)}
                    className="w-full px-3 py-2 border border-[#E7E8EB] text-[13px] bg-white focus:outline-none focus:border-[#1B6CA8]"
                    style={{ color: "#0D1B2A" }}
                  >
                    <option value="none">Same as before</option>
                    <option value="upload">Upload new artwork</option>
                    <option value="design">Packworkz design</option>
                  </select>
                </div>
              </div>
            </div>
          ))}

          <div>
            <label className="block text-[11px] font-black uppercase tracking-widest mb-1.5" style={{ color: "#94A3B8" }}>Additional Notes</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-[#E7E8EB] text-[13px] bg-white focus:outline-none focus:border-[#1B6CA8] resize-none"
              placeholder="Any changes from the original order?"
            />
          </div>
        </div>

        <div className="px-6 py-4 border-t border-[#F1F3F5] flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 border border-[#E7E8EB] text-[13px] font-bold hover:border-[#94A3B8]" style={{ color: "#64748B" }}>
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            className="flex-1 py-3 text-[13px] font-black flex items-center justify-center gap-2"
            style={{ background: "#0D1B2A", color: "white" }}
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />}
            {loading ? "Submitting…" : "Submit Reorder"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function DashboardOrders() {
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [reorderOrder, setReorderOrder] = useState<any>(null);
  const [reorderState, setReorderState] = useState<ReorderState>("idle");
  const [reorderQuoteId, setReorderQuoteId] = useState<string | null>(null);
  const [reorderingId, setReorderingId] = useState<string | null>(null);
  const [, navigate] = useLocation();

  const handleReorder = (order: any, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setReorderOrder(order);
  };

  const handleReorderSuccess = (quoteId: string) => {
    const orderId = reorderOrder?.id ?? null;
    setReorderOrder(null);
    setReorderQuoteId(quoteId);
    setReorderState("done");
    setReorderingId(orderId);
  };

  const { data: orders, isLoading } = useGetDashboardOrders(
    activeTab !== "all" ? { status: activeTab } : {}
  );

  const filtered = useMemo(() => {
    if (!orders) return [];
    const q = search.toLowerCase();
    return (orders as any[]).filter(o =>
      !q ||
      o.order_id?.toLowerCase().includes(q) ||
      (Array.isArray(o.items) && o.items.some((i: any) => i.product_name?.toLowerCase().includes(q)))
    );
  }, [orders, search]);

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <h1 className="font-black text-[28px] mb-6 leading-tight" style={{ color: "#0D1B2A", letterSpacing: "-0.01em" }}>Orders</h1>

      {/* Filter + Search row */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex gap-0 border border-[#E7E8EB] bg-white">
          {FILTER_TABS.map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className="px-4 py-2 text-[12px] font-black uppercase tracking-wider transition-all"
              style={{
                background: activeTab === tab.key ? "#0D1B2A" : "transparent",
                color: activeTab === tab.key ? "white" : "#64748B",
                borderRight: "1px solid #E7E8EB",
              }}>
              {tab.label}
            </button>
          ))}
        </div>
        <div className="relative flex-1 max-w-xs">
          <MS icon="search" className="text-base absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#94A3B8" }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by order ID or product…"
            className="w-full pl-9 pr-4 py-2 border border-[#E7E8EB] text-[13px] bg-white focus:outline-none focus:border-[#1B6CA8]"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin" style={{ color: "#1B6CA8" }} /></div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white border border-[#E7E8EB]">
          <Package className="w-12 h-12 mb-4" style={{ color: "#CBD5E1" }} />
          <p className="font-bold text-[15px] mb-1" style={{ color: "#94A3B8" }}>No active orders yet</p>
          <p className="text-[13px] mb-5" style={{ color: "#CBD5E1" }}>Ready to place your first order?</p>
          <Link href="/products">
            <button className="btn-fill btn-amber px-6 py-2.5 text-[13px]"><span>Browse products →</span></button>
          </Link>
        </div>
      ) : (
        <div className="bg-white border border-[#E7E8EB] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-[#F1F3F5]">
                  {["ORDER ID", "PRODUCT", "QTY", "STATUS", "EST. DELIVERY", "VALUE", "ACTIONS"].map((h, i) => (
                    <th key={h} className="px-5 py-3 text-left text-[11px] font-black uppercase tracking-wider" style={{ color: "#94A3B8", textAlign: i === 6 ? "right" : "left" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((order: any) => {
                  const firstItem = Array.isArray(order.items) ? order.items[0] : null;
                  return (
                    <tr key={order.id}
                      className="border-b border-[#F8F9FC] hover:bg-[#FAFBFC] cursor-pointer transition-colors"
                      onClick={() => setSelectedOrder(order)}>
                      <td className="px-5 py-4 font-black" style={{ color: "#E8A838", fontFamily: "monospace" }}>{order.order_id}</td>
                      <td className="px-5 py-4 font-medium max-w-[200px] truncate" style={{ color: "#0D1B2A" }}>
                        {firstItem?.product_name ?? "Packaging Order"}
                      </td>
                      <td className="px-5 py-4" style={{ color: "#64748B" }}>
                        {firstItem?.quantity ? `${fmt(firstItem.quantity)}` : "—"}
                      </td>
                      <td className="px-5 py-4"><StatusChip status={order.status} /></td>
                      <td className="px-5 py-4" style={{ color: "#64748B" }}>
                        {order.estimated_delivery
                          ? new Date(order.estimated_delivery).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })
                          : "—"}
                      </td>
                      <td className="px-5 py-4 font-bold" style={{ color: "#0D1B2A" }}>
                        ₹{fmt(Number(order.total_price))}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {order.tracking_url && (
                            <a href={order.tracking_url} target="_blank" rel="noopener noreferrer"
                              onClick={e => e.stopPropagation()}
                              className="flex items-center gap-1 text-[11px] font-black uppercase tracking-wider hover:underline"
                              style={{ color: "#7C3AED" }}>
                              Track <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                          <button
                            onClick={e => handleReorder(order, e)}
                            disabled={reorderState === "loading" && reorderingId === order.id}
                            className="flex items-center gap-1 text-[11px] font-black uppercase tracking-wider px-3 py-1.5 border border-[#E7E8EB] hover:border-[#1B6CA8] hover:text-[#1B6CA8] transition-all disabled:opacity-50"
                            style={{ color: "#64748B" }}>
                            {reorderState === "loading" && reorderingId === order.id
                              ? <Loader2 className="w-3 h-3 animate-spin" />
                              : <RotateCcw className="w-3 h-3" />} Reorder
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Slide-out Panel ── */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex justify-end" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" onClick={() => setSelectedOrder(null)} />
          <div className="relative bg-white w-full max-w-lg h-full overflow-y-auto shadow-2xl flex flex-col">

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#F1F3F5] sticky top-0 bg-white z-10">
              <div>
                <p className="text-[11px] font-black uppercase tracking-widest mb-0.5" style={{ color: "#94A3B8" }}>ORDER DETAIL</p>
                <p className="font-black text-[18px]" style={{ color: "#E8A838", fontFamily: "monospace" }}>{selectedOrder.order_id}</p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="w-9 h-9 flex items-center justify-center border border-[#E7E8EB] hover:bg-[#F8F9FC]">
                <MS icon="close" className="text-xl" style={{ color: "#64748B" }} />
              </button>
            </div>

            <div className="flex-1 px-6 py-6 space-y-6">

              {/* Status + Meta */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[13px]" style={{ color: "#64748B" }}>Status</span>
                  <StatusChip status={selectedOrder.status} />
                </div>
                <div className="flex justify-between">
                  <span className="text-[13px]" style={{ color: "#64748B" }}>Order value</span>
                  <span className="font-black text-[14px]" style={{ color: "#0D1B2A" }}>₹{fmt(Number(selectedOrder.total_price))}</span>
                </div>
                {selectedOrder.discount_applied > 0 && (
                  <div className="flex justify-between">
                    <span className="text-[13px]" style={{ color: "#64748B" }}>Discount applied</span>
                    <span className="font-bold text-[13px]" style={{ color: "#16A34A" }}>−₹{fmt(Number(selectedOrder.discount_applied))}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-[13px]" style={{ color: "#64748B" }}>Payment type</span>
                  <span className="font-bold text-[13px] capitalize" style={{ color: "#0D1B2A" }}>{selectedOrder.payment_type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[13px]" style={{ color: "#64748B" }}>Placed on</span>
                  <span className="font-medium text-[13px]" style={{ color: "#0D1B2A" }}>
                    {new Date(selectedOrder.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                  </span>
                </div>
                {selectedOrder.estimated_delivery && (
                  <div className="flex justify-between">
                    <span className="text-[13px]" style={{ color: "#64748B" }}>Est. delivery</span>
                    <span className="font-medium text-[13px]" style={{ color: "#0D1B2A" }}>
                      {new Date(selectedOrder.estimated_delivery).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                    </span>
                  </div>
                )}
              </div>

              {/* Line items */}
              {Array.isArray(selectedOrder.items) && selectedOrder.items.length > 0 && (
                <div>
                  <p className="text-[11px] font-black uppercase tracking-widest mb-3" style={{ color: "#94A3B8" }}>LINE ITEMS</p>
                  <div className="space-y-2">
                    {selectedOrder.items.map((item: any, i: number) => (
                      <div key={i} className="flex justify-between py-2 border-b border-[#F8F9FC]">
                        <span className="text-[13px] font-medium" style={{ color: "#0D1B2A" }}>{item.product_name ?? "Item"}</span>
                        <span className="text-[13px]" style={{ color: "#64748B" }}>{item.quantity ? `${fmt(item.quantity)} units` : "—"}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Production Timeline */}
              <div>
                <p className="text-[11px] font-black uppercase tracking-widest mb-4" style={{ color: "#94A3B8" }}>PRODUCTION TIMELINE</p>
                <div className="space-y-0">
                  {PRODUCTION_STEPS.map((step, i) => {
                    const currentIdx = STATUS_ORDER[selectedOrder.status] ?? -1;
                    const stepIdx = STATUS_ORDER[step.key] ?? i;
                    const isDone = stepIdx < currentIdx;
                    const isCurrent = stepIdx === currentIdx;
                    const isPending = stepIdx > currentIdx;
                    return (
                      <div key={step.key} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className="w-7 h-7 flex items-center justify-center"
                            style={{
                              background: isDone ? "#16A34A" : isCurrent ? "#1B6CA8" : "#F1F3F5",
                              border: isCurrent ? "2px solid #1B6CA8" : "none",
                            }}>
                            {isDone ? (
                              <MS icon="check" className="text-sm" style={{ color: "white" }} />
                            ) : isCurrent ? (
                              <div className="w-2 h-2 rounded-full bg-white" />
                            ) : (
                              <div className="w-2 h-2 rounded-full" style={{ background: "#CBD5E1" }} />
                            )}
                          </div>
                          {i < PRODUCTION_STEPS.length - 1 && (
                            <div className="w-0.5 h-6" style={{ background: isDone ? "#16A34A" : "#E7E8EB" }} />
                          )}
                        </div>
                        <div className="pb-4">
                          <p className="text-[13px] font-bold leading-none" style={{ color: isPending ? "#CBD5E1" : "#0D1B2A" }}>{step.label}</p>
                          {isCurrent && selectedOrder.tracking_number && step.key === "dispatched" && (
                            <p className="text-[12px] mt-1" style={{ color: "#64748B" }}>
                              Tracking: <span className="font-mono font-bold">{selectedOrder.tracking_number}</span>
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Tracking */}
              {selectedOrder.tracking_url && (
                <a href={selectedOrder.tracking_url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 text-[13px] font-bold hover:underline"
                  style={{ color: "#7C3AED" }}>
                  <ExternalLink className="w-4 h-4" /> Track shipment live
                </a>
              )}

              {/* Documents */}
              <div>
                <p className="text-[11px] font-black uppercase tracking-widest mb-3" style={{ color: "#94A3B8" }}>DOCUMENTS</p>
                <div className="space-y-2">
                  <button className="flex items-center gap-3 w-full px-4 py-3 border border-[#E7E8EB] hover:border-[#1B6CA8] text-left transition-all" style={{ color: "#0D1B2A" }}>
                    <Download className="w-4 h-4" style={{ color: "#1B6CA8" }} />
                    <span className="text-[13px] font-bold">Download Invoice (PDF)</span>
                  </button>
                  {(selectedOrder.status === "qc_check" || selectedOrder.status === "dispatched" || selectedOrder.status === "delivered") && (
                    <button className="flex items-center gap-3 w-full px-4 py-3 border border-[#E7E8EB] hover:border-[#1B6CA8] text-left transition-all" style={{ color: "#0D1B2A" }}>
                      <Download className="w-4 h-4" style={{ color: "#16A34A" }} />
                      <span className="text-[13px] font-bold">Download QC Report</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Footer action */}
            <div className="px-6 py-4 border-t border-[#F1F3F5]">
              {reorderState === "done" && reorderingId === selectedOrder.id ? (
                <div className="flex items-center gap-3 px-4 py-3" style={{ background: "rgba(22,163,74,0.08)", border: "1px solid rgba(22,163,74,0.25)" }}>
                  <CheckCircle className="w-5 h-5 flex-shrink-0" style={{ color: "#16A34A" }} />
                  <div>
                    <p className="text-[13px] font-black" style={{ color: "#16A34A" }}>Reorder submitted!</p>
                    <p className="text-[12px]" style={{ color: "#64748B" }}>Quote ID: <span style={{ fontFamily: "monospace", fontWeight: 700 }}>{reorderQuoteId}</span></p>
                  </div>
                  <button onClick={() => navigate("/dashboard/quotes")} className="ml-auto text-[11px] font-black hover:underline" style={{ color: "#1B6CA8" }}>View →</button>
                </div>
              ) : (
                <button
                  className="btn-fill btn-amber w-full py-3 text-[14px]"
                  disabled={reorderState === "loading" && reorderingId === selectedOrder.id}
                  onClick={() => handleReorder(selectedOrder)}>
                  {reorderState === "loading" && reorderingId === selectedOrder.id
                    ? <span><Loader2 className="w-4 h-4 inline mr-2 animate-spin" />Submitting…</span>
                    : <span><RotateCcw className="w-4 h-4 inline mr-2" />Reorder this product</span>
                  }
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Reorder Dialog ── */}
      {reorderOrder && (
        <ReorderDialog
          order={reorderOrder}
          onClose={() => setReorderOrder(null)}
          onSuccess={handleReorderSuccess}
        />
      )}
    </div>
  );
}
