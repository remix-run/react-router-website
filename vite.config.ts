import { unstable_reactRouterRSC as reactRouterRSC } from "@react-router/dev/vite";
import react from "@vitejs/plugin-react";
import rsc from "@vitejs/plugin-rsc";
import { defineConfig } from "vite";
import { denyImports } from "vite-env-only";

export default defineConfig(() => ({
  resolve: {
    tsconfigPaths: true,
  },
  ssr: {
    noExternal: ["@docsearch/react"],
  },
  plugins: [
    denyImports({
      client: { files: ["**/.server/**", "**/*.server.*"] },
    }),
    reactRouterRSC(),
    react(),
    rsc(),
  ],
}));
