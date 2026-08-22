import { SKUS, SKU_IMAGES, CATEGORIES, type Sku } from "./skus";
import { EXPANDED_SKUS, type PurchaseMode } from "./catalog-expansion";
import { COMMERCE_PRODUCTS, getEffectiveCommerceTiers } from "@workspace/commerce";

export type BuyingMode = "self_serve" | "assisted";

export type CatalogSku = Sku & {
  buyingMode: BuyingMode;
  purchaseMode: PurchaseMode;
  industrySlugs: string[];
  sustainableTier?: "certified" | "recyclable" | "reusable";
  speedLabel: string;
  publicBuyingPath: "instant" | "quote";
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

const BRIEF_CODES = new Set([
  "TS-302", "PR-602", "RL-701", "RL-702", "RL-703", "LC-802", "LC-803", "SP-902",
]);

const HYBRID_CODES = new Set([
  "FP-103", "FP-104", "BC-202", "BC-203", "BC-204", "BC-205", "BC-206", "TS-301", "BX-401", "EC-502", "EC-503", "SP-901", "SP-903", "SP-904",
]);

export const INDUSTRY_CATALOGS: IndustryCatalog[] = [
  {
    slug: "d2c",
    label: "D2C & E-commerce",
    headline: "Branded packaging for launches, drops, and repeat orders.",
    pain: "Generic mailers weaken first impressions and damage returns eat margin.",
    outcome: "Launch with branded SKUs, predictable MOQs, and a sample-first flow.",
    categories: ["ecommerce", "boxes", "sustainable", "labels"],
    icon: "local_shipping",
    featuredSkuCodes: ["EC-501", "EC-504", "EC-505", "EC-509", "LC-816"],
  },
  {
    slug: "food-beverage",
    label: "Food & Beverage",
    headline: "Food-safe packaging built for shelf life and Indian handling.",
    pain: "Moisture, leakage, and poor barrier specs quietly destroy repeat purchase.",
    outcome: "Choose food-grade pouches, jars, cartons, and certified eco options.",
    categories: ["flexible", "bottles", "sustainable"],
    icon: "restaurant",
    featuredSkuCodes: ["FP-101", "FP-104", "BC-202", "SP-905", "SP-907", "SP-912"],
  },
  {
    slug: "fmcg",
    label: "FMCG & Consumer",
    headline: "High-volume packaging with backup capacity.",
    pain: "One vendor delay can stall launches across every SKU.",
    outcome: "Standardize pouches, cartons, labels, and managed rollstock.",
    categories: ["flexible", "boxes", "labels", "rolls"],
    icon: "shopping_cart",
    featuredSkuCodes: ["BX-401", "RL-701", "LC-816", "FP-103", "EC-502"],
  },
  {
    slug: "pharma",
    label: "Pharma & Healthcare",
    headline: "Tamper-aware packaging with documentation discipline.",
    pain: "Unclear specs and missing compliance paperwork slow approvals.",
    outcome: "Configure bottles, cartons, labels, and protective inserts.",
    categories: ["bottles", "tubes", "boxes", "labels", "protective"],
    icon: "medical_services",
    featuredSkuCodes: ["BC-201", "BX-401", "LC-816", "PR-602"],
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
    featuredSkuCodes: ["EC-502", "PR-601", "FP-103", "SP-909", "EC-505"],
  },
];

const INDUSTRY_BY_CATEGORY = new Map<string, string[]>();
for (const industry of INDUSTRY_CATALOGS) {
  for (const category of industry.categories) {
    const existing = INDUSTRY_BY_CATEGORY.get(category) || [];
    INDUSTRY_BY_CATEGORY.set(category, [...existing, industry.slug]);
  }
}

function resolveMode(sku: Sku): PurchaseMode {
  if (sku.purchase_mode) return sku.purchase_mode;
  if (BRIEF_CODES.has(sku.code) || ASSISTED_CATEGORIES.has(sku.category)) return "brief";
  if (HYBRID_CODES.has(sku.code)) return "hybrid";
  return "instant";
}

function defaultTiers(sku: Sku) {
  if (sku.price_tiers?.length) return sku.price_tiers;
  // Source ranges often mix stock, printed and enterprise production methods.
  // Turning the raw minimum into the largest public tier can make a bigger
  // order cheaper in total. Use a conservative sell-price curve until matched
  // supplier rate cards replace these provisional defaults.
  return [
    { min_qty: sku.moq, unit_price: Number(sku.price_max.toFixed(2)), label: "Launch quantity" },
    { min_qty: sku.moq * 2, unit_price: Number((sku.price_max * 0.78).toFixed(2)) },
    { min_qty: sku.moq * 5, unit_price: Number((sku.price_max * 0.58).toFixed(2)) },
    { min_qty: sku.moq * 10, unit_price: Number((sku.price_max * 0.45).toFixed(2)), label: "Best unit rate" },
  ];
}

export const ALL_CATALOG_SKUS: Sku[] = [...SKUS, ...EXPANDED_SKUS];

// The source library stays broad for sourcing work, while the storefront is a
// deliberately operable launch range. Components and specialist industrial
// consumables become configuration options or managed requests instead of
// thin standalone product pages.
const STOREFRONT_EXCLUSIONS = new Set([
  // Flexible variants consolidated into the four self-serve pouch families
  // and two enterprise flexible-film briefs below.
  "FP-102", "FP-106", "FP-107", "FP-108", "FP-109", "FP-111", "FP-113",
  // Container shapes that are options within plastic/glass families, plus
  // specialist metal and industrial formats handled as managed requests.
  "BC-203", "BC-207", "BC-208", "BC-209", "BC-210", "BC-211", "BC-212",
  // Keep the core cosmetic tube public; specialist tube formats enter through
  // the general production brief when needed.
  "TS-302", "TS-303", "TS-304", "TS-305",
  // Keep the clearest D2C box families public. Additional presentation-box
  // constructions remain configuration options or managed requests.
  "BX-404", "BX-405", "BX-406", "BX-407", "BX-408", "BX-409", "BX-410", "BX-411", "BX-412",
  // Mailer material and return-strip choices are merged into two mailer pages.
  "EC-506", "EC-507", "EC-508", "EC-511", "EC-512", "EC-513",
  // Protective consumables become options within two clear jobs; specialist
  // tooling-led formats are handled as managed requests.
  "PR-603", "PR-604", "PR-605", "PR-606", "PR-607", "PR-608", "PR-609", "PR-610", "PR-611",
  // Flexible rollstock is consolidated; specialist pharma and bulk-industrial
  // formats are handled through the production brief.
  "RL-702", "RL-703", "RL-706", "RL-707", "RL-708", "RL-709", "RL-710", "RL-711",
  // Closures and fitments stay as component options. The legacy all-in-one
  // paper-label family is replaced by pictured shape-specific SKUs.
  "LC-801", "LC-802", "LC-803", "LC-807", "LC-809", "LC-812", "LC-813",
  // Food-service variants are merged by material and converting process.
  "SP-901", "SP-902", "SP-903", "SP-904", "SP-906", "SP-910", "SP-911",
]);

const STOREFRONT_OVERRIDES: Record<string, Partial<Sku>> = {
  "FP-101": {
    description: "The core D2C pouch family for dry foods, supplements and pet products, with stock-label and direct-print routes.",
    variants: [
      { key: "closure", label: "Closure", options: ["Open top", "Resealable zipper", "Zipper + coffee valve"] },
      { key: "material", label: "Material", options: ["Clear barrier film", "Metallised barrier film", "Kraft laminate", "Mono-material PE"] },
      { key: "finish", label: "Finish", options: ["Matte", "Gloss", "Soft touch"] },
      { key: "branding", label: "Branding route", options: ["Premium applied label", "Direct digital print"] },
    ],
  },
  "FP-103": {
    name: "Flat-bottom & Gusseted Pouch",
    description: "A premium high-capacity pouch family covering flat-bottom, side-gusset and quad-seal constructions.",
    variants: [
      { key: "structure", label: "Structure", options: ["Flat bottom", "Side gusset", "Quad seal"] },
      { key: "closure", label: "Closure", options: ["Open top", "Resealable zipper", "Zipper + coffee valve"] },
      { key: "material", label: "Material", options: ["Metallised barrier film", "Kraft laminate", "Mono-material PE"] },
      { key: "finish", label: "Finish", options: ["Matte", "Gloss", "Soft touch"] },
    ],
  },
  "FP-104": {
    name: "Spout & Refill Pouch",
    description: "Leak-resistant refill packaging for liquids and concentrates, with corner or centre spouts and mono-material options.",
    use_case: "Home care, personal care, sauces, concentrates, oils and refill systems",
    variants: [
      { key: "spout", label: "Spout position", options: ["Corner spout", "Centre spout"] },
      { key: "material", label: "Material", options: ["PET/PE barrier laminate", "Mono-material PE"] },
      { key: "finish", label: "Finish", options: ["Matte", "Gloss"] },
    ],
  },
  "FP-112": {
    name: "Flow-wrap & Pillow Pack",
    description: "Enterprise roll-fed packaging for biscuits, snacks, bars and soap, specified around the filling machine and barrier requirement.",
  },
  "BC-201": {
    name: "Plastic Bottles & Jars",
    description: "Stock PET and HDPE containers for food, personal care and home care, configured by shape, neck and closure.",
    use_case: "Beverages, supplements, powders, sauces, personal care and home care",
    variants: [
      { key: "container", label: "Container", options: ["PET bottle", "HDPE bottle", "Wide-mouth PET jar"] },
      { key: "closure", label: "Closure", options: ["Screw cap", "Flip-top cap", "Disc-top cap", "Lotion pump"] },
      { key: "finish", label: "Finish", options: ["Clear", "Natural", "Amber", "Opaque white"] },
    ],
  },
  "BC-202": {
    name: "Glass Bottles & Jars",
    description: "Stock glass containers with compatible closures for food, beverage, wellness and premium retail products.",
    use_case: "Sauces, oils, beverages, preserves, candles and wellness products",
    variants: [
      { key: "container", label: "Container", options: ["Glass bottle", "Wide-mouth glass jar"] },
      { key: "glass", label: "Glass colour", options: ["Clear", "Amber", "Frosted"] },
      { key: "closure", label: "Closure", options: ["Metal lug cap", "Screw cap", "Cork"] },
    ],
  },
  "BX-401": {
    name: "Custom Printed Folding Carton",
    slug: "straight-tuck-end-carton",
    moq: 100,
    description: "A custom full-colour paperboard mono carton like the pictured snack packs, configured for the product, shelf presentation and packing line.",
    use_case: "Snacks, confectionery, bakery, supplements, beauty, pharma and retail products",
    variants: [
      { key: "structure", label: "Carton structure", options: ["Straight tuck end", "Reverse tuck end", "Auto-lock bottom"] },
      { key: "board", label: "Board", options: ["SBS/FBB", "Natural kraft", "Recycled board"] },
      { key: "print", label: "Custom print", options: ["Full-colour exterior", "Full-colour inside + outside", "Spot-colour print"] },
      { key: "finish", label: "Finish", options: ["Uncoated", "Matte lamination", "Gloss lamination", "Foil / spot UV accent"] },
    ],
  },
  "BX-402": {
    name: "Custom Printed Two-piece Rigid Box",
    slug: "two-piece-rigid-box",
    description: "A fully wrapped, custom-printed lift-off lid and base box for premium presentation, shown separately from folding cartons and magnetic constructions.",
    use_case: "Gifting, jewellery, beauty, fashion, electronics and premium D2C kits",
    variants: [
      { key: "insert", label: "Insert", options: ["None", "Paperboard", "EVA foam", "Moulded pulp"] },
      { key: "print", label: "Custom print", options: ["Full-colour exterior", "Full-colour inside + outside", "Solid colour wrap"] },
      { key: "finish", label: "Finish", options: ["Matte paper wrap", "Textured paper wrap", "Soft touch", "Foil + emboss accent"] },
    ],
  },
  "EC-504": {
    name: "Courier & Return Mailers",
    description: "Tamper-evident shipping mailers covering standard, recycled-content, compostable and return-ready formats.",
    variants: [
      { key: "material", label: "Material", options: ["Recycled-content PE", "Compostable film", "Opaque co-extruded PE"] },
      { key: "seal", label: "Seal", options: ["Single tamper seal", "Dual return-ready seal"] },
      { key: "print", label: "Branding", options: ["Plain", "1-colour print", "Full-colour print"] },
    ],
  },
  "EC-505": {
    name: "Paper & Padded Mailers",
    description: "Plastic-light paper shipping mailers configured as unpadded, paper-padded or bubble-lined formats.",
    use_case: "Apparel, books, jewellery, beauty, accessories and small electronics",
    variants: [
      { key: "cushioning", label: "Cushioning", options: ["Unpadded paper", "All-paper padding", "Bubble lining"] },
      { key: "paper", label: "Paper", options: ["Natural kraft", "White kraft", "Recycled kraft"] },
      { key: "print", label: "Branding", options: ["Plain", "1-colour print", "Full-colour print"] },
    ],
  },
  "EC-510": {
    name: "Custom Printed Paper Carry Bags",
    description: "Retail-ready paper carry bags with your brand printed on natural or white kraft, available in fixed, production-priced sizes.",
    use_case: "Bakery, cafes, retail, gifting, events, takeaway and D2C stores",
    variants: [
      { key: "paper", label: "Paper", options: ["Natural kraft", "White kraft", "Recycled kraft"] },
      { key: "handle", label: "Handle", options: ["Twisted paper", "Flat paper", "Cotton rope"] },
      { key: "branding", label: "Branding", options: ["1-colour print", "Full-colour print"] },
    ],
  },
  "PR-601": {
    name: "Protective Wrap & Void Fill",
    description: "A single fulfilment family for cushioning and void fill, selected by fragility, presentation and plastic-reduction target.",
    use_case: "E-commerce fulfilment, fragile goods, gifting, cosmetics and electronics",
    variants: [
      { key: "format", label: "Protection format", options: ["Bubble wrap", "Air pillows", "Honeycomb paper wrap", "Crinkle paper filler"] },
    ],
  },
  "PR-602": {
    name: "Custom Inserts & Dividers",
    description: "Engineered product retention and impact protection using foam, corrugated board or moulded fibre.",
    use_case: "Electronics, bottles, cosmetics, diagnostics, gifting and multi-product kits",
    variants: [
      { key: "material", label: "Insert material", options: ["EPE/EVA foam", "Corrugated board", "Moulded pulp"] },
      { key: "validation", label: "Validation", options: ["Fit check", "Drop-test target", "Cold-chain validation"] },
    ],
  },
  "RL-701": {
    name: "Printed Flexible Rollstock",
    description: "Enterprise printed film supplied to machine specification, including standard, high-barrier and mono-material structures.",
    variants: [
      { key: "structure", label: "Film structure", options: ["Standard laminate", "High-barrier laminate", "Recyclable mono-material"] },
      { key: "print", label: "Print process", options: ["Flexographic", "Rotogravure", "Digital"] },
    ],
  },
  "LC-804": {
    variants: [
      { key: "material", label: "Material", options: ["White BOPP", "White vinyl", "Freezer-grade film"] },
      { key: "adhesive", label: "Adhesive", options: ["Permanent", "Removable", "Freezer grade"] },
      { key: "finish", label: "Finish", options: ["Matte", "Gloss"] },
    ],
  },
  "LC-805": {
    variants: [
      { key: "material", label: "Material", options: ["Clear BOPP", "Clear PET"] },
      { key: "white_ink", label: "White ink", options: ["None", "Spot white", "Full white underprint"] },
      { key: "finish", label: "Finish", options: ["Gloss", "Matte"] },
    ],
  },
  "LC-814": {
    description: "Production roll labels engineered for the applicator, container and line speed. The detailed brief prevents wrong unwind, core and adhesive specifications.",
  },
  "LC-815": {
    variants: [
      { key: "effect", label: "Premium effect", options: ["Hot foil accent", "Raised varnish", "Holographic stock", "Textured paper"] },
      { key: "material", label: "Base material", options: ["Coated paper", "White BOPP", "Textured paper"] },
    ],
  },
  "LC-806": {
    name: "Shrink Sleeve & Wrap-around Labels",
    description: "Machine-applied bottle and container decoration specified around the substrate, shrink curve and line speed.",
  },
  "LC-808": {
    name: "Hang Tags & Insert Cards",
    description: "Short-run printed brand touchpoints covering hang tags, thank-you cards, care cards and header cards.",
    use_case: "Fashion, jewellery, beauty, gifting, product instructions and D2C unboxing",
    variants: [
      { key: "format", label: "Format", options: ["Hang tag", "Header card", "Thank-you card", "Care / instruction card"] },
      { key: "finish", label: "Finish", options: ["Uncoated", "Matte", "Gloss", "Foil accent"] },
    ],
  },
  "LC-811": {
    name: "Custom Packaging Tape",
    description: "Branded carton-sealing tape in BOPP or paper, configured by adhesive, colour and print coverage.",
    variants: [
      { key: "material", label: "Tape material", options: ["BOPP", "Self-adhesive kraft paper", "Water-activated paper"] },
      { key: "print", label: "Branding", options: ["Plain", "1-colour repeat", "2-colour repeat"] },
    ],
  },
  "SP-905": {
    name: "Bagasse Food Containers",
    description: "Plant-fibre takeaway packaging configured as clamshells or lidded meal trays, with removable branded sleeves or labels for a polished customer handoff.",
    variants: [
      { key: "format", label: "Format", options: ["Clamshell", "Meal tray with lid", "Compartment tray"] },
      { key: "branding", label: "Branding", options: ["Plain", "Custom branded sleeve", "Applied brand label"] },
    ],
  },
  "SP-907": {
    name: "Paper Bowls & Food Containers",
    description: "Food-safe white or kraft paper bowls in eight fixed capacities, including tall and flat formats with shared 11.6 cm or 14.8 cm lids.",
    use_case: "Curries, biryani, rice, noodles, salads, desserts, takeaway and cloud kitchens",
    variants: [
      { key: "paper", label: "Paper colour", options: ["White", "Natural kraft"] },
      { key: "lid", label: "Lid", options: ["Paper lid", "Clear recyclable lid", "No lid"] },
      { key: "branding", label: "Branding", options: ["Plain", "Applied label", "Custom printed"] },
    ],
  },
  "SP-912": {
    name: "Compostable Bio Paper Cups",
    description: "Aqueous-coated single-wall cups in five familiar beverage sizes, with optional moulded-fibre lids and a clear path from plain trials to custom-printed production.",
    use_case: "Coffee, tea, hot chocolate, cold drinks, tastings, events and takeaway beverages",
    variants: [
      { key: "lid", label: "Lid", options: ["No lid", "Compostable fibre sip lid", "Reclosable delivery lid"] },
      { key: "branding", label: "Branding", options: ["Plain", "Applied label", "Custom printed"] },
    ],
  },
};

function defaultQuoteThreshold(sku: Sku): number | undefined {
  if (sku.quote_threshold) return sku.quote_threshold;
  if (sku.purchase_mode === "brief" || ASSISTED_CATEGORIES.has(sku.category)) return undefined;
  if (sku.category === "labels") return 100000;
  if (sku.category === "protective") return 10000;
  if (sku.category === "bottles") return 25000;
  return 20000;
}

export const CATALOG_SKUS: CatalogSku[] = ALL_CATALOG_SKUS.filter((sku) => !STOREFRONT_EXCLUSIONS.has(sku.code)).map((sourceSku) => {
  const sku: Sku = { ...sourceSku, ...STOREFRONT_OVERRIDES[sourceSku.code] };
  const purchaseMode = resolveMode(sku);
  const commerceProduct = COMMERCE_PRODUCTS[sku.code];
  const commerceTiers = commerceProduct ? getEffectiveCommerceTiers(sku.code) : [];
  const resolvedTiers = commerceProduct
    ? commerceTiers.map((tier, index) => ({
        min_qty: tier.minQty,
        unit_price: tier.unitPrice,
        label: index === 0 ? "Launch quantity" : index === commerceTiers.length - 1 ? "Best online rate" : undefined,
      }))
    : purchaseMode === "brief" ? sku.price_tiers : defaultTiers(sku);
  return {
    ...sku,
    price_min: resolvedTiers?.length ? resolvedTiers[resolvedTiers.length - 1].unit_price : sku.price_min,
    price_max: resolvedTiers?.length ? resolvedTiers[0].unit_price : sku.price_max,
    purchase_mode: purchaseMode,
    purchaseMode,
    price_tiers: resolvedTiers,
    estimate_band: sku.estimate_band ?? (purchaseMode !== "instant"
      ? { unit_min: sku.price_min, unit_max: sku.price_max, setup_min: 5000, setup_max: 50000 }
      : undefined),
    buyingMode: purchaseMode === "brief" ? "assisted" : "self_serve",
    industrySlugs: INDUSTRY_BY_CATEGORY.get(sku.category) || ["d2c"],
    sustainableTier: sku.is_eco
      ? sku.category === "sustainable"
        ? "certified"
        : "recyclable"
      : undefined,
    speedLabel: purchaseMode === "brief" ? "Production brief" : sku.is_smartstock ? "Fast dispatch" : `${sku.delivery_days_india} day lead time`,
    publicBuyingPath: purchaseMode === "brief" ? "quote" : "instant",
    quote_threshold: commerceProduct?.quoteThreshold ?? defaultQuoteThreshold(sku),
  };
});

export const SELF_SERVE_SKUS = CATALOG_SKUS.filter((sku) => sku.buyingMode === "self_serve");
export const ASSISTED_SKUS = CATALOG_SKUS.filter((sku) => sku.buyingMode === "assisted");
export const SUSTAINABLE_SKUS = CATALOG_SKUS.filter((sku) => sku.is_eco || sku.category === "sustainable");

export function getCatalogSku(slug: string): CatalogSku | undefined {
  return CATALOG_SKUS.find((sku) => sku.slug === slug);
}

export function getCatalogSkuById(value: string): CatalogSku | undefined {
  return CATALOG_SKUS.find((sku) => sku.id === value || sku.code === value || sku.slug === value);
}

const CATEGORY_CROSS_LISTINGS: Record<string, Set<string>> = {
  ecommerce: new Set(["SP-905", "SP-907", "SP-912"]),
};

export function isCatalogSkuInCategory(sku: CatalogSku, category: string): boolean {
  return sku.category === category || CATEGORY_CROSS_LISTINGS[category]?.has(sku.code) === true;
}

export function getCatalogSkusByCategory(category: string): CatalogSku[] {
  return CATALOG_SKUS.filter((sku) => isCatalogSkuInCategory(sku, category));
}

export function getCatalogImage(sku: CatalogSku | Sku): string {
  const categoryFallbacks: Record<string, string> = {
    flexible: "/categories/flexiblepacks.webp",
    bottles: "/categories/liquid.webp",
    tubes: "/categories/tubes.webp",
    boxes: "/categories/boxes-cartons-v2.png",
    ecommerce: "/categories/ecom.webp",
    protective: "/categories/protectivepacks.webp",
    rolls: "/categories/printedrolls.webp",
    labels: "/categories/closures.webp",
    sustainable: "/categories/sustainable.webp",
  };
  return SKU_IMAGES[sku.code] || categoryFallbacks[sku.category] || "/categories/flexiblepacks.webp";
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

export function getMaxSelfServeQuantity(
  sku: Pick<CatalogSku, "publicBuyingPath" | "price_tiers" | "moq" | "quote_threshold">,
): number {
  if (sku.publicBuyingPath === "quote") return 0;

  const validatedTiers = (sku.price_tiers || [])
    .map((tier) => tier.min_qty)
    .filter((quantity) => !sku.quote_threshold || quantity < sku.quote_threshold);

  return Math.max(sku.moq, ...validatedTiers);
}

export function requiresQuote(sku: CatalogSku, quantity?: number): boolean {
  if (sku.publicBuyingPath === "quote") return true;
  if (!quantity) return false;

  const reachesConfiguredThreshold = Boolean(sku.quote_threshold && quantity >= sku.quote_threshold);
  const onlineQuantities = (sku.price_tiers || [])
    .map((tier) => tier.min_qty)
    .filter((tierQuantity) => !sku.quote_threshold || tierQuantity < sku.quote_threshold);
  const isListedOnlineQuantity = onlineQuantities.includes(quantity);
  return reachesConfiguredThreshold || quantity > getMaxSelfServeQuantity(sku) || !isListedOnlineQuantity;
}

export function getConfigureHref(sku: CatalogSku, quantity?: number): string {
  const path = requiresQuote(sku, quantity) ? "/procurement-plan" : "/configure";
  return `${path}?sku=${encodeURIComponent(sku.code)}`;
}

export function getUnitPriceForQuantity(sku: Pick<CatalogSku, "price_tiers" | "price_min" | "price_max" | "moq">, quantity: number): number {
  const tiers = [...(sku.price_tiers || [])].sort((a, b) => a.min_qty - b.min_qty);
  let matched = tiers[0]?.unit_price ?? sku.price_max;
  for (const tier of tiers) {
    if (quantity >= tier.min_qty) matched = tier.unit_price;
  }
  return matched;
}
