import { resolve } from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// Une page par jeu (scribble/…) et des assets communs ; le relais sert chacune sur son sous-domaine.
// En local, /ws part vers un relais lancé à côté (RELAY_URL, par défaut localhost:8080).
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        scribble: resolve(__dirname, "scribble/index.html"),
      },
    },
  },
  server: {
    proxy: {
      "/ws": { target: process.env.RELAY_URL ?? "ws://localhost:8080", ws: true },
    },
  },
});
