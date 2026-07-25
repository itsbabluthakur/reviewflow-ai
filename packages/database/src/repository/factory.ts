import type { Queryable } from "./base-repository";
import { UserRepository } from "./user-repository";
import { AgencyRepository } from "./agency-repository";
import { MembershipRepository } from "./membership-repository";

export interface Repositories {
  readonly users: UserRepository;
  readonly agencies: AgencyRepository;
  readonly memberships: MembershipRepository;
}

/**
 * Builds the set of domain repositories over one shared `db` handle —
 * `getDb()`'s `Database` for normal request handling, or a `Transaction`
 * handle so callers can run multiple repositories inside one
 * `withTransaction` block. Each repository is constructed lazily, on first
 * access, so a caller that only ever touches `repos.users` never pays for
 * constructing the other two.
 */
export function createRepositories(db: Queryable): Repositories {
  let users: UserRepository | undefined;
  let agencies: AgencyRepository | undefined;
  let memberships: MembershipRepository | undefined;

  return {
    get users(): UserRepository {
      return (users ??= new UserRepository(db));
    },
    get agencies(): AgencyRepository {
      return (agencies ??= new AgencyRepository(db));
    },
    get memberships(): MembershipRepository {
      return (memberships ??= new MembershipRepository(db));
    },
  };
}
