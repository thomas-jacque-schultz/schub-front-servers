import type { Lang } from "./textes";

// Data Dragon sert les noms traduits et les illustrations ; les jeux ne lisent que les champions (Schub#130).
const DDRAGON = "https://ddragon.leagueoflegends.com";
const LOCALES: Record<Lang, string> = { fr: "fr_FR", en: "en_US" };
const lus = new Map<Lang, Promise<Champion[]>>();

export interface Champion {
  id: string;
  nom: string;
}

const lis = async (lang: Lang): Promise<Champion[]> => {
  const versions = (await (
    await fetch(`${DDRAGON}/api/versions.json`)
  ).json()) as string[];
  const catalogue = (await (
    await fetch(
      `${DDRAGON}/cdn/${versions[0]}/data/${LOCALES[lang]}/champion.json`,
    )
  ).json()) as { data: Record<string, { id: string; name: string }> };
  return Object.values(catalogue.data).map((champion) => ({
    id: champion.id,
    nom: champion.name,
  }));
};

export const champions = (lang: Lang): Promise<Champion[]> => {
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
