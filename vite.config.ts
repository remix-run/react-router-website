import { reactRouter } from "@react-router/dev/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { visualizer } from "rollup-plugin-visualizer";
import { analyzer } from "vite-bundle-analyzer";

export default defineConfig(({ isSsrBuild }) => {
  const plugins = [reactRouter(), tsconfigPaths()];

  // Add bundle analyzer plugins when ANALYZE env var is set
  if (process.env.ANALYZE && !isSsrBuild) {
    plugins.push(
      visualizer({
        filename: "build/client/stats.html",
        open: false,
        gzipSize: true,
        brotliSize: true,
        template: "treemap",
      }),
      analyzer({
        analyzerMode: "static",
        fileName: "bundle-report.html",
        openAnalyzer: false,
      }),
    );
  }

  return {
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
    plugins,
  };
});
