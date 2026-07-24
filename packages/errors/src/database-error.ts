import { AppError, type AppErrorOptions } from "./app-error";

/**
 * Wraps a failure from the database driver/ORM. Always set `cause` to the
 * original error so the underlying driver detail survives in logs while the
 * API response stays generic (see toApiErrorResponse).
 */
export class DatabaseError extends AppError {
  constructor(message: string, options: AppErrorOptions = {}) {
    super(message, "DATABASE_ERROR", 500, options);
  }
}
