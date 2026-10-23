import type { Objet } from "../commun/ddragon";
import { type Hasard, tire } from "../commun/devinette";

// Les colonnes de la grille, à la manière de la boutique (Schub#144). Data Dragon ne sert pas la famille d'un
// objet, seulement ses tags : la première règle qui s'applique range l'objet.

export const FAMILLES = [
  "bottes",
  "depart",
  "support",
  "mage",
  "tireur",
  "assassin",
  "combattant",
  "tank",
] as const;
export type Famille = (typeof FAMILLES)[number];

type A = (tag: string) => boolean;

const REGLES: [Famille, (a: A) => boolean][] = [
  ["bottes", (a) => a("Boots")],
  ["depart", (a) => a("Lane")],
  ["support", (a) => a("GoldPer") || (a("ManaRegen") && !a("Mana"))],
  [
    "mage",
    (a) =>
      a("SpellDamage") || a("MagicPenetration") || (a("Mana") && !a("Damage")),
  ],
  ["tireur", (a) => a("CriticalStrike") || a("AttackSpeed")],
  ["assassin", (a) => a("ArmorPenetration")],
  ["combattant", (a) => a("Damage")],
];

export const familleDe = ({ tags }: Pick<Objet, "tags">): Famille => {
  const a: A = (tag) => tags.includes(tag);
  return REGLES.find(([, regle]) => regle(a))?.[0] ?? "tank";
};

/** Chaque famille dans un ordre tiré au sort : rangées par prix, les icônes donneraient la réponse au prix. */
export const grille = (
  objets: Objet[],
  hasard: Hasard,
): { famille: Famille; objets: Objet[] }[] =>
  FAMILLES.map((famille) => {
    const siens = objets.filter((o) => familleDe(o) === famille);
    return { famille, objets: tire(siens, siens.length, hasard).tires };
  }).filter((colonne) => colonne.objets.length > 0);
