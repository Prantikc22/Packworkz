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
import Samples, { FAQS as SAMPLE_FAQS } from "@/pages/samples";
import Design from "@/pages/design";
import MockupStudio from "@/pages/mockup-studio";
import SmartStock from "@/pages/smartstock";
import Network from "@/pages/network";
import Machinery, { FAQS as MACHINERY_FAQS } from "@/pages/machinery";
import Circular, { FAQS as CIRCULAR_FAQS } from "@/pages/circular";
import Manufacturing, { FAQS as MANUFACTURING_FAQS } from "@/pages/manufacturing";
import ManufacturerProfile from "@/pages/manufacturing/profile";
import ManufacturerDirectory from "@/pages/manufacturing/directory";
import { CATEGORY_BY_ID, MFG_CATEGORIES, SEED_MANUFACTURERS, SEEDED_ON, categorySeo, manufacturerSeo } from "@/lib/manufacturers";
import { MACHINES } from "@/lib/machinery";
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
        ? `Buy custom ${sku.name.replace(/^Custom (Printed )?/i, "").toLowerCase()} in India from ${sku.moq.toLocaleString("en-IN")} ${sku.moq_unit}. Compare sizes, materials, artwork and quantity pricing online with Packworkz.`
        : `Source custom ${sku.name.replace(/^Custom (Printed )?/i, "").toLowerCase()} in India from ${sku.moq.toLocaleString("en-IN")} ${sku.moq_unit}. See estimated pricing, customise online and confirm your final price within 4 business hours.`,
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
    manufacturing: [
      ...MFG_CATEGORIES.map((category) => ({
        path: `/manufacturing/${category.id}`,
        ...categorySeo(category),
        kind: "mfg-category" as const,
        image: `/images/manufacturing-v2/${category.id}.webp`,
        label: category.label,
        members: SEED_MANUFACTURERS.filter((m) => m.categories.includes(category.id)).map((m) => ({ name: m.name, slug: m.slug })),
      })),
      ...SEED_MANUFACTURERS.map((manufacturer) => ({
        path: `/manufacturers/${manufacturer.slug}`,
        ...manufacturerSeo(manufacturer),
        kind: "manufacturer" as const,
        image: `/images/manufacturing-v2/${manufacturer.categories[0] || "snacks"}.webp`,
        name: manufacturer.name,
        city: manufacturer.city,
        state: manufacturer.state,
        website: manufacturer.website,
        products: manufacturer.products,
        category: CATEGORY_BY_ID[manufacturer.categories[0]]?.label,
        categoryId: manufacturer.categories[0],
        lastmod: isoDate(manufacturer.sourcedOn || SEEDED_ON),
      })),
    ],
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

function isoDate(value: string) {
  const parsed = new Date(`${value} UTC`);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed.toISOString().slice(0, 10);
}

/** FAQ answers per page, for FAQPage structured data. */
export function getPageFaqs(): Record<string, Array<[string, string]>> {
  return {
    "/samples": SAMPLE_FAQS as Array<[string, string]>,
    "/machinery": MACHINERY_FAQS as Array<[string, string]>,
    "/circular": CIRCULAR_FAQS as Array<[string, string]>,
    "/manufacturing": MANUFACTURING_FAQS,
  };
}

/** Plain facts for /llms.txt and /llms-full.txt. */
export function getLlmsData() {
  return {
    skus: CATALOG_SKUS.map((sku) => ({
      name: sku.name, slug: sku.slug, code: sku.code, category: sku.category, description: sku.description, useCase: sku.use_case,
      moq: sku.moq, moqUnit: sku.moq_unit, priceMin: sku.price_min, priceMax: sku.price_max, buyingPath: sku.publicBuyingPath,
      deliveryDays: sku.delivery_days_india, materials: sku.materials || [], eco: sku.is_eco,
    })),
    articles: ARTICLES.map((article) => ({ title: article.title, slug: article.slug, description: article.description, category: article.category, published: article.publishedDate })),
    categories: MFG_CATEGORIES.map((category) => ({ id: category.id, label: category.label, group: category.group, examples: category.examples, count: SEED_MANUFACTURERS.filter((m) => m.categories.includes(category.id)).length })),
    manufacturers: SEED_MANUFACTURERS.map((m) => ({
      name: m.name, slug: m.slug, city: m.city, state: m.state, categories: m.categories.map((id) => CATEGORY_BY_ID[id].label),
      products: m.products, services: m.services, certifications: m.certifications, moq: m.moq, capacity: m.capacity, since: m.since, about: m.about,
    })),
    machines: MACHINES.map((machine) => ({ name: machine.name, slug: machine.slug, category: machine.category, priceFrom: machine.priceFrom, priceTo: machine.priceTo, output: machine.output, bestFor: machine.bestFor, summary: machine.summary })),
    faqs: getPageFaqs(),
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
            <Route path="/machinery">
              <PublicLayout><Machinery /></PublicLayout>
            </Route>
            <Route path="/circular">
              <PublicLayout><Circular /></PublicLayout>
            </Route>
            <Route path="/manufacturing">
              <PublicLayout><Manufacturing /></PublicLayout>
            </Route>
            <Route path="/manufacturing/:category">
              {(params: { category: string }) => <PublicLayout><Manufacturing params={params} /></PublicLayout>}
            </Route>
            <Route path="/manufacturers">
              <PublicLayout><ManufacturerDirectory /></PublicLayout>
            </Route>
            <Route path="/manufacturers/:slug">
              {(params: { slug: string }) => <PublicLayout><ManufacturerProfile params={params} /></PublicLayout>}
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
