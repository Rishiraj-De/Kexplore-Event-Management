import path from 'node:path';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { '@': path.resolve(import.meta.dirname, 'src') },
  },
  server: {
    port: 5173,
    // In development the API runs on :4000. In production Vercel rewrites /api → Render,
    // so the browser always talks to the same origin and the session cookie stays first-party.
    proxy: { '/api': { target: 'http://localhost:4000', changeOrigin: true } },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.js'],
  },
});
