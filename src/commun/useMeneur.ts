import { useCallback, useEffect, useRef, useState } from "react";
import type { Hasard, Present } from "./devinette";
import type { Joueur } from "./relay";

// Les règles tournent chez le meneur, qui diffuse l'état entier à chaque changement (Schub#118) : un joueur
// qui arrive le reçoit au suivant, et le joueur suivant reprend du dernier état reçu si le meneur part.

export interface EtatDePartie {
  phase: string;
  restantMs: number;
}

export interface Regles<P extends EtatDePartie> {
  estEtat: (data: unknown) => data is P;
  enCours: (p: P) => boolean;
  avancer: (p: P, ecouleMs: number, presents: Present[], hasard: Hasard) => P;
  deviner: (
    p: P,
    joueur: string,
    texte: string,
  ) => { partie: P; proche: boolean };
  presence: (p: P, presents: Present[]) => P;
  /** Un changement qui part tout de suite ; le reste part avec la resynchro. */
  aDiffuser: (avant: P, apres: P) => boolean;
  /** Un geste propre au jeu (le choix du mot au scribble), jugé par le meneur. */
  action?: (p: P, de: string, valeur: unknown) => P;
}

export type MessageJeu =
  | { jeu: "etat"; partie: unknown }
  | { jeu: "devine"; texte: string }
  | { jeu: "action"; valeur: unknown }
  | { jeu: "proche"; pour: string };

export const estMessageJeu = (data: unknown): data is MessageJeu =>
  typeof (data as { jeu?: unknown } | null)?.jeu === "string";

const TICK_MS = 500;
const RESYNCHRO_MS = 5_000;
const PROCHE_MS = 2_500;

interface Options<P extends EtatDePartie> {
  moi: string;
  meneur: string | null;
  joueurs: Joueur[];
  regles: Regles<P>;
  envoie: (message: MessageJeu) => void;
  /** Après chaque état publié par le meneur : le scribble y efface le tableau d'une nouvelle manche. */
  surPublication?: (avant: P | null, apres: P | null) => void;
}

export function useMeneur<P extends EtatDePartie>({
  moi,
  meneur,
  joueurs,
  regles,
  envoie,
  surPublication,
}: Options<P>) {
  const [partie, setPartie] = useState<P | null>(null);
  const [recuA, setRecuA] = useState(0);
  const [proche, setProche] = useState(false);
  const [erreur, setErreur] = useState(false);
  const courante = useRef<P | null>(null);
  const presents = useRef(joueurs);
  presents.current = joueurs;
  const meneurCourant = useRef(meneur);
  meneurCourant.current = meneur;
  const estMeneur = meneur === moi;
  const apresPublication = useRef(surPublication);
  apresPublication.current = surPublication;

  const garde = useCallback((suivante: P | null) => {
    courante.current = suivante;
    setPartie(suivante);
    setRecuA(Date.now());
  }, []);

  const publie = useCallback(
    (suivante: P | null) => {
      const avant = courante.current;
      garde(suivante);
      envoie({ jeu: "etat", partie: suivante });
      apresPublication.current?.(avant, suivante);
    },
    [envoie, garde],
  );

  const juge = useCallback(
    (auteur: string, texte: string) => {
      const p = courante.current;
      if (!p) {
        return;
      }
      const { partie: suivante, proche: presque } = regles.deviner(
        p,
        auteur,
        texte,
      );
      if (presque) {
        if (auteur === moi) {
          setProche(true);
        } else {
          envoie({ jeu: "proche", pour: auteur });
        }
      }
      if (suivante !== p) {
        publie(suivante);
      }
    },
    [envoie, moi, publie, regles],
  );

  const recoit = useCallback(
    (de: string | null, message: MessageJeu) => {
      const p = courante.current;
      const jeMene = meneurCourant.current === moi;
      switch (message.jeu) {
        case "etat":
          if (
            de === meneurCourant.current &&
            (message.partie === null || regles.estEtat(message.partie))
          ) {
            garde(message.partie as P | null);
          }
          break;
        case "devine":
          if (jeMene && de && typeof message.texte === "string") {
            juge(de, message.texte);
          }
          break;
        case "action":
          if (jeMene && p && de && regles.action) {
            publie(regles.action(p, de, message.valeur));
          }
          break;
        case "proche":
          if (message.pour === moi) {
            setProche(true);
          }
          break;
      }
    },
    [garde, juge, moi, publie, regles],
  );

  useEffect(() => {
    if (!proche) {
      return;
    }
    const minuterie = window.setTimeout(() => setProche(false), PROCHE_MS);
    return () => window.clearTimeout(minuterie);
  }, [proche]);

  const actif = partie !== null && regles.enCours(partie);

  // S'il vient de prendre la main, le meneur repart du dernier état reçu.
  useEffect(() => {
    if (!estMeneur || !actif) {
      return;
    }
    let dernier = recuA;
    let diffuse = Date.now();
    const minuterie = window.setInterval(() => {
      const p = courante.current;
      if (!p) {
        return;
      }
      const maintenant = Date.now();
      const suivante = regles.avancer(
        p,
        maintenant - dernier,
        presents.current,
        Math.random,
      );
      dernier = maintenant;
      if (
        regles.aDiffuser(p, suivante) ||
        maintenant - diffuse >= RESYNCHRO_MS
      ) {
        diffuse = maintenant;
        publie(suivante);
      } else {
        courante.current = suivante;
      }
    }, TICK_MS);
    return () => window.clearInterval(minuterie);
    // La boucle ne se relance qu'à un changement de meneur ou quand la partie démarre ou s'arrête.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [estMeneur, actif]);

  // Qui arrive reçoit l'état ; qui part est retiré des manches à venir.
  useEffect(() => {
    const p = courante.current;
    if (estMeneur && p && regles.enCours(p)) {
      publie(regles.presence(p, joueurs));
    }
  }, [estMeneur, joueurs, publie, regles]);

  const lance = useCallback(
    (creer: () => Promise<P>) => {
      setErreur(false);
      void creer()
        .then(publie)
        .catch(() => setErreur(true));
    },
    [publie],
  );

  const devine = useCallback(
    (texte: string) => {
      if (estMeneur) {
        juge(moi, texte);
      } else {
        envoie({ jeu: "devine", texte });
      }
    },
    [envoie, estMeneur, juge, moi],
  );

  const agit = useCallback(
    (valeur: unknown) => {
      const p = courante.current;
      if (estMeneur && p && regles.action) {
        publie(regles.action(p, moi, valeur));
      } else {
        envoie({ jeu: "action", valeur });
      }
    },
    [envoie, estMeneur, moi, publie, regles],
  );

  return {
    partie,
    courante,
    recuA,
    proche,
    erreur,
    estMeneur,
    presents,
    recoit,
    lance,
    devine,
    agit,
  };
}
