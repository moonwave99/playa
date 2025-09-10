import { defineConfig } from "vitest/config";
import path from "path";

// https://vitejs.dev/config
export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "unicorn-magic": "src/unicorn-magic.js",
      "@aws-sdk/client-s3": "src/s3.js",
      ".prisma/client/index-browser":
        "./node_modules/@prisma/client-generated/index-browser.js",
      ".prisma/client/default":
        "./node_modules/@prisma/client-generated/default.js",
    },
  },
  test: {
    globals: true,
    setupFiles: "./src/test/vitest.setup.main.ts",
    include: ["src/main/**/*.test.ts"],
    coverage: {
      provider: "istanbul",
      include: ["src/main"],
      exclude: [
        "**/__mocks__/*",
        "**/seed.ts",
        "**/logger.ts",
        "**/run.ts",
        "**/menu/*",
      ],
    },
  },
});
