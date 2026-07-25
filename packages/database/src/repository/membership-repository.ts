import { and, eq } from "drizzle-orm";
import { memberships } from "../schema";
import { BaseRepository, type Queryable } from "./base-repository";

/** Infrastructure-only data access for `memberships`. No business logic. */
export class MembershipRepository extends BaseRepository<typeof memberships> {
  constructor(db: Queryable) {
    super(db, memberships, memberships.id);
  }

  async findByAgencyAndUser(
    agencyId: string,
    userId: string,
  ): Promise<typeof memberships.$inferSelect | undefined> {
    return this.wrap("findByAgencyAndUser", async () => {
      const rows = await this.db
        .select()
        .from(memberships)
        .where(and(eq(memberships.agencyId, agencyId), eq(memberships.userId, userId)))
        .limit(1);
      return rows[0];
    });
  }
}
