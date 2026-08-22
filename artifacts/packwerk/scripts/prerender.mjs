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

function buildJsonLd(route) {
  const canonicalUrl = `https://packworkz.com${route.path === "/" ? "" : route.path}`;
  const baseOrg = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Packworkz",
    url: "https://packworkz.com",
    logo: "https://packworkz.com/opengraph.jpg",
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+91-82089-90366",
      contactType: "sales",
      areaServed: "IN",
      availableLanguage: ["en", "hi"],
    },
  };

  if (route.path === "/products") {
    return {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: route.title,
      description: route.description,
      url: canonicalUrl,
      isPartOf: baseOrg,
      mainEntity: {
        "@type": "ItemList",
        name: "Packworkz packaging SKU catalog",
        numberOfItems: PRODUCT_ROUTE_DATA.length,
        itemListOrder: "https://schema.org/ItemListOrderAscending",
      },
    };
  }

  if (route.path.startsWith("/products/") && route.path.split("/").length === 3) {
    return {
      "@context": "https://schema.org",
      "@type": "Product",
      name: route.title.replace(" | Packworkz", ""),
      description: route.description,
      url: canonicalUrl,
      brand: baseOrg,
      offers: {
        "@type": "AggregateOffer",
        priceCurrency: "INR",
        availability: "https://schema.org/InStock",
        seller: baseOrg,
      },
    };
  }

  if (route.path === "/industries" || route.path.startsWith("/industries/")) {
    return {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: route.title,
      description: route.description,
      url: canonicalUrl,
      provider: baseOrg,
    };
  }

  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: route.title,
    description: route.description,
    url: canonicalUrl,
    publisher: baseOrg,
  };
}

const PRODUCT_ROUTE_DATA = [
  ["FP-101", "stand-up-pouch", "Stand-up Pouch"],
  ["FP-103", "flat-bottom-pouch", "Flat-bottom & Gusseted Pouch"],
  ["FP-104", "spout-pouch", "Spout & Refill Pouch"],
  ["FP-105", "sachet-stick-pack", "Sachet / Stick Pack"],
  ["BC-201", "plastic-bottle", "Plastic Bottles & Jars"],
  ["BC-202", "glass-bottle", "Glass Bottles & Jars"],
  ["BC-204", "cosmetic-jar", "Cosmetic Jar"],
  ["BC-205", "dropper-bottle", "Dropper Bottle"],
  ["BC-206", "airless-pump-bottle", "Airless Pump Bottle"],
  ["BC-214", "custom-printed-shampoo-lotion-bottles", "Custom Printed Shampoo & Lotion Bottles"],
  ["TS-301", "cosmetic-tube", "Cosmetic Tube"],
  ["TS-306", "custom-printed-sustainable-cosmetic-tubes", "Custom Printed Mono-material & PCR Cosmetic Tubes"],
  ["BX-401", "straight-tuck-end-carton", "Custom Printed Folding Carton"],
  ["BX-402", "two-piece-rigid-box", "Custom Printed Two-piece Rigid Box"],
  ["BX-403", "magnetic-closure-rigid-box", "Magnetic Closure Box"],
  ["EC-501", "mailer-box", "Mailer Box"],
  ["EC-502", "corrugated-shipping-box", "Corrugated Shipping Box"],
  ["EC-503", "food-delivery-box", "Food Delivery Box"],
  ["EC-504", "courier-bag", "Courier & Return Mailers"],
  ["PR-601", "bubble-wrap-air-pillows", "Protective Wrap & Void Fill"],
  ["PR-602", "foam-thermocol-inserts", "Custom Inserts & Dividers"],
  ["RL-701", "printed-packaging-roll", "Printed Flexible Rollstock"],
  ["LC-816", "round-paper-labels", "Round Paper Labels"],
  ["LC-817", "square-paper-labels", "Square Paper Labels"],
  ["LC-818", "rectangular-paper-labels", "Rectangular Paper Labels"],
  ["LC-819", "oval-paper-labels", "Oval Paper Labels"],
  ["LC-820", "custom-die-cut-stickers", "Custom Die-cut Stickers"],
  ["LC-804", "waterproof-bopp-vinyl-labels", "Waterproof BOPP & Vinyl Labels"],
  ["LC-805", "clear-transparent-labels", "Clear & Transparent Labels"],
  ["LC-814", "machine-applied-roll-labels", "Machine-applied Roll Labels"],
  ["LC-815", "foil-special-effect-labels", "Foil & Special-effect Labels"],
  ["FP-110", "retort-pouch", "Retort Pouch"],
  ["FP-112", "centre-seal-fin-pouch", "Flow-wrap & Pillow Pack"],
  ["BC-213", "perfume-bottle", "Perfume & Attar Bottle"],
  ["EC-505", "paper-shipping-mailer", "Paper & Padded Mailers"],
  ["EC-509", "frosted-zipper-garment-bag", "Frosted Zipper Garment Bag"],
  ["EC-510", "printed-paper-carrier-bag", "Printed Paper Carrier Bag"],
  ["RL-704", "lidding-sealing-film", "Lidding & Sealing Film"],
  ["RL-705", "shrink-film-rollstock", "Shrink Film & Sleeve Rollstock"],
  ["LC-806", "shrink-sleeve-label", "Shrink Sleeve & Wrap-around Labels"],
  ["LC-808", "hang-tag-header-card", "Hang Tags & Insert Cards"],
  ["LC-810", "printed-tissue-wrapping-paper", "Printed Tissue & Wrapping Paper"],
  ["LC-811", "printed-bopp-tape", "Custom Packaging Tape"],
  ["SP-905", "bagasse-clamshell", "Bagasse Food Containers"],
  ["SP-907", "paper-bowls-food-containers", "Paper Bowls & Food Containers"],
  ["SP-909", "greaseproof-food-wrap-paper", "Greaseproof & Food Wrap Paper"],
  ["SP-912", "compostable-bio-paper-cups", "Compostable Bio Paper Cups"],
].map(([code, slug, name]) => ({
  path: `/products/${slug}`,
  title: `${name} | Custom Packaging India | Packworkz`,
  description: `Configure ${name.toLowerCase()} for D2C and enterprise orders. Review MOQ, materials, artwork, quantity pricing and the correct instant-buy or managed-quote path with Packworkz.`,
  keywords: `${name.toLowerCase()} India, custom packaging India, ${code}, Packworkz`,
}));

