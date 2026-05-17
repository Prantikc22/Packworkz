/**
 * Build-time SSG prerender script.
 * Run AFTER `vite build` + `vite build --ssr` to generate per-route index.html files
 * so crawlers and AI bots get real HTML content for every public URL.
 *
 * Usage: node scripts/prerender.mjs
 */

import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const DIST = join(ROOT, "dist/public");
const SERVER_BUNDLE = join(ROOT, "dist/server/entry-server.js");

// Per-route SEO overrides
const ROUTES = [
  {
    path: "/",
    title: "Packworkz — India's Managed Packaging Platform | D2C, FMCG & Pharma",
    description: "India's first managed packaging platform. 110+ SKUs, 3 backup vendors per order, 98.7% on-time delivery. Trusted by 220+ D2C, FMCG and pharma brands.",
  },
  {
    path: "/about",
    title: "About Us — Packworkz | India's First Managed Packaging Platform",
    description: "Learn how Packworkz is solving India's packaging supply chain chaos — from 3 backup vendors per order to owned QC and SmartStock™ AI inventory.",
  },
  {
    path: "/careers",
    title: "Careers at Packworkz — Build India's Packaging Infrastructure",
    description: "Join the team solving India's ₹3.5 lakh crore packaging industry. Open roles in sales, engineering, operations and more.",
  },
  {
    path: "/contact",
    title: "Contact Packworkz — Get in Touch With Our Team",
    description: "Reach Packworkz for sales, support, or press inquiries. Email, WhatsApp, or fill our contact form — we respond within 24 hours.",
  },
  {
    path: "/how-it-works",
    title: "How Packworkz Works — From Quote to Delivery in 4 Steps",
    description: "Browse 110+ SKUs, request a quote in 48 hours, approve designs, and receive compliant packaging — managed end-to-end by Packworkz.",
  },
  {
    path: "/sustainable",
    title: "Sustainable Packaging — EPR-Compliant & Eco Packaging | Packworkz",
    description: "Explore Packworkz's range of EPR-compliant sustainable packaging: kraft, compostable mailers, recycled PE, and FSC-certified options.",
  },
  {
    path: "/products",
    title: "110+ Packaging SKUs — Browse the Packworkz Catalogue",
    description: "Flexible pouches, rigid bottles, eco packaging, labels, tubes and more — browse 110+ packaging SKUs with instant sample ordering.",
  },
  {
    path: "/industries",
    title: "Industries Served by Packworkz — D2C, FMCG, Pharma & More",
    description: "Packworkz serves D2C brands, FMCG manufacturers, pharma, cosmetics, food & beverage, electronics, and exporters across India and globally.",
  },
  {
    path: "/resources",
    title: "Packaging Resources & Guides — Packworkz Blog",
    description: "Expert packaging guides, supplier tips, EPR compliance checklists, and D2C brand case studies from the Packworkz team.",
  },
];

async function prerender() {
  let render;
  try {
    const mod = await import(SERVER_BUNDLE);
    render = mod.render;
  } catch (err) {
    console.error("❌  Failed to load SSR bundle:", err.message);
    console.error("   Run `pnpm --filter @workspace/packwerk run build:ssr` first.");
    process.exit(1);
  }

  const template = readFileSync(join(DIST, "index.html"), "utf-8");
  let successCount = 0;
  let failCount = 0;

  for (const route of ROUTES) {
    const { path: routePath, title, description } = route;
    let appHtml = "";

    try {
      appHtml = render(routePath);
    } catch (err) {
      console.warn(`⚠️  SSR render failed for ${routePath}: ${err.message}`);
      failCount++;
    }

    // Inject rendered HTML into root div
    let html = template.replace(
      /<div id="root"><\/div>/,
      `<div id="root">${appHtml}</div>`,
    );

    // Update per-page title
    html = html.replace(
      /<title>[^<]*<\/title>/,
      `<title>${title}</title>`,
    );

    // Update per-page meta description
    html = html.replace(
      /(<meta name="description" content=")[^"]*(")/,
      `$1${description}$2`,
    );

    // Update canonical URL
    if (routePath !== "/") {
      html = html.replace(
        /(<link rel="canonical" href="https:\/\/packworkz\.com)[^"]*(">)/,
        `$1${routePath}$2`,
      );
    }

    // Write output
    if (routePath === "/") {
      writeFileSync(join(DIST, "index.html"), html);
    } else {
      const outDir = join(DIST, routePath.slice(1));
      mkdirSync(outDir, { recursive: true });
      writeFileSync(join(outDir, "index.html"), html);
    }

    const status = appHtml ? "✅" : "📄";
    console.log(`${status}  ${routePath} → dist/public${routePath === "/" ? "/index.html" : routePath + "/index.html"}`);
    if (appHtml) successCount++;
  }

  console.log(`\nPrerender complete: ${successCount} SSR, ${failCount} fallback (meta-only)\n`);
}

prerender().catch((err) => {
  console.error(err);
  process.exit(1);
});
