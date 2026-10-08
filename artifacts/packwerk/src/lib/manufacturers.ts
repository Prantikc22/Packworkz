// Packworkz Manufacturing — CPG contract / private-label manufacturer directory.
//
// Seeded profiles are compiled ONLY from each company's own public website
// (retrieved 5 Oct 2026). They are marked unclaimed and never shown as
// verified: a manufacturer becomes "Basic checked" or "Verified" only after it
// claims or lists itself and passes Packworkz's online verification.

export type CategoryId =
  | "snacks" | "bars" | "spreads-sauces" | "beverages" | "coffee-tea" | "spices" | "bakery" | "confectionery"
  | "ready-to-eat" | "nutraceuticals" | "ayurveda" | "skincare" | "haircare" | "baby-care" | "home-care" | "pet-food";

export type MfgCategory = {
  id: CategoryId;
  label: string;
  group: "Food & Beverage" | "Health & Wellness" | "Beauty & Personal Care" | "Home & Pet";
  examples: string;
  keywords: string[];
  /** Packworkz packaging codes these products usually ship in. */
  packaging: string[];
};

export const MFG_CATEGORIES: MfgCategory[] = [
  { id: "snacks", label: "Snacks & namkeen", group: "Food & Beverage", examples: "Chips, namkeen, extruded snacks, makhana", keywords: ["snack", "chips", "namkeen", "makhana", "bhujia", "puffs", "extruded", "nachos", "fryums", "crisps"], packaging: ["RL-701", "FP-112", "FP-101"] },
  { id: "bars", label: "Protein & nutrition bars", group: "Food & Beverage", examples: "Protein bars, energy bars, granola bars", keywords: ["bar", "protein bar", "energy bar", "granola", "nutrition bar", "date bar"], packaging: ["FP-112", "RL-701", "BX-401"] },
  { id: "spreads-sauces", label: "Spreads & sauces", group: "Food & Beverage", examples: "Peanut butter, ketchup, mayo, dips", keywords: ["peanut butter", "nut butter", "spread", "sauce", "ketchup", "mayo", "mayonnaise", "dip", "chutney", "jam", "honey", "pickle"], packaging: ["BC-202", "BC-201", "FP-104"] },
  { id: "beverages", label: "Beverages", group: "Food & Beverage", examples: "Juices, functional drinks, iced tea", keywords: ["juice", "drink", "beverage", "soda", "energy drink", "kombucha", "iced tea", "water", "shot", "smoothie"], packaging: ["BC-201", "BC-202", "LC-806"] },
  { id: "coffee-tea", label: "Coffee & tea", group: "Food & Beverage", examples: "Roasted coffee, instant coffee, tea blends", keywords: ["coffee", "tea", "chai", "matcha", "green tea", "cold brew", "herbal tea", "infusion"], packaging: ["FP-109", "FP-103", "FP-101"] },
  { id: "spices", label: "Spices & masalas", group: "Food & Beverage", examples: "Masalas, blends, seasonings, superfoods", keywords: ["spice", "masala", "seasoning", "turmeric", "chilli", "blend", "superfood", "ready to cook mix"], packaging: ["FP-101", "FP-105", "BC-201"] },
  { id: "bakery", label: "Bakery & cookies", group: "Food & Beverage", examples: "Cookies, biscuits, rusks, cakes", keywords: ["cookie", "biscuit", "bakery", "rusk", "cake", "brownie", "cracker"], packaging: ["RL-701", "BX-401", "FP-112"] },
  { id: "confectionery", label: "Chocolate & confectionery", group: "Food & Beverage", examples: "Chocolates, candies, toffees, gummies", keywords: ["chocolate", "candy", "toffee", "confectionery", "lollipop", "jelly", "praline"], packaging: ["RL-701", "BX-402", "FP-112"] },
  { id: "ready-to-eat", label: "Ready-to-eat & ready-to-cook", group: "Food & Beverage", examples: "Retort meals, RTC mixes, frozen", keywords: ["ready to eat", "rte", "ready-to-eat", "meal", "curry", "retort", "ready to cook", "frozen", "instant meal"], packaging: ["FP-110", "BX-401", "EC-503"] },
  { id: "nutraceuticals", label: "Nutraceuticals & supplements", group: "Health & Wellness", examples: "Gummies, capsules, protein powder, sachets", keywords: ["supplement", "nutraceutical", "gummies", "gummy", "capsule", "tablet", "protein powder", "whey", "vitamin", "probiotic", "collagen", "effervescent", "softgel"], packaging: ["BC-201", "FP-105", "BX-401"] },
  { id: "ayurveda", label: "Ayurveda & herbal", group: "Health & Wellness", examples: "Churnas, herbal oils, syrups, capsules", keywords: ["ayurved", "herbal", "churna", "kadha", "ashwagandha", "ayush", "unani"], packaging: ["BC-201", "BC-202", "BX-401"] },
  { id: "skincare", label: "Skincare & cosmetics", group: "Beauty & Personal Care", examples: "Serums, creams, sunscreen, face wash", keywords: ["skincare", "serum", "cream", "moisturi", "sunscreen", "face wash", "lotion", "cosmetic", "lip", "body butter", "toner"], packaging: ["BC-205", "BC-204", "TS-306"] },
  { id: "haircare", label: "Haircare", group: "Beauty & Personal Care", examples: "Shampoo, hair oil, conditioner, masks", keywords: ["shampoo", "hair", "conditioner", "hair oil", "hair mask", "hair serum"], packaging: ["BC-214", "BC-201", "LC-814"] },
  { id: "baby-care", label: "Baby care", group: "Beauty & Personal Care", examples: "Wipes, diapers, baby lotion", keywords: ["baby", "diaper", "wipes", "kids", "infant"], packaging: ["RL-701", "BC-214", "EC-502"] },
  { id: "home-care", label: "Home care & cleaning", group: "Home & Pet", examples: "Detergent, dishwash, floor cleaner", keywords: ["detergent", "cleaner", "dishwash", "dish wash", "floor", "laundry", "disinfectant", "hand wash", "toilet", "cleaning"], packaging: ["BC-201", "FP-104", "LC-814"] },
  { id: "pet-food", label: "Pet food & treats", group: "Home & Pet", examples: "Dog treats, chews, pet food", keywords: ["pet", "dog", "cat", "treat", "chew", "kibble"], packaging: ["FP-101", "FP-103", "EC-502"] },
];

