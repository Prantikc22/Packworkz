// ── PackOps SKU Catalog — 33 SKUs across 10 categories ──────────────────────
// Each SKU has variants (decision-oriented options) and customization fields

export type VariantGroup = {
  key: string;
  label: string;
  options: string[];
};

export type CustomField = {
  key: string;
  label: string;
  type: "number" | "text" | "select";
  options?: string[];
  placeholder?: string;
  unit?: string;
};

export type Sku = {
  id: string;
  code: string;
  name: string;
  category: string;
  slug: string;
  description: string;
  use_case: string;
  price_min: number;
  price_max: number;
  moq: number;
  moq_unit: string;
  is_smartstock: boolean;
  is_eco: boolean;
  sample_tier: "standard" | "premium" | "complex";
  sample_price: number;
  delivery_days_india: number;
  variants: VariantGroup[];
  customization_fields: CustomField[];
};

export type Category = {
  slug: string;
  label: string;
  icon: string;
  count: number;
};

// ── Category definitions ────────────────────────────────────────────────────
export const CATEGORIES: Category[] = [
  { slug: "flexible",   label: "Flexible Packaging",    icon: "package_2",                 count: 5 },
  { slug: "bottles",    label: "Bottles & Containers",  icon: "local_drink",               count: 6 },
  { slug: "tubes",      label: "Tubes & Small Packs",   icon: "medication",                count: 2 },
  { slug: "boxes",      label: "Boxes & Cartons",       icon: "inventory_2",               count: 3 },
  { slug: "ecommerce",  label: "E-commerce Packaging",  icon: "local_shipping",            count: 4 },
  { slug: "protective", label: "Protective Packaging",  icon: "shield",                    count: 2 },
  { slug: "rolls",      label: "Packaging Rolls",       icon: "density_medium",            count: 3 },
  { slug: "labels",     label: "Labels & Closures",     icon: "label",                     count: 3 },
  { slug: "sustainable",label: "Sustainable Packaging", icon: "eco",                       count: 4 },
  { slug: "liquid",     label: "Liquid Cartons",        icon: "water_drop",                count: 1 },
];

