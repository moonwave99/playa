import { defineConfig } from "vite";
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
});
