import { redirect, type MiddlewareFunction } from "react-router";

export const ensureSecure: MiddlewareFunction = async ({
  request,
  unstable_url,
}) => {
  let proto = request.headers.get("x-forwarded-proto");
  // this indirectly allows `http://localhost` because there is no
  // "x-forwarded-proto" in the local server headers
  if (proto === "http") {
    let secureUrl = new URL(unstable_url);
    secureUrl.protocol = "https:";
    throw redirect(secureUrl.toString());
  }
};
