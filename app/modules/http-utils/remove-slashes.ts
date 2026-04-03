import { redirect, type MiddlewareFunction } from "react-router";

export const removeTrailingSlashes: MiddlewareFunction = async ({
  unstable_url,
}) => {
  let url = new URL(unstable_url);
  if (url.pathname.endsWith("/") && url.pathname !== "/") {
    url.pathname = url.pathname.slice(0, -1);
    throw redirect(url.toString());
  }
};
