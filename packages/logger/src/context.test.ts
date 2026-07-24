import { describe, expect, it } from "vitest";
import { createLogger, getContextLogger, getRequestContext, runWithRequestContext } from "./index";

describe("createLogger", () => {
  it("binds the given fields to every log line", () => {
    const child = createLogger({ module: "database" });
    expect(child.bindings()).toMatchObject({ module: "database" });
  });
});

describe("request context", () => {
  it("is unset outside runWithRequestContext", () => {
    expect(getRequestContext()).toBeUndefined();
  });

  it("is available inside runWithRequestContext, including across an await", async () => {
    const context = { requestId: "req-1", correlationId: "corr-1" };

    await runWithRequestContext(context, async () => {
      expect(getRequestContext()).toEqual(context);
      await Promise.resolve();
      expect(getRequestContext()).toEqual(context);
    });

    expect(getRequestContext()).toBeUndefined();
  });

  it("getContextLogger binds requestId/correlationId when inside a context", () => {
    runWithRequestContext({ requestId: "req-2", correlationId: "corr-2" }, () => {
      expect(getContextLogger().bindings()).toMatchObject({
        requestId: "req-2",
        correlationId: "corr-2",
      });
    });
  });

  it("getContextLogger falls back to the root logger outside a context", () => {
    expect(getContextLogger().bindings()).not.toHaveProperty("requestId");
  });
});
