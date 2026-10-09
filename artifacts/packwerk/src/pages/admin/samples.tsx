import { useEffect, useState } from "react";
import { Loader2, RefreshCw } from "lucide-react";
import { getStatusColor } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const SAMPLE_STATUSES = ["paid", "dispatched", "delivered", "cancelled"];

type Sample = {
  id: string;
  sample_id: string;
  contact_name?: string;
  email?: string;
  phone?: string;
  status: string;
  amount_paid?: number;
  razorpay_payment_id?: string;
  shipping?: { address?: string; pincode?: string; note?: string } | null;
  created_at: string;
};

const adminHeaders = () => ({ "Content-Type": "application/json", "x-admin-key": localStorage.getItem("packwerk_admin_key") || "" });

export default function AdminSamples() {
  const [statusFilter, setStatusFilter] = useState("all");
  const [samples, setSamples] = useState<Sample[] | null>(null);
  const [syncing, setSyncing] = useState(false);
  const { toast } = useToast();

  const load = async () => {
    const response = await fetch("/api/admin/samples", { headers: adminHeaders() });
    setSamples(response.ok ? await response.json() : []);
  };
  useEffect(() => { void load(); }, []);

  const changeStatus = async (sample: Sample, status: string) => {
    const response = await fetch(`/api/admin/samples/${sample.id}/update`, {
      method: "PUT",
      headers: adminHeaders(),
      body: JSON.stringify({ status }),
    });
    toast(response.ok ? { title: `${sample.sample_id} → ${status}` } : { variant: "destructive", title: "Could not update the sample" });
    void load();
  };

  // Records any captured Razorpay sample/design/Launch Desk payment that is missing here.
  const sync = async () => {
    setSyncing(true);
    try {
      const response = await fetch("/api/admin/payments/sync", { method: "POST", headers: adminHeaders(), body: JSON.stringify({ days: 60 }) });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "Sync failed");
      toast({ title: result.recorded?.length ? `Recovered ${result.recorded.length} payment(s)` : "Everything is already recorded", description: `${result.checked} Razorpay payments checked${result.errors?.length ? ` · ${result.errors.length} errors` : ""}` });
      void load();
    } catch (error) {
      toast({ variant: "destructive", title: "Sync failed", description: error instanceof Error ? error.message : "" });
    } finally {
      setSyncing(false);
    }
  };

  const filtered = (samples || []).filter((sample) => statusFilter === "all" || sample.status === statusFilter);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-[#0D1B2A]">Sample Requests</h1>
        <div className="flex flex-wrap items-center gap-2">
          {["all", ...SAMPLE_STATUSES].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${statusFilter === s ? "bg-[#1B6CA8] text-white" : "bg-[#F8F9FC] text-[#64748B] border border-[#E2EAF4] hover:bg-[#E2EAF4]"}`}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
          <Button size="sm" variant="outline" onClick={sync} disabled={syncing} className="border-[#E2EAF4]">
            {syncing ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5 mr-1.5" />} Sync from Razorpay
          </Button>
        </div>
      </div>

      {samples === null ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-[#1B6CA8]" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-[#F8F9FC] rounded-xl border border-[#E2EAF4]">
          <p className="text-[#64748B]">No sample requests found. Use “Sync from Razorpay” to pull in any paid kits that were missed.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-[#E2EAF4] bg-white">
          <table className="w-full text-sm">
            <thead className="bg-[#F8F9FC] border-b border-[#E2EAF4]">
              <tr>
                {["Sample", "Customer", "Ship to", "Payment", "Status", "Date", ""].map((h) => <th key={h} className="text-left p-4 font-semibold text-[#0D1B2A]">{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <tr key={s.id} className="border-b border-[#E2EAF4] align-top hover:bg-[#F8F9FC]">
                  <td className="p-4 font-mono text-[#1B6CA8]">{s.sample_id}</td>
                  <td className="p-4">
                    <div className="font-semibold text-[#0D1B2A]">{s.contact_name || "—"}</div>
                    {s.phone && <a className="block text-[#1B6CA8]" href={`https://wa.me/${s.phone.replace(/\D/g, "")}`} target="_blank" rel="noreferrer">{s.phone}</a>}
                    {s.email && <a className="block text-[#64748B]" href={`mailto:${s.email}`}>{s.email}</a>}
                  </td>
                  <td className="p-4 max-w-xs text-[#334155]">
                    {s.shipping?.address ? <div>{s.shipping.address}</div> : <div className="font-semibold text-[#B45309]">Address not captured — contact customer</div>}
                    {s.shipping?.pincode && <div className="text-[#64748B]">PIN {s.shipping.pincode}</div>}
                    {s.shipping?.note && <div className="mt-1 text-xs text-[#64748B]">Note: {s.shipping.note}</div>}
                  </td>
                  <td className="p-4 text-[#64748B]">
                    <div className="font-semibold text-[#0D1B2A]">₹{Number(s.amount_paid || 0).toLocaleString("en-IN")}</div>
                    <div className="font-mono text-xs">{s.razorpay_payment_id || "—"}</div>
                  </td>
                  <td className="p-4"><span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(s.status)}`}>{s.status.charAt(0).toUpperCase() + s.status.slice(1)}</span></td>
                  <td className="p-4 text-[#64748B]">{new Date(s.created_at).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</td>
                  <td className="p-4">
                    <select className="rounded border border-[#E2EAF4] bg-white px-2 py-1.5 text-xs" value="" onChange={(event) => event.target.value && changeStatus(s, event.target.value)}>
                      <option value="">Set status…</option>
                      {SAMPLE_STATUSES.filter((st) => st !== s.status).map((st) => <option key={st} value={st}>{st.charAt(0).toUpperCase() + st.slice(1)}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
