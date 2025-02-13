import type { Config } from "@react-router/dev/config";

export default {
  future: {
    turboV3: true,
    unstable_optimizeDeps: true,
    unstable_splitRouteModules: "enforce",
  },
} satisfies Config;
