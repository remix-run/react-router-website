import type { Config } from "@react-router/dev/config";

export default {
  splitRouteModules: "enforce",
  future: {
    unstable_optimizeDeps: true,
  },
} satisfies Config;
