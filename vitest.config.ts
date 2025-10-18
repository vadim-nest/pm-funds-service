import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    watch: false,
    globals: true,
    setupFiles: ["./tests/setup.ts"],
    coverage: { enabled: false },
  },
});
