import { describe, expect, it } from "vitest";
import {
  AppError,
  ConfigurationError,
  DatabaseError,
  ValidationError,
  getStatusCode,
  serializeError,
  toApiErrorResponse,
  toApiSuccessResponse,
} from "./index";

describe("error hierarchy", () => {
  it("ValidationError has code VALIDATION_ERROR and statusCode 422", () => {
    const error = new ValidationError("Customer email is required.");
    expect(error).toBeInstanceOf(AppError);
    expect(error.code).toBe("VALIDATION_ERROR");
    expect(error.statusCode).toBe(422);
    expect(error.isOperational).toBe(true);
  });

  it("ConfigurationError has code CONFIGURATION_ERROR and statusCode 500", () => {
    const error = new ConfigurationError("Missing DATABASE_URL.");
    expect(error.code).toBe("CONFIGURATION_ERROR");
    expect(error.statusCode).toBe(500);
  });

  it("DatabaseError has code DATABASE_ERROR and statusCode 500", () => {
    const error = new DatabaseError("Query failed.");
    expect(error.code).toBe("DATABASE_ERROR");
    expect(error.statusCode).toBe(500);
  });

  it("carries context and cause through", () => {
    const cause = new Error("driver-level failure");
    const error = new DatabaseError("Query failed.", { cause, context: { table: "customers" } });
    expect(error.cause).toBe(cause);
    expect(error.context).toEqual({ table: "customers" });
  });
});

describe("toApiSuccessResponse / toApiErrorResponse", () => {
  it("builds the success envelope", () => {
    expect(toApiSuccessResponse({ id: "1" })).toEqual({ success: true, data: { id: "1" } });
  });

  it("includes meta when provided", () => {
    expect(toApiSuccessResponse([], { page: 1 })).toEqual({
      success: true,
      data: [],
      meta: { page: 1 },
    });
  });

  it("builds the error envelope for an AppError, preserving code/message", () => {
    const error = new ValidationError("Customer email is required.");
    expect(toApiErrorResponse(error)).toEqual({
      success: false,
      error: { code: "VALIDATION_ERROR", message: "Customer email is required." },
    });
  });

  it("never leaks a non-AppError's message to the response", () => {
    const error = new Error("some internal implementation detail");
    expect(toApiErrorResponse(error)).toEqual({
      success: false,
      error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred." },
    });
  });
});

describe("getStatusCode", () => {
  it("returns the AppError's statusCode", () => {
    expect(getStatusCode(new ValidationError("x"))).toBe(422);
  });

  it("defaults to 500 for anything else", () => {
    expect(getStatusCode(new Error("x"))).toBe(500);
    expect(getStatusCode("not an error")).toBe(500);
  });
});

describe("serializeError", () => {
  it("includes the stack by default outside production", () => {
    const serialized = serializeError(new ValidationError("bad input"));
    expect(serialized.stack).toBeDefined();
  });

  it("omits the stack when includeStack is false", () => {
    const serialized = serializeError(new ValidationError("bad input"), { includeStack: false });
    expect(serialized.stack).toBeUndefined();
  });

  it("handles a plain Error", () => {
    const serialized = serializeError(new Error("plain"));
    expect(serialized).toMatchObject({ name: "Error", message: "plain" });
  });

  it("handles a non-Error thrown value", () => {
    expect(serializeError("just a string")).toEqual({
      name: "UnknownError",
      message: "just a string",
    });
  });
});
