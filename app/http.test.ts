import { describe, it, expect, vi } from "vitest";
import { CACHE_CONTROL, setDocCacheControl } from "~/http";
import {
  DocNotFoundError,
  toDocErrorResponse,
} from "~/modules/gh-docs/.server/errors";

describe("setDocCacheControl", () => {
  it("caches successful responses", () => {
    let headers = setDocCacheControl(new Headers());
    expect(headers.get("cache-control")).toBe(CACHE_CONTROL.doc);
  });

  it("does not cache errors and keeps Retry-After", () => {
    let headers = setDocCacheControl(
      new Headers({ "Cache-Control": CACHE_CONTROL.doc }),
      new Headers({ "Retry-After": "30" }),
    );
    expect(headers.get("cache-control")).toBe(CACHE_CONTROL.none);
    expect(headers.get("retry-after")).toBe("30");
  });
});

describe("toDocErrorResponse", () => {
  it("maps not found to a 404", () => {
    let res = toDocErrorResponse(new DocNotFoundError("nope"));
    expect(res.status).toBe(404);
    expect(res.headers.get("cache-control")).toBe(CACHE_CONTROL.none);
  });

  it("maps other errors to a 503", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    let res = toDocErrorResponse(new Error("timeout"));
    expect(res.status).toBe(503);
    expect(res.headers.get("cache-control")).toBe(CACHE_CONTROL.none);
    expect(res.headers.get("retry-after")).toBe("30");
  });

  it("passes Responses through", () => {
    let res = new Response(null, { status: 418 });
    expect(toDocErrorResponse(res)).toBe(res);
  });
});
