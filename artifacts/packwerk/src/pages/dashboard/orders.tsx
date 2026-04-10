import { useState } from "react";
import { useGetDashboardOrders } from "@workspace/api-client-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Loader2, Package, ExternalLink, RotateCcw, Download } from "lucide-react";
import { formatINR, getStatusColor } from "@/lib/format";
import { useLocation } from "wouter";

const STATUS_TABS = ["all", "confirmed", "in_production", "qc", "dispatched", "delivered"];

export default function DashboardOrders() {
  const [activeStatus, setActiveStatus] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [, navigate] = useLocation();

  const { data: orders, isLoading } = useGetDashboardOrders(
    activeStatus !== "all" ? { status: activeStatus } : {},
  );

  if (isLoading) {
    return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-[#1B6CA8]" /></div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-[#0D1B2A]">My Orders</h1>

      <div className="flex gap-2 flex-wrap">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveStatus(tab)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              activeStatus === tab
                ? "bg-[#1B6CA8] text-white"
                : "bg-[#F8F9FC] text-[#64748B] border border-[#E2EAF4] hover:bg-[#E2EAF4]"
            }`}
          >
            {tab === "all" ? "All" : tab.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
          </button>
        ))}
      </div>

      {!orders || orders.length === 0 ? (
        <div className="text-center py-16 bg-[#F8F9FC] rounded-xl border border-[#E2EAF4]">
          <Package className="w-12 h-12 text-[#E2EAF4] mx-auto mb-4" />
          <p className="text-[#64748B] font-medium">No orders found</p>
          <Button className="mt-4 bg-[#1B6CA8] text-white" onClick={() => navigate("/quote")}>
            Place your first order
          </Button>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-[#E2EAF4] bg-white">
          <table className="w-full text-sm">
            <thead className="bg-[#F8F9FC] border-b border-[#E2EAF4]">
              <tr>
                <th className="text-left p-4 font-semibold text-[#0D1B2A]">Order ID</th>
                <th className="text-left p-4 font-semibold text-[#0D1B2A]">Items</th>
                <th className="text-left p-4 font-semibold text-[#0D1B2A]">Total</th>
                <th className="text-left p-4 font-semibold text-[#0D1B2A]">Status</th>
                <th className="text-left p-4 font-semibold text-[#0D1B2A]">Date</th>
                <th className="text-left p-4 font-semibold text-[#0D1B2A]">Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order: any) => (
                <tr
                  key={order.id}
                  className="border-b border-[#E2EAF4] hover:bg-[#F8F9FC] cursor-pointer"
                  onClick={() => setSelectedOrder(order)}
                >
                  <td className="p-4 font-mono font-medium text-[#1B6CA8]">{order.order_id}</td>
                  <td className="p-4 text-[#64748B]">
                    {Array.isArray(order.items) ? order.items.length : 1} item(s)
                  </td>
                  <td className="p-4 font-semibold text-[#0D1B2A]">{formatINR(Number(order.total_price))}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(order.status)}`}>
                      {order.status.replace("_", " ").replace(/\b\w/g, (l: string) => l.toUpperCase())}
                    </span>
                  </td>
                  <td className="p-4 text-[#64748B]">{new Date(order.created_at).toLocaleDateString("en-IN")}</td>
                  <td className="p-4">
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-[#E2EAF4] text-[#1B6CA8]"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/quote?reorder=${order.id}`);
                      }}
                    >
                      <RotateCcw className="w-3 h-3 mr-1" /> Reorder
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Sheet open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          {selectedOrder && (
            <>
              <SheetHeader>
                <SheetTitle className="text-[#0D1B2A]">Order {selectedOrder.order_id}</SheetTitle>
              </SheetHeader>
              <div className="mt-6 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-[#64748B]">Status</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedOrder.status)}`}>
                    {selectedOrder.status.replace("_", " ").replace(/\b\w/g, (l: string) => l.toUpperCase())}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Total</span>
                  <span className="font-bold text-[#0D1B2A]">{formatINR(Number(selectedOrder.total_price))}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Payment Type</span>
                  <span className="font-medium text-[#0D1B2A] capitalize">{selectedOrder.payment_type}</span>
                </div>
                {selectedOrder.discount_applied > 0 && (
                  <div className="flex justify-between">
                    <span className="text-[#64748B]">Discount Applied</span>
                    <span className="font-medium text-[#22C55E]">-{formatINR(Number(selectedOrder.discount_applied))}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Date</span>
                  <span className="font-medium text-[#0D1B2A]">{new Date(selectedOrder.created_at).toLocaleDateString("en-IN")}</span>
                </div>
                {selectedOrder.estimated_delivery && (
                  <div className="flex justify-between">
                    <span className="text-[#64748B]">Estimated Delivery</span>
                    <span className="font-medium text-[#0D1B2A]">{selectedOrder.estimated_delivery}</span>
                  </div>
                )}
                {selectedOrder.tracking_url && (
                  <a
                    href={selectedOrder.tracking_url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 text-[#1B6CA8] hover:underline"
                  >
                    <ExternalLink className="w-4 h-4" /> Track shipment
                  </a>
                )}
                <div className="pt-4 space-y-2">
                  <Button
                    className="w-full bg-[#1B6CA8] text-white"
                    onClick={() => navigate(`/quote?reorder=${selectedOrder.id}`)}
                  >
                    <RotateCcw className="w-4 h-4 mr-2" /> Reorder
                  </Button>
                  <Button variant="outline" className="w-full border-[#E2EAF4]">
                    <Download className="w-4 h-4 mr-2" /> Download Invoice
                  </Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
