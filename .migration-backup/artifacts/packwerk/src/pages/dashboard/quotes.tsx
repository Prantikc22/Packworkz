import { useState } from "react";
import { useGetDashboardQuotes, useAcceptDashboardQuote } from "@workspace/api-client-react";
import { Loader2, MessageCircle, CheckCircle } from "lucide-react";
import { Link, useLocation } from "wouter";

const MS = ({ icon, className = "", style }: { icon: string; className?: string; style?: React.CSSProperties }) => (
  <span className={`material-symbols-outlined ${className}`} style={style}>{icon}</span>
);

const WHATSAPP_NUM = "918208990366";

function fmt(n: number) {
  return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(n);
}

function daysUntilExpiry(createdAt: string) {
  const expiry = new Date(createdAt).getTime() + 7 * 86400000;
  return Math.max(0, Math.round((expiry - Date.now()) / 86400000));
}

function daysSince(dateStr: string) {
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
}

function ConfirmModal({ quote, onConfirm, onCancel, loading }: {
  quote: any; onConfirm: () => void; onCancel: () => void; loading: boolean;
}) {
  const firstItem = Array.isArray(quote.items) ? quote.items[0] : null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={onCancel} />
      <div className="relative bg-white max-w-md w-full shadow-2xl p-8">
        <p className="text-[11px] font-black uppercase tracking-widest mb-2" style={{ color: "#94A3B8" }}>CONFIRM ORDER</p>
        <h2 className="font-black text-[22px] mb-1" style={{ color: "#0D1B2A" }}>Confirm your order?</h2>
        <p className="text-[13px] mb-6" style={{ color: "#64748B" }}>
          Once confirmed, production will begin and cannot be cancelled.
        </p>

        <div className="border border-[#E7E8EB] p-4 mb-6 space-y-2">
          <div className="flex justify-between text-[13px]">
            <span style={{ color: "#64748B" }}>Quote ID</span>
            <span className="font-black" style={{ color: "#E8A838", fontFamily: "monospace" }}>{quote.quote_id}</span>
          </div>
          {firstItem && (
            <div className="flex justify-between text-[13px]">
              <span style={{ color: "#64748B" }}>Product</span>
              <span className="font-bold" style={{ color: "#0D1B2A" }}>{firstItem.product_name}</span>
            </div>
          )}
          {(quote.quoted_amount || quote.total_estimated_max) && (
            <div className="flex justify-between text-[13px]">
              <span style={{ color: "#64748B" }}>Order value</span>
              <span className="font-black" style={{ color: "#0D1B2A" }}>
                ₹{fmt(Number(quote.quoted_amount || quote.total_estimated_max))}
              </span>
            </div>
          )}
          {quote.delivery_date && (
            <div className="flex justify-between text-[13px]">
              <span style={{ color: "#64748B" }}>Delivery</span>
              <span className="font-bold" style={{ color: "#0D1B2A" }}>{quote.delivery_date}</span>
            </div>
          )}
          <div className="flex justify-between text-[13px]">
            <span style={{ color: "#64748B" }}>Payment terms</span>
            <span className="font-bold" style={{ color: "#0D1B2A" }}>{quote.payment_terms || "50% advance, 50% on delivery"}</span>
          </div>
        </div>

        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-3 border border-[#E7E8EB] text-[13px] font-bold transition-all hover:border-[#94A3B8]" style={{ color: "#64748B" }}>
            Cancel
          </button>
          <button onClick={onConfirm} disabled={loading} className="btn-fill btn-amber flex-1 py-3 text-[13px]">
            {loading ? (
              <span className="flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Confirming…</span>
            ) : (
              <span>Confirm Order</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function DashboardQuotes() {
  const [activeTab, setActiveTab] = useState<"pending" | "history">("pending");
  const [acceptingQuote, setAcceptingQuote] = useState<any>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [, navigate] = useLocation();

  const { data: quotes, isLoading, refetch } = useGetDashboardQuotes(activeTab);
  const { mutate: acceptQuote, isPending: accepting } = useAcceptDashboardQuote();

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  const handleAccept = () => {
    if (!acceptingQuote) return;
    acceptQuote(acceptingQuote.id, {
      onSuccess: (data) => {
        setAcceptingQuote(null);
        showToast("Order confirmed! Your production has begun.");
        refetch();
        setTimeout(() => navigate("/dashboard/orders"), 1500);
      },
      onError: () => {
        setAcceptingQuote(null);
        showToast("Error confirming order. Please try again.");
      },
    });
  };

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <h1 className="font-black text-[28px] mb-6 leading-tight" style={{ color: "#0D1B2A", letterSpacing: "-0.01em" }}>Quotes</h1>

      {/* Tabs */}
      <div className="flex gap-0 border-b border-[#E7E8EB] mb-6">
        {(["pending", "history"] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className="px-6 py-3 text-[13px] font-black uppercase tracking-wider transition-all border-b-2"
            style={{
              borderColor: activeTab === tab ? "#E8A838" : "transparent",
              color: activeTab === tab ? "#0D1B2A" : "#94A3B8",
            }}>
            {tab === "pending" ? "Pending" : "History"}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin" style={{ color: "#1B6CA8" }} /></div>
      ) : activeTab === "pending" ? (
        /* ── Pending Quotes ── */
        <div className="space-y-4">
          {(!quotes || (quotes as any[]).length === 0) ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white border border-[#E7E8EB]">
              <MS icon="format_quote" className="text-5xl mb-4" style={{ color: "#CBD5E1" }} />
              <p className="font-bold text-[15px] mb-1" style={{ color: "#94A3B8" }}>No pending quotes</p>
              <p className="text-[13px] mb-5" style={{ color: "#CBD5E1" }}>Start a new quote to get pricing from our team</p>
              <Link href="/quote">
                <button className="btn-fill btn-amber px-6 py-2.5 text-[13px]"><span>Get a Quote →</span></button>
              </Link>
            </div>
          ) : (
            (quotes as any[]).map((quote: any) => {
              const daysLeft = daysUntilExpiry(quote.created_at);
              const isQuoted = quote.status === "quoted";
              const firstItem = Array.isArray(quote.items) ? quote.items[0] : null;
              const itemSummary = Array.isArray(quote.items)
                ? quote.items.map((i: any) => i.product_name).filter(Boolean).join(", ")
                : "Custom packaging";

              return (
                <div key={quote.id} className="bg-white border border-[#E7E8EB] p-6">
                  {/* Header row */}
                  <div className="flex items-start justify-between mb-4 flex-wrap gap-2">
                    <div>
                      <p className="font-black text-[18px]" style={{ color: "#E8A838", fontFamily: "monospace" }}>{quote.quote_id}</p>
                      <p className="text-[13px] mt-0.5" style={{ color: "#64748B" }}>
                        Submitted {daysSince(quote.created_at)}d ago
                      </p>
                    </div>
                    <span className="text-[11px] font-black px-3 py-1"
                      style={{
                        background: daysLeft < 2 ? "rgba(186,26,26,0.1)" : "rgba(232,168,56,0.1)",
                        color: daysLeft < 2 ? "#ba1a1a" : "#D97706",
                      }}>
                      {daysLeft < 2 ? `⚠ Expires in ${daysLeft}d` : `Expires in ${daysLeft}d`}
                    </span>
                  </div>

                  <p className="text-[14px] font-bold mb-4" style={{ color: "#0D1B2A" }}>{itemSummary}</p>

                  {/* Always show submitted items */}
                  {Array.isArray(quote.items) && quote.items.length > 0 && (
                    <div className="border border-[#F1F3F5] mb-4">
                      <div className="px-4 py-2 bg-[#F8F9FC] border-b border-[#F1F3F5]">
                        <p className="text-[11px] font-black uppercase tracking-widest" style={{ color: "#94A3B8" }}>
                          {isQuoted ? "LINE ITEMS" : "YOUR REQUEST"}
                        </p>
                      </div>
                      {quote.items.map((item: any, i: number) => (
                        <div key={i} className="flex justify-between items-center px-4 py-3 border-b border-[#F8F9FC] last:border-0">
                          <div>
                            <span className="text-[13px] font-bold" style={{ color: "#0D1B2A" }}>{item.product_name ?? "Custom packaging"}</span>
                            {item.sku_id && <span className="ml-2 text-[11px] font-mono" style={{ color: "#94A3B8" }}>{item.sku_id}</span>}
                            {item.artwork_option && item.artwork_option !== "none" && (
                              <span className="ml-2 text-[11px] px-1.5 py-0.5 font-bold" style={{ background: "rgba(27,108,168,0.08)", color: "#1B6CA8" }}>
                                {item.artwork_option === "upload" ? "Artwork upload" : item.artwork_option === "design" ? "Design service" : ""}
                              </span>
                            )}
                          </div>
                          <span className="text-[13px]" style={{ color: "#64748B" }}>{item.quantity ? `${fmt(item.quantity)} units` : "—"}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {isQuoted ? (
                    /* Quote sent by team */
                    <div>
                      <div className="flex justify-between items-end mb-4">
                        <div>
                          {quote.quoted_amount ? (
                            <p className="text-[22px] font-black" style={{ color: "#0D1B2A" }}>
                              ₹{fmt(Number(quote.quoted_amount))}
                            </p>
                          ) : quote.total_estimated_min ? (
                            <p className="text-[22px] font-black" style={{ color: "#0D1B2A" }}>
                              ₹{fmt(quote.total_estimated_min)}
                              {quote.total_estimated_max && quote.total_estimated_max !== quote.total_estimated_min && (
                                <span> – ₹{fmt(quote.total_estimated_max)}</span>
                              )}
                            </p>
                          ) : null}
                          {quote.delivery_date && (
                            <p className="text-[12px] mt-0.5" style={{ color: "#64748B" }}>
                              Delivery: <span className="font-semibold">{quote.delivery_date}</span>
                            </p>
                          )}
                          <p className="text-[12px] mt-0.5" style={{ color: "#94A3B8" }}>
                            Payment: {quote.payment_terms || "50% advance · 50% on delivery"}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-3 flex-wrap">
                        <button className="btn-fill btn-amber px-6 py-3 text-[13px] flex-1" onClick={() => setAcceptingQuote(quote)}>
                          <span><CheckCircle className="w-4 h-4 inline mr-2" />Confirm Order</span>
                        </button>
                        <a href={`https://wa.me/${WHATSAPP_NUM}?text=Hi+Packworkz%2C+I+have+a+question+about+quote+${quote.quote_id}`}
                          target="_blank" rel="noopener noreferrer">
                          <button className="btn-fill btn-outline-dark px-5 py-3 text-[13px]">
                            <span><MessageCircle className="w-4 h-4 inline mr-2" />Ask a Question</span>
                          </button>
                        </a>
                      </div>
                    </div>
                  ) : (
                    /* Waiting for quote */
                    <div className="flex flex-col sm:flex-row gap-4 items-start mt-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-2.5 h-2.5 rounded-full animate-pulse flex-shrink-0" style={{ background: "#E8A838" }} />
                          <p className="text-[13px] font-bold" style={{ color: "#0D1B2A" }}>Our team is preparing your quote.</p>
                        </div>
                        <p className="text-[12px] ml-[22px]" style={{ color: "#64748B" }}>Expected within 48 hours.</p>
                        <div className="mt-3 ml-[22px]">
                          <div className="w-full max-w-xs h-1 bg-[#F1F3F5] overflow-hidden">
                            <div className="h-full animate-[progress_2s_ease-in-out_infinite]" style={{ background: "#E8A838", width: "60%" }} />
                          </div>
                        </div>
                      </div>
                      <a href={`https://wa.me/${WHATSAPP_NUM}?text=Hi+Packworkz%2C+I%27m+following+up+on+quote+${quote.quote_id}`}
                        target="_blank" rel="noopener noreferrer">
                        <button className="flex items-center gap-2 px-4 py-2.5 border border-[#E7E8EB] text-[12px] font-black hover:border-[#25D366] hover:text-[#25D366] transition-all" style={{ color: "#64748B" }}>
                          <MS icon="chat" className="text-base" /> WhatsApp Follow Up
                        </button>
                      </a>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      ) : (
        /* ── History Tab ── */
        <div className="bg-white border border-[#E7E8EB] overflow-hidden">
          {(!quotes || (quotes as any[]).length === 0) ? (
            <div className="text-center py-16">
              <p className="font-bold text-[15px] mb-1" style={{ color: "#94A3B8" }}>No quote history yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="border-b border-[#F1F3F5]">
                    {["QUOTE ID", "PRODUCTS", "VALUE", "DATE", "STATUS"].map(h => (
                      <th key={h} className="px-5 py-3 text-left text-[11px] font-black uppercase tracking-wider" style={{ color: "#94A3B8" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(quotes as any[]).map((q: any) => {
                    const statusMap: Record<string, { label: string; color: string; bg: string }> = {
                      accepted: { label: "ACCEPTED", color: "#16A34A", bg: "rgba(22,163,74,0.1)" },
                      rejected: { label: "REJECTED", color: "#ba1a1a", bg: "rgba(186,26,26,0.1)" },
                      expired:  { label: "EXPIRED",  color: "#94A3B8", bg: "rgba(148,163,184,0.1)" },
                    };
                    const s = statusMap[q.status] ?? { label: q.status.toUpperCase(), color: "#64748B", bg: "rgba(100,116,139,0.1)" };
                    return (
                      <tr key={q.id} className="border-b border-[#F8F9FC] hover:bg-[#FAFBFC]">
                        <td className="px-5 py-4 font-black" style={{ color: "#E8A838", fontFamily: "monospace" }}>{q.quote_id}</td>
                        <td className="px-5 py-4 max-w-[200px] truncate" style={{ color: "#0D1B2A" }}>
                          {Array.isArray(q.items) ? q.items.map((i: any) => i.product_name).filter(Boolean).join(", ") : "—"}
                        </td>
                        <td className="px-5 py-4 font-bold" style={{ color: "#0D1B2A" }}>
                          {q.total_estimated_min ? `₹${fmt(q.total_estimated_min)} – ₹${fmt(q.total_estimated_max ?? q.total_estimated_min)}` : "—"}
                        </td>
                        <td className="px-5 py-4" style={{ color: "#64748B" }}>
                          {new Date(q.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                        </td>
                        <td className="px-5 py-4">
                          <span className="px-2.5 py-1 text-[11px] font-black uppercase tracking-wider" style={{ background: s.bg, color: s.color, borderRadius: 0 }}>
                            {s.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Confirm Modal */}
      {acceptingQuote && (
        <ConfirmModal
          quote={acceptingQuote}
          onConfirm={handleAccept}
          onCancel={() => setAcceptingQuote(null)}
          loading={accepting}
        />
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[70] px-6 py-3 font-bold text-[13px] shadow-2xl flex items-center gap-2"
          style={{ background: "#0D1B2A", color: "white", minWidth: 300, textAlign: "center" }}>
          <CheckCircle className="w-4 h-4" style={{ color: "#E8A838" }} />
          {toast}
        </div>
      )}
    </div>
  );
}
