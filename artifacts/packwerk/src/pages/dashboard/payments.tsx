import { useGetDashboardInvoices, useGetDashboardProfile } from "@workspace/api-client-react";
import { Loader2, FileText, Lock } from "lucide-react";
import { formatINR, getStatusColor } from "@/lib/format";
import { Button } from "@/components/ui/button";

export default function DashboardPayments() {
  const { data: invoices, isLoading: invoicesLoading } = useGetDashboardInvoices();
  const { data: profile, isLoading: profileLoading } = useGetDashboardProfile();

  if (invoicesLoading || profileLoading) {
    return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-[#1B6CA8]" /></div>;
  }

  const creditOrders = profile?.orders_completed ?? 0;
  const creditEligible = profile?.credit_eligible ?? false;
  const creditLimit = profile?.credit_limit ?? 0;

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-[#0D1B2A]">Payments & Invoices</h1>

      {!invoices || invoices.length === 0 ? (
        <div className="text-center py-16 bg-[#F8F9FC] rounded-xl border border-[#E2EAF4]">
          <FileText className="w-12 h-12 text-[#E2EAF4] mx-auto mb-4" />
          <p className="text-[#64748B] font-medium">No invoices yet</p>
          <p className="text-sm text-[#64748B] mt-1">Invoices will appear here after your orders are confirmed.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-[#E2EAF4] bg-white">
          <table className="w-full text-sm">
            <thead className="bg-[#F8F9FC] border-b border-[#E2EAF4]">
              <tr>
                <th className="text-left p-4 font-semibold text-[#0D1B2A]">Invoice ID</th>
                <th className="text-left p-4 font-semibold text-[#0D1B2A]">Amount</th>
                <th className="text-left p-4 font-semibold text-[#0D1B2A]">Status</th>
                <th className="text-left p-4 font-semibold text-[#0D1B2A]">Due Date</th>
                <th className="text-left p-4 font-semibold text-[#0D1B2A]">PDF</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((invoice: any) => (
                <tr key={invoice.id} className="border-b border-[#E2EAF4] hover:bg-[#F8F9FC]">
                  <td className="p-4 font-mono font-medium text-[#1B6CA8]">{invoice.invoice_id}</td>
                  <td className="p-4 font-semibold text-[#0D1B2A]">{formatINR(Number(invoice.amount))}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(invoice.status)}`}>
                      {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                    </span>
                  </td>
                  <td className="p-4 text-[#64748B]">{invoice.due_date}</td>
                  <td className="p-4">
                    {invoice.pdf_url ? (
                      <a href={invoice.pdf_url} target="_blank" rel="noreferrer" className="text-[#1B6CA8] hover:underline text-sm">
                        Download
                      </a>
                    ) : (
                      <span className="text-[#64748B] text-sm">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="bg-[#F8F9FC] rounded-xl border border-[#E2EAF4] p-6">
        <h2 className="text-xl font-bold text-[#0D1B2A] mb-4">Credit Terms</h2>
        {creditEligible ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-sm font-semibold bg-[#22C55E] text-white">Credit Active</span>
            </div>
            <p className="text-[#64748B]">Net-30 credit terms are active on your account.</p>
            <p className="text-[#0D1B2A] font-semibold">Credit limit: {formatINR(Number(creditLimit))}</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Lock className="w-5 h-5 text-[#64748B]" />
              <p className="text-[#64748B]">
                Net-30 credit unlocks after 3 completed orders. You have completed {creditOrders} of 3 orders.
              </p>
            </div>
            <div className="w-full bg-[#E2EAF4] rounded-full h-2">
              <div
                className="bg-[#1B6CA8] rounded-full h-2 transition-all duration-500"
                style={{ width: `${Math.min((creditOrders / 3) * 100, 100)}%` }}
              />
            </div>
            <p className="text-sm text-[#64748B]">{creditOrders} of 3 orders completed</p>
          </div>
        )}
      </div>
    </div>
  );
}
