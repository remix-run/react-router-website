import { createCookie } from "react-router";

export type ColorScheme = "dark" | "light" | "system";

let cookie = createCookie("color-scheme", {
  maxAge: 34560000,
  sameSite: "lax",
});

export async function parseColorScheme(request: Request): Promise<ColorScheme> {
  const header = request.headers.get("Cookie");
  const vals = await cookie.parse(header);
  return ["dark", "light", "system"].includes(vals.colorScheme)
    ? vals.colorScheme
    : "system";
}

export function serializeColorScheme(colorScheme: ColorScheme) {
  let eatCookie = colorScheme === "system";
  if (eatCookie) {
    return cookie.serialize({}, { expires: new Date(0), maxAge: 0 });
  } else {
    return cookie.serialize({ colorScheme });
  }
}
