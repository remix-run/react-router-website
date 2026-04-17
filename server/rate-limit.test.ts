import { vi } from "vitest";

import { CLIENT_ADDRESS_HEADER } from "./client-address.ts";
import { rateLimit } from "./rate-limit.ts";

function createMockContext(
  overrides: {
    headers?: HeadersInit;
    method?: string;
    pathname?: string;
    search?: string;
  } = {},
) {
  let {
    headers = {},
    method = "GET",
    pathname = "/",
    search = "",
  } = overrides;
  let url = new URL(`${pathname}${search}`, "http://localhost");
  let request = new Request(url.toString(), { method, headers });

  return {
    headers: request.headers,
    request,
    url: new URL(request.url),
  };
}

function createNext(responseBody = "OK") {
  return vi.fn(() => Promise.resolve(new Response(responseBody)));
}

type TestContext = ReturnType<typeof createMockContext>;
type TestNext = ReturnType<typeof createNext>;
type RateLimitMiddleware = ReturnType<typeof rateLimit>;

function invokeRateLimit(
  middleware: RateLimitMiddleware,
  context: TestContext,
  next: TestNext,
) {
  return middleware(
    context as unknown as Parameters<RateLimitMiddleware>[0],
    next as unknown as Parameters<RateLimitMiddleware>[1],
  );
}

function requireResponse(response: Response | void | undefined): Response {
  if (!(response instanceof Response)) {
    throw new Error("Expected middleware to return a response");
  }

  return response;
}

describe("rateLimit", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T00:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns 429 and rate limit headers when the limit is exceeded", async () => {
    let middleware = rateLimit({ max: 1, windowMs: 60_000 });
    let next = createNext();

    let first = requireResponse(
      await invokeRateLimit(
      middleware,
      createMockContext({
        headers: { "x-forwarded-for": "203.0.113.10" },
      }),
      next,
    ),
    );
    let second = requireResponse(
      await invokeRateLimit(
      middleware,
      createMockContext({
        headers: { "x-forwarded-for": "203.0.113.10" },
      }),
      next,
    ),
    );

    expect(first.status).toBe(200);
    expect(first.headers.get("RateLimit")).toBe(
      "limit=1, remaining=0, reset=60",
    );
    expect(first.headers.get("RateLimit-Policy")).toBe("1;w=60");
    expect(second.status).toBe(429);
    expect(second.headers.get("Retry-After")).toBe("60");
    expect(second.headers.get("RateLimit")).toBe(
      "limit=1, remaining=0, reset=60",
    );
    expect(next).toHaveBeenCalledTimes(1);
  });

  it("tracks forwarded IPs separately", async () => {
    let middleware = rateLimit({ max: 1, windowMs: 60_000 });
    let next = createNext();

    await invokeRateLimit(
      middleware,
      createMockContext({
        headers: { "x-forwarded-for": "192.0.2.1" },
      }),
      next,
    );
    let blocked = requireResponse(
      await invokeRateLimit(
      middleware,
      createMockContext({
        headers: { "x-forwarded-for": "192.0.2.1" },
      }),
      next,
    ),
    );
    let allowed = requireResponse(
      await invokeRateLimit(
      middleware,
      createMockContext({
        headers: { "x-forwarded-for": "192.0.2.2" },
      }),
      next,
    ),
    );

    expect(blocked.status).toBe(429);
    expect(allowed.status).toBe(200);
    expect(next).toHaveBeenCalledTimes(2);
  });

  it("uses the injected client address when proxy headers are absent", async () => {
    let middleware = rateLimit({ max: 1, windowMs: 60_000 });
    let next = createNext();

    await invokeRateLimit(
      middleware,
      createMockContext({
        headers: { [CLIENT_ADDRESS_HEADER]: "198.51.100.20" },
      }),
      next,
    );
    let blocked = requireResponse(
      await invokeRateLimit(
      middleware,
      createMockContext({
        headers: { [CLIENT_ADDRESS_HEADER]: "198.51.100.20" },
      }),
      next,
    ),
    );
    let allowed = requireResponse(
      await invokeRateLimit(
      middleware,
      createMockContext({
        headers: { [CLIENT_ADDRESS_HEADER]: "198.51.100.21" },
      }),
      next,
    ),
    );

    expect(blocked.status).toBe(429);
    expect(allowed.status).toBe(200);
    expect(next).toHaveBeenCalledTimes(2);
  });

  it("supports skipping selected requests", async () => {
    let middleware = rateLimit({
      max: 1,
      windowMs: 60_000,
      skip: (context) => context.url.pathname === "/healthcheck",
    });
    let next = createNext();

    let first = requireResponse(
      await invokeRateLimit(
      middleware,
      createMockContext({
        pathname: "/healthcheck",
        headers: { [CLIENT_ADDRESS_HEADER]: "198.51.100.20" },
      }),
      next,
    ),
    );
    let second = requireResponse(
      await invokeRateLimit(
      middleware,
      createMockContext({
        pathname: "/healthcheck",
        headers: { [CLIENT_ADDRESS_HEADER]: "198.51.100.20" },
      }),
      next,
    ),
    );

    expect(first.status).toBe(200);
    expect(second.status).toBe(200);
    expect(next).toHaveBeenCalledTimes(2);
  });
});
