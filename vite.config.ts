/// <reference types="vitest/config" />
import { fileURLToPath, URL } from 'node:url';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  build: {
    rolldownOptions: {
      output: {
        // Long-lived vendor chunks: they change less often than the app code and cache separately.
        codeSplitting: {
          groups: [
            { name: 'react', test: /node_modules[\\/](react|react-dom|scheduler)[\\/]/ },
            { name: 'tanstack', test: /node_modules[\\/]@tanstack[\\/]/ },
            {
              name: 'charts',
              test: /node_modules[\\/](recharts|d3-[^\\/]+|victory-vendor|@reduxjs|redux|react-redux|immer|reselect|decimal\.js-light|es-toolkit|eventemitter3)[\\/]/,
            },
            { name: 'radix', test: /node_modules[\\/](radix-ui|@radix-ui|@floating-ui)[\\/]/ },
            {
              name: 'mock-api',
              test: /node_modules[\\/](msw|@mswjs|@open-draft|@bundled-es-modules|outvariant|strict-event-emitter|headers-polyfill|graphql|tough-cookie|rettime)[\\/]/,
            },
          ],
        },
      },
    },
  },
  test: {
    environment: 'jsdom',
    globals: false,
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    css: false,
    restoreMocks: true,
  },
});
