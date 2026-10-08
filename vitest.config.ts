/// <reference types="vitest" />
/// <reference types="vitest/globals" />

import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  plugins: [react()],
  test: {
    alias: {
      "virtual:react-router/unstable_rsc/subresource-integrity": fileURLToPath(
        new URL("./test/rsc-subresource-integrity.ts", import.meta.url),
      ),
    },
    globals: true,
    environment: "happy-dom",
    setupFiles: ["./test/setup-test-env.ts"],
  },
});
