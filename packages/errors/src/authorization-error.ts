import { AppError, type AppErrorOptions } from "./app-error";

/**
 * A verified, authenticated caller lacks access to the requested resource
 * (e.g. no membership in the target agency). Per API.md's 403 Forbidden.
 * Distinct from AuthenticationError: this means "we know who you are, but
 * you can't do this" rather than "we don't know who you are".
 */
export class AuthorizationError extends AppError {
  constructor(message = "You do not have access to this resource.", options: AppErrorOptions = {}) {
    super(message, "AUTHORIZATION_ERROR", 403, options);
  }
}
