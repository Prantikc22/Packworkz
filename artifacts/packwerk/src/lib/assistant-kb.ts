// Instant answers for the site assistant. Every figure is read from the live
// catalog or network data so answers match the product pages.
import { CATALOG_SKUS, type CatalogSku } from "@/lib/catalog";
import { MFG_CATEGORIES, SEED_MANUFACTURERS } from "@/lib/manufacturers";
import { USE_CASES, titleCase, type UseCase } from "@/lib/use-cases";
import { resolveFormats } from "@/lib/use-case-content";

export type AssistantLink = { label: string; href: string };
export type AssistantAnswer = { text: string; links?: AssistantLink[]; intent: string; handoff?: boolean };

export const WHATSAPP = "https://wa.me/918208990366?text=Hi%20Packworkz%2C%20I%20have%20a%20question%20about%20packaging.";

const rupees = (value: number) => `₹${value.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
const lowestPrice = (sku: CatalogSku) => Math.min(...(sku.price_tiers?.length ? sku.price_tiers.map((t) => t.unit_price) : [sku.price_min]).filter((v) => v > 0));
const bySlug = (slug: string) => CATALOG_SKUS.find((sku) => sku.slug === slug);
const words = (value: string) => value.toLowerCase().replace(/[^a-z0-9₹\s-]/g, " ").split(/\s+/).filter((w) => w.length > 2);

type Intent = { id: string; keys: string[]; answer: () => AssistantAnswer };

const INTENTS: Intent[] = [
  {
    id: "moq", keys: ["moq", "minimum", "min order", "minimum order", "small quantity", "how many", "least", "low quantity"],
    answer: () => {
      const examples = ["round-paper-labels", "mailer-box", "straight-tuck-end-carton", "stand-up-pouch", "cosmetic-tube"].map(bySlug).filter(Boolean) as CatalogSku[];
      return {
        intent: "moq",
        text: `It depends on the format: ${examples.map((sku) => `${sku.name.replace(/^Custom Printed /, "").toLowerCase()} from ${sku.moq.toLocaleString("en-IN")} ${sku.moq_unit}`).join(", ")}. Every product page shows its exact minimum.`,
        links: [{ label: "Browse packaging", href: "/products" }, { label: "Low-MOQ guide", href: "/resources/low-moq-custom-packaging-india" }],
      };
    },
  },
  {
    id: "price", keys: ["price", "cost", "rate", "how much", "quote", "pricing", "cheap", "budget", "per piece", "per unit"],
    answer: () => {
      const examples = ["stand-up-pouch", "mailer-box", "round-paper-labels"].map(bySlug).filter(Boolean) as CatalogSku[];
      return {
        intent: "price",
        text: `Standard formats are priced instantly online; custom specs get a confirmed price within 4 business hours. Indicative starting rates: ${examples.map((sku) => `${sku.name.toLowerCase()} from ${rupees(lowestPrice(sku))} per ${sku.moq_unit.replace(/s$/, "")}`).join(", ")} — lower at higher quantities.`,
        links: [{ label: "Price my packaging", href: "/products" }, { label: "Cost guide", href: "/resources/custom-packaging-cost-india-2026" }],
      };
    },
  },
  {
    id: "samples", keys: ["sample", "samples", "kit", "swatch", "try before", "test pack"],
    answer: () => ({
      intent: "samples",
      text: "Yes — the Packworkz sample kit has 25–50+ real packaging samples and material swatches for ₹299 plus ₹100 shipping anywhere in India. It's the easiest way to feel formats and finishes before a bulk order.",
      links: [{ label: "Get the sample kit", href: "/samples" }],
    }),
  },
  {
    id: "delivery", keys: ["delivery", "deliver", "lead time", "how long", "days", "shipping time", "when will", "turnaround", "dispatch"],
    answer: () => {
      const days = CATALOG_SKUS.map((sku) => sku.delivery_days_india).filter(Boolean);
      return {
        intent: "delivery",
        text: `Most formats are produced and delivered within India in about ${Math.min(...days)}–${Math.max(...days)} days after you approve the artwork proof; each product page shows its own lead time. SmartStock can hold buffer stock for repeat orders, and exports are quoted per destination.`,
        links: [{ label: "How it works", href: "/how-it-works" }, { label: "SmartStock", href: "/smartstock" }],
      };
    },
  },
  {
    id: "artwork", keys: ["artwork", "design", "designer", "logo", "print file", "proof", "mockup", "3d", "dieline"],
    answer: () => ({
      intent: "artwork",
      text: "Upload your artwork when you order — we check it and send a digital proof, and nothing is printed until you approve. You can preview your pack in the 3D studio, or ask our design service to prepare print-ready files.",
      links: [{ label: "3D mockup studio", href: "/mockup-studio" }, { label: "Design service", href: "/design" }],
    }),
  },
  {
    id: "manufacturer", keys: ["manufacturer", "factory", "private label", "contract manufactur", "third party", "make my product", "white label", "co-pack", "copack"],
    answer: () => ({
      intent: "manufacturer",
      text: `Packworkz Make matches you with contract and private-label manufacturers — ${SEED_MANUFACTURERS.length} listed across ${MFG_CATEGORIES.length} categories, from snacks and bars to supplements and skincare. Introductions are free with no commission. Describe your product and you'll get a ranked shortlist.`,
      links: [{ label: "Find a manufacturer", href: "/manufacturing" }, { label: "Browse the directory", href: "/manufacturers" }],
    }),
  },
  {
    id: "list-factory", keys: ["list my factory", "list factory", "i am a manufacturer", "i run a factory", "get leads", "supplier listing"],
    answer: () => ({
      intent: "list-factory",
      text: "Factories can list for free with an online document check. The optional Verified badge (₹4,999 one-time) adds a video walkthrough and capacity review. There are no lead credits.",
      links: [{ label: "List your factory", href: "/manufacturing/list-your-factory" }],
    }),
  },
  {
    id: "machinery", keys: ["machine", "machinery", "sealer", "sealing machine", "filler", "filling machine", "coder", "batch coding", "labeller", "vffs"],
    answer: () => ({
      intent: "machinery",
      text: "Packworkz Machinery covers sealers, fillers, coders and labellers with typical price ranges, matched to the packaging they run. Our team helps you shortlist and buy the machine and the pack together.",
      links: [{ label: "Compare machines", href: "/machinery" }, { label: "What to buy first", href: "/resources/packaging-machines-small-business-india" }],
    }),
  },
  {
    id: "scrap", keys: ["scrap", "recycle", "recycling", "waste", "sell plastic", "epr"],
    answer: () => ({
      intent: "scrap",
      text: "Packworkz Circular connects you with registered recyclers for film, laminate, corrugated and rigid plastic scrap — per-kg quotes, pickup and documentation. For EPR questions, our EPR guide covers the basics.",
      links: [{ label: "Sell scrap", href: "/circular" }, { label: "EPR guide", href: "/resources/epr-compliance-packaging-india-2026" }],
    }),
  },
  {
    id: "enterprise", keys: ["enterprise", "bulk", "large order", "many sku", "procurement", "tender", "vendor consolidation", "credit", "net 30"],
    answer: () => ({
      intent: "enterprise",
      text: "For high-volume or multi-SKU buying, Packworkz Enterprise gives you one owner for sourcing, QC, compliance and delivery across all your packaging.",
      links: [{ label: "Packworkz Enterprise", href: "/enterprise" }],
    }),
  },
  {
    id: "payment", keys: ["payment", "pay", "upi", "card", "gst", "invoice", "razorpay", "cod", "cash on delivery", "pay on delivery", "credit", "net 30"],
    answer: () => ({
      intent: "payment",
      text: "Orders are paid securely online through Razorpay (UPI, cards and netbanking) — there is no cash on delivery — and every order comes with a GST invoice. High-volume buyers can ask Packworkz Enterprise about Net-30 credit. Charges are in Indian rupees.",
      links: [{ label: "Start an order", href: "/products" }, { label: "Enterprise terms", href: "/enterprise" }],
    }),
  },
  {
    id: "eco", keys: ["eco", "sustainable", "compostable", "biodegradable", "recyclable", "plastic free", "paper based", "fsc", "pcr"],
    answer: () => ({
      intent: "eco",
      text: "There are compostable, recyclable mono-material, recycled-content (PCR) and FSC paper options across pouches, tubes, food-service and boxes. The sustainability page shows what fits your product.",
      links: [{ label: "Sustainable packaging", href: "/sustainable" }],
    }),
  },
  {
    id: "export", keys: ["export", "international", "usa", "uk", "dubai", "abroad", "outside india", "ship overseas"],
    answer: () => ({
      intent: "export",
      text: "Yes, Packworkz supplies export brands. International delivery is quoted per destination, and our export compliance guide covers FDA, BRC and FSC requirements. Prices are shown in USD outside India and charged in INR.",
      links: [{ label: "Export compliance guide", href: "/resources/packaging-compliance-us-uk-export-fda-brc-fsc" }, { label: "Contact the team", href: "/contact" }],
    }),
  },
  {
    id: "track", keys: ["track", "order status", "where is my order", "tracking"],
    answer: () => ({ intent: "track", text: "You can track any order with your order ID and email.", links: [{ label: "Track an order", href: "/track-order" }] }),
  },
  {
    id: "human", keys: ["human", "person", "talk to", "call", "whatsapp", "agent", "representative", "contact", "speak", "phone number"],
    answer: () => ({
      intent: "human",
      text: "Of course — our team is on WhatsApp and phone at +91 82089 90366. Or leave your number and we'll call you back.",
      links: [{ label: "WhatsApp us", href: WHATSAPP }],
      handoff: true,
    }),
  },
];

