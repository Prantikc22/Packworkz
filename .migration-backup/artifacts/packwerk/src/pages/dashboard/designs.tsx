import { useGetDashboardDesigns } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Palette, ArrowRight } from "lucide-react";
import { getStatusColor } from "@/lib/format";
import { useLocation } from "wouter";

export default function DashboardDesigns() {
  const { data: designs, isLoading } = useGetDashboardDesigns();
  const [, navigate] = useLocation();

  if (isLoading) {
    return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-[#1B6CA8]" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-[#0D1B2A]">Design Requests</h1>
        <Button className="bg-[#E8A838] text-[#0D1B2A] font-semibold hover:bg-amber-400" onClick={() => navigate("/design")}>
          New Design Brief
        </Button>
      </div>

      {!designs || designs.length === 0 ? (
        <div className="text-center py-16 bg-[#F8F9FC] rounded-xl border border-[#E2EAF4]">
          <Palette className="w-12 h-12 text-[#E2EAF4] mx-auto mb-4" />
          <p className="text-[#64748B] font-medium">No design requests yet</p>
          <Button className="mt-4 bg-[#1B6CA8] text-white" onClick={() => navigate("/design")}>
            Start a design brief
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {designs.map((design: any) => (
            <Card key={design.id} className="border-[#E2EAF4] shadow-sm hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-base font-semibold text-[#0D1B2A]">{design.product_type}</CardTitle>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(design.status)}`}>
                    {design.status.replace("_", " ").replace(/\b\w/g, (l: string) => l.toUpperCase())}
                  </span>
                </div>
                <p className="text-xs font-mono text-[#64748B]">{design.design_id}</p>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm text-[#64748B]">
                  <div>{new Date(design.created_at).toLocaleDateString("en-IN")}</div>
                  {design.is_rush && <div className="text-[#E8A838] font-medium">Rush order</div>}
                </div>
                {design.designer_notes && (
                  <p className="text-sm text-[#0D1B2A] bg-[#F8F9FC] rounded p-2 border border-[#E2EAF4]">
                    {design.designer_notes}
                  </p>
                )}
                {design.status === "approved" && (
                  <Button
                    className="w-full bg-[#1B6CA8] text-white"
                    onClick={() => navigate(`/quote?product_id=${design.product_id}`)}
                  >
                    Order Production <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
