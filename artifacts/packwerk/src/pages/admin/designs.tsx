import { useState } from "react";
import { useAdminListDesigns, useAdminUpdateDesignStatus } from "@workspace/api-client-react";
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

const DESIGN_STATUSES = ["submitted", "in_design", "revision", "approved", "rejected"];

export default function AdminDesigns() {
  const [statusFilter, setStatusFilter] = useState("all");
  const { data: designs, isLoading, refetch } = useAdminListDesigns({ status: statusFilter !== "all" ? statusFilter : undefined });
  const { mutate: updateDesign } = useAdminUpdateDesignStatus();
  const { toast } = useToast();

  const changeStatus = (designId: string, status: string, notes?: string) => {
    updateDesign({ id: designId, adminUpdateDesignStatusBody: { status, designer_notes: notes } }, {
      onSuccess: () => {
        toast({ title: `Design updated to ${status}` });
        refetch();
      },
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#0D1B2A]">Design Requests</h1>
        <div className="flex gap-2 flex-wrap">
          {["all", ...DESIGN_STATUSES].map((s) => (
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
      ) : !designs || designs.length === 0 ? (
        <div className="text-center py-16 bg-[#F8F9FC] rounded-xl border border-[#E2EAF4]">
          <p className="text-[#64748B]">No design requests found.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-[#E2EAF4] bg-white">
          <table className="w-full text-sm">
            <thead className="bg-[#F8F9FC] border-b border-[#E2EAF4]">
              <tr>
                <th className="text-left p-4 font-semibold text-[#0D1B2A]">Design ID</th>
                <th className="text-left p-4 font-semibold text-[#0D1B2A]">User</th>
                <th className="text-left p-4 font-semibold text-[#0D1B2A]">Product Type</th>
                <th className="text-left p-4 font-semibold text-[#0D1B2A]">Rush</th>
                <th className="text-left p-4 font-semibold text-[#0D1B2A]">Status</th>
                <th className="text-left p-4 font-semibold text-[#0D1B2A]">Date</th>
                <th className="text-left p-4 font-semibold text-[#0D1B2A]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {designs.map((d: any) => (
                <tr key={d.id} className="border-b border-[#E2EAF4] hover:bg-[#F8F9FC]">
                  <td className="p-4 font-mono text-[#1B6CA8]">{d.design_id}</td>
                  <td className="p-4 text-[#64748B]">{d.user_id}</td>
                  <td className="p-4 text-[#0D1B2A]">{d.product_type}</td>
                  <td className="p-4">
                    {d.is_rush ? (
                      <span className="px-2 py-1 rounded text-xs font-medium bg-[#E8A838] text-[#0D1B2A]">Rush</span>
                    ) : "—"}
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(d.status)}`}>
                      {d.status.replace("_", " ").replace(/\b\w/g, (l: string) => l.toUpperCase())}
                    </span>
                  </td>
                  <td className="p-4 text-[#64748B]">{new Date(d.created_at).toLocaleDateString("en-IN")}</td>
                  <td className="p-4">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="sm" variant="outline" className="border-[#E2EAF4]">
                          Update <ChevronDown className="w-3 h-3 ml-1" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        {DESIGN_STATUSES.filter((s) => s !== d.status).map((s) => (
                          <DropdownMenuItem key={s} onClick={() => changeStatus(d.design_id, s)}>
                            {s.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
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
