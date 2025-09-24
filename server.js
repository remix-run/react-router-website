import compression from "compression";
import express from "express";
import morgan from "morgan";
import { rateLimit } from "express-rate-limit";
import { createRequestListener } from "@remix-run/node-fetch-server";

// Short-circuit the type-checking of the built output.
const BUILD_PATH = "./build/server/index.js";
const DEVELOPMENT = process.env.NODE_ENV === "development";
const PORT = Number.parseInt(process.env.PORT || "3000");

const app = express();

if (DEVELOPMENT) {
  console.log("Starting development server");
  const viteDevServer = await import("vite").then(({ createServer }) =>
    createServer({
      server: {
        middlewareMode: true,
      },
    }),
  );
  app.use(viteDevServer.middlewares);
} else {
  console.log("Starting production server");

  const limiter = rateLimit({
    windowMs: 2 * 60 * 1000, // 2 minutes
    max: 1000,
    standardHeaders: true,
    legacyHeaders: false,
  });

  app.use(limiter);

  app.use(compression());
  app.disable("x-powered-by");

  app.use(
    "/assets",
    express.static("build/client/assets", { immutable: true, maxAge: "1y" }),
  );
  app.use(
    // browser 1 hour, server 1 year
    express.static("build/client", {
      setHeaders: (res) => {
        res.setHeader(
          "Cache-Control",
          "public, max-age=3600, s-maxage=31536000",
        );
      },
    }),
  );
  let build = await import(BUILD_PATH);
  app.all("*", createRequestListener(build.default));
}

app.use(morgan("tiny"));

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
