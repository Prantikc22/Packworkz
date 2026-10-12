// Free packaging calculators. Price calculators run the same pricing engine as
// checkout (calculateOrderEstimate → @workspace/commerce), so the number a
// visitor sees here is the number they pay online.

export type PriceCalculator = {
  kind: "price";
  slug: string;
  name: string;
  short: string;
  title: string;
  h1: string;
  intro: string;
  codes: string[];
  keywords: string;
  faqs: Array<[string, string]>;
};

export type ToolCalculator = {
  kind: "tool";
  slug: string;
  name: string;
  short: string;
  title: string;
  h1: string;
  intro: string;
  keywords: string;
  faqs: Array<[string, string]>;
};

export type Calculator = PriceCalculator | ToolCalculator;

const PRICE_FAQ_COMMON: Array<[string, string]> = [
  ["Are these prices final?", "For products marked “Order online”, yes — the calculator uses the same pricing engine as checkout, so the total you see is the total you pay, including GST and listed delivery. Products marked “Reviewed quote” show an indicative estimate; our team confirms the exact price within 4 business hours."],
  ["Does the price include GST and delivery?", "The total includes 18% GST and standard delivery within India. The per-unit price and the price ladder are shown before GST so you can compare quantities."],
  ["Why does the unit price drop at higher quantities?", "Setup, plates and machine make-ready are spread across more pieces, and material is bought in larger lots. The price ladder shows exactly where each break starts."],
];

