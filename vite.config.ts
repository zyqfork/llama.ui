import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, false);

  return {
    plugins: [
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        manifest: {
          name: 'llama.ui',
          short_name: 'llama.ui',
          description:
            'Minimal Interface for AI Companion that runs entirely in your browser.',
          display: 'standalone',
          theme_color: '#f8f8f8',
          background_color: '#f8f8f8',
          icons: [
            {
              purpose: 'maskable',
              sizes: '512x512',
              src: 'icon512_maskable.png',
              type: 'image/png',
            },
            {
              purpose: 'any',
              sizes: '512x512',
              src: 'icon512_rounded.png',
              type: 'image/png',
            },
            { src: 'assets/favicon.ico', sizes: '48x48', type: 'image/x-icon' },
            { src: 'assets/favicon.svg', sizes: 'any', type: 'image/svg+xml' },
          ],
          screenshots: [
            {
              src: 'screenshots/desktop.png',
              sizes: '1280x962',
              type: 'image/png',
              form_factor: 'wide',
            },
            {
              src: 'screenshots/mobile.png',
              sizes: '576x1280',
              type: 'image/png',
              form_factor: 'narrow',
            },
          ],
          start_url: env['BASE_URL'],
          orientation: 'any',
          lang: 'en',
        },
        workbox: {
          runtimeCaching: [
            {
              urlPattern: '\\.(?:html|css|js|mjs)$',
              handler: 'StaleWhileRevalidate',
              options: {
                cacheName: 'static-resources',
                expiration: {
                  maxEntries: 50,
                  maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
                },
              },
            },
            {
              urlPattern: '\\.(?:jpg|jpeg|png|svg|ico)$',
              handler: 'CacheFirst',
              options: {
                cacheName: 'images-cache',
                expiration: {
                  maxEntries: 50,
                  maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
                },
              },
            },
            {
              urlPattern: '\\.(?:woff2?|ttf|otf)$',
              handler: 'CacheFirst',
              options: {
                cacheName: 'font-cache',
                expiration: {
                  maxEntries: 20,
                  maxAgeSeconds: 60 * 60 * 24 * 90, // 90 days
                },
              },
            },
          ],
        },
      }),
    ],
    build: {
      rollupOptions: {
        output: {
          entryFileNames: `assets/[name]-[hash].js`,
          chunkFileNames: `assets/[name].js`,
          assetFileNames: function (file) {
            return file.names.some((name) => name.includes('css'))
              ? `assets/[name]-[hash].[ext]`
              : `assets/[name].[ext]`;
          },
          manualChunks: {
            katex: ['katex'],
            'pdfjs-dist': ['pdfjs-dist'],
          },
        },
      },
    },
    server: {
      proxy: {
        '/v1': 'http://localhost:8080',
        '/props': 'http://localhost:8080',
      },
      headers: {
        'Cross-Origin-Embedder-Policy': 'require-corp',
        'Cross-Origin-Opener-Policy': 'same-origin',
      },
    },
  };
});
