import { CATALOG_SKUS, getCatalogImage, type CatalogSku } from "@/lib/catalog";
import { CATEGORY_BY_ID, SEED_MANUFACTURERS } from "@/lib/manufacturers";
import { USE_CASE_BY_SLUG, titleCase, type UseCase } from "@/lib/use-cases";

export type ResolvedFormat = { sku: CatalogSku; why: string; image: string; fromPrice: number };

const unitPrices = (sku: CatalogSku) => (sku.price_tiers?.length ? sku.price_tiers.map((tier) => tier.unit_price) : [sku.price_min, sku.price_max]).filter((value) => value > 0);

/** Catalog SKUs for a use case, with live MOQ and price data. */
export function resolveFormats(useCase: UseCase): ResolvedFormat[] {
  return useCase.formats
    .map(([code, why]) => {
      const sku = CATALOG_SKUS.find((item) => item.code === code);
      if (!sku) return null;
      const prices = unitPrices(sku);
      return { sku, why, image: getCatalogImage(sku), fromPrice: prices.length ? Math.min(...prices) : 0 };
    })
    .filter(Boolean) as ResolvedFormat[];
}

export const COMPLIANCE: Record<UseCase["compliance"], { title: string; text: string; guide: string }> = {
  food: {
    title: "FSSAI labelling",
    text: "Food packs sold in India carry FSSAI-mandated information: product name, ingredients, nutrition, the veg or non-veg mark, net quantity, FSSAI licence number, batch and date marking. Materials in direct contact with food should be food-grade.",
    guide: "fssai-packaging-labelling-requirements-india",
  },
  supplement: {
    title: "Supplement labelling",
    text: "Health supplements and nutraceuticals are regulated by FSSAI's nutraceutical regulations, which set rules for ingredients, usage, advisory statements and permitted claims, alongside standard food labelling.",
    guide: "nutraceutical-supplement-packaging-india",
  },
  cosmetic: {
    title: "Cosmetic labelling",
    text: "Cosmetics sold in India are labelled under the Drugs and Cosmetics Rules and Legal Metrology rules: manufacturer details, ingredients, net quantity, batch number, manufacturing licence number and use-before date where applicable.",
    guide: "cosmetic-packaging-india-complete-guide",
  },
  general: {
    title: "Labelling and EPR",
    text: "Pre-packaged goods sold in India carry Legal Metrology declarations — manufacturer or packer details, net quantity, MRP, month and year of manufacture and consumer care details. Brands using plastic packaging also have EPR obligations.",
    guide: "epr-compliance-packaging-india-2026",
  },
};

const rupees = (value: number) => `₹${value.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

/** FAQ answers generated from live catalog and network data. */
export function faqsFor(useCase: UseCase): Array<[string, string]> {
  const formats = resolveFormats(useCase);
  const name = useCase.name;
  const faqs: Array<[string, string]> = [];
  if (formats.length) {
    faqs.push([
      `What is the minimum order for ${name} packaging?`,
      `It depends on the format: ${formats.slice(0, 4).map(({ sku }) => `${sku.name} from ${sku.moq.toLocaleString("en-IN")} ${sku.moq_unit}`).join(", ")}. Each product page shows the current minimum.`,
    ]);
    const priced = formats.filter((format) => format.fromPrice > 0);
    if (priced.length) {
      faqs.push([
        `How much does ${name} packaging cost in India?`,
        `Indicative prices start at ${priced.slice(0, 3).map(({ sku, fromPrice }) => `${rupees(fromPrice)} per ${sku.moq_unit.replace(/s$/, "")} for ${sku.name.toLowerCase()}`).join(", ")}, falling as quantity rises. Standard items are priced instantly online; custom specifications are confirmed within 4 business hours.`,
      ]);
    }
    const days = formats.map(({ sku }) => sku.delivery_days_india).filter(Boolean);
    if (days.length) {
      faqs.push([
        `How long does ${name} packaging take to deliver?`,
        `Typical production and delivery within India is about ${Math.min(...days)}–${Math.max(...days)} days after artwork approval, depending on the format. Exports are quoted per destination.`,
      ]);
    }
  }
  faqs.push([`Can I get samples before ordering ${name} packaging?`, "Yes. The Packworkz sample kit has 25–50+ real packaging samples and material swatches for ₹299 plus ₹100 shipping across India, so you can check formats and finishes before a bulk order."]);
  if (useCase.mfg) {
    const category = CATEGORY_BY_ID[useCase.mfg];
    const count = SEED_MANUFACTURERS.filter((m) => m.categories.includes(useCase.mfg!)).length;
    faqs.push([`Can Packworkz help me find a manufacturer for my ${name}?`, `Yes. Packworkz Make lists ${count} ${category.label.toLowerCase()} manufacturers offering private-label and contract manufacturing. Introductions are free with no commission, and Packworkz can supply your packaging straight to the factory's line.`]);
  }
  return faqs;
}

/** Title, description and keywords for a /packaging/:slug page (prerender and client). */
export function useCaseSeo(useCase: UseCase) {
  const formats = resolveFormats(useCase);
  const minMoq = formats.length ? Math.min(...formats.slice(0, 3).map(({ sku }) => sku.moq)) : 0;
  return {
    title: `${titleCase(useCase.name)} Packaging India | ${formats.slice(0, 2).map(({ sku }) => sku.name.replace(/^Custom Printed /, "")).join(", ")} | Packworkz`,
    description: `Packaging for ${useCase.name} in India: ${formats.slice(0, 3).map(({ sku }) => sku.name.toLowerCase()).join(", ")} and more${minMoq ? `, from ${minMoq.toLocaleString("en-IN")} units` : ""}. Compare MOQs and prices, labelling basics and order samples.`,
    keywords: useCase.keywords.join(", "),
  };
}

export function useCaseSeoFor(pathname: string) {
  const slug = pathname.match(/^\/packaging\/([^/]+)$/)?.[1];
  const useCase = slug ? USE_CASE_BY_SLUG[decodeURIComponent(slug)] : undefined;
  return useCase ? useCaseSeo(useCase) : undefined;
}
