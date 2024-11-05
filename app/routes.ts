import { type RouteConfig } from "@remix-run/route-config";
import { remixRoutesOptionAdapter } from "@remix-run/routes-option-adapter";

export const routes: RouteConfig = await remixRoutesOptionAdapter(
  (defineRoutes) => {
    return defineRoutes((route) => {
      route("/__components", "components/_playground/playground.tsx");
      route("/color-scheme", "actions/color-scheme.ts");

      route("/", "pages/home.tsx", { index: true });
      route("/brand", "pages/brand.tsx");
      route("/healthcheck", "pages/healthcheck.tsx");

      // Pre v7 inline API docs
      route("/en/:ref", "pages/docs-layout.tsx", { id: "v6-guides" }, () => {
        route("", "pages/docs-index.tsx", {
          index: true,
          id: "v6-index",
        });
        route("*", "pages/doc.tsx", { id: "v6-guide" });
      });

      route("/v6/*", "pages/redirect-v6-doc.tsx");
      route("/v7/api/:pkg/*", "pages/redirect-v7-doc.tsx");
      route("/v7/docs/*", "pages/redirect-v7-doc.tsx", {
        id: "v7-docs-redirect",
      });

      route("/:ref?/docs", "pages/docs-layout.tsx", { id: "docs" }, () => {
        route("", "pages/docs-index.tsx", { index: true });
        route("*", "pages/doc.tsx");
      });

      // TODO: uncomment after v7
      // route("/:ref?/api", "pages/api-redirect.ts");

      route("/:ref?/api/:pkg", "pages/api-layout.tsx", { id: "api" }, () => {
        route("", "pages/api-index.tsx", { index: true });
        route("*", "pages/api-doc.tsx");
      });

      route("/*", "pages/notfound.tsx");
    });
  }
);
