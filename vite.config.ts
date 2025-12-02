import { reactRouter } from "@react-router/dev/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig(() => ({
  environments: {
    ssr: {
      build: {
        rollupOptions: {
          input: "./server/app.ts",
        },
      },
    },
  },
  ssr: {
    noExternal: ["@docsearch/react"],
  },
  plugins: [reactRouter(), tsconfigPaths()],
}));
