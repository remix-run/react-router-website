// const { flatRoutes } = require("remix-flat-routes");

/**
 * @type {import('@remix-run/dev').AppConfig}
 */
module.exports = {
  cacheDirectory: "./node_modules/.cache/remix",
  devServerBroadcastDelay: 500,
  // ignoredRouteFiles: ["**/.*", "**/*.css", "**/*.test.{js,jsx,ts,tsx}"],
  // ignoredRouteFiles: ["**/*"],
  // routes: async (defineRoutes) => {
  //   return flatRoutes("flatroutes", defineRoutes);
  // },
};
