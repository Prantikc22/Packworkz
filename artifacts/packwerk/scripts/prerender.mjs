/**
 * Build-time SSG prerender script.
 * Run AFTER `vite build` + `vite build --ssr` to generate per-route index.html
 * files so crawlers and AI bots get real HTML content for every public URL.
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

// Keep in sync with PAGE_SEO in PublicLayout.tsx
const ROUTES = [
  // ── Core pages ──────────────────────────────────────────────────────────────
  {
    path: "/",
    title: "Packworkz — Packaging Manufacturer & Managed Platform India | D2C, FMCG, Pharma",
    description: "India's first managed packaging manufacturer platform. 110+ SKUs, 3 backup vendors per order, 98.7% on-time delivery. Custom packaging for D2C, FMCG & pharma brands. Quote in 48 hours.",
    keywords: "packaging manufacturer India, managed packaging platform, custom packaging India, D2C packaging manufacturer, FMCG packaging supplier India, packaging vendor India",
  },
  {
    path: "/about",
    title: "About Packworkz | India's First Managed Packaging Manufacturer Platform",
    description: "Founded to solve India's packaging vendor chaos. Packworkz connects D2C, FMCG & pharma brands with verified packaging manufacturers — owned QC, real-time tracking, Net-30 credit.",
    keywords: "Packworkz about, packaging manufacturer platform India, managed packaging company India",
  },
  {
    path: "/how-it-works",
    title: "How to Source Custom Packaging in India | 4-Step Process | Packworkz",
    description: "Source custom packaging in 4 simple steps. Submit specs, get competitive quotes in 48 hours, approve samples, track production. India's simplest managed packaging sourcing process.",
    keywords: "source packaging India, custom packaging process, packaging supplier India, managed packaging procurement, B2B packaging platform",
  },
  {
    path: "/sustainable",
    title: "Sustainable Packaging Manufacturer India | EPR Compliant, FSC Certified | Packworkz",
    description: "FSC-certified kraft, compostable mailers, recycled PE and EPR-compliant packaging from India's verified sustainable packaging manufacturers. Serving D2C and export brands.",
    keywords: "sustainable packaging manufacturer India, eco-friendly packaging India, compostable packaging, EPR compliant packaging India, FSC certified packaging",
  },
  {
    path: "/careers",
    title: "Careers at Packworkz — Build India's Packaging Infrastructure",
    description: "Join the team solving India's ₹3.5 lakh crore packaging industry. Open roles in sales, engineering, and operations.",
    keywords: "Packworkz careers, jobs packaging India, packaging startup jobs India",
  },
  {
    path: "/contact",
    title: "Contact Packworkz | Custom Packaging India | +91 82089 90366",
    description: "Contact Packworkz for custom packaging quotes, sample orders, or design enquiries. Call +91 82089 90366 or send an enquiry online. 48-hour response guaranteed.",
    keywords: "contact Packworkz, packaging manufacturer contact India, packaging enquiry India",
  },
  {
    path: "/resources",
    title: "Packaging Guides & Resources — Packworkz Blog",
    description: "Expert packaging guides, MOQ tips, EPR compliance checklists, and D2C brand case studies from the Packworkz team.",
    keywords: "packaging guides India, packaging blog, EPR compliance guide, D2C packaging tips",
  },
  {
    path: "/network",
    title: "Packworkz Manufacturer Network | 220+ Verified Packaging Factories India",
    description: "220+ verified packaging manufacturers across India. 3 backup vendors assigned per order. Full traceability, QC certificates, and compliance documentation for every factory.",
    keywords: "packaging manufacturer network India, verified packaging factories, packaging supplier network India",
  },

  // ── Service / conversion pages ───────────────────────────────────────────────
  {
    path: "/quote",
    title: "Get a Custom Packaging Quote in 48 Hours | India | Packworkz",
    description: "Submit packaging specs and receive a detailed, competitive quote within 48 hours. Pouches, boxes, bottles, mailers and more. No vendor calls needed. 220+ brands trust Packworkz.",
    keywords: "custom packaging quote India, packaging manufacturer quote, get packaging quote online, bulk packaging price India",
  },
  {
    path: "/samples",
    title: "Order Packaging Samples India | From ₹2,999 | 3–5 Day Delivery | Packworkz",
    description: "Order physical packaging samples before bulk production. 500+ combinations from ₹2,999. 3–5 day delivery pan-India. Custom printed samples for all SKUs.",
    keywords: "packaging samples India, order packaging samples, custom packaging sample, packaging manufacturer sample India",
  },
  {
    path: "/design",
    title: "Custom Packaging Design Service India | From ₹1,999 | Packworkz",
    description: "Professional packaging design from ₹1,999. Full branding across 110+ SKUs. Print-ready artwork, dieline templates, and design management included.",
    keywords: "custom packaging design India, packaging design service, packaging artwork India, D2C packaging design",
  },

  // ── Product catalogue listing ────────────────────────────────────────────────
  {
    path: "/products",
    title: "Packaging Manufacturer India | 110+ SKUs — Pouches, Boxes, Bottles | Packworkz",
    description: "Browse 110+ packaging SKUs from India's verified manufacturer network. Stand-up pouches, corrugated boxes, PET jars, poly mailers & more. MOQ from 200 units. Get a quote online.",
    keywords: "packaging manufacturer India, custom packaging manufacturer, stand-up pouch manufacturer India, corrugated box manufacturer, flexible packaging manufacturer India",
  },

  // ── Product category pages ───────────────────────────────────────────────────
  {
    path: "/products/flexible",
    title: "Flexible Packaging Manufacturer India | Stand-Up Pouches, Rollstock | Packworkz",
    description: "Custom flexible packaging from India's verified manufacturers. Stand-up pouches, pillow pouches, spout pouches, flat bottom bags and rollstock. MOQ from 500 units.",
    keywords: "flexible packaging manufacturer India, stand-up pouch manufacturer India, pouch packaging supplier, rollstock film manufacturer",
  },
  {
    path: "/products/bottles",
    title: "Bottle & Jar Manufacturer India | PET, HDPE, Glass | Packworkz",
    description: "PET jars, HDPE bottles, glass containers and more from India's verified rigid packaging manufacturers. Custom shapes, colours, closures and labelling available.",
    keywords: "bottle manufacturer India, PET jar manufacturer India, HDPE bottle supplier, glass bottle manufacturer India",
  },
  {
    path: "/products/tubes",
    title: "Tube Packaging Manufacturer India | Laminate & Plastic Tubes | Packworkz",
    description: "Laminate tubes, plastic squeeze tubes and cosmetic tubes with custom printing. Ideal for creams, gels, and pastes. MOQ from 1,000 units.",
    keywords: "tube packaging manufacturer India, laminate tube supplier, cosmetic tube manufacturer India",
  },
  {
    path: "/products/boxes",
    title: "Box & Carton Manufacturer India | Mono Carton, Corrugated, Gift Box | Packworkz",
    description: "Mono cartons, corrugated shippers, gift boxes and rigid boxes from India's verified packaging manufacturers. Full custom printing, embossing, foiling and finishing.",
    keywords: "box manufacturer India, mono carton manufacturer India, corrugated box supplier India, gift box manufacturer",
  },
  {
    path: "/products/ecommerce",
    title: "E-commerce Packaging Manufacturer India | Poly Mailers, Courier Bags | Packworkz",
    description: "Custom poly mailers, kraft mailers, compostable mailers and courier bags for D2C and e-commerce brands. Low MOQ from 200 units. Custom branded and plain stock available.",
    keywords: "ecommerce packaging manufacturer India, poly mailer manufacturer, courier bag supplier India, D2C mailer packaging",
  },
  {
    path: "/products/protective",
    title: "Protective Packaging Manufacturer India | Bubble Wrap, Foam Inserts | Packworkz",
    description: "Bubble wrap, foam inserts, air pillows and protective packaging materials for safe product transit. Custom sizes and bulk orders available across India.",
    keywords: "protective packaging manufacturer India, bubble wrap supplier India, foam packaging India",
  },
  {
    path: "/products/rolls",
    title: "Packaging Rolls Manufacturer India | Rollstock & Centre-fold Films | Packworkz",
    description: "Rollstock films, centre-fold films and printed packaging rolls for automated packing lines. Custom widths and print. MOQ from 50kg rolls.",
    keywords: "packaging rolls manufacturer India, rollstock film supplier, printed packaging roll India",
  },
  {
    path: "/products/labels",
    title: "Label Manufacturer India | Self-Adhesive, Shrink Sleeve, Sticker | Packworkz",
    description: "Custom labels and shrink sleeves from India's verified label manufacturers. Self-adhesive labels, shrink sleeves, tamper-evident seals and more. MOQ from 1,000 units.",
    keywords: "label manufacturer India, self-adhesive label supplier India, shrink sleeve manufacturer, sticker label manufacturer India",
  },
  {
    path: "/products/sustainable",
    title: "Sustainable Packaging Products India | Compostable, Kraft, Recycled | Packworkz",
    description: "Shop eco-friendly packaging — compostable mailers, kraft bags, recycled PE pouches and FSC-certified boxes. EPR compliance documentation included with every order.",
    keywords: "sustainable packaging products India, compostable packaging manufacturer, eco packaging India",
  },
  {
    path: "/products/liquid",
    title: "Liquid Packaging Manufacturer India | Tetra-style & Gable Top | Packworkz",
    description: "Liquid cartons, gable-top boxes and aseptic packaging for beverages, dairy and liquid FMCG products. Custom print, bulk orders.",
    keywords: "liquid packaging manufacturer India, gable top carton supplier, beverage packaging India",
  },

  // ── Product SKU detail pages ─────────────────────────────────────────────────
  {
    path: "/products/stand-up-pouch",
    title: "Stand-Up Pouch Manufacturer India | Custom Printed SUP | Packworkz",
    description: "Custom printed stand-up pouches (SUP) in various sizes. Ideal for snacks, coffee, spices and pet food. MOQ 500 units. 10-day delivery.",
    keywords: "stand-up pouch manufacturer India, custom SUP India, flexible pouch supplier India",
  },
  {
    path: "/products/pillow-pouch",
    title: "Pillow Pouch Manufacturer India | Flexible Pillow Bags | Packworkz",
    description: "Custom pillow pouches and pillow bags for snacks, granules and powders. Available in multiple laminates and print finishes.",
    keywords: "pillow pouch manufacturer India, pillow bag supplier, flexible packaging India",
  },
  {
    path: "/products/flat-bottom-pouch",
    title: "Flat Bottom Pouch Manufacturer India | Block Bottom Bags | Packworkz",
    description: "Flat bottom pouches for premium shelf presentation. Ideal for coffee, tea, pet treats and specialty foods. MOQ 500 units.",
    keywords: "flat bottom pouch manufacturer India, block bottom bag supplier, premium pouch India",
  },
  {
    path: "/products/spout-pouch",
    title: "Spout Pouch Manufacturer India | Liquid & Beverage Pouches | Packworkz",
    description: "Spout pouches for juices, sauces, baby food and liquid products. Resealable, food-grade, custom printed. MOQ 500 units.",
    keywords: "spout pouch manufacturer India, liquid pouch supplier India, beverage pouch manufacturer",
  },
  {
    path: "/products/pet-jar",
    title: "PET Jar Manufacturer India | Custom PET Jars for Food & Cosmetics | Packworkz",
    description: "PET jars in wide-mouth and regular neck for food, supplements and cosmetics. Custom sizes, low MOQ, pan-India delivery.",
    keywords: "PET jar manufacturer India, custom PET jar supplier, food grade jar India",
  },
  {
    path: "/products/hdpe-bottle",
    title: "HDPE Bottle Manufacturer India | Industrial & Consumer HDPE | Packworkz",
    description: "HDPE bottles for pharma, chemicals, cleaning products and FMCG. FDA-compliant, custom caps and labels. Bulk orders available.",
    keywords: "HDPE bottle manufacturer India, pharma bottle supplier India, plastic bottle manufacturer India",
  },
  {
    path: "/products/glass-bottle",
    title: "Glass Bottle Manufacturer India | Premium Glass Bottles & Jars | Packworkz",
    description: "Flint and amber glass bottles for premium beverages, oils and cosmetics. Low MOQ with custom label printing.",
    keywords: "glass bottle manufacturer India, amber glass bottle supplier, premium glass packaging India",
  },
  {
    path: "/products/mono-carton",
    title: "Mono Carton Manufacturer India | Custom Printed Retail Cartons | Packworkz",
    description: "Mono cartons in SBS, duplex and kraftboard for FMCG and pharma retail packaging. UV, foil and emboss finishes. MOQ 500 units.",
    keywords: "mono carton manufacturer India, retail carton supplier India, FMCG carton manufacturer",
  },
  {
    path: "/products/corrugated-box",
    title: "Corrugated Box Manufacturer India | Custom Shipping & Retail Boxes | Packworkz",
    description: "3-ply and 5-ply corrugated boxes for e-commerce shipping and retail display. Custom sizes and print. Pan-India delivery.",
    keywords: "corrugated box manufacturer India, shipping box supplier India, custom corrugated box India",
  },
  {
    path: "/products/poly-mailer",
    title: "Poly Mailer Manufacturer India | Custom Courier Bags | Packworkz",
    description: "Poly mailers and courier bags for e-commerce brands. Tamper-evident, custom print, MOQ 500 units. Fast pan-India delivery.",
    keywords: "poly mailer manufacturer India, courier bag supplier India, custom mailer bag India",
  },
  {
    path: "/products/kraft-mailer",
    title: "Kraft Mailer Manufacturer India | Eco-friendly Paper Courier Bags | Packworkz",
    description: "Kraft paper mailers for sustainable e-commerce brands. Biodegradable, custom printed, from 500 units.",
    keywords: "kraft mailer manufacturer India, eco mailer supplier India, paper courier bag India",
  },
  {
    path: "/products/compostable-mailer",
    title: "Compostable Mailer Manufacturer India | Home Compostable Courier Bags | Packworkz",
    description: "Home compostable mailers certified to EN13432 and AS4736. Ideal for eco-conscious D2C brands in India. MOQ 500 units.",
    keywords: "compostable mailer manufacturer India, biodegradable mailer India, eco courier bag India",
  },
  {
    path: "/products/shrink-sleeve",
    title: "Shrink Sleeve Manufacturer India | 360° Label Shrink Sleeves | Packworkz",
    description: "Full-body shrink sleeves and neck bands for bottles and jars. 360° print, high-clarity PVC and PETG options. MOQ 1,000 units.",
    keywords: "shrink sleeve manufacturer India, shrink label supplier India, 360 label India",
  },

  // ── Industry pages ───────────────────────────────────────────────────────────
  {
    path: "/industries",
    title: "Packaging Manufacturer for D2C, FMCG, Pharma & Exports | India | Packworkz",
    description: "Custom packaging solutions for every industry — D2C brands, FMCG manufacturers, pharma, cosmetics, food & beverage, electronics, and exporters. India's managed packaging platform.",
    keywords: "packaging manufacturer D2C India, FMCG packaging manufacturer, pharma packaging manufacturer India, cosmetics packaging supplier",
  },
  {
    path: "/industries/d2c",
    title: "D2C Packaging Manufacturer India | Custom Branded Pouches & Boxes | Packworkz",
    description: "Custom branded packaging for D2C brands. Stand-up pouches, mailers, gift boxes and more. Low MOQ from 200 units. Fast 10–15 day delivery. Trusted by 150+ D2C brands.",
    keywords: "D2C packaging manufacturer India, custom packaging D2C brand, branded packaging India, ecommerce packaging manufacturer",
  },
  {
    path: "/industries/fmcg",
    title: "FMCG Packaging Manufacturer India | Bulk Supplier | Packworkz",
    description: "High-volume FMCG packaging from India's verified manufacturer network. Flexible pouches, glass jars, cartons, labels and more. Net-30 credit available.",
    keywords: "FMCG packaging manufacturer India, bulk packaging supplier India, FMCG packaging platform",
  },
  {
    path: "/industries/pharma",
    title: "Pharma Packaging Manufacturer India | CPCB & FDA Compliant | Packworkz",
    description: "Pharma-grade packaging with full compliance documentation. Blister packs, HDPE bottles, amber glass, foil laminates — all with QC certificates and CPCB compliance.",
    keywords: "pharma packaging manufacturer India, pharmaceutical packaging supplier, FDA compliant packaging India, CPCB packaging",
  },
  {
    path: "/industries/beauty",
    title: "Beauty & Cosmetics Packaging Manufacturer India | Packworkz",
    description: "Custom cosmetics packaging — airless pumps, glass jars, aluminium tubes, serum bottles and luxury boxes. Low MOQ, custom branding, pre-dispatch QC.",
    keywords: "cosmetics packaging manufacturer India, beauty packaging supplier India, skincare packaging manufacturer",
  },
  {
    path: "/industries/food",
    title: "Food Packaging Manufacturer India | FSSAI Compliant | Packworkz",
    description: "FSSAI-compliant food packaging — stand-up pouches, flat bottom bags, spout pouches, kraft boxes and more. Custom printing, retort pouches, and bulk orders available.",
    keywords: "food packaging manufacturer India, FSSAI packaging India, food grade packaging supplier, snack packaging manufacturer India",
  },
  {
    path: "/industries/electronics",
    title: "Electronics Packaging Manufacturer India | Anti-Static, ESD Safe | Packworkz",
    description: "Anti-static bags, ESD-safe packaging, corrugated inserts and custom foam for electronics brands. Full compliance documentation. Low MOQ, pan-India delivery.",
    keywords: "electronics packaging manufacturer India, anti-static packaging India, ESD packaging supplier",
  },
  {
    path: "/industries/exports",
    title: "Export Packaging Manufacturer India | SASO, FDA, CE Compliant | Packworkz",
    description: "Packaging for Indian exporters targeting UAE, US, UK, and Europe. SASO-ready, FDA-grade, FSC-certified with full chain-of-custody documentation.",
    keywords: "export packaging India, SASO compliant packaging, FDA grade packaging India, packaging for Indian exporters",
  },
  {
    path: "/industries/luxury",
    title: "Luxury & Gift Packaging Manufacturer India | Premium Boxes | Packworkz",
    description: "Premium gift boxes, rigid suitcases, and luxury packaging for jewellery, watches and lifestyle brands. Low MOQ, custom finishes.",
    keywords: "luxury packaging manufacturer India, gift box manufacturer India, premium packaging supplier",
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
  let fallbackCount = 0;

  for (const route of ROUTES) {
    const { path: routePath, title, description, keywords } = route;
    let appHtml = "";

    try {
      appHtml = render(routePath);
    } catch (err) {
      console.warn(`⚠️  SSR render failed for ${routePath}: ${err.message}`);
      fallbackCount++;
    }

    // React 19 auto-injects <link rel="preload"> hints when images have
    // fetchPriority="high". With renderToString() these land inside
    // <div id="root"> — browsers discard <link> inside a <div> as invalid
    // HTML, which wipes out all visible content. Extract them and hoist to
    // <head> instead.
    const hoistedLinks = [];
    const cleanedHtml = appHtml.replace(/<link\b[^>]*\/?>/gi, (match) => {
      hoistedLinks.push(match);
      return "";
    });

    // Inject cleaned rendered HTML into root div
    let html = template.replace(
      /<div id="root"><\/div>/,
      `<div id="root">${cleanedHtml}</div>`,
    );

    // Hoist extracted <link> tags into <head> (before closing </head>)
    if (hoistedLinks.length > 0) {
      html = html.replace("</head>", `${hoistedLinks.join("\n")}\n</head>`);
    }

    // Per-page title
    html = html.replace(/<title>[^<]*<\/title>/, `<title>${title}</title>`);

    // Per-page meta description
    html = html.replace(
      /(<meta name="description" content=")[^"]*(")/,
      `$1${description}$2`,
    );

    // Per-page meta keywords
    html = html.replace(
      /(<meta name="keywords" content=")[^"]*(")/,
      `$1${keywords}$2`,
    );

    // Per-page OG + Twitter tags
    const canonicalUrl = `https://packworkz.com${routePath === "/" ? "" : routePath}`;
    html = html.replace(
      /(<meta property="og:title" content=")[^"]*(")/,
      `$1${title}$2`,
    );
    html = html.replace(
      /(<meta property="og:description" content=")[^"]*(")/,
      `$1${description}$2`,
    );
    html = html.replace(
      /(<meta property="og:url" content=")[^"]*(")/,
      `$1${canonicalUrl}$2`,
    );
    html = html.replace(
      /(<meta name="twitter:title" content=")[^"]*(")/,
      `$1${title}$2`,
    );
    html = html.replace(
      /(<meta name="twitter:description" content=")[^"]*(")/,
      `$1${description}$2`,
    );

    // Per-page canonical — replace or inject
    const canonicalTag = `<link rel="canonical" href="${canonicalUrl}" />`;
    if (html.includes('rel="canonical"')) {
      html = html.replace(/<link rel="canonical"[^>]*\/?>/i, canonicalTag);
    } else {
      html = html.replace("</head>", `${canonicalTag}\n</head>`);
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
    const outPath = routePath === "/" ? "/index.html" : `${routePath}/index.html`;
    if (appHtml) successCount++;
    process.stdout.write(`${status}  ${outPath}\n`);
  }

  console.log(`\nPrerender complete: ${successCount} SSR, ${fallbackCount} meta-only fallback\n`);
}

prerender().catch((err) => {
  console.error(err);
  process.exit(1);
});
