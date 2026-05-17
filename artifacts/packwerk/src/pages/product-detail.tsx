import { useState } from "react";
import { Link } from "wouter";
import { useGetProduct } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatINR } from "@/lib/format";
import { Loader2, ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ProductDetail({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const { data: product, isLoading } = useGetProduct(slug, { query: { enabled: !!slug, queryKey: ['/api/products', slug] }});
  const [quantity, setQuantity] = useState<number>(0);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-blue" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <h2 className="text-2xl font-bold text-navy mb-4">Product Not Found</h2>
        <Link href="/products"><Button>Back to Catalogue</Button></Link>
      </div>
    );
  }

  const currentQty = quantity || product.moq;
  const estimatedMin = product.price_min * currentQty;
  const estimatedMax = product.price_max * currentQty;
  const upfrontSaving = estimatedMin * 0.03;

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <Link href="/products">
        <a className="inline-flex items-center text-sm font-medium text-muted hover:text-navy mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Products
        </a>
      </Link>

      <div className="grid lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-8">
          <div className="aspect-[4/3] bg-surface rounded-3xl overflow-hidden border border-border relative">
            {product.image_url ? (
              <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted">No Image Available</div>
            )}
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              {product.is_smartstock && <Badge className="bg-amber text-navy font-bold">SmartStock</Badge>}
              {product.is_eco && <Badge className="bg-success text-white font-bold">Eco Friendly</Badge>}
            </div>
          </div>

          <div>
            <div className="text-sm font-semibold text-blue uppercase tracking-wider mb-2">{product.category}</div>
            <h1 className="text-3xl md:text-4xl font-bold text-navy mb-4">{product.name}</h1>
            <p className="text-lg text-muted">{product.use_case}</p>
          </div>

          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="w-full border-b border-border rounded-none bg-transparent p-0 justify-start h-auto">
              <TabsTrigger value="overview" className="rounded-none border-b-2 border-transparent data-[state=active]:border-navy data-[state=active]:bg-transparent px-6 py-3 font-semibold">Overview</TabsTrigger>
              <TabsTrigger value="specs" className="rounded-none border-b-2 border-transparent data-[state=active]:border-navy data-[state=active]:bg-transparent px-6 py-3 font-semibold">Specifications</TabsTrigger>
              <TabsTrigger value="compliance" className="rounded-none border-b-2 border-transparent data-[state=active]:border-navy data-[state=active]:bg-transparent px-6 py-3 font-semibold">Compliance</TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="py-6">
              <p className="text-muted leading-relaxed">{product.description}</p>
            </TabsContent>
            <TabsContent value="specs" className="py-6">
              <div className="bg-surface rounded-xl p-6 border border-border">
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-6">
                  {Object.entries(product.specs || {}).map(([k, v]) => (
                    <div key={k}>
                      <dt className="text-sm font-medium text-muted capitalize">{k.replace(/_/g, ' ')}</dt>
                      <dd className="mt-1 font-semibold text-navy">{String(v)}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </TabsContent>
            <TabsContent value="compliance" className="py-6">
              <div className="flex flex-wrap gap-3">
                {product.compliance_certs?.map(cert => (
                  <Badge key={cert} variant="outline" className="text-sm px-4 py-2 bg-white">{cert}</Badge>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-24 bg-white border border-border rounded-3xl p-6 shadow-sm">
            <div className="mb-6">
              <div className="text-sm text-muted mb-1">Estimated Price Range</div>
              <div className="text-3xl font-bold text-navy">
                {formatINR(product.price_min)} - {formatINR(product.price_max)}
                <span className="text-sm font-normal text-muted ml-1">/ {product.moq_unit}</span>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <Label className="font-semibold text-navy mb-2 block">Quantity (Min {product.moq})</Label>
                <Input 
                  type="number" 
                  min={product.moq} 
                  value={currentQty} 
                  onChange={e => setQuantity(parseInt(e.target.value) || product.moq)}
                  className="h-12"
                />
              </div>

              <div className="bg-surface p-4 rounded-xl space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted">Estimated Total</span>
                  <span className="font-bold text-navy">{formatINR(estimatedMin)} - {formatINR(estimatedMax)}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted">Upfront Payment Saving (3%)</span>
                  <span className="font-bold text-success">~{formatINR(upfrontSaving)}</span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm border-t border-border pt-4">
                  <span className="text-muted">Delivery (India)</span>
                  <span className="font-semibold text-navy">{product.delivery_days_india} Days</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted">Delivery (Global)</span>
                  <span className="font-semibold text-navy">{product.delivery_days_global} Days</span>
                </div>
              </div>

              <div className="pt-6 space-y-3 border-t border-border">
                <Link href={`/quote?sku=${(product.specs as any)?.code || product.slug}&qty=${currentQty}`}>
                  <Button className="w-full h-12 bg-amber text-navy hover:bg-amber/90 font-bold text-lg">
                    Add to Quote
                  </Button>
                </Link>
                {product.sample_tier !== 'not_required' && (
                  <Link href={`/samples?product=${product.id}`}>
                    <Button variant="outline" className="w-full h-12">
                      Get Sample ({formatINR(product.sample_price)})
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
