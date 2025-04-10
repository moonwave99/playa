import { defineConfig } from 'vitest/config';
import path from 'path';
import react from '@vitejs/plugin-react';
import svgr from "vite-plugin-svgr";

// https://vitejs.dev/config
export default defineConfig({
  plugins: [svgr(), react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      'unicorn-magic': 'src/unicorn-magic.js',
      ".prisma/client/index-browser": "./node_modules/@prisma/client-generated/index-browser.js",
      ".prisma/client/default": "./node_modules/@prisma/client-generated/default.js"
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/vitest.setup.renderer.ts',
    include: ['src/renderer/**/*.test.{ts,tsx}'],
    coverage: {
      provider: 'istanbul',
      include: ['src/renderer'],
    },
  },
});