/** Suggested opening questions, in the order shown. */
export const SUGGESTIONS: Array<{ label: string; query: string }> = [
  { label: "What's the minimum order?", query: "minimum order" },
  { label: "How much does packaging cost?", query: "price" },
  { label: "Can I get samples first?", query: "samples" },
  { label: "How long does delivery take?", query: "delivery" },
  { label: "Find a manufacturer for my product", query: "manufacturer" },
  { label: "Talk to a person", query: "talk to a person" },
];

export function matchUseCase(text: string): UseCase | undefined {
  const t = ` ${text.toLowerCase()} `;
  let best: { useCase: UseCase; score: number } | undefined;
  for (const useCase of USE_CASES) {
    const terms = [useCase.slug.replace(/-/g, " "), ...useCase.name.split(/,| and /).map((part) => part.trim()), ...useCase.keywords.map((k) => k.split(" ")[0])]
      .map((term) => term.toLowerCase().replace(/s$/, ""))
      .filter((term) => term.length > 2);
    const score = terms.reduce((n, term) => n + (t.includes(term) ? term.length : 0), 0);
    if (score && (!best || score > best.score)) best = { useCase, score };
  }
  return best?.useCase;
}

export function matchSku(text: string): CatalogSku | undefined {
  const t = text.toLowerCase();
  return CATALOG_SKUS
    .map((sku) => {
      const name = sku.name.toLowerCase().replace(/^custom printed /, "");
      const parts = name.split(/[\s&/,()-]+/).filter((w) => w.length > 3);
      const hits = parts.filter((w) => t.includes(w.replace(/s$/, ""))).length;
      return { sku, score: t.includes(name) ? 99 : parts.length ? hits / parts.length : 0, hits };
    })
    .filter(({ score, hits }) => score >= 0.6 && hits > 0)
    .sort((a, b) => b.score - a.score)[0]?.sku;
}

