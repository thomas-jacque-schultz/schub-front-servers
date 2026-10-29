import type { Famille } from "./familles";
import type { Indice } from "./partie";
import type { Lang } from "../commun/textes";
import { texte } from "./textes";

// Un indice tel que le lit chaque joueur, dans sa langue : son libellé et sa valeur.

export const libelle = (lang: Lang, indice: Indice): string => {
  switch (indice.type) {
    case "classes":
      return texte(lang, "classes");
    case "portee":
      return texte(lang, "portee");
    case "sort":
      return texte(lang, "sort");
    case "titre":
      return texte(lang, "titreChampion");
    case "region":
      return texte(lang, "region");
    case "skin":
      return texte(lang, "skin");
    case "roles":
      return texte(lang, "roles");
    case "recette":
      return texte(lang, "recette");
    case "prix":
      return texte(lang, "prix");
    case "stats":
      return texte(lang, "stats");
    case "composants":
      return texte(lang, "composants");
    case "description":
      return texte(lang, "description");
  }
};

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
