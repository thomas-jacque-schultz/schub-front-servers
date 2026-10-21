import { useState } from "react";
import { splash } from "../commun/champions";
import { Choix, Chrono } from "../commun/jeu";
import type { Lang } from "../commun/textes";
import {
  DUREE_DEFAUT,
  DUREES,
  grossissement,
  MANCHES,
  MANCHES_DEFAUT,
  type PartieZoom,
} from "./partie";
import { texte } from "./textes";

export function Consigne({
  lang,
  partie,
  moi,
  estMeneur,
  restantMs,
  nbJoueurs,
  erreur,
  onLance,
}: {
  lang: Lang;
  partie: PartieZoom | null;
  moi: string;
  estMeneur: boolean;
  restantMs: number;
  nbJoueurs: number;
  erreur: boolean;
  onLance: (duree: number, manches: number) => void;
}) {
  const [duree, setDuree] = useState(DUREE_DEFAUT);
  const [manches, setManches] = useState(MANCHES_DEFAUT);

  if (!partie) {
    return (
      <div className="consigne">
        {estMeneur ? (
          <>
            <Choix
              libelle={texte(lang, "duree")}
              valeurs={DUREES}
              valeur={duree}
              format={(n) => texte(lang, "secondes", { n })}
              onChange={setDuree}
            />
            <Choix
              libelle={texte(lang, "manches")}
              valeurs={MANCHES}
              valeur={manches}
              format={String}
              onChange={setManches}
            />
            <button
              type="submit"
              disabled={nbJoueurs < 2}
              onClick={() => onLance(duree, manches)}
            >
              {texte(lang, "lancer")}
            </button>
            {nbJoueurs < 2 && (
              <span className="aide">{texte(lang, "attenteJoueurs")}</span>
            )}
          </>
        ) : (
          <span className="aide">{texte(lang, "attenteMeneur")}</span>
        )}
        {erreur && <span className="erreur">{texte(lang, "erreurMots")}</span>}
      </div>
    );
  }

  const numero = (
    <span className="aide">
      {texte(lang, "manche", { n: partie.manche, total: partie.manches })}
    </span>
  );

  if (partie.phase === "manche") {
    return (
      <div className="consigne">
        {numero}
        <strong>
          {partie.trouve.includes(moi) && partie.champion
            ? texte(lang, "trouveMoi", { mot: partie.champion.nom })
            : texte(lang, "question")}
        </strong>
        <Chrono lang={lang} restantMs={restantMs} />
      </div>
    );
  }

  if (partie.phase === "bilan") {
    return (
      <div className="consigne">
        {numero}
        <strong>
          {texte(lang, "cetait", { mot: partie.champion?.nom ?? "" })}
        </strong>
      </div>
    );
  }

  return (
    <div className="consigne">
      <strong>{texte(lang, "recap")}</strong>
      {estMeneur ? (
        <button
          type="submit"
          onClick={() => onLance(partie.duree, partie.manches)}
        >
          {texte(lang, "rejouer")}
        </button>
      ) : (
        <span className="aide">{texte(lang, "recapAttente")}</span>
      )}
    </div>
  );
}

/** Le splash art, grossi sur son foyer ; son nom n'est dans la page qu'au bilan. */
export function Image({
  lang,
  partie,
  restantMs,
}: {
  lang: Lang;
  partie: PartieZoom | null;
  restantMs: number;
}) {
  const champion = partie?.phase === "fin" ? null : partie?.champion;
  return (
    <div className="cadre">
      {champion && partie && (
        <img
          key={champion.id}
          src={splash(champion.id)}
          alt={partie.phase === "bilan" ? champion.nom : texte(lang, "image")}
          draggable={false}
          style={{
            transform: `scale(${grossissement(partie, restantMs)})`,
            transformOrigin: `${partie.foyer.x * 100}% ${partie.foyer.y * 100}%`,
          }}
        />
      )}
    </div>
  );
}
