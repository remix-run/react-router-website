import type { Middleware } from "@remix-run/fetch-router";

import { getClientAddressFromHeaders } from "./client-address.ts";

export interface RateLimitOptions {
  windowMs: number;
  max: number;
  keyGenerator?: (
    context: Parameters<Middleware>[0],
  ) => string | null | undefined;
  skip?: (context: Parameters<Middleware>[0]) => boolean;
}

type Bucket = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, Bucket>();
let requestsSinceCleanup = 0;

export function rateLimit(options: RateLimitOptions): Middleware {
  const { max, windowMs, keyGenerator = getClientKey, skip } = options;

  if (windowMs <= 0 || max <= 0) {
    throw new Error("rateLimit options `windowMs` and `max` must be > 0");
  }

  return async (context, next) => {
    if (skip?.(context)) {
      return next();
    }

    const now = Date.now();
    const key = keyGenerator(context)?.trim() || "unknown";
    const existing = buckets.get(key);

    let bucket: Bucket;
    if (!existing || existing.resetAt <= now) {
      bucket = {
        count: 0,
        resetAt: now + windowMs,
      };
      buckets.set(key, bucket);
    } else {
      bucket = existing;
    }

    bucket.count += 1;

    maybeCleanup(now);

    const remaining = Math.max(0, max - bucket.count);
    const resetSeconds = Math.max(0, Math.ceil((bucket.resetAt - now) / 1000));
    const rateLimitValue = `limit=${max}, remaining=${remaining}, reset=${resetSeconds}`;
    const rateLimitPolicyValue = `${max};w=${Math.ceil(windowMs / 1000)}`;

    if (bucket.count > max) {
      return withRateLimitHeaders(
        new Response("Too Many Requests", {
          status: 429,
          headers: {
            "Retry-After": String(resetSeconds),
          },
        }),
        rateLimitValue,
        rateLimitPolicyValue,
      );
    }

    const response = await next();
    return withRateLimitHeaders(response, rateLimitValue, rateLimitPolicyValue);
  };
}

function getClientKey({ headers }: Parameters<Middleware>[0]): string | null {
  return getClientAddressFromHeaders(headers);
}

function withRateLimitHeaders(
  response: Response,
  rateLimitValue: string,
  rateLimitPolicyValue: string,
): Response {
  const nextResponse = new Response(response.body, response);
  nextResponse.headers.set("RateLimit", rateLimitValue);
  nextResponse.headers.set("RateLimit-Policy", rateLimitPolicyValue);
  return nextResponse;
}

function maybeCleanup(now: number) {
  requestsSinceCleanup += 1;

  if (requestsSinceCleanup < 100) {
    return;
  }

  requestsSinceCleanup = 0;

  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) {
      buckets.delete(key);
    }
  }
}
