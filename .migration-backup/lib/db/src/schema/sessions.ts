import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const sessionsTable = pgTable("user_sessions", {
  token: text("token").primaryKey(),
  user_id: uuid("user_id").notNull(),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
  expires_at: timestamp("expires_at", { withTimezone: true }).notNull(),
});
