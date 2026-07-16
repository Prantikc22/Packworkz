import { SKUS, SKU_IMAGES, CATEGORIES, type Sku } from "./skus";

export type BuyingMode = "self_serve" | "assisted";

export type CatalogSku = Sku & {
  buyingMode: BuyingMode;
  industrySlugs: string[];
  sustainableTier?: "certified" | "recyclable" | "reusable";
  speedLabel: string;
};

export type IndustryCatalog = {
  slug: string;
  label: string;
  headline: string;
  pain: string;
  outcome: string;
  categories: string[];
  icon: string;
  featuredSkuCodes: string[];
};

export const ASSISTED_CATEGORIES = new Set(["rolls"]);

export const INDUSTRY_CATALOGS: IndustryCatalog[] = [
  {
    slug: "d2c",
    label: "D2C & E-commerce",
    headline: "Branded packaging for launches, drops, and repeat orders.",
    pain: "Generic mailers weaken first impressions and damage returns eat margin.",
    outcome: "Launch with branded SKUs, predictable MOQs, and a sample-first flow.",
    categories: ["ecommerce", "boxes", "sustainable", "labels"],
    icon: "local_shipping",
    featuredSkuCodes: ["EC-501", "EC-504", "EC-502", "SP-902", "LC-801"],
  },
  {
    slug: "food-beverage",
    label: "Food & Beverage",
    headline: "Food-safe packaging built for shelf life and Indian handling.",
    pain: "Moisture, leakage, and poor barrier specs quietly destroy repeat purchase.",
    outcome: "Choose food-grade pouches, jars, cartons, and certified eco options.",
    categories: ["flexible", "bottles", "sustainable"],
    icon: "restaurant",
    featuredSkuCodes: ["FP-101", "FP-104", "BC-203", "BC-202", "SP-904"],
  },
  {
    slug: "fmcg",
    label: "FMCG & Consumer",
    headline: "High-volume packaging with backup capacity.",
    pain: "One vendor delay can stall launches across every SKU.",
    outcome: "Standardize pouches, cartons, labels, and managed rollstock.",
    categories: ["flexible", "boxes", "labels", "rolls"],
    icon: "shopping_cart",
    featuredSkuCodes: ["BX-401", "RL-701", "LC-801", "FP-102", "BX-403"],
  },
  {
    slug: "pharma",
    label: "Pharma & Healthcare",
    headline: "Tamper-aware packaging with documentation discipline.",
    pain: "Unclear specs and missing compliance paperwork slow approvals.",
    outcome: "Configure bottles, cartons, blister packs, labels, and inserts.",
    categories: ["bottles", "tubes", "boxes", "labels", "protective"],
    icon: "medical_services",
    featuredSkuCodes: ["TS-302", "BC-201", "BX-401", "LC-801", "PR-602"],
  },
  {
    slug: "beauty",
    label: "Beauty & Cosmetics",
    headline: "Premium packaging that makes formulas feel worth more.",
    pain: "A good formulation feels average when the pack looks generic.",
    outcome: "Build cosmetic jars, tubes, droppers, rigid boxes, and labels.",
    categories: ["bottles", "tubes", "boxes", "labels"],
    icon: "spa",
    featuredSkuCodes: ["BC-204", "BC-205", "BC-206", "TS-301", "BX-402"],
  },
  {
    slug: "exports",
    label: "Export & Compliance",
    headline: "Export-ready packs with material and chain-of-custody proof.",
    pain: "Wrong documentation can hold shipments at the worst possible time.",
    outcome: "Select FSC, recyclable, protective, and food-contact ready packaging.",
    categories: ["sustainable", "protective", "boxes", "flexible"],
    icon: "public",
    featuredSkuCodes: ["SP-901", "SP-903", "EC-502", "PR-601", "FP-103"],
  },
];

const INDUSTRY_BY_CATEGORY = new Map<string, string[]>();
for (const industry of INDUSTRY_CATALOGS) {
  for (const category of industry.categories) {
    const existing = INDUSTRY_BY_CATEGORY.get(category) || [];
    INDUSTRY_BY_CATEGORY.set(category, [...existing, industry.slug]);
  }
}

export const CATALOG_SKUS: CatalogSku[] = SKUS.map((sku) => ({
  ...sku,
  buyingMode: ASSISTED_CATEGORIES.has(sku.category) ? "assisted" : "self_serve",
  industrySlugs: INDUSTRY_BY_CATEGORY.get(sku.category) || ["d2c"],
  sustainableTier: sku.is_eco
    ? sku.category === "sustainable"
      ? "certified"
      : "recyclable"
    : undefined,
  speedLabel: sku.is_smartstock ? "Fast dispatch" : `${sku.delivery_days_india} day lead time`,
}));

export const SELF_SERVE_SKUS = CATALOG_SKUS.filter((sku) => sku.buyingMode === "self_serve");
export const ASSISTED_SKUS = CATALOG_SKUS.filter((sku) => sku.buyingMode === "assisted");
export const SUSTAINABLE_SKUS = CATALOG_SKUS.filter((sku) => sku.is_eco || sku.category === "sustainable");

export function getCatalogSku(slug: string): CatalogSku | undefined {
  return CATALOG_SKUS.find((sku) => sku.slug === slug);
}

export function getCatalogImage(sku: CatalogSku | Sku): string {
  return SKU_IMAGES[sku.code] || "/categories/flexiblepacks.webp";
}

export function getCategoryLabel(category: string): string {
  return CATEGORIES.find((item) => item.slug === category)?.label || category;
}

export function getIndustryCatalog(slug: string) {
  return INDUSTRY_CATALOGS.find((industry) => industry.slug === slug);
}

export function getSkusForIndustry(slug: string): CatalogSku[] {
  const industry = getIndustryCatalog(slug);
  const matched = CATALOG_SKUS.filter((sku) => sku.industrySlugs.includes(slug));
  if (!industry) return matched;

  const priority = new Map(industry.featuredSkuCodes.map((code, index) => [code, index]));
  return [...matched].sort((a, b) => {
    const aRank = priority.get(a.code) ?? Number.MAX_SAFE_INTEGER;
    const bRank = priority.get(b.code) ?? Number.MAX_SAFE_INTEGER;
    if (aRank !== bRank) return aRank - bRank;
    return a.name.localeCompare(b.name);
  });
}

export function getConfigureHref(sku: CatalogSku): string {
  const path = sku.buyingMode === "self_serve" ? "/configure" : "/procurement-plan";
  return `${path}?sku=${encodeURIComponent(sku.code)}`;
}
