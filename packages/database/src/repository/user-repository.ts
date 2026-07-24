import { eq } from "drizzle-orm";
import type { Database } from "../client";
import { users } from "../schema";
import { BaseRepository } from "./base-repository";

/** Infrastructure-only data access for `users`. No business logic. */
export class UserRepository extends BaseRepository<typeof users> {
  constructor(db: Database) {
    super(db, users, users.id);
  }

  async findByEmail(email: string): Promise<typeof users.$inferSelect | undefined> {
    return this.wrap("findByEmail", async () => {
      const rows = await this.db.select().from(users).where(eq(users.email, email)).limit(1);
      return rows[0];
    });
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
