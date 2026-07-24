import { DatabaseError } from "@reviewflow/errors";
import type { Database } from "../client";

export type Transaction = Parameters<Database["transaction"]>[0] extends (tx: infer T) => unknown
  ? T
  : never;

/**
 * Runs `fn` inside a database transaction. Any thrown error rolls the
 * transaction back and is re-thrown as a DatabaseError (unless it already
 * is one), so callers get a consistent, typed failure regardless of what
 * the underlying driver threw.
 */
export async function withTransaction<T>(
  db: Database,
  fn: (tx: Transaction) => Promise<T>,
): Promise<T> {
  try {
    return await db.transaction(fn);
  } catch (error) {
    if (error instanceof DatabaseError) {
      throw error;
    }
    throw new DatabaseError("Transaction failed and was rolled back.", { cause: error });
  }
}
