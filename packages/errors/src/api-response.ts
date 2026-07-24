import { AppError } from "./app-error";

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  meta?: Record<string, unknown>;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
  };
}

/** The generic code/message returned for anything that isn't an AppError — never leaks internal detail. */
const UNKNOWN_ERROR: ApiErrorResponse["error"] = {
  code: "INTERNAL_ERROR",
  message: "An unexpected error occurred.",
};

/** Builds the `{ success: true, data, meta }` envelope defined in API.md section 3. */
export function toApiSuccessResponse<T>(
  data: T,
  meta?: Record<string, unknown>,
): ApiSuccessResponse<T> {
  return meta !== undefined ? { success: true, data, meta } : { success: true, data };
}

/**
 * Builds the `{ success: false, error }` envelope defined in API.md section 3.
 * Non-AppError values (programmer bugs, unexpected throws) are mapped to a
 * generic INTERNAL_ERROR — per SECURITY.md section 9/19, never reflect raw
 * error messages from unknown failures back to the client.
 */
export function toApiErrorResponse(error: unknown): ApiErrorResponse {
  if (error instanceof AppError) {
    return { success: false, error: { code: error.code, message: error.message } };
  }
  return { success: false, error: UNKNOWN_ERROR };
}

/** HTTP status to use for the response — 500 for anything that isn't an AppError. */
export function getStatusCode(error: unknown): number {
  return error instanceof AppError ? error.statusCode : 500;
}