export const CATEGORY_BY_ID = Object.fromEntries(MFG_CATEGORIES.map((category) => [category.id, category])) as Record<CategoryId, MfgCategory>;

export type Manufacturer = {
  slug: string;
  name: string;
  city?: string;
  state?: string;
  categories: CategoryId[];
  products: string[];
  services: string[];
  certifications: string[];
  moq?: string;
  capacity?: string;
  since?: string;
  website: string;
  /** One factual line taken from the manufacturer's own website. */
  about?: string;
  /** Date the public information was compiled (defaults to SEEDED_ON). */
  sourcedOn?: string;
  /** Editorial spotlight — chosen from public information, not paid and not audited. */
  spotlight?: boolean;
  /** Seeded from public information until the company claims the profile. */
  claimed: boolean;
  verification: "none" | "basic" | "verified";
};

const PL = "Private label";
const CM = "Contract manufacturing";
const CF = "Custom formulation";

const seed = (m: Omit<Manufacturer, "claimed" | "verification">): Manufacturer => ({ claimed: false, verification: "none", ...m });
const seed2 = (m: Omit<Manufacturer, "claimed" | "verification">): Manufacturer => seed({ sourcedOn: "7 October 2026", ...m });

export const SEED_MANUFACTURERS: Manufacturer[] = [
  seed({ slug: "lerel-health-foods", name: "Lerel Health Foods (Proton Biolabs LLP)", city: "Surat", state: "Gujarat", categories: ["bars"], products: ["Protein bars"], services: [PL, CM], certifications: ["FSSAI"], moq: "5,000 bars", website: "https://www.lerelhealthfoods.in/protein-bar.html" }),
  seed({ slug: "fermentis-life-sciences", name: "Fermentis Life Sciences", categories: ["bars"], products: ["Protein bars", "Energy bars"], services: [PL, CM], certifications: ["GMP", "FSSAI"], website: "https://fermentislife.com" }),
  seed({ slug: "food-innovators", name: "Food Innovators", city: "Namakkal", state: "Tamil Nadu", categories: ["bars"], products: ["Protein bars", "Nutrition bars"], services: [PL, CM, CF], certifications: ["FSSAI", "GMP"], website: "https://foodinnovators.in/pages/protein-bar-manufacturing", spotlight: true }),
  seed({ slug: "foodsure", name: "Foodsure", categories: ["bars", "spreads-sauces", "beverages"], products: ["Protein bars", "Sauces & ketchup", "Sports drinks"], services: [PL, CM], certifications: ["FSSAI", "US FDA", "ISO 22000", "FSSC 22000", "BRCGS"], website: "https://foodsure.co.in" }),
  seed({ slug: "yew-supplements", name: "Yew Supplements", state: "Gujarat", categories: ["nutraceuticals"], products: ["Tablets", "Capsules", "Gummies", "Softgels", "Sachets", "Oral powders"], services: [PL, CM], certifications: ["US FDA", "WHO-GMP", "ISO"], since: "2018", website: "https://www.yewsupplements.in", spotlight: true }),
  seed({ slug: "krone-biocare", name: "Krone Biocare", categories: ["nutraceuticals"], products: ["Tablets", "Capsules", "Gummies", "Softgels", "Powders", "Syrups"], services: [PL, CM], certifications: ["WHO-GMP"], website: "https://www.kronebiocare.com" }),
  seed({ slug: "nukind-healthcare", name: "Nukind Healthcare", categories: ["nutraceuticals"], products: ["Dietary supplements", "Gummies", "Softgels", "Tablets"], services: [PL, CM], certifications: ["GMP"], website: "https://nukindhealthcare.com" }),
  seed({ slug: "biovencer-healthcare", name: "Biovencer Healthcare", categories: ["nutraceuticals"], products: ["Nutraceuticals", "Probiotics", "Medical nutrition", "Enzymes"], services: [PL, CM, CF], certifications: [], website: "https://www.biovencer.com" }),
  seed({ slug: "nuflower-foods", name: "Nuflower Foods & Nutrition", categories: ["spreads-sauces"], products: ["Peanut butter", "Nut butters"], services: [PL, CM], certifications: [], website: "https://www.nuflowerfoods.com/nut-butters/" }),
  seed({ slug: "sonya-foods", name: "Sonya Foods", state: "Gujarat", categories: ["spreads-sauces"], products: ["Peanut butter"], services: [PL, CM], certifications: [], website: "https://sonyafoods.com" }),
  seed({ slug: "elvita-foods", name: "Elvita Foods", categories: ["spreads-sauces"], products: ["Peanut butter", "Sauces"], services: [PL], certifications: [], since: "2021", website: "https://elvitafoods.com" }),
  seed({ slug: "just-bite-foods", name: "Just Bite Foods", categories: ["spreads-sauces"], products: ["Peanut butter"], services: [PL, CM], certifications: [], website: "https://justbitefoods.com" }),
  seed({ slug: "ishan-snax", name: "Ishan Snax", city: "Siliguri", state: "West Bengal", categories: ["snacks"], products: ["Potato chips", "Namkeen", "Extruded snacks", "Fryums"], services: [PL, CM], certifications: [], website: "https://ishansnax.in", spotlight: true }),
  seed({ slug: "anant-jeet-nutriments", name: "Anant Jeet Nutriments", categories: ["snacks"], products: ["Chips", "Snacks"], services: [PL, CM, "Co-packing"], certifications: [], website: "https://anjn.in" }),
  seed({ slug: "crn-foods", name: "CRN Foods", categories: ["snacks", "confectionery"], products: ["Namkeen", "Chips", "Sweets"], services: [PL, CM], certifications: [], website: "https://www.crnfoods.com" }),
  seed({ slug: "shyam-g-snacks", name: "Shyam G Snacks", categories: ["snacks"], products: ["Snacks", "Namkeen"], services: [PL], certifications: [], website: "https://shyamg.in" }),
  seed({ slug: "radiance-overseas", name: "Radiance Overseas", city: "Indore", state: "Madhya Pradesh", categories: ["coffee-tea"], products: ["Organic coffee"], services: [PL, "White label"], certifications: ["APEDA", "EU Organic", "USDA Organic"], website: "https://www.radianceoverseas.com/private-label-coffee-manufacturers-india.html" }),
  seed({ slug: "a-tosh-and-sons", name: "A. Tosh & Sons", categories: ["coffee-tea"], products: ["Tea blends", "Tisanes", "Tea bags"], services: [PL, "Co-packing"], certifications: [], website: "https://www.tosh.in/Private-Label-Tea-Packaging" }),
  seed({ slug: "arise-cosmetic", name: "Arise Cosmetic", categories: ["haircare", "skincare"], products: ["Shampoos", "Conditioners", "Hair oils", "Serums", "Masks"], services: [PL, CM], certifications: [], website: "https://arisecosmetic.com/hair-care-products-manufacturer-india/" }),
  seed({ slug: "hcp-wellness", name: "HCP Wellness", categories: ["haircare", "skincare", "home-care", "baby-care"], products: ["Shampoo", "Hair oil", "Face serum", "Baby lotion", "Liquid detergent", "Hand wash"], services: [PL, CM], certifications: [], website: "https://www.hcpwellness.in" }),
  seed({ slug: "pine-herbals-india", name: "Pine Herbals India", city: "Ambala", state: "Haryana", categories: ["haircare"], products: ["Shampoo", "Hair oil", "Hair masks", "Conditioner"], services: [PL, CM], certifications: [], website: "https://www.pineherbalsindia.com/hair-care-private-labeling.html" }),
  seed({ slug: "bo-international", name: "BO International", categories: ["haircare", "skincare"], products: ["Shampoos", "Conditioners", "Skin serums", "Hair masks"], services: [PL, CM], certifications: [], website: "https://www.bointernational.net" }),
  seed({ slug: "ag-organica", name: "A G Organica", categories: ["home-care", "skincare"], products: ["Cleaning products", "Face serums", "Skincare"], services: [PL, CM], certifications: [], website: "https://www.pureoilsindia.com" }),
  seed({ slug: "agrochem-clean-n-care", name: "Agrochem Industries (Clean N Care)", city: "Thane", state: "Maharashtra", categories: ["home-care"], products: ["Household cleaners", "Laundry care", "Car care"], services: [PL, CM], certifications: [], website: "https://www.agrochemindustries.co.in/private-labelling.htm" }),
  seed({ slug: "neerava-hygiene", name: "Neerava Hygiene", categories: ["home-care"], products: ["Household cleaners", "Disinfectants", "Industrial cleaners"], services: [PL], certifications: [], since: "2006", website: "https://www.neerava.com" }),
  seed({ slug: "huk-natural", name: "HUK Natural", categories: ["home-care"], products: ["Liquid detergent"], services: [PL, CF], certifications: [], website: "https://huk.co.in/liquid-detergent-private-label-manufacturers/" }),
  seed({ slug: "multipack", name: "Multipack", state: "Gujarat", categories: ["home-care"], products: ["House care", "Laundry care", "Liquid cleaners"], services: [PL, CM], certifications: [], website: "https://www.multipacklabels.com/liquid-cleaner.html" }),
  seed({ slug: "innomalous-pet-food", name: "Innomalous Pet Food Products", city: "Noida", state: "Uttar Pradesh", categories: ["pet-food"], products: ["Dog & cat food", "Treats", "Chews"], services: [PL, CM], certifications: [], website: "https://innomalous.com", spotlight: true }),
  seed({ slug: "sapl-pets", name: "SAPL Pets", categories: ["pet-food"], products: ["Pet food", "Organic pet food"], services: [PL, CF], certifications: [], website: "https://www.saplpets.com" }),
  seed({ slug: "al-moin-exports", name: "Al Moin Exports", categories: ["pet-food"], products: ["Dog treats", "Bones", "Chews"], services: [CM], certifications: ["ISO", "HACCP", "US FDA registered facility"], website: "https://almoinexports.com" }),
  seed({ slug: "harvestia-group", name: "Harvestia Group", categories: ["spices", "ready-to-eat"], products: ["Spices", "Superfoods", "Ready-to-cook mixes"], services: [PL, "Co-packing"], certifications: ["FSSAI"], moq: "50 kg pilot batches", website: "https://www.harvestiagroup.com" }),
  seed({ slug: "aditya-food-product", name: "Aditya Food Product", categories: ["spices"], products: ["Spices", "Masalas"], services: [PL], certifications: ["AGMARK"], website: "https://adityafoodproduct.com/index.php/private-label-spices/" }),
  seed({ slug: "mothers-spices", name: "Mothers Spices", categories: ["spices"], products: ["Spices", "Blends"], services: [PL, "OEM"], certifications: [], website: "http://mothersspicesproducts.com" }),
  seed({ slug: "nilind-herbals", name: "Nilind Herbals", categories: ["ayurveda"], products: ["Herbal products", "Capsules", "Syrups", "Oils"], services: [PL, CM], certifications: ["ISO", "WHO-GMP", "AYUSH"], website: "https://nilindherbals.com/third-party-ayurvedic-manufacturer/" }),
  seed({ slug: "aydis-labs", name: "Aydis Labs", city: "Saha", state: "Haryana", categories: ["ayurveda", "nutraceuticals", "skincare"], products: ["Ayurvedic products", "Nutraceuticals", "Cosmetics"], services: [PL, CM], certifications: ["GMP", "AYUSH"], website: "https://aydis.in" }),
  seed({ slug: "dr-asma-herbals", name: "Dr. Asma Herbals", city: "Amritsar", state: "Punjab", categories: ["ayurveda"], products: ["Herbal medicines", "Ayurvedic products"], services: [PL, "White label"], certifications: ["GMP"], since: "1972", moq: "300 units", website: "https://asmaherbals.co.in/ayurvedic-third-party-manufacturing/" }),
  seed({ slug: "ayika-sciences", name: "Ayika Sciences", categories: ["baby-care"], products: ["Baby wipes"], services: [PL, CF], certifications: [], website: "https://ayikasciences.com/baby-wipe-manufacturer-in-india.html" }),
  seed({ slug: "adroit-molecules", name: "Adroit Molecules (ADML)", city: "Hyderabad", state: "Telangana", categories: ["baby-care"], products: ["Baby diapers", "Baby wipes"], services: [PL], certifications: [], website: "https://www.adroitmolecules.com" }),
  seed({ slug: "swara-baby-products", name: "Swara Baby Products", categories: ["baby-care"], products: ["Diapers"], services: [PL, "OEM"], certifications: [], website: "https://swarababy.com" }),
  seed({ slug: "regal-kitchen-foods", name: "Regal Kitchen Foods", categories: ["ready-to-eat"], products: ["Ready-to-eat meals", "Shelf-stable meals"], services: [PL], certifications: [], website: "https://regalkitchenfoods.com" }),
  seed({ slug: "qoot-food", name: "Qoot Food", state: "Rajasthan", categories: ["bakery"], products: ["Millet cookies", "Protein cookies", "Butter cookies"], services: [PL, CM], certifications: [], website: "https://www.qoot.food/contract-manufacturing/" }),
  seed({ slug: "koshambh", name: "Koshambh", categories: ["bakery"], products: ["Biscuits"], services: [PL, CM], certifications: [], capacity: "2,000+ MT biscuits / month", website: "https://koshambh.com/service/state-of-the-art-biscuit-manufacturing-unit/" }),
  seed({ slug: "cacobean-chocolatier", name: "Cacobean Chocolatier", categories: ["confectionery"], products: ["Chocolates"], services: ["White label", CM], certifications: [], website: "https://www.cacobean.com/white-label-manufacturers-india/" }),
  seed({ slug: "swan-sweets", name: "Swan Sweets", categories: ["confectionery"], products: ["Candies", "Confectionery"], services: [PL, CM], certifications: [], website: "https://swansweets.com/private-label-contract-manufacturing.html" }),
  seed({ slug: "aquapop-bottlers", name: "Aquapop Bottlers", city: "Jhajjar", state: "Haryana", categories: ["beverages"], products: ["Juices", "Fruit drinks", "Hot-fill beverages", "Glass bottle filling"], services: [PL, CM, "Co-packing"], certifications: [], website: "https://aquapopbottlers.com", spotlight: true }),
  seed({ slug: "dermat-india", name: "Dermat India", categories: ["skincare", "haircare"], products: ["Face serums", "Moisturisers", "Sunscreens", "Face wash", "Shampoos"], services: [PL, "OEM", "ODM"], certifications: [], website: "https://dermatindia.com", spotlight: true }),
  seed({ slug: "aadhunik-ayurveda", name: "Aadhunik Ayurveda", categories: ["skincare", "ayurveda"], products: ["Face serums", "Moisturisers"], services: [PL, CM], certifications: [], website: "https://aadhunikayurveda.com" }),
  // ── Added 7 Oct 2026 · compiled from each company's own website ──
  seed2({ slug: "ccl-products", name: "CCL Products (India)", city: "Guntur", state: "Andhra Pradesh", categories: ["coffee-tea"], products: ["Instant coffee", "Freeze-dried coffee", "Roast & ground coffee", "Coffee premixes"], services: [PL, CM], certifications: [], since: "1994", about: "Describes itself as a leading private-label instant coffee manufacturer, supplying 110+ countries.", website: "https://cclproducts.com" }),
  seed2({ slug: "vintage-coffee-beverages", name: "Vintage Coffee & Beverages", city: "Hyderabad", state: "Telangana", categories: ["coffee-tea"], products: ["Spray-dried coffee", "Agglomerated coffee", "Instant chicory"], services: [PL, "Custom packing"], certifications: [], about: "Instant coffee for client labels, packed in bulk cartons, tins, sachets or pouches.", website: "https://vcbl.coffee" }),
  seed2({ slug: "madhu-jayanti-international", name: "Madhu Jayanti International (Jay Tea)", city: "Kolkata", state: "West Bengal", categories: ["coffee-tea"], products: ["Tea bags", "Black & green tea", "Herbal infusions", "Flavoured tea"], services: [PL, "Blending & packing"], certifications: ["BRC", "IFS", "Fairtrade", "Organic"], since: "1942", about: "Calls itself the largest private-label tea packer from India, making its own tea bags and envelopes in-house.", website: "https://jaytea.com", spotlight: true }),
  seed2({ slug: "mera-kisan", name: "Mera Kisan", city: "Katihar", state: "Bihar", categories: ["snacks"], products: ["Flavoured makhana", "Roasted foxnuts"], services: [PL, "OEM", CF], certifications: ["FSSAI", "APEDA", "Halal"], moq: "100 kg", capacity: "Up to 100 MT / month", about: "B2B makhana maker with 25+ flavour variants and custom seasoning development.", website: "https://shopping.merakisan.com" }),
  seed2({ slug: "akums", name: "Akums Drugs & Pharmaceuticals", city: "Delhi", state: "Delhi", categories: ["nutraceuticals", "ayurveda", "skincare"], products: ["Tablets & capsules", "Gummies", "Softgels", "Ayurvedic formulations", "Cosmetics & derma"], services: [CM, CF], certifications: ["WHO-GMP", "US FDA", "EU-GMP", "FSSAI"], about: "Large contract development and manufacturing organisation with 15+ facilities across India.", website: "https://www.akums.in" }),
  seed2({ slug: "munnangi-easy-eats", name: "Munnangi Easy Eats", city: "Navi Mumbai", state: "Maharashtra", categories: ["ready-to-eat"], products: ["Retort meals", "Frozen snacks", "Ready-to-cook kits", "Sauces & gravies"], services: [PL, CM, CF], certifications: ["FSSAI", "ISO 22000", "HACCP"], since: "2025", about: "R&D-led food maker with a chef-led lab; product development in as little as 90 days.", website: "https://www.munnangieasyeats.com" }),
  seed2({ slug: "lotus-chocolate", name: "Lotus Chocolate Company", city: "Hyderabad", state: "Telangana", categories: ["confectionery"], products: ["Compound & couverture", "Cocoa products", "Consumer chocolates"], services: [CM, "Custom solutions"], certifications: [], since: "1989", about: "Cocoa and chocolate maker serving institutional clients and brands with customised solutions.", website: "https://www.lotuschocolate.com" }),
  seed2({ slug: "cosmetify", name: "Cosmetify", city: "Panchkula", state: "Haryana", categories: ["skincare", "haircare", "baby-care"], products: ["Face serums", "Creams & lotions", "Shampoos & hair masks", "Body wash", "Baby care"], services: [PL, "OEM", CF], certifications: ["GMP", "ISO"], moq: "3,000–5,000 pieces", about: "Private-label cosmetics maker with an in-house R&D lab and automated filling.", website: "https://www.cosmetify.in" }),
  seed2({ slug: "vimson-derma", name: "Vimson Derma", city: "Santej, Kalol", state: "Gujarat", categories: ["skincare", "haircare", "baby-care"], products: ["Skincare", "Haircare", "Body care", "Baby & mother care", "Men's grooming"], services: [PL, CM, CF], certifications: ["GMP", "ISO 9001", "Halal"], moq: "6,000 units per SKU", about: "Two plants in Santej handling formulation, sampling, packaging design and compliance.", website: "https://www.vimsonderma.com" }),
  seed2({ slug: "organico-beverages", name: "Organico Beverages", city: "Mumbai", state: "Maharashtra", categories: ["beverages"], products: ["Fruit drinks", "Functional sodas", "Energy & sports drinks", "Iced tea", "Dairy drinks"], services: [CM, "Co-packing", CF], certifications: [], about: "Beverage co-packer with warm and hot fill; bottles from 160 ml to 2 litres.", website: "https://organicobeverages.com" }),
  seed2({ slug: "gdm-nutraceuticals", name: "GDM Nutraceuticals", city: "Surat", state: "Gujarat", categories: ["nutraceuticals", "skincare"], products: ["Tablets & capsules", "Effervescent tablets", "Syrups", "Sachets & powders"], services: [PL, CM, CF], certifications: ["FSSAI", "GMP", "ISO"], moq: "25,000–50,000 units", since: "2010", about: "Private-label nutraceuticals for 30+ countries from a 50,000 sq ft facility.", website: "https://www.gdmnutra.com" }),
  seed2({ slug: "ascovita-healthcare", name: "Ascovita Healthcare", city: "Anand", state: "Gujarat", categories: ["nutraceuticals"], products: ["Effervescent tablets", "Capsules & softgels", "Gummies", "Powders & sachets"], services: [PL, "White label", CM], certifications: ["FSSAI", "WHO-GMP"], moq: "500 units per SKU", about: "Low-MOQ nutraceutical maker with founder-level contact and 48-hour quotes.", website: "https://www.ascovita.com" }),
  seed2({ slug: "numix", name: "Numix", city: "Kashipur", state: "Uttarakhand", categories: ["bars"], products: ["Protein bars", "Energy bars", "Granola bars", "Vegan bars"], services: [CM, PL], certifications: ["cGMP", "ISO 22000", "Halal"], capacity: "5,00,000 bars / day", about: "Dedicated nutrition-bar plant running sheet-and-cut and cold-extrusion lines with enrobing.", website: "https://numix.in", spotlight: true }),
  seed2({ slug: "ld-foods", name: "LD Foods", city: "Keshod", state: "Gujarat", categories: ["bars", "snacks"], products: ["Protein bars", "Muesli", "Oats", "Nut mixes"], services: [PL, CM], certifications: ["FSSAI", "HACCP", "FSSC 22000"], capacity: "2,00,000 units / day", since: "2019", about: "Healthy-snack maker offering formulation, manufacturing and packaging as one service.", website: "https://ldfoodsgroup.com" }),
  seed2({ slug: "shantis", name: "Shanti's", categories: ["snacks", "spreads-sauces"], products: ["Breakfast cereals", "Muesli & granola", "Cereal snacks", "Jams"], services: [PL], certifications: ["FSSAI", "ISO 22000", "HACCP", "Halal"], since: "1984", about: "Cereal, snack and jam maker offering private-label supply.", website: "https://www.shantis.com" }),
  seed2({ slug: "vlc-spices", name: "VLC Spices", city: "Navi Mumbai", state: "Maharashtra", categories: ["spices"], products: ["Whole spices", "Ground spices", "Dehydrated products"], services: [PL, "Contract packing"], certifications: ["FSSC 22000", "ISO", "US FDA", "Halal", "Kosher"], about: "Packs spices in PET and glass jars, pouches, tins or bulk bags with your artwork.", website: "https://www.vlcspices.com" }),
  seed2({ slug: "pappadeli", name: "Pappadeli India", city: "Kochi", state: "Kerala", categories: ["spices"], products: ["Whole spices", "Spice powders", "Masala blends", "Seasonings"], services: [PL, "Contract packing", CF], certifications: ["FSSAI", "ISO 22000", "HACCP"], moq: "100 kg (single spices)", about: "300+ spice varieties near Kochi port, with pilot programmes for new brands.", website: "https://indiaspicesupplier.com" }),
  seed2({ slug: "lifevision-cosmetics", name: "Lifevision Cosmetics", city: "Chandigarh", state: "Chandigarh", categories: ["haircare", "skincare", "baby-care"], products: ["Shampoos", "Face wash", "Sunscreen", "Body wash", "Baby care"], services: [PL, CM], certifications: [], since: "2010", about: "Private-label haircare and derma-cosmetics, with a free sampling policy.", website: "https://www.lifevisioncosmetics.com" }),
  seed2({ slug: "the-rich-daddy-international", name: "The Rich Daddy International", city: "Surat", state: "Gujarat", categories: ["haircare"], products: ["Hair oils", "Shampoos", "Conditioners", "Hair masks", "Hair serums"], services: [PL, CM, "OEM / ODM"], certifications: [], about: "Haircare specialist offering low MOQs for startups.", website: "https://therichdaddyinternational.com" }),
  seed2({ slug: "ess-pee-quality-products", name: "Ess Pee Quality Products", categories: ["bakery"], products: ["Butter cookies", "Choco-chip cookies", "Sugar-free cookies", "Gluten-free cookies"], services: [PL], certifications: ["US FDA registered", "HACCP", "ISO 22000", "Halal", "Kosher"], about: "Export-ready private-label cookies, shipped to 35+ countries.", website: "https://esspees.com" }),
  seed2({ slug: "tummyfriendly-foods", name: "TummyFriendly Foods", city: "Hyderabad", state: "Telangana", categories: ["snacks", "bakery", "spreads-sauces"], products: ["Kids cereals & porridges", "Millet cookies", "Baked snacks", "Nut butters", "Health mixes"], services: [PL, "White label", CM], certifications: ["FSSAI", "NPOP Organic"], moq: "100 kg per SKU", about: "Organic-certified maker with 60+ ready formulations and in-house labs.", website: "https://tummyfriendlyfoods.com" }),
  seed2({ slug: "sgs-herbals", name: "SGS Herbals", city: "Noida", state: "Uttar Pradesh", categories: ["home-care"], products: ["Floor cleaners", "Housekeeping chemicals", "Hygiene products"], services: [PL, "OEM", "Third-party manufacturing"], certifications: [], since: "2005", about: "Cleaning and hygiene maker with automated filling lines and an R&D lab.", website: "https://www.sgsherbals.com" }),
  seed2({ slug: "zoic-cosmetics", name: "Zoic Cosmetics", city: "Mohali", state: "Punjab", categories: ["skincare", "haircare", "ayurveda"], products: ["Herbal skincare", "Haircare", "Ayurvedic cosmetics"], services: [PL, CM], certifications: ["GMP"], about: "Herbal and plant-based cosmetic formulations, free from paraffin and alcohol.", website: "https://www.zoiccosmetic.com" }),
  seed2({ slug: "fibro-foods", name: "Fibro Foods", city: "Salem", state: "Tamil Nadu", categories: ["ready-to-eat"], products: ["Retort meals", "Ready-to-cook", "Pre-cooked rice & pulses"], services: [CM, PL], certifications: ["US FDA", "ISO 22000", "GMP", "FSSAI"], about: "Retort manufacturing offered as a service to brands, QSRs and cloud kitchens.", website: "https://fibrofoods.com", spotlight: true }),
  seed2({ slug: "sanskar-ayush-medicare", name: "Sanskar Ayush Medicare", city: "Haridwar", state: "Uttarakhand", categories: ["ayurveda", "skincare", "nutraceuticals"], products: ["Ayurvedic capsules & tablets", "Juices & syrups", "Churna & granules", "Herbal cosmetics"], services: [PL, "Third-party manufacturing", CF], certifications: ["GMP", "ISO 9001", "HACCP", "FSSAI", "AYUSH Premium Mark"], since: "2010", about: "Ayurvedic third-party maker with an NABL-accredited in-house testing lab.", website: "https://sanskarayush.in" }),
  seed2({ slug: "shree-shanker-ayurvedic-pharmacy", name: "Shree Shanker Ayurvedic Pharmacy", categories: ["ayurveda"], products: ["Syrups", "Tablets", "Capsules", "Churna", "Oils"], services: [PL, CM, CF], certifications: ["WHO-GMP", "ISO"], moq: "2,000 units per pack", since: "1942", about: "Ayurvedic pharmacy offering contract manufacturing and custom formulations.", website: "https://shreeshankerayurvedicpharmacy.com" }),
  seed2({ slug: "shimlared", name: "ShimlaRed (Shimla Hills Offerings)", city: "Shimla", state: "Himachal Pradesh", categories: ["ready-to-eat", "spreads-sauces"], products: ["Retort meals", "Dips & sauces", "Ketchup", "Tomato puree"], services: [PL], certifications: [], about: "Shelf-stable Indian meals and sauces, made in bulk or under private label.", website: "https://shimlared.com" }),
  seed2({ slug: "rigil-healthcare", name: "Rigil Healthcare", city: "Vadodara", state: "Gujarat", categories: ["ayurveda"], products: ["Herbal syrups", "Ayurvedic capsules & tablets", "Herbal oils", "Powders"], services: [PL, "Third-party manufacturing"], certifications: ["GMP", "ISO", "AYUSH"], about: "Third-party and private-label Ayurvedic manufacturing with in-house R&D.", website: "https://rigilhealthcare.com" }),
  seed2({ slug: "medkyn-lifecare", name: "Medkyn Lifecare", city: "Ahmedabad", state: "Gujarat", categories: ["nutraceuticals"], products: ["Tablets & capsules", "Softgels", "Sachets & granules", "Liquids"], services: [CM, CF], certifications: ["WHO-GMP", "FSSAI", "ISO 9001"], about: "Existing formulas typically ship in 8–14 weeks, with full batch documentation.", website: "https://medkynlifecare.com" }),
  seed2({ slug: "dhiman-foods", name: "Dhiman Foods", city: "Nakodar", state: "Punjab", categories: ["confectionery"], products: ["Toffees", "Hard-boiled candies", "Lollipops", "Gummies"], services: [PL], certifications: [], capacity: "1 to 600+ MT / month", about: "Confectionery maker with 75+ years in the trade and an in-house QC lab.", website: "https://dhimanfoods.com" }),
  seed2({ slug: "deepam-industries", name: "Deepam Industries (Parkash)", city: "Sirsa", state: "Haryana", categories: ["confectionery"], products: ["Candy", "Soft toffee"], services: [PL, "Third-party manufacturing", "Job work"], certifications: [], about: "Candy and toffee maker taking private-label and job-work orders.", website: "https://www.parkashtoffee.com" }),
  seed2({ slug: "dazzler-confectionery", name: "Dazzler Confectionery", categories: ["confectionery"], products: ["Lollipops", "Bubble gum", "Hard-boiled candies"], services: [PL, CM], certifications: ["BRCGS"], moq: "Low MOQ on private-label packs", about: "30+ years making lollipops and gum, shipping to 30+ countries.", website: "https://www.dazzler.in" }),
  seed2({ slug: "mor-medics", name: "Mor Medics", city: "Ludhiana", state: "Punjab", categories: ["baby-care"], products: ["Baby wipes", "Facial wipes", "Sanitising wipes", "Disinfectant wipes"], services: [PL, CM], certifications: ["ISO 9001", "Halal"], about: "Wet-wipes maker offering private labelling, R&D and testing.", website: "https://mormedics.com" }),
  seed2({ slug: "amhygiene", name: "AmHygiene", city: "Vahelal, Ahmedabad", state: "Gujarat", categories: ["baby-care"], products: ["Baby wipes", "Wet wipes", "Hand sanitiser"], services: [PL, CM, CF], certifications: ["ISO"], about: "Packs 20 to 80-pull flow packs; standard wipes in about 4–5 weeks.", website: "https://www.amhygiene.co.in" }),
];

