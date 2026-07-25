export {
  createAuthService,
  type AuthService,
  type AuthServiceDeps,
  type AuthCredentials,
  type SignUpCredentials,
} from "./auth-service";
export {
  optionalSession,
  requireSession,
  optionalUser,
  requireUser,
  requireMembership,
  type MembershipContext,
} from "./session";
export {
  isPublicPath,
  isProtectedPath,
  isSafeRedirectPath,
  resolveMiddlewareDecision,
  PUBLIC_PATHS,
  PROTECTED_PREFIXES,
  REDIRECT_PARAM,
  type MiddlewareInput,
  type MiddlewareDecision,
} from "./middleware";
export type { CookieAdapter, CookieToSet } from "./cookies";
export type { AppUser, AuthIdentity, AppSession, AuthResult } from "./types";
