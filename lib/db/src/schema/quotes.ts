import { pgTable, text, numeric, jsonb, uuid, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const quoteRequestsTable = pgTable("quote_requests", {
  id: uuid("id").primaryKey().defaultRandom(),
  quote_id: text("quote_id").notNull().unique(),
  contact_name: text("contact_name").notNull(),
  company_name: text("company_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  items: jsonb("items").notNull(),
  delivery_country: text("delivery_country").notNull(),
  delivery_pincode: text("delivery_pincode"),
  preferred_timeline: text("preferred_timeline").notNull().default("standard"),
  notes: text("notes"),
  total_estimated_min: numeric("total_estimated_min"),
  total_estimated_max: numeric("total_estimated_max"),
  artwork_option: text("artwork_option"),
  sample_option: text("sample_option"),
  status: text("status").notNull().default("submitted"),
  user_id: uuid("user_id"),
  rejection_reason: text("rejection_reason"),
  admin_notes: text("admin_notes"),
  payment_link: text("payment_link"),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const insertQuoteRequestSchema = createInsertSchema(quoteRequestsTable).omit({ id: true, created_at: true });
export type InsertQuoteRequest = z.infer<typeof insertQuoteRequestSchema>;
export type QuoteRequest = typeof quoteRequestsTable.$inferSelect;
