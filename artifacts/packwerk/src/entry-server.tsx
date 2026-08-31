import "./ssr-polyfills";
import { renderToString } from "react-dom/server";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Router, Switch, Route, Redirect } from "wouter";
import { TooltipProvider } from "@/components/ui/tooltip";
import { PublicLayout } from "@/components/layout/PublicLayout";

import Home from "@/pages/home";
import About from "@/pages/about";
import Careers from "@/pages/careers";
import Contact from "@/pages/contact";
import HowItWorks from "@/pages/how-it-works";
import Sustainable from "@/pages/sustainable";
import Products from "@/pages/products";
import ProductDetail from "@/pages/product-detail";
import Industries from "@/pages/industries";
import IndustryDetail from "@/pages/industry-detail";
import Resources from "@/pages/resources";
import ResourceDetail from "@/pages/resource-detail";
import GrowingBrands from "@/pages/growing-brands";
import Enterprise from "@/pages/enterprise";
import Quote from "@/pages/quote";
import Samples from "@/pages/samples";
import Design from "@/pages/design";
import MockupStudio from "@/pages/mockup-studio";
import SmartStock from "@/pages/smartstock";
import Network from "@/pages/network";
import Privacy from "@/pages/privacy";
import Terms from "@/pages/terms";
import Refund from "@/pages/refund";
import TrackOrder from "@/pages/track-order";
import { CartProvider } from "@/lib/cart";
import { CATALOG_SKUS, getCatalogImage } from "@/lib/catalog";
import { ARTICLES } from "@/lib/resources-data";

export function getDynamicSeoRoutes() {
  return {
    productCount: CATALOG_SKUS.length,
    products: CATALOG_SKUS.map((sku) => ({
      path: `/products/${sku.slug}`,
      title: `${sku.name.replace(/^Custom Printed /, "")} India | Packworkz`,
      description: sku.publicBuyingPath === "instant"
        ? `Buy custom ${sku.name.toLowerCase()} in India from ${sku.moq.toLocaleString("en-IN")} ${sku.moq_unit}. Compare sizes, materials, artwork and quantity pricing online with Packworkz.`
        : `Source custom ${sku.name.toLowerCase()} in India from ${sku.moq.toLocaleString("en-IN")} ${sku.moq_unit}. Review materials, artwork and specifications, then request a managed Packworkz quote.`,
      keywords: `${sku.name.toLowerCase()} India, custom ${sku.name.toLowerCase()}, ${sku.code}, packaging supplier India`,
      kind: "product" as const,
      name: sku.name,
      sku: sku.code,
      category: sku.category,
      image: getCatalogImage(sku),
      buyingPath: sku.publicBuyingPath,
      lowPrice: sku.price_min,
      highPrice: sku.price_max,
      offerCount: sku.price_tiers?.length || 1,
    })),
    resources: ARTICLES.map((article) => ({
      path: `/resources/${article.slug}`,
      title: `${article.title} | Packworkz`,
      description: article.description,
      keywords: article.keywords.join(", "),
      kind: "article" as const,
      headline: article.title,
      image: article.heroImage,
      publishedDate: article.publishedDate,
    })),
  };
}

function makeStaticHook(path: string) {
  return () => [path, (_: string) => {}] as [string, (to: string) => void];
}

function SSRApp({ url }: { url: string }) {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0, enabled: false } },
  });
  return (
    <QueryClientProvider client={qc}>
      <TooltipProvider>
        <Router hook={makeStaticHook(url)}>
          <CartProvider>
            <Switch>
            <Route path="/">
              <PublicLayout><Home /></PublicLayout>
            </Route>
            <Route path="/about">
              <PublicLayout><About /></PublicLayout>
            </Route>
            <Route path="/careers">
              <PublicLayout><Careers /></PublicLayout>
            </Route>
            <Route path="/contact">
              <PublicLayout><Contact /></PublicLayout>
            </Route>
            <Route path="/how-it-works">
              <PublicLayout><HowItWorks /></PublicLayout>
            </Route>
            <Route path="/sustainable">
              <PublicLayout><Sustainable /></PublicLayout>
            </Route>
            <Route path="/products">
              <PublicLayout><Products /></PublicLayout>
            </Route>
            <Route path="/products/:slug">
              {(params: { slug?: string }) => (
                <PublicLayout>
                  <ProductDetail params={{ slug: params.slug ?? "" }} />
                </PublicLayout>
              )}
            </Route>
            <Route path="/industries">
              <PublicLayout><Industries /></PublicLayout>
            </Route>
            <Route path="/industries/:slug">
              {(_params: { slug?: string }) => (
                <PublicLayout><IndustryDetail /></PublicLayout>
              )}
            </Route>
            <Route path="/resources">
              <PublicLayout><Resources /></PublicLayout>
            </Route>
            <Route path="/resources/:slug">
              <PublicLayout><ResourceDetail /></PublicLayout>
            </Route>
            <Route path="/solutions/growing-brands">
              <PublicLayout><GrowingBrands /></PublicLayout>
            </Route>
            <Route path="/enterprise">
              <PublicLayout><Enterprise /></PublicLayout>
            </Route>
            <Route path="/quote">
              <Redirect to="/configure" />
            </Route>
            <Route path="/configure">
              <PublicLayout><Quote /></PublicLayout>
            </Route>
            <Route path="/procurement-plan">
              <PublicLayout><Quote /></PublicLayout>
            </Route>
            <Route path="/configure/step/:step">
              {(params: { step?: string }) => (
                <PublicLayout><Quote params={{ step: params.step }} /></PublicLayout>
              )}
            </Route>
            <Route path="/configure/confirmed/:id">
              {(params: { id?: string }) => (
                <PublicLayout><Quote params={{ id: params.id }} /></PublicLayout>
              )}
            </Route>
            <Route path="/samples">
              <PublicLayout><Samples /></PublicLayout>
            </Route>
            <Route path="/design">
              <PublicLayout><Design /></PublicLayout>
            </Route>
            <Route path="/mockup-studio">
              <PublicLayout><MockupStudio /></PublicLayout>
            </Route>
            <Route path="/smartstock">
              <PublicLayout><SmartStock /></PublicLayout>
            </Route>
            <Route path="/network">
              <PublicLayout><Network /></PublicLayout>
            </Route>
            <Route path="/privacy">
              <PublicLayout><Privacy /></PublicLayout>
            </Route>
            <Route path="/terms">
              <PublicLayout><Terms /></PublicLayout>
            </Route>
            <Route path="/refund">
              <PublicLayout><Refund /></PublicLayout>
            </Route>
            <Route path="/track-order">
              <PublicLayout><TrackOrder /></PublicLayout>
            </Route>
            </Switch>
          </CartProvider>
        </Router>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export function render(url: string): string {
  return renderToString(<SSRApp url={url} />);
}
