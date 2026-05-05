import { redirect, type MiddlewareFunction } from "react-router";

export const removeTrailingSlashes: MiddlewareFunction = async ({ url }) => {
  if (url.pathname.endsWith("/") && url.pathname !== "/") {
    url = new URL(url);
    url.pathname = url.pathname.slice(0, -1);
    throw redirect(url.toString());
  }
};
