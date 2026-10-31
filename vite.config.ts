import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { resolve } from "node:path";

// Multi-page build: each HTML file is a page; static hosts serve 404.html for unknown routes.
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: "http://127.0.0.1:8787",
        changeOrigin: true,
        configure(proxy) {
          proxy.on("proxyReq", (proxyReq, request) => {
            // Preserve the same-origin check while forwarding local development requests.
            if (request.headers.origin === `http://${request.headers.host}`) {
              proxyReq.setHeader("Origin", "http://127.0.0.1:8787");
            }
          });
        },
      },
    },
  },
  build: {
    rolldownOptions: {
      input: {
        home: resolve(import.meta.dirname, "index.html"),
        contact: resolve(import.meta.dirname, "contact/index.html"),
        notFound: resolve(import.meta.dirname, "404.html"),
      },
    },
  },
});
