export const RAZORPAY_PAYMENT_LIMIT_RUPEES = 50_000;
export const GST_RATE = 0.18;
export const TARGET_PRODUCT_GROSS_MARGIN = 0.35;
// Supplier quotes are loaded with expected rejection/wastage (3%), inward
// freight (3%) and production packing/handling (2%) before margin is tested.
export const LANDED_COST_LOAD_RATE = 0.08;

export type CommerceSize = {
  code: string;
  label: string;
  detail: string;
  priceMultiplier: number;
};

export type CommerceTier = {
  minQty: number;
  unitPrice: number;
};

type LandedCostTier = {
  minQty: number;
  unitCost: number;
};

export type CommerceProduct = {
  code: string;
  sizes: CommerceSize[];
  tiers: CommerceTier[];
  quoteThreshold: number;
  setupFee: number;
  shippingBase: number;
  shippingPerUnit: number;
  shippingCap: number;
};

const size = (code: string, label: string, detail: string, priceMultiplier = 1): CommerceSize => ({
  code,
  label,
  detail,
  priceMultiplier,
});

const tiers = (...values: Array<[number, number]>): CommerceTier[] =>
  values.map(([minQty, unitPrice]) => ({ minQty, unitPrice }));

const costs = (...values: Array<[number, number]>): LandedCostTier[] =>
  values.map(([minQty, unitCost]) => ({ minQty, unitCost }));

const shared = {
  setupFee: 1_499,
  shippingBase: 499,
  shippingPerUnit: 0.12,
  shippingCap: 2_499,
};

