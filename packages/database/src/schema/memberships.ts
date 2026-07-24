import { pgEnum, pgTable, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { agencies } from "./agencies";
import { users } from "./users";

/**
 * Scoped to what a membership needs today (Sprint 3A: agency-level access
 * only, no business/location tables yet). Full RBAC (permission catalog,
 * per-capability checks) is out of scope here — see ROADMAP.md Phase 1 and
 * ARCHITECTURE.md section 7.
 */
export const membershipRole = pgEnum("membership_role", ["owner", "admin", "member"]);

/** Joins a user to an agency with a role. One row per (agency, user) pair. */
export const memberships = pgTable(
  "memberships",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    agencyId: uuid("agency_id")
      .notNull()
      .references(() => agencies.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    role: membershipRole("role").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [uniqueIndex("memberships_agency_id_user_id_key").on(table.agencyId, table.userId)],
);

export const membershipsRelations = relations(memberships, ({ one }) => ({
  agency: one(agencies, {
    fields: [memberships.agencyId],
    references: [agencies.id],
  }),
  user: one(users, {
    fields: [memberships.userId],
    references: [users.id],
  }),
}));
