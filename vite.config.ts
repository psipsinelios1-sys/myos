import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    base: './', // Relative paths for Tauri file:// protocol
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      port: 5173,
    },
    build: {
      // Vite 8 uses Rolldown natively for minification — no Terser needed
      minify: true,
    },
  };
});
