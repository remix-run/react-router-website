import { createFromReadableStream } from "@vitejs/plugin-rsc/ssr";
import { isbot } from "isbot";
import { renderToReadableStream } from "react-dom/server.edge";
import {
  unstable_routeRSCServerRequest as routeRSCServerRequest,
  unstable_RSCStaticRouter as RSCStaticRouter,
} from "react-router";
import subResourceIntegrity from "virtual:react-router/unstable_rsc/subresource-integrity";

const streamTimeout = 5_000;

export async function generateHTML(
  request: Request,
  serverResponse: Response,
): Promise<Response> {
  // Middleware can short-circuit rendering, e.g. to serve raw Markdown.
  // These responses are not Flight streams and must not be decoded as RSC.
  if (
    !serverResponse.headers.get("Content-Type")?.startsWith("text/x-component")
  ) {
    return serverResponse;
  }

  return routeRSCServerRequest({
    request,
    serverResponse,
    createFromReadableStream,
    async renderHTML(getPayload, options) {
      const payload = await getPayload();
      const formState =
        payload.type === "render" ? await payload.formState : undefined;
      const bootstrapScriptContent =
        await import.meta.viteRsc.loadBootstrapScriptContent("index");

      const body = await renderToReadableStream(
        <RSCStaticRouter getPayload={getPayload} />,
        {
          ...options,
          bootstrapScriptContent,
          formState,
          importMap: subResourceIntegrity
            ? { integrity: subResourceIntegrity }
            : undefined,
          signal: AbortSignal.any([
            request.signal,
            AbortSignal.timeout(streamTimeout + 1000),
          ]),
        },
      );

      // Crawlers need the complete document, including suspended content.
      if (isbot(request.headers.get("user-agent") || "")) {
        await body.allReady;
      }

      return body;
    },
  });
}
