import { useState } from "react";
import { Link, Redirect } from "wouter";
import { calculateOrderEstimate } from "@/lib/pricing";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatINR } from "@/lib/format";
import { ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getCategoryBySlug } from "@/lib/skus";
import { CATALOG_SKUS, getCatalogImage, getConfigureHref, requiresQuote } from "@/lib/catalog";
import {
  COMMERCE_PRODUCTS,
  LAUNCH_PROMOTION_CODE,
  LAUNCH_PROMOTION_RATE,
  formatMeasurementInCm,
} from "@workspace/commerce";

const LEGACY_SLUG_ALIASES: Record<string, string> = {
  "hdpe-bottle": "plastic-bottle",
  "mono-carton": "folding-carton",
  "corrugated-box": "corrugated-shipping-box",
  "poly-mailer": "courier-bag",
  "kraft-mailer": "mailer-box",
  "compostable-mailer": "compostable-packaging",
  "shrink-sleeve": "labels",
  "paper-labels-stickers": "round-paper-labels",
  "folding-carton": "straight-tuck-end-carton",
  "rigid-box": "two-piece-rigid-box",
  "paper-cup": "paper-bowls-food-containers",
};

const LEGACY_CATEGORY_SLUGS = new Set([
  "flexible",
  "bottles",
  "tubes",
  "boxes",
  "ecommerce",
  "protective",
  "rolls",
  "labels",
  "sustainable",
]);

