import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { useCreateDesignRequest } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ChevronRight, CheckCircle2 } from "lucide-react";
import { formatINR } from "@/lib/format";

export default function Design() {
  const [step, setStep] = useState(1);
  const [designId, setDesignId] = useState<string | null>(null);
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    contact_name: "",
    email: "",
    phone: "",
    product_type: "Flexible Pouch",
    brand_colors: "",
    brand_description: "",
    logo_url: "",
    notes: "",
    is_rush: false,
  });

  const createDesignMutation = useCreateDesignRequest();

  const handleNext = () => setStep(s => s + 1);
  const handleBack = () => setStep(s => s - 1);

  const amount = formData.is_rush ? 3499 : 1999;

  const handlePayment = () => {
    // Simulate payment
    setTimeout(() => {
      createDesignMutation.mutate({
        data: {
          ...formData,
          amount_paid: amount,
          razorpay_payment_id: "pay_" + Math.random().toString(36).substring(7)
        }
      }, {
        onSuccess: (res) => {
          setDesignId(res.design_id);
          setStep(4);
        },
        onError: () => {
          toast({ variant: "destructive", title: "Error", description: "Failed to submit request" });
        }
      });
    }, 1500);
  };

  if (step === 4 && designId) {
    return (
      <div className="container mx-auto px-4 py-24 max-w-3xl text-center">
        <div className="w-24 h-24 bg-success/10 text-success rounded-full flex items-center justify-center mx-auto mb-8">
          <CheckCircle2 className="w-12 h-12" />
        </div>
        <h1 className="text-4xl font-bold text-navy mb-4">Design Request Confirmed</h1>
        <p className="text-xl text-muted mb-8">Your Design ID is <strong className="text-navy">{designId}</strong></p>
        <p className="text-muted mb-12">Our packaging designers will review your brief and share the first concept within {formData.is_rush ? '24' : '72'} hours.</p>
        <Link href="/dashboard/designs"><Button className="bg-navy">View in Dashboard</Button></Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-navy mb-4">Professional Packaging Design</h1>
        <p className="text-xl text-muted">Get production-ready artwork from experts who understand printing.</p>
      </div>

      <div className="flex justify-between relative mb-12 max-w-lg mx-auto">
        <div className="absolute top-1/2 left-0 w-full h-1 bg-border -z-10 -translate-y-1/2"></div>
        {[1, 2, 3].map(s => (
          <div key={s} className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border-4 transition-colors ${step >= s ? 'bg-navy border-navy text-white' : 'bg-white border-border text-muted'}`}>
            {s}
          </div>
        ))}
      </div>

      <Card className="border-border shadow-sm">
        <CardContent className="p-8">
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-navy">Contact & Product</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input value={formData.contact_name} onChange={e => setFormData({...formData, contact_name: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Email</Label>
                  <Input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                </div>
              </div>
              <div className="space-y-2 mt-6">
                <Label>What product needs design?</Label>
                <Input placeholder="e.g. 250g Coffee Pouch" value={formData.product_type} onChange={e => setFormData({...formData, product_type: e.target.value})} />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-navy">Brand Brief</h2>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Brand Colors (Hex codes)</Label>
                  <Input placeholder="#000000, #FFFFFF" value={formData.brand_colors} onChange={e => setFormData({...formData, brand_colors: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Logo URL</Label>
                  <Input placeholder="https://drive.google.com/..." value={formData.logo_url} onChange={e => setFormData({...formData, logo_url: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Describe your brand in 3 words</Label>
                  <Input placeholder="e.g. Premium, Organic, Minimalist" value={formData.brand_description} onChange={e => setFormData({...formData, brand_description: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Additional Notes</Label>
                  <Textarea placeholder="Any specific requirements or inspirations..." value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} className="h-32" />
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-navy">Checkout</h2>
              
              <div className="bg-surface p-6 rounded-xl border border-border mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="font-bold text-navy text-lg">Standard Design</div>
                    <div className="text-muted text-sm">First concept in 72 hours</div>
                  </div>
                  <div className="text-xl font-bold">{formatINR(1999)}</div>
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <Label htmlFor="rush" className="flex flex-col gap-1 cursor-pointer">
                    <span className="font-bold text-amber">Rush Delivery Add-on</span>
                    <span className="text-xs text-muted">First concept in 24 hours</span>
                  </Label>
                  <div className="flex items-center gap-4">
                    <span className="font-bold text-navy">+{formatINR(1500)}</span>
                    <Switch id="rush" checked={formData.is_rush} onCheckedChange={c => setFormData({...formData, is_rush: c})} />
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between items-center text-xl font-bold text-navy pb-6 border-b border-border">
                <span>Total to Pay</span>
                <span>{formatINR(amount)}</span>
              </div>
              
              <Button className="w-full h-14 bg-navy text-white hover:bg-blue font-bold text-lg" onClick={handlePayment} disabled={createDesignMutation.isPending}>
                {createDesignMutation.isPending ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : null}
                Pay Securely with Razorpay
              </Button>
              <p className="text-center text-sm text-muted">This is a simulated payment for demo purposes.</p>
            </div>
          )}

          {step < 3 && (
            <div className="mt-8 flex justify-between pt-6 border-t border-border">
              <Button variant="outline" onClick={handleBack} disabled={step === 1}>Back</Button>
              <Button className="bg-navy text-white hover:bg-blue" onClick={handleNext}>Next <ChevronRight className="w-4 h-4 ml-2" /></Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