/** Best instant answer for a question, or null when the AI should take it. */
export function answerLocally(question: string): AssistantAnswer | null {
  const q = question.toLowerCase();
  const sku = matchSku(q);
  const useCase = matchUseCase(q);
  const intentScores = INTENTS.map((intent) => ({ intent, score: intent.keys.reduce((n, key) => n + (q.includes(key) ? key.length : 0), 0) })).filter(({ score }) => score > 0).sort((a, b) => b.score - a.score);
  const intent = intentScores[0]?.intent;

  // A specific product question ("price of stand-up pouch") beats a generic intent.
  if (sku && (!intent || ["price", "moq", "delivery"].includes(intent.id))) {
    const low = lowestPrice(sku);
    return {
      intent: `sku:${sku.code}`,
      text: `${sku.name}: minimum order ${sku.moq.toLocaleString("en-IN")} ${sku.moq_unit}${Number.isFinite(low) ? `, from about ${rupees(low)} per ${sku.moq_unit.replace(/s$/, "")} at volume` : ""}, typically delivered in ${sku.delivery_days_india} days after artwork approval. ${sku.publicBuyingPath === "instant" ? "You can price and order it instantly online." : "Customise it online and we confirm the final price within 4 business hours."}`,
      links: [{ label: `Open ${sku.name}`, href: `/products/${sku.slug}` }],
    };
  }
  if (useCase && (!intent || ["price", "moq"].includes(intent.id) || intentScores[0].score < 6)) {
    const formats = resolveFormats(useCase).slice(0, 3);
    return {
      intent: `use:${useCase.slug}`,
      text: `For ${useCase.name}, brands usually use ${formats.map(({ sku }) => `${sku.name.toLowerCase()} (from ${sku.moq.toLocaleString("en-IN")} ${sku.moq_unit})`).join(", ")}. The ${titleCase(useCase.name)} packaging page compares them with prices and labelling basics.`,
      links: [{ label: `${titleCase(useCase.name)} packaging`, href: `/packaging/${useCase.slug}` }, ...(useCase.mfg ? [{ label: "Find a manufacturer", href: `/manufacturing/${useCase.mfg}` }] : [])],
    };
  }
  return intent ? intent.answer() : null;
}

