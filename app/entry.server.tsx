import type { HandleDocumentRequestFunction } from "@remix-run/node";
import { RemixServer } from "@remix-run/react";
import { renderToString } from "react-dom/server";
import { Entry } from "./entry";

let handleDocumentRequest: HandleDocumentRequestFunction = async (
  request,
  responseStatusCode,
  responseHeaders,
  remixContext
) => {
  const markup = renderToString(
    <Entry context={remixContext}>
      <RemixServer context={remixContext} url={request.url} />
    </Entry>
  );

  responseHeaders.set("Content-Type", "text/html");

  return new Response("<!DOCTYPE html>" + markup, {
    status: responseStatusCode,
    headers: responseHeaders,
  });
};

export default handleDocumentRequest;
