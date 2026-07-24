import { AppError, type AppErrorOptions } from "./app-error";

/**
 * Missing or invalid configuration (env vars, required external service
 * credentials). Thrown at startup/connection time, never in response to
 * user input — see ValidationError for that case.
 */
export class ConfigurationError extends AppError {
  constructor(message: string, options: AppErrorOptions = {}) {
    super(message, "CONFIGURATION_ERROR", 500, options);
  }
}
