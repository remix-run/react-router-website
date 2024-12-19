import { reactRouter } from "@react-router/dev/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import babel from "vite-plugin-babel";

export default defineConfig(({ isSsrBuild }) => ({
  build: {
    rollupOptions: isSsrBuild
      ? {
          input: "./server/app.ts",
        }
      : undefined,
  },
  ssr: {
    noExternal: ["@docsearch/react"],
  },
  plugins: [
    babel({
      filter: /app\/.*\.[jt]sx?$/,
      babelConfig: {
        presets: [
          "@babel/preset-typescript",
          ["@babel/preset-react", { runtime: "automatic" }],
        ],
        plugins: ["babel-plugin-react-compiler"],
      },
    }),
    reactRouter(),
    tsconfigPaths(),
  ],
}));