export const COMMERCE_PRODUCTS: Record<string, CommerceProduct> = {
  "FP-101": { code: "FP-101", sizes: [size("100G", "100 g", "110 x 170 + 60 mm" , 0.82), size("250G", "250 g", "140 x 220 + 80 mm"), size("500G", "500 g", "180 x 260 + 90 mm", 1.18), size("1KG", "1 kg", "220 x 310 + 110 mm", 1.42)], tiers: tiers([250, 22], [500, 17.5], [1_000, 13.5], [2_500, 9.8], [5_000, 7.8]), quoteThreshold: 20_000, ...shared, setupFee: 999 },
  "FP-103": { code: "FP-103", sizes: [size("250G", "250 g", "130 x 210 + 70 mm", 0.86), size("500G", "500 g", "160 x 250 + 90 mm"), size("1KG", "1 kg", "200 x 300 + 110 mm", 1.28), size("2KG", "2 kg", "250 x 360 + 130 mm", 1.58)], tiers: tiers([500, 22], [1_000, 17], [2_500, 12.8], [5_000, 9.8]), quoteThreshold: 20_000, ...shared },
  "FP-104": { code: "FP-104", sizes: [size("250ML", "250 ml", "120 x 190 + 60 mm", 0.82), size("500ML", "500 ml", "140 x 230 + 70 mm"), size("1L", "1 litre", "180 x 280 + 90 mm", 1.26), size("2L", "2 litres", "220 x 330 + 110 mm", 1.55)], tiers: tiers([500, 18.5], [1_000, 14.5], [2_500, 10.8], [5_000, 8.4], [10_000, 6.9]), quoteThreshold: 20_000, ...shared },
  "FP-105": { code: "FP-105", sizes: [size("5G", "5 g / ml", "45 x 70 mm", 0.72), size("10G", "10 g / ml", "55 x 90 mm"), size("20G", "20 g / ml", "65 x 110 mm", 1.2), size("50G", "50 g / ml", "80 x 130 mm", 1.48)], tiers: tiers([5_000, 2.4], [10_000, 1.85], [25_000, 1.35], [50_000, 1.05]), quoteThreshold: 100_000, ...shared },
  "BC-201": { code: "BC-201", sizes: [size("100ML", "100 ml", "Stock PET / HDPE", 0.72), size("250ML", "250 ml", "Stock PET / HDPE"), size("500ML", "500 ml", "Stock PET / HDPE", 1.28), size("1L", "1 litre", "Stock PET / HDPE", 1.65)], tiers: tiers([500, 24], [1_000, 18.5], [2_500, 14], [5_000, 11]), quoteThreshold: 20_000, ...shared },
  "BC-202": { code: "BC-202", sizes: [size("200ML", "200 ml", "Stock glass", 0.78), size("500ML", "500 ml", "Stock glass"), size("750ML", "750 ml", "Stock glass", 1.24), size("1L", "1 litre", "Stock glass", 1.46)], tiers: tiers([200, 65], [500, 52], [1_000, 41], [2_500, 34]), quoteThreshold: 10_000, ...shared, shippingPerUnit: 1.1, shippingCap: 4_500 },
  "BC-204": { code: "BC-204", sizes: [size("30ML", "30 ml", "Stock cosmetic jar", 0.74), size("50ML", "50 ml", "Stock cosmetic jar"), size("100ML", "100 ml", "Stock cosmetic jar", 1.28), size("200ML", "200 ml", "Stock cosmetic jar", 1.62)], tiers: tiers([200, 52], [500, 41], [1_000, 32], [2_500, 26]), quoteThreshold: 10_000, ...shared },
  "BC-205": { code: "BC-205", sizes: [size("15ML", "15 ml", "Stock dropper bottle", 0.75), size("30ML", "30 ml", "Stock dropper bottle"), size("50ML", "50 ml", "Stock dropper bottle", 1.18), size("100ML", "100 ml", "Stock dropper bottle", 1.48)], tiers: tiers([200, 44], [500, 35], [1_000, 28], [2_500, 23]), quoteThreshold: 10_000, ...shared },
  "BC-206": { code: "BC-206", sizes: [size("30ML", "30 ml", "Stock airless pump", 0.82), size("50ML", "50 ml", "Stock airless pump"), size("100ML", "100 ml", "Stock airless pump", 1.28), size("150ML", "150 ml", "Stock airless pump", 1.46)], tiers: tiers([200, 88], [500, 72], [1_000, 59], [2_500, 49]), quoteThreshold: 10_000, ...shared },
  "BC-214": { code: "BC-214", sizes: [size("250ML", "250 ml", "Stock HDPE / PET", 0.82), size("500ML", "500 ml", "Stock HDPE / PET"), size("1L", "1 litre", "Stock HDPE / PET", 1.42)], tiers: tiers([250, 54], [500, 43], [1_000, 34], [2_500, 27]), quoteThreshold: 10_000, ...shared },
  "TS-301": { code: "TS-301", sizes: [size("30ML", "30 ml", "25 mm diameter", 0.78), size("50ML", "50 ml", "30 mm diameter"), size("100ML", "100 ml", "35 mm diameter", 1.25), size("150ML", "150 ml", "40 mm diameter", 1.45)], tiers: tiers([1_000, 18], [2_500, 14.5], [5_000, 11.5], [10_000, 9.2]), quoteThreshold: 25_000, ...shared },
  "TS-306": { code: "TS-306", sizes: [size("50ML", "50 ml", "30 mm diameter", 0.78), size("100ML", "100 ml", "35 mm diameter"), size("150ML", "150 ml", "40 mm diameter", 1.24), size("200ML", "200 ml", "45 mm diameter", 1.46)], tiers: tiers([500, 30], [1_000, 24], [2_500, 18], [5_000, 14.5]), quoteThreshold: 20_000, ...shared },
  "BX-401": { code: "BX-401", sizes: [size("S", "Small", "60 x 35 x 100 mm", 0.78), size("M", "Medium", "90 x 50 x 140 mm"), size("L", "Large", "130 x 70 x 190 mm", 1.34)], tiers: tiers([25, 52], [50, 45], [100, 38], [250, 25], [500, 18], [1_000, 14]), quoteThreshold: 10_000, ...shared },
  "BX-402": { code: "BX-402", sizes: [size("S", "Small", "120 x 90 x 45 mm", 0.8), size("M", "Medium", "180 x 130 x 60 mm"), size("L", "Large", "250 x 180 x 80 mm", 1.36)], tiers: tiers([50, 340], [100, 275], [250, 225], [500, 178], [1_000, 145]), quoteThreshold: 5_000, ...shared, shippingPerUnit: 1.2, shippingCap: 5_500 },
  "BX-403": { code: "BX-403", sizes: [size("S", "Small", "120 x 90 x 45 mm", 0.8), size("M", "Medium", "180 x 130 x 60 mm"), size("L", "Large", "250 x 180 x 80 mm", 1.36)], tiers: tiers([50, 395], [100, 325], [250, 255], [500, 205], [1_000, 169]), quoteThreshold: 5_000, ...shared, shippingPerUnit: 1.4, shippingCap: 6_500 },
  "BX-404": { code: "BX-404", sizes: [size("S", "Small", "60 x 35 x 100 mm", 0.78), size("M", "Medium", "90 x 50 x 140 mm"), size("L", "Large", "130 x 70 x 190 mm", 1.34)], tiers: tiers([25, 48], [50, 40], [100, 34], [250, 23], [500, 16.8], [1_000, 12.9]), quoteThreshold: 10_000, ...shared },
  "BX-405": { code: "BX-405", sizes: [size("S", "Small", "90 x 60 x 25 mm", 0.8), size("M", "Medium", "140 x 90 x 35 mm"), size("L", "Large", "200 x 130 x 50 mm", 1.38)], tiers: tiers([25, 95], [50, 72], [100, 51], [250, 35], [500, 27]), quoteThreshold: 5_000, ...shared },
  "BX-406": { code: "BX-406", sizes: [size("S", "Small", "60 x 35 x 100 mm", 0.78), size("M", "Medium", "90 x 50 x 140 mm"), size("L", "Large", "130 x 70 x 190 mm", 1.34)], tiers: tiers([25, 59], [50, 50], [100, 42], [250, 29], [500, 21], [1_000, 16]), quoteThreshold: 10_000, ...shared },
  "BX-408": { code: "BX-408", sizes: [size("S", "Small", "120 x 90 x 45 mm", 0.8), size("M", "Medium", "180 x 130 x 60 mm"), size("L", "Large", "250 x 180 x 80 mm", 1.36)], tiers: tiers([50, 345], [100, 285], [250, 220], [500, 178], [1_000, 149]), quoteThreshold: 5_000, ...shared, shippingPerUnit: 1.25, shippingCap: 5_500 },
  "BX-412": { code: "BX-412", sizes: [size("S", "Small", "60 x 35 x 100 mm", 0.78), size("M", "Medium", "80 x 50 x 140 mm"), size("L", "Large", "130 x 70 x 190 mm", 1.34)], tiers: tiers([25, 52], [50, 45], [100, 38], [250, 25], [500, 18.5], [1_000, 14.2]), quoteThreshold: 10_000, ...shared },
  "EC-501": { code: "EC-501", sizes: [size("S", "Small", "6 x 4 x 2 in", 0.78), size("M", "Medium", "9 x 6 x 3 in"), size("L", "Large", "12 x 9 x 4 in", 1.38)], tiers: tiers([50, 34], [100, 29], [250, 24], [500, 20], [1_000, 17], [2_500, 14]), quoteThreshold: 10_000, ...shared, setupFee: 0, shippingPerUnit: 0.45, shippingCap: 4_500 },
  "EC-502": { code: "EC-502", sizes: [size("S", "Small", "8 x 6 x 4 in", 0.8), size("M", "Medium", "12 x 9 x 6 in"), size("L", "Large", "16 x 12 x 8 in", 1.42)], tiers: tiers([500, 28], [1_000, 23], [2_500, 18], [5_000, 14]), quoteThreshold: 20_000, ...shared, shippingPerUnit: 0.4, shippingCap: 5_000 },
  "EC-503": { code: "EC-503", sizes: [size("S", "Snack / burger", "120 x 120 x 70 mm", 0.8), size("M", "Meal", "180 x 120 x 65 mm"), size("L", "Family meal", "250 x 180 x 70 mm", 1.38)], tiers: tiers([200, 29], [500, 23], [1_000, 18], [2_500, 14]), quoteThreshold: 10_000, ...shared },
  "EC-504": { code: "EC-504", sizes: [size("S", "Small", "8 x 10 in", 0.78), size("M", "Medium", "10 x 12 in"), size("L", "Large", "12 x 16 in", 1.3), size("XL", "Extra large", "14 x 18 in", 1.55)], tiers: tiers([1_000, 7.5], [2_500, 5.9], [5_000, 4.6], [10_000, 3.8]), quoteThreshold: 25_000, ...shared },
  "PR-601": { code: "PR-601", sizes: [size("HONEYCOMB", "Honeycomb paper", "500 mm x 50 m roll"), size("BUBBLE", "Bubble wrap", "1 m x 50 m roll", 0.82), size("AIR", "Air pillows", "200 x 100 mm, 1,000 pillows", 0.9), size("CRINKLE", "Crinkle paper", "10 kg carton", 1.35)], tiers: tiers([1, 1_450], [5, 1_290], [10, 1_180], [25, 1_060]), quoteThreshold: 100, ...shared, setupFee: 0, shippingPerUnit: 40, shippingCap: 4_500 },
  "LC-804": { code: "LC-804", sizes: [size("40MM", "40 mm", "Circle / square", 0.72), size("60MM", "60 mm", "Circle / square"), size("90MM", "90 mm", "Circle / square", 1.45), size("100X150", "100 x 150 mm", "Rectangle", 1.95)], tiers: tiers([25, 12], [50, 9.5], [100, 8.2], [250, 5.1], [500, 3.65], [1_000, 2.65], [2_500, 1.85], [5_000, 1.35]), quoteThreshold: 25_000, ...shared, setupFee: 0, shippingBase: 149, shippingPerUnit: 0.02, shippingCap: 999 },
  "LC-805": { code: "LC-805", sizes: [size("40MM", "40 mm", "Circle / square", 0.72), size("60MM", "60 mm", "Circle / square"), size("90MM", "90 mm", "Circle / square", 1.45), size("100X150", "100 x 150 mm", "Rectangle", 1.95)], tiers: tiers([25, 12.5], [50, 10.5], [100, 9.2], [250, 5.8], [500, 4.1], [1_000, 3], [2_500, 2.1], [5_000, 1.5]), quoteThreshold: 25_000, ...shared, setupFee: 0, shippingBase: 149, shippingPerUnit: 0.02, shippingCap: 999 },
  "LC-815": { code: "LC-815", sizes: [size("40MM", "40 mm", "Circle / square", 0.72), size("60MM", "60 mm", "Circle / square"), size("90MM", "90 mm", "Circle / square", 1.45), size("100X150", "100 x 150 mm", "Rectangle", 1.95)], tiers: tiers([50, 18], [100, 13.5], [250, 8.9], [500, 6.5], [1_000, 4.8], [2_500, 3.4]), quoteThreshold: 10_000, ...shared, setupFee: 599, shippingBase: 149, shippingPerUnit: 0.02, shippingCap: 999 },
  "LC-816": { code: "LC-816", sizes: [size("40R", "40 mm round", "Round"), size("60R", "60 mm round", "Round", 1.35), size("90R", "90 mm round", "Round", 2.05)], tiers: tiers([25, 8.5], [50, 6.8], [100, 5.8], [250, 3.6], [500, 2.6], [1_000, 1.95], [2_500, 1.4], [5_000, 1.05]), quoteThreshold: 25_000, ...shared, setupFee: 0, shippingBase: 149, shippingPerUnit: 0.02, shippingCap: 999 },
  "LC-817": { code: "LC-817", sizes: [size("40S", "40 x 40 mm", "Square"), size("60S", "60 x 60 mm", "Square", 1.35), size("90S", "90 x 90 mm", "Square", 2.05)], tiers: tiers([25, 8.5], [50, 6.8], [100, 5.8], [250, 3.6], [500, 2.6], [1_000, 1.95], [2_500, 1.4], [5_000, 1.05]), quoteThreshold: 25_000, ...shared, setupFee: 0, shippingBase: 149, shippingPerUnit: 0.02, shippingCap: 999 },
  "LC-818": { code: "LC-818", sizes: [size("50X30", "50 x 30 mm", "Rectangle", 0.78), size("75X50", "75 x 50 mm", "Rectangle"), size("100X150", "100 x 150 mm", "Rectangle", 2.15)], tiers: tiers([25, 8.5], [50, 7.2], [100, 6.4], [250, 4], [500, 2.9], [1_000, 2.2], [2_500, 1.58], [5_000, 1.18]), quoteThreshold: 25_000, ...shared, setupFee: 0, shippingBase: 149, shippingPerUnit: 0.02, shippingCap: 999 },
  "LC-819": { code: "LC-819", sizes: [size("50X30", "50 x 30 mm", "Oval", 0.78), size("70X45", "70 x 45 mm", "Oval"), size("90X60", "90 x 60 mm", "Oval", 1.42)], tiers: tiers([25, 8.5], [50, 7.2], [100, 6.4], [250, 4], [500, 2.9], [1_000, 2.2], [2_500, 1.58], [5_000, 1.18]), quoteThreshold: 25_000, ...shared, setupFee: 0, shippingBase: 149, shippingPerUnit: 0.02, shippingCap: 999 },
  "LC-820": { code: "LC-820", sizes: [size("50MAX", "Up to 50 x 50 mm", "Custom contour", 0.78), size("75MAX", "Up to 75 x 75 mm", "Custom contour"), size("100MAX", "Up to 100 x 100 mm", "Custom contour", 1.42)], tiers: tiers([25, 13.5], [50, 10.5], [100, 8.5], [250, 5.4], [500, 3.8], [1_000, 2.8], [2_500, 2]), quoteThreshold: 10_000, ...shared, setupFee: 399, shippingBase: 149, shippingPerUnit: 0.02, shippingCap: 999 },
  "BC-213": { code: "BC-213", sizes: [size("10ML", "10 ml attar", "Roll-on / screw cap", 0.78), size("30ML", "30 ml perfume", "Crimp / spray"), size("50ML", "50 ml perfume", "Crimp / spray", 1.22), size("100ML", "100 ml perfume", "Crimp / spray", 1.48)], tiers: tiers([100, 72], [250, 58], [500, 48], [1_000, 40]), quoteThreshold: 5_000, ...shared },
  "EC-505": { code: "EC-505", sizes: [size("S", "Small", "150 x 220 mm", 0.78), size("M", "Medium", "180 x 260 mm"), size("L", "Large", "250 x 330 mm", 1.28), size("XL", "Extra large", "300 x 400 mm", 1.52)], tiers: tiers([100, 20], [250, 15], [500, 11.8], [1_000, 9.5]), quoteThreshold: 10_000, ...shared },
  "EC-509": { code: "EC-509", sizes: [size("S", "Accessories", "200 x 280 mm", 0.78), size("M", "T-shirt", "300 x 400 mm"), size("L", "Sweatshirt", "350 x 450 mm", 1.25), size("XL", "Bulk apparel", "450 x 550 mm", 1.52)], tiers: tiers([100, 18], [250, 13.5], [500, 10.5], [1_000, 8.5]), quoteThreshold: 10_000, ...shared },
  "EC-510": { code: "EC-510", sizes: [size("S", "Small", "180 x 220 x 80 mm", 0.8), size("M", "Medium", "250 x 300 x 100 mm"), size("L", "Large", "320 x 400 x 120 mm", 1.32)], tiers: tiers([50, 20], [100, 15], [250, 10.5], [500, 8.2]), quoteThreshold: 5_000, ...shared },
  "LC-808": { code: "LC-808", sizes: [size("TAG", "Hang tag", "55 x 90 mm"), size("A7", "A7 insert", "74 x 105 mm", 1.12), size("A6", "A6 insert", "105 x 148 mm", 1.28)], tiers: tiers([50, 9.5], [100, 6.2], [250, 3.8], [500, 2.8]), quoteThreshold: 10_000, ...shared },
  "LC-810": { code: "LC-810", sizes: [size("HALF", "Half sheet", "375 x 500 mm", 0.72), size("FULL", "Full sheet", "500 x 750 mm"), size("XL", "Extra large", "750 x 1000 mm", 1.42)], tiers: tiers([250, 11.5], [500, 9], [1_000, 7], [2_500, 5.6]), quoteThreshold: 10_000, ...shared },
  "LC-811": { code: "LC-811", sizes: [size("48X50", "48 mm x 50 m", "Standard carton tape", 0.88), size("48X65", "48 mm x 65 m", "Standard carton tape"), size("72X65", "72 mm x 65 m", "Wide carton tape", 1.38)], tiers: tiers([72, 82], [144, 70], [360, 58], [720, 49]), quoteThreshold: 5_000, ...shared },
  "SP-905": { code: "SP-905", sizes: [size("6X6", "6 x 6 in", "Snack clamshell", 0.75), size("9X6", "9 x 6 in", "Meal clamshell"), size("9X9", "9 x 9 in", "Large / 3-compartment", 1.35)], tiers: tiers([100, 18.5], [250, 17.5], [500, 16.75], [1_000, 13.65], [2_500, 11.35], [5_000, 9.7]), quoteThreshold: 20_000, ...shared },
  "SP-907": { code: "SP-907", sizes: [size("200ML", "200 ml bowl", "116 mm lid", 0.72), size("300ML", "300 ml bowl", "116 mm lid", 0.8), size("500ML", "500 ml bowl", "116 mm lid"), size("750ML-TALL", "750 ml bowl", "116 mm lid", 1.18), size("600ML-FLAT", "600 ml flat bowl", "148 mm lid", 1.16), size("750ML-FLAT", "750 ml flat bowl", "148 mm lid", 1.3), size("1000ML", "1,000 ml flat bowl", "148 mm lid", 1.52), size("1250ML", "1,250 ml flat bowl", "148 mm lid", 1.72)], tiers: tiers([100, 14.2], [250, 12.5], [500, 10.8], [1_000, 9.5], [2_500, 8], [5_000, 6.65], [10_000, 5.25]), quoteThreshold: 25_000, ...shared },
  "SP-909": { code: "SP-909", sizes: [size("250", "250 x 250 mm", "Snack / bakery wrap", 0.82), size("300", "300 x 300 mm", "Burger / deli wrap"), size("400", "400 x 400 mm", "Tray liner / large wrap", 1.32)], tiers: tiers([250, 5.7], [500, 5.35], [1_000, 5], [2_500, 4], [5_000, 3.2], [10_000, 2.6]), quoteThreshold: 50_000, ...shared },
};

