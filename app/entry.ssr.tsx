import { createFromReadableStream } from "@vitejs/plugin-rsc/ssr";
import { isbot } from "isbot";
import type { ReactFormState } from "react-dom/client";
import { renderToReadableStream } from "react-dom/server.edge";
import {
  unstable_routeRSCServerRequest as routeRSCServerRequest,
  unstable_RSCStaticRouter as RSCStaticRouter,
} from "react-router";

export async function generateHTML(
  request: Request,
  serverResponse: Response,
): Promise<Response> {
  const userAgent = request.headers.get("user-agent") || "";

  return await routeRSCServerRequest({
    // The incoming request.
    request,
    // The response from the RSC server.
    serverResponse,
    // Provide the React Server touchpoints.
    createFromReadableStream,
    // Render the router to HTML.
    async renderHTML(getPayload, options) {
      const payload = await getPayload();
      const formState =
        payload.type === "render"
          ? ((await payload.formState) as ReactFormState)
          : undefined;

      const bootstrapScriptContent =
        await import.meta.viteRsc.loadBootstrapScriptContent("index");

      const htmlStream = await renderToReadableStream(
        <RSCStaticRouter getPayload={getPayload} />,
        {
          ...options,
          bootstrapScriptContent,
          formState,
          signal: request.signal,
        },
      );

      // if (isbot(userAgent)) {
      //   await htmlStream.allReady;
      // }

      return htmlStream;
    },
  });
}
