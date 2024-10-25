import { createCookie, redirect } from "react-router";
import type { ActionFunction } from "react-router";
import type { ColorScheme } from "./types";

let cookie = createCookie("color-scheme", {
  maxAge: 34560000,
  sameSite: "lax",
});

export async function parseColorScheme(request: Request) {
  const header = request.headers.get("Cookie");
  const vals = await cookie.parse(header);
  return vals ? vals.colorScheme : "system";
}

function serializeColorScheme(colorScheme: "dark" | "light" | "system") {
  let eatCookie = colorScheme === "system";
  if (eatCookie) {
    return cookie.serialize({}, { expires: new Date(0), maxAge: 0 });
  } else {
    return cookie.serialize({ colorScheme });
  }
}

export function validateColorScheme(formValue: any): formValue is ColorScheme {
  return (
    formValue === "dark" || formValue === "light" || formValue === "system"
  );
}

export let action: ActionFunction = async ({ request }) => {
  let formData = await request.formData();
  let colorScheme = formData.get("colorScheme");
  let returnTo = safeRedirect(formData.get("returnTo"));

  if (!validateColorScheme(colorScheme)) {
    throw new Response("Bad Request", { status: 400 });
  }

  return redirect(returnTo || "/", {
    headers: { "Set-Cookie": await serializeColorScheme(colorScheme) },
  });
};

export function safeRedirect(
  to: FormDataEntryValue | string | null | undefined
) {
  if (!to || typeof to !== "string") {
    return "/";
  }

  if (!to.startsWith("/") || to.startsWith("//")) {
    return "/";
  }

  return to;
}
