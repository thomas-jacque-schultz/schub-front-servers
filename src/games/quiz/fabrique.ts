import { DDRAGON, icone, LOCALES, splash } from "../commun/champions";
import {
  type ChampionComplet,
  type Donnees,
  iconeObjet,
  type Objet,
} from "../commun/ddragon";
import { type Hasard, normalise, tire } from "../commun/devinette";
import { type Lang, traduction } from "../commun/textes";
import type { Univers } from "../commun/univers";
import type { Libelles, QuestionBanque, Theme } from "./questions";

// La fabrique des questions tirées de Data Dragon et d'Univers (Schub#142, #143). Elle ne tourne plus pendant la
// partie : `npm run quiz:fabrique` écrit des questions bilingues, versées dans la banque où l'OWNER les relit et les
// corrige. La bonne réponse est toujours la première des quatre, comme dans la banque.

export interface Lectures {
  date: string;
  fr: Donnees;
  en: Donnees;
  univers: Record<Lang, Univers> | null;
}

export type Quotas = Record<Exclude<Theme, "pros">, number>;

const LANGS: Lang[] = ["fr", "en"];
const MASQUE = "▢▢▢";
const HISTOIRE_MAX = 280;
const MEMBRES_GAMME = 6;
const ESSAIS = 60;
const UNIVERS_SOURCE = "https://universe.leagueoflegends.com/";

const libelle = traduction({
  fr: {
    po: "{n} PO",
    objetRecette: "Avec quoi se construit {nom} ?",
    objetRecetteExplication: "{nom} : {composants}, {prix} au total.",
    objetPrix: "Combien coûte {nom} ?",
    objetPrixExplication: "{nom} coûte {prix} au total (patch {version}).",
    histoireQui: "De quel champion parle cette histoire ? « {extrait} »",
    titreDe: "Quel est le titre du champion {nom} ?",
    histoireExplication: "{nom}, {titre}.",
    skinSplash: "À quel champion appartient ce skin ?",
    skinSplashExplication: "C'est {skin}.",
    skinVrai: "Lequel de ces skins existe vraiment ?",
    skinVraiExplication: "{skin} existe ; les trois autres sont inventés.",
    skinGamme: "À quelle gamme appartient ce skin ?",
    skinGammeExplication: "C'est {skin}, de la gamme {gamme}.",
    skinsNombre: "Combien de skins a {nom}, hors skin de base et chromas ?",
    skinsNombreExplication:
      "{n} skins pour {nom} selon Data Dragon (patch {version}).",
    regionDe: "De quelle région vient {nom} ?",
    regionExplication:
      "{nom} est rattaché à la région {region}, selon le site Univers de Riot.",
    vientDe: "Lequel de ces champions vient de la région {region} ?",
    premierSorti: "Lequel de ces champions est sorti en premier ?",
  },
  en: {
    po: "{n} gold",
    objetRecette: "What is {nom} built from?",
    objetRecetteExplication: "{nom}: {composants}, {prix} in total.",
    objetPrix: "How much does {nom} cost?",
    objetPrixExplication: "{nom} costs {prix} in total (patch {version}).",
    histoireQui: 'Which champion is this story about? "{extrait}"',
    titreDe: "What is {nom}'s title?",
    histoireExplication: "{nom}, {titre}.",
    skinSplash: "Which champion does this skin belong to?",
    skinSplashExplication: "It is {skin}.",
    skinVrai: "Which of these skins really exists?",
    skinVraiExplication: "{skin} exists; the other three are made up.",
    skinGamme: "Which skin line does this skin belong to?",
    skinGammeExplication: "It is {skin}, from the {gamme} line.",
    skinsNombre:
      "How many skins does {nom} have, base skin and chromas excluded?",
    skinsNombreExplication:
      "{n} skins for {nom} according to Data Dragon (patch {version}).",
    regionDe: "Which region does {nom} come from?",
    regionExplication:
      "{nom} comes from {region}, according to Riot's Universe site.",
    vientDe: "Which of these champions comes from {region}?",
    premierSorti: "Which of these champions was released first?",
  },
});

type Bilingue = Record<Lang, Libelles>;

const bilingue = (f: (lang: Lang) => Libelles): Bilingue => ({
  fr: f("fr"),
  en: f("en"),
});

