import { NextResponse, type NextRequest } from "next/server";
import { getContextLogger, runWithRequestContext } from "@reviewflow/logger";
import { getStatusCode, serializeError, toApiErrorResponse } from "@reviewflow/errors";
import { CORRELATION_ID_HEADER, REQUEST_ID_HEADER } from "../middleware";

export type ApiRouteHandler = (request: NextRequest) => Promise<NextResponse> | NextResponse;

/**
 * Wraps a Route Handler with request-id/correlation-id-bound structured
 * logging and consistent error handling — the reusable piece every future
 * API route builds on. Reads the IDs `middleware.ts` already attached to
 * the incoming request headers (falls back to generating fresh ones for
 * direct invocations that bypass middleware, e.g. tests).
 *
 * On success: logs start/end with duration. On a thrown error: logs it
 * structured (via @reviewflow/errors' serializeError) and converts it to
 * the standard API.md error envelope instead of leaking an unhandled
 * exception.
 */
export function withApiContext(handler: ApiRouteHandler): ApiRouteHandler {
  return async (request: NextRequest) => {
    const requestId = request.headers.get(REQUEST_ID_HEADER) ?? crypto.randomUUID();
    const correlationId = request.headers.get(CORRELATION_ID_HEADER) ?? crypto.randomUUID();

    return runWithRequestContext({ requestId, correlationId }, async () => {
      const logger = getContextLogger();
      const start = Date.now();
      logger.info({ method: request.method, path: request.nextUrl.pathname }, "request started");

      try {
        const response = await handler(request);
        logger.info(
          { status: response.status, durationMs: Date.now() - start },
          "request completed",
        );
        return response;
      } catch (error) {
        logger.error({ err: serializeError(error) }, "request failed");
        return NextResponse.json(toApiErrorResponse(error), { status: getStatusCode(error) });
      }
    });
  };
}