export const SEEDED_ON = "5 October 2026";

export function getManufacturer(slug: string, extra: Manufacturer[] = []) {
  return [...extra, ...SEED_MANUFACTURERS].find((manufacturer) => manufacturer.slug === slug);
}

// ── Requirement parsing (works fully offline; AI only enriches it) ───────────
export type ParsedRequirement = {
  category: CategoryId | null;
  product: string;
  monthlyUnits: number | null;
  certifications: string[];
  services: string[];
  location: string | null;
  packaging: string | null;
  summary: string;
  ai: boolean;
};

const STATES = ["Gujarat", "Maharashtra", "Tamil Nadu", "Karnataka", "Kerala", "Telangana", "Andhra Pradesh", "Haryana", "Punjab", "Delhi", "Uttar Pradesh", "Rajasthan", "Madhya Pradesh", "West Bengal", "Himachal Pradesh", "Uttarakhand", "Goa", "Odisha", "Bihar"];
const CITY_STATE: Record<string, string> = { mumbai: "Maharashtra", pune: "Maharashtra", thane: "Maharashtra", ahmedabad: "Gujarat", surat: "Gujarat", rajkot: "Gujarat", bangalore: "Karnataka", bengaluru: "Karnataka", chennai: "Tamil Nadu", hyderabad: "Telangana", kolkata: "West Bengal", noida: "Uttar Pradesh", gurgaon: "Haryana", gurugram: "Haryana", jaipur: "Rajasthan", indore: "Madhya Pradesh", baddi: "Himachal Pradesh" };
const CERTS = ["FSSAI", "WHO-GMP", "GMP", "ISO", "HACCP", "BRCGS", "AYUSH", "Organic", "US FDA", "Halal", "FSSC 22000"];
const PACKS = ["flow wrap", "flow-wrap", "stand-up pouch", "pouch", "sachet", "jar", "bottle", "tube", "carton", "can", "tin", "box", "glass"];

