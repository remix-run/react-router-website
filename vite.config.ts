import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig, splitVendorChunkPlugin } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

declare module "@remix-run/node" {
  interface Future {
    v3_singleFetch: true;
  }
}

export default defineConfig({
  ssr: {
    noExternal: ["@docsearch/react"],
  },
  server: {
    port: 3000,
    host: "0.0.0.0",
  },
  plugins: [
    splitVendorChunkPlugin(),
    remix({
      future: {
        v3_throwAbortReason: true,
        v3_fetcherPersist: true,
        v3_relativeSplatPath: true,
        v3_singleFetch: true,
        v3_lazyRouteDiscovery: true,
        unstable_routeConfig: true,
        unstable_optimizeDeps: true,
      },
    }),
    tsconfigPaths(),
  ],
});
