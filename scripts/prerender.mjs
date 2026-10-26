// Écrit dans dist/prerendu/<langue>/ les pages publiques de PremadeLab rendues pour un visiteur
// anonyme : un robot lit le contenu sans exécuter le JavaScript. nginx les sert (nginx.conf).
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const racine = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const dist = path.join(racine, "dist");
const origine = process.env.PREMADELAB_ORIGIN ?? "https://premadelab.eu";

const PAGES = { index: "/", presentation: "/presentation", ruler: "/ruler", contact: "/contact", terms: "/terms", privacy: "/privacy" };
const LANGUES = ["fr", "en"];

const cheminPour = (langue, chemin) => (langue === "en" ? (chemin === "/" ? "/en" : `/en${chemin}`) : chemin);

const echapper = (texte) =>
  texte.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const remplacerMeta = (html, attribut, nom, valeur) =>
  html.replace(
    new RegExp(`<meta\\s+${attribut}="${nom}"\\s+content="[^"]*"\\s*/?>`),
    `<meta ${attribut}="${nom}" content="${echapper(valeur)}" />`,
  );

const { render } = await import(pathToFileURL(path.join(racine, "dist-ssr", "prerender.js")).href);
const modele = fs.readFileSync(path.join(dist, "premadelab.html"), "utf8");
if (!modele.includes('<div id="root"></div>')) {
  throw new Error("premadelab.html n'a plus de <div id=\"root\"></div> vide");
}

for (const langue of LANGUES) {
  fs.mkdirSync(path.join(dist, "prerendu", langue), { recursive: true });
  for (const [nom, chemin] of Object.entries(PAGES)) {
    const url = cheminPour(langue, chemin);
    const page = await render(url, langue);
    if (!page.html.trim()) {
      throw new Error(`Prérendu vide pour ${url}`);
    }
    let html = modele.replace(/<html lang="[^"]*">/, `<html lang="${langue}">`);
    if (page.title) {
      html = html.replace(/<title>[^<]*<\/title>/, `<title>${echapper(page.title)}</title>`);
      html = remplacerMeta(html, "property", "og:title", page.title);
    }
    if (page.description) {
      html = remplacerMeta(html, "name", "description", page.description);
      html = remplacerMeta(html, "property", "og:description", page.description);
    }
    const liens = [
      `<link rel="canonical" href="${origine}${url}" />`,
      ...LANGUES.map((autre) => `<link rel="alternate" hreflang="${autre}" href="${origine}${cheminPour(autre, chemin)}" />`),
      `<link rel="alternate" hreflang="x-default" href="${origine}${chemin}" />`,
    ].join("\n    ");
    html = html.replace("</head>", `    ${liens}\n  </head>`);
    html = html.replace('<div id="root"></div>', `<div id="root">${page.html}</div>`);
    fs.writeFileSync(path.join(dist, "prerendu", langue, `${nom}.html`), html);
    console.log(`prérendu ${url} (${Math.round(html.length / 1024)} Ko)`);
  }
}