/** Maps a city or state the user typed onto the state we store for factories. */
export function normaliseLocation(value: string | null | undefined): string | null {
  if (!value) return null;
  const v = value.toLowerCase();
  return STATES.find((state) => v.includes(state.toLowerCase())) || Object.entries(CITY_STATE).find(([city]) => v.includes(city))?.[1] || value;
}

export function parseRequirementLocally(query: string): ParsedRequirement {
  const q = query.toLowerCase();
  let best: { id: CategoryId; score: number } | null = null;
  for (const category of MFG_CATEGORIES) {
    const score = category.keywords.reduce((sum, keyword) => (q.includes(keyword) ? sum + keyword.length : sum), 0);
    if (score && (!best || score > best.score)) best = { id: category.id, score };
  }
  const unitMatch = Array.from(q.matchAll(/(\d[\d,.]*)\s*(k|thousand|lakh|lac|l\b|m\b|million)?(?:\s*(?:[a-z-]+\s+)?(units|pcs|pieces|packs|bars|bottles|jars|kg|per month|\/\s*month|a month|monthly|pm\b))?/g)).find((hit) => hit[2] || hit[3]);
  let monthlyUnits: number | null = null;
  if (unitMatch) {
    const base = Number(unitMatch[1].replace(/,/g, ""));
    const mult = unitMatch[2] ? ({ k: 1e3, thousand: 1e3, lakh: 1e5, lac: 1e5, l: 1e5, m: 1e6, million: 1e6 } as Record<string, number>)[unitMatch[2]] || 1 : 1;
    if (Number.isFinite(base)) monthlyUnits = Math.round(base * mult);
  }
  const certifications = CERTS.filter((cert) => q.includes(cert.toLowerCase()));
  const services = [
    q.includes("private label") || q.includes("white label") ? "private label" : "",
    q.includes("formulat") || q.includes("custom recipe") || q.includes("own recipe") ? "custom formulation" : "",
    q.includes("co-pack") || q.includes("copack") ? "co-packing" : "",
  ].filter(Boolean);
  const stateHit = STATES.find((state) => q.includes(state.toLowerCase()));
  const cityHit = Object.keys(CITY_STATE).find((city) => q.includes(city));
  const packaging = PACKS.find((pack) => q.includes(pack)) || null;
  const category = best?.id ?? null;
  const product = category
    ? CATEGORY_BY_ID[category].keywords.filter((keyword) => q.includes(keyword)).sort((a, b) => b.length - a.length)[0] || CATEGORY_BY_ID[category].label
    : query.trim().split(/[,.]/)[0].slice(0, 60);
  return {
    category,
    product,
    monthlyUnits,
    certifications,
    services,
    location: stateHit || (cityHit ? CITY_STATE[cityHit] : null),
    packaging,
    summary: query.trim(),
    ai: false,
  };
}

