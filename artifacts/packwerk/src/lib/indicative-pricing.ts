import { calculateOrderEstimate } from "@/lib/pricing";
import { getUnitPriceForQuantity, requiresQuote, type CatalogSku } from "@/lib/catalog";

export type IndicativePrice = {
  /** True when the price is a market-based estimate confirmed by a specialist. */
  estimated: boolean;
  unitLow: number;
  unitHigh: number;
  totalLow: number;
  totalHigh: number;
  setupLow: number;
  setupHigh: number;
};

// Estimates are shown as a band around the modelled unit rate so buyers see a
// realistic range instead of a single number we cannot yet guarantee.
const LOW_BAND = 0.88;
const HIGH_BAND = 1.12;

/**
 * Indicative, ex-GST price for quote-reviewed products (and instant products
 * pushed over their online quantity limit). Instant products inside their
 * online range should use calculateOrderEstimate for the exact checkout price.
 */
export function getIndicativePrice(sku: CatalogSku, quantity: number, configuration: Record<string, string> = {}): IndicativePrice {
  const qty = Math.max(sku.moq, quantity || sku.moq);
  const hasTiers = Boolean(sku.price_tiers?.length);
  const unit = hasTiers
    ? getUnitPriceForQuantity(sku, qty)
    : calculateOrderEstimate(sku, qty, "standard", "none", undefined, configuration).unit;
  const briefSetup = sku.purchase_mode === "brief" && sku.estimate_band;
  const setupLow = briefSetup ? sku.estimate_band!.setup_min : 0;
  const setupHigh = briefSetup ? sku.estimate_band!.setup_max : 0;
  const unitLow = unit * LOW_BAND;
  const unitHigh = unit * HIGH_BAND;
  return {
    estimated: requiresQuote(sku, qty),
    unitLow,
    unitHigh,
    totalLow: unitLow * qty + setupLow,
    totalHigh: unitHigh * qty + setupHigh,
    setupLow,
    setupHigh,
  };
}

/** Lowest per-unit rate a product can reach, used for "From ₹X / unit" labels. */
export function getFromUnitPrice(sku: CatalogSku): number {
  const tiers = sku.price_tiers || [];
  if (tiers.length) return Math.min(...tiers.map((tier) => tier.unit_price));
  return sku.estimate_band?.unit_min ?? sku.price_min;
}

export function formatRupeeRange(low: number, high: number, fractionDigits = 0) {
  const format = (value: number) => `₹${value.toLocaleString("en-IN", { minimumFractionDigits: fractionDigits, maximumFractionDigits: fractionDigits })}`;
  return `${format(low)} – ${format(high)}`;
}

export function formatUnitRate(value: number) {
  return `₹${value.toLocaleString("en-IN", { minimumFractionDigits: value < 100 ? 2 : 0, maximumFractionDigits: value < 100 ? 2 : 0 })}`;
}
