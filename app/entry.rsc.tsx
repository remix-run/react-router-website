import {
  createTemporaryReferenceSet,
  decodeAction,
  decodeFormState,
  decodeReply,
  loadServerAction,
  renderToReadableStream,
} from "@vitejs/plugin-rsc/rsc";
import {
  isRouteErrorResponse,
  type RouterContextProvider,
  unstable_matchRSCServerRequest as matchRSCServerRequest,
} from "react-router";
import routes from "virtual:react-router/unstable_rsc/routes";
import routeDiscovery from "virtual:react-router/unstable_rsc/route-discovery";
import basename from "virtual:react-router/unstable_rsc/basename";
import clientVersion from "virtual:react-router/unstable_rsc/client-version";
import unstable_reactRouterServeConfig from "virtual:react-router/unstable_rsc/react-router-serve-config";

export { unstable_reactRouterServeConfig };

export function fetchServer(
  request: Request,
  requestContext?: RouterContextProvider,
) {
  return matchRSCServerRequest({
    basename,
    createTemporaryReferenceSet,
    decodeAction,
    decodeFormState,
    decodeReply,
    loadServerAction,
    clientVersion,
    request,
    requestContext,
    routes,
    routeDiscovery,
    onError(error) {
      // Aborted requests and missing pages are expected bot noise.
      if (request.signal.aborted) return;
      if (isRouteErrorResponse(error) && error.status === 404) return;
      console.error(error);
    },
    generateResponse(match, options) {
      match.headers.set("Content-Type", "text/x-component");
      return new Response(renderToReadableStream(match.payload, options), {
        status: match.statusCode,
        headers: match.headers,
      });
    },
  });
}

export default {
  async fetch(request: Request, requestContext?: RouterContextProvider) {
    const ssr = await import.meta.viteRsc.loadModule<
      typeof import("./entry.ssr.tsx")
    >("ssr", "index");

    return ssr.generateHTML(
      request,
      await fetchServer(request, requestContext),
    );
  },
};

if (import.meta.hot) {
  import.meta.hot.accept();
}
