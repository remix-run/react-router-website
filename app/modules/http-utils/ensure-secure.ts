import { redirect, type unstable_MiddlewareFunction } from "react-router";

export const ensureSecure: unstable_MiddlewareFunction = async ({
  request,
}) => {
  let proto = request.headers.get("x-forwarded-proto");
  // this indirectly allows `http://localhost` because there is no
  // "x-forwarded-proto" in the local server headers
  if (proto === "http") {
    let secureUrl = new URL(request.url);
    secureUrl.protocol = "https:";
    throw redirect(secureUrl.toString());
  }
};
