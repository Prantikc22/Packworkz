import { pgTable, text, boolean, integer, uuid, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const designRequestsTable = pgTable("design_requests", {
  id: uuid("id").primaryKey().defaultRandom(),
  design_id: text("design_id").notNull().unique(),
  user_id: uuid("user_id"),
  contact_name: text("contact_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  product_type: text("product_type").notNull(),
  product_id: uuid("product_id"),
  brand_colors: text("brand_colors"),
  logo_url: text("logo_url"),
  reference_images: text("reference_images").array(),
  brand_description: text("brand_description"),
  notes: text("notes"),
  is_rush: boolean("is_rush").default(false),
  amount_paid: integer("amount_paid").notNull(),
  razorpay_payment_id: text("razorpay_payment_id"),
  status: text("status").notNull().default("paid"),
  designer_notes: text("designer_notes"),
  payment_link: text("payment_link"),
  output_files: text("output_files").array(),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const sampleRequestsTable = pgTable("sample_requests", {
  id: uuid("id").primaryKey().defaultRandom(),
  sample_id: text("sample_id").notNull().unique(),
  user_id: uuid("user_id"),
  contact_name: text("contact_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  product_id: uuid("product_id"),
  sample_tier: text("sample_tier").notNull(),
  amount_paid: integer("amount_paid").notNull(),
  razorpay_payment_id: text("razorpay_payment_id"),
  status: text("status").notNull().default("paid"),
  admin_notes: text("admin_notes"),
  payment_link: text("payment_link"),
  adjusted_to_order_id: uuid("adjusted_to_order_id"),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const testimonialsTable = pgTable("testimonials", {
  id: uuid("id").primaryKey().defaultRandom(),
  company_name: text("company_name").notNull(),
  city: text("city").notNull(),
  industry: text("industry").notNull(),
  quote_text: text("quote_text").notNull(),
  metric_label: text("metric_label").notNull(),
  metric_value: text("metric_value").notNull(),
  is_active: boolean("is_active").default(true),
});

export const insertDesignRequestSchema = createInsertSchema(designRequestsTable).omit({ id: true, created_at: true });
export const insertSampleRequestSchema = createInsertSchema(sampleRequestsTable).omit({ id: true, created_at: true });

export type InsertDesignRequest = z.infer<typeof insertDesignRequestSchema>;
export type DesignRequest = typeof designRequestsTable.$inferSelect;
export type InsertSampleRequest = z.infer<typeof insertSampleRequestSchema>;
export type SampleRequest = typeof sampleRequestsTable.$inferSelect;
