import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

const racineProjet = path.dirname(fileURLToPath(import.meta.url));

const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css",
  ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png",
  ".woff2": "font/woff2", ".woff": "font/woff", ".ttf": "font/ttf", ".ico": "image/x-icon",
  ".map": "application/json" };

// nginx sert /storybook en prod ; sans ce middleware, le dev le renvoyait à l'accueil.
const storybookEnDev = () => ({
  name: "storybook-en-dev",
  configureServer(server) {
    const racine = path.join(racineProjet, "storybook-static");
    server.middlewares.use("/storybook", (req, res) => {
      if (!fs.existsSync(racine)) {
        res.statusCode = 503;
        res.setHeader("Content-Type", "text/plain; charset=utf-8");
        res.end("Storybook absent en dev : lancez npm run build-storybook.");
        return;
      }
      // L'index de Storybook référence ses bundles en relatif : sans la barre finale, le
      // navigateur les résout depuis la racine du site et n'obtient que des 404.
      if ((req.originalUrl || "").split("?")[0] === "/storybook") {
        res.statusCode = 301;
        res.setHeader("Location", "/storybook/");
        res.end();
        return;
      }
      const demande = decodeURIComponent((req.url || "/").split("?")[0]);
      let cible = path.join(racine, demande === "/" ? "index.html" : demande);
      if (!cible.startsWith(racine) || !fs.existsSync(cible) || fs.statSync(cible).isDirectory()) {
        // Servir l'index à la place d'un asset manquant rend du HTML sous un nom de script :
        // l'erreur se lit alors comme un bug de Storybook.
        if (path.extname(demande)) {
          res.statusCode = 404;
          res.end();
          return;
        }
        cible = path.join(racine, "index.html");
      }
      res.setHeader("Content-Type", TYPES[path.extname(cible)] ?? "application/octet-stream");
      fs.createReadStream(cible).pipe(res);
    });
  },
});
import react from "@vitejs/plugin-react";

// En prod nginx relaie /api/ vers le BFF sur la même origine ; ce proxy reproduit ce relais en dev.
const apiProxyTarget = process.env.API_PROXY_TARGET ?? "http://localhost:18082";

// Vite refuse un Host inconnu (403 « Blocked request »). L'Origin, lui, est filtré par le BFF
// (auth.cors.allowed-origins).
const allowedHosts = (process.env.DEV_ALLOWED_HOSTS ?? "dev-schub-front,dev.schultz-thomas.fr")
  .split(",")
  .map((host) => host.trim())
  .filter(Boolean);

export default defineConfig({
  plugins: [react(), storybookEnDev()],
  server: {
    allowedHosts,
    proxy: {
      "/api": {
        target: apiProxyTarget,
        changeOrigin: true,
        // Même réécriture que nginx (/api/ → /).
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
});
