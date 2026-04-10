import { useState, useEffect } from "react";
import { useGetDashboardProfile, useUpdateDashboardProfile } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function DashboardProfile() {
  const { data: profile, isLoading } = useGetDashboardProfile();
  const { mutate: updateProfile, isPending } = useUpdateDashboardProfile();
  const { toast } = useToast();

  const [form, setForm] = useState({
    company_name: "",
    contact_name: "",
    phone: "",
    gstin: "",
    address_line1: "",
    city: "",
    state: "",
    pincode: "",
  });

  useEffect(() => {
    if (profile) {
      setForm({
        company_name: profile.company_name ?? "",
        contact_name: profile.contact_name ?? "",
        phone: profile.phone ?? "",
        gstin: profile.gstin ?? "",
        address_line1: (profile.default_address as any)?.address_line1 ?? "",
        city: (profile.default_address as any)?.city ?? "",
        state: (profile.default_address as any)?.state ?? "",
        pincode: (profile.default_address as any)?.pincode ?? "",
      });
    }
  }, [profile]);

  const handleSave = () => {
    updateProfile({
      data: {
        company_name: form.company_name,
        contact_name: form.contact_name,
        phone: form.phone,
        gstin: form.gstin,
        default_address: {
          address_line1: form.address_line1,
          city: form.city,
          state: form.state,
          pincode: form.pincode,
        },
      },
    }, {
      onSuccess: () => {
        toast({ title: "Profile updated successfully", duration: 3000 });
      },
      onError: () => {
        toast({ title: "Failed to update profile. Please try again.", variant: "destructive", duration: 5000 });
      },
    });
  };

  if (isLoading) {
    return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-[#1B6CA8]" /></div>;
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-3xl font-bold text-[#0D1B2A]">My Profile</h1>

      <Card className="border-[#E2EAF4] shadow-sm">
        <CardHeader>
          <CardTitle className="text-[#0D1B2A]">Company Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-[#64748B] text-sm">Email (read-only)</Label>
            <Input value={profile?.email ?? ""} disabled className="bg-[#F8F9FC] text-[#64748B] mt-1" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="text-[#64748B] text-sm">Company Name</Label>
              <Input
                value={form.company_name}
                onChange={(e) => setForm({ ...form, company_name: e.target.value })}
                className="mt-1 border-[#E2EAF4] focus:border-[#1B6CA8]"
              />
            </div>
            <div>
              <Label className="text-[#64748B] text-sm">Contact Name</Label>
              <Input
                value={form.contact_name}
                onChange={(e) => setForm({ ...form, contact_name: e.target.value })}
                className="mt-1 border-[#E2EAF4] focus:border-[#1B6CA8]"
              />
            </div>
            <div>
              <Label className="text-[#64748B] text-sm">Phone</Label>
              <Input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="mt-1 border-[#E2EAF4] focus:border-[#1B6CA8]"
              />
            </div>
            <div>
              <Label className="text-[#64748B] text-sm">GSTIN</Label>
              <Input
                value={form.gstin}
                onChange={(e) => setForm({ ...form, gstin: e.target.value })}
                placeholder="22AAAAA0000A1Z5"
                className="mt-1 border-[#E2EAF4] focus:border-[#1B6CA8]"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-[#E2EAF4] shadow-sm">
        <CardHeader>
          <CardTitle className="text-[#0D1B2A]">Default Delivery Address</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-[#64748B] text-sm">Address Line 1</Label>
            <Input
              value={form.address_line1}
              onChange={(e) => setForm({ ...form, address_line1: e.target.value })}
              className="mt-1 border-[#E2EAF4] focus:border-[#1B6CA8]"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <Label className="text-[#64748B] text-sm">City</Label>
              <Input
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                className="mt-1 border-[#E2EAF4] focus:border-[#1B6CA8]"
              />
            </div>
            <div>
              <Label className="text-[#64748B] text-sm">State</Label>
              <Input
                value={form.state}
                onChange={(e) => setForm({ ...form, state: e.target.value })}
                className="mt-1 border-[#E2EAF4] focus:border-[#1B6CA8]"
              />
            </div>
            <div>
              <Label className="text-[#64748B] text-sm">Pincode</Label>
              <Input
                value={form.pincode}
                onChange={(e) => setForm({ ...form, pincode: e.target.value })}
                className="mt-1 border-[#E2EAF4] focus:border-[#1B6CA8]"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Button
        onClick={handleSave}
        disabled={isPending}
        className="bg-[#1B6CA8] text-white hover:bg-blue-700 px-8"
      >
        {isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-2" />}
        Save Changes
      </Button>
    </div>
  );
}
