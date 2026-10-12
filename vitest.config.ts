import { fileURLToPath } from "node:url";

import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

/**
 * Unit and integration test configuration.
 *
 * `environmentMatchGlobs` keeps component tests in jsdom while everything else
 * runs in plain Node, which is faster and closer to the real server environment
 * for the API route tests.
 */
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    environment: "node",
    environmentMatchGlobs: [["src/components/**", "jsdom"]],
    // Playwright owns e2e; keeping them out of the unit run avoids two runners
    // fighting over the same files.
    exclude: ["node_modules/**", "e2e/**", ".next/**"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      include: ["src/lib/**", "src/data/**"],
    },
  },
});
