import type { Lang } from "./textes";

// Data Dragon sert les noms traduits et les illustrations ; les jeux ne lisent que les champions (Schub#130).
export const DDRAGON = "https://ddragon.leagueoflegends.com";
export const LOCALES: Record<Lang, string> = { fr: "fr_FR", en: "en_US" };

export interface Champion {
  id: string;
  nom: string;
}

export interface Catalogue {
  version: string;
  champions: Champion[];
}

/** Une lecture gardée en mémoire ; un échec n'est pas gardé, la suivante réessaie. */
export const memorise = <C, T>(lis: (cle: C) => Promise<T>) => {
  const lus = new Map<C, Promise<T>>();
  return (cle: C): Promise<T> => {
    if (!lus.has(cle)) {
      lus.set(
        cle,
        lis(cle).catch((erreur: unknown) => {
          lus.delete(cle);
          throw erreur;
        }),
      );
    }
    return lus.get(cle)!;
  };
};

export const derniereVersion = memorise<void, string>(async () => {
  const versions = (await (
    await fetch(`${DDRAGON}/api/versions.json`)
  ).json()) as string[];
  return versions[0];
});

const lis = async (lang: Lang): Promise<Catalogue> => {
  const version = await derniereVersion();
  const lu = (await (
    await fetch(`${DDRAGON}/cdn/${version}/data/${LOCALES[lang]}/champion.json`)
  ).json()) as { data: Record<string, { id: string; name: string }> };
  return {
    version,
    champions: Object.values(lu.data).map((champion) => ({
      id: champion.id,
      nom: champion.name,
    })),
  };
};

export const catalogue = memorise(lis);

/** L'illustration d'un champion, la même dans toutes les langues ; num choisit le skin, 0 pour celui de base. */
export const splash = (id: string, num = 0): string =>
  `${DDRAGON}/cdn/img/champion/splash/${id}_${num}.jpg`;

/** L'icône carrée d'un champion, à la version du catalogue lu. */
export const icone = (version: string, id: string): string =>
  `${DDRAGON}/cdn/${version}/img/champion/${id}.png`;