// Conservative pre-GST landed-cost assumptions. These are a checkout guard, not
// a substitute for a signed supplier rate card. Refresh before enabling a SKU.
const LANDED_COSTS: Record<string, LandedCostTier[]> = {
  "FP-101": costs([250, 13.5], [500, 10.5], [1_000, 8.1], [2_500, 6], [5_000, 4.8]),
  "FP-103": costs([500, 13], [1_000, 10.5], [2_500, 8], [5_000, 6.2]),
  "FP-104": costs([500, 11.5], [1_000, 9], [2_500, 7], [5_000, 5.2], [10_000, 4.2]),
  "FP-105": costs([5_000, 1.35], [10_000, 1.05], [25_000, 0.78], [50_000, 0.6]),
  "BC-201": costs([500, 14], [1_000, 10.8], [2_500, 8.2], [5_000, 6.3]),
  "BC-202": costs([200, 40], [500, 32], [1_000, 25], [2_500, 21]),
  "BC-204": costs([200, 32], [500, 25], [1_000, 20], [2_500, 16]),
  "BC-205": costs([200, 27], [500, 21], [1_000, 17], [2_500, 14]),
  "BC-206": costs([200, 58], [500, 48], [1_000, 42], [2_500, 35]),
  "BC-214": costs([250, 32], [500, 25], [1_000, 20], [2_500, 16]),
  "TS-301": costs([1_000, 12], [2_500, 9], [5_000, 7], [10_000, 5.5]),
  "TS-306": costs([500, 18], [1_000, 14.5], [2_500, 10.8], [5_000, 8.6]),
  "BX-401": costs([25, 31], [50, 26], [100, 22], [250, 14.5], [500, 10.5], [1_000, 8.2]),
  "BX-402": costs([50, 204], [100, 165], [250, 135], [500, 105], [1_000, 85]),
  "BX-403": costs([50, 237], [100, 190], [250, 150], [500, 120], [1_000, 99]),
  "BX-404": costs([25, 29], [50, 24], [100, 20], [250, 13.5], [500, 9.8], [1_000, 7.5]),
  "BX-405": costs([25, 57], [50, 42], [100, 30], [250, 20.5], [500, 15.8]),
  "BX-406": costs([25, 35], [50, 30], [100, 24.5], [250, 17], [500, 12.3], [1_000, 9.4]),
  "BX-408": costs([50, 207], [100, 165], [250, 128], [500, 103], [1_000, 86]),
  "BX-412": costs([25, 31], [50, 26], [100, 22], [250, 14.5], [500, 10.8], [1_000, 8.4]),
  "EC-501": costs([50, 20], [100, 17], [250, 14], [500, 11.5], [1_000, 9.5], [2_500, 8]),
  "EC-502": costs([500, 18], [1_000, 15], [2_500, 12], [5_000, 9]),
  "EC-503": costs([200, 18], [500, 14], [1_000, 11], [2_500, 8.5]),
  "EC-504": costs([1_000, 4.5], [2_500, 3.6], [5_000, 2.8], [10_000, 2.3]),
  "PR-601": costs([1, 900], [5, 800], [10, 730], [25, 650]),
  "LC-804": costs([25, 7.2], [50, 5.7], [100, 4.85], [250, 3.02], [500, 2.16], [1_000, 1.57], [2_500, 1.09], [5_000, 0.79]),
  "LC-805": costs([25, 7.5], [50, 6.2], [100, 5.45], [250, 3.42], [500, 2.42], [1_000, 1.77], [2_500, 1.24], [5_000, 0.88]),
  "LC-815": costs([50, 10.8], [100, 8], [250, 5.25], [500, 3.82], [1_000, 2.82], [2_500, 2]),
  "LC-816": costs([25, 5.1], [50, 4.05], [100, 3.45], [250, 2.15], [500, 1.55], [1_000, 1.16], [2_500, 0.83], [5_000, 0.62]),
  "LC-817": costs([25, 5.1], [50, 4.05], [100, 3.45], [250, 2.15], [500, 1.55], [1_000, 1.16], [2_500, 0.83], [5_000, 0.62]),
  "LC-818": costs([25, 5.1], [50, 4.3], [100, 3.8], [250, 2.38], [500, 1.72], [1_000, 1.3], [2_500, 0.94], [5_000, 0.7]),
  "LC-819": costs([25, 5.1], [50, 4.3], [100, 3.8], [250, 2.38], [500, 1.72], [1_000, 1.3], [2_500, 0.94], [5_000, 0.7]),
  "LC-820": costs([25, 8.1], [50, 6.3], [100, 5], [250, 3.2], [500, 2.25], [1_000, 1.65], [2_500, 1.18]),
  "BC-213": costs([100, 45], [250, 36], [500, 30], [1_000, 25]),
  "EC-505": costs([100, 12], [250, 9], [500, 7], [1_000, 5.8]),
  "EC-509": costs([100, 11], [250, 8.3], [500, 6.4], [1_000, 5.1]),
  "EC-510": costs([50, 12], [100, 9], [250, 6.4], [500, 5]),
  "LC-808": costs([50, 5.5], [100, 3.8], [250, 2.4], [500, 1.7]),
  "LC-810": costs([250, 7], [500, 5.5], [1_000, 4.2], [2_500, 3.4]),
  "LC-811": costs([72, 75], [144, 62], [360, 50], [720, 42]),
  "SP-905": costs([100, 11], [250, 10.5], [500, 10.07], [1_000, 8.2], [2_500, 6.8], [5_000, 5.8]),
  "SP-907": costs([100, 8.5], [250, 7.5], [500, 6.5], [1_000, 5.7], [2_500, 4.8], [5_000, 4], [10_000, 3.15]),
  "SP-909": costs([250, 3.4], [500, 3.2], [1_000, 3], [2_500, 2.4], [5_000, 1.9], [10_000, 1.55]),
};

