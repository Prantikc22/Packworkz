// Print-start specifications: the options and measurements a converter needs
// before plates, tooling or a production slot can be booked. Applied on top of
// the source catalogue and storefront overrides, so each product here asks for
// what its own process requires instead of the generic print/finish + W×H×D set.
//
// Keep variant keys "lid" and "branding" on SP-9xx: commerce pricing reads them.
import type { CustomField, Sku, VariantGroup } from "./skus";

const mm = (key: string, label: string, placeholder?: string): CustomField => ({ key, label, type: "number", unit: "mm", placeholder });
const num = (key: string, label: string, unit: string, placeholder?: string): CustomField => ({ key, label, type: "number", unit, placeholder });
const pick = (key: string, label: string, options: string[], unit?: string): CustomField => ({ key, label, type: "select", options, unit });
const text = (key: string, label: string, placeholder?: string): CustomField => ({ key, label, type: "text", placeholder });
const v = (key: string, label: string, options: string[]): VariantGroup => ({ key, label, options });

const PRINT_COLOURS = pick("print_colors", "Print colours", ["1", "2", "3", "4 (CMYK)", "CMYK + spot", "6+"]);
const CORE = pick("core_id", "Core inner diameter", ["76 mm (3 in)", "152 mm (6 in)", "Confirm with machine"]);
const LABEL_CORE = pick("core_id", "Core inner diameter", ["25 mm", "40 mm", "76 mm (3 in)"]);
const UNWIND = pick("unwind", "Unwind direction", ["Print out, head first", "Print out, foot first", "Print in, head first", "Print in, foot first", "Confirm with machine drawing"]);
const LABEL_UNWIND = pick("unwind", "Unwind position", ["1 · top off first", "2 · bottom off first", "3 · right off first", "4 · left off first", "5–8 · wound in", "Confirm with applicator"]);

// Boxes are specified by internal dimensions, length × width × height.
const BOX_FIELDS: CustomField[] = [
  mm("length", "Length (internal)", "e.g. 120"),
  mm("width", "Width (internal)", "e.g. 80"),
  mm("height", "Height (internal)", "e.g. 40"),
];
const FLAT_FIELDS: CustomField[] = [mm("width", "Width", "e.g. 100"), mm("height", "Height", "e.g. 150")];
const POUCH_FIELDS: CustomField[] = [mm("width", "Width", "e.g. 140"), mm("height", "Height", "e.g. 220"), mm("depth", "Bottom gusset", "e.g. 80")];
const PRINT_LEVELS = v("print", "Print", ["Plain", "1-colour print", "2-colour print", "Full-colour print"]);

