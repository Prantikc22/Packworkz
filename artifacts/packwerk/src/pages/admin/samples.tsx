import { useState } from "react";
import { useAdminListSamples, useAdminDispatchSample } from "@workspace/api-client-react";
import { Loader2, ChevronDown } from "lucide-react";
import { getStatusColor } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const SAMPLE_STATUSES = ["pending", "dispatched", "delivered"];

export default function AdminSamples() {
  const [statusFilter, setStatusFilter] = useState("all");
  const { data: samples, isLoading, refetch } = useAdminListSamples({ status: statusFilter !== "all" ? statusFilter : undefined });
  const { mutate: updateSample } = useAdminDispatchSample();
  const { toast } = useToast();

  const changeStatus = (sampleId: string, status: string) => {
    updateSample({ id: sampleId }, {
      onSuccess: () => {
        toast({ title: `Sample updated to ${status}` });
        refetch();
      },
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#0D1B2A]">Sample Requests</h1>
        <div className="flex gap-2 flex-wrap">
          {["all", ...SAMPLE_STATUSES].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                statusFilter === s ? "bg-[#1B6CA8] text-white" : "bg-[#F8F9FC] text-[#64748B] border border-[#E2EAF4] hover:bg-[#E2EAF4]"
              }`}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-[#1B6CA8]" /></div>
      ) : !samples || samples.length === 0 ? (
        <div className="text-center py-16 bg-[#F8F9FC] rounded-xl border border-[#E2EAF4]">
          <p className="text-[#64748B]">No sample requests found.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-[#E2EAF4] bg-white">
          <table className="w-full text-sm">
            <thead className="bg-[#F8F9FC] border-b border-[#E2EAF4]">
              <tr>
                <th className="text-left p-4 font-semibold text-[#0D1B2A]">Sample ID</th>
                <th className="text-left p-4 font-semibold text-[#0D1B2A]">User</th>
                <th className="text-left p-4 font-semibold text-[#0D1B2A]">Products</th>
                <th className="text-left p-4 font-semibold text-[#0D1B2A]">Company</th>
                <th className="text-left p-4 font-semibold text-[#0D1B2A]">Status</th>
                <th className="text-left p-4 font-semibold text-[#0D1B2A]">Date</th>
                <th className="text-left p-4 font-semibold text-[#0D1B2A]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {samples.map((s: any) => (
                <tr key={s.id} className="border-b border-[#E2EAF4] hover:bg-[#F8F9FC]">
                  <td className="p-4 font-mono text-[#1B6CA8]">{s.sample_id}</td>
                  <td className="p-4 text-[#64748B]">{s.user_id}</td>
                  <td className="p-4 text-[#0D1B2A]">
                    {Array.isArray(s.product_ids) ? s.product_ids.slice(0, 3).join(", ") : "—"}
                    {Array.isArray(s.product_ids) && s.product_ids.length > 3 ? ` +${s.product_ids.length - 3} more` : ""}
                  </td>
                  <td className="p-4 text-[#64748B]">{s.company_name || "—"}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(s.status)}`}>
                      {s.status.charAt(0).toUpperCase() + s.status.slice(1)}
                    </span>
                  </td>
                  <td className="p-4 text-[#64748B]">{new Date(s.created_at).toLocaleDateString("en-IN")}</td>
                  <td className="p-4">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="sm" variant="outline" className="border-[#E2EAF4]">
                          Update <ChevronDown className="w-3 h-3 ml-1" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        {SAMPLE_STATUSES.filter((st) => st !== s.status).map((st) => (
                          <DropdownMenuItem key={st} onClick={() => changeStatus(s.sample_id, st)}>
                            {st.charAt(0).toUpperCase() + st.slice(1)}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
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