export type Match = { manufacturer: Manufacturer; score: number; reasons: string[] };

/** Ranks manufacturers against a requirement and explains every point awarded. */
export function matchManufacturers(req: ParsedRequirement, pool: Manufacturer[]): Match[] {
  const productWords = req.product.toLowerCase().split(/\s+/).filter((word) => word.length > 3);
  return pool
    .map((manufacturer) => {
      const reasons: string[] = [];
      let score = 0;
      if (req.category && manufacturer.categories.includes(req.category)) {
        score += 52;
        reasons.push(`Makes ${CATEGORY_BY_ID[req.category].label.toLowerCase()}`);
      }
      const productHit = manufacturer.products.find((product) => productWords.some((word) => product.toLowerCase().includes(word)));
      if (productHit) { score += 18; reasons.push(`Lists ${productHit.toLowerCase()}`); }
      const certHits = req.certifications.filter((cert) => manufacturer.certifications.some((have) => have.toLowerCase().includes(cert.toLowerCase())));
      if (req.certifications.length) {
        score += Math.round((certHits.length / req.certifications.length) * 12);
        if (certHits.length) reasons.push(`States ${certHits.join(", ")}`);
      } else if (manufacturer.certifications.length) {
        score += 6;
      }
      const serviceHits = req.services.filter((service) => manufacturer.services.some((have) => have.toLowerCase().includes(service.split(" ")[0])));
      if (serviceHits.length) { score += 8; reasons.push(`Offers ${serviceHits.join(", ")}`); }
      if (req.location && manufacturer.state === req.location) { score += 6; reasons.push(`Based in ${manufacturer.state}`); }
      if (manufacturer.verification === "verified") { score += 4; reasons.push("Packworkz verified"); }
      return { manufacturer, score: Math.min(99, score), reasons };
    })
    .filter((match) => match.score >= 40)
    .sort((a, b) => b.score - a.score || Number(b.manufacturer.spotlight) - Number(a.manufacturer.spotlight));
}

