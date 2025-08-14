import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
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
});
