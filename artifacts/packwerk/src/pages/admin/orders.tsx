import { useState } from "react";
import { useAdminListOrders, useAdminUpdateOrderStatus } from "@workspace/api-client-react";
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

const ORDER_STATUSES = ["confirmed", "in_production", "qc", "dispatched", "delivered"];

export default function AdminOrders() {
  const [statusFilter, setStatusFilter] = useState("all");
  const { data: orders, isLoading, refetch } = useAdminListOrders({ status: statusFilter !== "all" ? statusFilter : undefined });
  const { mutate: updateOrder } = useAdminUpdateOrderStatus();
  const { toast } = useToast();

  const changeStatus = (orderId: string, status: string) => {
    updateOrder({ id: orderId, adminUpdateOrderStatusBody: { status } }, {
      onSuccess: () => {
        toast({ title: `Order updated to ${status}` });
        refetch();
      },
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#0D1B2A]">Orders</h1>
        <div className="flex gap-2 flex-wrap">
          {["all", ...ORDER_STATUSES].map((s) => (
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
      ) : !orders || orders.length === 0 ? (
        <div className="text-center py-16 bg-[#F8F9FC] rounded-xl border border-[#E2EAF4]">
          <p className="text-[#64748B]">No orders found.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-[#E2EAF4] bg-white">
          <table className="w-full text-sm">
            <thead className="bg-[#F8F9FC] border-b border-[#E2EAF4]">
              <tr>
                <th className="text-left p-4 font-semibold text-[#0D1B2A]">Order ID</th>
                <th className="text-left p-4 font-semibold text-[#0D1B2A]">User</th>
                <th className="text-left p-4 font-semibold text-[#0D1B2A]">Total</th>
                <th className="text-left p-4 font-semibold text-[#0D1B2A]">Payment</th>
                <th className="text-left p-4 font-semibold text-[#0D1B2A]">Status</th>
                <th className="text-left p-4 font-semibold text-[#0D1B2A]">Date</th>
                <th className="text-left p-4 font-semibold text-[#0D1B2A]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order: any) => (
                <tr key={order.id} className="border-b border-[#E2EAF4] hover:bg-[#F8F9FC]">
                  <td className="p-4 font-mono text-[#1B6CA8]">{order.order_id}</td>
                  <td className="p-4 text-[#64748B]">{order.user_id}</td>
                  <td className="p-4 font-semibold text-[#0D1B2A]">{formatINR(Number(order.total_price))}</td>
                  <td className="p-4 text-[#64748B] capitalize">{order.payment_type}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(order.status)}`}>
                      {order.status.replace("_", " ").replace(/\b\w/g, (l: string) => l.toUpperCase())}
                    </span>
                  </td>
                  <td className="p-4 text-[#64748B]">{new Date(order.created_at).toLocaleDateString("en-IN")}</td>
                  <td className="p-4">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="sm" variant="outline" className="border-[#E2EAF4]">
                          Update <ChevronDown className="w-3 h-3 ml-1" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        {ORDER_STATUSES.filter((s) => s !== order.status).map((s) => (
                          <DropdownMenuItem key={s} onClick={() => changeStatus(order.order_id, s)}>
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
