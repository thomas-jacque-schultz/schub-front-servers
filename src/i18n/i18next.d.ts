import type { defaultNS, resources } from "./resources";

/**
 * Ce qui rend les clés **typées** : TypeScript connaît l'arbre des catalogues français et
 * signale `t("servers:list.titel")` comme une erreur de compilation, pas comme une chaîne
 * affichée telle quelle en production.
 *
 * <p>Le français sert de référence parce que c'est la langue de rédaction. Le fait que l'anglais
 * porte exactement les mêmes clés se vérifie, lui, au moment de la revue des catalogues.</p>
 */
declare module "i18next" {
  interface CustomTypeOptions {
    defaultNS: typeof defaultNS;
    resources: (typeof resources)["fr"];
    returnNull: false;
  }
}