export default function ProductDetail({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const canonicalSlug = LEGACY_SLUG_ALIASES[slug] || slug;
  const product = CATALOG_SKUS.find((sku) => sku.slug === canonicalSlug);
  const [quantity, setQuantity] = useState<number>(0);

  if (LEGACY_CATEGORY_SLUGS.has(slug)) {
    return <Redirect to={`/products?category=${slug}`} replace />;
  }

  if (canonicalSlug !== slug) {
    return <Redirect to={`/products/${canonicalSlug}`} replace />;
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
  const commerceProduct = COMMERCE_PRODUCTS[product.code];
  const defaultSize = commerceProduct?.sizes[0];
  const defaultConfiguration = Object.fromEntries(product.variants.map((variant) => [variant.key, variant.options[0]]));
  const estimate = calculateOrderEstimate(product, currentQty, "standard", "upload", defaultSize?.code, defaultConfiguration);
  const estimatedMin = estimate.low;
  const estimatedMax = estimate.high;
  const launchUnit = currentQty > 0 ? ((estimate.material || 0) - (estimate.discount || 0)) / currentQty : estimate.unit;
  const productImage = getCatalogImage(product);
  const category = getCategoryBySlug(product.category);
  const complianceCerts = product.is_eco ? ["FSC", "EPR-ready"] : ["ISO", "BRC-ready"];
  const quoteRequired = requiresQuote(product, currentQty);
  const configureHref = `${getConfigureHref(product, currentQty)}&qty=${currentQty}`;

  return (
    <div className="container mx-auto px-4 pt-[124px] pb-8 max-w-7xl">
      <Link href="/products" className="inline-flex items-center text-sm font-medium text-muted hover:text-navy mb-8 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Products
      </Link>

      <div className="grid lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-8">
          <div className="aspect-[4/3] bg-surface overflow-hidden border border-border relative">
            {productImage ? (
              <img src={productImage} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted">No Image Available</div>
            )}
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              <Badge className={product.publicBuyingPath === "instant" ? "bg-amber text-navy font-bold" : "bg-blue text-white font-bold"}>
                {product.publicBuyingPath === "instant" ? "Instant buy" : "Request quote"}
              </Badge>
              <Badge className="bg-navy text-white font-bold">Custom printed</Badge>
              {product.is_smartstock && <Badge className="bg-amber text-navy font-bold">SmartStock</Badge>}
              {product.is_eco && <Badge className="bg-success text-white font-bold">Eco Friendly</Badge>}
            </div>
          </div>

          <div>
            <div className="text-sm font-semibold text-blue uppercase tracking-wider mb-2">{category?.label || product.category}</div>
            <h1 className="text-3xl md:text-4xl font-bold text-navy mb-4">{product.name}</h1>
            <p className="text-lg text-muted">{product.use_case}</p>
            <div className="mt-5 grid sm:grid-cols-3 gap-3">
              {[
                ["01", "SKU selected", product.code],
                ["02", "Configure specs", "Size, finish, artwork"],
                ["03", quoteRequired ? "Managed quote" : "Place order", quoteRequired ? "Technical, capacity and supplier validation" : "Checkout-ready specification"],
              ].map(([step, title, body]) => (
                <div key={step} className="rounded border border-slate-200 bg-white p-3">
                  <p className="text-[11px] font-black text-blue">{step}</p>
                  <p className="text-sm font-bold text-navy">{title}</p>
                  <p className="text-xs text-muted">{body}</p>
                </div>
              ))}
            </div>
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
                  <div>
                    <dt className="text-sm font-medium text-muted">SKU Code</dt>
                    <dd className="mt-1 font-semibold text-navy">{product.code}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-muted">MOQ</dt>
                    <dd className="mt-1 font-semibold text-navy">{product.moq.toLocaleString("en-IN")} {product.moq_unit}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-muted">Sample Tier</dt>
                    <dd className="mt-1 font-semibold text-navy capitalize">{product.sample_tier}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-muted">Delivery India</dt>
                    <dd className="mt-1 font-semibold text-navy">{product.delivery_days_india} Days</dd>
                  </div>
                  {product.variants.map((variant) => (
                    <div key={variant.key}>
                      <dt className="text-sm font-medium text-muted">{variant.label}</dt>
                      <dd className="mt-1 font-semibold text-navy">{variant.options.join(", ")}</dd>
                    </div>
                  ))}
                  {commerceProduct && (
                    <div className="sm:col-span-2">
                      <dt className="text-sm font-medium text-muted">Pre-configured production sizes</dt>
                      <dd className="mt-1 font-semibold text-navy">
                        {commerceProduct.sizes.map((size) => `${formatMeasurementInCm(size.label)}${size.detail ? ` (${formatMeasurementInCm(size.detail)})` : ""}`).join(" · ")}
                      </dd>
                    </div>
                  )}
                </dl>
              </div>
            </TabsContent>
            <TabsContent value="compliance" className="py-6">
              <div className="flex flex-wrap gap-3">
                {complianceCerts.map(cert => (
                  <Badge key={cert} variant="outline" className="text-sm px-4 py-2 bg-white">{cert}</Badge>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-24 bg-white border border-border p-6 shadow-sm">
            <div className="mb-6">
              <div className="text-sm text-muted mb-1">{product.publicBuyingPath === "quote" ? "Indicative production range" : "Launch checkout rate"}</div>
              <div className="text-3xl font-bold text-navy">
                {product.publicBuyingPath === "quote" ? `${formatINR(product.price_min)} - ${formatINR(product.price_max)}` : `from ${formatINR(launchUnit)}`}
                <span className="text-sm font-normal text-muted ml-1">/ {product.moq_unit.replace(/s$/, "")}</span>
              </div>
              {product.publicBuyingPath === "instant" && <p className="mt-2 text-xs text-slate-500">For the smallest listed size and selected quantity, before GST. Delivery is shown separately at checkout.</p>}
            </div>

            <div className="space-y-6">
              <div>
                <Label htmlFor="product-quantity" className="font-semibold text-navy mb-2 block">Quantity (Min {product.moq})</Label>
                <Input 
                  id="product-quantity"
                  type="number" 
                  min={product.moq} 
                  value={currentQty} 
                  onChange={e => setQuantity(parseInt(e.target.value) || product.moq)}
                  className="h-12"
                />
              </div>

              {product.quote_threshold && currentQty >= product.quote_threshold && product.publicBuyingPath === "instant" && (
                <div className="border border-amber-300 bg-amber-50 p-4 text-sm text-navy">
                  <p className="font-black">Enterprise quantity detected</p>
                  <p className="mt-1 text-xs text-slate-600">At {product.quote_threshold.toLocaleString("en-IN")}+ units we check production capacity, freight and a sharper bulk rate before confirming.</p>
                </div>
              )}

              {product.price_tiers && product.price_tiers.length > 0 && (
                <div className="border-y border-border py-4">
                  <p className="text-xs font-black uppercase tracking-wider text-muted mb-3">Quantity pricing</p>
                  <div className="grid gap-2">
                    {product.price_tiers.map((tier) => {
                      const tierEstimate = calculateOrderEstimate(product, tier.min_qty, "standard", "upload", defaultSize?.code, defaultConfiguration);
                      const tierLaunchUnit = tier.min_qty > 0
                        ? ((tierEstimate.material || 0) - (tierEstimate.discount || 0)) / tier.min_qty
                        : tier.unit_price * (1 - LAUNCH_PROMOTION_RATE);
                      return (
                        <button key={tier.min_qty} type="button" onClick={() => setQuantity(tier.min_qty)} className="flex items-center justify-between text-sm border border-slate-200 px-3 py-2 hover:border-blue transition-colors">
                          <span className="font-semibold text-navy">{tier.min_qty.toLocaleString("en-IN")}+</span>
                          <span className="text-right">
                            <span className="block font-black text-navy">{formatINR(tierLaunchUnit)} / unit</span>
                            {product.publicBuyingPath === "instant" && <span className="block text-[10px] text-slate-400 line-through">{formatINR(tierEstimate.unit)} list</span>}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-[11px] text-muted mt-3">Smallest listed size, standard configuration, ex-GST. Finish, closure, printing and size update the price before checkout.</p>
                </div>
              )}

              <div className="bg-surface p-4 rounded-xl space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted">Estimated Total</span>
                  <span className="font-bold text-navy">{formatINR(estimatedMin)} - {formatINR(estimatedMax)}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted">Launch unit rate</span>
                  <span className="font-bold text-success">~{formatINR(launchUnit)} / unit</span>
                </div>
                {(estimate.discount || 0) > 0 && (
                  <div className="flex justify-between items-center text-sm border-t border-emerald-200 pt-3">
                    <span className="font-semibold text-emerald-700">{LAUNCH_PROMOTION_CODE} saving</span>
                    <span className="font-black text-emerald-700">-{formatINR(estimate.discount)}</span>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm border-t border-border pt-4">
                  <span className="text-muted">Delivery (India)</span>
                  <span className="font-semibold text-navy">{product.delivery_days_india} Days</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted">Delivery (Global)</span>
                  <span className="font-semibold text-navy">{product.delivery_days_india + 14} Days</span>
                </div>
              </div>

              <div className="pt-6 space-y-3 border-t border-border">
                <Link href={configureHref}>
                  <Button className="w-full h-12 bg-amber text-navy hover:bg-amber/90 font-bold text-lg">
                    {quoteRequired ? "Request Managed Quote" : "Choose options & checkout"}
                  </Button>
                </Link>
                <Link href={`/samples?product=${product.id}`}>
                  <Button variant="outline" className="w-full h-12">
                    Get Sample ({formatINR(product.sample_price)})
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