// ── Full SKU catalog ────────────────────────────────────────────────────────
export const SKUS: Sku[] = [

  // ── 1. FLEXIBLE PACKAGING (5) ──────────────────────────────────────────────
  {
    id: "flex-standup",
    code: "FP-101",
    name: "Stand-up Pouch",
    category: "flexible",
    slug: "stand-up-pouch",
    description: "Gusseted base stand-up pouch ideal for retail display. Supports multiple closure and material combinations.",
    use_case: "Snacks, coffee, pet food, spices, dry goods",
    price_min: 4.50, price_max: 18.00, moq: 1000, moq_unit: "units",
    is_smartstock: true, is_eco: false, sample_tier: "standard", sample_price: 2999, delivery_days_india: 12,
    variants: [
      { key: "closure", label: "Closure Type", options: ["None", "Zipper", "Spout"] },
      { key: "material", label: "Material", options: ["Plastic (BOPP/PE)", "Kraft Paper", "Metalized Film"] },
      { key: "finish", label: "Finish", options: ["Matte", "Glossy"] },
    ],
    customization_fields: [
      { key: "width", label: "Width (mm)", type: "number", placeholder: "e.g. 150", unit: "mm" },
      { key: "height", label: "Height (mm)", type: "number", placeholder: "e.g. 250", unit: "mm" },
      { key: "gusset", label: "Gusset / Base (mm)", type: "number", placeholder: "e.g. 80", unit: "mm" },
      { key: "print_colors", label: "No. of Print Colors", type: "select", options: ["1", "2", "4", "6", "8+"] },
    ],
  },
  {
    id: "flex-pillow",
    code: "FP-102",
    name: "Pillow Pouch",
    category: "flexible",
    slug: "pillow-pouch",
    description: "Simple center-seal pillow bag for high-speed packing lines. Compact, lightweight, and cost-effective.",
    use_case: "Candies, biscuits, sachets, agricultural inputs",
    price_min: 2.00, price_max: 8.50, moq: 2000, moq_unit: "units",
    is_smartstock: true, is_eco: false, sample_tier: "standard", sample_price: 2999, delivery_days_india: 10,
    variants: [
      { key: "material", label: "Material", options: ["Plastic (BOPP/PE)", "Kraft Paper", "Metalized Film"] },
      { key: "finish", label: "Finish", options: ["Matte", "Glossy"] },
    ],
    customization_fields: [
      { key: "width", label: "Width (mm)", type: "number", placeholder: "e.g. 120", unit: "mm" },
      { key: "length", label: "Length (mm)", type: "number", placeholder: "e.g. 200", unit: "mm" },
      { key: "print_colors", label: "No. of Print Colors", type: "select", options: ["1", "2", "4", "6", "8+"] },
    ],
  },
  {
    id: "flex-flatbottom",
    code: "FP-103",
    name: "Flat Bottom Pouch",
    category: "flexible",
    slug: "flat-bottom-pouch",
    description: "Premium shelf-display pouch with flat bottom and optional side gussets for wide visibility.",
    use_case: "Specialty coffee, protein powder, premium snacks, tea",
    price_min: 8.00, price_max: 28.00, moq: 500, moq_unit: "units",
    is_smartstock: false, is_eco: false, sample_tier: "premium", sample_price: 4999, delivery_days_india: 14,
    variants: [
      { key: "closure", label: "Closure Type", options: ["None", "Zipper", "Spout"] },
      { key: "material", label: "Material", options: ["Plastic (BOPP/PE)", "Kraft Paper", "Metalized Film"] },
      { key: "finish", label: "Finish", options: ["Matte", "Glossy"] },
    ],
    customization_fields: [
      { key: "width", label: "Width (mm)", type: "number", placeholder: "e.g. 160", unit: "mm" },
      { key: "height", label: "Height (mm)", type: "number", placeholder: "e.g. 280", unit: "mm" },
      { key: "side_gusset", label: "Side Gusset (mm)", type: "number", placeholder: "e.g. 60", unit: "mm" },
      { key: "print_colors", label: "No. of Print Colors", type: "select", options: ["1", "2", "4", "6", "8+"] },
    ],
  },
  {
    id: "flex-spout",
    code: "FP-104",
    name: "Spout Pouch",
    category: "flexible",
    slug: "spout-pouch",
    description: "Liquid-ready pouch with welded spout fitment for controlled dispensing.",
    use_case: "Baby food, juices, sauces, ketchup, energy drinks",
    price_min: 9.00, price_max: 32.00, moq: 500, moq_unit: "units",
    is_smartstock: false, is_eco: false, sample_tier: "premium", sample_price: 4999, delivery_days_india: 14,
    variants: [
      { key: "material", label: "Material", options: ["Plastic (BOPP/PE)", "Kraft Paper", "Metalized Film"] },
      { key: "finish", label: "Finish", options: ["Matte", "Glossy"] },
      { key: "cap_type", label: "Spout Cap", options: ["Standard Screw", "Sports Cap", "Push-Pull"] },
    ],
    customization_fields: [
      { key: "width", label: "Width (mm)", type: "number", placeholder: "e.g. 130", unit: "mm" },
      { key: "height", label: "Height (mm)", type: "number", placeholder: "e.g. 220", unit: "mm" },
      { key: "volume_ml", label: "Volume (ml)", type: "number", placeholder: "e.g. 200", unit: "ml" },
    ],
  },
  {
    id: "flex-sachet",
    code: "FP-105",
    name: "Sachet / Stick Pack",
    category: "flexible",
    slug: "sachet-stick-pack",
    description: "Single-serve sachet or stick pack for portion-controlled packaging.",
    use_case: "Sugar, salt, condiments, instant coffee, ORS, supplements",
    price_min: 0.80, price_max: 4.00, moq: 5000, moq_unit: "units",
    is_smartstock: true, is_eco: false, sample_tier: "standard", sample_price: 1999, delivery_days_india: 10,
    variants: [
      { key: "format", label: "Format", options: ["Sachet (3-side seal)", "Stick Pack (4-side seal)"] },
      { key: "material", label: "Material", options: ["Plastic (BOPP/PE)", "Metalized Film", "Kraft Paper"] },
    ],
    customization_fields: [
      { key: "width", label: "Width (mm)", type: "number", placeholder: "e.g. 60", unit: "mm" },
      { key: "length", label: "Length (mm)", type: "number", placeholder: "e.g. 100", unit: "mm" },
      { key: "fill_weight", label: "Fill Weight (g/ml)", type: "number", placeholder: "e.g. 5", unit: "g" },
    ],
  },

  // ── 2. BOTTLES & CONTAINERS (6) ────────────────────────────────────────────
  {
    id: "bot-plastic",
    code: "BC-201",
    name: "Plastic Bottle (PET/HDPE)",
    category: "bottles",
    slug: "plastic-bottle",
    description: "Versatile plastic bottle in PET or HDPE, suitable for food, beverage, personal care, and agrochemical use.",
    use_case: "Water, juices, shampoos, cooking oils, agrochemicals",
    price_min: 8.00, price_max: 45.00, moq: 500, moq_unit: "units",
    is_smartstock: true, is_eco: false, sample_tier: "standard", sample_price: 2999, delivery_days_india: 10,
    variants: [
      { key: "material", label: "Material", options: ["PET (clear/colored)", "HDPE (opaque)"] },
      { key: "cap_type", label: "Cap / Closure", options: ["Screw Cap", "Pump", "Spray", "Flip-top"] },
      { key: "shape", label: "Shape", options: ["Round", "Square", "Oval"] },
    ],
    customization_fields: [
      { key: "volume_ml", label: "Volume (ml)", type: "select", options: ["50", "100", "200", "250", "500", "1000", "2000", "Custom"] },
      { key: "color", label: "Bottle Color", type: "text", placeholder: "e.g. Amber, Clear, White" },
      { key: "label_type", label: "Label Type", type: "select", options: ["Sleeve Label", "Pressure Sensitive", "In-Mould", "None"] },
    ],
  },
  {
    id: "bot-glass",
    code: "BC-202",
    name: "Glass Bottle",
    category: "bottles",
    slug: "glass-bottle",
    description: "Premium glass bottle for beverages, spirits, sauces, and premium liquids. Available in clear and colored glass.",
    use_case: "Craft beer, wine, spirits, hot sauces, kombucha, essential oils",
    price_min: 22.00, price_max: 120.00, moq: 200, moq_unit: "units",
    is_smartstock: false, is_eco: true, sample_tier: "premium", sample_price: 4999, delivery_days_india: 18,
    variants: [
      { key: "color", label: "Glass Color", options: ["Clear", "Amber", "Green", "Cobalt Blue"] },
      { key: "cap_type", label: "Closure", options: ["Crown Cap", "Cork", "Screw Cap", "ROPP Aluminum"] },
      { key: "shape", label: "Shape", options: ["Round", "Square", "Flask"] },
    ],
    customization_fields: [
      { key: "volume_ml", label: "Volume (ml)", type: "select", options: ["50", "100", "200", "330", "500", "750", "1000"] },
      { key: "embossing", label: "Embossing / Debossing", type: "select", options: ["None", "Logo only", "Full label panel"] },
    ],
  },
  {
    id: "bot-glass-jar",
    code: "BC-203",
    name: "Glass Jar",
    category: "bottles",
    slug: "glass-jar",
    description: "Wide-mouth glass jar for food, cosmetics, and specialty products. Airtight lid options available.",
    use_case: "Jams, honey, pickles, spreads, face creams, candles",
    price_min: 18.00, price_max: 90.00, moq: 200, moq_unit: "units",
    is_smartstock: false, is_eco: true, sample_tier: "premium", sample_price: 4999, delivery_days_india: 18,
    variants: [
      { key: "color", label: "Glass Color", options: ["Clear", "Amber", "Frosted"] },
      { key: "lid_type", label: "Lid Type", options: ["Metal Twist-off", "Plastisol Lined", "Wooden Lid"] },
      { key: "shape", label: "Shape", options: ["Round", "Square", "Hexagonal"] },
    ],
    customization_fields: [
      { key: "volume_ml", label: "Volume (ml)", type: "select", options: ["50", "100", "200", "300", "500", "1000"] },
    ],
  },
  {
    id: "bot-cosmetic-jar",
    code: "BC-204",
    name: "Cosmetic Jar",
    category: "bottles",
    slug: "cosmetic-jar",
    description: "Elegant cosmetic-grade jar in acrylic, PETG, or glass. Ideal for high-end skincare and beauty brands.",
    use_case: "Face cream, body butter, hair mask, serums, beard balm",
    price_min: 12.00, price_max: 75.00, moq: 200, moq_unit: "units",
    is_smartstock: false, is_eco: false, sample_tier: "premium", sample_price: 4999, delivery_days_india: 14,
    variants: [
      { key: "material", label: "Material", options: ["Acrylic", "PETG (Plastic)", "Glass"] },
      { key: "lid_type", label: "Lid Type", options: ["Standard", "Flat", "Inner Cap"] },
      { key: "finish", label: "Surface Finish", options: ["Glossy", "Matte", "Frosted", "Metallic"] },
    ],
    customization_fields: [
      { key: "volume_ml", label: "Volume (ml)", type: "select", options: ["15", "30", "50", "100", "150", "200"] },
      { key: "color", label: "Jar Color", type: "text", placeholder: "e.g. Opal White, Rose Gold" },
    ],
  },
  {
    id: "bot-dropper",
    code: "BC-205",
    name: "Dropper Bottle",
    category: "bottles",
    slug: "dropper-bottle",
    description: "Precision dropper bottle for serums, essential oils, CBD, and pharma liquids. Tamper-evident options available.",
    use_case: "Face serums, essential oils, CBD tinctures, eye drops, aromatherapy",
    price_min: 15.00, price_max: 60.00, moq: 200, moq_unit: "units",
    is_smartstock: false, is_eco: false, sample_tier: "standard", sample_price: 2999, delivery_days_india: 12,
    variants: [
      { key: "material", label: "Material", options: ["Glass (Amber)", "Glass (Clear)", "PETG (Plastic)"] },
      { key: "dropper", label: "Dropper Type", options: ["Standard Rubber Bulb", "Child-Resistant", "Plastic Pipette"] },
    ],
    customization_fields: [
      { key: "volume_ml", label: "Volume (ml)", type: "select", options: ["5", "10", "15", "30", "50"] },
    ],
  },
  {
    id: "bot-airless",
    code: "BC-206",
    name: "Airless Pump Bottle",
    category: "bottles",
    slug: "airless-pump-bottle",
    description: "Vacuum-based airless pump bottle. No contamination, precise dose control. Preferred by premium skincare brands.",
    use_case: "Serums, moisturizers, foundations, sunscreens, anti-aging creams",
    price_min: 28.00, price_max: 130.00, moq: 200, moq_unit: "units",
    is_smartstock: false, is_eco: false, sample_tier: "complex", sample_price: 7999, delivery_days_india: 18,
    variants: [
      { key: "material", label: "Body Material", options: ["Plastic (ABS)", "Aluminum", "PCR Plastic (Recycled)"] },
      { key: "finish", label: "Finish", options: ["Glossy", "Matte", "Metallic Spray"] },
    ],
    customization_fields: [
      { key: "volume_ml", label: "Volume (ml)", type: "select", options: ["15", "30", "50", "100", "150"] },
      { key: "dose_ml", label: "Dose per Pump (ml)", type: "select", options: ["0.2", "0.3", "0.5", "1.0"] },
      { key: "color", label: "Color", type: "text", placeholder: "e.g. White, Black, Rose Gold" },
    ],
  },

  // ── 3. TUBES & SMALL PACKS (2) ─────────────────────────────────────────────
  {
    id: "tube-cosmetic",
    code: "TS-301",
    name: "Cosmetic Tube",
    category: "tubes",
    slug: "cosmetic-tube",
    description: "Flexible squeeze tube in HDPE, LDPE, or laminate. Available with flip-top, disc-top, and nozzle closures.",
    use_case: "Toothpaste, lotions, sunscreen, hair color, hand cream, pharma gels",
    price_min: 5.00, price_max: 22.00, moq: 1000, moq_unit: "units",
    is_smartstock: true, is_eco: false, sample_tier: "standard", sample_price: 2999, delivery_days_india: 12,
    variants: [
      { key: "material", label: "Material", options: ["HDPE / LDPE (Plastic)", "Laminate (Multi-layer)", "ABL (Aluminum Barrier)"] },
      { key: "cap_type", label: "Cap / Nozzle", options: ["Flip-top Cap", "Disc-top Cap", "Nozzle (Pharma)", "Screw Cap"] },
      { key: "finish", label: "Print Finish", options: ["Matte", "Glossy", "Silk"] },
    ],
    customization_fields: [
      { key: "diameter", label: "Tube Diameter (mm)", type: "select", options: ["16", "19", "22", "25", "28", "35", "40"] },
      { key: "volume_ml", label: "Volume (ml)", type: "select", options: ["10", "20", "30", "50", "75", "100", "150", "200"] },
      { key: "print_colors", label: "Print Colors", type: "select", options: ["1", "2", "4", "6", "8+"] },
    ],
  },
  {
    id: "tube-blister",
    code: "TS-302",
    name: "Blister Pack",
    category: "tubes",
    slug: "blister-pack",
    description: "Thermoformed PVC/PET blister with aluminum or card backing. Pharma-grade and retail-grade options.",
    use_case: "Tablets, capsules, batteries, small hardware, stationary",
    price_min: 1.50, price_max: 12.00, moq: 2000, moq_unit: "units",
    is_smartstock: false, is_eco: false, sample_tier: "complex", sample_price: 7999, delivery_days_india: 18,
    variants: [
      { key: "blister_material", label: "Blister Material", options: ["PVC", "PET (Eco)", "PVDC (Barrier)"] },
      { key: "backing", label: "Backing", options: ["Aluminum Foil", "Card (Paper)", "PET Film"] },
    ],
    customization_fields: [
      { key: "cavities", label: "No. of Cavities", type: "select", options: ["4", "6", "8", "10", "12", "16", "Custom"] },
      { key: "cavity_size", label: "Cavity Diameter (mm)", type: "number", placeholder: "e.g. 12", unit: "mm" },
    ],
  },

  // ── 4. BOXES & CARTONS (3) ─────────────────────────────────────────────────
  {
    id: "box-folding",
    code: "BX-401",
    name: "Folding Carton (Mono Carton)",
    category: "boxes",
    slug: "folding-carton",
    description: "Straight-line or reverse tuck-end folding carton in SBS or duplex board. Full color print with UV/aqueous options.",
    use_case: "FMCG, pharma, personal care, food, electronics retail",
    price_min: 3.00, price_max: 18.00, moq: 500, moq_unit: "units",
    is_smartstock: true, is_eco: false, sample_tier: "standard", sample_price: 2999, delivery_days_india: 12,
    variants: [
      { key: "tuck_style", label: "Box Style", options: ["Straight Tuck End (STE)", "Reverse Tuck End (RTE)", "Auto-Lock Bottom"] },
      { key: "board", label: "Board Type", options: ["SBS (White)", "Duplex Board", "Kraft Board"] },
      { key: "print", label: "Print", options: ["Plain", "Printed (1–4 colors)", "Printed (5+ colors)"] },
      { key: "finish", label: "Finish", options: ["Matte Lamination", "Glossy Lamination", "Soft-touch Lamination", "UV Spot"] },
    ],
    customization_fields: [
      { key: "length", label: "Length (mm)", type: "number", placeholder: "e.g. 100", unit: "mm" },
      { key: "width", label: "Width (mm)", type: "number", placeholder: "e.g. 50", unit: "mm" },
      { key: "height", label: "Height (mm)", type: "number", placeholder: "e.g. 150", unit: "mm" },
      { key: "board_gsm", label: "Board GSM", type: "select", options: ["250", "300", "350", "400"] },
    ],
  },
  {
    id: "box-rigid",
    code: "BX-402",
    name: "Rigid Box",
    category: "boxes",
    slug: "rigid-box",
    description: "Chipboard-based rigid set-up box. Can be wrapped in paper, fabric, or leatherette with various interior finishing options.",
    use_case: "Premium gifting, electronics, watches, luxury goods, corporate packs",
    price_min: 65.00, price_max: 350.00, moq: 100, moq_unit: "units",
    is_smartstock: false, is_eco: false, sample_tier: "premium", sample_price: 4999, delivery_days_india: 18,
    variants: [
      { key: "box_type", label: "Box Type", options: ["Lid & Base (Shoebox)", "Neck & Shoulder", "Clamshell", "Book Style"] },
      { key: "wrap", label: "Outer Wrap", options: ["Art Paper", "Linen", "Leatherette", "Velvet"] },
      { key: "finish", label: "Print Finish", options: ["Matte", "Glossy", "Foil Stamp", "Embossed"] },
      { key: "interior", label: "Interior Lining", options: ["None", "Foam Insert", "Satin Ribbon", "Velvet Lining"] },
    ],
    customization_fields: [
      { key: "length", label: "Length (mm)", type: "number", placeholder: "e.g. 200", unit: "mm" },
      { key: "width", label: "Width (mm)", type: "number", placeholder: "e.g. 150", unit: "mm" },
      { key: "height", label: "Height (mm)", type: "number", placeholder: "e.g. 80", unit: "mm" },
    ],
  },
  {
    id: "box-magnetic",
    code: "BX-403",
    name: "Magnetic Closure Box",
    category: "boxes",
    slug: "magnetic-closure-box",
    description: "Premium collapsible magnetic-closure box. Flat-pack design reduces shipping costs. Ideal for D2C brand gifting.",
    use_case: "D2C gifting, subscription boxes, luxury retail, electronics unboxing",
    price_min: 80.00, price_max: 400.00, moq: 100, moq_unit: "units",
    is_smartstock: false, is_eco: false, sample_tier: "premium", sample_price: 4999, delivery_days_india: 18,
    variants: [
      { key: "finish", label: "Outer Finish", options: ["Matte Lamination", "Glossy Lamination", "Soft-touch Velvet"] },
      { key: "print", label: "Print Treatment", options: ["Plain (Single Color)", "Full Color", "Foil Stamp", "UV Spot + Foil"] },
      { key: "insert", label: "Interior Insert", options: ["None", "Foam Insert", "Corrugated Insert", "Satin Ribbon"] },
    ],
    customization_fields: [
      { key: "length", label: "Length (mm)", type: "number", placeholder: "e.g. 250", unit: "mm" },
      { key: "width", label: "Width (mm)", type: "number", placeholder: "e.g. 200", unit: "mm" },
      { key: "height", label: "Height (mm)", type: "number", placeholder: "e.g. 100", unit: "mm" },
    ],
  },

  // ── 5. E-COMMERCE PACKAGING (4) ────────────────────────────────────────────
  {
    id: "ecom-mailer-box",
    code: "EC-501",
    name: "Mailer Box",
    category: "ecommerce",
    slug: "mailer-box",
    description: "Self-locking tuck-top mailer box in corrugated or rigid board. Premium unboxing experience for D2C brands.",
    use_case: "D2C shipping, subscription boxes, fashion, food kits, cosmetics",
    price_min: 18.00, price_max: 75.00, moq: 200, moq_unit: "units",
    is_smartstock: true, is_eco: false, sample_tier: "standard", sample_price: 2999, delivery_days_india: 10,
    variants: [
      { key: "board", label: "Board Type", options: ["Corrugated (3-ply)", "Corrugated (5-ply)", "Rigid Grey Board"] },
      { key: "print", label: "Print", options: ["Plain (Kraft)", "Single Color", "Full Color (inside+out)"] },
      { key: "finish", label: "Finish", options: ["Uncoated (Kraft)", "Matte Lamination", "Glossy Lamination", "Soft-touch"] },
    ],
    customization_fields: [
      { key: "length", label: "Length (mm)", type: "number", placeholder: "e.g. 250", unit: "mm" },
      { key: "width", label: "Width (mm)", type: "number", placeholder: "e.g. 180", unit: "mm" },
      { key: "height", label: "Height (mm)", type: "number", placeholder: "e.g. 100", unit: "mm" },
    ],
  },
  {
    id: "ecom-corrugated",
    code: "EC-502",
    name: "Corrugated Box (Shipping)",
    category: "ecommerce",
    slug: "corrugated-shipping-box",
    description: "Standard RSC or die-cut corrugated shipping box. Available in 3-ply and 5-ply configurations.",
    use_case: "General e-commerce shipping, FMCG bulk dispatch, B2B warehouse",
    price_min: 8.00, price_max: 35.00, moq: 500, moq_unit: "units",
    is_smartstock: true, is_eco: false, sample_tier: "standard", sample_price: 2999, delivery_days_india: 10,
    variants: [
      { key: "ply", label: "Board Strength", options: ["3-ply (Standard)", "5-ply (Heavy Duty)", "7-ply (Industrial)"] },
      { key: "style", label: "Box Style", options: ["RSC (Regular Slotted)", "Die-cut", "Self-locking (No tape)"] },
      { key: "print", label: "Print", options: ["Plain (Kraft)", "Single Color", "Two Color"] },
    ],
    customization_fields: [
      { key: "length", label: "Length (mm)", type: "number", placeholder: "e.g. 300", unit: "mm" },
      { key: "width", label: "Width (mm)", type: "number", placeholder: "e.g. 200", unit: "mm" },
      { key: "height", label: "Height (mm)", type: "number", placeholder: "e.g. 150", unit: "mm" },
      { key: "ect", label: "Edge Crush Test (ECT)", type: "select", options: ["23 ECT", "32 ECT", "44 ECT", "Custom"] },
    ],
  },
  {
    id: "ecom-food-delivery",
    code: "EC-503",
    name: "Food Delivery Box",
    category: "ecommerce",
    slug: "food-delivery-box",
    description: "Thermal or standard corrugated box for food delivery. Grease-resistant coating and FSSAI-compliant materials.",
    use_case: "Cloud kitchens, QSR, tiffin services, meal kit delivery, bakeries",
    price_min: 10.00, price_max: 40.00, moq: 200, moq_unit: "units",
    is_smartstock: true, is_eco: false, sample_tier: "standard", sample_price: 2999, delivery_days_india: 10,
    variants: [
      { key: "type", label: "Box Type", options: ["Standard (Non-thermal)", "Thermal Insulated", "Tamper-evident"] },
      { key: "material", label: "Board", options: ["Corrugated (3-ply)", "Kraft Board", "Duplex with PE coating"] },
    ],
    customization_fields: [
      { key: "size", label: "Size", type: "select", options: ["Small (15×15×8)", "Medium (25×25×10)", "Large (35×35×12)", "Custom"] },
      { key: "grease_coat", label: "Grease-resistant Coating", type: "select", options: ["Yes", "No"] },
    ],
  },
  {
    id: "ecom-courier-bag",
    code: "EC-504",
    name: "Courier Bag",
    category: "ecommerce",
    slug: "courier-bag",
    description: "Lightweight tamper-evident courier bag in poly or kraft paper. Self-seal adhesive strip. Pre-printed or blank options.",
    use_case: "E-commerce courier shipping, clothing, documents, books",
    price_min: 2.50, price_max: 10.00, moq: 1000, moq_unit: "units",
    is_smartstock: true, is_eco: false, sample_tier: "standard", sample_price: 1999, delivery_days_india: 8,
    variants: [
      { key: "material", label: "Material", options: ["Poly (LDPE)", "Kraft Paper", "Co-extruded (Strong)"] },
      { key: "print", label: "Print", options: ["Blank / Unprinted", "Single Color (Logo)", "Full Color"] },
    ],
    customization_fields: [
      { key: "size", label: "Bag Size", type: "select", options: ["XS (18×22 cm)", "S (25×30 cm)", "M (30×40 cm)", "L (40×50 cm)", "XL (50×60 cm)", "Custom"] },
    ],
  },

  // ── 6. PROTECTIVE PACKAGING (2) ────────────────────────────────────────────
  {
    id: "prot-bubble",
    code: "PR-601",
    name: "Bubble Wrap / Air Pillows",
    category: "protective",
    slug: "bubble-wrap-air-pillows",
    description: "Classic bubble wrap rolls or inflated air pillow packs for void-fill and product cushioning in transit.",
    use_case: "Fragile goods, electronics, ceramics, glassware, e-commerce void fill",
    price_min: 1200, price_max: 5000, moq: 1, moq_unit: "rolls",
    is_smartstock: true, is_eco: false, sample_tier: "standard", sample_price: 1999, delivery_days_india: 7,
    variants: [
      { key: "type", label: "Type", options: ["Bubble Wrap Roll", "Air Pillows (pre-inflated)", "Bubble Bags"] },
      { key: "bubble_size", label: "Bubble Size", options: ["Small (10mm)", "Medium (20mm)", "Large (25mm)"] },
    ],
    customization_fields: [
      { key: "roll_width", label: "Roll Width (m)", type: "select", options: ["0.5", "1.0", "1.2", "1.5"] },
      { key: "roll_length", label: "Roll Length (m)", type: "select", options: ["50", "100", "200", "500"] },
    ],
  },
  {
    id: "prot-foam",
    code: "PR-602",
    name: "Foam / Thermocol Inserts",
    category: "protective",
    slug: "foam-thermocol-inserts",
    description: "Custom die-cut EPE foam or EPS thermocol inserts shaped to product contours for maximum protection.",
    use_case: "Electronics, fragile items, medical devices, instruments, toolkits",
    price_min: 15.00, price_max: 180.00, moq: 100, moq_unit: "units",
    is_smartstock: false, is_eco: false, sample_tier: "complex", sample_price: 7999, delivery_days_india: 14,
    variants: [
      { key: "material", label: "Insert Material", options: ["EPE Foam", "EPS Thermocol", "Polyurethane Foam", "Moulded Pulp (Eco)"] },
      { key: "type", label: "Insert Type", options: ["Die-cut Flat", "Profile / Contoured", "Cradle Insert", "Full Shell"] },
    ],
    customization_fields: [
      { key: "length", label: "Length (mm)", type: "number", placeholder: "e.g. 300", unit: "mm" },
      { key: "width", label: "Width (mm)", type: "number", placeholder: "e.g. 200", unit: "mm" },
      { key: "thickness", label: "Foam Thickness (mm)", type: "select", options: ["10", "15", "20", "25", "30", "40", "50"] },
    ],
  },

  // ── 7. PACKAGING ROLLS (3) ─────────────────────────────────────────────────
  {
    id: "roll-printed",
    code: "RL-701",
    name: "Printed Packaging Roll",
    category: "rolls",
    slug: "printed-packaging-roll",
    description: "Custom-printed flexible packaging roll for form-fill-seal (FFS) machines. BOPP/PE and BOPP/CPP base structures.",
    use_case: "Snacks, wafers, namkeen, biscuits, instant noodles, dry fruits",
    price_min: 180, price_max: 450, moq: 100, moq_unit: "kg",
    is_smartstock: false, is_eco: false, sample_tier: "complex", sample_price: 7999, delivery_days_india: 21,
    variants: [
      { key: "structure", label: "Laminate Structure", options: ["BOPP / PE", "BOPP / CPP", "PET / PE", "MET PET / PE"] },
      { key: "barrier", label: "Barrier Level", options: ["Low (standard)", "Medium (moisture)", "High (oxygen + moisture)"] },
      { key: "print_type", label: "Print Type", options: ["Rotogravure", "Digital", "Flexo"] },
      { key: "finish", label: "Finish", options: ["Matte", "Glossy", "Pearlized"] },
    ],
    customization_fields: [
      { key: "roll_width", label: "Roll Width (mm)", type: "number", placeholder: "e.g. 400", unit: "mm" },
      { key: "roll_length", label: "Roll Length (m)", type: "select", options: ["1000", "2000", "3000", "5000"] },
      { key: "colors", label: "No. of Print Colors", type: "select", options: ["1", "2", "4", "6", "8+"] },
    ],
  },
  {
    id: "roll-laminated",
    code: "RL-702",
    name: "Laminated Barrier Roll",
    category: "rolls",
    slug: "laminated-barrier-roll",
    description: "High-barrier laminated roll for products requiring extended shelf-life. Aluminum and metallized structures.",
    use_case: "Coffee, dairy products, ready meals, pharmaceutical sachets, frozen foods",
    price_min: 240, price_max: 600, moq: 100, moq_unit: "kg",
    is_smartstock: false, is_eco: false, sample_tier: "complex", sample_price: 7999, delivery_days_india: 21,
    variants: [
      { key: "structure", label: "Laminate Structure", options: ["PET / AL / PE (High Barrier)", "BOPP / PVDC / PE", "MET PET / CPP"] },
      { key: "barrier", label: "Barrier Level", options: ["Medium", "High", "Ultra-high"] },
      { key: "finish", label: "Finish", options: ["Matte", "Glossy", "Metallic"] },
    ],
    customization_fields: [
      { key: "roll_width", label: "Roll Width (mm)", type: "number", placeholder: "e.g. 400", unit: "mm" },
      { key: "roll_length", label: "Roll Length (m)", type: "select", options: ["1000", "2000", "3000"] },
      { key: "oxygen_tr", label: "Oxygen Transmission Rate (cc/m²/day)", type: "text", placeholder: "e.g. <1" },
    ],
  },
  {
    id: "roll-eco",
    code: "RL-703",
    name: "Eco-friendly Packaging Roll",
    category: "rolls",
    slug: "eco-friendly-packaging-roll",
    description: "Recyclable mono-material or compostable flexible roll to replace traditional multi-layer laminates.",
    use_case: "Organic food brands, eco-conscious FMCG, sustainable private labels",
    price_min: 220, price_max: 550, moq: 100, moq_unit: "kg",
    is_smartstock: false, is_eco: true, sample_tier: "complex", sample_price: 7999, delivery_days_india: 21,
    variants: [
      { key: "material", label: "Material", options: ["Mono BOPP (Recyclable)", "PLA / PBAT (Compostable)", "Paper / PE", "PCR-PE (Recycled)"] },
      { key: "finish", label: "Finish", options: ["Matte", "Glossy", "Natural Kraft"] },
    ],
    customization_fields: [
      { key: "roll_width", label: "Roll Width (mm)", type: "number", placeholder: "e.g. 400", unit: "mm" },
      { key: "roll_length", label: "Roll Length (m)", type: "select", options: ["1000", "2000", "3000"] },
      { key: "certification", label: "Certification Required", type: "select", options: ["None", "BPI (Compostable)", "TÜV OK Biobased", "RecyClass"] },
    ],
  },

  // ── 8. LABELS & CLOSURES (3) ───────────────────────────────────────────────
  {
    id: "label-all",
    code: "LC-801",
    name: "Labels (All Types)",
    category: "labels",
    slug: "labels",
    description: "Comprehensive label supply: pressure-sensitive, shrink sleeve, in-mould, and wet-glue. All substrates and finishes.",
    use_case: "Bottles, jars, tubes, cartons, flexible packs, FMCG, pharma",
    price_min: 0.50, price_max: 8.00, moq: 1000, moq_unit: "units",
    is_smartstock: true, is_eco: false, sample_tier: "standard", sample_price: 1999, delivery_days_india: 10,
    variants: [
      { key: "label_type", label: "Label Type", options: ["Pressure Sensitive (PSL)", "Shrink Sleeve", "In-Mould Label", "Wet-Glue"] },
      { key: "material", label: "Material", options: ["BOPP", "Paper", "PET", "PE"] },
      { key: "finish", label: "Finish", options: ["Matte", "Glossy", "Transparent"] },
    ],
    customization_fields: [
      { key: "width", label: "Width (mm)", type: "number", placeholder: "e.g. 70", unit: "mm" },
      { key: "height", label: "Height (mm)", type: "number", placeholder: "e.g. 110", unit: "mm" },
      { key: "print_colors", label: "Print Colors", type: "select", options: ["1", "2", "4", "6", "8+"] },
    ],
  },
  {
    id: "label-caps",
    code: "LC-802",
    name: "Caps & Pumps",
    category: "labels",
    slug: "caps-and-pumps",
    description: "Full range of closures: screw caps, pumps, sprayers, and flip-tops. Compatible with standard neck sizes.",
    use_case: "Bottles (PET/glass), tubes, jars, dispensers",
    price_min: 2.00, price_max: 35.00, moq: 500, moq_unit: "units",
    is_smartstock: true, is_eco: false, sample_tier: "standard", sample_price: 1999, delivery_days_india: 8,
    variants: [
      { key: "type", label: "Closure Type", options: ["Screw Cap", "Lotion Pump", "Spray Pump", "Trigger Sprayer", "Disc-top Cap", "Flip-top Cap"] },
      { key: "material", label: "Material", options: ["Plastic (PP/PE)", "Aluminum", "PCR Plastic"] },
    ],
    customization_fields: [
      { key: "neck_mm", label: "Neck Size (mm)", type: "select", options: ["18/410", "20/410", "24/410", "28/410", "28/415", "Custom"] },
      { key: "color", label: "Color", type: "text", placeholder: "e.g. White, Black, Chrome" },
    ],
  },
  {
    id: "label-fitments",
    code: "LC-803",
    name: "Zipper / Spout Fitments",
    category: "labels",
    slug: "zipper-spout-fitments",
    description: "Zipper press-to-close strips and injection-moulded spout fitments for flexible packaging.",
    use_case: "Stand-up pouches, spouted pouches, reclosable bags",
    price_min: 0.80, price_max: 6.00, moq: 2000, moq_unit: "units",
    is_smartstock: false, is_eco: false, sample_tier: "standard", sample_price: 1999, delivery_days_india: 12,
    variants: [
      { key: "type", label: "Fitment Type", options: ["Zipper Strip (press-to-close)", "Spout + Cap (18mm)", "Spout + Sports Cap", "Child-resistant Spout"] },
    ],
    customization_fields: [
      { key: "color", label: "Color", type: "text", placeholder: "e.g. Natural, White, Custom" },
    ],
  },

  // ── 9. SUSTAINABLE PACKAGING (4) ───────────────────────────────────────────
  {
    id: "sust-kraft",
    code: "SP-901",
    name: "Kraft / Paper Packaging",
    category: "sustainable",
    slug: "kraft-paper-packaging",
    description: "Unbleached kraft paper packaging: bags, wraps, and boxes. FSC-certified and recyclable.",
    use_case: "Bakeries, organic food, retail, gifting, stationery, e-commerce",
    price_min: 3.00, price_max: 22.00, moq: 500, moq_unit: "units",
    is_smartstock: true, is_eco: true, sample_tier: "standard", sample_price: 2999, delivery_days_india: 10,
    variants: [
      { key: "format", label: "Format", options: ["Kraft Paper Bag", "Kraft Box", "Kraft Wrap Roll"] },
      { key: "handle", label: "Handle (for bags)", options: ["None", "Twisted Paper Handle", "Flat Paper Handle", "Cotton Handle"] },
    ],
    customization_fields: [
      { key: "gsm", label: "Paper GSM", type: "select", options: ["70", "90", "100", "120", "150", "Custom"] },
      { key: "print_colors", label: "Print Colors", type: "select", options: ["None", "1", "2", "4"] },
    ],
  },
  {
    id: "sust-compostable",
    code: "SP-902",
    name: "Compostable Packaging",
    category: "sustainable",
    slug: "compostable-packaging",
    description: "Home or industrial compostable bags, pouches, and films certified to EN 13432 / ASTM D6400.",
    use_case: "Organic food, zero-waste brands, farmer's markets, specialty retail",
    price_min: 8.00, price_max: 45.00, moq: 500, moq_unit: "units",
    is_smartstock: false, is_eco: true, sample_tier: "premium", sample_price: 4999, delivery_days_india: 14,
    variants: [
      { key: "material", label: "Base Material", options: ["PLA / PBAT blend", "Cellulose Film", "Starch-based Film"] },
      { key: "format", label: "Format", options: ["Flat Bag", "Stand-up Pouch", "Film Roll"] },
    ],
    customization_fields: [
      { key: "certification", label: "Certification", type: "select", options: ["BPI (USA)", "TÜV OK Compost (EU)", "CPCB (India)"] },
      { key: "print_colors", label: "Print Colors", type: "select", options: ["None", "1", "2", "4"] },
    ],
  },
  {
    id: "sust-recycled",
    code: "SP-903",
    name: "Recycled Packaging",
    category: "sustainable",
    slug: "recycled-packaging",
    description: "PCR (post-consumer recycled) plastic packaging with documented chain of custody. Reduces virgin plastic use.",
    use_case: "FMCG brands with sustainability commitments, export packaging with EU compliance",
    price_min: 6.00, price_max: 38.00, moq: 500, moq_unit: "units",
    is_smartstock: false, is_eco: true, sample_tier: "premium", sample_price: 4999, delivery_days_india: 14,
    variants: [
      { key: "material", label: "Recycled Material", options: ["PCR-PE", "PCR-PET", "rHDPE (Recycled HDPE)"] },
      { key: "format", label: "Format", options: ["Bag / Pouch", "Bottle", "Film / Roll"] },
    ],
    customization_fields: [
      { key: "pcr_percent", label: "% PCR Content", type: "select", options: ["25%", "50%", "75%", "100%"] },
    ],
  },
  {
    id: "sust-bagasse",
    code: "SP-904",
    name: "Bagasse / Pulp Packaging",
    category: "sustainable",
    slug: "bagasse-pulp-packaging",
    description: "Moulded sugarcane bagasse or recycled pulp trays, bowls, containers, and inserts. Microwave-safe and composable.",
    use_case: "Food service (QSR, cloud kitchens), moulded inserts, eco trays for retail",
    price_min: 4.00, price_max: 30.00, moq: 200, moq_unit: "units",
    is_smartstock: true, is_eco: true, sample_tier: "standard", sample_price: 2999, delivery_days_india: 10,
    variants: [
      { key: "material", label: "Pulp Source", options: ["Sugarcane Bagasse", "Wheat Straw Pulp", "Recycled Newspaper Pulp"] },
      { key: "format", label: "Format", options: ["Plate / Tray", "Bowl", "Clamshell Container", "Moulded Insert"] },
    ],
    customization_fields: [
      { key: "size", label: "Size (approx)", type: "select", options: ["6 inch", "8 inch", "10 inch", "12 inch", "Custom"] },
      { key: "coating", label: "Coating", type: "select", options: ["None", "PLA-coated (grease-resistant)", "Wax-coated"] },
    ],
  },

  // ── 10. LIQUID CARTONS (1) ─────────────────────────────────────────────────
  {
    id: "liq-aseptic",
    code: "LC-1001",
    name: "Aseptic Carton (Tetra Pak Type)",
    category: "liquid",
    slug: "aseptic-carton",
    description: "Multi-layer aseptic liquid carton for shelf-stable dairy, juice, and liquid food. UHT processing compatible.",
    use_case: "Dairy (milk, lassi), juices, soups, plant-based milks, coconut water",
    price_min: 12.00, price_max: 60.00, moq: 5000, moq_unit: "units",
    is_smartstock: false, is_eco: false, sample_tier: "complex", sample_price: 7999, delivery_days_india: 28,
    variants: [
      { key: "shape", label: "Carton Shape", options: ["Brick / Prisma (standard)", "Square (Cube)", "Slimline"] },
      { key: "opening", label: "Opening Type", options: ["Straw Hole", "Screw Cap", "Pull-tab"] },
    ],
    customization_fields: [
      { key: "volume_ml", label: "Volume (ml)", type: "select", options: ["65", "125", "200", "250", "500", "1000"] },
      { key: "layers", label: "Barrier Layers", type: "select", options: ["6-layer (standard)", "7-layer (ultra-barrier)"] },
      { key: "print_colors", label: "Print Colors", type: "select", options: ["4", "6", "8+"] },
    ],
  },
];

