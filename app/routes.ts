import { type RouteConfig, route, index } from "@react-router/dev/routes";

const routes: RouteConfig = [
  index("pages/splash.tsx"),
  route("/brand", "pages/brand.tsx"),
  route("/healthcheck", "pages/healthcheck.tsx"),
  route("/color-scheme", "actions/color-scheme.ts"),

  route("", "pages/docs-layout.tsx", { id: "docs" }, [
    route("home", "pages/doc.tsx", { id: "home" }),
    route("changelog", "pages/doc.tsx", { id: "changelog" }),
    route("*", "pages/doc.tsx"),
  ]),

  // short version URLs for changelogs and stuff
  route("/v6/*", "pages/redirect-major-version.tsx", { id: "v6-redirect" }),
  route("/v7/*", "pages/redirect-major-version.tsx", { id: "v7-redirect" }),

  // This route primarily exists to support the old v6 index page and to
  // redirect to the new docs at /home
  route("/:ref", "pages/docs-layout.tsx", { id: "v6-index-layout" }, [
    index("pages/docs-home.tsx", {
      id: "v6-index",
    }),
  ]),
];

if (process.env.NODE_ENV === "development") {
  routes.push(route("/__playground", "components/_playground/playground.tsx"));
}

export default routes;
