export interface AppErrorOptions {
  /** Machine-readable payload attached to the standard API error response. */
  context?: Record<string, unknown>;
  /** Whether this is an anticipated, handled failure vs. a programming bug. */
  isOperational?: boolean;
  /** Underlying error this one wraps, per the standard `Error.cause` chain. */
  cause?: unknown;
}

/**
 * Base class for every error the platform throws deliberately. `code` and
 * `statusCode` map directly onto the standard API error envelope defined in
 * API.md section 3. Subclass per failure category (see ValidationError,
 * ConfigurationError, DatabaseError) rather than throwing AppError directly.
 */
export class AppError extends Error {
  readonly code: string;
  readonly statusCode: number;
  readonly isOperational: boolean;
  readonly context: Record<string, unknown> | undefined;

  constructor(message: string, code: string, statusCode: number, options: AppErrorOptions = {}) {
    super(message, options.cause !== undefined ? { cause: options.cause } : undefined);
    this.name = this.constructor.name;
    this.code = code;
    this.statusCode = statusCode;
    this.isOperational = options.isOperational ?? true;
    this.context = options.context;

    Error.captureStackTrace?.(this, this.constructor);
  }
}
