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

// Le type d'un objet, indice d'une énigme (Schub#161) : tous les rôles qu'il sert, « support, mage » plutôt que la
// seule colonne de la grille. Les règles lisent les tags autrement que la grille : un objet de tank n'a ni dégâts ni
// puissance, un objet de tireur a ses critiques ou sa vitesse d'attaque sans points de vie.
const ROLES: [Famille, (a: A) => boolean][] = [
  [
    "support",
    (a) =>
      (a("ManaRegen") &&
        !a("Damage") &&
        !a("CriticalStrike") &&
        !(a("Mana") && a("SpellDamage"))) ||
      (a("Aura") && a("Active")),
  ],
  ["mage", (a) => a("SpellDamage") || (a("MagicPenetration") && !a("Damage"))],
  [
    "tireur",
    (a) =>
      a("CriticalStrike") || (a("AttackSpeed") && a("Damage") && !a("Health")),
  ],
  [
    "assassin",
    (a) => a("ArmorPenetration") && !a("CriticalStrike") && !a("AttackSpeed"),
  ],
  [
    "combattant",
    (a) =>
      a("Damage") &&
      !a("CriticalStrike") &&
      (a("Health") || a("Armor") || a("SpellBlock") || a("Tenacity")),
  ],
  [
    "tank",
    (a) =>
      (a("Health") || a("Armor") || a("SpellBlock")) &&
      !a("Damage") &&
      !a("SpellDamage") &&
      !a("CriticalStrike") &&
      !a("ManaRegen"),
  ],
];

/** Des bottes et un objet de départ se disent tels quels ; un objet qu'aucun rôle ne décrit garde sa famille. */
export const typesDe = ({ tags }: Pick<Objet, "tags">): Famille[] => {
  const famille = familleDe({ tags });
  if (famille === "bottes" || famille === "depart") {
    return [famille];
  }
  const a: A = (tag) => tags.includes(tag);
  const roles = ROLES.filter(([, regle]) => regle(a)).map(([role]) => role);
  return roles.length > 0 ? roles : [famille];
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
