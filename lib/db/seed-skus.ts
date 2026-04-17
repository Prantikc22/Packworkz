// Run: npx tsx lib/db/seed-skus.ts
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import { productsTable } from "./src/schema/products.ts";
import { sql } from "drizzle-orm";

const { Pool } = pg;

if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL not set");
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool);

const SKUS = [
  // ── 1. FLEXIBLE PACKAGING ──────────────────────────────────────────────────
  {
    name: "Stand-up Pouch", slug: "stand-up-pouch", category: "flexible",
    description: "Gusseted base stand-up pouch ideal for retail display. Supports multiple closure and material combinations.",
    use_case: "Snacks, coffee, pet food, spices, dry goods",
    price_min: "4.50", price_max: "18.00", moq: 1000, moq_unit: "units",
    is_smartstock: true, is_eco: false, sample_tier: "standard", sample_price: 2999, delivery_days_india: 12, delivery_days_global: 30,
    specs: {
      code: "FP-101",
      variants: [
        { key: "closure", label: "Closure Type", options: ["None", "Zipper", "Spout"] },
        { key: "material", label: "Material", options: ["Plastic (BOPP/PE)", "Kraft Paper", "Metalized Film"] },
        { key: "finish", label: "Finish", options: ["Matte", "Glossy"] },
      ],
      customization_fields: [
        { key: "width", label: "Width (mm)", type: "number", unit: "mm" },
        { key: "height", label: "Height (mm)", type: "number", unit: "mm" },
        { key: "gusset", label: "Gusset / Base (mm)", type: "number", unit: "mm" },
        { key: "print_colors", label: "No. of Print Colors", type: "select", options: ["1","2","4","6","8+"] },
      ],
    },
  },
  {
    name: "Pillow Pouch", slug: "pillow-pouch", category: "flexible",
    description: "Simple center-seal pillow bag for high-speed packing lines. Compact, lightweight, and cost-effective.",
    use_case: "Candies, biscuits, sachets, agricultural inputs",
    price_min: "2.00", price_max: "8.50", moq: 2000, moq_unit: "units",
    is_smartstock: true, is_eco: false, sample_tier: "standard", sample_price: 2999, delivery_days_india: 10, delivery_days_global: 28,
    specs: {
      code: "FP-102",
      variants: [
        { key: "material", label: "Material", options: ["Plastic (BOPP/PE)", "Kraft Paper", "Metalized Film"] },
        { key: "finish", label: "Finish", options: ["Matte", "Glossy"] },
      ],
      customization_fields: [
        { key: "width", label: "Width (mm)", type: "number", unit: "mm" },
        { key: "length", label: "Length (mm)", type: "number", unit: "mm" },
        { key: "print_colors", label: "No. of Print Colors", type: "select", options: ["1","2","4","6","8+"] },
      ],
    },
  },
  {
    name: "Flat Bottom Pouch", slug: "flat-bottom-pouch", category: "flexible",
    description: "Premium shelf-display pouch with flat bottom and optional side gussets for wide visibility.",
    use_case: "Specialty coffee, protein powder, premium snacks, tea",
    price_min: "8.00", price_max: "28.00", moq: 500, moq_unit: "units",
    is_smartstock: false, is_eco: false, sample_tier: "premium", sample_price: 4999, delivery_days_india: 14, delivery_days_global: 32,
    specs: {
      code: "FP-103",
      variants: [
        { key: "closure", label: "Closure Type", options: ["None", "Zipper", "Spout"] },
        { key: "material", label: "Material", options: ["Plastic (BOPP/PE)", "Kraft Paper", "Metalized Film"] },
        { key: "finish", label: "Finish", options: ["Matte", "Glossy"] },
      ],
      customization_fields: [
        { key: "width", label: "Width (mm)", type: "number", unit: "mm" },
        { key: "height", label: "Height (mm)", type: "number", unit: "mm" },
        { key: "side_gusset", label: "Side Gusset (mm)", type: "number", unit: "mm" },
        { key: "print_colors", label: "No. of Print Colors", type: "select", options: ["1","2","4","6","8+"] },
      ],
    },
  },
  {
    name: "Spout Pouch", slug: "spout-pouch", category: "flexible",
    description: "Liquid-ready pouch with welded spout fitment for controlled dispensing.",
    use_case: "Baby food, juices, sauces, ketchup, energy drinks",
    price_min: "9.00", price_max: "32.00", moq: 500, moq_unit: "units",
    is_smartstock: false, is_eco: false, sample_tier: "premium", sample_price: 4999, delivery_days_india: 14, delivery_days_global: 32,
    specs: {
      code: "FP-104",
      variants: [
        { key: "material", label: "Material", options: ["Plastic (BOPP/PE)", "Kraft Paper", "Metalized Film"] },
        { key: "finish", label: "Finish", options: ["Matte", "Glossy"] },
        { key: "cap_type", label: "Spout Cap", options: ["Standard Screw", "Sports Cap", "Push-Pull"] },
      ],
      customization_fields: [
        { key: "width", label: "Width (mm)", type: "number", unit: "mm" },
        { key: "height", label: "Height (mm)", type: "number", unit: "mm" },
        { key: "volume_ml", label: "Volume (ml)", type: "number", unit: "ml" },
      ],
    },
  },
  {
    name: "Sachet / Stick Pack", slug: "sachet-stick-pack", category: "flexible",
    description: "Single-serve sachet or stick pack for portion-controlled packaging.",
    use_case: "Sugar, salt, condiments, instant coffee, ORS, supplements",
    price_min: "0.80", price_max: "4.00", moq: 5000, moq_unit: "units",
    is_smartstock: true, is_eco: false, sample_tier: "standard", sample_price: 1999, delivery_days_india: 10, delivery_days_global: 28,
    specs: {
      code: "FP-105",
      variants: [
        { key: "format", label: "Format", options: ["Sachet (3-side seal)", "Stick Pack (4-side seal)"] },
        { key: "material", label: "Material", options: ["Plastic (BOPP/PE)", "Metalized Film", "Kraft Paper"] },
      ],
      customization_fields: [
        { key: "width", label: "Width (mm)", type: "number", unit: "mm" },
        { key: "length", label: "Length (mm)", type: "number", unit: "mm" },
        { key: "fill_weight", label: "Fill Weight (g/ml)", type: "number", unit: "g" },
      ],
    },
  },

  // ── 2. BOTTLES & CONTAINERS ────────────────────────────────────────────────
  {
    name: "Plastic Bottle (PET/HDPE)", slug: "plastic-bottle", category: "bottles",
    description: "Versatile plastic bottle in PET or HDPE, suitable for food, beverage, personal care, and agrochemical use.",
    use_case: "Water, juices, shampoos, cooking oils, agrochemicals",
    price_min: "8.00", price_max: "45.00", moq: 500, moq_unit: "units",
    is_smartstock: true, is_eco: false, sample_tier: "standard", sample_price: 2999, delivery_days_india: 10, delivery_days_global: 28,
    specs: {
      code: "BC-201",
      variants: [
        { key: "material", label: "Material", options: ["PET (clear/colored)", "HDPE (opaque)"] },
        { key: "cap_type", label: "Cap / Closure", options: ["Screw Cap", "Pump", "Spray", "Flip-top"] },
        { key: "shape", label: "Shape", options: ["Round", "Square", "Oval"] },
      ],
      customization_fields: [
        { key: "volume_ml", label: "Volume (ml)", type: "select", options: ["50","100","200","250","500","1000","2000","Custom"] },
        { key: "color", label: "Bottle Color", type: "text" },
        { key: "label_type", label: "Label Type", type: "select", options: ["Sleeve Label","Pressure Sensitive","In-Mould","None"] },
      ],
    },
  },
  {
    name: "Glass Bottle", slug: "glass-bottle", category: "bottles",
    description: "Premium glass bottle for beverages, spirits, sauces, and premium liquids.",
    use_case: "Craft beer, wine, spirits, hot sauces, kombucha, essential oils",
    price_min: "22.00", price_max: "120.00", moq: 200, moq_unit: "units",
    is_smartstock: false, is_eco: true, sample_tier: "premium", sample_price: 4999, delivery_days_india: 18, delivery_days_global: 35,
    specs: {
      code: "BC-202",
      variants: [
        { key: "color", label: "Glass Color", options: ["Clear", "Amber", "Green", "Cobalt Blue"] },
        { key: "cap_type", label: "Closure", options: ["Crown Cap", "Cork", "Screw Cap", "ROPP Aluminum"] },
        { key: "shape", label: "Shape", options: ["Round", "Square", "Flask"] },
      ],
      customization_fields: [
        { key: "volume_ml", label: "Volume (ml)", type: "select", options: ["50","100","200","330","500","750","1000"] },
        { key: "embossing", label: "Embossing", type: "select", options: ["None","Logo only","Full label panel"] },
      ],
    },
  },
  {
    name: "Glass Jar", slug: "glass-jar", category: "bottles",
    description: "Wide-mouth glass jar for food, cosmetics, and specialty products. Airtight lid options available.",
    use_case: "Jams, honey, pickles, spreads, face creams, candles",
    price_min: "18.00", price_max: "90.00", moq: 200, moq_unit: "units",
    is_smartstock: false, is_eco: true, sample_tier: "premium", sample_price: 4999, delivery_days_india: 18, delivery_days_global: 35,
    specs: {
      code: "BC-203",
      variants: [
        { key: "color", label: "Glass Color", options: ["Clear", "Amber", "Frosted"] },
        { key: "lid_type", label: "Lid Type", options: ["Metal Twist-off", "Plastisol Lined", "Wooden Lid"] },
        { key: "shape", label: "Shape", options: ["Round", "Square", "Hexagonal"] },
      ],
      customization_fields: [
        { key: "volume_ml", label: "Volume (ml)", type: "select", options: ["50","100","200","300","500","1000"] },
      ],
    },
  },
  {
    name: "Cosmetic Jar", slug: "cosmetic-jar", category: "bottles",
    description: "Elegant cosmetic-grade jar in acrylic, PETG, or glass. Ideal for premium skincare brands.",
    use_case: "Face cream, body butter, hair mask, serums, beard balm",
    price_min: "12.00", price_max: "75.00", moq: 200, moq_unit: "units",
    is_smartstock: false, is_eco: false, sample_tier: "premium", sample_price: 4999, delivery_days_india: 14, delivery_days_global: 32,
    specs: {
      code: "BC-204",
      variants: [
        { key: "material", label: "Material", options: ["Acrylic", "PETG (Plastic)", "Glass"] },
        { key: "lid_type", label: "Lid Type", options: ["Standard", "Flat", "Inner Cap"] },
        { key: "finish", label: "Surface Finish", options: ["Glossy", "Matte", "Frosted", "Metallic"] },
      ],
      customization_fields: [
        { key: "volume_ml", label: "Volume (ml)", type: "select", options: ["15","30","50","100","150","200"] },
        { key: "color", label: "Jar Color", type: "text" },
      ],
    },
  },
  {
    name: "Dropper Bottle", slug: "dropper-bottle", category: "bottles",
    description: "Precision dropper bottle for serums, essential oils, CBD, and pharma liquids.",
    use_case: "Face serums, essential oils, CBD tinctures, eye drops, aromatherapy",
    price_min: "15.00", price_max: "60.00", moq: 200, moq_unit: "units",
    is_smartstock: false, is_eco: false, sample_tier: "standard", sample_price: 2999, delivery_days_india: 12, delivery_days_global: 30,
    specs: {
      code: "BC-205",
      variants: [
        { key: "material", label: "Material", options: ["Glass (Amber)", "Glass (Clear)", "PETG (Plastic)"] },
        { key: "dropper", label: "Dropper Type", options: ["Standard Rubber Bulb", "Child-Resistant", "Plastic Pipette"] },
      ],
      customization_fields: [
        { key: "volume_ml", label: "Volume (ml)", type: "select", options: ["5","10","15","30","50"] },
      ],
    },
  },
  {
    name: "Airless Pump Bottle", slug: "airless-pump-bottle", category: "bottles",
    description: "Vacuum-based airless pump bottle. Preferred by premium skincare brands for precision dosing.",
    use_case: "Serums, moisturizers, foundations, sunscreens, anti-aging creams",
    price_min: "28.00", price_max: "130.00", moq: 200, moq_unit: "units",
    is_smartstock: false, is_eco: false, sample_tier: "complex", sample_price: 7999, delivery_days_india: 18, delivery_days_global: 35,
    specs: {
      code: "BC-206",
      variants: [
        { key: "material", label: "Body Material", options: ["Plastic (ABS)", "Aluminum", "PCR Plastic (Recycled)"] },
        { key: "finish", label: "Finish", options: ["Glossy", "Matte", "Metallic Spray"] },
      ],
      customization_fields: [
        { key: "volume_ml", label: "Volume (ml)", type: "select", options: ["15","30","50","100","150"] },
        { key: "dose_ml", label: "Dose per Pump (ml)", type: "select", options: ["0.2","0.3","0.5","1.0"] },
        { key: "color", label: "Color", type: "text" },
      ],
    },
  },

  // ── 3. TUBES & SMALL PACKS ─────────────────────────────────────────────────
  {
    name: "Cosmetic Tube", slug: "cosmetic-tube", category: "tubes",
    description: "Flexible squeeze tube in HDPE, LDPE, or laminate with various closure options.",
    use_case: "Toothpaste, lotions, sunscreen, hair color, hand cream, pharma gels",
    price_min: "5.00", price_max: "22.00", moq: 1000, moq_unit: "units",
    is_smartstock: true, is_eco: false, sample_tier: "standard", sample_price: 2999, delivery_days_india: 12, delivery_days_global: 30,
    specs: {
      code: "TS-301",
      variants: [
        { key: "material", label: "Material", options: ["HDPE / LDPE (Plastic)", "Laminate (Multi-layer)", "ABL (Aluminum Barrier)"] },
        { key: "cap_type", label: "Cap / Nozzle", options: ["Flip-top Cap", "Disc-top Cap", "Nozzle (Pharma)", "Screw Cap"] },
        { key: "finish", label: "Print Finish", options: ["Matte", "Glossy", "Silk"] },
      ],
      customization_fields: [
        { key: "diameter", label: "Tube Diameter (mm)", type: "select", options: ["16","19","22","25","28","35","40"] },
        { key: "volume_ml", label: "Volume (ml)", type: "select", options: ["10","20","30","50","75","100","150","200"] },
        { key: "print_colors", label: "Print Colors", type: "select", options: ["1","2","4","6","8+"] },
      ],
    },
  },
  {
    name: "Blister Pack", slug: "blister-pack", category: "tubes",
    description: "Thermoformed PVC/PET blister with aluminum or card backing. Pharma-grade and retail-grade options.",
    use_case: "Tablets, capsules, batteries, small hardware, stationary",
    price_min: "1.50", price_max: "12.00", moq: 2000, moq_unit: "units",
    is_smartstock: false, is_eco: false, sample_tier: "complex", sample_price: 7999, delivery_days_india: 18, delivery_days_global: 35,
    specs: {
      code: "TS-302",
      variants: [
        { key: "blister_material", label: "Blister Material", options: ["PVC", "PET (Eco)", "PVDC (Barrier)"] },
        { key: "backing", label: "Backing", options: ["Aluminum Foil", "Card (Paper)", "PET Film"] },
      ],
      customization_fields: [
        { key: "cavities", label: "No. of Cavities", type: "select", options: ["4","6","8","10","12","16","Custom"] },
        { key: "cavity_size", label: "Cavity Diameter (mm)", type: "number", unit: "mm" },
      ],
    },
  },

  // ── 4. BOXES & CARTONS ─────────────────────────────────────────────────────
  {
    name: "Folding Carton (Mono Carton)", slug: "folding-carton", category: "boxes",
    description: "Straight-line or reverse tuck-end folding carton in SBS or duplex board.",
    use_case: "FMCG, pharma, personal care, food, electronics retail",
    price_min: "3.00", price_max: "18.00", moq: 500, moq_unit: "units",
    is_smartstock: true, is_eco: false, sample_tier: "standard", sample_price: 2999, delivery_days_india: 12, delivery_days_global: 30,
    specs: {
      code: "BX-401",
      variants: [
        { key: "tuck_style", label: "Box Style", options: ["Straight Tuck End (STE)", "Reverse Tuck End (RTE)", "Auto-Lock Bottom"] },
        { key: "board", label: "Board Type", options: ["SBS (White)", "Duplex Board", "Kraft Board"] },
        { key: "print", label: "Print", options: ["Plain", "Printed (1–4 colors)", "Printed (5+ colors)"] },
        { key: "finish", label: "Finish", options: ["Matte Lamination", "Glossy Lamination", "Soft-touch Lamination", "UV Spot"] },
      ],
      customization_fields: [
        { key: "length", label: "Length (mm)", type: "number", unit: "mm" },
        { key: "width", label: "Width (mm)", type: "number", unit: "mm" },
        { key: "height", label: "Height (mm)", type: "number", unit: "mm" },
        { key: "board_gsm", label: "Board GSM", type: "select", options: ["250","300","350","400"] },
      ],
    },
  },
  {
    name: "Rigid Box", slug: "rigid-box", category: "boxes",
    description: "Chipboard-based rigid set-up box wrapped in paper, fabric, or leatherette.",
    use_case: "Premium gifting, electronics, watches, luxury goods, corporate packs",
    price_min: "65.00", price_max: "350.00", moq: 100, moq_unit: "units",
    is_smartstock: false, is_eco: false, sample_tier: "premium", sample_price: 4999, delivery_days_india: 18, delivery_days_global: 35,
    specs: {
      code: "BX-402",
      variants: [
        { key: "box_type", label: "Box Type", options: ["Lid & Base (Shoebox)", "Neck & Shoulder", "Clamshell", "Book Style"] },
        { key: "wrap", label: "Outer Wrap", options: ["Art Paper", "Linen", "Leatherette", "Velvet"] },
        { key: "finish", label: "Print Finish", options: ["Matte", "Glossy", "Foil Stamp", "Embossed"] },
        { key: "interior", label: "Interior Lining", options: ["None", "Foam Insert", "Satin Ribbon", "Velvet Lining"] },
      ],
      customization_fields: [
        { key: "length", label: "Length (mm)", type: "number", unit: "mm" },
        { key: "width", label: "Width (mm)", type: "number", unit: "mm" },
        { key: "height", label: "Height (mm)", type: "number", unit: "mm" },
      ],
    },
  },
  {
    name: "Magnetic Closure Box", slug: "magnetic-closure-box", category: "boxes",
    description: "Premium collapsible magnetic-closure box. Flat-pack design reduces shipping costs.",
    use_case: "D2C gifting, subscription boxes, luxury retail, electronics unboxing",
    price_min: "80.00", price_max: "400.00", moq: 100, moq_unit: "units",
    is_smartstock: false, is_eco: false, sample_tier: "premium", sample_price: 4999, delivery_days_india: 18, delivery_days_global: 35,
    specs: {
      code: "BX-403",
      variants: [
        { key: "finish", label: "Outer Finish", options: ["Matte Lamination", "Glossy Lamination", "Soft-touch Velvet"] },
        { key: "print", label: "Print Treatment", options: ["Plain (Single Color)", "Full Color", "Foil Stamp", "UV Spot + Foil"] },
        { key: "insert", label: "Interior Insert", options: ["None", "Foam Insert", "Corrugated Insert", "Satin Ribbon"] },
      ],
      customization_fields: [
        { key: "length", label: "Length (mm)", type: "number", unit: "mm" },
        { key: "width", label: "Width (mm)", type: "number", unit: "mm" },
        { key: "height", label: "Height (mm)", type: "number", unit: "mm" },
      ],
    },
  },

  // ── 5. E-COMMERCE PACKAGING ────────────────────────────────────────────────
  {
    name: "Mailer Box", slug: "mailer-box", category: "ecommerce",
    description: "Self-locking tuck-top mailer box in corrugated or rigid board. Premium unboxing experience.",
    use_case: "D2C shipping, subscription boxes, fashion, food kits, cosmetics",
    price_min: "18.00", price_max: "75.00", moq: 200, moq_unit: "units",
    is_smartstock: true, is_eco: false, sample_tier: "standard", sample_price: 2999, delivery_days_india: 10, delivery_days_global: 28,
    specs: {
      code: "EC-501",
      variants: [
        { key: "board", label: "Board Type", options: ["Corrugated (3-ply)", "Corrugated (5-ply)", "Rigid Grey Board"] },
        { key: "print", label: "Print", options: ["Plain (Kraft)", "Single Color", "Full Color (inside+out)"] },
        { key: "finish", label: "Finish", options: ["Uncoated (Kraft)", "Matte Lamination", "Glossy Lamination", "Soft-touch"] },
      ],
      customization_fields: [
        { key: "length", label: "Length (mm)", type: "number", unit: "mm" },
        { key: "width", label: "Width (mm)", type: "number", unit: "mm" },
        { key: "height", label: "Height (mm)", type: "number", unit: "mm" },
      ],
    },
  },
  {
    name: "Corrugated Box (Shipping)", slug: "corrugated-shipping-box", category: "ecommerce",
    description: "Standard RSC or die-cut corrugated shipping box. Available in 3-ply and 5-ply.",
    use_case: "General e-commerce shipping, FMCG bulk dispatch, B2B warehouse",
    price_min: "8.00", price_max: "35.00", moq: 500, moq_unit: "units",
    is_smartstock: true, is_eco: false, sample_tier: "standard", sample_price: 2999, delivery_days_india: 10, delivery_days_global: 28,
    specs: {
      code: "EC-502",
      variants: [
        { key: "ply", label: "Board Strength", options: ["3-ply (Standard)", "5-ply (Heavy Duty)", "7-ply (Industrial)"] },
        { key: "style", label: "Box Style", options: ["RSC (Regular Slotted)", "Die-cut", "Self-locking (No tape)"] },
        { key: "print", label: "Print", options: ["Plain (Kraft)", "Single Color", "Two Color"] },
      ],
      customization_fields: [
        { key: "length", label: "Length (mm)", type: "number", unit: "mm" },
        { key: "width", label: "Width (mm)", type: "number", unit: "mm" },
        { key: "height", label: "Height (mm)", type: "number", unit: "mm" },
        { key: "ect", label: "Edge Crush Test (ECT)", type: "select", options: ["23 ECT","32 ECT","44 ECT","Custom"] },
      ],
    },
  },
  {
    name: "Food Delivery Box", slug: "food-delivery-box", category: "ecommerce",
    description: "Thermal or standard corrugated box for food delivery. Grease-resistant and FSSAI-compliant.",
    use_case: "Cloud kitchens, QSR, tiffin services, meal kit delivery, bakeries",
    price_min: "10.00", price_max: "40.00", moq: 200, moq_unit: "units",
    is_smartstock: true, is_eco: false, sample_tier: "standard", sample_price: 2999, delivery_days_india: 10, delivery_days_global: 28,
    specs: {
      code: "EC-503",
      variants: [
        { key: "type", label: "Box Type", options: ["Standard (Non-thermal)", "Thermal Insulated", "Tamper-evident"] },
        { key: "material", label: "Board", options: ["Corrugated (3-ply)", "Kraft Board", "Duplex with PE coating"] },
      ],
      customization_fields: [
        { key: "size", label: "Size", type: "select", options: ["Small (15×15×8)","Medium (25×25×10)","Large (35×35×12)","Custom"] },
        { key: "grease_coat", label: "Grease-resistant Coating", type: "select", options: ["Yes","No"] },
      ],
    },
  },
  {
    name: "Courier Bag", slug: "courier-bag", category: "ecommerce",
    description: "Lightweight tamper-evident courier bag in poly or kraft paper with self-seal adhesive strip.",
    use_case: "E-commerce courier shipping, clothing, documents, books",
    price_min: "2.50", price_max: "10.00", moq: 1000, moq_unit: "units",
    is_smartstock: true, is_eco: false, sample_tier: "standard", sample_price: 1999, delivery_days_india: 8, delivery_days_global: 26,
    specs: {
      code: "EC-504",
      variants: [
        { key: "material", label: "Material", options: ["Poly (LDPE)", "Kraft Paper", "Co-extruded (Strong)"] },
        { key: "print", label: "Print", options: ["Blank / Unprinted", "Single Color (Logo)", "Full Color"] },
      ],
      customization_fields: [
        { key: "size", label: "Bag Size", type: "select", options: ["XS (18×22 cm)","S (25×30 cm)","M (30×40 cm)","L (40×50 cm)","XL (50×60 cm)","Custom"] },
      ],
    },
  },

  // ── 6. PROTECTIVE PACKAGING ────────────────────────────────────────────────
  {
    name: "Bubble Wrap / Air Pillows", slug: "bubble-wrap-air-pillows", category: "protective",
    description: "Classic bubble wrap rolls or inflated air pillow packs for void-fill and product cushioning.",
    use_case: "Fragile goods, electronics, ceramics, glassware, e-commerce void fill",
    price_min: "1200", price_max: "5000", moq: 1, moq_unit: "rolls",
    is_smartstock: true, is_eco: false, sample_tier: "standard", sample_price: 1999, delivery_days_india: 7, delivery_days_global: 25,
    specs: {
      code: "PR-601",
      variants: [
        { key: "type", label: "Type", options: ["Bubble Wrap Roll", "Air Pillows (pre-inflated)", "Bubble Bags"] },
        { key: "bubble_size", label: "Bubble Size", options: ["Small (10mm)", "Medium (20mm)", "Large (25mm)"] },
      ],
      customization_fields: [
        { key: "roll_width", label: "Roll Width (m)", type: "select", options: ["0.5","1.0","1.2","1.5"] },
        { key: "roll_length", label: "Roll Length (m)", type: "select", options: ["50","100","200","500"] },
      ],
    },
  },
  {
    name: "Foam / Thermocol Inserts", slug: "foam-thermocol-inserts", category: "protective",
    description: "Custom die-cut EPE foam or EPS thermocol inserts shaped to product contours for maximum protection.",
    use_case: "Electronics, fragile items, medical devices, instruments, toolkits",
    price_min: "15.00", price_max: "180.00", moq: 100, moq_unit: "units",
    is_smartstock: false, is_eco: false, sample_tier: "complex", sample_price: 7999, delivery_days_india: 14, delivery_days_global: 32,
    specs: {
      code: "PR-602",
      variants: [
        { key: "material", label: "Insert Material", options: ["EPE Foam", "EPS Thermocol", "Polyurethane Foam", "Moulded Pulp (Eco)"] },
        { key: "type", label: "Insert Type", options: ["Die-cut Flat", "Profile / Contoured", "Cradle Insert", "Full Shell"] },
      ],
      customization_fields: [
        { key: "length", label: "Length (mm)", type: "number", unit: "mm" },
        { key: "width", label: "Width (mm)", type: "number", unit: "mm" },
        { key: "thickness", label: "Foam Thickness (mm)", type: "select", options: ["10","15","20","25","30","40","50"] },
      ],
    },
  },

  // ── 7. PACKAGING ROLLS ─────────────────────────────────────────────────────
  {
    name: "Printed Packaging Roll", slug: "printed-packaging-roll", category: "rolls",
    description: "Custom-printed flexible packaging roll for form-fill-seal (FFS) machines. BOPP/PE and BOPP/CPP structures.",
    use_case: "Snacks, wafers, namkeen, biscuits, instant noodles, dry fruits",
    price_min: "180", price_max: "450", moq: 100, moq_unit: "kg",
    is_smartstock: false, is_eco: false, sample_tier: "complex", sample_price: 7999, delivery_days_india: 21, delivery_days_global: 42,
    specs: {
      code: "RL-701",
      variants: [
        { key: "structure", label: "Laminate Structure", options: ["BOPP / PE", "BOPP / CPP", "PET / PE", "MET PET / PE"] },
        { key: "barrier", label: "Barrier Level", options: ["Low (standard)", "Medium (moisture)", "High (oxygen + moisture)"] },
        { key: "print_type", label: "Print Type", options: ["Rotogravure", "Digital", "Flexo"] },
        { key: "finish", label: "Finish", options: ["Matte", "Glossy", "Pearlized"] },
      ],
      customization_fields: [
        { key: "roll_width", label: "Roll Width (mm)", type: "number", unit: "mm" },
        { key: "roll_length", label: "Roll Length (m)", type: "select", options: ["1000","2000","3000","5000"] },
        { key: "colors", label: "No. of Print Colors", type: "select", options: ["1","2","4","6","8+"] },
      ],
    },
  },
  {
    name: "Laminated Barrier Roll", slug: "laminated-barrier-roll", category: "rolls",
    description: "High-barrier laminated roll for products requiring extended shelf-life. Aluminum and metallized structures.",
    use_case: "Coffee, dairy products, ready meals, pharmaceutical sachets, frozen foods",
    price_min: "240", price_max: "600", moq: 100, moq_unit: "kg",
    is_smartstock: false, is_eco: false, sample_tier: "complex", sample_price: 7999, delivery_days_india: 21, delivery_days_global: 42,
    specs: {
      code: "RL-702",
      variants: [
        { key: "structure", label: "Laminate Structure", options: ["PET / AL / PE (High Barrier)", "BOPP / PVDC / PE", "MET PET / CPP"] },
        { key: "barrier", label: "Barrier Level", options: ["Medium", "High", "Ultra-high"] },
        { key: "finish", label: "Finish", options: ["Matte", "Glossy", "Metallic"] },
      ],
      customization_fields: [
        { key: "roll_width", label: "Roll Width (mm)", type: "number", unit: "mm" },
        { key: "roll_length", label: "Roll Length (m)", type: "select", options: ["1000","2000","3000"] },
        { key: "oxygen_tr", label: "Oxygen TR (cc/m²/day)", type: "text" },
      ],
    },
  },
  {
    name: "Eco-friendly Packaging Roll", slug: "eco-friendly-packaging-roll", category: "rolls",
    description: "Recyclable mono-material or compostable flexible roll to replace traditional multi-layer laminates.",
    use_case: "Organic food brands, eco-conscious FMCG, sustainable private labels",
    price_min: "220", price_max: "550", moq: 100, moq_unit: "kg",
    is_smartstock: false, is_eco: true, sample_tier: "complex", sample_price: 7999, delivery_days_india: 21, delivery_days_global: 42,
    specs: {
      code: "RL-703",
      variants: [
        { key: "material", label: "Material", options: ["Mono BOPP (Recyclable)", "PLA / PBAT (Compostable)", "Paper / PE", "PCR-PE (Recycled)"] },
        { key: "finish", label: "Finish", options: ["Matte", "Glossy", "Natural Kraft"] },
      ],
      customization_fields: [
        { key: "roll_width", label: "Roll Width (mm)", type: "number", unit: "mm" },
        { key: "roll_length", label: "Roll Length (m)", type: "select", options: ["1000","2000","3000"] },
        { key: "certification", label: "Certification Required", type: "select", options: ["None","BPI (Compostable)","TÜV OK Biobased","RecyClass"] },
      ],
    },
  },

  // ── 8. LABELS & CLOSURES ───────────────────────────────────────────────────
  {
    name: "Labels (All Types)", slug: "labels", category: "labels",
    description: "Pressure-sensitive, shrink sleeve, in-mould, and wet-glue labels. All substrates and finishes.",
    use_case: "Bottles, jars, tubes, cartons, flexible packs, FMCG, pharma",
    price_min: "0.50", price_max: "8.00", moq: 1000, moq_unit: "units",
    is_smartstock: true, is_eco: false, sample_tier: "standard", sample_price: 1999, delivery_days_india: 10, delivery_days_global: 28,
    specs: {
      code: "LC-801",
      variants: [
        { key: "label_type", label: "Label Type", options: ["Pressure Sensitive (PSL)", "Shrink Sleeve", "In-Mould Label", "Wet-Glue"] },
        { key: "material", label: "Material", options: ["BOPP", "Paper", "PET", "PE"] },
        { key: "finish", label: "Finish", options: ["Matte", "Glossy", "Transparent"] },
      ],
      customization_fields: [
        { key: "width", label: "Width (mm)", type: "number", unit: "mm" },
        { key: "height", label: "Height (mm)", type: "number", unit: "mm" },
        { key: "print_colors", label: "Print Colors", type: "select", options: ["1","2","4","6","8+"] },
      ],
    },
  },
  {
    name: "Caps & Pumps", slug: "caps-and-pumps", category: "labels",
    description: "Full range of closures: screw caps, pumps, sprayers, and flip-tops compatible with standard neck sizes.",
    use_case: "Bottles (PET/glass), tubes, jars, dispensers",
    price_min: "2.00", price_max: "35.00", moq: 500, moq_unit: "units",
    is_smartstock: true, is_eco: false, sample_tier: "standard", sample_price: 1999, delivery_days_india: 8, delivery_days_global: 26,
    specs: {
      code: "LC-802",
      variants: [
        { key: "type", label: "Closure Type", options: ["Screw Cap", "Lotion Pump", "Spray Pump", "Trigger Sprayer", "Disc-top Cap", "Flip-top Cap"] },
        { key: "material", label: "Material", options: ["Plastic (PP/PE)", "Aluminum", "PCR Plastic"] },
      ],
      customization_fields: [
        { key: "neck_mm", label: "Neck Size (mm)", type: "select", options: ["18/410","20/410","24/410","28/410","28/415","Custom"] },
        { key: "color", label: "Color", type: "text" },
      ],
    },
  },
  {
    name: "Zipper / Spout Fitments", slug: "zipper-spout-fitments", category: "labels",
    description: "Zipper press-to-close strips and injection-moulded spout fitments for flexible packaging.",
    use_case: "Stand-up pouches, spouted pouches, reclosable bags",
    price_min: "0.80", price_max: "6.00", moq: 2000, moq_unit: "units",
    is_smartstock: false, is_eco: false, sample_tier: "standard", sample_price: 1999, delivery_days_india: 12, delivery_days_global: 30,
    specs: {
      code: "LC-803",
      variants: [
        { key: "type", label: "Fitment Type", options: ["Zipper Strip (press-to-close)", "Spout + Cap (18mm)", "Spout + Sports Cap", "Child-resistant Spout"] },
      ],
      customization_fields: [
        { key: "color", label: "Color", type: "text" },
      ],
    },
  },

  // ── 9. SUSTAINABLE PACKAGING ───────────────────────────────────────────────
  {
    name: "Kraft / Paper Packaging", slug: "kraft-paper-packaging", category: "sustainable",
    description: "Unbleached kraft paper packaging: bags, wraps, and boxes. FSC-certified and recyclable.",
    use_case: "Bakeries, organic food, retail, gifting, stationery, e-commerce",
    price_min: "3.00", price_max: "22.00", moq: 500, moq_unit: "units",
    is_smartstock: true, is_eco: true, sample_tier: "standard", sample_price: 2999, delivery_days_india: 10, delivery_days_global: 28,
    specs: {
      code: "SP-901",
      variants: [
        { key: "format", label: "Format", options: ["Kraft Paper Bag", "Kraft Box", "Kraft Wrap Roll"] },
        { key: "handle", label: "Handle (for bags)", options: ["None", "Twisted Paper Handle", "Flat Paper Handle", "Cotton Handle"] },
      ],
      customization_fields: [
        { key: "gsm", label: "Paper GSM", type: "select", options: ["70","90","100","120","150","Custom"] },
        { key: "print_colors", label: "Print Colors", type: "select", options: ["None","1","2","4"] },
      ],
    },
  },
  {
    name: "Compostable Packaging", slug: "compostable-packaging", category: "sustainable",
    description: "Home or industrial compostable bags, pouches, and films certified to EN 13432 / ASTM D6400.",
    use_case: "Organic food, zero-waste brands, farmer's markets, specialty retail",
    price_min: "8.00", price_max: "45.00", moq: 500, moq_unit: "units",
    is_smartstock: false, is_eco: true, sample_tier: "premium", sample_price: 4999, delivery_days_india: 14, delivery_days_global: 32,
    specs: {
      code: "SP-902",
      variants: [
        { key: "material", label: "Base Material", options: ["PLA / PBAT blend", "Cellulose Film", "Starch-based Film"] },
        { key: "format", label: "Format", options: ["Flat Bag", "Stand-up Pouch", "Film Roll"] },
      ],
      customization_fields: [
        { key: "certification", label: "Certification", type: "select", options: ["BPI (USA)","TÜV OK Compost (EU)","CPCB (India)"] },
        { key: "print_colors", label: "Print Colors", type: "select", options: ["None","1","2","4"] },
      ],
    },
  },
  {
    name: "Recycled Packaging", slug: "recycled-packaging", category: "sustainable",
    description: "PCR (post-consumer recycled) plastic packaging with documented chain of custody.",
    use_case: "FMCG brands with sustainability commitments, export packaging with EU compliance",
    price_min: "6.00", price_max: "38.00", moq: 500, moq_unit: "units",
    is_smartstock: false, is_eco: true, sample_tier: "premium", sample_price: 4999, delivery_days_india: 14, delivery_days_global: 32,
    specs: {
      code: "SP-903",
      variants: [
        { key: "material", label: "Recycled Material", options: ["PCR-PE", "PCR-PET", "rHDPE (Recycled HDPE)"] },
        { key: "format", label: "Format", options: ["Bag / Pouch", "Bottle", "Film / Roll"] },
      ],
      customization_fields: [
        { key: "pcr_percent", label: "% PCR Content", type: "select", options: ["25%","50%","75%","100%"] },
      ],
    },
  },
  {
    name: "Bagasse / Pulp Packaging", slug: "bagasse-pulp-packaging", category: "sustainable",
    description: "Moulded sugarcane bagasse or recycled pulp trays, bowls, containers, and inserts. Microwave-safe.",
    use_case: "Food service (QSR, cloud kitchens), moulded inserts, eco trays for retail",
    price_min: "4.00", price_max: "30.00", moq: 200, moq_unit: "units",
    is_smartstock: true, is_eco: true, sample_tier: "standard", sample_price: 2999, delivery_days_india: 10, delivery_days_global: 28,
    specs: {
      code: "SP-904",
      variants: [
        { key: "material", label: "Pulp Source", options: ["Sugarcane Bagasse", "Wheat Straw Pulp", "Recycled Newspaper Pulp"] },
        { key: "format", label: "Format", options: ["Plate / Tray", "Bowl", "Clamshell Container", "Moulded Insert"] },
      ],
      customization_fields: [
        { key: "size", label: "Size (approx)", type: "select", options: ["6 inch","8 inch","10 inch","12 inch","Custom"] },
        { key: "coating", label: "Coating", type: "select", options: ["None","PLA-coated (grease-resistant)","Wax-coated"] },
      ],
    },
  },

  // ── 10. LIQUID CARTONS ─────────────────────────────────────────────────────
  {
    name: "Aseptic Carton (Tetra Pak Type)", slug: "aseptic-carton", category: "liquid",
    description: "Multi-layer aseptic liquid carton for shelf-stable dairy, juice, and liquid food. UHT processing compatible.",
    use_case: "Dairy (milk, lassi), juices, soups, plant-based milks, coconut water",
    price_min: "12.00", price_max: "60.00", moq: 5000, moq_unit: "units",
    is_smartstock: false, is_eco: false, sample_tier: "complex", sample_price: 7999, delivery_days_india: 28, delivery_days_global: 45,
    specs: {
      code: "LC-1001",
      variants: [
        { key: "shape", label: "Carton Shape", options: ["Brick / Prisma (standard)", "Square (Cube)", "Slimline"] },
        { key: "opening", label: "Opening Type", options: ["Straw Hole", "Screw Cap", "Pull-tab"] },
      ],
      customization_fields: [
        { key: "volume_ml", label: "Volume (ml)", type: "select", options: ["65","125","200","250","500","1000"] },
        { key: "layers", label: "Barrier Layers", type: "select", options: ["6-layer (standard)","7-layer (ultra-barrier)"] },
        { key: "print_colors", label: "Print Colors", type: "select", options: ["4","6","8+"] },
      ],
    },
  },
];

async function seed() {
  console.log("🌱 Seeding 33 SKUs across 10 categories...");

  // Clear existing products
  await db.execute(sql`DELETE FROM products`);
  console.log("✓ Cleared existing products");

  // Insert new SKUs
  for (const sku of SKUS) {
    await db.insert(productsTable).values({
      name: sku.name,
      slug: sku.slug,
      category: sku.category,
      description: sku.description,
      use_case: sku.use_case,
      price_min: sku.price_min,
      price_max: sku.price_max,
      moq: sku.moq,
      moq_unit: sku.moq_unit,
      is_smartstock: sku.is_smartstock,
      is_eco: sku.is_eco,
      sample_tier: sku.sample_tier,
      sample_price: sku.sample_price,
      delivery_days_india: sku.delivery_days_india,
      delivery_days_global: sku.delivery_days_global,
      specs: sku.specs,
      is_active: true,
    });
  }

  console.log(`✓ Inserted ${SKUS.length} SKUs`);
  await pool.end();
  console.log("✅ Done!");
}

seed().catch(err => { console.error(err); process.exit(1); });
