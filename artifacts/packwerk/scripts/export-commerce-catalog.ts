import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { CATALOG_SKUS } from "../src/lib/catalog";

const outputDirectory = resolve(process.cwd(), "docs");
mkdirSync(outputDirectory, { recursive: true });

const records = CATALOG_SKUS.map((sku) => ({
  code: sku.code,
  slug: sku.slug,
  name: sku.name,
  category: sku.category,
  purchase_mode: sku.purchaseMode,
  public_buying_path: sku.publicBuyingPath,
  quote_threshold: sku.quote_threshold || null,
  use_case: sku.use_case,
  standard_spec: sku.standard_spec || "Confirm standard size and material before publishing",
  moq: sku.moq,
  moq_unit: sku.moq_unit,
  price_tiers_ex_gst: sku.price_tiers || [],
  production_estimate_ex_gst: sku.estimate_band || null,
  delivery_days_india: sku.delivery_days_india,
  sample_tier: sku.sample_tier,
  sample_price: sku.sample_price,
  materials: sku.materials || [],
  print_methods: sku.print_methods || [],
  sustainability_notes: sku.sustainability_notes || [],
  supplier_route: sku.supplier_route || "Packworkz supplier network",
  hsn_code: sku.hsn_code || null,
  gst_rate_provisional: sku.gst_rate || null,
  smartstock_eligible: sku.is_smartstock,
  industry_slugs: sku.industrySlugs,
  variant_groups: sku.variants,
  specification_fields: sku.customization_fields,
}));

writeFileSync(resolve(outputDirectory, "commerce-catalog.json"), `${JSON.stringify({
  generated_at: new Date().toISOString(),
  currency: "INR",
  prices_include_gst: false,
  gst_note: "GST rate and HSN must be confirmed by the invoicing entity before go-live.",
  catalog: records,
}, null, 2)}\n`);

const csvCell = (value: unknown) => `"${String(value ?? "").replaceAll('"', '""')}"`;
const headers = ["code", "slug", "name", "category", "public_buying_path", "internal_pricing_mode", "quote_threshold", "moq", "moq_unit", "launch_unit_price_ex_gst", "best_unit_price_ex_gst", "estimate_unit_min", "estimate_unit_max", "lead_days", "supplier_route"];
const rows = records.map((record) => {
  const tiers = record.price_tiers_ex_gst;
  return [
    record.code, record.slug, record.name, record.category, record.public_buying_path, record.purchase_mode, record.quote_threshold || "", record.moq, record.moq_unit,
    tiers[0]?.unit_price ?? "", tiers[tiers.length - 1]?.unit_price ?? "",
    record.production_estimate_ex_gst?.unit_min ?? "", record.production_estimate_ex_gst?.unit_max ?? "",
    record.delivery_days_india, record.supplier_route,
  ].map(csvCell).join(",");
});
writeFileSync(resolve(outputDirectory, "commerce-catalog.csv"), `${headers.map(csvCell).join(",")}\n${rows.join("\n")}\n`);

const shopifyHeaders = ["Handle", "Title", "Body (HTML)", "Vendor", "Product Category", "Type", "Tags", "Published", "Option1 Name", "Option1 Value", "Variant SKU", "Variant Price", "Variant Requires Shipping", "Variant Taxable", "Status"];
const shopifyRows = records.filter((record) => record.public_buying_path === "instant").flatMap((record) => {
  const tiers = record.price_tiers_ex_gst;
  const tags = [record.category, "instant-buy", record.smartstock_eligible ? "smartstock" : "", ...(record.sustainability_notes.length ? ["lower-impact"] : [])].filter(Boolean).join(",");
  return tiers.filter((tier) => !record.quote_threshold || tier.min_qty < record.quote_threshold).map((tier, index) => [
    record.slug,
    index === 0 ? record.name : "",
    index === 0 ? `<p>${record.use_case}</p><p><strong>Standard specification:</strong> ${record.standard_spec}</p>` : "",
    index === 0 ? "Packworkz" : "",
    index === 0 ? "Business & Industrial > Shipping Supplies > Packaging Materials" : "",
    index === 0 ? record.category : "",
    index === 0 ? tags : "",
    "FALSE",
    "Order quantity",
    `${tier.min_qty.toLocaleString("en-IN")} ${record.moq_unit}`,
    `${record.code}-${tier.min_qty}`,
    (tier.unit_price * tier.min_qty).toFixed(2),
    "TRUE",
    "TRUE",
    "draft",
  ].map(csvCell).join(","));
});
writeFileSync(resolve(outputDirectory, "shopify-products.csv"), `${shopifyHeaders.map(csvCell).join(",")}\n${shopifyRows.join("\n")}\n`);

const byCategory = [...new Set(records.map((record) => record.category))];
const markdownSections = byCategory.map((category) => {
  const products = records.filter((record) => record.category === category);
  const lines = products.map((record) => {
    const tiers = record.price_tiers_ex_gst;
    const price = tiers.length
      ? tiers.map((tier) => `${tier.min_qty.toLocaleString("en-IN")}+ @ Rs ${tier.unit_price}/unit`).join("; ")
      : `estimate Rs ${record.production_estimate_ex_gst?.unit_min}-${record.production_estimate_ex_gst?.unit_max}/unit + setup Rs ${record.production_estimate_ex_gst?.setup_min}-${record.production_estimate_ex_gst?.setup_max}`;
    return `| ${record.code} | ${record.name} | ${record.public_buying_path} | ${record.moq.toLocaleString("en-IN")} ${record.moq_unit} | ${price} | ${record.supplier_route} |`;
  });
  return `## ${category[0].toUpperCase()}${category.slice(1)} (${products.length})\n\n| Code | Product family | Buying path | MOQ | Launch pricing, ex-GST | Supplier route |\n|---|---|---:|---:|---|---|\n${lines.join("\n")}`;
});

const instantCount = records.filter((record) => record.public_buying_path === "instant").length;
const quoteCount = records.filter((record) => record.public_buying_path === "quote").length;
writeFileSync(resolve(outputDirectory, "COMMERCE_CATALOG.md"), `# Packworkz Commerce Catalog\n\nGenerated from the storefront source of truth. ${records.length} product families: ${instantCount} instant-buy and ${quoteCount} request-quote.\n\n## Commerce rules\n\n- Customers see only two paths: Instant buy and Request quote. Internal estimate logic is never presented as a third buying mode.\n- Public prices are per-unit launch prices for the named standard specification and exclude GST and freight.\n- Instant products can proceed to payment after pincode, artwork and tax identity checks.\n- An instant product automatically moves to Request quote at its enterprise quantity threshold so capacity, freight and bulk pricing can be reviewed.\n- Quote products are limited to rollstock, tooling-heavy, regulated, cold-chain and process-validated formats.\n- Quantity tiers must be recalibrated from three live supplier bids before launch, then protected by a landed-cost and contribution-margin floor.\n- GSTIN belongs behind a 'Buying as a business' toggle. It is optional for browsing and required only when the buyer requests a B2B tax invoice.\n- Shopify can host the instant lane, but tier pricing needs Shopify Functions/B2B or a volume-pricing app. Quote products should create a Packworkz lead and later convert to a Shopify draft order with a secure checkout link.\n- Keep catalog, pricing rules, artwork versions, technical requests and SmartStock in the Packworkz backend even if Shopify supplies checkout initially.\n\n${markdownSections.join("\n\n")}\n`);

console.log(`Exported ${records.length} products to ${outputDirectory}`);
