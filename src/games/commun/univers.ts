import { memorise } from "./champions";
import { normalise } from "./devinette";
import type { Lang } from "./textes";

// Le site Univers de Riot : la région et la date de sortie de chaque champion, en un fichier. Il n'est pas
// documenté (Schub#136) ; ses fichiers acceptent les appels d'un autre site. Un jeu s'en passe s'il ne répond plus.

const UNIVERS = "https://universe-meeps.leagueoflegends.com/v1";
const LOCALES: Record<Lang, string> = { fr: "fr_fr", en: "en_us" };
const SANS_REGION = "unaffiliated";

export interface ChampionUnivers {
  /** La clé de Data Dragon (le nom, normalisé) : les deux sites n'ont pas les mêmes identifiants. */
  cle: string;
  nom: string;
  region: string | null;
  sortie: string;
}

export interface Univers {
  regions: Record<string, string>;
  champions: ChampionUnivers[];
}

interface IndexUnivers {
  champions: {
    name: string;
    "release-date": string;
    "associated-faction-slug": string;
  }[];
  factions: { slug: string; name: string }[];
}

export const versUnivers = (index: IndexUnivers): Univers => ({
  regions: Object.fromEntries(index.factions.map((f) => [f.slug, f.name])),
  champions: index.champions.map((c) => ({
    cle: normalise(c.name),
    nom: c.name,
    region:
      c["associated-faction-slug"] &&
      c["associated-faction-slug"] !== SANS_REGION
        ? c["associated-faction-slug"]
        : null,
    sortie: c["release-date"],
  })),
});

export const univers = memorise(async (lang: Lang) =>
  versUnivers(
    (await (
      await fetch(`${UNIVERS}/${LOCALES[lang]}/search/index.json`)
    ).json()) as IndexUnivers,
  ),
);

/** La région d'un champion de Data Dragon, s'il en a une. */
export const regionDe = (u: Univers | null, nom: string): string | null =>
  u?.champions.find((c) => c.cle === normalise(nom))?.region ?? null;
