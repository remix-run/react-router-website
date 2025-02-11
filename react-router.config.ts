import type { Config } from "@react-router/dev/config";

export default {
  future: {
    unstable_optimizeDeps: true,
    unstable_splitRouteModules: "enforce",
  },
} satisfies Config;