const RESOURCE_ROUTE_DATA = [
  ["custom-packaging-cost-india-2026", "Custom Packaging Cost in India: Complete 2026 Pricing Guide", "Understand the real cost drivers behind custom packaging in India, from structure and printing to quantity and delivery."],
  ["low-moq-custom-packaging-india", "Low MOQ Custom Packaging in India: Complete Guide", "Choose a low-MOQ packaging route that protects launch cash flow without creating avoidable stockout risk."],
  ["custom-printed-pouch-moq-pricing", "Custom Printed Pouch MOQ & Pricing Guide", "Compare pouch materials, closures, print methods and quantity tiers before requesting a custom printed pouch quote."],
  ["custom-printed-box-cost-india", "Custom Printed Box Cost in India", "See what changes the price of folding cartons, mailer boxes, corrugated shippers and rigid presentation boxes."],
  ["packaging-for-d2c-brand-beginners-guide", "Packaging for a D2C Brand: Complete Beginner's Guide", "Build a practical packaging system for a D2C launch across primary packs, labels, cartons and ecommerce shipping."],
  ["fssai-packaging-labelling-requirements-india", "FSSAI Packaging & Labelling Requirements in India", "Use a current starting checklist for food-contact packaging, declarations and artwork approval under the FSSAI framework."],
  ["best-packaging-coffee-beans-india", "Best Packaging for Coffee Beans", "Choose coffee packaging around aroma protection, degassing, resealability and roast-to-order operations."],
  ["best-packaging-snacks-material-barrier-shelf-life", "Best Packaging for Snacks", "Compare snack packaging formats using barrier, sealing, shelf-life and filling-line requirements."],
  ["cosmetic-packaging-india-complete-guide", "Cosmetic Packaging in India: Complete Guide", "Build a compatible cosmetic pack across bottles, pumps, labels, cartons and transit packaging."],
  ["choose-packaging-skincare-brand", "How to Choose Packaging for a Skincare Brand", "Choose containers and dispensing systems for serums, creams, cleansers, oils and treatment formulas."],
  ["best-packaging-restaurants-cloud-kitchens", "Best Packaging for Restaurants & Cloud Kitchens", "Choose takeaway packaging by food type, temperature, venting, leak resistance and delivery journey."],
  ["bopp-vs-ldpe-packaging", "BOPP vs LDPE Packaging", "Compare BOPP and LDPE for print, stiffness, sealing, clarity and flexible packaging structures."],
  ["digital-vs-rotogravure-printing", "Digital Printing vs Rotogravure Printing", "Choose a packaging print process using quantity, variants, lead time, colour control and repeat-order economics."],
  ["amazon-india-packaging-requirements", "Amazon India Packaging Requirements", "Plan packaging for FBA, Easy Ship or Self-Ship while checking the current category-specific Seller Central rules."],
  ["how-much-packaging-should-startup-order", "How Much Packaging Should a Startup Order?", "Use demand, lead time, cash flow and write-off risk to set a sensible first packaging quantity."],
].map(([slug, title, description]) => ({
  path: `/resources/${slug}`,
  title: `${title} | Packworkz`,
  description,
  keywords: `${title.toLowerCase()}, packaging India, Packworkz resources`,
}));

