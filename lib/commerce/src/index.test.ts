import assert from "node:assert/strict";
import test from "node:test";
import {
  COMMERCE_PRODUCTS,
  RAZORPAY_PAYMENT_LIMIT_RUPEES,
  TARGET_PRODUCT_GROSS_MARGIN,
  calculateCommerceEstimate,
} from "./index.ts";

const configurationScenarios = [
  {},
  { finish: "Gloss" },
  { finish: "Soft touch", closure: "Resealable zipper" },
  { material: "Metallised high-barrier film", branding: "Direct digital print" },
];

test("every self-serve tier, size and configuration preserves the product margin floor", () => {
  let checked = 0;
  for (const product of Object.values(COMMERCE_PRODUCTS)) {
    for (const tier of product.tiers.filter((candidate) => candidate.minQty < product.quoteThreshold)) {
      for (const productSize of product.sizes) {
        for (const configuration of configurationScenarios) {
          const estimate = calculateCommerceEstimate({
            skuCode: product.code,
            quantity: tier.minQty,
            sizeCode: productSize.code,
            artwork: "upload",
            delivery: "standard",
            configuration,
          });
          assert.notEqual(estimate.reason, "managed_quote");
          assert.ok(
            (estimate.grossMarginRate ?? 0) >= TARGET_PRODUCT_GROSS_MARGIN,
            `${product.code}/${productSize.code}/${tier.minQty} returned ${estimate.grossMarginRate}`,
          );
          checked += 1;
        }
      }
    }
  }
  assert.ok(checked > 1_000, `Expected a broad sweep, checked ${checked}`);
});

test("configuration changes the effective price without weakening margin", () => {
  const input = { skuCode: "FP-101", quantity: 250, sizeCode: "250G", artwork: "upload" as const, delivery: "standard" as const };
  const base = calculateCommerceEstimate(input);
  const configured = calculateCommerceEstimate({
    ...input,
    configuration: { closure: "Zipper + coffee valve", finish: "Soft touch", material: "Metallised barrier film", branding: "Direct digital print" },
  });
  assert.ok(configured.unitPrice > base.unitPrice);
  assert.ok((configured.grossMarginRate ?? 0) >= TARGET_PRODUCT_GROSS_MARGIN);
});

test("custom and regulated specifications are routed to managed quote", () => {
  for (const configuration of [
    { dimensions: "Custom dimensions" },
    { print: "Unusual print coverage" },
    { compliance: "Pharma grade regulated pack" },
    { certification: "Required certificate" },
  ]) {
    const estimate = calculateCommerceEstimate({
      skuCode: "FP-101",
      quantity: 500,
      sizeCode: "250G",
      artwork: "upload",
      delivery: "standard",
      configuration,
    });
    assert.equal(estimate.reason, "managed_quote");
  }
});

test("orders above the online ceiling keep their value but require payment confirmation", () => {
  const estimate = calculateCommerceEstimate({
    skuCode: "FP-104",
    quantity: 10_000,
    sizeCode: "2L",
    artwork: "upload",
    delivery: "standard",
  });
  assert.ok(estimate.total > RAZORPAY_PAYMENT_LIMIT_RUPEES);
  assert.equal(estimate.eligible, false);
  assert.equal(estimate.reason, "payment_limit");
});
