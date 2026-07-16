export type PricingSku = {
  moq: number;
  price_min: number;
  price_max: number;
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
  const ratio = Math.max(1, qty / sku.moq);
  const progress = Math.min(Math.log(ratio) / Math.log(20), 1);
  const unit = sku.price_max - (sku.price_max - sku.price_min) * progress;
  const material = unit * qty;
  const setup = Math.max(2500, sku.price_max * sku.moq * 0.15);
  const baseLogistics = Math.min(qty * 0.9, 3500) + 800;
  const deliveryAdd = delivery === "blitz" ? 1200 : delivery === "warehouse" ? 300 : 0;
  const logistics = baseLogistics + deliveryAdd;
  const artworkCost = artwork === "design" ? 1999 : 0;
  const low = material + setup + logistics + artworkCost;

  return {
    low,
    high: low * 1.12,
    material,
    setup,
    logistics,
    artwork: artworkCost,
    unit,
  };
}
