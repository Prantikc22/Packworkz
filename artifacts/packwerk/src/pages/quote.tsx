import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { useSubmitQuote } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ChevronRight, CheckCircle2 } from "lucide-react";
import { formatINR } from "@/lib/format";

export default function Quote({ params }: { params?: { step?: string, id?: string } }) {
  const step = params?.step ? parseInt(params.step) : params?.id ? 7 : 1;
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    contact_name: "",
    company_name: "",
    email: "",
    phone: "",
    delivery_country: "India",
    delivery_pincode: "",
    preferred_timeline: "standard",
    notes: "",
    items: [
      { product_id: "demo-id", product_name: "Premium Mailer Box", quantity: 5000, artwork_status: "ready", sample_requested: false, sample_tier: "standard" }
    ]
  });

  const submitQuoteMutation = useSubmitQuote();

  const handleNext = () => setLocation(`/quote/step/${step + 1}`);
  const handleBack = () => setLocation(`/quote/step/${step - 1}`);

  const handleSubmit = () => {
    submitQuoteMutation.mutate({ data: formData }, {
      onSuccess: (res) => {
        setLocation(`/quote/confirmed/${res.quote_id}`);
        toast({ title: "Quote Request Submitted", description: "We will get back to you within 24 hours." });
      },
      onError: () => {
        toast({ variant: "destructive", title: "Submission Failed", description: "Please try again or contact us on WhatsApp." });
      }
    });
  };

  if (params?.id) {
    return (
      <div className="container mx-auto px-4 py-24 max-w-3xl text-center">
        <div className="w-24 h-24 bg-success/10 text-success rounded-full flex items-center justify-center mx-auto mb-8">
          <CheckCircle2 className="w-12 h-12" />
        </div>
        <h1 className="text-4xl font-bold text-navy mb-4">Quote Requested Successfully</h1>
        <p className="text-xl text-muted mb-8">Your Quote ID is <strong className="text-navy">{params.id}</strong></p>
        <p className="text-muted mb-12">Our packaging experts are reviewing your requirements and will send a detailed quotation within 24-48 hours.</p>
        <div className="flex justify-center gap-4">
          <Link href="/dashboard"><Button className="bg-navy">Go to Dashboard</Button></Link>
          <Link href="/products"><Button variant="outline">Continue Browsing</Button></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="mb-12">
        <h1 className="text-3xl font-bold text-navy mb-6">Request a Quote</h1>
        <div className="flex justify-between relative">
          <div className="absolute top-1/2 left-0 w-full h-1 bg-border -z-10 -translate-y-1/2"></div>
          {[1, 2, 3, 4, 5, 6].map(s => (
            <div key={s} className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border-4 transition-colors ${step >= s ? 'bg-navy border-navy text-white' : 'bg-white border-border text-muted'}`}>
              {s}
            </div>
          ))}
        </div>
      </div>

      <Card className="border-border shadow-sm">
        <CardContent className="p-8">
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-navy">Contact Information</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Contact Name</Label>
                  <Input value={formData.contact_name} onChange={e => setFormData({...formData, contact_name: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Company Name</Label>
                  <Input value={formData.company_name} onChange={e => setFormData({...formData, company_name: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-navy">Selected Products</h2>
              <p className="text-muted">In a real flow, you would add products from the catalogue. We pre-filled one for demonstration.</p>
              <div className="border border-border p-4 rounded-xl flex justify-between items-center bg-surface">
                <div>
                  <div className="font-bold text-navy">{formData.items[0].product_name}</div>
                  <div className="text-sm text-muted">ID: {formData.items[0].product_id}</div>
                </div>
                <div className="flex items-center gap-4">
                  <Label>Quantity</Label>
                  <Input type="number" className="w-32" value={formData.items[0].quantity} onChange={e => {
                    const newItems = [...formData.items];
                    newItems[0].quantity = parseInt(e.target.value);
                    setFormData({...formData, items: newItems});
                  }} />
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-navy">Delivery Requirements</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Country</Label>
                  <Input value={formData.delivery_country} onChange={e => setFormData({...formData, delivery_country: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Pincode</Label>
                  <Input value={formData.delivery_pincode} onChange={e => setFormData({...formData, delivery_pincode: e.target.value})} />
                </div>
              </div>
              <div className="space-y-4 mt-6">
                <Label>Timeline Preference</Label>
                <RadioGroup value={formData.preferred_timeline} onValueChange={(v: any) => setFormData({...formData, preferred_timeline: v})}>
                  <div className="flex items-center space-x-2 border p-4 rounded-lg">
                    <RadioGroupItem value="urgent" id="urgent" />
                    <Label htmlFor="urgent" className="cursor-pointer font-bold">Urgent (Expedited shipping, higher cost)</Label>
                  </div>
                  <div className="flex items-center space-x-2 border p-4 rounded-lg">
                    <RadioGroupItem value="standard" id="standard" />
                    <Label htmlFor="standard" className="cursor-pointer font-bold">Standard</Label>
                  </div>
                  <div className="flex items-center space-x-2 border p-4 rounded-lg">
                    <RadioGroupItem value="flexible" id="flexible" />
                    <Label htmlFor="flexible" className="cursor-pointer font-bold">Flexible (Best pricing)</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-navy">Artwork Status</h2>
              <div className="space-y-4">
                <Label>For {formData.items[0].product_name}</Label>
                <RadioGroup value={formData.items[0].artwork_status} onValueChange={(v) => {
                  const newItems = [...formData.items];
                  newItems[0].artwork_status = v;
                  setFormData({...formData, items: newItems});
                }}>
                  <div className="flex items-center space-x-2 border p-4 rounded-lg">
                    <RadioGroupItem value="ready" id="ready" />
                    <Label htmlFor="ready" className="cursor-pointer font-bold">Ready to upload</Label>
                  </div>
                  <div className="flex items-center space-x-2 border p-4 rounded-lg">
                    <RadioGroupItem value="needs-design" id="needs-design" />
                    <Label htmlFor="needs-design" className="cursor-pointer font-bold">I need design services</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-navy">Sample Request</h2>
              <p className="text-muted">Do you want a physical sample before bulk production?</p>
              
              <div className="flex items-center space-x-4 mb-6">
                <Label className="font-bold">Request Sample for {formData.items[0].product_name}</Label>
                <input type="checkbox" checked={formData.items[0].sample_requested} onChange={(e) => {
                  const newItems = [...formData.items];
                  newItems[0].sample_requested = e.target.checked;
                  setFormData({...formData, items: newItems});
                }} className="w-5 h-5 rounded border-gray-300" />
              </div>

              {formData.items[0].sample_requested && (
                <RadioGroup value={formData.items[0].sample_tier} onValueChange={(v) => {
                  const newItems = [...formData.items];
                  newItems[0].sample_tier = v;
                  setFormData({...formData, items: newItems});
                }}>
                  <div className="flex items-center space-x-2 border p-4 rounded-lg">
                    <RadioGroupItem value="standard" id="samp-std" />
                    <Label htmlFor="samp-std" className="cursor-pointer font-bold">Standard Sample (₹2,999)</Label>
                  </div>
                  <div className="flex items-center space-x-2 border p-4 rounded-lg">
                    <RadioGroupItem value="premium" id="samp-prem" />
                    <Label htmlFor="samp-prem" className="cursor-pointer font-bold">Premium Sample (₹4,999)</Label>
                  </div>
                </RadioGroup>
              )}
            </div>
          )}

          {step === 6 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-navy">Review & Submit</h2>
              <div className="space-y-2">
                <Label>Additional Notes</Label>
                <Textarea value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} placeholder="Any special requirements..." className="h-32" />
              </div>
              <div className="bg-surface p-6 rounded-xl border border-border">
                <h3 className="font-bold text-navy mb-4">Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-muted">Company:</span> <span className="font-bold">{formData.company_name}</span></div>
                  <div className="flex justify-between"><span className="text-muted">Items:</span> <span className="font-bold">{formData.items.length} product(s)</span></div>
                  <div className="flex justify-between"><span className="text-muted">Timeline:</span> <span className="font-bold capitalize">{formData.preferred_timeline}</span></div>
                </div>
              </div>
            </div>
          )}

          <div className="mt-12 flex justify-between pt-6 border-t border-border">
            <Button variant="outline" onClick={handleBack} disabled={step === 1}>Back</Button>
            {step < 6 ? (
              <Button className="bg-navy text-white hover:bg-blue" onClick={handleNext}>Next <ChevronRight className="w-4 h-4 ml-2" /></Button>
            ) : (
              <Button className="bg-amber text-navy font-bold hover:bg-amber/90 px-8" onClick={handleSubmit} disabled={submitQuoteMutation.isPending}>
                {submitQuoteMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Submit Request
              </Button>
            )}
          </div>

        </CardContent>
      </Card>
    </div>
  );
}
