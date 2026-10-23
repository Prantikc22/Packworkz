// Size choices for every product, so no quote arrives without dimensions.
// Products with priced online sizes use those (@workspace/commerce). Quote-only
// products get standard reference sizes, labelled the way buyers think about
// them — fill weight first, then W × H (+ gusset) in mm — or a required custom
// size where the format is always made to order (rolls, sleeves, die-cut shapes).
import { COMMERCE_PRODUCTS, type CommerceSize } from "@workspace/commerce";
import type { CustomField, Sku } from "./skus";

export type SizeOption = Pick<CommerceSize, "code" | "label" | "detail">;

const s = (code: string, label: string, detail: string): SizeOption => ({ code, label, detail });

export const QUOTE_SIZES: Record<string, SizeOption[]> = {
  "FP-106": [
    s("3G", "3 g", "72 × 99 mm"), s("7G", "7 g", "90 × 135 mm"), s("40G", "40 g", "110 × 165 mm"),
    s("120G", "120 g", "130 × 210 mm"), s("200G", "200 g", "160 × 230 mm"), s("350G", "350 g", "190 × 265 mm"),
  ],
  "FP-115": [s("5G", "5 g", "60 × 80 mm"), s("10G", "10 g", "80 × 100 mm"), s("25G", "25 g", "95 × 130 mm"), s("50G", "50 g", "110 × 160 mm")],
  "FP-102": [s("10G", "10 g", "70 × 100 mm"), s("25G", "25 g", "90 × 130 mm"), s("50G", "50 g", "110 × 160 mm"), s("100G", "100 g", "130 × 200 mm"), s("200G", "200 g", "160 × 240 mm")],
  "FP-107": [s("100G", "100 g", "80 × 200 mm + 35 mm side gussets"), s("250G", "250 g", "100 × 260 mm + 50 mm side gussets"), s("500G", "500 g", "120 × 320 mm + 65 mm side gussets"), s("1KG", "1 kg", "150 × 380 mm + 80 mm side gussets")],
  "FP-108": [s("250G", "250 g", "100 × 240 mm + 60 mm gussets"), s("500G", "500 g", "120 × 300 mm + 80 mm gussets"), s("1KG", "1 kg", "140 × 360 mm + 90 mm gussets"), s("2KG", "2 kg", "180 × 420 mm + 110 mm gussets")],
  "FP-109": [s("100G", "100 g", "120 × 200 mm + 40 mm bottom gusset"), s("250G", "250 g", "160 × 230 mm + 45 mm bottom gusset"), s("500G", "500 g", "180 × 290 mm + 50 mm bottom gusset"), s("1KG", "1 kg", "235 × 335 mm + 60 mm bottom gusset")],
  "FP-110": [s("100G", "100 g", "120 × 160 mm"), s("200G", "200 g", "130 × 180 mm"), s("300G", "300 g", "140 × 200 mm"), s("500G", "500 g", "160 × 230 mm")],
  "BX-407": [s("S", "Small", "120 × 80 × 100 mm"), s("M", "Medium", "180 × 100 × 120 mm"), s("L", "Large", "220 × 120 × 160 mm")],
  "BX-413": [s("S", "Small", "100 × 70 × 30 mm"), s("M", "Medium", "150 × 90 × 35 mm"), s("L", "Large", "200 × 120 × 50 mm")],
  "BX-414": [s("S", "Small", "70 × 30 × 110 mm"), s("M", "Medium", "90 × 40 × 140 mm"), s("L", "Large", "120 × 50 × 180 mm")],
  "TS-304": [s("50", "50 mm dia.", "50 × 100 mm (dia. × height)"), s("75", "75 mm dia.", "75 × 150 mm (dia. × height)"), s("90", "90 mm dia.", "90 × 200 mm (dia. × height)")],
  "BC-209": [s("50R", "50 g round", "60 × 35 mm (dia. × height)"), s("100R", "100 g round", "70 × 40 mm (dia. × height)"), s("250R", "250 g round", "85 × 55 mm (dia. × height)"), s("100RECT", "100 g rectangle", "95 × 60 × 25 mm")],
  "EC-511": [s("S", "Small", "150 × 200 mm"), s("M", "Medium", "200 × 250 mm"), s("L", "Large", "250 × 350 mm")],
};

// Products whose size is already chosen through an option (pizza box size, mithai box capacity).
const SIZE_FROM_OPTION = new Set(["EC-514", "BX-416"]);

/** Dimension fields a converter cannot quote without. */
const REQUIRED_KEYS = new Set([
  "width", "height", "length", "diameter", "web_width", "roll_width", "layflat", "cut_length",
  "container_height", "max_diameter", "volume_ml", "capacity_oz",
]);

export function sizeOptionsFor(sku: Pick<Sku, "code">): SizeOption[] {
  return COMMERCE_PRODUCTS[sku.code]?.sizes || QUOTE_SIZES[sku.code] || [];
}

export function sizeChosenByOption(sku: Pick<Sku, "code">) {
  return SIZE_FROM_OPTION.has(sku.code);
}

export function requiredSizeFields(sku: Pick<Sku, "code" | "customization_fields">): CustomField[] {
  if (SIZE_FROM_OPTION.has(sku.code)) return [];
  return sku.customization_fields.filter((field) => field.type === "number" && REQUIRED_KEYS.has(field.key));
}

/** Readable size for the quote record, e.g. "40 g — 110 × 165 mm". */
export function sizeText(option: SizeOption) {
  return option.detail ? `${option.label} — ${option.detail}` : option.label;
}
