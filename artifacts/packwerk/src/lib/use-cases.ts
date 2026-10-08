// "Packaging for …" landing pages: one per product type a brand sells.
// Formats, MOQs and prices are read from the live catalog at render time, so
// these pages never drift from the product pages they link to.
import type { CategoryId } from "@/lib/manufacturers";

export type UseCase = {
  slug: string;
  /** Product type in natural case, e.g. "coffee". */
  name: string;
  group: "Food & Beverage" | "Health & Beauty" | "Home, Pet & Baby" | "Retail & Delivery";
  /** Two sentences unique to this product type. */
  intro: string;
  /** Catalog codes in order of fit, each with why it suits this product. */
  formats: Array<[code: string, why: string]>;
  /** What the pack has to do for this product. */
  needs: string[];
  compliance: "food" | "cosmetic" | "supplement" | "general";
  /** Packworkz Make category for "need a factory to make it?". */
  mfg?: CategoryId;
  guides: string[];
  related: string[];
  keywords: string[];
};

export const USE_CASES: UseCase[] = [
  {
    slug: "coffee", name: "coffee", group: "Food & Beverage",
    intro: "Freshly roasted coffee releases carbon dioxide for days and loses aroma to oxygen and light, so the pack has to vent gas without letting air back in. Most specialty roasters in India use valve pouches for beans and grounds, with tins or cartons for gifting.",
    formats: [["FP-109", "One-way degassing valve lets CO₂ out after roasting while keeping oxygen out."], ["FP-103", "Flat bottom stands on shelves and holds 250 g–1 kg cleanly."], ["FP-101", "Lower-cost option for ground coffee and drip bags with a zipper."], ["BC-209", "Tins for premium and gift ranges that are opened often."], ["LC-816", "Round labels for roast date, origin and batch on stock pouches."]],
    needs: ["High oxygen and moisture barrier (metallised or foil laminate) for shelf life beyond a few weeks.", "A one-way degassing valve for whole beans packed soon after roasting.", "A reclosable zipper or tin-tie so the pack stays sealed after opening.", "Space for roast date and brew notes — many roasters print a base design and label each batch."],
    compliance: "food", mfg: "coffee-tea",
    guides: ["best-packaging-coffee-beans-india", "stand-up-pouch-vs-flat-bottom-pouch", "custom-printed-pouch-moq-pricing"],
    related: ["tea", "spices", "snacks"], keywords: ["coffee packaging India", "coffee pouch with valve", "coffee bean packaging"],
  },
  {
    slug: "tea", name: "tea", group: "Food & Beverage",
    intro: "Tea picks up moisture and odours easily, so loose-leaf and blends need a tight barrier and a clean-smelling pack. Brands usually pair a barrier pouch for daily use with a tin, paper tube or carton for gifting.",
    formats: [["FP-101", "Zipper stand-up pouch for loose leaf and blends."], ["BC-209", "Tins keep leaves dry and look premium on a shelf."], ["TS-304", "Paper tubes for gift packs and sampler sets."], ["BX-401", "Folding cartons for tea-bag boxes and outer packaging."], ["FP-106", "Three-side seal sachets for single-serve and samples."]],
    needs: ["Moisture and odour barrier — avoid packs that smell of ink or adhesive.", "Light protection for green and white teas.", "Reclosability for loose leaf.", "Portion packs or sachets for trials and hospitality."],
    compliance: "food", mfg: "coffee-tea",
    guides: ["fssai-packaging-labelling-requirements-india", "stand-up-pouch-vs-flat-bottom-pouch"],
    related: ["coffee", "spices", "gift-hampers"], keywords: ["tea packaging India", "tea pouch", "tea tin packaging"],
  },
  {
    slug: "spices", name: "spices and masalas", group: "Food & Beverage",
    intro: "Ground spices lose their volatile oils to air and light and cake when they pick up humidity. Pouches carry most retail spice sales in India, while jars and shaker bottles suit premium and kitchen-shelf ranges.",
    formats: [["FP-101", "Zipper stand-up pouch for 50 g–500 g retail packs."], ["FP-106", "Three-side seal pouches for low-cost single-use and sample packs."], ["BC-201", "PET jars and shaker bottles for repeat kitchen use."], ["BC-202", "Glass jars for premium whole-spice ranges."], ["LC-818", "Rectangular labels for variant and batch details."]],
    needs: ["Aroma and oxygen barrier so essential oils do not escape.", "Light protection for turmeric, chilli and saffron colour.", "Grease and stain resistance for oily blends.", "Clear variant marking when one structure carries many SKUs."],
    compliance: "food", mfg: "spices",
    guides: ["fssai-packaging-labelling-requirements-india", "low-moq-custom-packaging-india", "custom-printed-pouch-moq-pricing"],
    related: ["coffee", "snacks", "ready-meals"], keywords: ["spice packaging India", "masala pouch packaging", "spice jar packaging"],
  },
  {
    slug: "snacks", name: "snacks and namkeen", group: "Food & Beverage",
    intro: "Chips, namkeen and makhana go stale fast once moisture gets in, and fried snacks need oil and oxygen protection too. High-volume brands run printed rollstock on form-fill-seal machines; smaller brands start with premade pouches.",
    formats: [["FP-112", "Printed rollstock for automatic flow-wrap and pillow-pack machines."], ["FP-102", "Premade centre-seal pillow pouches for hand or semi-auto packing."], ["FP-101", "Zipper stand-up pouches for premium and healthy snacks."], ["FP-107", "Side-gusset pouches for larger family packs."]],
    needs: ["Moisture and oxygen barrier (metallised film) to keep crunch.", "Nitrogen flushing compatibility for chips and puffed snacks.", "Good seal strength so packs survive transport with headspace.", "Bright print that holds up on a crowded shelf."],
    compliance: "food", mfg: "snacks",
    guides: ["best-packaging-snacks-material-barrier-shelf-life", "bopp-vs-ldpe-packaging", "digital-vs-rotogravure-printing"],
    related: ["protein-bars", "bakery", "spices"], keywords: ["snack packaging India", "namkeen packaging", "chips packaging pouch"],
  },
  {
    slug: "protein-bars", name: "protein and nutrition bars", group: "Food & Beverage",
    intro: "Bars are usually flow-wrapped on the production line, so the wrapper is bought as printed rollstock rather than as finished pouches. A display carton or mailer turns single bars into a retail or D2C pack.",
    formats: [["FP-112", "Flow-wrap rollstock that runs on the bar manufacturer's wrapping line."], ["BX-401", "Folding cartons for multipacks of 6–12 bars."], ["BX-415", "Counter display units for retail and gym counters."], ["EC-501", "Mailer boxes for D2C subscription packs."]],
    needs: ["Moisture and oxygen barrier so bars stay soft and chocolate does not bloom.", "A film width and print repeat matched to your manufacturer's flow-wrapper.", "Cold-seal or heat-seal film as the line requires.", "Nutrition and allergen panels that fit a small wrapper."],
    compliance: "food", mfg: "bars",
    guides: ["protein-bar-private-label-manufacturing-india", "digital-vs-rotogravure-printing"],
    related: ["snacks", "protein-powder", "supplements"], keywords: ["protein bar packaging", "flow wrap packaging India", "energy bar wrapper"],
  },
  {
    slug: "protein-powder", name: "protein powder", group: "Health & Beauty",
    intro: "Protein and nutrition powders are hygroscopic and heavy, so they need a strong, moisture-tight pack that a scoop can reach into. Jars dominate gyms and pharmacies, while flat-bottom pouches cut freight cost for online brands.",
    formats: [["BC-201", "HDPE and PET jars with wide mouths for scoops."], ["FP-103", "Flat-bottom pouches with zippers for 500 g–2 kg refills."], ["FP-105", "Single-serve sachets and stick packs for trials."], ["LC-814", "Machine-applied roll labels for high-volume jar lines."]],
    needs: ["Moisture barrier to stop clumping.", "Wide opening and reclosable lid or zipper.", "Puncture resistance for 1–2 kg packs.", "Room for the nutrition panel, FSSAI licence and serving guide."],
    compliance: "supplement", mfg: "nutraceuticals",
    guides: ["nutraceutical-supplement-packaging-india", "stand-up-pouch-vs-flat-bottom-pouch"],
    related: ["supplements", "protein-bars", "ayurveda"], keywords: ["protein powder packaging", "whey protein jar", "supplement pouch packaging"],
  },
  {
    slug: "supplements", name: "supplements, gummies and capsules", group: "Health & Beauty",
    intro: "Vitamins, gummies and capsules are sensitive to humidity and heat, and buyers expect tamper evidence. Bottles and jars with induction seals are the default; pouches suit refills and gummies sold online.",
    formats: [["BC-201", "HDPE bottles and PET jars with induction-sealable necks."], ["BC-202", "Amber glass for light-sensitive formulations."], ["FP-101", "Zipper pouches for gummies and refills."], ["BX-401", "Outer cartons for retail and pharmacy shelves."], ["LC-804", "Waterproof labels that survive humid bathrooms and kitchens."]],
    needs: ["Moisture protection — gummies stick and capsules soften in humidity.", "Tamper-evident seal (induction foil or shrink band).", "Child-resistant closures where the product calls for them.", "Space for dosage, ingredients and regulatory text."],
    compliance: "supplement", mfg: "nutraceuticals",
    guides: ["nutraceutical-supplement-packaging-india", "contract-manufacturer-india-guide"],
    related: ["protein-powder", "ayurveda", "skincare"], keywords: ["supplement packaging India", "gummies packaging", "nutraceutical bottle packaging"],
  },
  {
    slug: "ayurveda", name: "Ayurvedic and herbal products", group: "Health & Beauty",
    intro: "Churnas, oils, syrups and capsules each need a different container, often within one brand. Amber glass and PET bottles carry liquids, while jars and pouches carry powders.",
    formats: [["BC-201", "PET bottles and jars for syrups, oils and churnas."], ["BC-202", "Amber glass for oils and light-sensitive extracts."], ["BX-401", "Printed cartons for retail and pharmacy display."], ["LC-818", "Rectangular labels for multi-language product details."]],
    needs: ["Light protection for herbal oils and extracts.", "Leak-proof closures for oils and syrups.", "Moisture barrier for powders.", "Enough panel area for ingredients and usage directions."],
    compliance: "supplement", mfg: "ayurveda",
    guides: ["nutraceutical-supplement-packaging-india", "contract-manufacturer-india-guide"],
    related: ["supplements", "haircare", "skincare"], keywords: ["ayurvedic packaging", "herbal product packaging India", "amber bottle packaging"],
  },
  {
    slug: "skincare", name: "skincare and serums", group: "Health & Beauty",
    intro: "Serums and actives such as vitamin C and retinol break down with light and air, so the container is part of the formula's stability. Droppers suit oils and serums; airless pumps protect sensitive creams.",
    formats: [["BC-205", "Glass dropper bottles for serums and face oils."], ["BC-206", "Airless pumps keep air away from oxygen-sensitive formulas."], ["BC-204", "Jars for creams, masks and balms."], ["BX-401", "Printed cartons for retail-ready serums."], ["LC-815", "Foil and special-effect labels for premium ranges."]],
    needs: ["UV-protective or opaque containers for light-sensitive actives.", "Airless or narrow-orifice dispensing for oxygen-sensitive formulas.", "Compatibility testing between formula and container.", "Premium finish on a small label area."],
    compliance: "cosmetic", mfg: "skincare",
    guides: ["choose-packaging-skincare-brand", "cosmetic-packaging-india-complete-guide"],
    related: ["creams-lotions", "haircare", "perfume"], keywords: ["serum packaging India", "skincare packaging", "dropper bottle packaging"],
  },
  {
    slug: "creams-lotions", name: "creams, lotions and face wash", group: "Health & Beauty",
    intro: "Creams, lotions and cleansers are squeezed or pumped daily, so the pack has to dispense cleanly to the last drop. Tubes dominate face wash and creams; bottles with pumps carry body lotions.",
    formats: [["TS-301", "Laminate and plastic tubes for face wash, creams and gels."], ["TS-306", "Mono-material and PCR tubes for recyclable ranges."], ["BC-204", "Jars for thick creams and body butters."], ["BC-214", "Printed bottles with pumps and flip caps for lotions."]],
    needs: ["Barrier laminate for fragrance and active retention.", "The right cap — flip-top, disc-top or nozzle — for viscosity.", "Recyclable mono-material options for sustainability claims.", "Decoration that survives oily fingers and bathroom humidity."],
    compliance: "cosmetic", mfg: "skincare",
    guides: ["cosmetic-packaging-india-complete-guide", "choose-packaging-skincare-brand"],
    related: ["skincare", "haircare", "baby-care"], keywords: ["cosmetic tube packaging India", "cream jar packaging", "lotion bottle packaging"],
  },
  {
    slug: "haircare", name: "shampoo and haircare", group: "Health & Beauty",
    intro: "Shampoos, conditioners and hair oils sell in large bottles that get handled with wet hands. Refill pouches are a growing low-plastic option for repeat buyers.",
    formats: [["BC-214", "Printed shampoo and lotion bottles with flip caps or pumps."], ["BC-201", "PET and HDPE bottles for hair oils."], ["FP-104", "Spout refill pouches for shampoo and conditioner."], ["LC-804", "Waterproof labels that do not peel in the shower."]],
    needs: ["Grip and drop resistance for wet hands.", "Leak-proof closures for oils.", "Waterproof decoration.", "Refill formats for repeat customers."],
    compliance: "cosmetic", mfg: "haircare",
    guides: ["cosmetic-packaging-india-complete-guide"],
    related: ["creams-lotions", "skincare", "home-cleaning"], keywords: ["shampoo bottle packaging", "hair oil bottle", "haircare packaging India"],
  },
  {
    slug: "perfume", name: "perfume and attar", group: "Health & Beauty",
    intro: "Fragrance is a gifting category where the bottle and box carry most of the perceived value. Glass bottles with sprayers or roll-ons sit inside rigid or magnetic boxes.",
    formats: [["BC-213", "Perfume and attar bottles with sprayers or roll-ons."], ["BX-402", "Two-piece rigid boxes for premium presentation."], ["BX-403", "Magnetic-closure boxes for gift sets."], ["LC-815", "Foil labels for bottles and closures."]],
    needs: ["Glass compatible with alcohol-based and oil-based fragrance.", "Leak-proof crimp or screw necks.", "Inserts that hold the bottle firmly in transit.", "A premium unboxing for gifting."],
    compliance: "cosmetic",
    guides: ["custom-printed-box-cost-india", "cosmetic-packaging-india-complete-guide"],
    related: ["gift-hampers", "skincare", "jewellery"], keywords: ["perfume bottle packaging India", "attar bottle", "perfume box packaging"],
  },
  {
    slug: "baby-care", name: "baby care", group: "Home, Pet & Baby",
    intro: "Baby products are bought by careful parents, so packs need to look clean, dispense gently and survive a diaper bag. Tubes and pump bottles carry creams and washes; mailers carry D2C bundles.",
    formats: [["BC-214", "Pump and flip-cap bottles for baby wash and lotion."], ["TS-301", "Tubes for rash creams and balms."], ["EC-501", "Mailer boxes for D2C starter kits."], ["LC-804", "Waterproof labels for bath-time products."]],
    needs: ["Gentle, controlled dispensing.", "Tamper evidence that parents can see.", "Waterproof, smudge-free decoration.", "Clear age and usage guidance on the pack."],
    compliance: "cosmetic", mfg: "baby-care",
    guides: ["cosmetic-packaging-india-complete-guide", "packaging-for-d2c-brand-beginners-guide"],
    related: ["creams-lotions", "haircare", "ecommerce-shipping"], keywords: ["baby care packaging", "baby lotion bottle", "baby product packaging India"],
  },
  {
    slug: "pet-food", name: "pet food and treats", group: "Home, Pet & Baby",
    intro: "Pet food is fatty and strongly scented, so packs need grease resistance and a barrier that keeps smells in and pests out. Treats sell in zipper pouches; larger kibble packs use quad-seal or flat-bottom bags.",
    formats: [["FP-101", "Zipper stand-up pouches for treats and chews."], ["FP-103", "Flat-bottom pouches for 1–3 kg food packs."], ["FP-108", "Quad-seal bags for heavier kibble."], ["LC-816", "Labels for batch, flavour and feeding guides."]],
    needs: ["Grease and odour barrier.", "Puncture resistance for kibble and bones.", "Reclosable zipper for treats.", "Strong seals for heavy packs."],
    compliance: "general", mfg: "pet-food",
    guides: ["stand-up-pouch-vs-flat-bottom-pouch", "custom-printed-pouch-moq-pricing"],
    related: ["snacks", "ecommerce-shipping", "home-cleaning"], keywords: ["pet food packaging India", "dog treat pouch", "pet food bag"],
  },
  {
    slug: "sauces-spreads", name: "sauces, spreads and honey", group: "Food & Beverage",
    intro: "Peanut butter, sauces, jams and honey are dense, sticky and often hot-filled, so the container has to handle filling temperature and seal cleanly. Glass suits premium shelves; PET jars and spout pouches cut weight and breakage online.",
    formats: [["BC-202", "Glass jars for premium spreads, honey and pickles."], ["BC-201", "PET jars for lightweight, shatter-proof packs."], ["FP-104", "Spout pouches for sauces and squeezable formats."], ["LC-804", "Waterproof labels that resist oil and condensation."]],
    needs: ["Hot-fill or heat-resistant containers where the line needs them.", "Airtight closures with tamper evidence.", "Oil and stain-resistant labels.", "Breakage protection for e-commerce shipping."],
    compliance: "food", mfg: "spreads-sauces",
    guides: ["fssai-packaging-labelling-requirements-india", "amazon-india-packaging-requirements"],
    related: ["spices", "ready-meals", "beverages"], keywords: ["peanut butter jar packaging", "sauce packaging India", "honey jar packaging"],
  },
  {
    slug: "beverages", name: "juices and beverages", group: "Food & Beverage",
    intro: "Beverages are heavy, liquid and often cold-chained, so bottles, closures and labels have to survive condensation and transport. Shrink sleeves give full-body branding on bottles.",
    formats: [["BC-201", "PET and HDPE bottles for juices, shots and functional drinks."], ["BC-202", "Glass bottles for premium and cold-pressed ranges."], ["LC-806", "Shrink sleeves for 360° branding."], ["EC-502", "Corrugated cartons for distribution."]],
    needs: ["Container and closure matched to hot-fill or cold-fill.", "Labels that survive condensation in chillers.", "Tamper-evident caps.", "Transit cartons sized to reduce breakage."],
    compliance: "food", mfg: "beverages",
    guides: ["fssai-packaging-labelling-requirements-india", "packaging-blinkit-zepto-quick-commerce-india-2026"],
    related: ["sauces-spreads", "coffee", "ecommerce-shipping"], keywords: ["juice bottle packaging", "beverage packaging India", "shrink sleeve label"],
  },
  {
    slug: "ready-meals", name: "ready-to-eat meals", group: "Food & Beverage",
    intro: "Shelf-stable curries, rice and meals are sterilised inside the pack, so the material has to survive retort temperatures without delaminating. Cartons add a shelf-ready outer and room for cooking instructions.",
    formats: [["FP-110", "Retort pouches built to withstand in-pack sterilisation."], ["BX-401", "Printed cartons as the retail outer."], ["RL-704", "Lidding film for trays and cups."], ["EC-503", "Delivery boxes for fresh meal brands."]],
    needs: ["Retort-grade laminate that tolerates sterilisation.", "Oxygen and light barrier for long ambient shelf life.", "Microwave-friendly options where required.", "Clear heating instructions and FSSAI details."],
    compliance: "food", mfg: "ready-to-eat",
    guides: ["fssai-packaging-labelling-requirements-india", "best-packaging-restaurants-cloud-kitchens"],
    related: ["restaurants", "spices", "sauces-spreads"], keywords: ["retort pouch packaging India", "ready to eat packaging", "ready meal pouch"],
  },
  {
    slug: "bakery", name: "bakery and cookies", group: "Food & Beverage",
    intro: "Cookies and baked goods break easily and go soft with moisture, so they need structure as much as barrier. Window cartons show the product; pillow packs and pouches carry everyday ranges.",
    formats: [["BX-406", "Window cartons that show cookies and cakes."], ["FP-102", "Pillow pouches for biscuits and rusks."], ["BX-401", "Folding cartons for gift and multipack formats."], ["BX-413", "Pillow boxes for single pieces and favours."]],
    needs: ["Rigid support so products arrive whole.", "Moisture barrier to keep crispness.", "Grease resistance for butter-rich products.", "Visibility through windows or clear film."],
    compliance: "food", mfg: "bakery",
    guides: ["custom-printed-box-cost-india", "best-packaging-snacks-material-barrier-shelf-life"],
    related: ["chocolates-sweets", "snacks", "gift-hampers"], keywords: ["bakery packaging India", "cookie box packaging", "window carton"],
  },
  {
    slug: "chocolates-sweets", name: "chocolates, sweets and mithai", group: "Food & Beverage",
    intro: "Chocolates and mithai are bought as gifts, especially around festivals, so presentation matters as much as protection. Rigid and drawer boxes carry premium assortments; pouches carry everyday packs.",
    formats: [["BX-416", "Mithai and festive gift boxes with trays."], ["BX-405", "Drawer boxes for chocolate assortments."], ["BX-402", "Two-piece rigid boxes for premium gifting."], ["FP-106", "Three-side seal pouches for bars and everyday packs."]],
    needs: ["Heat protection and inserts so pieces do not melt or move.", "Food-safe trays and liners.", "Festive-ready print and finishes.", "Lead times planned around Diwali and wedding seasons."],
    compliance: "food", mfg: "confectionery",
    guides: ["custom-printed-box-cost-india", "how-much-packaging-should-startup-order"],
    related: ["bakery", "gift-hampers", "perfume"], keywords: ["mithai box packaging", "chocolate box packaging India", "sweet box"],
  },
  {
    slug: "home-cleaning", name: "home care and cleaning products", group: "Home, Pet & Baby",
    intro: "Detergents, floor cleaners and dishwash liquids contain surfactants and sometimes solvents, so containers and labels must resist chemicals. Refill pouches are a cheaper, lower-plastic way to sell repeat volume.",
    formats: [["BC-201", "HDPE bottles resistant to detergents and cleaners."], ["FP-104", "Spout refill pouches for liquid refills."], ["LC-804", "Chemical- and water-resistant labels."], ["EC-502", "Corrugated cartons for distribution."]],
    needs: ["Chemical compatibility between formula and container.", "Child-resistant or tamper-evident closures where needed.", "Labels that survive spills.", "Refill formats to reduce cost per litre."],
    compliance: "general", mfg: "home-care",
    guides: ["epr-compliance-packaging-india-2026", "consolidate-packaging-vendors-supply-chain"],
    related: ["haircare", "pet-food", "ecommerce-shipping"], keywords: ["detergent bottle packaging", "cleaning product packaging India", "refill pouch"],
  },
  {
    slug: "apparel", name: "apparel and fashion", group: "Retail & Delivery",
    intro: "Clothing brands win repeat buyers through the unboxing, while still needing light, cheap shipping packs. Garment bags protect the product; branded mailers, tissue and tags carry the brand.",
    formats: [["EC-509", "Frosted zipper garment bags for folded apparel."], ["EC-504", "Courier and return mailers for shipping."], ["EC-510", "Printed paper carry bags for stores."], ["LC-808", "Hang tags and insert cards."], ["LC-810", "Printed tissue for a branded unboxing."]],
    needs: ["Lightweight packs to keep courier cost down.", "Tamper-evident, opaque shipping mailers.", "Return-friendly double-seal mailers.", "Branded touchpoints: tags, tissue and inserts."],
    compliance: "general",
    guides: ["packaging-for-d2c-brand-beginners-guide", "d2c-brands-overpay-packaging-india"],
    related: ["ecommerce-shipping", "jewellery", "gift-hampers"], keywords: ["apparel packaging India", "garment bag packaging", "clothing brand packaging"],
  },
  {
    slug: "jewellery", name: "jewellery", group: "Retail & Delivery",
    intro: "Jewellery is small, high-value and gifted, so packs need to feel premium and hold pieces securely. Drawer and rigid boxes with inserts carry most pieces; drawstring pouches add a reusable touch.",
    formats: [["BX-405", "Drawer boxes for rings, earrings and pendants."], ["BX-402", "Two-piece rigid boxes for sets."], ["BX-403", "Magnetic boxes for premium gifting."], ["EC-511", "Cotton and jute drawstring pouches."]],
    needs: ["Inserts that hold pieces in place.", "Anti-tarnish considerations for silver.", "A premium, giftable finish.", "Small MOQs for limited collections."],
    compliance: "general",
    guides: ["custom-printed-box-cost-india", "low-moq-custom-packaging-india"],
    related: ["perfume", "gift-hampers", "apparel"], keywords: ["jewellery box packaging India", "jewelry packaging", "drawer box"],
  },
  {
    slug: "restaurants", name: "restaurants and cloud kitchens", group: "Retail & Delivery",
    intro: "Delivery food has to stay hot, sealed and spill-free for 30–45 minutes on a bike, then look good when opened. Kitchens mix paper, bagasse and corrugated formats by dish.",
    formats: [["EC-503", "Delivery boxes for meals and combos."], ["SP-905", "Bagasse containers for hot, oily food."], ["SP-907", "Paper bowls for rice, noodles and salads."], ["SP-909", "Greaseproof wrap for rolls and burgers."], ["EC-514", "Pizza boxes."]],
    needs: ["Grease and heat resistance.", "Leak-proof lids and tamper seals for aggregators.", "Compostable or recyclable options where cities restrict plastic.", "Consistent branding across many SKUs."],
    compliance: "food", mfg: "ready-to-eat",
    guides: ["best-packaging-restaurants-cloud-kitchens", "epr-compliance-packaging-india-2026"],
    related: ["ready-meals", "bakery", "ecommerce-shipping"], keywords: ["cloud kitchen packaging", "restaurant delivery packaging India", "bagasse container"],
  },
  {
    slug: "ecommerce-shipping", name: "e-commerce shipping", group: "Retail & Delivery",
    intro: "Online orders get dropped, stacked and returned, and courier charges are set by volumetric weight. The right mailer size and protection cut damage and freight at the same time.",
    formats: [["EC-501", "Branded mailer boxes for D2C unboxing."], ["EC-502", "Corrugated shipping boxes for heavier orders."], ["EC-504", "Courier and return mailers for soft goods."], ["PR-601", "Protective wrap and void fill."], ["LC-811", "Custom packaging tape."]],
    needs: ["Right-sized boxes to cut volumetric weight.", "Protection matched to the product's fragility.", "Tamper-evident sealing.", "Marketplace-compliant labelling."],
    compliance: "general",
    guides: ["amazon-india-packaging-requirements", "packaging-blinkit-zepto-quick-commerce-india-2026", "d2c-brands-overpay-packaging-india"],
    related: ["apparel", "gift-hampers", "baby-care"], keywords: ["ecommerce packaging India", "mailer box packaging", "shipping box for online orders"],
  },
  {
    slug: "gift-hampers", name: "gift hampers and corporate gifting", group: "Retail & Delivery",
    intro: "Hampers combine several products in one box, so they need inserts, structure and a premium finish — and they are usually needed by a hard festive deadline. Rigid and collapsible boxes keep storage cost down.",
    formats: [["BX-402", "Two-piece rigid boxes for premium hampers."], ["BX-408", "Collapsible rigid boxes that ship and store flat."], ["PR-602", "Custom inserts and dividers that hold each item."], ["LC-810", "Printed tissue and wrapping paper."], ["BX-416", "Festive gift boxes."]],
    needs: ["Inserts sized to each product.", "Premium finishes: foil, emboss, soft-touch.", "Flat-pack options to cut storage and freight.", "Lead time planned before festive peaks."],
    compliance: "general",
    guides: ["custom-printed-box-cost-india", "how-much-packaging-should-startup-order"],
    related: ["chocolates-sweets", "perfume", "jewellery"], keywords: ["gift hamper box", "corporate gifting packaging India", "rigid gift box"],
  },
];

export const USE_CASE_BY_SLUG = Object.fromEntries(USE_CASES.map((useCase) => [useCase.slug, useCase])) as Record<string, UseCase>;

export const USE_CASE_GROUPS = ["Food & Beverage", "Health & Beauty", "Home, Pet & Baby", "Retail & Delivery"] as const;

/** Use-case pages that recommend a given catalog code, best fit first. */
export function useCasesForSku(code: string) {
  return USE_CASES
    .map((useCase) => ({ useCase, rank: useCase.formats.findIndex(([c]) => c === code) }))
    .filter(({ rank }) => rank >= 0)
    .sort((a, b) => a.rank - b.rank)
    .map(({ useCase }) => useCase);
}

/** Use-case pages linked to a Packworkz Make category. */
export function useCasesForMfgCategory(id: CategoryId) {
  return USE_CASES.filter((useCase) => useCase.mfg === id);
}

export const titleCase = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);
