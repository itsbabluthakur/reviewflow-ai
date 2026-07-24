import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { memberships } from "./memberships";

/**
 * Agency accounts — the top of the tenant hierarchy (DATABASE.md section 2).
 * Business/Location/Customer tables that hang off an agency are Sprint 3B+.
 */
export const agencies = pgTable("agencies", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  logoUrl: text("logo_url"),
  timezone: text("timezone").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const agenciesRelations = relations(agencies, ({ many }) => ({
  memberships: many(memberships),
}));
