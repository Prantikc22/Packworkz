export type PricingSku = {
  moq: number;
  price_min: number;
  price_max: number;
  purchase_mode?: "instant" | "hybrid" | "brief";
  price_tiers?: Array<{ min_qty: number; unit_price: number }>;
  estimate_band?: { unit_min: number; unit_max: number; setup_min: number; setup_max: number };
};

export type DeliverySpeed = "standard" | "blitz" | "warehouse";
export type ArtworkPath = "upload" | "design" | "none";

export function calculateOrderEstimate(
  sku: PricingSku | undefined,
  quantity: number,
  delivery: DeliverySpeed = "standard",
  artwork: ArtworkPath = "none",
) {
  if (!sku) return { low: 0, high: 0, material: 0, setup: 0, logistics: 0, artwork: 0, unit: 0 };

  const qty = Math.max(sku.moq, quantity || sku.moq);
  const tiers = [...(sku.price_tiers || [])].sort((a, b) => a.min_qty - b.min_qty);
  let tierUnit = tiers[0]?.unit_price;
  for (const tier of tiers) {
    if (qty >= tier.min_qty) tierUnit = tier.unit_price;
  }
  const ratio = Math.max(1, qty / sku.moq);
  const progress = Math.min(Math.log(ratio) / Math.log(20), 1);
  const bandUnit = sku.estimate_band
    ? sku.estimate_band.unit_max - (sku.estimate_band.unit_max - sku.estimate_band.unit_min) * progress
    : sku.price_max - (sku.price_max - sku.price_min) * progress;
  const unit = tierUnit ?? bandUnit;
  const material = unit * qty;
  const setup = sku.purchase_mode === "brief" && sku.estimate_band
    ? sku.estimate_band.setup_min
    : Math.max(2500, sku.price_max * sku.moq * 0.15);
  const baseLogistics = Math.min(qty * 0.9, 3500) + 800;
  const deliveryAdd = delivery === "blitz" ? 1200 : delivery === "warehouse" ? 300 : 0;
  const logistics = baseLogistics + deliveryAdd;
  const artworkCost = artwork === "design" ? 1999 : 0;
  const low = material + setup + logistics + artworkCost;
  const estimateHigh = sku.estimate_band
    ? sku.estimate_band.unit_max * qty + sku.estimate_band.setup_max + logistics + artworkCost
    : low * 1.12;

  return {
    low,
    high: Math.max(low, estimateHigh),
    material,
    setup,
    logistics,
    artwork: artworkCost,
    unit,
  };
}
