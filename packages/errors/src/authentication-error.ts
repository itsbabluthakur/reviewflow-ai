import { AppError, type AppErrorOptions } from "./app-error";

/** No valid, verified session — the caller isn't signed in. Per API.md's 401 Unauthorized. */
export class AuthenticationError extends AppError {
  constructor(message = "Authentication required.", options: AppErrorOptions = {}) {
    super(message, "AUTHENTICATION_ERROR", 401, options);
  }
}
