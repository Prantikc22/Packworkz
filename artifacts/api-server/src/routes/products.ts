import { Router, type IRouter } from "express";
import { db, productsTable } from "@workspace/db";
import { eq, and, ilike, sql } from "drizzle-orm";

const router: IRouter = Router();

router.get("/products", async (req, res): Promise<void> => {
  const { category, is_eco, is_smartstock, search, limit = "50", offset = "0" } = req.query as Record<string, string>;

  const conditions = [eq(productsTable.is_active, true)];

  if (category) {
    conditions.push(eq(productsTable.category, category));
  }
  if (is_eco === "true") {
    conditions.push(eq(productsTable.is_eco, true));
  }
  if (is_smartstock === "true") {
    conditions.push(eq(productsTable.is_smartstock, true));
  }
  if (search) {
    conditions.push(
      sql`(${productsTable.name} ILIKE ${"%" + search + "%"} OR ${productsTable.use_case} ILIKE ${"%" + search + "%"} OR ${productsTable.description} ILIKE ${"%" + search + "%"})`
    );
  }

  const whereClause = and(...conditions);

  const [products, countResult] = await Promise.all([
    db
      .select()
      .from(productsTable)
      .where(whereClause)
      .orderBy(
        sql`${productsTable.is_smartstock} DESC, ${productsTable.name} ASC`
      )
      .limit(parseInt(limit))
      .offset(parseInt(offset)),
    db
      .select({ count: sql<number>`count(*)` })
      .from(productsTable)
      .where(whereClause),
  ]);

  res.json({ data: products, total: Number(countResult[0]?.count ?? 0) });
});

router.get("/products/categories/summary", async (_req, res): Promise<void> => {
  const result = await db
    .select({
      category: productsTable.category,
      count: sql<number>`count(*)`,
    })
    .from(productsTable)
    .where(eq(productsTable.is_active, true))
    .groupBy(productsTable.category);

  res.json(result.map((r) => ({ category: r.category, count: Number(r.count) })));
});

router.get("/products/:slug", async (req, res): Promise<void> => {
  const slug = Array.isArray(req.params.slug) ? req.params.slug[0] : req.params.slug;

  const [product] = await db
    .select()
    .from(productsTable)
    .where(and(eq(productsTable.slug, slug), eq(productsTable.is_active, true)))
    .limit(1);

  if (!product) {
    res.status(404).json({ error: "Product not found" });
    return;
  }

  res.json(product);
});

export default router;
