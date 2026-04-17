// Curated Unsplash image URLs for packaging categories & industries
// Format: https://images.unsplash.com/photo-{id}?w={w}&h={h}&fit=crop&q=80

export const INDUSTRY_IMAGES: Record<string, string> = {
  food: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=500&fit=crop&q=80",
  beverage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=500&fit=crop&q=80",
  pharma: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&h=500&fit=crop&q=80",
  cosmetics: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&h=500&fit=crop&q=80",
  ecommerce: "https://images.unsplash.com/photo-1557821552-17105176677c?w=800&h=500&fit=crop&q=80",
  fmcg: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&h=500&fit=crop&q=80",
  industrial: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=800&h=500&fit=crop&q=80",
  agriculture: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=800&h=500&fit=crop&q=80",
  electronics: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&h=500&fit=crop&q=80",
  homecare: "https://images.unsplash.com/photo-1563453392212-326f5e854473?w=800&h=500&fit=crop&q=80",
};

// Category fallbacks use confirmed-working industry photo IDs
export const CATEGORY_IMAGES: Record<string, string> = {
  flexible: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&h=400&fit=crop&q=80",    // FMCG packaged goods
  rigid: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&h=400&fit=crop&q=80",     // cosmetics bottles/jars
  boxes: "https://images.unsplash.com/photo-1557821552-17105176677c?w=600&h=400&fit=crop&q=80",        // ecommerce boxes
  ecommerce: "https://images.unsplash.com/photo-1557821552-17105176677c?w=600&h=400&fit=crop&q=80",    // ecommerce/shipping
  rolls: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600&h=400&fit=crop&q=80",    // industrial manufacturing
  accessories: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&h=400&fit=crop&q=80", // cosmetics accessories
  sustainable: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=600&h=400&fit=crop&q=80", // agriculture/green
  premium: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&h=400&fit=crop&q=80",   // cosmetics/luxury
  labels: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&h=400&fit=crop&q=80",       // FMCG labels
};

// SKU-specific keyword overrides — using only confirmed-working photo IDs
// (same 8 industry hero IDs that are verified correct)
const F = "https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&h=400&fit=crop&q=80";  // FMCG
const C = "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=500&h=400&fit=crop&q=80"; // Cosmetics
const E = "https://images.unsplash.com/photo-1557821552-17105176677c?w=500&h=400&fit=crop&q=80";  // Ecommerce
const I = "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=500&h=400&fit=crop&q=80"; // Industrial
const P = "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&h=400&fit=crop&q=80"; // Pharma
const G = "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=500&h=400&fit=crop&q=80"; // Agriculture/green
const FD = "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=500&h=400&fit=crop&q=80"; // Food
const EL = "https://images.unsplash.com/photo-1518770660439-4636190af475?w=500&h=400&fit=crop&q=80"; // Electronics

export const SKU_IMAGES: Record<string, string> = {
  // Flexible pouches → food/FMCG context
  "pouch": F, "sachet": F, "stick pack": F, "back seal": F, "spout pouch": F,
  "retort": P, "vacuum pouch": F, "compostable pouch": G, "kraft stand": G,
  // Rolls & films → industrial
  "printed roll": I, "bopp/": I, "pet/pe": I, "met pet": I, "pet/al": I,
  "greaseproof": FD, "paper/pe": I, "digital short-run": I, "mono-material": G,
  "shrink sleeve": F, "bopp sealing": I,
  // Rigid containers → cosmetics
  "bottle": C, "jar": C, "cosmetic": C, "dropper": C, "airless pump": C,
  "blister pack": P, "clamshell": E, "tin container": I,
  // Boxes & cartons → ecommerce
  "corrugated": E, "mailer box": E, "mono carton": F, "folding carton": F,
  "display box": E, "drawer box": C, "rigid setup": C, "jewellery box": C,
  "perfume box": C, "candle box": C, "gift box": C, "magnetic closure": C,
  // E-commerce → ecommerce
  "mailer bag": E, "bubble mailer": E, "bubble wrap": E, "poly mailer": E,
  "padded envelope": E, "air pillow": E, "honeycomb paper": E, "tamper": E,
  "food delivery box": FD, "pizza box": FD, "foam insert": E, "thermocol": E,
  "sticker sheet": F, "tissue paper": C, "thank-you card": E,
  // Accessories → cosmetics
  "lotion pump": C, "spray pump": C, "trigger sprayer": C,
  "flip-top cap": C, "disc top cap": C, "screw cap": C,
  "induction seal": P, "in-mould label": F, "pressure-sensitive label": F,
  "hang tag": C, "swing tag": C, "spout fitment": F,
  "desiccant": P, "zipper": F,
  // Sustainable → agriculture/green
  "bagasse": FD, "moulded pulp": G, "bamboo": G, "compostable": G,
  "natural jute": G, "recycled": G, "seed paper": G,
  // Premium → cosmetics
  "luxury": C, "foil-stamped": C, "velvet": C, "soft-touch": C,
  "satin ribbon": C, "premium canister": I, "gift wrap": C,
  "hamper box": C, "insert card": E,
};

export function getProductImage(productName: string, category: string): string {
  const nameLower = productName.toLowerCase();
  for (const [key, url] of Object.entries(SKU_IMAGES)) {
    if (nameLower.includes(key)) return url;
  }
  return CATEGORY_IMAGES[category] || "https://images.unsplash.com/photo-1553413077-190dd305871c?w=500&h=400&fit=crop&q=80";
}

export const DESIGN_PORTFOLIO_IMAGES = [
  "https://images.unsplash.com/photo-1589782182703-2aaa69037b5b?w=600&h=450&fit=crop&q=80",
  "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=600&h=450&fit=crop&q=80",
  "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=450&fit=crop&q=80",
  "https://images.unsplash.com/photo-1607344645866-009c320b63e0?w=600&h=450&fit=crop&q=80",
  "https://images.unsplash.com/photo-1606166187734-a4cb74079037?w=600&h=450&fit=crop&q=80",
  "https://images.unsplash.com/photo-1600948836101-f9ffda59d250?w=600&h=450&fit=crop&q=80",
];
