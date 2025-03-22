import { defineConfig } from 'vite';
import path from 'path';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      ".prisma/client/index-browser": "./node_modules/@prisma/client-generated/index-browser.js",
      ".prisma/client/default": "./node_modules/@prisma/client-generated/default.js"
    },
  },
});
