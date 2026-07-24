import { DatabaseError } from "@reviewflow/errors";
import { eq, type SQL } from "drizzle-orm";
import type { PgColumn, PgTable } from "drizzle-orm/pg-core";
import type { Database } from "../client";

/**
 * Generic CRUD primitives over a single Drizzle table. Infrastructure only —
 * no business repository extends this yet (see ARCHITECTURE.md section 4,
 * Repository Layer). A domain repository would subclass this and add
 * domain-specific query methods, not reimplement findById/create/etc.
 */
export abstract class BaseRepository<
  TTable extends PgTable,
  TSelect = TTable["$inferSelect"],
  TInsert = TTable["$inferInsert"],
> {
  protected constructor(
    protected readonly db: Database,
    protected readonly table: TTable,
    protected readonly idColumn: PgColumn,
  ) {}

  /**
   * `this.table` typed as `any`, isolated to this one getter. Drizzle's
   * table/column generics don't compose through an abstract base class
   * without escaping to `any` somewhere — every other method in this class
   * stays fully typed on its public surface (parameters, return types).
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- see doc comment above
  private get queryTable(): any {
    return this.table;
  }

  async findById(id: string | number): Promise<TSelect | undefined> {
    return this.wrap("findById", async () => {
      const rows = await this.db
        .select()
        .from(this.queryTable)
        .where(eq(this.idColumn, id))
        .limit(1);
      return rows[0] as TSelect | undefined;
    });
  }

  async findMany(where?: SQL): Promise<TSelect[]> {
    return this.wrap("findMany", async () => {
      const query = this.db.select().from(this.queryTable);
      const rows = where ? await query.where(where) : await query;
      return rows as TSelect[];
    });
  }

  async create(values: TInsert): Promise<TSelect> {
    return this.wrap("create", async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- see queryTable doc comment
      const rows = await this.db
        .insert(this.queryTable)
        .values(values as any)
        .returning();
      return rows[0] as TSelect;
    });
  }

  async deleteById(id: string | number): Promise<void> {
    await this.wrap("deleteById", async () => {
      await this.db.delete(this.queryTable).where(eq(this.idColumn, id));
    });
  }

  /** Wraps a driver call, re-throwing any failure as a DatabaseError tagged with the failing operation. */
  protected async wrap<T>(operation: string, fn: () => Promise<T>): Promise<T> {
    try {
      return await fn();
    } catch (error) {
      if (error instanceof DatabaseError) {
        throw error;
      }
      throw new DatabaseError(`${this.constructor.name}.${operation} failed.`, {
        cause: error,
        context: { operation },
      });
    }
  }
}
