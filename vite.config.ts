import { reactRouter } from "@react-router/dev/vite";
import { defineConfig } from "vite";

export default defineConfig(() => ({
  resolve: {
    tsconfigPaths: true,
  },
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
  plugins: [reactRouter()],
}));
