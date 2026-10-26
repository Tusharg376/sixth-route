import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { resolve } from "node:path";

// Multi-page build: each HTML file is a page; static hosts serve 404.html for unknown routes.
export default defineConfig({
  plugins: [react()],
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
