import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from "path";
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: process.env.FRONTEND_PORT || 5173,
  },
  define: {
    'process.env.VITE_BACKEND_URL': JSON.stringify(process.env.VITE_BACKEND_URL),
  },
  build: {
    outDir: 'dist', // Explicitly set the output directory
  },
});