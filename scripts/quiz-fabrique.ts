// Fabrique un lot de questions pour la banque du quiz (Schub#143), dans les deux langues.
//   npm run quiz:fabrique -- <sortie.json> [graine]
// Le lot ne reprend aucune clé de banque.json ni de fabriquees.json. Le premier lot est fabriquees.json, versé par la
// migration V029 du cœur ; les suivants s'importent dans Schub › PremadeLab › Quiz.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { donnees } from "../src/games/commun/ddragon";
import { univers } from "../src/games/commun/univers";
import { fabrique } from "../src/games/quiz/fabrique";
import type { QuestionBanque } from "../src/games/quiz/questions";

const QUOTAS = { objets: 40, histoire: 40, skins: 40, monde: 30 };

const dossier = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../src/games/quiz",
);
const [sortie, graine = "1"] = process.argv.slice(2).filter((a) => a !== "--");
if (!sortie) {
  console.error("Usage : npm run quiz:fabrique -- <sortie.json> [graine]");
  process.exit(1);
}

const lus = (fichier: string): QuestionBanque[] => {
  const chemin = path.join(dossier, fichier);
  return fs.existsSync(chemin)
    ? JSON.parse(fs.readFileSync(chemin, "utf8"))
    : [];
};

/** mulberry32 : un tirage rejouable d'une graine à l'autre. */
const hasard = (() => {
  let a = Number(graine) >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
})();

const [fr, en, uFr, uEn] = await Promise.all([
  donnees("fr"),
  donnees("en"),
  univers("fr").catch(() => null),
  univers("en").catch(() => null),
]);
const deja = [...lus("banque.json"), ...lus("fabriquees.json")].map(
  (q) => q.id,
);
const lot = fabrique(
  {
    date: new Date().toISOString().slice(0, 10),
    fr,
    en,
    univers: uFr && uEn ? { fr: uFr, en: uEn } : null,
  },
  QUOTAS,
  hasard,
  deja,
);
fs.writeFileSync(sortie, `${JSON.stringify(lot, null, 2)}\n`);
const parTheme = new Map<string, number>();
for (const q of lot) {
  parTheme.set(q.theme, (parTheme.get(q.theme) ?? 0) + 1);
}
console.log(
  `${lot.length} questions (Data Dragon ${fr.version}) :`,
  [...parTheme].map(([theme, n]) => `${theme} ${n}`).join(", "),
);
