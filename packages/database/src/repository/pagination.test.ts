import { describe, expect, it } from "vitest";
import { buildPaginationMeta, normalizePagination } from "./pagination";

describe("normalizePagination", () => {
  it("defaults to page 1, pageSize 25", () => {
    expect(normalizePagination({})).toEqual({ page: 1, pageSize: 25, offset: 0 });
  });

  it("computes offset from page and pageSize", () => {
    expect(normalizePagination({ page: 3, pageSize: 10 })).toEqual({
      page: 3,
      pageSize: 10,
      offset: 20,
    });
  });

  it("clamps page below 1 up to 1", () => {
    expect(normalizePagination({ page: 0 })).toMatchObject({ page: 1 });
    expect(normalizePagination({ page: -5 })).toMatchObject({ page: 1 });
  });

  it("clamps pageSize above the max down to 100", () => {
    expect(normalizePagination({ pageSize: 500 })).toMatchObject({ pageSize: 100 });
  });

  it("clamps pageSize below 1 up to 1", () => {
    expect(normalizePagination({ pageSize: 0 })).toMatchObject({ pageSize: 1 });
  });
});

describe("buildPaginationMeta", () => {
  it("computes totalPages from totalItems and pageSize", () => {
    expect(buildPaginationMeta(1, 25, 142)).toEqual({
      page: 1,
      pageSize: 25,
      totalItems: 142,
      totalPages: 6,
    });
  });

  it("reports at least 1 total page even when there are zero items", () => {
    expect(buildPaginationMeta(1, 25, 0)).toMatchObject({ totalPages: 1 });
  });
});
