import type { Lang } from "./textes";

// Data Dragon sert les noms traduits et les illustrations ; les jeux ne lisent que les champions (Schub#130).
const DDRAGON = "https://ddragon.leagueoflegends.com";
const LOCALES: Record<Lang, string> = { fr: "fr_FR", en: "en_US" };
const lus = new Map<Lang, Promise<Catalogue>>();

export interface Champion {
  id: string;
  nom: string;
}

export interface Catalogue {
  version: string;
  champions: Champion[];
}

const lis = async (lang: Lang): Promise<Catalogue> => {
  const versions = (await (
    await fetch(`${DDRAGON}/api/versions.json`)
  ).json()) as string[];
  const lu = (await (
    await fetch(
      `${DDRAGON}/cdn/${versions[0]}/data/${LOCALES[lang]}/champion.json`,
    )
  ).json()) as { data: Record<string, { id: string; name: string }> };
  return {
    version: versions[0],
    champions: Object.values(lu.data).map((champion) => ({
      id: champion.id,
      nom: champion.name,
    })),
  };
};

export const catalogue = (lang: Lang): Promise<Catalogue> => {
  if (!lus.has(lang)) {
    lus.set(
      lang,
      lis(lang).catch((erreur: unknown) => {
        lus.delete(lang);
        throw erreur;
      }),
    );
  }
  return lus.get(lang)!;
};

/** L'illustration de base d'un champion, la même dans toutes les langues. */
export const splash = (id: string): string =>
  `${DDRAGON}/cdn/img/champion/splash/${id}_0.jpg`;

/** L'icône carrée d'un champion, à la version du catalogue lu. */
export const icone = (version: string, id: string): string =>
  `${DDRAGON}/cdn/${version}/img/champion/${id}.png`;
