import { NextResponse } from "next/server";
import { withApiContext } from "../../../lib/request-context";

/**
 * Liveness probe: is the process up and responding at all? Deliberately
 * checks nothing else — a dependency outage (database, Supabase) should
 * fail readiness, not liveness, or an orchestrator would kill and restart
 * a perfectly healthy process for a problem restarting it can't fix.
 */
export const GET = withApiContext(() => {
  return NextResponse.json({ status: "ok" });
});
