import { useState } from "react";
import { useAdminListQuotes } from "@workspace/api-client-react";
import { Loader2, ChevronDown, ChevronUp, ExternalLink, MessageSquare, Link2, Save, Trash2, Mail } from "lucide-react";
import { formatINR } from "@/lib/format";
import { useToast } from "@/hooks/use-toast";

const STATUS_OPTIONS = ["submitted", "reviewing", "quoted", "accepted", "rejected"];

function apiPut(path: string, body: object) {
  const adminKey = localStorage.getItem("packwerk_admin_key") || "";
  return fetch(`/api${path}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", "x-admin-key": adminKey },
    body: JSON.stringify(body),
  }).then(r => r.json());
}

function QuoteRow({ q, onRefetch }: { q: any; onRefetch: () => void }) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState(q.status);
  const [adminNotes, setAdminNotes] = useState(q.admin_notes || "");
  const [paymentLink, setPaymentLink] = useState(q.payment_link || "");
  const [quotedAmount, setQuotedAmount] = useState(q.quoted_amount ? String(q.quoted_amount) : "");
  const [deliveryDate, setDeliveryDate] = useState(q.delivery_date || "");
  const [paymentTerms, setPaymentTerms] = useState(q.payment_terms || "50% advance, 50% on delivery");
  const [savingNotes, setSavingNotes] = useState(false);
  const [savingStatus, setSavingStatus] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const { toast } = useToast();

  const items: any[] = Array.isArray(q.items) ? q.items : [];
  const firstItem = items[0] || {};

  const handleStatusChange = async (newStatus: string) => {
    setSavingStatus(true);
    try {
      await apiPut(`/admin/quotes/${q.id}/status`, { status: newStatus });
      setStatus(newStatus);
      toast({ title: `Status updated to "${newStatus}"` });
      onRefetch();
    } catch {
      toast({ variant: "destructive", title: "Failed to update status" });
    } finally { setSavingStatus(false); }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Delete quote ${q.quote_id}? This cannot be undone.`)) return;
    setDeleting(true);
    try {
      const adminKey = localStorage.getItem("packwerk_admin_key") || "";
      await fetch(`/api/admin/quotes/${q.id}`, { method: "DELETE", headers: { "x-admin-key": adminKey } });
      toast({ title: `Quote ${q.quote_id} deleted` });
      onRefetch();
    } catch {
      toast({ variant: "destructive", title: "Failed to delete quote" });
    } finally { setDeleting(false); }
  };

  const buildWhatsAppHref = () => {
    const advance = quotedAmount ? `₹${Math.round(Number(quotedAmount) / 2).toLocaleString("en-IN")}` : "50% (to be shared)";
    const balance = quotedAmount ? `₹${Math.round(Number(quotedAmount) / 2).toLocaleString("en-IN")}` : "50% (to be shared)";
    const msg = [
      `Hi ${q.contact_name || ""},`,
      ``,
      `Thank you for your enquiry with *Packworkz*. Here is your quotation:`,
      ``,
      `📋 *Quote ID:* ${q.quote_id}`,
      `🏢 *Company:* ${q.company_name}`,
      `📦 *Product:* ${firstItem.product_name || "—"}`,
      `🔢 *Quantity:* ${firstItem.quantity?.toLocaleString() || "—"} ${firstItem.quantity_unit || ""}`.trim(),
      ...(firstItem.variant_selections && Object.keys(firstItem.variant_selections).length
        ? Object.entries(firstItem.variant_selections).map(([k, v]) => `   • ${k.replace(/_/g, " ")}: ${v}`)
        : []),
      ...(firstItem.custom_specs && Object.keys(firstItem.custom_specs).length
        ? [`📐 *Dimensions:* ${Object.entries(firstItem.custom_specs).filter(([,v]) => v).map(([k,v]) => `${k.replace(/_/g," ")}: ${v}`).join(", ")}`]
        : []),
      ...(quotedAmount ? [``, `💰 *Quoted Price:* ₹${Number(quotedAmount).toLocaleString("en-IN")}`] : []),
      ...(deliveryDate ? [`📅 *Estimated Delivery:* ${deliveryDate}`] : []),
      ``,
      `💳 *Payment Terms:*`,
      `• Advance (50%): ${advance} — due to confirm order`,
      `• Before delivery after QC (50%): ${balance}`,
      ``,
      `To confirm your order, please make the advance payment. We will share the payment link shortly.`,
      ``,
      `— Packworkz Team`,
      `📞 +91 82089 90366`,
    ].join("\n");
    return `https://wa.me/${q.phone?.replace(/\D/g, "")}?text=${encodeURIComponent(msg)}`;
  };

  const buildEmailHref = () => {
    const advance = quotedAmount ? `₹${Math.round(Number(quotedAmount) / 2).toLocaleString("en-IN")}` : "50%";
    const balance = quotedAmount ? `₹${Math.round(Number(quotedAmount) / 2).toLocaleString("en-IN")}` : "50%";
    const subject = `Your Packworkz Quotation — ${q.quote_id}`;
    const body = [
      `Dear ${q.contact_name || ""},`,
      ``,
      `Thank you for your enquiry with Packworkz. Please find your quotation details below:`,
      ``,
      `Quote ID: ${q.quote_id}`,
      `Company: ${q.company_name}`,
      `Product: ${firstItem.product_name || "—"}`,
      `Quantity: ${firstItem.quantity?.toLocaleString() || "—"} ${firstItem.quantity_unit || ""}`.trim(),
      ...(firstItem.variant_selections && Object.keys(firstItem.variant_selections).length
        ? Object.entries(firstItem.variant_selections).map(([k, v]) => `  - ${k.replace(/_/g, " ")}: ${v}`)
        : []),
      ...(firstItem.custom_specs && Object.keys(firstItem.custom_specs).length
        ? [`Dimensions: ${Object.entries(firstItem.custom_specs).filter(([,v]) => v).map(([k,v]) => `${k.replace(/_/g," ")}: ${v}`).join(", ")}`]
        : []),
      ...(quotedAmount ? [`Quoted Price: ₹${Number(quotedAmount).toLocaleString("en-IN")}`] : []),
      ...(deliveryDate ? [`Estimated Delivery: ${deliveryDate}`] : []),
      ``,
      `Payment Terms:`,
      `  • Advance (50%): ${advance} — due immediately to confirm your order`,
      `  • Balance before delivery after QC (50%): ${balance}`,
      ``,
      `To confirm your order, please proceed with the advance payment.`,
      `Our team will share the payment link shortly.`,
      ``,
      `For any questions, reply to this email or WhatsApp us at +91 82089 90366.`,
      ``,
      `Best regards,`,
      `Packworkz Team`,
      `quote@packworkz.com | packworkz.com`,
    ].join("\n");
    return `mailto:${q.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const handleSaveNotes = async () => {
    setSavingNotes(true);
    try {
      await apiPut(`/admin/quotes/${q.id}/notes`, {
        admin_notes: adminNotes,
        payment_link: paymentLink,
        quoted_amount: quotedAmount ? Number(quotedAmount) : undefined,
        delivery_date: deliveryDate,
        payment_terms: paymentTerms,
      });
      toast({ title: "Quote details saved" });
      onRefetch();
    } catch {
      toast({ variant: "destructive", title: "Failed to save" });
    } finally { setSavingNotes(false); }
  };

  const statusColor = (s: string) => {
    const map: Record<string, string> = {
      submitted: "bg-blue-50 text-blue-700 border border-blue-200",
      reviewing: "bg-amber-50 text-amber-700 border border-amber-200",
      quoted: "bg-purple-50 text-purple-700 border border-purple-200",
      accepted: "bg-green-50 text-green-700 border border-green-200",
      rejected: "bg-red-50 text-red-700 border border-red-200",
    };
    return map[s] || "bg-slate-100 text-slate-600";
  };

  return (
    <>
      <tr
        className="border-b border-[#E2EAF4] hover:bg-[#F8F9FC] cursor-pointer"
        onClick={() => setOpen(o => !o)}
      >
        <td className="p-4 font-mono text-[#1B6CA8] text-sm font-bold">{q.quote_id}</td>
        <td className="p-4">
          <div className="font-semibold text-[#0D1B2A]">{q.company_name}</div>
          <div className="text-xs text-[#64748B]">{q.contact_name} · {q.email}</div>
        </td>
        <td className="p-4 text-[#64748B] text-sm">
          {firstItem.product_name || "—"}
          {items.length > 1 && <span className="text-xs text-slate-400"> +{items.length - 1} more</span>}
        </td>
        <td className="p-4 text-sm font-semibold text-[#0D1B2A]">
          {q.total_estimated_min ? `${formatINR(Number(q.total_estimated_min))} – ${formatINR(Number(q.total_estimated_max))}` : "—"}
        </td>
        <td className="p-4">
          <span className={`px-2 py-1 rounded text-xs font-semibold ${statusColor(status)}`}>{status}</span>
        </td>
        <td className="p-4 text-xs text-[#64748B]">
          {q.created_at ? new Date(q.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—"}
        </td>
        <td className="p-4 text-[#64748B]">
          {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </td>
      </tr>

      {open && (
        <tr className="border-b border-[#E2EAF4]">
          <td colSpan={7} className="p-0">
            <div className="bg-[#F8F9FC] border-t border-[#E2EAF4] p-6 space-y-6">
              {/* Full quote details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-lg border border-[#E2EAF4] p-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#94A3B8] mb-3">Contact Details</h4>
                  <dl className="space-y-1.5 text-sm">
                    <div className="flex justify-between"><dt className="text-[#64748B]">Name</dt><dd className="font-medium text-[#0D1B2A]">{q.contact_name || "—"}</dd></div>
                    <div className="flex justify-between"><dt className="text-[#64748B]">Company</dt><dd className="font-medium text-[#0D1B2A]">{q.company_name || "—"}</dd></div>
                    <div className="flex justify-between"><dt className="text-[#64748B]">Email</dt><dd className="font-medium text-[#1B6CA8]"><a href={`mailto:${q.email}`}>{q.email}</a></dd></div>
                    <div className="flex justify-between"><dt className="text-[#64748B]">Phone</dt><dd className="font-medium text-[#0D1B2A]">{q.phone || "—"}</dd></div>
                    <div className="flex justify-between"><dt className="text-[#64748B]">Pincode</dt><dd className="font-medium text-[#0D1B2A]">{q.delivery_pincode || "—"}</dd></div>
                  </dl>
                </div>

                <div className="bg-white rounded-lg border border-[#E2EAF4] p-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#94A3B8] mb-3">Product Details</h4>
                  {items.map((item: any, i: number) => (
                    <div key={i} className="text-sm mb-2 pb-2 border-b border-[#E2EAF4] last:border-0">
                      <div className="font-semibold text-[#0D1B2A]">{item.product_name || item.product_id || "—"}</div>
                      {item.category && <div className="text-xs text-[#94A3B8] capitalize mb-0.5">{item.category}</div>}
                      <div className="text-[#64748B] mt-0.5">
                        Qty: <span className="font-medium">{item.quantity?.toLocaleString()}{item.quantity_unit ? ` ${item.quantity_unit}` : ""}</span>
                      </div>
                      {item.variant_selections && Object.keys(item.variant_selections).length > 0 && (
                        <div className="mt-1.5 pt-1.5 border-t border-[#F1F5F9]">
                          <div className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wide mb-1">Configuration</div>
                          <div className="grid grid-cols-2 gap-x-3 gap-y-0.5">
                            {Object.entries(item.variant_selections).map(([k, v]) => (
                              <div key={k} className="flex justify-between text-xs">
                                <span className="text-[#94A3B8] capitalize">{k.replace(/_/g, " ")}</span>
                                <span className="font-medium text-[#0D1B2A]">{String(v)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {item.custom_specs && Object.keys(item.custom_specs).length > 0 && (
                        <div className="mt-1.5 pt-1.5 border-t border-[#F1F5F9]">
                          <div className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wide mb-1">Package Specs</div>
                          <div className="grid grid-cols-2 gap-x-3 gap-y-0.5">
                            {Object.entries(item.custom_specs).map(([k, v]) => (
                              <div key={k} className="flex justify-between text-xs">
                                <span className="text-[#94A3B8] capitalize">{k.replace(/_/g, " ")}</span>
                                <span className="font-medium text-[#0D1B2A]">{String(v)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {(item.sample_requested || item.design_paid || item.sample_paid) && (
                        <div className="mt-1.5 pt-1.5 border-t border-[#F1F5F9] flex flex-wrap gap-1.5">
                          {item.sample_requested && (
                            <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: "#EFF6FF", color: "#1B6CA8" }}>
                              Sample: {item.sample_tier || "requested"}
                            </span>
                          )}
                          {item.design_paid && (
                            <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: "#F0FDF4", color: "#16A34A" }}>
                              Design fee ✓ paid
                            </span>
                          )}
                          {item.sample_paid && (
                            <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: "#F0FDF4", color: "#16A34A" }}>
                              Sample fee ✓ paid
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                  <dl className="space-y-1 text-sm mt-2">
                    <div className="flex justify-between"><dt className="text-[#64748B]">Artwork</dt><dd className="font-medium text-[#0D1B2A]">{q.artwork_option || "—"}</dd></div>
                    {q.artwork_file_url && (
                      <div className="flex justify-between items-center">
                        <dt className="text-[#64748B]">Artwork File</dt>
                        <dd>
                          <a href={q.artwork_file_url} target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-1 text-xs text-[#1B6CA8] font-semibold hover:underline">
                            <ExternalLink className="w-3 h-3" />
                            {q.artwork_file_url.split("/").pop()?.substring(0, 32) || "View File"}
                          </a>
                        </dd>
                      </div>
                    )}
                    <div className="flex justify-between"><dt className="text-[#64748B]">Sample</dt><dd className="font-medium text-[#0D1B2A]">{q.sample_option || "—"}</dd></div>
                    <div className="flex justify-between"><dt className="text-[#64748B]">Timeline</dt><dd className="font-medium text-[#0D1B2A]">{q.preferred_timeline || "standard"}</dd></div>
                  </dl>
                </div>

                <div className="bg-white rounded-lg border border-[#E2EAF4] p-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#94A3B8] mb-3">Budget & Notes</h4>
                  <dl className="space-y-1.5 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-[#64748B]">Est. Budget</dt>
                      <dd className="font-medium text-[#0D1B2A]">
                        {q.total_estimated_min
                          ? `${formatINR(Number(q.total_estimated_min))} – ${formatINR(Number(q.total_estimated_max))}`
                          : "—"}
                      </dd>
                    </div>
                  </dl>
                  {q.notes && (
                    <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded text-sm text-amber-800">
                      <span className="font-semibold">Client Notes: </span>{q.notes}
                    </div>
                  )}
                </div>
              </div>

              {/* Status + Admin actions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white rounded-lg border border-[#E2EAF4] p-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#94A3B8] mb-3 flex items-center gap-2">
                    <ChevronDown className="w-3.5 h-3.5" /> Update Status
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {STATUS_OPTIONS.map(s => (
                      <button
                        key={s}
                        onClick={() => handleStatusChange(s)}
                        disabled={status === s || savingStatus}
                        className="px-3 py-1.5 rounded text-xs font-semibold border transition-all disabled:opacity-40"
                        style={{
                          background: status === s ? "#0D1B2A" : "white",
                          color: status === s ? "white" : "#374151",
                          borderColor: status === s ? "#0D1B2A" : "#E2EAF4",
                        }}
                      >
                        {savingStatus && status !== s ? "" : s}
                        {savingStatus && <Loader2 className="w-3 h-3 animate-spin inline ml-1" />}
                      </button>
                    ))}
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <a href={buildWhatsAppHref()} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded text-xs font-bold bg-green-500 text-white hover:bg-green-600 transition-colors"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                      WhatsApp Quote
                    </a>
                    <a href={buildEmailHref()}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded text-xs font-bold bg-[#1B6CA8] text-white hover:bg-[#0D1B2A] transition-colors"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      Email Quote
                    </a>
                    <button onClick={handleDelete} disabled={deleting}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded text-xs font-bold bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 transition-colors disabled:opacity-50 ml-auto"
                    >
                      {deleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                      Delete Quote
                    </button>
                  </div>
                </div>

                <div className="bg-white rounded-lg border border-[#E2EAF4] p-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#94A3B8] mb-3 flex items-center gap-2">
                    <MessageSquare className="w-3.5 h-3.5" /> Quote Details & Admin Notes
                  </h4>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-medium text-[#64748B] mb-1 block">Quoted Amount (₹)</label>
                        <input
                          type="number"
                          value={quotedAmount}
                          onChange={e => setQuotedAmount(e.target.value)}
                          placeholder="e.g. 48000"
                          className="w-full border border-[#E2EAF4] rounded px-3 py-2 text-sm focus:outline-none focus:border-[#1B6CA8] bg-[#F8F9FC]"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-[#64748B] mb-1 block">Delivery Date</label>
                        <input
                          type="text"
                          value={deliveryDate}
                          onChange={e => setDeliveryDate(e.target.value)}
                          placeholder="e.g. 15 Jun 2026 or 3-4 weeks"
                          className="w-full border border-[#E2EAF4] rounded px-3 py-2 text-sm focus:outline-none focus:border-[#1B6CA8] bg-[#F8F9FC]"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-[#64748B] mb-1 block">Payment Terms</label>
                      <input
                        type="text"
                        value={paymentTerms}
                        onChange={e => setPaymentTerms(e.target.value)}
                        placeholder="e.g. 50% advance, 50% on delivery"
                        className="w-full border border-[#E2EAF4] rounded px-3 py-2 text-sm focus:outline-none focus:border-[#1B6CA8] bg-[#F8F9FC]"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-[#64748B] mb-1 block">Internal Notes</label>
                      <textarea
                        value={adminNotes}
                        onChange={e => setAdminNotes(e.target.value)}
                        placeholder="Add internal notes for the team…"
                        className="w-full border border-[#E2EAF4] rounded px-3 py-2 text-sm resize-none h-16 focus:outline-none focus:border-[#1B6CA8] bg-[#F8F9FC]"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-[#64748B] mb-1 block flex items-center gap-1"><Link2 className="w-3 h-3" /> Payment Link (send to client)</label>
                      <input
                        type="url"
                        value={paymentLink}
                        onChange={e => setPaymentLink(e.target.value)}
                        placeholder="https://rzp.io/l/…"
                        className="w-full border border-[#E2EAF4] rounded px-3 py-2 text-sm focus:outline-none focus:border-[#1B6CA8] bg-[#F8F9FC]"
                      />
                      {paymentLink && (
                        <a href={paymentLink} target="_blank" rel="noopener noreferrer" className="text-xs text-[#1B6CA8] flex items-center gap-1 mt-1 hover:underline">
                          <ExternalLink className="w-3 h-3" /> Verify link
                        </a>
                      )}
                    </div>
                    <button
                      onClick={handleSaveNotes}
                      disabled={savingNotes}
                      className="flex items-center gap-2 px-4 py-2 rounded text-xs font-bold bg-[#0D1B2A] text-white hover:bg-[#1B6CA8] transition-colors disabled:opacity-60"
                    >
                      {savingNotes ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                      Save Quote Details
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

export default function AdminQuotes() {
  const [statusFilter, setStatusFilter] = useState("submitted");
  const { data: quotes, isLoading, refetch } = useAdminListQuotes({
    status: statusFilter !== "all" ? statusFilter : undefined,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0D1B2A]">Quote Requests</h1>
          <p className="text-sm text-[#64748B] mt-1">Click any row to expand full details, update status, and add notes.</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {["all", ...STATUS_OPTIONS].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                statusFilter === s ? "bg-[#1B6CA8] text-white" : "bg-[#F8F9FC] text-[#64748B] border border-[#E2EAF4] hover:bg-[#E2EAF4]"
              }`}
            >
              {s.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-[#1B6CA8]" /></div>
      ) : !quotes || quotes.length === 0 ? (
        <div className="text-center py-16 bg-[#F8F9FC] rounded-xl border border-[#E2EAF4]">
          <p className="text-[#64748B]">No quotes for this status.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-[#E2EAF4] bg-white">
          <table className="w-full text-sm">
            <thead className="bg-[#F8F9FC] border-b border-[#E2EAF4]">
              <tr>
                <th className="text-left p-4 font-semibold text-[#0D1B2A]">Quote ID</th>
                <th className="text-left p-4 font-semibold text-[#0D1B2A]">Client</th>
                <th className="text-left p-4 font-semibold text-[#0D1B2A]">Product</th>
                <th className="text-left p-4 font-semibold text-[#0D1B2A]">Est. Budget</th>
                <th className="text-left p-4 font-semibold text-[#0D1B2A]">Status</th>
                <th className="text-left p-4 font-semibold text-[#0D1B2A]">Date</th>
                <th className="p-4"></th>
              </tr>
            </thead>
            <tbody>
              {(quotes as any[]).map((q: any) => (
                <QuoteRow key={q.id} q={q} onRefetch={refetch} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
