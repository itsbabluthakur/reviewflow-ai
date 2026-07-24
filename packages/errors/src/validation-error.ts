import { AppError, type AppErrorOptions } from "./app-error";

/** Invalid or missing input, per API.md's 422 VALIDATION_ERROR response. */
export class ValidationError extends AppError {
  constructor(message: string, options: AppErrorOptions = {}) {
    super(message, "VALIDATION_ERROR", 422, options);
  }
}