/** Compact, relevant facts sent with free-text questions so the AI stays grounded. */
export function factsFor(question: string): string {
  const q = new Set(words(question));
  const skuLines = CATALOG_SKUS
    .map((sku) => ({ sku, score: words(`${sku.name} ${sku.category} ${sku.use_case}`).filter((w) => q.has(w) || q.has(w.replace(/s$/, ""))).length }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 6)
    .map(({ sku }) => `- ${sku.name} (/products/${sku.slug}): MOQ ${sku.moq} ${sku.moq_unit}; indicative ${rupees(sku.price_min)}–${rupees(sku.price_max)} per ${sku.moq_unit.replace(/s$/, "")}; ${sku.publicBuyingPath === "instant" ? "instant online price" : "price confirmed within 4 business hours"}; delivery ~${sku.delivery_days_india} days; use: ${sku.use_case}; options: ${sku.variants.map((v) => `${v.label}: ${v.options.join("/")}`).join("; ")}${sku.print_methods?.length ? `; print: ${sku.print_methods.join("/")}` : ""}`);
  const useLines = USE_CASES.filter((useCase) => words(`${useCase.name} ${useCase.keywords.join(" ")}`).some((w) => q.has(w))).slice(0, 3)
    .map((useCase) => `- ${titleCase(useCase.name)} packaging (/packaging/${useCase.slug}): ${useCase.intro}`);
  return [
    "Company: Packworkz, managed packaging platform in India backed by Kalyani Rotopack (33 years). Phone/WhatsApp +91 82089 90366. Owned unit in Kolkata, office in Bengaluru.",
    "Ordering: standard formats priced instantly online; custom specs confirmed within 4 business hours; artwork proof before printing; Razorpay payment; GST invoice.",
    "Samples: kit with 25–50+ samples for ₹299 + ₹100 shipping (/samples).",
    `Packworkz Make (/manufacturing): ${SEED_MANUFACTURERS.length} contract and private-label manufacturers across ${MFG_CATEGORIES.length} categories; free introductions, 0% commission; Launch Desk ₹14,999 one-time.`,
    "Machinery (/machinery), scrap recycling (/circular), enterprise procurement (/enterprise), sustainability (/sustainable), 3D studio (/mockup-studio), design service (/design).",
    ...INTENTS.filter((intent) => intent.id !== "human").map((intent) => `- ${intent.answer().text}`),
    "Relevant products:", ...skuLines,
    ...(useLines.length ? ["Relevant product types:", ...useLines] : []),
  ].join("\n").slice(0, 8800);
}