// Keep in sync with PAGE_SEO in PublicLayout.tsx
const ROUTES = [
  // ── Core pages ──────────────────────────────────────────────────────────────
  {
    path: "/",
    title: "Packworkz — Packaging Manufacturer & Managed Platform India | D2C, FMCG, Pharma",
    description: "Managed packaging for D2C, FMCG, pharma and enterprise teams. Browse a curated product catalog, see quantity pricing, create 3D previews and manage repeat orders in one workflow.",
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
    description: "Source custom packaging in 4 simple steps. Submit specs, get competitive pricing plans in 48 hours, approve samples, track production. India's simplest managed packaging sourcing process.",
    keywords: "source packaging India, custom packaging process, packaging supplier India, managed packaging procurement, B2B packaging platform",
  },
  {
    path: "/sustainable",
    title: "Sustainable Packaging Manufacturer India | EPR Compliant, FSC Certified | Packworkz",
    description: "FSC-certified kraft, compostable mailers, recycled PE and EPR-compliant packaging from India's verified sustainable packaging manufacturers. Serving D2C and export brands.",
    keywords: "sustainable packaging manufacturer India, eco-friendly packaging India, compostable packaging, EPR compliant packaging India, FSC certified packaging",
  },
  {
    path: "/sustainable-catalog",
    title: "Sustainable Packaging Catalog India | FSC, Compostable, Recycled | Packworkz",
    description: "Browse sustainable packaging SKUs with EPR documentation, FSC options, compostable mailers, recycled boxes, and food-safe eco packaging.",
    keywords: "sustainable packaging catalog India, eco packaging catalog, FSC packaging India, compostable packaging India",
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
    description: "Contact Packworkz for custom packaging pricing, sample orders, or design enquiries. Call +91 82089 90366 or send an enquiry online.",
    keywords: "contact Packworkz, packaging manufacturer contact India, packaging enquiry India",
  },
  {
    path: "/resources",
    title: "Packaging Guides & Resources — Packworkz Blog",
    description: "Expert packaging guides, MOQ tips, EPR compliance checklists, and D2C brand case studies from the Packworkz team.",
    keywords: "packaging guides India, packaging blog, EPR compliance guide, D2C packaging tips",
  },
  ...RESOURCE_ROUTE_DATA,
  {
    path: "/solutions/growing-brands",
    title: "Custom Packaging for D2C Brands & Startups India | Packworkz",
    description: "Launch custom branded pouches, boxes, labels and ecommerce packaging with startup-friendly MOQs. Configure online, preview your artwork and scale with Packworkz.",
    keywords: "custom packaging for startups India, D2C packaging India, custom packaging low MOQ India, custom boxes for small business, custom pouches for startups",
  },
  {
    path: "/enterprise",
    title: "Enterprise Packaging Procurement & Manufacturing India | Packworkz",
    description: "Consolidate packaging sourcing, manufacturing, QC, compliance and logistics with Packworkz. Built for FMCG, D2C, food, beauty, pharma and multi-SKU procurement teams.",
    keywords: "enterprise packaging India, packaging procurement India, packaging sourcing company India, FMCG packaging supplier, packaging vendor management",
  },
  {
    path: "/network",
    title: "Packworkz Packaging Manufacturer Network India",
    description: "See how Packworkz matches packaging specifications to eligible production routes, quality checkpoints and applicable supplier documentation across India.",
    keywords: "packaging manufacturer network India, verified packaging factories, packaging supplier network India",
  },

  // ── Service / conversion pages ───────────────────────────────────────────────
  {
    path: "/configure",
    title: "Get a Custom Packaging Pricing Plan in 48 Hours | India | Packworkz",
    description: "Submit packaging specs and receive a detailed, competitive pricing plan. Pouches, boxes, bottles, mailers and more, with one managed review route.",
    keywords: "custom packaging pricing plan India, packaging manufacturer pricing plan, get packaging pricing plan online, bulk packaging price India",
  },
  {
    path: "/procurement-plan",
    title: "Managed Packaging Pricing Plan for Technical SKUs | Packworkz",
    description: "Plan packaging rolls, technical films, high-barrier rollstock, and high-volume custom packaging with material guidance, samples, and manufacturer matching.",
    keywords: "packaging procurement plan India, packaging roll pricing, technical packaging supplier India, managed packaging sourcing",
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
    description: "Packaging design and 3D previews across a curated product catalog, with print-ready artwork, dieline handoff and design management.",
    keywords: "custom packaging design India, packaging design service, packaging artwork India, D2C packaging design",
  },
  {
    path: "/mockup-studio",
    title: "Free 3D Packaging Mockup Studio | Packworkz",
    description: "Preview boxes, pouches, bottles, jars and tubes in 3D. Add artwork, review dielines and export a branded packaging mockup before production.",
    keywords: "3D packaging mockup India, packaging artwork preview, packaging dieline, box mockup generator",
  },
  {
    path: "/smartstock",
    title: "SmartStock AI Packaging Inventory | Packworkz",
    description: "Anticipate packaging demand, model reorder timing and reduce emergency sourcing with SmartStock AI inventory planning from Packworkz.",
    keywords: "packaging inventory software, packaging reorder planning, SmartStock AI, packaging stock management",
  },

  // ── Product catalogue listing ────────────────────────────────────────────────
  {
    path: "/products",
    title: "Packaging Products India | Pouches, Boxes, Bottles | Packworkz",
    description: "Browse curated packaging families including pouches, rigid boxes, cartons, containers, mailers, labels, food-service packs and technical rollstock. See buying paths and quantity pricing online.",
    keywords: "packaging manufacturer India, custom packaging manufacturer, stand-up pouch manufacturer India, corrugated box manufacturer, flexible packaging manufacturer India",
  },

  // ── Product SKU detail pages ─────────────────────────────────────────────────
  ...PRODUCT_ROUTE_DATA,

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
    description: "Custom branded packaging for D2C brands including stand-up pouches, mailers, printed cartons and rigid gift boxes, with low-MOQ options and managed production support.",
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
  {
    path: "/privacy",
    title: "Privacy Policy | Packworkz",
    description: "How Packworkz collects, uses and protects information across its packaging platform, support channels and ordering workflows.",
    keywords: "Packworkz privacy policy",
  },
  {
    path: "/terms",
    title: "Terms of Service | Packworkz",
    description: "Terms governing Packworkz catalog, managed quotes, samples, artwork, production and digital services.",
    keywords: "Packworkz terms of service",
  },
  {
    path: "/refund",
    title: "Refund & Cancellation Policy | Packworkz",
    description: "Packworkz refund and cancellation terms for samples, custom packaging, production orders and managed services.",
    keywords: "Packworkz refund policy, packaging order cancellation",
  },
];

function buildSitemap() {
  const lastmod = new Date().toISOString().slice(0, 10);
  const entries = ROUTES.map(({ path }) => {
    const url = `https://packworkz.com${path === "/" ? "/" : path}`;
    const isProduct = path.startsWith("/products/");
    const priority = path === "/" ? "1.0" : path === "/products" || path === "/configure" ? "0.9" : isProduct ? "0.8" : "0.7";
    const changefreq = path === "/" || path === "/products" ? "weekly" : "monthly";
    return `  <url>\n    <loc>${url}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`;
  });

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.join("\n")}\n</urlset>\n`;
}

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

    const jsonLd = JSON.stringify(buildJsonLd(route)).replace(/</g, "\\u003c");
    const jsonLdTag = `<script type="application/ld+json">${jsonLd}</script>`;
    html = html.replace("</head>", `${jsonLdTag}\n</head>`);

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

  const sitemap = buildSitemap();
  writeFileSync(join(ROOT, "public/sitemap.xml"), sitemap);
  writeFileSync(join(DIST, "sitemap.xml"), sitemap);

  console.log(`\nPrerender complete: ${successCount} SSR, ${fallbackCount} meta-only fallback\n`);
}

prerender().catch((err) => {
  console.error(err);
  process.exit(1);
});
