// Le contrat du cœur (Schub#124) : openapi/core.json, recopié du dépôt voisin, et les types qu'en tire le front.
//   node scripts/contrat.mjs             recopie ../schub-core/openapi/core.json, puis régénère src/common/api/contrat.ts
//   node scripts/contrat.mjs --verifier  échoue si src/common/api/contrat.ts ne correspond plus à openapi/core.json
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import openapiTS, { astToString } from "openapi-typescript";
import prettier from "prettier";

const racine = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const contrat = path.join(racine, "openapi/core.json");
const types = path.join(racine, "src/common/api/contrat.ts");
const verifier = process.argv.includes("--verifier");

if (!verifier) {
  const voisins = process.env.CONTRATS_DEPUIS ?? path.join(racine, "..");
  fs.mkdirSync(path.dirname(contrat), { recursive: true });
  fs.copyFileSync(path.join(voisins, "schub-core/openapi/core.json"), contrat);
}

const brut = astToString(await openapiTS(pathToFileURL(contrat)));
const genere = await prettier.format(
  "// Généré par scripts/contrat.mjs depuis openapi/core.json : ne pas modifier à la main.\n" + brut,
  { ...(await prettier.resolveConfig(types)), parser: "typescript" },
);

if (verifier) {
  const actuel = fs.existsSync(types) ? fs.readFileSync(types, "utf8") : "";
  if (actuel !== genere) {
    console.error("src/common/api/contrat.ts ne correspond plus à openapi/core.json : lancer npm run contrat.");
    process.exit(1);
  }
} else {
  fs.writeFileSync(types, genere);
  console.log("contrat du cœur recopié, types régénérés");
}
