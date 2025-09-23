import { createCookie } from "react-router";
import type { ColorScheme } from "./utils";

let cookie = createCookie("color-scheme", {
  maxAge: 34560000,
  sameSite: "lax",
});

export async function parseColorScheme(request: Request) {
  const header = request.headers.get("Cookie");
  const vals = await cookie.parse(header);
  return vals ? vals.colorScheme : "system";
}

export function serializeColorScheme(colorScheme: ColorScheme) {
  let eatCookie = colorScheme === "system";
  if (eatCookie) {
    return cookie.serialize({}, { expires: new Date(0), maxAge: 0 });
  } else {
    return cookie.serialize({ colorScheme });
  }
}
