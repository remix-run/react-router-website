"use server";

import { replace, unstable_getRequest as getRequest } from "react-router";
import { setPendingColorScheme } from "./server";
import { getColorScheme } from "./utils";

export async function setColorScheme(formData: FormData) {
  let colorScheme = getColorScheme(formData);
  if (!colorScheme) return;

  setPendingColorScheme(colorScheme);

  // Without JavaScript the form posts to the page itself, so redirect back to
  // it so a refresh doesn't resubmit. With JavaScript (`rsc-action-id`), the
  // loaders reload in place, which keeps the scroll position.
  let request = getRequest();
  if (!request.headers.has("rsc-action-id")) {
    let url = new URL(request.url);
    replace(url.pathname + url.search);
  }
}
