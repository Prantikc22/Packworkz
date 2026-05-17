import { pgTable, text, boolean, integer, numeric, jsonb, uuid, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const productsTable = pgTable("products", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  category: text("category").notNull(),
  description: text("description").notNull(),
  use_case: text("use_case").notNull(),
  price_min: numeric("price_min").notNull(),
  price_max: numeric("price_max").notNull(),
  moq: integer("moq").notNull(),
  moq_unit: text("moq_unit").notNull(),
  is_smartstock: boolean("is_smartstock").default(false),
  is_eco: boolean("is_eco").default(false),
  sample_tier: text("sample_tier").notNull().default("standard"),
  sample_price: integer("sample_price").default(2999),
  image_url: text("image_url"),
  specs: jsonb("specs").default({}),
  compliance_certs: text("compliance_certs").array().default([]),
  delivery_days_india: integer("delivery_days_india").default(7),
  delivery_days_global: integer("delivery_days_global").default(21),
  is_active: boolean("is_active").default(true),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const insertProductSchema = createInsertSchema(productsTable).omit({ id: true, created_at: true });
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof productsTable.$inferSelect;