const patch = (version: string) => version.split(".").slice(0, 2).join(".");

const slug = (texte: string) =>
  normalise(texte.replace(/[^\p{L}\p{N}]+/gu, " ").trim()).slice(0, 24) || "x";

const echappe = (texte: string) => texte.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** L'histoire sans le nom du champion : chaque mot de son nom est masqué. */
export const masqueNom = (histoire: string, nom: string): string => {
  const mots = nom
    .split(/[\s']+/)
    .filter((mot) => mot.length >= 2)
    .map(echappe);
  const masque = mots.reduce(
    (texteMasque, mot) =>
      texteMasque.replace(new RegExp(`\\b${mot}\\b`, "giu"), MASQUE),
    histoire,
  );
  if (masque.length <= HISTOIRE_MAX) {
    return masque;
  }
  const coupe = masque.slice(0, HISTOIRE_MAX);
  const point = coupe.lastIndexOf(". ");
  return point > 80 ? coupe.slice(0, point + 1) : `${coupe}…`;
};

/** La gamme d'un skin, par son nom : ce qui reste quand on retire celui du champion, devant ou derrière. */
export const formeDe = (
  skin: string,
  champion: string,
): { forme: string; avant: boolean } | null => {
  if (skin.startsWith(`${champion} `)) {
    return { forme: skin.slice(champion.length + 1), avant: false };
  }
  if (skin.endsWith(` ${champion}`)) {
    return { forme: skin.slice(0, -champion.length - 1), avant: true };
  }
  return null;
};

export interface Gamme {
  cle: string;
  formes: Record<Lang, { forme: string; avant: boolean }>;
  membres: { id: string; num: number }[];
  /** Les genres de ses membres : une gamme toute féminine ne reçoit pas de faux skin masculin. */
  genres: Genre[];
}

export type Genre = "f" | "m";

/** Le genre d'un champion, d'après les pronoms de son histoire en français. */
export const genreDe = (histoire: string): Genre =>
  (histoire.match(/\belle\b/gi)?.length ?? 0) >
  (histoire.match(/\bil\b/gi)?.length ?? 0)
    ? "f"
    : "m";

/**
 * Les gammes dont le nom ne change pas d'un champion à l'autre. En français, « Ahri gardienne des étoiles » mais
 * « Ezreal gardien des étoiles » : un faux skin mal accordé se trahirait. Une gamme n'est retenue que si tous ses
 * membres, au moins six, portent la même forme dans les deux langues.
 */
export const gammes = (fr: ChampionComplet[], en: ChampionComplet[]) => {
  const parCle = new Map<
    string,
    {
      membres: Gamme["membres"];
      formes: Set<string>;
      premiere: Gamme["formes"];
    }
  >();
  for (const championFr of fr) {
    const championEn = en.find((c) => c.id === championFr.id);
    if (!championEn) {
      continue;
    }
    for (const skinFr of championFr.skins) {
      const skinEn = championEn.skins.find((s) => s.num === skinFr.num);
      const formeFr = formeDe(skinFr.nom, championFr.nom);
      const formeEn = skinEn && formeDe(skinEn.nom, championEn.nom);
      if (!formeFr || !formeEn || /prestige|\(/i.test(formeEn.forme)) {
        continue;
      }
      const cle = formeEn.forme.toLowerCase();
      const gamme = parCle.get(cle) ?? {
        membres: [],
        formes: new Set<string>(),
        premiere: { fr: formeFr, en: formeEn },
      };
      gamme.membres.push({ id: championFr.id, num: skinFr.num });
      gamme.formes.add(JSON.stringify([formeFr, formeEn]));
      parCle.set(cle, gamme);
    }
  }
  return [...parCle.entries()]
    .filter(
      ([, g]) =>
        g.formes.size === 1 &&
        new Set(g.membres.map((m) => m.id)).size >= MEMBRES_GAMME,
    )
    .map(([cle, g]): Gamme => ({
      cle: slug(cle),
      formes: g.premiere,
      membres: g.membres,
      genres: [
        ...new Set(
          g.membres.map(({ id }) =>
            genreDe(fr.find((c) => c.id === id)?.histoire ?? ""),
          ),
        ),
      ],
    }));
};

/** Une majuscule en tête, sauf pour un nom déjà stylisé (iG, K/DA). */
const capitale = (texte: string) =>
  /^\p{Ll}\p{Ll}/u.test(texte)
    ? texte.charAt(0).toUpperCase() + texte.slice(1)
    : texte;

const nomDeGamme = ({ forme }: { forme: string }) =>
  capitale(forme.replace(/^(de la |de l'|du |des |de )/i, ""));

const nomCompose = (
  { forme, avant }: { forme: string; avant: boolean },
  champion: string,
) => (avant ? `${forme} ${champion}` : `${champion} ${forme}`);

/** Le contexte d'une fabrication : les deux langues, retrouvées par identifiant. */
class Fabrique {
  private readonly l: Lectures;
  private readonly hasard: Hasard;
  private readonly version: string;
  private readonly gammes: Gamme[];

  constructor(l: Lectures, hasard: Hasard) {
    this.l = l;
    this.hasard = hasard;
    this.version = l.fr.version;
    this.gammes = gammes(l.fr.champions, l.en.champions);
  }

  private champion(lang: Lang, id: string) {
    return this.l[lang].champions.find((c) => c.id === id)!;
  }

  private objet(lang: Lang, id: string) {
    return this.l[lang].objets.find((o) => o.id === id);
  }

  private tirer<T>(liste: T[], n: number) {
    return tire(liste, n, this.hasard).tires;
  }

  private source(lang: Lang, fichier: "item" | "championFull") {
    return `${DDRAGON}/cdn/${this.version}/data/${LOCALES[lang]}/${fichier}.json`;
  }

  private question(
    id: string,
    theme: Theme,
    source: string,
    textes: Bilingue,
    images: { image?: string; imagesChoix?: string[][] } = {},
  ): QuestionBanque | null {
    const distincts = LANGS.every(
      (lang) => new Set(textes[lang].choix).size === 4,
    );
    return distincts
      ? {
          id: id.slice(0, 80).replace(/-+$/, ""),
          theme,
          date: this.l.date,
          source,
          image: images.image ?? null,
          imagesChoix: images.imagesChoix ?? null,
          ...textes,
        }
      : null;
  }

  private prix(lang: Lang, n: number) {
    return libelle(lang, "po", {
      n: n.toLocaleString(lang === "fr" ? "fr-FR" : "en-US"),
    });
  }

  objetRecette(): QuestionBanque | null {
    const avecRecette = this.l.fr.objets.filter(
      (o) => o.composantIds.length >= 2,
    );
    const [o] = this.tirer(avecRecette, 1);
    if (!o) {
      return null;
    }
    const recette = (x: Objet) => [...x.composantIds].sort().join("+");
    const partagent = avecRecette.filter(
      (x) =>
        recette(x) !== recette(o) &&
        x.composantIds.some((c) => o.composantIds.includes(c)),
    );
    const autres = this.tirer(
      partagent.length >= 3
        ? partagent
        : avecRecette.filter((x) => recette(x) !== recette(o)),
      3,
    );
    const rangees = [o, ...autres].map((x) => x.composantIds);
    if (new Set(rangees.map((r) => [...r].sort().join("+"))).size !== 4) {
      return null;
    }
    const noms = (lang: Lang, ids: string[]) =>
      ids.map((id) => this.objet(lang, id)?.nom ?? id).join(" + ");
    return this.question(
      `objet-recette-${o.id}`,
      "objets",
      this.source("fr", "item"),
      bilingue((lang) => {
        const nom = this.objet(lang, o.id)?.nom ?? o.nom;
        return {
          enonce: libelle(lang, "objetRecette", { nom }),
          choix: rangees.map((r) => noms(lang, r)),
          explication: libelle(lang, "objetRecetteExplication", {
            nom,
            composants: noms(lang, o.composantIds),
            prix: this.prix(lang, o.prix),
          }),
        };
      }),
      {
        image: iconeObjet(this.version, o.id),
        imagesChoix: rangees.map((r) =>
          r.map((id) => iconeObjet(this.version, id)),
        ),
      },
    );
  }

  objetPrix(): QuestionBanque | null {
    const [o] = this.tirer(
      this.l.fr.objets.filter((x) => x.prix >= 300),
      1,
    );
    if (!o) {
      return null;
    }
    const voisins = this.tirer(
      [-3, -2, -1, 1, 2, 3, 4]
        .map((k) => o.prix + k * 100)
        .filter((v) => v > 0),
      3,
    );
    return this.question(
      `objet-prix-${o.id}`,
      "objets",
      this.source("fr", "item"),
      bilingue((lang) => {
        const nom = this.objet(lang, o.id)?.nom ?? o.nom;
        return {
          enonce: libelle(lang, "objetPrix", { nom }),
          choix: [o.prix, ...voisins].map((n) => this.prix(lang, n)),
          explication: libelle(lang, "objetPrixExplication", {
            nom,
            prix: this.prix(lang, o.prix),
            version: patch(this.version),
          }),
        };
      }),
      { image: iconeObjet(this.version, o.id) },
    );
  }

  private memeClasse(c: ChampionComplet, n: number) {
    const pareils = this.l.fr.champions.filter(
      (b) => b.id !== c.id && b.classes[0] === c.classes[0],
    );
    return this.tirer(
      pareils.length >= n
        ? pareils
        : this.l.fr.champions.filter((b) => b.id !== c.id),
      n,
    );
  }

  histoire(): QuestionBanque | null {
    const [c] = this.tirer(
      this.l.fr.champions.filter((b) => b.histoire),
      1,
    );
    if (!c) {
      return null;
    }
    const ids = [c, ...this.memeClasse(c, 3)].map((b) => b.id);
    const nomVisible = LANGS.some((lang) => {
      const x = this.champion(lang, c.id);
      return new RegExp(`\\b${echappe(x.nom)}\\b`, "iu").test(
        masqueNom(x.histoire, x.nom),
      );
    });
    if (nomVisible) {
      return null;
    }
    return this.question(
      `histoire-${c.id.toLowerCase()}`,
      "histoire",
      this.source("fr", "championFull"),
      bilingue((lang) => {
        const x = this.champion(lang, c.id);
        return {
          enonce: libelle(lang, "histoireQui", {
            extrait: masqueNom(x.histoire, x.nom),
          }),
          choix: ids.map((id) => this.champion(lang, id).nom),
          explication: libelle(lang, "histoireExplication", {
            nom: x.nom,
            titre: x.titre,
          }),
        };
      }),
    );
  }

  titre(): QuestionBanque | null {
    const [c] = this.tirer(this.l.fr.champions, 1);
    if (!c) {
      return null;
    }
    const ids = [
      c,
      ...this.tirer(
        this.l.fr.champions.filter((b) => b.id !== c.id && b.titre),
        3,
      ),
    ].map((b) => b.id);
    return this.question(
      `titre-${c.id.toLowerCase()}`,
      "histoire",
      this.source("fr", "championFull"),
      bilingue((lang) => {
        const x = this.champion(lang, c.id);
        return {
          enonce: libelle(lang, "titreDe", { nom: x.nom }),
          choix: ids.map((id) => capitale(this.champion(lang, id).titre)),
          explication: libelle(lang, "histoireExplication", {
            nom: x.nom,
            titre: x.titre,
          }),
        };
      }),
      { image: icone(this.version, c.id) },
    );
  }

  skinSplash(): QuestionBanque | null {
    const [c] = this.tirer(
      this.l.fr.champions.filter((b) => b.skins.length > 0),
      1,
    );
    if (!c) {
      return null;
    }
    const [skin] = this.tirer(c.skins, 1);
    const ids = [c, ...this.memeClasse(c, 3)].map((b) => b.id);
    return this.question(
      `skin-splash-${c.id.toLowerCase()}-${skin.num}`,
      "skins",
      this.source("fr", "championFull"),
      bilingue((lang) => ({
        enonce: libelle(lang, "skinSplash"),
        choix: ids.map((id) => this.champion(lang, id).nom),
        explication: libelle(lang, "skinSplashExplication", {
          skin: this.nomDuSkin(lang, c.id, skin.num),
        }),
      })),
      { image: splash(c.id, skin.num) },
    );
  }

  private nomDuSkin(lang: Lang, id: string, num: number) {
    return (
      this.champion(lang, id).skins.find((s) => s.num === num)?.nom ??
      this.champion(lang, id).nom
    );
  }

  skinVrai(): QuestionBanque | null {
    const [g] = this.tirer(this.gammes, 1);
    if (!g) {
      return null;
    }
    const [vrai] = this.tirer(g.membres, 1);
    const dedans = new Set(g.membres.map((m) => m.id));
    const faux = this.tirer(
      this.l.fr.champions.filter(
        (c) => !dedans.has(c.id) && g.genres.includes(genreDe(c.histoire)),
      ),
      3,
    ).map((c) => c.id);
    if (faux.length < 3) {
      return null;
    }
    return this.question(
      `skin-vrai-${g.cle}-${vrai.id.toLowerCase()}`,
      "skins",
      this.source("fr", "championFull"),
      bilingue((lang) => {
        const skin = this.nomDuSkin(lang, vrai.id, vrai.num);
        return {
          enonce: libelle(lang, "skinVrai"),
          choix: [
            skin,
            ...faux.map((id) =>
              nomCompose(g.formes[lang], this.champion(lang, id).nom),
            ),
          ],
          explication: libelle(lang, "skinVraiExplication", { skin }),
        };
      }),
    );
  }

  skinGamme(): QuestionBanque | null {
    const [g, ...autres] = this.tirer(this.gammes, 4);
    if (!g || autres.length < 3) {
      return null;
    }
    const [skin] = this.tirer(g.membres, 1);
    return this.question(
      `skin-gamme-${skin.id.toLowerCase()}-${skin.num}`,
      "skins",
      this.source("fr", "championFull"),
      bilingue((lang) => ({
        enonce: libelle(lang, "skinGamme"),
        choix: [g, ...autres].map((x) => nomDeGamme(x.formes[lang])),
        explication: libelle(lang, "skinGammeExplication", {
          skin: this.nomDuSkin(lang, skin.id, skin.num),
          gamme: nomDeGamme(g.formes[lang]),
        }),
      })),
      { image: splash(skin.id, skin.num) },
    );
  }

  skinsNombre(): QuestionBanque | null {
    const [c] = this.tirer(
      this.l.fr.champions.filter((b) => b.skins.length > 3),
      1,
    );
    if (!c) {
      return null;
    }
    const n = c.skins.length;
    const voisins = this.tirer(
      [-3, -2, -1, 1, 2, 3].map((k) => n + k).filter((v) => v > 0),
      3,
    );
    return this.question(
      `skins-nombre-${c.id.toLowerCase()}`,
      "skins",
      this.source("fr", "championFull"),
      bilingue((lang) => {
        const nom = this.champion(lang, c.id).nom;
        return {
          enonce: libelle(lang, "skinsNombre", { nom }),
          choix: [n, ...voisins].map(String),
          explication: libelle(lang, "skinsNombreExplication", {
            nom,
            n,
            version: patch(this.version),
          }),
        };
      }),
      { image: icone(this.version, c.id) },
    );
  }

  /** Les champions jouables situés par Univers, retrouvés dans les deux langues par leur nom. */
  private situes() {
    const u = this.l.univers;
    if (!u) {
      return [];
    }
    return this.l.fr.champions.flatMap((c) => {
      const fr = u.fr.champions.find((x) => x.cle === normalise(c.nom));
      const nomEn = this.champion("en", c.id).nom;
      const en = u.en.champions.find((x) => x.cle === normalise(nomEn));
      return fr && en
        ? [{ id: c.id, region: fr.region, sortie: fr.sortie }]
        : [];
    });
  }

  private region(lang: Lang, slugRegion: string) {
    return this.l.univers?.[lang].regions[slugRegion] ?? slugRegion;
  }

  regionDe(): QuestionBanque | null {
    const situes = this.situes().filter((c) => c.region !== null);
    const [c] = this.tirer(situes, 1);
    if (!c?.region) {
      return null;
    }
    const autres = this.tirer(
      [...new Set(situes.map((b) => b.region!))].filter((r) => r !== c.region),
      3,
    );
    const regions = [c.region, ...autres];
    return this.question(
      `region-${c.id.toLowerCase()}`,
      "monde",
      UNIVERS_SOURCE,
      bilingue((lang) => {
        const nom = this.champion(lang, c.id).nom;
        return {
          enonce: libelle(lang, "regionDe", { nom }),
          choix: regions.map((r) => this.region(lang, r)),
          explication: libelle(lang, "regionExplication", {
            nom,
            region: this.region(lang, c.region!),
          }),
        };
      }),
      { image: icone(this.version, c.id) },
    );
  }

  vientDe(): QuestionBanque | null {
    const situes = this.situes().filter((c) => c.region !== null);
    const [c] = this.tirer(situes, 1);
    if (!c?.region) {
      return null;
    }
    const autres = this.tirer(
      situes.filter((b) => b.region !== c.region),
      3,
    );
    const ids = [c, ...autres].map((b) => b.id);
    return this.question(
      `vient-de-${slug(c.region)}-${c.id.toLowerCase()}`,
      "monde",
      UNIVERS_SOURCE,
      bilingue((lang) => {
        const region = this.region(lang, c.region!);
        const nom = this.champion(lang, c.id).nom;
        return {
          enonce: libelle(lang, "vientDe", { region }),
          choix: ids.map((id) => this.champion(lang, id).nom),
          explication: libelle(lang, "regionExplication", { nom, region }),
        };
      }),
    );
  }

  premierSorti(): QuestionBanque | null {
    const parAnnee = new Map<string, ReturnType<Fabrique["situes"]>[number]>();
    for (const c of this.tirer(this.situes(), Infinity)) {
      const annee = c.sortie.slice(0, 4);
      if (/^\d{4}$/.test(annee) && !parAnnee.has(annee)) {
        parAnnee.set(annee, c);
      }
    }
    const quatre = this.tirer([...parAnnee.values()], 4).sort((a, b) =>
      a.sortie.localeCompare(b.sortie),
    );
    if (quatre.length < 4) {
      return null;
    }
    return this.question(
      `sortie-${quatre.map((c) => c.id.toLowerCase().slice(0, 12)).join("-")}`,
      "monde",
      UNIVERS_SOURCE,
      bilingue((lang) => ({
        enonce: libelle(lang, "premierSorti"),
        choix: quatre.map((c) => this.champion(lang, c.id).nom),
        explication: quatre
          .map(
            (c) => `${this.champion(lang, c.id).nom} (${c.sortie.slice(0, 4)})`,
          )
          .join(", "),
      })),
    );
  }
}

/** Les sortes de questions de chaque thème, avec leur poids dans le tirage. */
const SORTES: Record<keyof Quotas, [keyof Fabrique, number][]> = {
  objets: [
    ["objetRecette", 1],
    ["objetPrix", 1],
  ],
  histoire: [
    ["histoire", 3],
    ["titre", 2],
  ],
  skins: [
    ["skinSplash", 3],
    ["skinVrai", 3],
    ["skinGamme", 3],
    ["skinsNombre", 1],
  ],
  monde: [
    ["regionDe", 2],
    ["vientDe", 2],
    ["premierSorti", 1],
  ],
};

/** Des questions neuves pour chaque thème, jamais deux fois la même clé ni une clé déjà en banque. */
export const fabrique = (
  l: Lectures,
  quotas: Quotas,
  hasard: Hasard,
  dejaEnBanque: string[] = [],
): QuestionBanque[] => {
  const atelier = new Fabrique(l, hasard);
  const vues = new Set(dejaEnBanque);
  const faites: QuestionBanque[] = [];
  for (const [theme, sortes] of Object.entries(SORTES) as [
    keyof Quotas,
    [keyof Fabrique, number][],
  ][]) {
    const total = sortes.reduce((n, [, poids]) => n + poids, 0);
    for (const [sorte, poids] of sortes) {
      const voulues = Math.round((quotas[theme] * poids) / total);
      let faitesIci = 0;
      for (
        let essai = 0;
        essai < voulues * ESSAIS && faitesIci < voulues;
        essai++
      ) {
        const q = (atelier[sorte] as () => QuestionBanque | null).call(atelier);
        if (q && !vues.has(q.id)) {
          vues.add(q.id);
          faites.push(q);
          faitesIci++;
        }
      }
    }
  }
  return faites;
};
