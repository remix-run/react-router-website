import { unstable_reactRouterRSC as reactRouter } from "@react-router/dev/vite";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import rsc from "@vitejs/plugin-rsc";

export default defineConfig(() => ({
  resolve: {
    tsconfigPaths: true,
  },
  ssr: {
    noExternal: ["@docsearch/react"],
  },
  plugins: [reactRouter(), react(), rsc()],
}));
