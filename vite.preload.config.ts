import { defineConfig } from 'vite';
import path from 'path';

// https://vitejs.dev/config
export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      ".prisma/client/index-browser": "./node_modules/@prisma/client-generated/index-browser.js",
      ".prisma/client/default": "./node_modules/@prisma/client-generated/default.js"
    },
  },
});
