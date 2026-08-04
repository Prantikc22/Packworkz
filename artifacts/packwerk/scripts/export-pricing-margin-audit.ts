import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import {
  COMMERCE_PRODUCTS,
  LAUNCH_PROMOTION_CODE,
  TARGET_PRODUCT_GROSS_MARGIN,
  calculateCommerceEstimate,
  formatMeasurementInCm,
  getMinimumQuantityForConfiguration,
} from "@workspace/commerce";

const outputPath = resolve(process.cwd(), "docs/pricing-margin-audit.csv");
const rows: Array<Array<string | number>> = [[
  "sku",
  "size_code",
  "size",
  "quantity",
  "promotion_code",
  "list_unit_price_ex_gst",
  "discount_ex_gst",
  "unit_price_ex_gst",
  "loaded_landed_cost",
  "product_gross_margin_pct",
  "checkout_route",
  "configuration",
]];
let minimumMargin = 1;
let checked = 0;

const scenarios = [
  { label: "standard", values: {} },
  {
    label: "premium",
    values: {
      closure: "Zipper + coffee valve",
      finish: "Soft touch",
      material: "Metallised high-barrier film",
      branding: "Direct digital print",
    },
  },
];

for (const product of Object.values(COMMERCE_PRODUCTS)) {
  for (const tier of product.tiers.filter((candidate) => candidate.minQty < product.quoteThreshold)) {
    for (const productSize of product.sizes) {
      for (const scenario of scenarios) {
        const quantity = Math.max(
          tier.minQty,
          getMinimumQuantityForConfiguration(product.code, scenario.values),
        );
        if (quantity >= product.quoteThreshold) continue;
        const estimate = calculateCommerceEstimate({
          skuCode: product.code,
          quantity,
          sizeCode: productSize.code,
          artwork: "upload",
          delivery: "standard",
          configuration: scenario.values,
          promotionCode: LAUNCH_PROMOTION_CODE,
        });
        if (!estimate.total || ["invalid_quantity", "invalid_size", "managed_quote"].includes(estimate.reason || "")) continue;
        const margin = estimate.grossMarginRate ?? 0;
        minimumMargin = Math.min(minimumMargin, margin);
        checked += 1;
        rows.push([
          product.code,
          productSize.code,
          formatMeasurementInCm(productSize.label),
          quantity,
          LAUNCH_PROMOTION_CODE,
          estimate.unitPrice.toFixed(2),
          estimate.discount.toFixed(2),
          ((estimate.material - estimate.discount) / quantity).toFixed(2),
          estimate.landedUnitCost?.toFixed(2) ?? "",
          (margin * 100).toFixed(2),
          estimate.reason === "payment_limit" ? "payment confirmation" : "online checkout",
          scenario.label,
        ]);
      }
    }
  }
}

if (minimumMargin + Number.EPSILON < TARGET_PRODUCT_GROSS_MARGIN) {
  throw new Error(`Margin floor failed: ${(minimumMargin * 100).toFixed(2)}%`);
}

const escapeCell = (value: string | number) => {
  const text = String(value);
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
};

mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(outputPath, `${rows.map((row) => row.map(escapeCell).join(",")).join("\n")}\n`);
console.log(
  `Wrote ${checked} price/configuration checks to ${outputPath}; minimum product gross margin ${(minimumMargin * 100).toFixed(2)}%.`,
);
