import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  resolve: {
    tsconfigPaths: true,
  },
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "https://api.360ghar.com",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, "/app/v1"),
      },
    },
  },
  build: {
    target: "es2022",
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules/react/") || id.includes("node_modules/react-dom/") || id.includes("node_modules/react-router/")) return "vendor";
          if (id.includes("node_modules/@tanstack/")) return "query";
          if (id.includes("node_modules/@supabase/")) return "supabase";
          if (id.includes("node_modules/leaflet") || id.includes("node_modules/react-leaflet")) return "map";
        },
      },
    },
  },
});