function roundUpCurrency(value: number): number {
  return Math.ceil(value * 100) / 100;
}

function costAtQuantity(skuCode: string, quantity: number): number | undefined {
  const costTiers = LANDED_COSTS[skuCode];
  if (!costTiers?.length) return undefined;
  let selected = costTiers[0];
  for (const candidate of costTiers) if (quantity >= candidate.minQty) selected = candidate;
  return roundUpCurrency(selected.unitCost * (1 + LANDED_COST_LOAD_RATE));
}

export type CommerceConfiguration = Record<string, string>;

function configurationCostMultiplier(configuration: CommerceConfiguration = {}): number {
  let multiplier = 1;
  for (const value of Object.values(configuration)) {
    const option = String(value).toLowerCase();
    if (/coffee valve/.test(option)) multiplier *= 1.18;
    else if (/zipper|pump|spray|spout|cork/.test(option)) multiplier *= 1.08;
    if (/soft touch|foil|emboss|spot uv|metallic spray/.test(option)) multiplier *= 1.14;
    else if (/gloss|lamination|frosted/.test(option)) multiplier *= 1.03;
    if (/kraft|metallis|metaliz|high-barrier|mono-material|compostable|pcr|recycled/.test(option)) multiplier *= 1.08;
    if (/direct digital|custom printed|full.?colour/.test(option)) multiplier *= 1.10;
  }
  return Math.min(multiplier, 1.5);
}

