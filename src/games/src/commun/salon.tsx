import {
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { annonceSalon, attendInit, dansUnHote } from "./bridge";
import { playerId, playerName, rememberName } from "./identity";
import { type Evenement, type Joueur, Relais } from "./relay";
import {
  type CleCommune,
  type Lang,
  langueDuNavigateur,
  texteCommun,
} from "./textes";

const NOM_MAX = 24;

export interface Contexte {
  lang: Lang;
  room: string | null;
  hote: string | null;
}

// Le salon demandé par l'adresse : scribble.premadelab.eu/ABCD.
const salonDeLAdresse = (): string | null => {
  const code = location.pathname.split("/").pop() ?? "";
  return /^[A-Z]{4}$/.test(code) ? code : null;
};

/** L'entrée d'un jeu : la langue et le salon viennent de PremadeLab (iframe) ou de l'adresse ; puis le pseudo. */
export function JeuApp({
  titre,
  rendu,
}: {
  titre: string;
  rendu: (contexte: Contexte, nom: string) => ReactNode;
}) {
  const [contexte, setContexte] = useState<Contexte | null>(null);
  const [nom, setNom] = useState<string | null>(playerName());

  useEffect(() => {
    if (!dansUnHote()) {
      setContexte({
        lang: langueDuNavigateur(),
        room: salonDeLAdresse(),
        hote: null,
      });
      return;
    }
    void attendInit().then((init) =>
      setContexte({ lang: init.lang, room: init.room, hote: init.origin }),
    );
  }, []);

  if (!contexte) {
    return null;
  }
  if (!nom) {
    return (
      <Pseudo
        titre={titre}
        lang={contexte.lang}
        onChoisi={(choisi) => setNom(choisi)}
      />
    );
  }
  return <>{rendu(contexte, nom)}</>;
}

function Pseudo({
  titre,
  lang,
  onChoisi,
}: {
  titre: string;
  lang: Lang;
  onChoisi: (nom: string) => void;
}) {
  const [saisie, setSaisie] = useState("");
  const propre = saisie.trim().slice(0, NOM_MAX);
  return (
    <main className="accueil">
      <h1>{titre}</h1>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          if (propre) {
            rememberName(propre);
            onChoisi(propre);
          }
        }}
      >
        <label htmlFor="pseudo">{texteCommun(lang, "pseudoInvite")}</label>
        <input
          id="pseudo"
          autoFocus
          maxLength={NOM_MAX}
          value={saisie}
          onChange={(e) => setSaisie(e.target.value)}
        />
        <button type="submit" disabled={!propre}>
          {texteCommun(lang, "rejoindre")}
        </button>
      </form>
    </main>
  );
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
        case "deconnecte":
          setEtat("reconnexion");
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

export function Bandeau({
  titre,
  lang,
  room,
  hote,
}: {
  titre: string;
  lang: Lang;
  room: string | null;
  hote: string | null;
}) {
  const [copie, setCopie] = useState(false);
  const lien = room ? `${location.origin}/${room}` : null;
  return (
    <header className="bandeau">
      <h1>{titre}</h1>
      {room && <span className="code">{room}</span>}
      {!hote && lien && (
        <button
          className="discret"
          onClick={() =>
            void navigator.clipboard?.writeText(lien).then(() => {
              setCopie(true);
              window.setTimeout(() => setCopie(false), 1500);
            })
          }
        >
          {texteCommun(lang, copie ? "copie" : "copier")}
        </button>
      )}
    </header>
  );
}

export function ErreurSalon({
  lang,
  erreur,
  onNouveau,
}: {
  lang: Lang;
  erreur: CleCommune;
  onNouveau: () => void;
}) {
  return (
    <section className="alerte">
      <p>{texteCommun(lang, erreur)}</p>
      <button onClick={onNouveau}>{texteCommun(lang, "nouveau")}</button>
    </section>
  );
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
