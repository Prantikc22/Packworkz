import { useState } from "react";
import { useAdminListQuotes, useAdminUpdateQuoteStatus } from "@workspace/api-client-react";
import { Loader2, ChevronDown } from "lucide-react";
import { formatINR, getStatusColor } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const STATUS_OPTIONS = ["submitted", "reviewing", "quoted", "accepted", "rejected"];

export default function AdminQuotes() {
  const [statusFilter, setStatusFilter] = useState("submitted");
  const { data: quotes, isLoading, refetch } = useAdminListQuotes({ status: statusFilter !== "all" ? statusFilter : undefined });
  const { mutate: updateQuote } = useAdminUpdateQuoteStatus();
  const { toast } = useToast();

  const changeStatus = (quoteId: string, status: string) => {
    updateQuote({ id: quoteId, adminUpdateQuoteStatusBody: { status } }, {
      onSuccess: () => {
        toast({ title: `Quote updated to ${status}` });
        refetch();
      },
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#0D1B2A]">Quote Requests</h1>
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
                <th className="text-left p-4 font-semibold text-[#0D1B2A]">Company</th>
                <th className="text-left p-4 font-semibold text-[#0D1B2A]">Items</th>
                <th className="text-left p-4 font-semibold text-[#0D1B2A]">Budget</th>
                <th className="text-left p-4 font-semibold text-[#0D1B2A]">Status</th>
                <th className="text-left p-4 font-semibold text-[#0D1B2A]">Date</th>
                <th className="text-left p-4 font-semibold text-[#0D1B2A]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {quotes.map((q: any) => (
                <tr key={q.id} className="border-b border-[#E2EAF4] hover:bg-[#F8F9FC]">
                  <td className="p-4 font-mono text-[#1B6CA8]">{q.quote_id}</td>
                  <td className="p-4 font-medium text-[#0D1B2A]">{q.company_name || q.user_id}</td>
                  <td className="p-4 text-[#64748B]">{Array.isArray(q.items) ? q.items.length : "—"} item(s)</td>
                  <td className="p-4 font-semibold text-[#0D1B2A]">
                    {q.budget_inr ? formatINR(Number(q.budget_inr)) : "—"}
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(q.status)}`}>
                      {q.status.replace("_", " ").replace(/\b\w/g, (l: string) => l.toUpperCase())}
                    </span>
                  </td>
                  <td className="p-4 text-[#64748B]">{new Date(q.created_at).toLocaleDateString("en-IN")}</td>
                  <td className="p-4">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="sm" variant="outline" className="border-[#E2EAF4]">
                          Update <ChevronDown className="w-3 h-3 ml-1" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        {STATUS_OPTIONS.filter((s) => s !== q.status).map((s) => (
                          <DropdownMenuItem key={s} onClick={() => changeStatus(q.quote_id, s)}>
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
