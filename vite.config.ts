import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { config } from 'dotenv';

config();
process.env.VITE_APP_URL = process.env.VITE_APP_URL 

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ["lucide-react"],
  },
  server: {
    proxy: {
      "/api": {
        target: process.env.VITE_APP_URL, 
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
