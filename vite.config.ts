import { reactRouter } from "@react-router/dev/vite";
import { defineConfig } from "vite";

export default defineConfig(() => ({
  resolve: {
    tsconfigPaths: true,
  },
  ssr: {
    noExternal: ["@docsearch/react"],
  },
  plugins: [reactRouter()],
}));
