import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig, splitVendorChunkPlugin } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  ssr: {
    noExternal: ["@docsearch/react"],
  },
  server: {
    port: 3000,
  },
  plugins: [
    splitVendorChunkPlugin(),
    remix({
      future: {
        v3_throwAbortReason: true,
        v3_fetcherPersist: true,
        v3_relativeSplatPath: true,
      },
    }),
    tsconfigPaths(),
  ],
});