function requiresManagedReview(configuration: CommerceConfiguration = {}): boolean {
  const entries = Object.entries(configuration).map(([key, value]) => `${key}:${value}`.toLowerCase()).join("|");
  return /custom.?dimension|unusual.?print|regulated|certification|required certificate|pharma grade|food contact test/.test(entries);
}

export function getEffectiveCommerceTiers(skuCode: string): CommerceTier[] {
  const product = COMMERCE_PRODUCTS[skuCode];
  if (!product) return [];
  return product.tiers.map((tier) => {
    const landedCost = costAtQuantity(skuCode, tier.minQty);
    const marginFloor = landedCost === undefined ? tier.unitPrice : roundUpCurrency(landedCost / (1 - TARGET_PRODUCT_GROSS_MARGIN));
    return { ...tier, unitPrice: Math.max(tier.unitPrice, marginFloor) };
  });
}

export type CommerceEstimateInput = {
  skuCode: string;
  quantity: number;
  sizeCode: string;
  artwork: "upload" | "design" | "none";
  delivery: "standard" | "blitz" | "warehouse";
  configuration?: CommerceConfiguration;
};

export type CommerceEstimate = {
  eligible: boolean;
  reason?: "unknown_product" | "invalid_quantity" | "invalid_size" | "managed_quote" | "payment_limit";
  unitPrice: number;
  material: number;
  setup: number;
  artwork: number;
  logistics: number;
  subtotal: number;
  gst: number;
  total: number;
  amountPaise: number;
  landedUnitCost?: number;
  grossMarginRate?: number;
  marginFloorApplied?: boolean;
  size?: CommerceSize;
};

