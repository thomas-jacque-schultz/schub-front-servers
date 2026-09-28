// PremadeLab ne cite jamais Schub (front#39). Échoue si un texte qu'il affiche contient « Schub ».
// Une clé propre à Schub passe si elle a sa variante `<clé>_PremadeLab` (contexte i18next).
import { readFileSync } from "node:fs";

const LANGUES = ["fr", "en"];

// Espace de noms → sections affichées par PremadeLab ("" : tout l'espace).
const AFFICHES = {
  auth: [""],
  common: [""],
  contact: ["feedback", "fields", "helpers", "submit", "sending", "success", "errors", "privacy", "feedbackMeta"],
  home: ["onboarding"],
  legal: [""],
  lol: [""],
  pool: [""],
  profile: [""],
  reviews: [""],
  riot: ["search", "verify", "errors", "suggestion", "position"],
  stats: [""],
  teams: [""],
};

// Clés de `common` que seule la coquille de Schub affiche.
const PROPRES_A_SCHUB = new Set(["common:app.name", "common:shell.footerNote", "common:shell.appSchub"]);

const fautes = [];

const parcours = (espace, noeud, chemin, sections) => {
  for (const [cle, valeur] of Object.entries(noeud)) {
    const complet = chemin ? `${chemin}.${cle}` : cle;
    if (typeof valeur === "object") {
      parcours(espace, valeur, complet, sections);
      continue;
    }
    const affiche = sections.some((section) => section === "" || complet === section || complet.startsWith(`${section}.`));
    if (!affiche || !/schub/i.test(valeur) || PROPRES_A_SCHUB.has(`${espace}:${complet}`)) {
      continue;
    }
    if (!(`${cle}_PremadeLab` in noeud)) {
      fautes.push(`${espace}:${complet}`);
    }
  }
};

for (const langue of LANGUES) {
  for (const [espace, sections] of Object.entries(AFFICHES)) {
    const textes = JSON.parse(readFileSync(new URL(`../src/common/locales/${langue}/${espace}.json`, import.meta.url)));
    const avant = fautes.length;
    parcours(espace, textes, "", sections);
    for (let i = avant; i < fautes.length; i++) {
      fautes[i] = `${langue}/${fautes[i]}`;
    }
  }
}

if (fautes.length > 0) {
  console.error("PremadeLab affiche « Schub » dans :\n" + fautes.map((faute) => `  ${faute}`).join("\n"));
  process.exit(1);
}
console.log("PremadeLab : aucun texte ne cite Schub.");
