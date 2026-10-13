import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

/**
 * Vite configuration.
 * `base: '/'` because the app uses real (BrowserRouter) URLs such as
 * /product/:id. Static hosts need an SPA rewrite so deep links resolve to
 * index.html — see public/_redirects (Netlify) and vercel.json.
 */
export default defineConfig({
  base: '/',
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 5173,
    open: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        // Split vendor code out of the app bundle for better caching.
        manualChunks: {
          vendor: ['react', 'react-dom'],
        },
      },
    },
  },
});