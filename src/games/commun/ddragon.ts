import { DDRAGON, derniereVersion, LOCALES, memorise } from "./champions";
import type { Lang } from "./textes";

// Ce que les jeux de questions et d'indices lisent de Data Dragon (Schub#133, #136, #140), en un fichier par langue.

export interface ChampionComplet {
  id: string;
  nom: string;
  titre: string;
  /** Les classes de Data Dragon, en identifiants anglais : Fighter, Mage… */
  classes: string[];
  ressource: string;
  aDistance: boolean;
  sorts: string[];
  /** Hors skin de base et hors chromas : Data Dragon range les chromas parmi les skins, « Ahri sylvestre (rubis) ». */
  skins: number;
  histoire: string;
}

export interface Objet {
  id: string;
  nom: string;
  prix: number;
  stats: string[];
  composants: string[];
  description: string;
}

export interface Donnees {
  version: string;
  champions: ChampionComplet[];
  objets: Objet[];
}

interface ChampionDD {
  id: string;
  name: string;
  title: string;
  tags: string[];
  partype: string;
  stats: { attackrange: number };
  spells: { name: string }[];
  passive: { name: string };
  skins: { num: number; name: string }[];
  lore: string;
}

interface ObjetDD {
  name: string;
  description: string;
  plaintext?: string;
  from?: string[];
  gold: { total: number; purchasable: boolean };
  tags?: string[];
  maps: Record<string, boolean>;
  inStore?: boolean;
  hideFromAll?: boolean;
  requiredChampion?: string;
  requiredAlly?: string;
}

const FAILLE = "11";
const PORTEE_A_DISTANCE = 300;
const HORS_BOUTIQUE = new Set(["Consumable", "Trinket", "Jungle"]);

const texteSeul = (html: string) =>
  html
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();

export const versChampion = (c: ChampionDD): ChampionComplet => ({
  id: c.id,
  nom: c.name,
  titre: c.title,
  classes: c.tags,
  ressource: c.partype,
  aDistance: c.stats.attackrange > PORTEE_A_DISTANCE,
  sorts: [c.passive.name, ...c.spells.map((sort) => sort.name)],
  skins: c.skins.filter((s) => s.num > 0 && !/\)\s*$/.test(s.name)).length,
  histoire: texteSeul(c.lore),
});

/** Les objets qu'on achète sur la Faille ; Data Dragon en sert aussi de l'Arène et d'Ornn, en doublons. */
export const versObjets = (data: Record<string, ObjetDD>): Objet[] => {
  const vus = new Set<string>();
  const objets: Objet[] = [];
  for (const [id, o] of Object.entries(data)) {
    if (
      id.length !== 4 ||
      !o.gold.purchasable ||
      o.gold.total <= 0 ||
      !o.maps[FAILLE] ||
      o.inStore === false ||
      o.hideFromAll ||
      o.requiredChampion ||
      o.requiredAlly ||
      (o.tags ?? []).some((tag) => HORS_BOUTIQUE.has(tag)) ||
      vus.has(o.name)
    ) {
      continue;
    }
    vus.add(o.name);
    const stats = /<stats>(.*?)<\/stats>/s.exec(o.description)?.[1] ?? "";
    objets.push({
      id,
      nom: o.name,
      prix: o.gold.total,
      stats: stats
        .split(/<br\s*\/?>/)
        .map(texteSeul)
        .filter(Boolean),
      composants: [
        ...new Set((o.from ?? []).map((composant) => data[composant]?.name)),
      ].filter((nom): nom is string => Boolean(nom)),
      description: texteSeul(o.plaintext ?? ""),
    });
  }
  return objets;
};

const lis = async (lang: Lang): Promise<Donnees> => {
  const version = await derniereVersion();
  const base = `${DDRAGON}/cdn/${version}/data/${LOCALES[lang]}`;
  const [champions, objets] = await Promise.all([
    fetch(`${base}/championFull.json`).then(
      (r) => r.json() as Promise<{ data: Record<string, ChampionDD> }>,
    ),
    fetch(`${base}/item.json`).then(
      (r) => r.json() as Promise<{ data: Record<string, ObjetDD> }>,
    ),
  ]);
  return {
    version,
    champions: Object.values(champions.data).map(versChampion),
    objets: versObjets(objets.data),
  };
};

export const donnees = memorise(lis);

export const iconeObjet = (version: string, id: string): string =>
  `${DDRAGON}/cdn/${version}/img/item/${id}.png`;

export interface ChampionClasse {
  id: string;
  nom: string;
  classes: string[];
}

/** Le seul champion.json : les classes sans les sorts ni les skins, pour qui n'en a pas besoin. */
export const classes = memorise(async (lang: Lang) => {
  const version = await derniereVersion();
  const lu = (await (
    await fetch(`${DDRAGON}/cdn/${version}/data/${LOCALES[lang]}/champion.json`)
  ).json()) as {
    data: Record<string, { id: string; name: string; tags: string[] }>;
  };
  return {
    version,
    champions: Object.values(lu.data).map((c): ChampionClasse => ({
      id: c.id,
      nom: c.name,
      classes: c.tags,
    })),
  };
});
