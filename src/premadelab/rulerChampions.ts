// Les champions et leurs portées pour la règle, lus dans Data Dragon par le navigateur (CORS ouvert), comme les
// icônes du reste du site. La liste vient d'un seul fichier ; les sorts d'un champion, de son fichier, au clic.
const DDRAGON = "https://ddragon.leagueoflegends.com";

// Data Dragon met 25 000 sur tout sort sans portée fixe : un vrai global (Ashe R) comme un sort personnel
// (Aatrox Q). On ne peut pas les distinguer, donc on ne trace rien.
const SANS_PORTEE = 25_000;

const LANGUES: Record<string, string> = { fr: "fr_FR", en: "en_US" };

export interface ChampionDeLaRegle {
  id: string;
  name: string;
  title: string;
  icon: string;
  attackRange: number;
  moveSpeed: number;
}

export type ToucheDeSort = "P" | "Q" | "W" | "E" | "R";

export interface SortDeLaRegle {
  key: ToucheDeSort;
  name: string;
  icon: string;
  /** Les portées distinctes, du premier rang au dernier ; vide quand Riot n'en publie pas. */
  ranges: number[];
}

export interface CatalogueDeLaRegle {
  version: string;
  champions: ChampionDeLaRegle[];
}

interface ChampionDdragon {
  id: string;
  name: string;
  title: string;
  image: { full: string };
  stats: { attackrange: number; movespeed: number };
}

interface SortDdragon {
  name: string;
  range: number[];
  image: { full: string };
}

const lire = async <T>(url: string): Promise<T> => {
  const reponse = await fetch(url);
  if (!reponse.ok) {
    throw new Error(`Data Dragon : ${reponse.status} sur ${url}`);
  }
  return reponse.json() as Promise<T>;
};

const langueDdragon = (langue: string) => LANGUES[langue] ?? LANGUES.fr;

export const portees = (range: number[]): number[] =>
  [...new Set(range)].filter((portee) => portee > 0 && portee < SANS_PORTEE);

export const chargerChampions = async (
  langue: string,
): Promise<CatalogueDeLaRegle> => {
  const [version] = await lire<string[]>(`${DDRAGON}/api/versions.json`);
  const { data } = await lire<{ data: Record<string, ChampionDdragon> }>(
    `${DDRAGON}/cdn/${version}/data/${langueDdragon(langue)}/champion.json`,
  );
  const champions = Object.values(data)
    .map((champion) => ({
      id: champion.id,
      name: champion.name,
      title: champion.title,
      icon: `${DDRAGON}/cdn/${version}/img/champion/${champion.image.full}`,
      attackRange: champion.stats.attackrange,
      moveSpeed: champion.stats.movespeed,
    }))
    .sort((a, b) => a.name.localeCompare(b.name, langue));
  return { version, champions };
};

const sorts = new Map<string, Promise<SortDeLaRegle[]>>();

export const chargerSorts = (
  version: string,
  langue: string,
  id: string,
): Promise<SortDeLaRegle[]> => {
  const cle = `${version}/${langueDdragon(langue)}/${id}`;
  const enCache = sorts.get(cle);
  if (enCache) {
    return enCache;
  }
  const demande = lire<{
    data: Record<string, { passive: SortDdragon; spells: SortDdragon[] }>;
  }>(
    `${DDRAGON}/cdn/${version}/data/${langueDdragon(langue)}/champion/${id}.json`,
  ).then(({ data }) => {
    const { passive, spells } = data[id];
    const touches: ToucheDeSort[] = ["Q", "W", "E", "R"];
    return [
      {
        key: "P" as const,
        name: passive.name,
        icon: `${DDRAGON}/cdn/${version}/img/passive/${passive.image.full}`,
        ranges: [],
      },
      ...spells.map((sort, index) => ({
        key: touches[index],
        name: sort.name,
        icon: `${DDRAGON}/cdn/${version}/img/spell/${sort.image.full}`,
        ranges: portees(sort.range),
      })),
    ];
  });
  demande.catch(() => sorts.delete(cle));
  sorts.set(cle, demande);
  return demande;
};
