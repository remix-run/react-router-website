/** @type {import('@remix-run/dev').AppConfig} */
module.exports = {
  cacheDirectory: "./node_modules/.cache/remix",
  devServerBroadcastDelay: 500,
  future: {
    v2_routeConvention: true,
    v2_meta: true,
  },
  postcss: true,
  tailwind: true,
};
