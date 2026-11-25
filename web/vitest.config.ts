import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
    alias: {
      "@lineiconshq/free-icons": "@lineiconshq/free-icons/dist/index.esm.js",
      "@lineiconshq/react-lineicons": "@lineiconshq/react-lineicons/dist/index.esm.js",
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./app/test/setup.ts"],
    include: ["app/**/*.test.{ts,tsx}"],
    server: {
      deps: {
        inline: ["@lineiconshq/free-icons", "@lineiconshq/react-lineicons"],
      },
    },
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov"],
      include: ["app/**/*.{ts,tsx}"],
      exclude: ["app/**/*.test.{ts,tsx}", "app/test/**"],
    },
  },
});