/** Converts an approved self-listing from the API into a directory profile. */
export function listingToManufacturer(listing: { id: string; name: string; profile: any; verified: boolean; basic_checked: boolean }): Manufacturer {
  const profile = listing.profile || {};
  const slug = String(profile.slug || listing.name).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  return {
    slug,
    name: listing.name,
    city: profile.city || undefined,
    state: profile.state || undefined,
    categories: (Array.isArray(profile.categories) ? profile.categories : []).filter((id: string) => id in CATEGORY_BY_ID),
    products: Array.isArray(profile.products) ? profile.products : String(profile.products || "").split(",").map((item: string) => item.trim()).filter(Boolean),
    services: Array.isArray(profile.services) ? profile.services : [],
    certifications: Array.isArray(profile.certifications) ? profile.certifications : [],
    moq: profile.moq || undefined,
    capacity: profile.capacity || undefined,
    since: profile.since || undefined,
    website: profile.website || "",
    claimed: true,
    verification: listing.verified ? "verified" : listing.basic_checked ? "basic" : "none",
  };
}

// ── SEO, shared by the prerender and the client-side title updates ───────────
type Seo = { title: string; description: string; keywords: string };

export function categorySeo(category: MfgCategory): Seo {
  return {
    title: `${category.label} Manufacturers India | Private Label & Contract | Packworkz`,
    description: `Find private-label and contract manufacturers for ${category.examples.toLowerCase()} in India. Compare capabilities, certifications and MOQ, request free introductions, and source the packaging with Packworkz.`,
    keywords: `${category.label.toLowerCase()} manufacturer India, private label ${category.label.toLowerCase()}, third party ${category.label.toLowerCase()} manufacturing, contract manufacturer India`,
  };
}

