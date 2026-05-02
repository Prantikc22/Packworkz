import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ShieldCheck } from "lucide-react";
import { setExtraHeader } from "@workspace/api-client-react";

export default function AdminLogin() {
  const [key, setKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/admin/verify-key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key }),
      });
      if (!res.ok) {
        throw new Error("Invalid key");
      }
      localStorage.setItem("packwerk_admin_key", key);
      setExtraHeader("x-admin-key", key);
      setLocation("/admin/quotes");
    } catch {
      toast({
        variant: "destructive",
        title: "Access Denied",
        description: "Invalid admin key. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8F9FC] px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[#0D1B2A] mb-4">
            <ShieldCheck className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-[#0D1B2A] tracking-tight mb-1">Admin Access</h1>
          <p className="text-[#64748B] text-sm">Enter your admin key to continue</p>
        </div>

        <Card className="border-[#E2EAF4] shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Packworkz Admin</CardTitle>
            <CardDescription>Restricted area — authorised personnel only.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="admin-key">Admin Key</Label>
                <Input
                  id="admin-key"
                  type="password"
                  required
                  value={key}
                  onChange={(e) => setKey(e.target.value)}
                  placeholder="Enter admin key"
                  className="h-12 bg-white"
                />
              </div>
              <Button
                type="submit"
                className="w-full h-12 bg-[#0D1B2A] text-white hover:bg-[#1E3A5F] font-bold text-base"
                disabled={loading}
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                Sign In
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
