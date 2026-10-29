import { useCallback, useEffect, useRef, useState } from "react";
import { annonceSalon, attendInit, dansUnHote } from "./bridge";
import { playerId } from "./identity";
import { type Evenement, type Joueur, Relais } from "./relay";
import { type CleCommune, type Lang, langueDuNavigateur } from "./textes";

export interface Contexte {
  lang: Lang;
  room: string | null;
  hote: string | null;
  /** Le pseudo du compte PremadeLab connecté, quand le jeu tourne dans PremadeLab. */
  nom: string | null;
}

// Le salon demandé par l'adresse : scribble.premadelab.eu/ABCD.
export const salonDeLAdresse = (): string | null => {
  const code = location.pathname.split("/").pop() ?? "";
  return /^[A-Z]{4}$/.test(code) ? code : null;
};

/** La langue et le salon : de PremadeLab (iframe) ou de l'adresse. */
export function useContexte(): Contexte | null {
  const [contexte, setContexte] = useState<Contexte | null>(null);
  useEffect(() => {
    if (!dansUnHote()) {
      setContexte({
        lang: langueDuNavigateur(),
        room: salonDeLAdresse(),
        hote: null,
        nom: null,
      });
      return;
    }
    void attendInit().then((init) =>
      setContexte({
        lang: init.lang,
        room: init.room,
        hote: init.origin,
        nom: init.nom,
      }),
    );
  }, []);
  return contexte;
}

export type EtatSalon = "connexion" | "salon" | "reconnexion" | "erreur";

/**
 * La connexion au relais et la présence. surEvenement reçoit tout ce qui arrive (historique compris) : le jeu
 * y lit ses propres messages.
 */
export function useSalon({
  jeu,
  contexte,
  nom,
  surEvenement,
}: {
  jeu: string;
  contexte: Contexte;
  nom: string;
  surEvenement: (evenement: Evenement) => void;
}) {
  const moi = useRef(playerId()).current;
  const relais = useRef<Relais | null>(null);
  const [demande, setDemande] = useState<string | null>(contexte.room);
  const [room, setRoom] = useState<string | null>(null);
  const [joueurs, setJoueurs] = useState<Joueur[]>([]);
  const [meneur, setMeneur] = useState<string | null>(null);
  const [etat, setEtat] = useState<EtatSalon>("connexion");
  const [erreur, setErreur] = useState<CleCommune | null>(null);
  // L'écoute du relais reste stable : la changer rouvrirait la connexion.
  const relaie = useRef(surEvenement);
  relaie.current = surEvenement;

  const ecoute = useCallback(
    (evenement: Evenement) => {
      switch (evenement.type) {
        case "joined":
          setRoom(evenement.room);
          setJoueurs(evenement.players);
          setMeneur(evenement.leader);
          setEtat("salon");
          if (contexte.hote) {
            annonceSalon(evenement.room, contexte.hote);
          } else if (salonDeLAdresse() !== evenement.room) {
            const base = location.pathname.replace(/[A-Z]{4}$/, "");
            history.replaceState(
              null,
              "",
              `${base.endsWith("/") ? base : `${base}/`}${evenement.room}`,
            );
          }
          break;
        case "presence":
          setJoueurs(evenement.players);
          setMeneur(evenement.leader);
          break;
        case "error":
          setErreur(`erreur_${evenement.code}` as CleCommune);
          setEtat("erreur");
          break;
        // Coupé du salon, il ne mène plus : le relais a passé la main, la partie avance chez un autre.
        case "deconnecte":
          setEtat("reconnexion");
          setMeneur(null);
          break;
      }
      relaie.current(evenement);
    },
    [contexte.hote],
  );

  useEffect(() => {
    const ouvert = new Relais(demande, jeu, { id: moi, name: nom }, ecoute);
    relais.current = ouvert;
    return () => ouvert.ferme();
  }, [demande, ecoute, jeu, moi, nom]);

  const envoie = useCallback(
    (data: unknown, keep = false) => relais.current?.envoie(data, keep),
    [],
  );
  const efface = useCallback(() => relais.current?.efface(), []);
  const nouveau = useCallback(() => {
    setErreur(null);
    setEtat("connexion");
    setDemande(null);
  }, []);

  return {
    moi,
    room,
    joueurs,
    meneur,
    etat,
    erreur,
    envoie,
    efface,
    nouveau,
  };
}

/** Le temps qui passe, à l'écran : un rendu par quart de seconde tant qu'un chrono tourne. */
export function useMaintenant(actif: boolean): number {
  const [maintenant, setMaintenant] = useState(() => Date.now());
  useEffect(() => {
    if (!actif) {
      return;
    }
    const minuterie = window.setInterval(() => setMaintenant(Date.now()), 250);
    return () => window.clearInterval(minuterie);
  }, [actif]);
  return maintenant;
}
