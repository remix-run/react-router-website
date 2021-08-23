module.exports = {
  appDirectory: "app",
  browserBuildDirectory: "public/build",
  publicPath: "/build/",
  serverBuildDirectory: "server/build",
  devServerPort: 8002,
  routes(defineRoutes) {
    return defineRoutes((route) => {
      route("docs/lang", "docs/routes/redirect.tsx");
      route("docs/:lang/:version", "docs/routes/version.tsx", () => {
        route("/", "docs/routes/index.tsx");
        route("*", "docs/routes/splat.tsx");
      });
    });
  },
};
