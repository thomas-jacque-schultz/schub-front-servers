import {
  Relais,
  inkColors,
  type MacroColor,
  type MacroCursor,
  type MapPoint,
  type RelaisEvenement,
  type RelaisJoueur,
} from "../../common";
import type { Canal, EcouteCanal } from "./canal";
import {
  appliqueTout,
  lisOperation,
  nouvelId,
  type Operation,
  type Plan,
} from "./plan";

export type Connexion = "connexion" | "salon" | "reconnexion" | "refuse";
export type Enregistrement =
  { etat: "a-jour"; a: Date | null } | { etat: "en-cours" } | { etat: "echec" };

export interface EtatEquipe {
  connexion: Connexion;
  membres: RelaisJoueur[];
  curseurs: MacroCursor[];
  enregistrement: Enregistrement;
}

export interface OptionsCanalEquipe {
  teamId: string;
  planId: string;
  nom: string;
  /** Le plan tel que le cœur l'a enregistré. */
  charge: () => Promise<Plan>;
  enregistre: (plan: Plan) => Promise<void>;
  /** Un laissez-passer du salon, signé par le BFF pour un membre. */
  pass: () => Promise<string>;
  surEtat: (etat: EtatEquipe) => void;
}

const JEU = "macro";
// Un message du relais pèse 32 Ko au plus : les opérations partent par paquets.
const PAQUET_MAX = 24_000;
const ENREGISTRE_APRES_MS = 1_500;
const CURSEUR_MS = 80;

const couleurDe = (id: string): MacroColor => {
  let somme = 0;
  for (const lettre of id) {
    somme = (somme * 31 + lettre.charCodeAt(0)) >>> 0;
  }
  return inkColors[somme % inkColors.length];
};

/**
 * Le plan d'une équipe, à plusieurs (Schub#171) : le salon privé du relais, ouvert par laissez-passer. À chaque
 * connexion, le plan enregistré (Schub#172) se recharge, puis l'historique du salon s'y rejoue : les opérations sont
 * idempotentes. Seul le meneur du salon enregistre, peu après la dernière modification.
 */
export class CanalEquipe implements Canal {
  private readonly moi = nouvelId();
  private relais: Relais | null = null;
  private base: Plan = [];
  private plan: Plan = [];
  private meneur = false;
  private sale = false;
  private minuterie: number | undefined;
  private dernierCurseur = 0;
  private etat: EtatEquipe = {
    connexion: "connexion",
    membres: [],
    curseurs: [],
    enregistrement: { etat: "a-jour", a: null },
  };

  constructor(private readonly options: OptionsCanalEquipe) {}

  ouvre(ecoute: EcouteCanal) {
    const { teamId, planId, nom } = this.options;
    this.relais = new Relais(
      `${teamId}.${planId}`,
      JEU,
      { id: this.moi, name: nom.slice(0, 24) || "?" },
      (evenement) => this.recoit(evenement, ecoute),
      { pass: () => this.prepare() },
    );
    return () => {
      window.clearTimeout(this.minuterie);
      if (this.meneur && this.sale) {
        void this.options.enregistre(this.plan);
      }
      this.relais?.ferme();
    };
  }

  envoie(operations: Operation[]) {
    this.plan = appliqueTout(this.plan, operations);
    let paquet: Operation[] = [];
    let poids = 0;
    for (const operation of operations) {
      const taille = JSON.stringify(operation).length;
      if (paquet.length > 0 && poids + taille > PAQUET_MAX) {
        this.relais?.envoie({ ops: paquet }, true);
        paquet = [];
        poids = 0;
      }
      paquet.push(operation);
      poids += taille;
    }
    if (paquet.length > 0) {
      this.relais?.envoie({ ops: paquet }, true);
    }
    this.modifie();
  }

  /** Le curseur de ce membre ; null quand il quitte la carte. */
  curseur(point: MapPoint | null) {
    const maintenant = Date.now();
    if (point && maintenant - this.dernierCurseur < CURSEUR_MS) {
      return;
    }
    this.dernierCurseur = maintenant;
    this.relais?.envoie({ curseur: point }, false);
  }

  // Avant chaque connexion : le plan enregistré, qui sert de base à l'historique, et un laissez-passer neuf.
  private async prepare() {
    const [base, pass] = await Promise.all([
      this.options.charge(),
      this.options.pass(),
    ]);
    this.base = base;
    return pass;
  }

  private recoit(evenement: RelaisEvenement, ecoute: EcouteCanal) {
    switch (evenement.type) {
      case "joined":
        this.plan = appliqueTout(
          this.base,
          evenement.history.flatMap((message) => this.operationsDe(message)),
        );
        ecoute.depart(this.plan);
        this.presence(evenement.players, evenement.leader);
        this.publie({ connexion: "salon" });
        break;
      case "presence":
        this.presence(evenement.players, evenement.leader);
        break;
      case "message": {
        const lu = evenement.data as { curseur?: unknown } | null;
        if (lu && "curseur" in lu) {
          this.curseurDe(evenement.from, lu.curseur);
          break;
        }
        const operations = this.operationsDe(evenement.data);
        if (operations.length > 0) {
          this.plan = appliqueTout(this.plan, operations);
          ecoute.recoit(operations);
          this.modifie();
        }
        break;
      }
      case "deconnecte":
        this.meneur = false;
        this.publie({ connexion: "reconnexion", curseurs: [] });
        break;
      case "error":
        if (evenement.code === "FORBIDDEN") {
          this.publie({ connexion: "refuse" });
        }
        break;
      case "cleared":
        break;
    }
  }

  private operationsDe(message: unknown): Operation[] {
    const ops = (message as { ops?: unknown } | null)?.ops;
    return Array.isArray(ops)
      ? ops.map(lisOperation).filter((op): op is Operation => op !== null)
      : [];
  }

  private presence(membres: RelaisJoueur[], meneur: string | null) {
    const etaitMeneur = this.meneur;
    this.meneur = meneur === this.moi;
    // Le meneur parti a pu laisser des modifications non enregistrées : le suivant enregistre.
    if (this.meneur && !etaitMeneur) {
      this.modifie();
    }
    const presents = new Set(membres.map((membre) => membre.id));
    this.publie({
      membres,
      curseurs: this.etat.curseurs.filter((c) => presents.has(c.id)),
    });
  }

  private curseurDe(id: string | null, valeur: unknown) {
    if (!id || id === this.moi) {
      return;
    }
    const autres = this.etat.curseurs.filter((c) => c.id !== id);
    const point = valeur as MapPoint | null;
    const membre = this.etat.membres.find((m) => m.id === id);
    if (
      point &&
      membre &&
      typeof point.x === "number" &&
      typeof point.y === "number"
    ) {
      autres.push({
        id,
        name: membre.name,
        at: { x: point.x, y: point.y },
        color: couleurDe(id),
      });
    }
    this.publie({ curseurs: autres });
  }

  private modifie() {
    this.sale = true;
    if (!this.meneur) {
      return;
    }
    window.clearTimeout(this.minuterie);
    this.minuterie = window.setTimeout(() => {
      this.sale = false;
      this.publie({ enregistrement: { etat: "en-cours" } });
      this.options.enregistre(this.plan).then(
        () =>
          this.publie({ enregistrement: { etat: "a-jour", a: new Date() } }),
        () => {
          this.sale = true;
          this.publie({ enregistrement: { etat: "echec" } });
        },
      );
    }, ENREGISTRE_APRES_MS);
  }

  private publie(changement: Partial<EtatEquipe>) {
    this.etat = { ...this.etat, ...changement };
    this.options.surEtat(this.etat);
  }
}
