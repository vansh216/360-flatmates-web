import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      injectRegister: "auto",
      includeAssets: [
        "favicon.svg",
        "robots.txt",
        "sitemap.xml",
        "favicon-192.png",
        "favicon-512.png",
        "favicon-192-maskable.png",
        "favicon-512-maskable.png",
        "og-image.png",
        "logo.png",
        "favicon.ico",
        "llms.txt",
      ],
      manifest: {
        name: "360 Flatmates",
        short_name: "360 Flatmates",
        description: "Find compatible flatmates and verified rooms across India.",
        theme_color: "#F4F3EE",
        background_color: "#F4F3EE",
        display: "standalone",
        orientation: "portrait",
        start_url: "/",
        icons: [
          {
            src: "favicon.svg",
            sizes: "any",
            type: "image/svg+xml",
            purpose: "any",
          },
          {
            src: "favicon-192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "favicon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "favicon-192-maskable.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "maskable",
          },
          {
            src: "favicon-512-maskable.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
    }),
  ],
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
