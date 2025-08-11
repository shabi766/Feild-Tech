import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from "path";

export default defineConfig({
  plugins: [
    react({
      jsxRuntime: 'automatic',
      jsxImportSource: 'react'
    })
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: process.env.FRONTEND_PORT || 5173,
    host: true, // Allow external connections
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      }
    }
  },
  define: {
    'process.env.VITE_BACKEND_URL': JSON.stringify(process.env.VITE_BACKEND_URL || 'http://localhost:8000'),
  },
  build: {
    outDir: 'dist', // Explicitly set the output directory
    rollupOptions: {
      external: [],
    }
  },
  optimizeDeps: {
    include: ['react', 'react-dom']
  },
  esbuild: {
    jsx: 'automatic',
    jsxImportSource: 'react'
  }
});