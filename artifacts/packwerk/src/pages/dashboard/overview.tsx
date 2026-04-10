import { useGetDashboardOverview } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatINR, getStatusColor } from "@/lib/format";
import { Package, TrendingUp, Calendar, CreditCard, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function DashboardOverview() {
  const { data, isLoading } = useGetDashboardOverview();

  if (isLoading) {
    return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-blue" /></div>;
  }

  if (!data) return null;

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-navy">Dashboard Overview</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted">Active Orders</CardTitle>
            <Package className="w-4 h-4 text-blue" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-navy">{data.active_orders}</div>
          </CardContent>
        </Card>
        <Card className="border-border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted">Total Saved</CardTitle>
            <TrendingUp className="w-4 h-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-navy">{formatINR(data.total_saved)}</div>
          </CardContent>
        </Card>
        <Card className="border-border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted">Last Order Date</CardTitle>
            <Calendar className="w-4 h-4 text-amber" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-navy">{data.last_order_date ? new Date(data.last_order_date).toLocaleDateString() : 'N/A'}</div>
          </CardContent>
        </Card>
        <Card className="border-border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted">Credit Status</CardTitle>
            <CreditCard className="w-4 h-4 text-blue" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-navy">
              {data.credit_eligible ? `${formatINR(data.credit_limit)} Limit` : 'Ineligible'}
            </div>
          </CardContent>
        </Card>
      </div>

      <h2 className="text-2xl font-bold text-navy mt-12 mb-4">Recent Orders</h2>
      <div className="bg-white border border-border rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-surface border-b border-border">
              <tr>
                <th className="p-4 font-semibold text-muted text-sm uppercase tracking-wider">Order ID</th>
                <th className="p-4 font-semibold text-muted text-sm uppercase tracking-wider">Date</th>
                <th className="p-4 font-semibold text-muted text-sm uppercase tracking-wider">Status</th>
                <th className="p-4 font-semibold text-muted text-sm uppercase tracking-wider">Total</th>
                <th className="p-4 font-semibold text-muted text-sm uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data.recent_orders.length === 0 ? (
                <tr><td colSpan={5} className="p-8 text-center text-muted">No recent orders.</td></tr>
              ) : (
                data.recent_orders.map(order => (
                  <tr key={order.id} className="hover:bg-surface/50 transition-colors">
                    <td className="p-4 font-medium text-navy">{order.order_id}</td>
                    <td className="p-4 text-muted">{new Date(order.created_at).toLocaleDateString()}</td>
                    <td className="p-4">
                      <Badge className={`${getStatusColor(order.status)} border-none capitalize`}>{order.status.replace('_', ' ')}</Badge>
                    </td>
                    <td className="p-4 font-semibold text-navy">{formatINR(order.total_price)}</td>
                    <td className="p-4 text-right">
                      <Button variant="outline" size="sm">Reorder</Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
