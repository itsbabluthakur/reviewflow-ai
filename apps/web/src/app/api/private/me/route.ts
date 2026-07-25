import { NextResponse } from "next/server";
import { toApiSuccessResponse } from "@reviewflow/errors";
import { withApiContext } from "../../../../lib/request-context";
import { withUser } from "../../../../lib/api-auth";

/**
 * Minimal proof that the auth foundation works end-to-end: protected by
 * middleware (matches /api/private/*), resolves the synced application
 * user via `withUser`, and returns it through the standard success
 * envelope. Not a business feature — analogous to /api/live and /api/ready
 * proving the health-check/database pipelines in earlier sprints.
 */
export const GET = withApiContext(
  withUser((_request, { user }) => {
    return NextResponse.json(
      toApiSuccessResponse({ id: user.id, email: user.email, fullName: user.fullName }),
    );
  }),
);
