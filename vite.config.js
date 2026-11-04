import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const CSP = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data:",
  "media-src 'self' data:",
  "font-src 'self' data:",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'none'",
  "frame-ancestors 'none'",
].join('; ');

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'inject-csp',
      apply: 'build',
      transformIndexHtml(html) {
        return {
          html,
          tags: [
            {
              tag: 'meta',
              attrs: { 'http-equiv': 'Content-Security-Policy', content: CSP },
              injectTo: 'head-prepend',
            },
          ],
        };
      },
    },
  ],
  base: './',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  server: {
    port: 5173,
  },
});
