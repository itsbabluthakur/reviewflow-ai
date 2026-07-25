import { eq } from "drizzle-orm";
import { users } from "../schema";
import { normalizeEmail } from "../normalize-email";
import { BaseRepository, type Queryable } from "./base-repository";

/** Infrastructure-only data access for `users`. No business logic. */
export class UserRepository extends BaseRepository<typeof users> {
  constructor(db: Queryable) {
    super(db, users, users.id);
  }

  /** Normalizes `email` (see normalizeEmail) before searching — never compares raw email strings. */
  async findByEmail(email: string): Promise<typeof users.$inferSelect | undefined> {
    const normalized = normalizeEmail(email);
    return this.wrap("findByEmail", async () => {
      const rows = await this.db.select().from(users).where(eq(users.email, normalized)).limit(1);
      return rows[0];
    });
  }

  /** Normalizes `email` (see normalizeEmail) before inserting — every stored email is canonical. */
  override async create(values: typeof users.$inferInsert): Promise<typeof users.$inferSelect> {
    return super.create({ ...values, email: normalizeEmail(values.email) });
  }

  /** Looks up the application user already linked to a Supabase identity — see @reviewflow/auth's syncUser. */
  async findByAuthUserId(authUserId: string): Promise<typeof users.$inferSelect | undefined> {
    return this.wrap("findByAuthUserId", async () => {
      const rows = await this.db
        .select()
        .from(users)
        .where(eq(users.authUserId, authUserId))
        .limit(1);
      return rows[0];
    });
  }

  /** Links an existing (found-by-email) application user to a Supabase identity. Does not touch any other column. */
  async linkAuthUserId(
    userId: string,
    authUserId: string,
  ): Promise<typeof users.$inferSelect | undefined> {
    return this.update(userId, { authUserId });
  }

  /** Agencies the given user belongs to, via their memberships. */
  async findUserAgencies(userId: string) {
    return this.wrap("findUserAgencies", async () => {
      const rows = await this.db.query.memberships.findMany({
        where: (memberships, { eq }) => eq(memberships.userId, userId),
        with: { agency: true },
      });
      return rows.map((row) => row.agency);
    });
  }
}
