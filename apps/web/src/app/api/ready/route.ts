import { NextResponse } from "next/server";
import { loadEnv } from "@reviewflow/config";
import { checkDatabaseConnection } from "@reviewflow/database";
import { serializeError } from "@reviewflow/errors";
import { withApiContext } from "../../../lib/request-context";

interface ReadinessCheck {
  status: "ok" | "error";
  error?: string;
}

/**
 * Readiness probe: can this instance actually serve traffic right now?
 * Verifies environment configuration and database connectivity — the two
 * dependencies every request in this sprint's infrastructure could need.
 * Returns 503 (not 200) when any check fails, so orchestrators stop
 * routing traffic here without killing/restarting the process.
 */
export const GET = withApiContext(async () => {
  const checks: Record<string, ReadinessCheck> = {
    environment: { status: "ok" },
    database: { status: "ok" },
  };

  try {
    loadEnv();
  } catch (error) {
    checks.environment = { status: "error", error: serializeError(error).message };
  }

  try {
    await checkDatabaseConnection();
  } catch (error) {
    checks.database = { status: "error", error: serializeError(error).message };
  }

  const allOk = Object.values(checks).every((check) => check.status === "ok");

  return NextResponse.json(
    { status: allOk ? "ok" : "error", checks },
    { status: allOk ? 200 : 503 },
  );
});
