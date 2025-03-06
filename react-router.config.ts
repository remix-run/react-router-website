import type { Config } from "@react-router/dev/config";

declare module "react-router" {
  interface Future {
    unstable_middleware: true;
  }
}

export default {
  future: {
    unstable_optimizeDeps: true,
    unstable_middleware: true,
    unstable_splitRouteModules: "enforce",
  },
} satisfies Config;
