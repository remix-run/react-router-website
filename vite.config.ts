import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig, splitVendorChunkPlugin } from "vite";
import { installGlobals } from "@remix-run/node";
import tsconfigPaths from "vite-tsconfig-paths";

installGlobals();

export default defineConfig({
  ssr: {
    noExternal: ["@docsearch/react"],
  },
  server: {
    port: 3000,
  },
  plugins: [
    splitVendorChunkPlugin(),
    remix({
      future: {
        unstable_singleFetch: true,
      },
      routes(defineRoutes) {
        return defineRoutes((route) => {
          route("/__components", "components/_playground/playground.tsx");
          route("/color-scheme", "actions/color-scheme.ts");

          route("/brand", "pages/brand.tsx");
          route("/healthcheck", "pages/healthcheck.tsx");

          route(
            "/:ref?/guides",
            "pages/guides-layout.tsx",
            { id: "guides" },
            () => {
              route("", "pages/guides-index.tsx", { index: true });
              route("*", "pages/guide.tsx");
            }
          );

          route("/:ref?/api", "pages/api-redirect.ts");

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
