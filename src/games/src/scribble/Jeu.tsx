import { useState } from "react";
import { type Champion, icone } from "../commun/champions";
import { Choix, Chrono } from "../commun/jeu";
import type { Lang } from "../commun/textes";
import {
  DUREE_DEFAUT,
  DUREES,
  masque,
  type Partie,
  TOURS,
  TOURS_DEFAUT,
} from "./partie";
import { texte } from "./textes";

function Icone({ version, champion }: { version: string; champion: Champion }) {
  return (
    <img
      className="icone"
      src={icone(version, champion.id)}
      alt=""
      draggable={false}
    />
  );
}

export function Consigne({
  lang,
  partie,
  moi,
  estMeneur,
  restantMs,
  nbJoueurs,
  erreur,
  onLance,
  onChoisis,
}: {
  lang: Lang;
  partie: Partie | null;
  moi: string;
  estMeneur: boolean;
  restantMs: number;
  nbJoueurs: number;
  erreur: boolean;
  onLance: (duree: number, tours: number) => void;
  onChoisis: (index: number) => void;
}) {
  const [duree, setDuree] = useState(DUREE_DEFAUT);
  const [tours, setTours] = useState(TOURS_DEFAUT);

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
              libelle={texte(lang, "tours")}
              valeurs={TOURS}
              valeur={tours}
              format={String}
              onChange={setTours}
            />
            <button
              type="submit"
              disabled={nbJoueurs < 2}
              onClick={() => onLance(duree, tours)}
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

  const nom = partie.noms[partie.dessinateur] ?? "";
  const tour = (
    <span className="aide">
      {texte(lang, "tour", { n: partie.cycle, total: partie.tours })}
    </span>
  );
  const chrono =
    partie.phase === "dessin" || partie.phase === "choix" ? (
      <Chrono lang={lang} restantMs={restantMs} />
    ) : null;

  if (partie.phase === "choix") {
    return (
      <div className="consigne">
        {tour}
        {partie.dessinateur === moi ? (
          <>
            <span>{texte(lang, "choisisMot")}</span>
            {partie.choix.map((champion, index) => (
              <button
                key={champion.id}
                className="champion"
                onClick={() => onChoisis(index)}
              >
                <Icone version={partie.version} champion={champion} />
                {champion.nom}
              </button>
            ))}
          </>
        ) : (
          <span className="aide">{texte(lang, "choisitMot", { nom })}</span>
        )}
        {chrono}
      </div>
    );
  }

  if (partie.phase === "dessin" && partie.mot) {
    const vu = partie.dessinateur === moi || partie.trouve.includes(moi);
    return (
      <div className="consigne">
        {tour}
        {vu ? (
          <strong className="champion">
            <Icone version={partie.version} champion={partie.mot} />
            {texte(lang, partie.dessinateur === moi ? "dessine" : "trouveMoi", {
              mot: partie.mot.nom,
            })}
          </strong>
        ) : (
          <span className="masque">
            {masque(partie.mot.nom, partie.revele)}
          </span>
        )}
        {chrono}
      </div>
    );
  }

  if (partie.phase === "bilan") {
    return (
      <div className="consigne">
        {tour}
        {partie.mot && (
          <strong className="champion">
            <Icone version={partie.version} champion={partie.mot} />
            {texte(lang, "cetait", { mot: partie.mot.nom })}
          </strong>
        )}
      </div>
    );
  }

  return (
    <div className="consigne">
      <strong>{texte(lang, "recap")}</strong>
      {estMeneur ? (
        <button
          type="submit"
          onClick={() => onLance(partie.duree, partie.tours)}
        >
          {texte(lang, "rejouer")}
        </button>
      ) : (
        <span className="aide">{texte(lang, "recapAttente")}</span>
      )}
    </div>
  );
}
