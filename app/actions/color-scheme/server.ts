import { AsyncLocalStorage } from "node:async_hooks";
import { createCookie, type MiddlewareFunction } from "react-router";

import type { ColorScheme } from "./utils";

let cookie = createCookie("color-scheme", {
  maxAge: 34560000,
  sameSite: "lax",
});

// Server functions can't set response headers, so `setColorScheme` records the
// new value here. The middleware sets the cookie on the response, and the root
// loader reads it while loaders reload after the server function runs.
let pendingColorScheme = new AsyncLocalStorage<{ colorScheme?: ColorScheme }>();

export const colorSchemeMiddleware: MiddlewareFunction = async (_, next) => {
  let pending: { colorScheme?: ColorScheme } = {};
  let response = await pendingColorScheme.run(pending, next);
  if (pending.colorScheme && response instanceof Response) {
    response.headers.append(
      "Set-Cookie",
      await serializeColorScheme(pending.colorScheme),
    );
  }
  return response;
};

export function setPendingColorScheme(colorScheme: ColorScheme) {
  let pending = pendingColorScheme.getStore();
  if (!pending) throw new Error("Expected colorSchemeMiddleware");
  pending.colorScheme = colorScheme;
}

export async function parseColorScheme(request: Request): Promise<ColorScheme> {
  let pending = pendingColorScheme.getStore()?.colorScheme;
  if (pending) return pending;

  const header = request.headers.get("Cookie");
  const vals = await cookie.parse(header);
  return ["dark", "light", "system"].includes(vals?.colorScheme)
    ? vals.colorScheme
    : "system";
}

function serializeColorScheme(colorScheme: ColorScheme) {
  let eatCookie = colorScheme === "system";
  if (eatCookie) {
    return cookie.serialize({}, { expires: new Date(0), maxAge: 0 });
  } else {
    return cookie.serialize({ colorScheme });
  }
}