// ── SKU image map (code → local asset) ──────────────────────────────────────
export const SKU_IMAGES: Record<string, string> = {
  // Flexible Packaging
  "FP-101": "/skus/Standup_Pouch.jpg",
  "FP-102": "/skus/pillowpouch.jpg",
  "FP-103": "/skus/flatbottompouch.jpg",
  "FP-104": "/skus/spoutpouch.jpg",
  "FP-105": "/skus/sachet.jpg",
  // Bottles & Containers
  "BC-201": "/skus/plasticbottles.jpg",
  "BC-202": "/skus/glassbottles.jpg",
  "BC-203": "/skus/glassjar.jpg",
  "BC-204": "/skus/cosmeticjar.jpg",
  "BC-205": "/skus/dropperbottle.jpg",
  "BC-206": "/skus/airlesspumpbottles.jpg",
  // Tubes & Small Packs
  "TS-301": "/skus/cosmetictubes.jpg",
  "TS-302": "/skus/blisterpacks.jpg",
  // Boxes & Cartons
  "BX-401": "/skus/foldingbox.jpg",
  "BX-402": "/skus/rigidbox.jpg",
  "BX-403": "/skus/magneticbox.jpg",
  // E-commerce
  "EC-501": "/skus/mailerbox.jpg",
  "EC-502": "/skus/corrugatedbox.jpg",
  "EC-503": "/skus/foodbox.jpg",
  "EC-504": "/skus/courierbag.jpg",
  // Protective Packaging
  "PR-601": "/skus/bubblewrapbox.jpg",
  "PR-602": "/skus/foaminsert.jpg",
  // Packaging Rolls
  "RL-701": "/skus/printedpackagingrolls.jpg",
  "RL-702": "/skus/laminatedrolls.jpg",
  "RL-703": "/skus/ecofriendlyroll.jpg",
  // Labels & Closures
  "LC-801": "/skus/labels.jpg",
  "LC-802": "/skus/closures.jpg",
  "LC-803": "/skus/zipper.jpg",
  // Sustainable Packaging
  "SP-901": "/skus/kraftpaperpacks.jpg",
  "SP-902": "/skus/compostablepacks.jpg",
  "SP-903": "/skus/recycledfoodbox.jpg",
  "SP-904": "/skus/recycledbox.jpg",
  // Liquid Cartons
  "LC-1001": "/skus/asepticpacks.jpg",
};

// ── Lookup helpers ──────────────────────────────────────────────────────────
export function getSkusByCategory(category: string): Sku[] {
  return SKUS.filter(s => s.category === category);
}

export function getSkuById(id: string): Sku | undefined {
  return SKUS.find(s => s.id === id);
}

export function getCategoryBySlug(slug: string): Category | undefined {
  return CATEGORIES.find(c => c.slug === slug);
}
