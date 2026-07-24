import { eq } from "drizzle-orm";
import type { Database } from "../client";
import { agencies } from "../schema";
import { BaseRepository } from "./base-repository";

/** Infrastructure-only data access for `agencies`. No business logic. */
export class AgencyRepository extends BaseRepository<typeof agencies> {
  constructor(db: Database) {
    super(db, agencies, agencies.id);
  }

  async findBySlug(slug: string): Promise<typeof agencies.$inferSelect | undefined> {
    return this.wrap("findBySlug", async () => {
      const rows = await this.db.select().from(agencies).where(eq(agencies.slug, slug)).limit(1);
      return rows[0];
    });
  }

  /** Members (users) of the given agency, via its memberships. */
  async findMembers(agencyId: string) {
    return this.wrap("findMembers", async () => {
      const rows = await this.db.query.memberships.findMany({
        where: (memberships, { eq }) => eq(memberships.agencyId, agencyId),
        with: { user: true },
      });
      return rows.map((row) => ({ ...row.user, role: row.role, membershipId: row.id }));
    });
  }
}
