import assert from "node:assert/strict";
import test from "node:test";
import {
  COMMERCE_PRODUCTS,
  LAUNCH_PROMOTION_CODE,
  LAUNCH_PROMOTION_RATE,
  MINIMUM_NET_UNIT_PRICE_RUPEES,
  RAZORPAY_PAYMENT_LIMIT_RUPEES,
  TARGET_PRODUCT_GROSS_MARGIN,
  calculateCommerceCartEstimate,
  calculateCommerceEstimate,
  formatMeasurementInCm,
  getEffectiveCommerceTiers,
  getMinimumQuantityForConfiguration,
} from "./index.ts";

const configurationScenarios = [
  {},
  { finish: "Gloss" },
  { finish: "Soft touch", closure: "Resealable zipper" },
  { material: "Metallised high-barrier film", branding: "Direct digital print" },
];

test("every published commerce tier is increased by at least ₹1.50", () => {
  for (const product of Object.values(COMMERCE_PRODUCTS)) {
    const effective = getEffectiveCommerceTiers(product.code);
    effective.forEach((tier, index) => {
      assert.ok(tier.unitPrice >= product.tiers[index].unitPrice + 1.5);
    });
  }
});

test("standard delivery is doubled for every commerce product", () => {
  for (const product of Object.values(COMMERCE_PRODUCTS)) {
    const quantity = product.tiers[0].minQty;
    const estimate = calculateCommerceEstimate({
      skuCode: product.code,
      quantity,
      sizeCode: product.sizes[0].code,
      artwork: "upload",
      delivery: "standard",
    });
    const expected = 2 * Math.min(product.shippingCap, product.shippingBase + quantity * product.shippingPerUnit);
    assert.equal(estimate.logistics, Number(expected.toFixed(2)), product.code);
  }
});

