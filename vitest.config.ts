import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    include: [
      "tests/integration/**/*.test.ts",
      "tests/integration/**/*.test.tsx",
      "src/**/__tests__/**/*.test.ts",
      "src/**/__tests__/**/*.test.tsx"
    ]
  },
  resolve: {
    alias: {
      "@": new URL("./src", import.meta.url).pathname
    }
  }
});
