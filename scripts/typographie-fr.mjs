// Schub#111 : une espace ordinaire devant « : ; ! ? » ou autour des guillemets laisse le signe partir seul à la ligne.
import { readdirSync, readFileSync } from "node:fs";

const DOSSIER = "src/common/locales/fr";
const FAUTES = [
  [/ [:;!?»]/, "espace ordinaire devant : ; ! ? ou »"],
  [/« /, "espace ordinaire après «"],
  [/(\d|\}\}) (%|€|min|ms|h|s|Go|Mo|Ko|To)\b/, "espace ordinaire entre un nombre et son unité"],
];

const fautes = [];

const parcours = (fichier, noeud, chemin) => {
  for (const [cle, valeur] of Object.entries(noeud)) {
    const complet = chemin ? `${chemin}.${cle}` : cle;
    if (typeof valeur === "object" && valeur !== null) {
      parcours(fichier, valeur, complet);
      continue;
    }
    for (const [motif, raison] of FAUTES) {
      if (typeof valeur === "string" && motif.test(valeur)) {
        fautes.push(`${fichier} ${complet} : ${raison}`);
      }
    }
  }
};

for (const fichier of readdirSync(DOSSIER).filter((nom) => nom.endsWith(".json"))) {
  parcours(fichier, JSON.parse(readFileSync(`${DOSSIER}/${fichier}`, "utf8")), "");
}

if (fautes.length > 0) {
  console.error(`Typographie française (\\u00a0 devant « : », \\u202f devant « ; ! ? ») :\n${fautes.join("\n")}`);
  process.exit(1);
}
