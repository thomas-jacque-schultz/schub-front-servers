import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Le client appelle l'API en relatif ("/api"), parce qu'en production nginx sert le
// bundle et relaie /api/ vers le BFF sur la même origine. Le serveur de développement
// de Vite ne sait pas faire ça tout seul : sans ce proxy, chaque appel du navigateur
// retombe sur le serveur de dev, qui répond l'index.html au lieu du JSON attendu.
//
// La cible vient de l'environnement pour que la même configuration serve en local
// (http://localhost:18082) comme dans la stack de dev (http://dev-schub-bff:8080).
const apiProxyTarget = process.env.API_PROXY_TARGET ?? "http://localhost:18082";

// Vite refuse par défaut les requêtes dont l'en-tête Host lui est inconnu (403
// « Blocked request »). En dev, le serveur est joint par deux noms qui ne sont ni
// localhost ni une IP : le nom de service sur le réseau Docker, et le domaine public
// servi par le tunnel Cloudflare. Les deux doivent être déclarés, sinon le tunnel
// reçoit un 403 et la page ne s'affiche jamais.
const allowedHosts = (process.env.DEV_ALLOWED_HOSTS ?? "dev-schub-front,dev.schultz-thomas.fr")
  .split(",")
  .map((host) => host.trim())
  .filter(Boolean);

export default defineConfig({
  plugins: [react()],
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
