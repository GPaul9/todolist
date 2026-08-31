import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import path from 'path';

export default defineConfig({
  // base: '/todolist/',
  plugins: [
    react({
      babel: {
        plugins: [
          'babel-plugin-react-compiler',
        ],
      },
    }),
    svgr({
      include: '**/*.svg?react',
      svgrOptions: {
        icon: true,
      },
    }),
  ],
  resolve: {
    alias: {
      app: path.resolve(__dirname, 'src/app'),
      assets: path.resolve(__dirname, 'src/assets'),
      pages: path.resolve(__dirname, 'src/pages'),
      widgets: path.resolve(__dirname, 'src/widgets'),
      features: path.resolve(__dirname, 'src/features'),
      entities: path.resolve(__dirname, 'src/entities'),
      shared: path.resolve(__dirname, 'src/shared'),
    },
  },
  server: {
    allowedHosts: true,
    host: '0.0.0.0',
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
});
