"use server";

import { replace, unstable_getRequest as getRequest } from "react-router";
import { serializeColorScheme } from "./server";
import { getColorScheme } from "./utils";

export async function setColorScheme(formData: FormData) {
  let colorScheme = getColorScheme(formData);
  if (!colorScheme) return;

  // Server functions can't set response headers directly, so redirect back to
  // the current page with the cookie attached. Calling `replace` inside a
  // server function registers the redirect; throwing it as well would send
  // `Set-Cookie` twice.
  let url = new URL(getRequest().url);
  replace(url.pathname + url.search, {
    headers: { "Set-Cookie": await serializeColorScheme(colorScheme) },
  });
}
