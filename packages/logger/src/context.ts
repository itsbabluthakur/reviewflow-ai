import { AsyncLocalStorage } from "node:async_hooks";
import { logger, type Logger } from "./logger";

export interface RequestContext {
  requestId: string;
  correlationId: string;
  [key: string]: unknown;
}

const storage = new AsyncLocalStorage<RequestContext>();

/**
 * Runs `fn` with `context` bound for the duration of the call — including
 * across `await`s, since AsyncLocalStorage follows the async call chain.
 * Framework-agnostic on purpose: Next.js-specific header extraction lives in
 * the app that calls this (see apps/web/src/lib/request-context.ts).
 */
export function runWithRequestContext<T>(context: RequestContext, fn: () => T): T {
  return storage.run(context, fn);
}

/** The active request context, or `undefined` outside any `runWithRequestContext` call. */
export function getRequestContext(): RequestContext | undefined {
  return storage.getStore();
}

/** A logger child-bound to the active request context (requestId, correlationId, …), or the root logger if none is active. */
export function getContextLogger(): Logger {
  const context = storage.getStore();
  return context ? logger.child(context) : logger;
}
