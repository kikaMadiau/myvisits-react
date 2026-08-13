import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    // Configuration du proxy pour rediriger les appels API
    proxy: {
      '/api': {
        target: 'https://myvisit.shop',
        changeOrigin: true,
        secure: false, // Si le certificat SSL est problématique
        rewrite: (path) => path.replace(/^\/api/, '/api'),
        // Logs pour déboguer
        configure: (proxy, options) => {
          proxy.on('error', (err, req, res) => {
            console.log('Proxy error:', err);
          });
          proxy.on('proxyReq', (proxyReq, req, res) => {
            console.log('Proxying:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, res) => {
            console.log('Proxy response:', proxyRes.statusCode);
          });
        },
      },
    },
  },
});
