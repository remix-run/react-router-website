import { redirect, type MiddlewareFunction } from "react-router";

export const ensureSecure: MiddlewareFunction = async ({ request, url }) => {
  let proto = request.headers.get("x-forwarded-proto");
  // this indirectly allows `http://localhost` because there is no
  // "x-forwarded-proto" in the local server headers
  if (proto === "http") {
    let secureUrl = new URL(url);
    secureUrl.protocol = "https:";
    throw redirect(secureUrl.toString());
  }
};
