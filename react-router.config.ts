import type { Config } from "@react-router/dev/config";

export default {
  future: {
    unstable_optimizeDeps: true,
    v8_splitRouteModules: "enforce",
    v8_middleware: true,
    v8_viteEnvironmentApi: true,
  },
} satisfies Config;
