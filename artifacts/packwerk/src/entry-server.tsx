import "./ssr-polyfills";
import { renderToString } from "react-dom/server";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Router, Switch, Route } from "wouter";
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
import Quote from "@/pages/quote";
import Samples from "@/pages/samples";
import Design from "@/pages/design";

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
            <Route path="/quote">
              <PublicLayout><Quote /></PublicLayout>
            </Route>
            <Route path="/samples">
              <PublicLayout><Samples /></PublicLayout>
            </Route>
            <Route path="/design">
              <PublicLayout><Design /></PublicLayout>
            </Route>
          </Switch>
        </Router>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export function render(url: string): string {
  return renderToString(<SSRApp url={url} />);
}