test("every self-serve tier, size and configuration preserves the product margin floor", () => {
  let checked = 0;
  for (const product of Object.values(COMMERCE_PRODUCTS)) {
    for (const tier of product.tiers.filter((candidate) => candidate.minQty < product.quoteThreshold)) {
      for (const productSize of product.sizes) {
        for (const configuration of configurationScenarios) {
          const quantity = Math.max(
            tier.minQty,
            getMinimumQuantityForConfiguration(product.code, configuration),
          );
          if (quantity >= product.quoteThreshold) continue;
          const estimate = calculateCommerceEstimate({
            skuCode: product.code,
            quantity,
            sizeCode: productSize.code,
            artwork: "upload",
            delivery: "standard",
            configuration,
            promotionCode: LAUNCH_PROMOTION_CODE,
          });
          assert.notEqual(estimate.reason, "managed_quote");
          assert.ok(
            (estimate.grossMarginRate ?? 0) >= TARGET_PRODUCT_GROSS_MARGIN,
            `${product.code}/${productSize.code}/${quantity} returned ${estimate.grossMarginRate}`,
          );
          assert.ok(
            estimate.unitPrice * (1 - LAUNCH_PROMOTION_RATE) >= MINIMUM_NET_UNIT_PRICE_RUPEES,
            `${product.code}/${productSize.code}/${quantity} fell below the ₹${MINIMUM_NET_UNIT_PRICE_RUPEES} net floor`,
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
    promotionCode: LAUNCH_PROMOTION_CODE,
  });
  assert.ok(configured.unitPrice > base.unitPrice);
  assert.ok((configured.grossMarginRate ?? 0) >= TARGET_PRODUCT_GROSS_MARGIN);
});

test("the launch offer is applied while preserving product margin", () => {
  const estimate = calculateCommerceEstimate({
    skuCode: "LC-816",
    quantity: 25,
    sizeCode: "40R",
    artwork: "upload",
    delivery: "standard",
    promotionCode: LAUNCH_PROMOTION_CODE,
  });
  assert.equal(estimate.promotionCode, LAUNCH_PROMOTION_CODE);
  assert.ok(estimate.discount > 0);
  assert.ok((estimate.grossMarginRate ?? 0) >= TARGET_PRODUCT_GROSS_MARGIN);
  assert.equal(estimate.logistics, 99);
  assert.ok(estimate.total < 350, `Expected a competitive 25-label checkout after the requested uplift, got ${estimate.total}`);
});

test("foodservice branding uses honest production minimums", () => {
  const plain = calculateCommerceEstimate({
    skuCode: "SP-907",
    quantity: 300,
    sizeCode: "500ML",
    artwork: "upload",
    delivery: "standard",
    configuration: { branding: "Plain stock" },
    promotionCode: LAUNCH_PROMOTION_CODE,
  });
  assert.notEqual(plain.reason, "invalid_quantity");

  const shortCustomRun = calculateCommerceEstimate({
    skuCode: "SP-907",
    quantity: 5_000,
    sizeCode: "500ML",
    artwork: "upload",
    delivery: "standard",
    configuration: { branding: "Custom printed" },
    promotionCode: LAUNCH_PROMOTION_CODE,
  });
  assert.equal(shortCustomRun.reason, "invalid_quantity");

  const productionRun = calculateCommerceEstimate({
    skuCode: "SP-907",
    quantity: 10_000,
    sizeCode: "500ML",
    artwork: "upload",
    delivery: "standard",
    configuration: { branding: "Custom printed" },
    promotionCode: LAUNCH_PROMOTION_CODE,
  });
  assert.notEqual(productionRun.reason, "invalid_quantity");
  assert.ok((productionRun.grossMarginRate ?? 0) >= TARGET_PRODUCT_GROSS_MARGIN);
});

test("compostable bio cups stay competitive and preserve guarded margins", () => {
  const plain = calculateCommerceEstimate({
    skuCode: "SP-912",
    quantity: 100,
    sizeCode: "8OZ",
    artwork: "none",
    delivery: "standard",
    configuration: { lid: "No lid", branding: "Plain" },
    promotionCode: LAUNCH_PROMOTION_CODE,
  });
  assert.notEqual(plain.reason, "invalid_quantity");
  assert.ok(plain.unitPrice <= 10.5, `Expected the requested ₹1.50 uplift, got ${plain.unitPrice}`);
  assert.ok((plain.grossMarginRate ?? 0) >= TARGET_PRODUCT_GROSS_MARGIN);

  const withLid = calculateCommerceEstimate({
    skuCode: "SP-912",
    quantity: 100,
    sizeCode: "8OZ",
    artwork: "none",
    delivery: "standard",
    configuration: { lid: "Compostable fibre sip lid", branding: "Plain" },
    promotionCode: LAUNCH_PROMOTION_CODE,
  });
  assert.ok(withLid.unitPrice > plain.unitPrice);

  const shortCustomRun = calculateCommerceEstimate({
    skuCode: "SP-912",
    quantity: 5_000,
    sizeCode: "12OZ",
    artwork: "upload",
    delivery: "standard",
    configuration: { lid: "No lid", branding: "Custom printed" },
  });
  assert.equal(shortCustomRun.reason, "invalid_quantity");
});

test("metric dimensions are presented in centimetres", () => {
  assert.equal(formatMeasurementInCm("40 mm round"), "4 cm round");
  assert.equal(formatMeasurementInCm("100 x 150 mm"), "10 x 15 cm");
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

test("the combined cart total, not each line alone, controls the payment ceiling", () => {
  const input = {
    skuCode: "FP-101",
    quantity: 2_500,
    sizeCode: "100G",
    artwork: "upload" as const,
    delivery: "standard" as const,
  };
  const line = calculateCommerceEstimate(input);
  assert.ok(line.total < RAZORPAY_PAYMENT_LIMIT_RUPEES);

  const cart = calculateCommerceCartEstimate([input, input]);
  assert.ok(cart.total > RAZORPAY_PAYMENT_LIMIT_RUPEES);
  assert.equal(cart.eligible, false);
  assert.equal(cart.reason, "payment_limit");
});

test("a mixed instant and managed-review cart is never partially charged", () => {
  const cart = calculateCommerceCartEstimate([
    {
      skuCode: "LC-816",
      quantity: 100,
      sizeCode: "40R",
      artwork: "upload",
      delivery: "standard",
    },
    {
      skuCode: "FP-101",
      quantity: 500,
      sizeCode: "250G",
      artwork: "upload",
      delivery: "standard",
      configuration: { dimensions: "Custom dimensions" },
    },
  ]);
  assert.equal(cart.eligible, false);
  assert.equal(cart.reason, "manual_review");
});

test("an empty cart cannot create a payment", () => {
  const cart = calculateCommerceCartEstimate([]);
  assert.equal(cart.eligible, false);
  assert.equal(cart.reason, "empty_cart");
  assert.equal(cart.amountPaise, 0);
});

test("an unlisted custom quantity receives the nearest lower tier price", () => {
  const estimate = calculateCommerceEstimate({
    skuCode: "FP-101",
    quantity: 750,
    sizeCode: "250G",
    artwork: "upload",
    delivery: "standard",
  });
  assert.equal(estimate.eligible, true);
  assert.equal(estimate.reason, undefined);
  assert.ok(estimate.total > 0);
});
