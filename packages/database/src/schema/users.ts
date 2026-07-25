import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { memberships } from "./memberships";

/**
 * Platform users. Not the same thing as Supabase Auth's own user record —
 * this table is the application-level profile a membership/role attaches
 * to. Auth wiring (Sprint 3B+) will add the link to Supabase Auth's user id.
 */
export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull().unique(),
  fullName: text("full_name").notNull(),
  avatarUrl: text("avatar_url"),
  // Supabase Auth's `auth.users.id` — nullable because the application user
  // is the source of truth and can exist before any identity is linked to
  // it (e.g. this sprint's seed data); unique so at most one application
  // user maps to a given identity. `.unique()` also creates the required
  // index — see ADR-0005.
  authUserId: uuid("auth_user_id").unique(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  memberships: many(memberships),
}));
