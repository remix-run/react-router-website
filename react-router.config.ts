import type { Config } from "@react-router/dev/config";

export default {
  routeDiscovery: { mode: "initial" },
  subResourceIntegrity: true,
  future: {
    unstable_optimizeDeps: true,
  },
} satisfies Config;
