import { type RouteConfig } from "@react-router/dev/routes";
import { remixConfigRoutes } from "@react-router/remix-config-routes-adapter";

export const routes: RouteConfig = remixConfigRoutes(async (defineRoutes) => {
  // If you need to do async work, do it before calling `defineRoutes`, we use
  // the call stack of `route` inside to set nesting.
  return defineRoutes((route) => {
    route("/__components", "components/_playground/playground.tsx");
    route("/color-scheme", "actions/color-scheme.ts");

    route("/", "pages/home.tsx", { index: true });
    route("/brand", "pages/brand.tsx");
    route("/healthcheck", "pages/healthcheck.tsx");

    // Pre v7 inline API docs
    route("/en/:ref", "pages/guides-layout.tsx", { id: "v6-guides" }, () => {
      route("", "pages/guides-index.tsx", {
        index: true,
        id: "v6-index",
      });
      route("*", "pages/guide.tsx", { id: "v6-guide" });
    });

    route("/v6/*", "pages/redirect-v6-doc.tsx");
    route("/v7/api/:pkg/*", "pages/redirect-v7-doc.tsx");
    route("/v7/guides/*", "pages/redirect-v7-doc.tsx", {
      id: "v7-guides-redirect",
    });

    route("/:ref?/guides", "pages/guides-layout.tsx", { id: "guides" }, () => {
      route("", "pages/guides-index.tsx", { index: true });
      route("*", "pages/guide.tsx");
    });

    // TODO: uncomment after v7
    // route("/:ref?/api", "pages/api-redirect.ts");

    route("/:ref?/api/:pkg", "pages/api-layout.tsx", { id: "api" }, () => {
      route("", "pages/api-index.tsx", { index: true });
      route("*", "pages/api-doc.tsx");
    });

    route("/*", "pages/notfound.tsx");
  });
});
