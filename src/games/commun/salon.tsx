import { type ReactNode, useEffect, useState } from "react";
import { attendInit, dansUnHote } from "./bridge";
import { playerName, rememberName } from "./identity";
import {
  type CleCommune,
  type Lang,
  langueDuNavigateur,
  texteCommun,
} from "./textes";
import { type Contexte, salonDeLAdresse } from "./useSalon";

const NOM_MAX = 24;

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
