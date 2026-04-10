import { pgTable, text, numeric, jsonb, uuid, timestamp, date, boolean, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const usersTable = pgTable("users_profile", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  company_name: text("company_name"),
  contact_name: text("contact_name"),
  phone: text("phone"),
  gstin: text("gstin"),
  country: text("country").default("India"),
  default_address: jsonb("default_address"),
  orders_completed: integer("orders_completed").default(0),
  credit_eligible: boolean("credit_eligible").default(false),
  credit_limit: numeric("credit_limit").default("0"),
  password_hash: text("password_hash"),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const ordersTable = pgTable("orders", {
  id: uuid("id").primaryKey().defaultRandom(),
  order_id: text("order_id").notNull().unique(),
  quote_request_id: uuid("quote_request_id"),
  user_id: uuid("user_id"),
  items: jsonb("items").notNull(),
  total_price: numeric("total_price").notNull(),
  payment_type: text("payment_type").notNull().default("standard"),
  discount_applied: numeric("discount_applied").default("0"),
  delivery_address: jsonb("delivery_address").notNull().default({}),
  status: text("status").notNull().default("confirmed"),
  estimated_delivery: date("estimated_delivery"),
  tracking_number: text("tracking_number"),
  tracking_url: text("tracking_url"),
  internal_notes: text("internal_notes"),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const invoicesTable = pgTable("invoices", {
  id: uuid("id").primaryKey().defaultRandom(),
  invoice_id: text("invoice_id").notNull().unique(),
  order_id: uuid("order_id"),
  user_id: uuid("user_id"),
  amount: numeric("amount").notNull(),
  discount_line: numeric("discount_line").default("0"),
  status: text("status").notNull().default("pending"),
  due_date: date("due_date").notNull(),
  payment_method: text("payment_method"),
  razorpay_payment_id: text("razorpay_payment_id"),
  pdf_url: text("pdf_url"),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const insertUserSchema = createInsertSchema(usersTable).omit({ id: true, created_at: true });
export const insertOrderSchema = createInsertSchema(ordersTable).omit({ id: true, created_at: true });
export const insertInvoiceSchema = createInsertSchema(invoicesTable).omit({ id: true, created_at: true });

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof usersTable.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof ordersTable.$inferSelect;
export type InsertInvoice = z.infer<typeof insertInvoiceSchema>;
export type Invoice = typeof invoicesTable.$inferSelect;