export function getCommerceProduct(skuCode: string): CommerceProduct | undefined {
  return COMMERCE_PRODUCTS[skuCode];
}

export function calculateCommerceEstimate(input: CommerceEstimateInput): CommerceEstimate {
  const product = getCommerceProduct(input.skuCode);
  const empty = { unitPrice: 0, material: 0, setup: 0, artwork: 0, logistics: 0, subtotal: 0, gst: 0, total: 0, amountPaise: 0 };
  if (!product) return { eligible: false, reason: "unknown_product", ...empty };
  if (!Number.isInteger(input.quantity) || input.quantity < product.tiers[0].minQty) {
    return { eligible: false, reason: "invalid_quantity", ...empty };
  }
  if (input.quantity >= product.quoteThreshold) {
    return { eligible: false, reason: "managed_quote", ...empty };
  }
  if (requiresManagedReview(input.configuration)) {
    return { eligible: false, reason: "managed_quote", ...empty };
  }
  const selectedSize = product.sizes.find((item) => item.code === input.sizeCode);
  if (!selectedSize) return { eligible: false, reason: "invalid_size", ...empty };

  const effectiveTiers = getEffectiveCommerceTiers(input.skuCode);
  let tier = effectiveTiers[0];
  for (const candidate of effectiveTiers) {
    if (input.quantity >= candidate.minQty) tier = candidate;
  }

  const landedUnitCost = costAtQuantity(input.skuCode, input.quantity);
  const configurationMultiplier = configurationCostMultiplier(input.configuration);
  const sizedLandedUnitCost = landedUnitCost === undefined ? undefined : Number((landedUnitCost * selectedSize.priceMultiplier * configurationMultiplier).toFixed(2));
  const sizedTierPrice = tier.unitPrice * selectedSize.priceMultiplier * configurationMultiplier;
  const sizedMarginFloor = sizedLandedUnitCost === undefined
    ? sizedTierPrice
    : sizedLandedUnitCost / (1 - TARGET_PRODUCT_GROSS_MARGIN);
  const unitPrice = roundUpCurrency(Math.max(sizedTierPrice, sizedMarginFloor));
  const rawTier = product.tiers.find((candidate) => candidate.minQty === tier.minQty) ?? product.tiers[0];
  const grossMarginRate = sizedLandedUnitCost === undefined ? undefined : Number(((unitPrice - sizedLandedUnitCost) / unitPrice).toFixed(4));
  const material = Number((unitPrice * input.quantity).toFixed(2));
  const setup = input.artwork === "none" ? 0 : product.setupFee;
  const artwork = input.artwork === "design" ? 1_999 : 0;
  const deliveryAdd = input.delivery === "blitz" ? 1_200 : input.delivery === "warehouse" ? 300 : 0;
  const logistics = Number((Math.min(product.shippingCap, product.shippingBase + input.quantity * product.shippingPerUnit) + deliveryAdd).toFixed(2));
  const subtotal = Number((material + setup + artwork + logistics).toFixed(2));
  const gst = Number((subtotal * GST_RATE).toFixed(2));
  const total = Number((subtotal + gst).toFixed(2));
  const amountPaise = Math.round(total * 100);

  return {
    eligible: total <= RAZORPAY_PAYMENT_LIMIT_RUPEES,
    reason: total > RAZORPAY_PAYMENT_LIMIT_RUPEES ? "payment_limit" : undefined,
    unitPrice,
    material,
    setup,
    artwork,
    logistics,
    subtotal,
    gst,
    total,
    amountPaise,
    landedUnitCost: sizedLandedUnitCost,
    grossMarginRate,
    marginFloorApplied: tier.unitPrice > rawTier.unitPrice,
    size: selectedSize,
  };
}