export function manufacturerSeo(manufacturer: Manufacturer): Seo {
  return {
    title: `${manufacturer.name} | ${manufacturer.products.slice(0, 2).join(", ")} Manufacturer${manufacturer.state ? `, ${manufacturer.state}` : ""} | Packworkz`,
    description: `${manufacturer.name}${manufacturer.city ? `, ${manufacturer.city}` : ""} — ${manufacturer.services.join(", ").toLowerCase()} for ${manufacturer.products.join(", ").toLowerCase()}. Request a free introduction through Packworkz Make.`,
    keywords: `${manufacturer.name}, ${manufacturer.products.join(", ").toLowerCase()} manufacturer`,
  };
}

/** SEO for /manufacturing/:category and /manufacturers/:slug, if the path is one. */
export function manufacturingSeoFor(pathname: string): Seo | undefined {
  const category = pathname.match(/^\/manufacturing\/([^/]+)$/)?.[1];
  if (category && category in CATEGORY_BY_ID) return categorySeo(CATEGORY_BY_ID[category as CategoryId]);
  const slug = pathname.match(/^\/manufacturers\/([^/]+)$/)?.[1];
  const manufacturer = slug ? getManufacturer(decodeURIComponent(slug)) : undefined;
  return manufacturer ? manufacturerSeo(manufacturer) : undefined;
}
