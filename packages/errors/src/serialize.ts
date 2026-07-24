import { AppError } from "./app-error";

export interface SerializeErrorOptions {
  /** Include the stack trace. Defaults to `NODE_ENV !== "production"` — per
   * CLAUDE.md (Error Handling) and SECURITY.md section 9, stack traces must
   * never reach production output. */
  includeStack?: boolean;
}

/** A plain, JSON-safe object suitable for structured logging (pino, etc.). */
export interface SerializedError {
  name: string;
  message: string;
  code?: string;
  statusCode?: number;
  isOperational?: boolean;
  context?: Record<string, unknown>;
  stack?: string;
  cause?: unknown;
}

/** Normalizes any thrown value into a structured, log-friendly shape. */
export function serializeError(
  error: unknown,
  options: SerializeErrorOptions = {},
): SerializedError {
  const includeStack = options.includeStack ?? process.env.NODE_ENV !== "production";

  if (error instanceof AppError) {
    return {
      name: error.name,
      message: error.message,
      code: error.code,
      statusCode: error.statusCode,
      isOperational: error.isOperational,
      ...(error.context !== undefined ? { context: error.context } : {}),
      ...(includeStack && error.stack !== undefined ? { stack: error.stack } : {}),
      ...(error.cause !== undefined ? { cause: error.cause } : {}),
    };
  }

  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      ...(includeStack && error.stack !== undefined ? { stack: error.stack } : {}),
    };
  }

  return { name: "UnknownError", message: String(error) };
}