export const PRINT_SPEC_OVERRIDES: Record<string, Partial<Pick<Sku, "variants" | "customization_fields">>> = {
  // ── Flexible ────────────────────────────────────────────────────────────
  "FP-102": {
    variants: [
      v("material", "Material", ["BOPP/CPP", "BOPP/MetBOPP/CPP", "PET/PE"]),
      v("finish", "Finish", ["Matte", "Gloss"]),
      v("accessory", "Accessory", ["None", "Tear notch", "Euro slot"]),
      v("supply", "Supplied as", ["Pre-made pouches", "Printed roll for FFS machine"]),
    ],
    customization_fields: [mm("width", "Width", "e.g. 120"), mm("length", "Cut length", "e.g. 180"), num("fill_weight", "Fill weight", "g", "e.g. 50"), PRINT_COLOURS],
  },
  "FP-104": {
    customization_fields: [...FLAT_FIELDS, num("volume_ml", "Fill volume", "ml", "e.g. 500"), pick("spout_size", "Spout bore", ["8.6 mm", "10 mm", "16 mm", "22 mm"])],
  },
  "FP-105": {
    variants: [
      v("format", "Format", ["Sachet (3-side seal)", "Stick Pack (4-side seal)"]),
      v("material", "Material", ["Plastic (BOPP/PE)", "Metalized Film", "Kraft Paper"]),
      v("supply", "Supplied as", ["Printed roll for FFS machine", "Pre-made sachets"]),
    ],
    customization_fields: [mm("width", "Width", "e.g. 60"), mm("length", "Length", "e.g. 90"), num("fill_weight", "Fill weight", "g", "e.g. 10"), PRINT_COLOURS],
  },
  "FP-106": {
    variants: [
      v("closure", "Closure", ["Heat seal only", "Resealable zipper"]),
      v("material", "Material", ["PET/PE", "MetPET/PE", "Kraft laminate", "Mono-material PE"]),
      v("finish", "Finish", ["Matte", "Gloss", "Soft touch"]),
      v("tear_notch", "Tear notch", ["Tear notch", "No tear notch"]),
      v("hang", "Hang", ["None", "Round hang hole", "Euro slot"]),
      v("window", "Window", ["No window", "Clear window"]),
    ],
    customization_fields: [...FLAT_FIELDS, num("fill_weight", "Fill weight", "g", "e.g. 50")],
  },
  "FP-107": { customization_fields: [mm("width", "Front width", "e.g. 110"), mm("height", "Height", "e.g. 260"), mm("depth", "Side gusset", "e.g. 60"), num("fill_weight", "Fill weight", "g", "e.g. 250")] },
  "FP-108": { customization_fields: [mm("width", "Front width", "e.g. 120"), mm("height", "Height", "e.g. 300"), mm("depth", "Side gusset", "e.g. 80"), num("fill_weight", "Fill weight", "g", "e.g. 500")] },
  "FP-109": { customization_fields: [...POUCH_FIELDS, num("fill_weight", "Fill weight", "g", "e.g. 250")] },
  "FP-110": {
    variants: [
      v("structure", "Structure", ["PET/Al foil/CPP (opaque)", "PET/Nylon/CPP (transparent)"]),
      v("format", "Format", ["Flat 3-side seal", "Stand-up"]),
      v("process", "Sterilisation", ["Retort 121 °C", "Retort 135 °C", "Pasteurisation below 100 °C"]),
      v("accessory", "Opening", ["Tear notch", "Tear notch + easy-tear line"]),
    ],
    customization_fields: [...POUCH_FIELDS, num("fill_weight", "Fill weight", "g", "e.g. 300"), PRINT_COLOURS],
  },
  "FP-112": {
    variants: [
      v("structure", "Structure", ["BOPP/CPP", "BOPP/MetBOPP", "PET/MetPET/PE", "Paper/PE"]),
      v("seal", "Sealing", ["Heat seal", "Cold seal"]),
      v("finish", "Finish", ["Gloss", "Matte"]),
    ],
    customization_fields: [mm("web_width", "Web width", "e.g. 280"), mm("repeat", "Repeat (cut-off) length", "e.g. 160"), CORE, mm("roll_od", "Max roll diameter", "e.g. 350"), UNWIND, PRINT_COLOURS],
  },
  "FP-114": {
    variants: [
      v("material", "Material", ["PET/PE", "MetPET/PE", "Mono-material PE"]),
      v("closure", "Closure", ["Open top", "Resealable zipper", "Spout"]),
      v("finish", "Finish", ["Gloss", "Matte", "Soft touch"]),
    ],
    customization_fields: [mm("width", "Max width", "e.g. 130"), mm("height", "Max height", "e.g. 200"), mm("depth", "Bottom gusset", "e.g. 60"), num("volume_ml", "Fill volume", "ml", "e.g. 200"), PRINT_COLOURS],
  },
  "FP-115": { customization_fields: FLAT_FIELDS },

  // ── Bottles, tins & tubes ───────────────────────────────────────────────
  "BC-201": { customization_fields: [pick("volume_ml", "Capacity", ["50", "100", "200", "250", "500", "1000", "2000", "Custom"], "ml"), text("color", "Bottle / cap colour", "e.g. White bottle, black cap"), pick("label_type", "Decoration", ["Sleeve Label", "Pressure Sensitive", "In-Mould", "None"])] },
  "BC-202": { customization_fields: [pick("volume_ml", "Capacity", ["50", "100", "200", "330", "500", "750", "1000"], "ml"), pick("neck", "Neck finish", ["Standard for closure", "28 mm ROPP", "38 mm lug", "Confirm with filling line"]), pick("embossing", "Embossing", ["None", "Logo only", "Full label panel"])] },
  "BC-204": { customization_fields: [pick("volume_ml", "Capacity", ["15", "30", "50", "100", "150", "200"], "ml"), text("color", "Jar / lid colour", "e.g. Frosted jar, gold lid")] },
  "BC-205": { customization_fields: [pick("volume_ml", "Capacity", ["5", "10", "15", "30", "50"], "ml"), pick("decoration", "Decoration", ["Applied label", "Screen print", "Plain"])] },
  "BC-206": { customization_fields: [pick("volume_ml", "Capacity", ["15", "30", "50", "100", "150"], "ml"), pick("dose_ml", "Dose per pump", ["0.2", "0.3", "0.5", "1.0"], "ml"), text("color", "Bottle colour", "e.g. Matte white")] },
  "BC-209": {
    variants: [
      v("shape", "Shape", ["Round", "Rectangular", "Square"]),
      v("closure", "Lid", ["Slip lid", "Screw lid", "Window lid", "Hinged lid"]),
      v("material", "Material", ["Tinplate", "Aluminium"]),
      v("decoration", "Decoration", ["Applied label", "Printed (offset on metal)", "Plain"]),
    ],
    customization_fields: [mm("diameter", "Diameter / width", "e.g. 70"), mm("height", "Height", "e.g. 40"), num("fill_weight", "Fill weight", "g", "e.g. 100")],
  },
  "BC-213": {
    variants: [
      v("glass", "Glass", ["Clear", "Frosted", "Amber", "Coloured"]),
      v("closure", "Closure", ["Crimp pump + cap", "Screw pump + cap", "Roll-on ball", "Dropper"]),
      v("decoration", "Decoration", ["Applied label", "Screen print", "Hot foil", "Plain"]),
    ],
    customization_fields: [num("volume_ml", "Capacity", "ml", "e.g. 30"), text("cap_finish", "Cap finish", "e.g. Gold metallic")],
  },
  "BC-214": {
    variants: [
      v("material", "Material", ["HDPE", "PET"]),
      v("closure", "Closure", ["Flip-top cap", "Disc-top cap", "Lotion pump"]),
      v("finish", "Bottle colour", ["Opaque white", "Natural", "Amber", "Custom colour"]),
      v("branding", "Branding", ["Pressure-sensitive label", "Screen print", "Full-sleeve artwork"]),
    ],
    customization_fields: [num("volume_ml", "Capacity", "ml", "e.g. 300"), text("color", "Custom colour (Pantone)", "e.g. Pantone 7527 C")],
  },
  "TS-301": { customization_fields: [pick("diameter", "Tube diameter", ["16", "19", "22", "25", "28", "35", "40"], "mm"), pick("volume_ml", "Capacity", ["10", "20", "30", "50", "75", "100", "150", "200"], "ml"), PRINT_COLOURS] },
  "TS-306": { customization_fields: [pick("diameter", "Tube diameter", ["30", "35", "40", "45"], "mm"), num("volume_ml", "Capacity", "ml", "e.g. 100"), PRINT_COLOURS] },
  "TS-304": {
    variants: [
      v("closure", "Ends", ["Paper end caps", "Metal lid", "Paper lid with window", "Shoulder neck"]),
      v("paper", "Outer paper", ["Natural kraft", "White kraft", "Coloured paper"]),
      v("print", "Branding", ["Applied label", "Full-colour wrap", "Full-colour wrap + foil"]),
    ],
    customization_fields: [mm("diameter", "Inner diameter", "e.g. 75"), mm("height", "Height", "e.g. 150")],
  },

  // ── Boxes ───────────────────────────────────────────────────────────────
  "BX-401": { customization_fields: [...BOX_FIELDS, pick("board_gsm", "Board weight", ["250", "300", "350", "400"], "gsm")] },
  "BX-402": { customization_fields: [...BOX_FIELDS, pick("board_thickness", "Grey board", ["1.5", "2", "2.5"], "mm")] },
  "BX-403": { customization_fields: [...BOX_FIELDS, pick("board_thickness", "Grey board", ["1.5", "2", "2.5"], "mm")] },
  "BX-405": { customization_fields: BOX_FIELDS },
  "BX-406": {
    variants: [
      v("structure", "Style", ["Straight tuck end", "Reverse tuck end", "Auto-lock bottom"]),
      v("board", "Board", ["White SBS", "Natural kraft", "Recycled board"]),
      PRINT_LEVELS,
      v("finish", "Finish", ["Uncoated", "Matte lamination", "Gloss lamination"]),
      v("window", "Window film", ["PET window", "Compostable PLA window", "Open cut-out (no film)"]),
    ],
    customization_fields: [...BOX_FIELDS, text("window_size", "Window size and position", "e.g. 60 x 40 mm, centred on front")],
  },
  "BX-407": {
    variants: [
      v("board", "Board", ["White SBS", "Natural kraft", "Recycled board"]),
      PRINT_LEVELS,
      v("finish", "Finish", ["Uncoated", "Matte lamination", "Gloss lamination"]),
    ],
    customization_fields: BOX_FIELDS,
  },
  "BX-408": {
    variants: [
      v("wrap", "Wrap paper", ["Matte art paper", "Textured paper", "Kraft paper"]),
      v("print", "Print", ["Plain wrap", "1-colour print", "Full-colour print"]),
      v("finish", "Finish", ["Matte lamination", "Soft touch", "Foil accent"]),
      v("insert", "Insert", ["None", "Paperboard", "EVA foam"]),
    ],
    customization_fields: [...BOX_FIELDS, pick("board_thickness", "Grey board", ["1.5", "2", "2.5"], "mm")],
  },
  "BX-413": { customization_fields: [mm("width", "Width", "e.g. 100"), mm("length", "Length", "e.g. 70"), mm("depth", "Depth at centre", "e.g. 30")] },
  "BX-414": {
    variants: [
      v("board", "Board", ["White SBS", "Natural kraft"]),
      v("print", "Print", ["Full-colour print", "1-colour print"]),
      v("hang", "Hang", ["Euro slot", "Round hang hole", "Middle hanging header"]),
      v("window", "Window", ["No window", "Clear front window"]),
      v("finish", "Finish", ["Uncoated", "Matte lamination", "Gloss lamination"]),
    ],
    customization_fields: BOX_FIELDS,
  },
  "BX-415": {
    variants: [
      v("capacity", "Capacity", ["12 packs", "24 packs", "36 packs"]),
      v("board", "Board", ["E-flute corrugated", "White SBS board"]),
      v("header", "Header", ["Printed header card", "No header"]),
      v("print", "Print", ["Full-colour litho-laminated", "2-colour flexo"]),
    ],
    customization_fields: [mm("length", "Single pack length", "e.g. 80"), mm("width", "Single pack width", "e.g. 30"), mm("height", "Single pack height", "e.g. 120")],
  },
  "BX-416": { customization_fields: BOX_FIELDS },

  // ── E-commerce ──────────────────────────────────────────────────────────
  "EC-501": { customization_fields: BOX_FIELDS },
  "EC-502": { customization_fields: BOX_FIELDS.concat(pick("ect", "Board strength", ["3-ply 120 GSM", "5-ply 150 GSM", "7-ply heavy duty", "Custom"])) },
  "EC-505": { customization_fields: FLAT_FIELDS },
  "EC-509": {
    variants: [
      v("material", "Film", ["Frosted CPE", "Clear LDPE", "Recycled-content PE"]),
      v("thickness", "Thickness", ["60 micron", "80 micron", "100 micron"]),
      v("print", "Print", ["Plain", "1-color print", "Full-color print"]),
    ],
    customization_fields: FLAT_FIELDS,
  },
  "EC-510": {
    variants: [
      v("paper", "Paper", ["Natural kraft", "White kraft", "Recycled kraft"]),
      v("gsm", "Paper weight", ["80 GSM", "100 GSM", "120 GSM", "150 GSM"]),
      v("handle", "Handle", ["Twisted paper", "Flat paper", "Cotton rope"]),
      v("branding", "Branding", ["1-colour print", "Full-colour print"]),
    ],
    customization_fields: [mm("width", "Width", "e.g. 250"), mm("height", "Height", "e.g. 300"), mm("depth", "Gusset", "e.g. 100")],
  },
  "EC-511": {
    variants: [
      v("fabric", "Fabric", ["Cotton (natural)", "Jute", "Canvas", "Juco (jute-cotton)"]),
      v("print", "Print", ["Plain", "1-colour screen print", "2-colour screen print", "Full-colour (DTF)"]),
      v("closure", "Closure", ["Drawstring", "Drawstring + toggle"]),
    ],
    customization_fields: [mm("width", "Width", "e.g. 150"), mm("height", "Height", "e.g. 200"), mm("depth", "Gusset (0 if flat)", "e.g. 0")],
  },
  "EC-514": {
    variants: [
      v("size", "Size", ["7 inch", "10 inch", "12 inch", "14 inch", "Custom size"]),
      v("board", "Board", ["Kraft corrugated", "White-top corrugated"]),
      v("print", "Print", ["1-colour lid", "2-colour lid", "Plain"]),
    ],
    customization_fields: [mm("length", "Custom inner size (square)", "Only for custom size"), mm("height", "Height", "e.g. 40")],
  },

  // ── Protective & rolls ──────────────────────────────────────────────────
  "PR-601": { customization_fields: [pick("roll_width", "Roll width", ["0.5", "1.0", "1.2", "1.5"], "m"), pick("roll_length", "Roll length", ["50", "100", "200", "500"], "m")] },
  "PR-602": { customization_fields: [mm("length", "Insert length", "e.g. 300"), mm("width", "Insert width", "e.g. 200"), pick("thickness", "Thickness", ["10", "15", "20", "25", "30", "40", "50"], "mm"), num("cavities", "Number of cavities", "", "e.g. 6"), text("product_size", "Product held (size per cavity)", "e.g. 50 ml bottle, 40 dia x 110 mm")] },
  "RL-701": { customization_fields: [mm("roll_width", "Web width", "e.g. 300"), mm("repeat", "Repeat (cut-off) length", "e.g. 200"), pick("roll_length", "Roll length", ["1000", "2000", "3000", "5000"], "m"), CORE, mm("roll_od", "Max roll diameter", "e.g. 400"), UNWIND, pick("colors", "Print colours", ["1", "2", "4", "6", "8+"])] },
  "RL-704": {
    variants: [
      v("structure", "Structure", ["PET/PE peelable", "PET/Al foil/peelable lacquer", "PET/CPP weld seal"]),
      v("seal", "Seal", ["Peelable", "Weld (permanent)"]),
      PRINT_LEVELS,
    ],
    customization_fields: [mm("web_width", "Web width", "e.g. 120"), pick("seal_substrate", "Container material", ["PP cup / tray", "PET tray", "PS cup", "Aluminium tray", "Other"]), mm("repeat", "Repeat / lid diameter", "e.g. 95"), CORE, mm("roll_od", "Max roll diameter", "e.g. 300"), UNWIND],
  },
  "RL-705": {
    variants: [
      v("material", "Film", ["PVC", "PETG", "POF", "PE (collation shrink)"]),
      v("format", "Format", ["Printed shrink sleeves", "Shrink film roll (wrap)"]),
      v("print", "Print", ["Plain", "1-colour print", "Full-colour gravure"]),
    ],
    customization_fields: [mm("layflat", "Layflat width", "e.g. 150"), mm("cut_length", "Cut length", "e.g. 120"), pick("thickness", "Thickness", ["40", "45", "50", "60"], "micron"), mm("container_diameter", "Container max diameter", "e.g. 90"), CORE],
  },

  // ── Labels ──────────────────────────────────────────────────────────────
  "LC-804": { customization_fields: FLAT_FIELDS },
  "LC-805": { customization_fields: FLAT_FIELDS },
  "LC-806": {
    variants: [
      v("material", "Film", ["PETG", "PVC", "OPS"]),
      v("print", "Print", ["Gravure up to 8 colours", "Digital (short run)"]),
      v("finish", "Finish", ["Gloss", "Matte", "Matte + gloss spot"]),
      v("supply", "Supplied as", ["Cut sleeves", "On roll for sleeving machine"]),
    ],
    customization_fields: [mm("container_height", "Container height", "e.g. 180"), mm("max_diameter", "Max diameter", "e.g. 65"), mm("min_diameter", "Neck / min diameter", "e.g. 28"), mm("sleeve_height", "Sleeve height", "e.g. 150"), pick("thickness", "Film thickness", ["40", "45", "50"], "micron")],
  },
  "LC-808": { customization_fields: FLAT_FIELDS },
  "LC-810": { customization_fields: FLAT_FIELDS },
  "LC-814": {
    variants: [
      v("material", "Material", ["Coated paper", "White BOPP", "Clear BOPP", "Thermal transfer paper"]),
      v("adhesive", "Adhesive", ["Permanent", "Removable", "Freezer grade"]),
      v("finish", "Finish", ["Unlaminated", "Matte lamination", "Gloss lamination"]),
      v("print", "Print", ["Plain", "1-colour print", "Full-colour print"]),
    ],
    customization_fields: [mm("width", "Label width (across web)", "e.g. 60"), mm("height", "Label height", "e.g. 90"), mm("gap", "Gap between labels", "e.g. 3"), LABEL_CORE, mm("roll_od", "Max roll diameter", "e.g. 250"), num("labels_per_roll", "Labels per roll", "", "e.g. 2000"), LABEL_UNWIND],
  },
  "LC-815": { customization_fields: FLAT_FIELDS },

  // ── Sustainable foodservice ─────────────────────────────────────────────
  "SP-905": { customization_fields: [mm("length", "Length", "e.g. 230"), mm("width", "Width", "e.g. 150"), mm("depth", "Depth", "e.g. 75"), pick("compartments", "Compartments", ["1", "2", "3", "4", "5"])] },
  "SP-907": { customization_fields: [num("volume_ml", "Capacity", "ml", "e.g. 500"), mm("rim", "Rim / lid diameter", "e.g. 116")] },
  "SP-909": {
    variants: [
      v("paper", "Paper", ["Bleached greaseproof", "Unbleached (natural) greaseproof"]),
      v("gsm", "Paper weight", ["30 GSM", "35 GSM", "40 GSM"]),
      v("print", "Print", ["1-colour print", "2-colour print"]),
    ],
    customization_fields: FLAT_FIELDS,
  },
  "SP-912": {
    variants: [
      v("wall", "Wall", ["Single wall", "Double wall", "Ripple wall"]),
      v("lid", "Lid", ["No lid", "Compostable fibre sip lid", "Reclosable delivery lid"]),
      v("branding", "Branding", ["Plain", "Applied label", "Custom printed"]),
    ],
    customization_fields: [num("capacity_oz", "Capacity", "oz", "e.g. 8"), mm("rim", "Rim diameter", "e.g. 80")],
  },
};
