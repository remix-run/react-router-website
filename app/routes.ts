import { type RouteConfig, route, index } from "@react-router/dev/routes";

const routes: RouteConfig = [
  index("pages/splash.tsx"),
  route("/brand", "pages/brand.tsx"),
  route("/healthcheck", "pages/healthcheck.tsx"),
  route("/color-scheme", "actions/color-scheme/route.ts"),

  route("", "pages/docs-layout.tsx", { id: "docs" }, [
    route("home.md", "pages/doc.tsx", { id: "home-md" }),
    route("home", "pages/doc.tsx", { id: "home" }),
    route("changelog.md", "pages/doc.tsx", { id: "changelog-md" }),
    route("changelog", "pages/doc.tsx", { id: "changelog" }),
    route("*", "pages/doc.tsx"),
  ]),

  // This route primarily exists to support the old v6 index page and to
  // redirect to the new docs at /home
  route("/:ref", "pages/docs-layout.tsx", { id: "v6-index-layout" }, [
    index("pages/docs-v6-index.tsx", {
      id: "v6-index",
    }),
  ]),
];

if (process.env.NODE_ENV === "development") {
  routes.push(route("/__playground", "components/_playground/playground.tsx"));
}

export default routes;
