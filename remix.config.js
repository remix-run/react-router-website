/** @type {import('@remix-run/dev').AppConfig} */
module.exports = {
  cacheDirectory: "./node_modules/.cache/remix",
  future: {
    v2_routeConvention: true,
    v2_meta: true,
    v2_normalizeFormMethod: true,
    v2_dev: true,
  },
  postcss: true,
  tailwind: true,
  serverModuleFormat: "cjs",
};
