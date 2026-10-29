import type { Famille } from "./familles";
import type { Indice } from "./partie";
import type { Lang } from "../commun/textes";
import { texte } from "./textes";

// Un indice tel que le lit chaque joueur, dans sa langue : son libellé et sa valeur.

const LIBELLES: Record<Indice["type"], Parameters<typeof texte>[1]> = {
  classes: "classes",
  portee: "portee",
  region: "region",
  skin: "skin",
  sort: "sort",
  titre: "titreChampion",
  prix: "prix",
  roles: "roles",
  stats: "stats",
  recette: "recette",
  composants: "composants",
  description: "description",
};

export const libelle = (lang: Lang, indice: Indice): string =>
  texte(lang, LIBELLES[indice.type]);

export const nomFamille = (lang: Lang, famille: Famille) =>
  texte(lang, `famille_${famille}`);

const CLASSES = ["Fighter", "Mage", "Assassin", "Marksman", "Tank", "Support"];

export const valeur = (lang: Lang, indice: Indice): string => {
  switch (indice.type) {
    case "classes":
      return indice.classes
        .map((classe) =>
          CLASSES.includes(classe) ? texte(lang, classe as "Fighter") : classe,
        )
        .join(", ");
    case "portee":
      return [
        texte(lang, indice.aDistance ? "aDistance" : "melee"),
        indice.ressource,
      ]
        .filter(Boolean)
        .join(" · ");
    case "sort":
    case "region":
    case "skin":
      return indice.nom;
    case "roles":
      return indice.familles.map((f) => nomFamille(lang, f)).join(", ");
    case "recette":
      return indice.noms.join(", ") || texte(lang, "aucuneRecette");
    case "titre":
    case "description":
      return indice.texte;
    case "prix":
      return texte(lang, `tranche${indice.tranche}` as "tranche0");
    case "stats":
      return indice.lignes.join(" · ") || texte(lang, "aucuneStat");
    case "composants":
      return indice.noms.join(", ") || texte(lang, "aucunComposant");
  }
};
