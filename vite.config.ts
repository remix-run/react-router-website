import { vitePlugin as remix } from "@remix-run/dev";
import { installGlobals } from "@remix-run/node";
import { defineConfig, splitVendorChunkPlugin } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

declare module "@remix-run/node" {
  interface Future {
    v3_singleFetch: true;
  }
}

installGlobals({ nativeFetch: true });

export default defineConfig({
  ssr: {
    noExternal: ["@docsearch/react"],
  },
  server: {
    port: 3000,
    host: "0.0.0.0",
  },
  plugins: [
    splitVendorChunkPlugin(),
    remix({
      future: {
        v3_throwAbortReason: true,
        v3_fetcherPersist: true,
        v3_relativeSplatPath: true,
        v3_singleFetch: true,
        v3_lazyRouteDiscovery: true,
        unstable_optimizeDeps: true,
      },
      routes(defineRoutes) {
        return defineRoutes((route) => {
          route("/", "pages/home.tsx", { index: true });
          route("/brand", "pages/brand.tsx");
          route("/healthcheck", "pages/healthcheck.tsx");
          route("/color-scheme", "actions/color-scheme.ts");

          route("/:ref?", "pages/docs-layout.tsx", { id: "docs" }, () => {
            route("", "pages/docs-index.tsx", { index: true });
            route("*", "pages/doc.tsx");
          });

          route("/*", "pages/notfound.tsx");

          if (process.env.NODE_ENV === "development") {
            route("/__playground", "components/_playground/playground.tsx");
          }

          // short version URLs for changelogs and stuff
          route("/v6/*", "pages/redirect-v6-doc.tsx");
          route("/v7/*", "pages/redirect-v7-doc.tsx");

          // v6 URLs before the api reference docs
          route("/en/:ref", "pages/docs-layout.tsx", { id: "v6-docs" }, () => {
            route("", "pages/docs-index.tsx", {
              index: true,
              id: "v6-index",
            });
            route("*", "pages/doc.tsx", { id: "v6-guide" });
          });
        });
      },
    }),
    tsconfigPaths(),
  ],
});
