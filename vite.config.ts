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
        v3_optimizeDeps: true,
      },
      routes(defineRoutes) {
        return defineRoutes((route) => {
          route("/__components", "components/_playground/playground.tsx");
          route("/color-scheme", "actions/color-scheme.ts");

          route("/", "pages/home.tsx", { index: true });
          route("/brand", "pages/brand.tsx");
          route("/healthcheck", "pages/healthcheck.tsx");

          // Pre v7 inline API docs
          route(
            "/en/:ref",
            "pages/guides-layout.tsx",
            { id: "v6-guides" },
            () => {
              route("", "pages/guides-index.tsx", {
                index: true,
                id: "v6-index",
              });
              route("*", "pages/guide.tsx", { id: "v6-guide" });
            }
          );

          route("/v6/*", "pages/redirect-v6-doc.tsx");
          route("/v7/api/:pkg/*", "pages/redirect-v7-doc.tsx");
          route("/v7/guides/*", "pages/redirect-v7-doc.tsx", {
            id: "v7-guides-redirect",
          });

          route(
            "/:ref?/guides",
            "pages/guides-layout.tsx",
            { id: "guides" },
            () => {
              route("", "pages/guides-index.tsx", { index: true });
              route("*", "pages/guide.tsx");
            }
          );

          // TODO: uncomment after v7
          // route("/:ref?/api", "pages/api-redirect.ts");

          route(
            "/:ref?/api/:pkg",
            "pages/api-layout.tsx",
            { id: "api" },
            () => {
              route("", "pages/api-index.tsx", { index: true });
              route("*", "pages/api-doc.tsx");
            }
          );

          route("/*", "pages/notfound.tsx");
        });
      },
    }),
    tsconfigPaths(),
  ],
});
