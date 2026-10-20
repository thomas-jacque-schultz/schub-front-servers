import { useState } from "react";
import type { Ligne } from "./devinette";
import type { Joueur } from "./relay";
import { type Lang, texteCommun } from "./textes";

const REPONSE_MAX = 60;

export function Devinette({
  lang,
  proche,
  onDevine,
}: {
  lang: Lang;
  proche: boolean;
  onDevine: (texte: string) => void;
}) {
  const [saisie, setSaisie] = useState("");
  return (
    <form
      className="devinette"
      onSubmit={(event) => {
        event.preventDefault();
        if (saisie.trim()) {
          onDevine(saisie);
          setSaisie("");
        }
      }}
    >
      <input
        aria-label={texteCommun(lang, "reponse")}
        placeholder={texteCommun(lang, "reponse")}
        maxLength={REPONSE_MAX}
        value={saisie}
        autoComplete="off"
        onChange={(e) => setSaisie(e.target.value)}
      />
      <button type="submit" disabled={!saisie.trim()}>
        {texteCommun(lang, "proposer")}
      </button>
      {proche && <span className="proche">{texteCommun(lang, "proche")}</span>}
    </form>
  );
}

export function Scores({
  lang,
  scores,
  noms,
  fil,
  trouve,
  joueurs,
  moi,
  meneur,
  etiquette,
}: {
  lang: Lang;
  scores: Record<string, number>;
  noms: Record<string, string>;
  fil: Ligne[];
  /** Ceux qui ont trouvé la manche en cours ; vide une fois la partie finie. */
  trouve: string[];
  joueurs: Joueur[];
  moi: string;
  meneur: string | null;
  /** Ce qu'un joueur fait dans la manche (« dessine »). */
  etiquette?: (id: string) => string | null;
}) {
  const classes = [...joueurs].sort(
    (a, b) => (scores[b.id] ?? 0) - (scores[a.id] ?? 0),
  );
  return (
    <>
      <h2>{texteCommun(lang, "scores")}</h2>
      <ol className="scores">
        {classes.map((j) => {
          const role = etiquette?.(j.id);
          return (
            <li key={j.id} className={j.id === moi ? "moi" : undefined}>
              <span>
                {j.name}
                {role && <span className="meneur"> · {role}</span>}
                {j.id === meneur && (
                  <span className="meneur">
                    {" "}
                    · {texteCommun(lang, "meneur")}
                  </span>
                )}
                {trouve.includes(j.id) && <span className="trouve"> ✓</span>}
              </span>
              <span className="points">
                {texteCommun(lang, "points", { n: scores[j.id] ?? 0 })}
              </span>
            </li>
          );
        })}
      </ol>
      {fil.length > 0 && (
        <>
          <h2>{texteCommun(lang, "reponses")}</h2>
          <ul className="fil">
            {fil.map((ligne, index) => (
              <li key={index} className={ligne.trouve ? "trouve" : undefined}>
                {ligne.trouve
                  ? texteCommun(lang, "aTrouve", {
                      nom: noms[ligne.joueur] ?? "",
                    })
                  : texteCommun(lang, "ligne", {
                      nom: noms[ligne.joueur] ?? "",
                      texte: ligne.texte ?? "",
                    })}
              </li>
            ))}
          </ul>
        </>
      )}
    </>
  );
}

/** Un réglage de partie, choisi par le meneur avant de lancer. */
export function Choix({
  libelle,
  valeurs,
  valeur,
  format,
  onChange,
}: {
  libelle: string;
  valeurs: number[];
  valeur: number;
  format: (valeur: number) => string;
  onChange: (valeur: number) => void;
}) {
  return (
    <label className="reglage">
      {libelle}
      <select value={valeur} onChange={(e) => onChange(Number(e.target.value))}>
        {valeurs.map((v) => (
          <option key={v} value={v}>
            {format(v)}
          </option>
        ))}
      </select>
    </label>
  );
}

export function Chrono({ lang, restantMs }: { lang: Lang; restantMs: number }) {
  return (
    <span className="chrono" aria-label={texteCommun(lang, "chrono")}>
      {Math.ceil(restantMs / 1000)}
    </span>
  );
}

/** Les joueurs du salon, avant la première partie. */
export function Joueurs({
  lang,
  joueurs,
  moi,
  meneur,
}: {
  lang: Lang;
  joueurs: Joueur[];
  moi: string;
  meneur: string | null;
}) {
  return (
    <>
      <h2>{texteCommun(lang, "joueurs")}</h2>
      <ul>
        {joueurs.map((j) => (
          <li key={j.id} className={j.id === moi ? "moi" : undefined}>
            {j.name}
            {j.id === meneur && (
              <span className="meneur"> · {texteCommun(lang, "meneur")}</span>
            )}
          </li>
        ))}
      </ul>
    </>
  );
}
