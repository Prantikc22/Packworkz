import { Router, type IRouter } from "express";
import { sb } from "../lib/supabase";

const router: IRouter = Router();

router.get("/products", async (req, res): Promise<void> => {
  const { category, is_eco, is_smartstock, search, limit = "50", offset = "0" } = req.query as Record<string, string>;

  let query = sb
    .from("products")
    .select("*", { count: "exact" })
    .eq("is_active", true)
    .order("is_smartstock", { ascending: false })
    .order("name", { ascending: true })
    .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1);

  if (category) query = query.eq("category", category);
  if (is_eco === "true") query = query.eq("is_eco", true);
  if (is_smartstock === "true") query = query.eq("is_smartstock", true);
  if (search) {
    query = query.or(`name.ilike.%${search}%,use_case.ilike.%${search}%,description.ilike.%${search}%`);
  }

  const { data: products, count, error } = await query;

  if (error) {
    console.error("[products] query error:", error.message);
    res.status(500).json({ error: "Failed to load products" });
    return;
  }

  res.json({ data: products || [], total: count ?? 0 });
});

router.get("/products/categories/summary", async (_req, res): Promise<void> => {
  const { data, error } = await sb
    .from("products")
    .select("category")
    .eq("is_active", true);

  if (error) {
    res.status(500).json({ error: "Failed to load categories" });
    return;
  }

  const countMap: Record<string, number> = {};
  for (const row of (data || [])) {
    if (row.category) countMap[row.category] = (countMap[row.category] || 0) + 1;
  }

  res.json(Object.entries(countMap).map(([category, count]) => ({ category, count })));
});

router.get("/products/:slug", async (req, res): Promise<void> => {
  const slug = Array.isArray(req.params.slug) ? req.params.slug[0] : req.params.slug;

  const { data: product } = await sb
    .from("products")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  if (!product) {
    res.status(404).json({ error: "Product not found" });
    return;
  }

  res.json(product);
});

export default router;
