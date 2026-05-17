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

// All public routes — must match App.tsx + sitemap.xml
const ROUTES = [
  // ── Core pages ──────────────────────────────────────────────────────────────
  {
    path: "/",
    title: "Packworkz — India's Managed Packaging Platform | D2C, FMCG & Pharma",
    description: "India's first managed packaging platform. 110+ SKUs, 3 backup vendors per order, 98.7% on-time delivery. Trusted by 220+ D2C, FMCG and pharma brands.",
  },
  {
    path: "/about",
    title: "About Packworkz — India's First Managed Packaging Platform",
    description: "Learn how Packworkz solves packaging supply chain chaos with 3 backup vendors per order, owned QC, and SmartStock™ AI inventory.",
  },
  {
    path: "/how-it-works",
    title: "How Packworkz Works — Quote to Delivery in 4 Steps",
    description: "Browse 110+ SKUs, get a quote in 48 hours, approve designs, and receive EPR-compliant packaging — all managed by Packworkz.",
  },
  {
    path: "/sustainable",
    title: "Sustainable Packaging — EPR-Compliant & Eco Packaging | Packworkz",
    description: "Kraft, compostable mailers, recycled PE, and FSC-certified packaging options — all with CPCB EPR documentation from Packworkz.",
  },
  {
    path: "/careers",
    title: "Careers at Packworkz — Build India's Packaging Infrastructure",
    description: "Join the team solving India's ₹3.5 lakh crore packaging industry. Open roles in sales, engineering, and operations.",
  },
  {
    path: "/contact",
    title: "Contact Packworkz — Sales, Support & Press",
    description: "Reach Packworkz at contact@packworkz.com, sales@packworkz.com, or WhatsApp +91-82089-90366. We respond within 24 hours.",
  },
  {
    path: "/resources",
    title: "Packaging Guides & Resources — Packworkz Blog",
    description: "Expert packaging guides, MOQ tips, EPR compliance checklists, and D2C brand case studies from the Packworkz team.",
  },

  // ── Service / conversion pages ───────────────────────────────────────────────
  {
    path: "/quote",
    title: "Get a Packaging Quote in 48 Hours — Packworkz",
    description: "Request a custom packaging quote for pouches, boxes, bottles and more. 48-hour turnaround, MOQ from 500 units.",
  },
  {
    path: "/samples",
    title: "Order Packaging Samples from ₹2,999 — Packworkz",
    description: "Order physical samples from 110+ packaging SKUs. Starting at ₹2,999 with fast 5-day delivery across India.",
  },
  {
    path: "/design",
    title: "Custom Packaging Design Service — Packworkz",
    description: "Professional custom packaging design from ₹1,999. Dielines, artwork, and brand identity for all 110+ SKUs.",
  },

  // ── Product catalogue listing ────────────────────────────────────────────────
  {
    path: "/products",
    title: "110+ Packaging SKUs — Browse the Packworkz Catalogue",
    description: "Flexible pouches, rigid bottles, eco packaging, labels, tubes and more. Browse 110+ packaging SKUs with instant sample ordering.",
  },

  // ── Product category pages ───────────────────────────────────────────────────
  {
    path: "/products/flexible",
    title: "Flexible Packaging — Stand-up Pouches, Films & Wraps | Packworkz",
    description: "Stand-up pouches, pillow pouches, flat-bottom pouches, rollstock films and wraps. Custom printed, MOQ from 500 units.",
  },
  {
    path: "/products/bottles",
    title: "Rigid Packaging — PET Jars, HDPE Bottles & Glass | Packworkz",
    description: "PET jars, HDPE bottles, glass containers and rigid packaging in custom sizes. Low MOQs for D2C, FMCG and pharma brands.",
  },
  {
    path: "/products/tubes",
    title: "Tubes & Squeezable Packaging — Laminate & Plastic | Packworkz",
    description: "Laminate tubes, plastic squeeze tubes and cosmetic tubes with custom printing. Ideal for creams, gels, and pastes.",
  },
  {
    path: "/products/boxes",
    title: "Boxes & Cartons — Mono, Duplex & Gift Boxes | Packworkz",
    description: "Mono cartons, duplex boards, corrugated shippers and premium gift boxes. Custom sizes and full CMYK printing.",
  },
  {
    path: "/products/ecommerce",
    title: "E-commerce Packaging — Mailers, Corrugated & Tapes | Packworkz",
    description: "Poly mailers, kraft mailers, bubble wrap and branded tape for D2C e-commerce brands. Fast delivery, low MOQ.",
  },
  {
    path: "/products/protective",
    title: "Protective Packaging — Bubble Wrap, Foam & Inserts | Packworkz",
    description: "Bubble wrap, foam inserts, air pillows and protective packaging materials for safe product transit.",
  },
  {
    path: "/products/rolls",
    title: "Packaging Rolls — Rollstock & Centre-fold Films | Packworkz",
    description: "Rollstock films, centre-fold films and printed packaging rolls for automated packing lines. Custom widths and print.",
  },
  {
    path: "/products/labels",
    title: "Labels & Accessories — Stickers, Sleeves & Closures | Packworkz",
    description: "Self-adhesive labels, shrink sleeves, caps, pumps and dispensers. Custom print and material for every brand.",
  },
  {
    path: "/products/sustainable",
    title: "Sustainable Packaging SKUs — Kraft, Compostable & Recycled | Packworkz",
    description: "EPR-compliant sustainable packaging: kraft mailers, compostable pouches, recycled PE and FSC-certified boxes.",
  },
  {
    path: "/products/liquid",
    title: "Liquid Cartons & Packaging — Tetra-style & Gable Top | Packworkz",
    description: "Liquid cartons, gable-top boxes and aseptic packaging for beverages, dairy and liquid FMCG products.",
  },

  // ── Product SKU detail pages ─────────────────────────────────────────────────
  {
    path: "/products/stand-up-pouch",
    title: "Stand-up Pouch — Custom Printed Stand-up Pouches | Packworkz",
    description: "Custom printed stand-up pouches (SUP) in various sizes. Ideal for snacks, coffee, spices and pet food. MOQ 500 units.",
  },
  {
    path: "/products/pillow-pouch",
    title: "Pillow Pouch — Flexible Pillow Bags | Packworkz",
    description: "Custom pillow pouches and pillow bags for snacks, granules and powders. Available in multiple laminates and print finishes.",
  },
  {
    path: "/products/flat-bottom-pouch",
    title: "Flat Bottom Pouch — Block Bottom Bags | Packworkz",
    description: "Flat bottom pouches for premium shelf presentation. Ideal for coffee, tea, pet treats and specialty foods.",
  },
  {
    path: "/products/spout-pouch",
    title: "Spout Pouch — Liquid & Beverage Pouches | Packworkz",
    description: "Spout pouches for juices, sauces, baby food and liquid products. Resealable, food-grade, custom printed.",
  },
  {
    path: "/products/pet-jar",
    title: "PET Jar — Custom PET Jars for Food & Cosmetics | Packworkz",
    description: "PET jars in wide-mouth and regular neck for food, supplements and cosmetics. Custom sizes, low MOQ.",
  },
  {
    path: "/products/hdpe-bottle",
    title: "HDPE Bottle — Industrial & Consumer HDPE Bottles | Packworkz",
    description: "HDPE bottles for pharma, chemicals, cleaning products and FMCG. FDA-compliant, custom caps and labels.",
  },
  {
    path: "/products/glass-bottle",
    title: "Glass Bottle — Premium Glass Bottles & Jars | Packworkz",
    description: "Flint and amber glass bottles for premium beverages, oils and cosmetics. Low MOQ with custom label printing.",
  },
  {
    path: "/products/mono-carton",
    title: "Mono Carton — Custom Printed Retail Cartons | Packworkz",
    description: "Mono cartons in SBS, duplex and kraftboard for FMCG and pharma retail packaging. UV, foil and emboss finishes.",
  },
  {
    path: "/products/corrugated-box",
    title: "Corrugated Box — Custom Shipping & Retail Boxes | Packworkz",
    description: "3-ply and 5-ply corrugated boxes for e-commerce shipping and retail display. Custom sizes and print.",
  },
  {
    path: "/products/poly-mailer",
    title: "Poly Mailer — Custom Printed Courier Bags | Packworkz",
    description: "Poly mailers and courier bags for e-commerce brands. Tamper-evident, custom print, MOQ 500 units.",
  },
  {
    path: "/products/kraft-mailer",
    title: "Kraft Mailer — Eco-friendly Paper Courier Bags | Packworkz",
    description: "Kraft paper mailers for sustainable e-commerce brands. Biodegradable, custom printed, from 500 units.",
  },
  {
    path: "/products/compostable-mailer",
    title: "Compostable Mailer — Home Compostable Courier Bags | Packworkz",
    description: "Home compostable mailers certified to EN13432 and AS4736. Ideal for eco-conscious D2C brands in India.",
  },
  {
    path: "/products/shrink-sleeve",
    title: "Shrink Sleeve — 360° Label Shrink Sleeves | Packworkz",
    description: "Full-body shrink sleeves and neck bands for bottles and jars. 360° print, high-clarity PVC and PETG options.",
  },

  // ── Industry pages ───────────────────────────────────────────────────────────
  {
    path: "/industries",
    title: "Industries Served by Packworkz — D2C, FMCG, Pharma & More",
    description: "Packworkz serves D2C brands, FMCG manufacturers, pharma, cosmetics, food & beverage, electronics, jewellery and exporters.",
  },
  {
    path: "/industries/d2c",
    title: "Packaging for D2C Brands — Direct-to-Consumer Packaging | Packworkz",
    description: "Premium packaging for D2C brands in beauty, food, and wellness. Low MOQ, fast turnaround, custom design from ₹1,999.",
  },
  {
    path: "/industries/fmcg",
    title: "FMCG Packaging — Packaging for FMCG Manufacturers | Packworkz",
    description: "Scalable packaging solutions for FMCG manufacturers with consistent quality, EPR compliance, and Net-30 credit.",
  },
  {
    path: "/industries/pharma",
    title: "Pharma Packaging — GMP-Compliant Packaging for Healthcare | Packworkz",
    description: "GMP-compliant pharma packaging including blister foils, strip packs, HDPE bottles and mono cartons.",
  },
  {
    path: "/industries/beauty",
    title: "Cosmetics & Beauty Packaging — Custom Packaging for Beauty Brands | Packworkz",
    description: "Premium cosmetics and beauty packaging — tubes, jars, bottles and boxes with custom design and low MOQ.",
  },
  {
    path: "/industries/food",
    title: "Food & Beverage Packaging — Safe, Compliant Food Packaging | Packworkz",
    description: "FSSAI-compliant food-grade packaging for snacks, beverages, condiments and specialty foods across India.",
  },
  {
    path: "/industries/electronics",
    title: "Electronics Packaging — Anti-static & Protective Packaging | Packworkz",
    description: "Anti-static bags, foam inserts and custom boxes for electronics brands and component manufacturers in India.",
  },
  {
    path: "/industries/exports",
    title: "Export Packaging — US, UK & UAE Compliant Packaging | Packworkz",
    description: "Export-ready packaging meeting US FDA, EU, and UAE standards. Multilingual labels and international compliance.",
  },
  {
    path: "/industries/luxury",
    title: "Luxury & Gift Packaging — Premium Packaging for Jewellery | Packworkz",
    description: "Premium gift boxes, rigid suitcases, and luxury packaging for jewellery, watches and lifestyle brands.",
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
    const { path: routePath, title, description } = route;
    let appHtml = "";

    try {
      appHtml = render(routePath);
    } catch (err) {
      console.warn(`⚠️  SSR render failed for ${routePath}: ${err.message}`);
      fallbackCount++;
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
