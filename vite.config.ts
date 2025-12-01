import { reactRouter } from "@react-router/dev/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig(() => ({
  ssr: {
    noExternal: ["@docsearch/react"],
  },
  plugins: [reactRouter(), tsconfigPaths()],
}));
