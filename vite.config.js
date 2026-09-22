import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

const racineProjet = path.dirname(fileURLToPath(import.meta.url));

const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css",
  ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png",
  ".woff2": "font/woff2", ".map": "application/json" };

// nginx sert le Storybook sous /storybook en production (voir nginx.conf). Le serveur de dev ne
// connaissait que le SPA : /storybook tombait sur la route attrape-tout du routeur, qui renvoie à
// l'accueil. Un lien mort qui n'a l'air de rien.
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
      const demande = decodeURIComponent((req.url || "/").split("?")[0]);
      let cible = path.join(racine, demande === "/" ? "index.html" : demande);
      if (!cible.startsWith(racine) || !fs.existsSync(cible) || fs.statSync(cible).isDirectory()) {
        cible = path.join(racine, "index.html");
      }
      res.setHeader("Content-Type", TYPES[path.extname(cible)] ?? "application/octet-stream");
      fs.createReadStream(cible).pipe(res);
    });
  },
});
import react from "@vitejs/plugin-react";

// Le client appelle l'API en relatif ("/api"), parce qu'en production nginx sert le
// bundle et relaie /api/ vers le BFF sur la même origine. Le serveur de développement
// de Vite ne sait pas faire ça tout seul : sans ce proxy, chaque appel du navigateur
// retombe sur le serveur de dev, qui répond l'index.html au lieu du JSON attendu.
//
// La cible vient de l'environnement pour que la même configuration serve en local
// (http://localhost:18082) comme dans la stack de dev (http://dev-schub-bff:8080).
const apiProxyTarget = process.env.API_PROXY_TARGET ?? "http://localhost:18082";

// Vite refuse les requêtes dont l'en-tête Host lui est inconnu (403 « Blocked request »).
// Le serveur de dev est joint par deux noms qui ne sont ni localhost ni une IP : son nom
// de service sur le réseau Docker, et le domaine public servi par le tunnel Cloudflare.
//
// Note : ce réglage ne concerne QUE l'en-tête Host. L'en-tête Origin, lui, est relayé
// tel quel au BFF, qui applique sa propre liste (auth.cors.allowed-origins) — c'est là
// qu'il faut déclarer les origines, pas ici.
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
        // nginx relaie « /api/ » vers « / » du BFF ; on reproduit la même réécriture,
        // sinon les chemins seraient décalés d'un segment entre dev et prod.
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
});
