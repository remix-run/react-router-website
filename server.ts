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

const limiter = rateLimit({
  windowMs: 2 * 60 * 1000, // 2 minutes
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

// could use fastly's compression
// jk already done
app.use(compression());
app.disable("x-powered-by");

// TODO: use remix fetch server and remove development
// fetchServer.route('ANY', '*', build.fetch)

if (DEVELOPMENT) {
  console.log("Starting development server");
  const vite = await import("vite");
  const viteDevServer = await vite.createServer({
    server: { middlewareMode: true },
  });
  app.use(viteDevServer.middlewares);
  app.use(async (req, res, next) => {
    try {
      if (!vite.isRunnableDevEnvironment(viteDevServer.environments.rsc)) {
        throw new Error(
          "The development server is not running in an environment.",
        );
      }
      const rscConfigEntry = (
        viteDevServer.environments.rsc.config.build.rolldownOptions
          .input as Record<string, string>
      ).index;
      const entry =
        await viteDevServer.environments.rsc.pluginContainer.resolveId(
          rscConfigEntry,
        );
      if (!entry) throw new Error("Could not resolve entry point");
      const { default: build } =
        await viteDevServer.environments.rsc.runner.import<
          typeof import("./app/entry.rsc")
        >(entry.id);

      return createRequestListener(build.fetch)(req, res);
    } catch (error) {
      if (typeof error === "object" && error instanceof Error) {
        viteDevServer.ssrFixStacktrace(error);
      }
      next(error);
    }
  });
} else {
  console.log("Starting production server");
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
  const { default: build } = await import(BUILD_PATH);
  app.use(createRequestListener(build.fetch));
}

app.use(morgan("tiny"));

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
