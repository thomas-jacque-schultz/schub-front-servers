import { appliqueTout, lisPlan, type Operation, type Plan } from "./plan";

export interface EcouteCanal {
  /** Le plan de départ, et de nouveau après une reconnexion. */
  depart: (plan: Plan) => void;
  /** Les opérations des autres. */
  recoit: (operations: Operation[]) => void;
}

/**
 * Ce qui transporte les opérations du Macro Planner (Schub#166). La carte ne sait pas lequel elle a : le stockage du
 * navigateur sur /ruler, le salon de l'équipe dans son onglet.
 */
export interface Canal {
  ouvre(ecoute: EcouteCanal): () => void;
  envoie(operations: Operation[]): void;
}

/** Seul, hors connexion : le plan reste dans ce navigateur. */
export class CanalLocal implements Canal {
  private plan: Plan = [];

  constructor(
    private readonly cle: string,
    private readonly initial: () => Plan,
  ) {}

  ouvre(ecoute: EcouteCanal) {
    let garde: unknown = null;
    try {
      garde = JSON.parse(localStorage.getItem(this.cle) ?? "null");
    } catch {
      // Stockage refusé ou contenu illisible : le plan de départ.
    }
    this.plan = Array.isArray(garde) ? lisPlan(garde) : this.initial();
    ecoute.depart(this.plan);
    return () => undefined;
  }

  envoie(operations: Operation[]) {
    this.plan = appliqueTout(this.plan, operations);
    try {
      localStorage.setItem(this.cle, JSON.stringify(this.plan));
    } catch {
      // Navigation privée ou quota plein : le plan vit le temps de la page.
    }
  }
}