export const CALCULATORS: Calculator[] = [
  {
    kind: "price",
    slug: "pouch-price",
    name: "Pouch price calculator",
    short: "Stand-up, flat-bottom, spout pouches and sachets",
    title: "Pouch Price Calculator India | Custom Printed Stand-up Pouch Cost | Packworkz",
    h1: "Pouch price calculator",
    intro: "Price custom printed stand-up, flat-bottom and spout pouches or sachets by size, material, closure and quantity — with GST and delivery included.",
    codes: ["FP-101", "FP-103", "FP-104", "FP-105"],
    keywords: "pouch price calculator, stand up pouch price India, custom printed pouch cost, zipper pouch price per piece, flat bottom pouch price, sachet printing cost",
    faqs: [
      ["How much does a custom printed stand-up pouch cost in India?", "It depends on size, material, closure and quantity. Pick your options above to see the exact price per pouch and the full order total. Larger runs bring the unit price down sharply."],
      ["What is the minimum order for printed pouches?", "Stand-up pouches start at 250 units, flat-bottom and spout pouches at 500, and sachets or stick packs at 5,000 units because they run on high-speed lines."],
      ...PRICE_FAQ_COMMON,
    ],
  },
  {
    kind: "price",
    slug: "box-price",
    name: "Box price calculator",
    short: "Mailer, carton, rigid, magnetic and shipping boxes",
    title: "Custom Box Price Calculator India | Mailer, Carton & Rigid Box Cost | Packworkz",
    h1: "Box price calculator",
    intro: "Work out the cost of custom printed mailer boxes, folding cartons, rigid and magnetic gift boxes or corrugated shipping boxes for your quantity.",
    codes: ["EC-501", "BX-401", "BX-406", "BX-405", "BX-402", "BX-403", "BX-408", "EC-502", "EC-503"],
    keywords: "box price calculator, custom box cost India, mailer box price, rigid box price per piece, magnetic box cost, corrugated box price calculator",
    faqs: [
      ["How much does a custom printed box cost?", "Mailer boxes and folding cartons start from a few rupees each at volume, while rigid and magnetic gift boxes cost more because they are hand-wrapped over grey board. Choose a box above to see your exact price."],
      ["What is the minimum order for custom boxes?", "Folding, window and drawer boxes start at 25 units, mailer, rigid and magnetic boxes at 50, food boxes at 200 and corrugated shipping boxes at 500."],
      ...PRICE_FAQ_COMMON,
    ],
  },
  {
    kind: "price",
    slug: "label-price",
    name: "Label & sticker price calculator",
    short: "Paper, waterproof, clear, foil labels and die-cut stickers",
    title: "Label & Sticker Price Calculator India | Custom Printed Labels Cost | Packworkz",
    h1: "Label & sticker price calculator",
    intro: "Price custom printed labels and stickers from 25 pieces — round, square, rectangle and oval paper labels, waterproof BOPP, clear and foil labels.",
    codes: ["LC-816", "LC-817", "LC-818", "LC-819", "LC-820", "LC-804", "LC-805", "LC-815"],
    keywords: "label price calculator, sticker printing cost India, custom label price per piece, product label printing price, waterproof label cost, die cut sticker price",
    faqs: [
      ["How much do custom printed labels cost?", "Paper labels start from around a rupee each at volume. Waterproof, clear and foil labels cost a little more. Choose a shape, size and quantity above for the exact price."],
      ["What is the minimum order for custom labels?", "Most labels and stickers start at 25 pieces, and foil labels at 50, so you can test a design before ordering at volume."],
      ...PRICE_FAQ_COMMON,
    ],
  },
  {
    kind: "price",
    slug: "mailer-bag-price",
    name: "Courier bag & paper bag price calculator",
    short: "Courier bags, padded mailers, garment and carry bags",
    title: "Courier Bag & Paper Bag Price Calculator India | Custom Mailer Cost | Packworkz",
    h1: "Courier bag & paper bag price calculator",
    intro: "Price branded courier bags, paper and padded mailers, zipper garment bags and printed paper carry bags for your order quantity.",
    codes: ["EC-504", "EC-505", "EC-509", "EC-510"],
    keywords: "courier bag price calculator, custom courier bag cost India, paper bag price calculator, padded mailer price, printed carry bag cost, garment bag price",
    faqs: [
      ["How much do printed courier bags cost?", "Branded courier bags start from a few rupees each at volume, with a 1,000-piece minimum. Paper mailers, garment bags and carry bags start at 50–100 pieces. Choose a bag above for the exact price."],
      ...PRICE_FAQ_COMMON,
    ],
  },
  {
    kind: "price",
    slug: "bottle-jar-price",
    name: "Bottle, jar & tube price calculator",
    short: "PET, glass, dropper, airless bottles, jars and tubes",
    title: "Bottle, Jar & Tube Price Calculator India | Cosmetic Packaging Cost | Packworkz",
    h1: "Bottle, jar & tube price calculator",
    intro: "Estimate the cost of plastic and glass bottles, cosmetic jars, dropper and airless pump bottles, and printed cosmetic tubes by size and quantity.",
    codes: ["BC-201", "BC-202", "BC-204", "BC-205", "BC-206", "BC-214", "TS-301", "TS-306"],
    keywords: "bottle price calculator, cosmetic jar price India, dropper bottle cost, airless pump bottle price, cosmetic tube price calculator, glass bottle price per piece",
    faqs: [
      ["How much does a cosmetic bottle or jar cost?", "Stock PET bottles and jars cost less than glass, dropper or airless formats. Decoration, closures and capacity all move the price. Choose a container above for an estimate."],
      ["Can I order bottles online?", "Bottles, jars and tubes are confirmed by our team because closures, neck finishes and decoration need checking. The calculator gives a reliable estimate; your exact price comes back within 4 business hours."],
      ...PRICE_FAQ_COMMON,
    ],
  },
  {
    kind: "tool",
    slug: "volumetric-weight",
    name: "Volumetric weight calculator",
    short: "Chargeable courier weight for any box",
    title: "Volumetric Weight Calculator India | Courier Chargeable Weight (L×W×H ÷ 5000) | Packworkz",
    h1: "Volumetric weight calculator",
    intro: "Couriers charge for whichever is higher — the actual weight or the space a box takes up. Enter your box size to see the volumetric and chargeable weight.",
    keywords: "volumetric weight calculator, courier chargeable weight, dimensional weight calculator India, L x W x H / 5000, shipping weight calculator",
    faqs: [
      ["How is volumetric weight calculated?", "Multiply the box length, width and height in centimetres and divide by the courier's divisor — 5,000 for most express and e-commerce couriers in India. A 30 × 20 × 15 cm box weighs 1.8 kg volumetrically, whatever is inside it."],
      ["What is chargeable weight?", "The higher of the actual weight and the volumetric weight, usually rounded up to the next 0.5 kg. That is the weight your shipping is billed on."],
      ["Which divisor should I use?", "5,000 is standard for express, e-commerce and most domestic couriers. Some air services use 4,000 or 6,000, and surface freight often uses a different rule — check your courier's rate card."],
      ["How do I reduce shipping cost?", "Use the smallest box that protects the product. Cutting a box from 30 × 20 × 15 cm to 25 × 18 × 12 cm drops the volumetric weight from 1.8 kg to 1.08 kg — often a full slab cheaper on every shipment."],
    ],
  },
  {
    kind: "tool",
    slug: "dieline-generator",
    name: "Box dieline generator",
    short: "Free printable dielines — tuck-end cartons, shipping boxes, sleeves",
    title: "Free Box Dieline Generator | Tuck End Carton & Shipping Box Template (PDF, SVG) | Packworkz",
    h1: "Box dieline generator",
    intro: "Enter your box size and download a print-ready dieline at true scale — reverse and straight tuck-end cartons, corrugated shipping boxes and sleeves, as PDF or SVG.",
    keywords: "dieline generator, box dieline template, tuck end box dieline, carton dieline PDF, shipping box template, free dieline maker India",
    faqs: [
      ["What is a dieline?", "A dieline is the flat outline of your box: solid lines show where the sheet is cut and dashed lines show where it folds. Designers place artwork on it so every panel lines up once the box is folded."],
      ["Are these dielines print-ready?", "They are drawn at true 1:1 scale from the internal size you enter, with standard glue flaps, tucks and dust flaps. Before production our prepress team checks your artwork against the converter's exact die, so small allowances are handled for you."],
      ["Which file should I use?", "Use the PDF in Illustrator, CorelDRAW or Canva (as a background layer), or the SVG in Figma and web tools. Put the dieline on its own layer and keep artwork 3 mm past every cut line for bleed."],
      ["Which box style should I pick?", "Reverse tuck end is the most common retail carton. Straight tuck end keeps the front face clean for display. Choose the shipping box (RSC) for corrugated transit cartons, and a sleeve to wrap a tray or drawer box."],
    ],
  },
];

export const CALCULATOR_BY_SLUG: Record<string, Calculator> = Object.fromEntries(CALCULATORS.map((c) => [c.slug, c]));

export const CALCULATORS_HUB = {
  title: "Free Packaging Calculators India | Pouch, Box, Label Price & Volumetric Weight | Packworkz",
  description: "Free packaging cost calculators: price custom pouches, boxes, labels, courier bags, bottles and tubes by size and quantity, and work out courier volumetric weight.",
  keywords: "packaging calculator, packaging cost calculator India, packaging price calculator, custom packaging cost estimator",
};

/** Page title/description for client-side navigation (prerender uses entry-server). */
export function calculatorSeoFor(pathname: string) {
  if (pathname === "/calculators") return CALCULATORS_HUB;
  const match = pathname.match(/^\/calculators\/([^/]+)$/);
  const calc = match ? CALCULATOR_BY_SLUG[match[1]] : undefined;
  return calc ? { title: calc.title, description: calc.intro, keywords: calc.keywords } : undefined;
}
