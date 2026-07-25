import { ValidationError } from "@reviewflow/errors";

/**
 * Canonicalizes an email address for storage and comparison: trims
 * surrounding whitespace and lowercases it. Every place `users.email` is
 * searched, inserted, updated, synchronized, or authenticated against must
 * go through this — never compare raw email strings (see
 * docs/architecture/0005-authentication-architecture.md, "Email
 * normalization"). Throws ValidationError (not DatabaseError) so callers
 * inside a repository's `wrap()` should call this before entering it.
 */
export function normalizeEmail(email: string): string {
  const normalized = email.trim().toLowerCase();
  if (normalized.length === 0) {
    throw new ValidationError("Email must not be empty.");
  }
  return normalized;
}
