import http from "node:http";
import { fileURLToPath } from "node:url";
import { constants as zlibConstants } from "node:zlib";

import { createRequestListener } from "@remix-run/node-fetch-server";
import { createRouter } from "@remix-run/fetch-router";
import { staticFiles } from "@remix-run/static-middleware";
import { logger } from "@remix-run/logger-middleware";
import { compression } from "@remix-run/compression-middleware";
import { createRequestHandler } from "react-router";

import { withClientAddress } from "./server/client-address.ts";
import { rateLimit } from "./server/rate-limit.ts";

const PORT = Number.parseInt(process.env.PORT || "3000", 10);
const MODE = process.env.NODE_ENV === "test" ? "test" : "production";
const CLIENT_BUILD_DIR = fileURLToPath(
  new URL("./build/client/", import.meta.url),
);
const SERVER_BUILD_PATH = "./build/server/index.js";

const handleAppRequest = createRequestHandler(
  () => import(SERVER_BUILD_PATH),
  MODE,
);

function isStreamingHtmlResponse(response: Response) {
  const contentType = response.headers.get("Content-Type");

  return (
    contentType?.startsWith("text/html") === true &&
    !response.headers.has("Content-Length")
  );
}

const middleware = [];

middleware.push(
  rateLimit({
    windowMs: 2 * 60 * 1000,
    max: 1000,
  }),
);
middleware.push(
  logger({
    format: "%method %path %status %contentLength - %duration ms",
  }),
);
middleware.push(
  compression({
    encodings(response) {
      return isStreamingHtmlResponse(response)
        ? ["gzip"]
        : ["br", "gzip", "deflate"];
    },
    zlib(response) {
      return isStreamingHtmlResponse(response)
        ? { flush: zlibConstants.Z_SYNC_FLUSH }
        : {};
    },
  }),
);
middleware.push(
  staticFiles(CLIENT_BUILD_DIR, {
    filter(path) {
      return path.startsWith("assets/");
    },
    cacheControl: "public, max-age=31536000, immutable",
  }),
);
middleware.push(
  staticFiles(CLIENT_BUILD_DIR, {
    filter(path) {
      return !path.startsWith("assets/");
    },
    cacheControl: "public, max-age=3600, s-maxage=31536000",
  }),
);

const router = createRouter({
  defaultHandler: ({ request }) => handleAppRequest(request),
  middleware,
});

const server = http.createServer(
  createRequestListener(async (request, client) => {
    try {
      return await router.fetch(withClientAddress(request, client.address));
    } catch (error) {
      console.error(error);
      return new Response("Internal Server Error", { status: 500 });
    }
  }),
);

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
