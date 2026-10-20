import { useState } from "react";
import { Choix, Chrono } from "../commun/jeu";
import type { Lang } from "../commun/textes";
import { DUREE_DEFAUT, DUREES, lettres, masque, type Partie } from "./partie";
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
  onChoisis,
}: {
  lang: Lang;
  partie: Partie | null;
  moi: string;
  estMeneur: boolean;
  restantMs: number;
  nbJoueurs: number;
  erreur: boolean;
  onLance: (duree: number) => void;
  onChoisis: (index: number) => void;
}) {
  const [duree, setDuree] = useState(DUREE_DEFAUT);

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
            <button
              type="submit"
              disabled={nbJoueurs < 2}
              onClick={() => onLance(duree)}
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
  const chrono =
    partie.phase === "dessin" || partie.phase === "choix" ? (
      <Chrono lang={lang} restantMs={restantMs} />
    ) : null;

  if (partie.phase === "choix") {
    return (
      <div className="consigne">
        {partie.dessinateur === moi ? (
          <>
            <span>{texte(lang, "choisisMot")}</span>
            {partie.choix.map((mot, index) => (
              <button key={mot} onClick={() => onChoisis(index)}>
                {mot}
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
        {partie.dessinateur === moi ? (
          <strong>{texte(lang, "dessine", { mot: partie.mot })}</strong>
        ) : vu ? (
          <strong>{texte(lang, "trouveMoi", { mot: partie.mot })}</strong>
        ) : (
          <>
            <span className="masque">{masque(partie.mot, partie.revele)}</span>
            <span className="aide">
              {texte(lang, "lettres", { n: lettres(partie.mot) })}
            </span>
          </>
        )}
        {chrono}
      </div>
    );
  }

  if (partie.phase === "bilan") {
    return (
      <div className="consigne">
        <strong>{texte(lang, "cetait", { mot: partie.mot ?? "" })}</strong>
      </div>
    );
  }

  return (
    <div className="consigne">
      <strong>{texte(lang, "recap")}</strong>
      {estMeneur ? (
        <button type="submit" onClick={() => onLance(partie.duree)}>
          {texte(lang, "rejouer")}
        </button>
      ) : (
        <span className="aide">{texte(lang, "recapAttente")}</span>
      )}
    </div>
  );
}
