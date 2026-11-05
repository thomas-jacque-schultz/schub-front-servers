import { type PointerEvent, useRef, useState } from "react";
import { Frame, Stack, Text } from "../../common";
import { Chrono, Fin, Preparation, Reglage } from "../commun/ecrans";
import type { Lang } from "../commun/textes";
import {
  DUREE_DEFAUT,
  DUREES,
  HAUTEUR_ETALON,
  HAUTEUR_MAX,
  HAUTEUR_MIN,
  hauteurJuste,
  MANCHES,
  MANCHES_DEFAUT,
  type PartieMesure,
} from "./partie";
import { texte } from "./textes";

export const RATIO = 4 / 3;
// La part de la scène où les champions se tiennent : le sol et leurs noms prennent le reste.
const UTILE = 0.86;
const SOL = 0.1;
const X_ETALON = "28%";
const X_CIBLE = "66%";

const croquis = (id: string) => `/premadelab/mesure/${id}.png`;

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
  partie: PartieMesure | null;
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
      <Preparation
        lang={lang}
        estMeneur={estMeneur}
        nbJoueurs={nbJoueurs}
        minimum={1}
        erreur={erreur ? texte(lang, "erreurMots") : null}
        onLance={() => onLance(duree, manches)}
      >
        <Reglage
          libelle={texte(lang, "duree")}
          valeurs={DUREES}
          valeur={duree}
          format={(n) => texte(lang, "secondes", { n })}
          onChange={setDuree}
        />
        <Reglage
          libelle={texte(lang, "manches")}
          valeurs={MANCHES}
          valeur={manches}
          format={String}
          onChange={setManches}
        />
      </Preparation>
    );
  }

  if (partie.phase === "fin") {
    return (
      <Fin
        lang={lang}
        estMeneur={estMeneur}
        onRejoue={() => onLance(partie.duree, partie.manches)}
      >
        <Text>{texte(lang, "recapFin", { n: partie.scores[moi] ?? 0 })}</Text>
      </Fin>
    );
  }

  const noms = {
    cible: partie.cible?.nom ?? "",
    etalon: partie.etalon?.nom ?? "",
  };
  const juste =
    partie.etalon && partie.cible
      ? hauteurJuste(partie.etalon, partie.cible)
      : HAUTEUR_ETALON;
  return (
    <Frame dense>
      <Stack
        direction="row"
        spacing={1.5}
        align="center"
        justify="between"
        wrap
      >
        <Text variant="caption" mono tone="secondary">
          {texte(lang, "manche", { n: partie.manche, total: partie.manches })}
        </Text>
        <Text variant="subtitle">
          {partie.phase === "bilan"
            ? texte(lang, "verite", {
                ...noms,
                rapport: (juste / HAUTEUR_ETALON).toLocaleString(lang, {
                  maximumFractionDigits: 2,
                }),
              })
            : texte(lang, "consigne", noms)}
        </Text>
        {partie.phase === "manche" ? (
          <Chrono lang={lang} restantMs={restantMs} />
        ) : (
          <span />
        )}
      </Stack>
    </Frame>
  );
}

const pose = (x: string, hauteur: number, extra = {}) => ({
  position: "absolute" as const,
  left: x,
  bottom: `${SOL * 100}%`,
  height: `${hauteur * UTILE * 100}%`,
  transform: "translateX(-50%)",
  maxWidth: "none",
  userSelect: "none" as const,
  pointerEvents: "none" as const,
  ...extra,
});

/**
 * La toise : l'étalon à hauteur fixe, la cible que l'on règle, sur le même sol. Au bilan, la cible prend sa vraie taille
 * et chaque réponse y laisse un trait à son nom.
 */
export function Scene({
  lang,
  partie,
  moi,
  hauteur,
  actif,
  onHauteur,
  onLache,
}: {
  lang: Lang;
  partie: PartieMesure;
  moi: string;
  hauteur: number;
  actif: boolean;
  onHauteur: (hauteur: number) => void;
  onLache: (hauteur: number) => void;
}) {
  const appuye = useRef(false);
  const courante = useRef(hauteur);
  courante.current = hauteur;
  const { etalon, cible } = partie;
  if (!etalon || !cible) {
    return null;
  }
  const auBilan = partie.phase === "bilan";
  const juste = hauteurJuste(etalon, cible);

  const suit = (evenement: PointerEvent<HTMLDivElement>) => {
    const cadre = evenement.currentTarget.getBoundingClientRect();
    const voulue =
      (1 - SOL - (evenement.clientY - cadre.top) / cadre.height) / UTILE;
    onHauteur(Math.min(HAUTEUR_MAX, Math.max(HAUTEUR_MIN, voulue)));
  };

  return (
    <div
      role="presentation"
      onPointerDown={(evenement) => {
        if (actif) {
          evenement.currentTarget.setPointerCapture(evenement.pointerId);
          appuye.current = true;
          suit(evenement);
        }
      }}
      onPointerMove={(evenement) => {
        if (appuye.current) {
          suit(evenement);
        }
      }}
      onPointerUp={() => {
        if (appuye.current) {
          appuye.current = false;
          onLache(courante.current);
        }
      }}
      style={{
        position: "absolute",
        inset: 0,
        touchAction: "none",
        cursor: actif ? "ns-resize" : "default",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: `${SOL * 100}%`,
          borderTop: "2px solid currentColor",
          opacity: 0.35,
        }}
      />
      <img
        src={croquis(etalon.id)}
        alt={texte(lang, "croquis", { nom: etalon.nom })}
        draggable={false}
        style={pose(X_ETALON, HAUTEUR_ETALON)}
      />
      <img
        src={croquis(cible.id)}
        alt={texte(lang, "croquis", { nom: cible.nom })}
        draggable={false}
        // Le sépia distingue la cible de l'étalon, deux croquis du même gris.
        style={pose(X_CIBLE, auBilan ? juste : hauteur, {
          filter: "sepia(1) saturate(2.5)",
          transition: auBilan ? "height 400ms ease-out" : undefined,
        })}
      />
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: `${SOL * 100}%`,
          display: "flex",
        }}
      >
        <Nom x={X_ETALON} nom={etalon.nom} />
        <Nom x={X_CIBLE} nom={cible.nom} />
      </div>
      {auBilan && (
        <>
          <Trait hauteur={juste} nom={texte(lang, "juste")} detail="" accent />
          {partie.joueurs.map((id) => {
            const resultat = partie.resultats[id];
            if (!resultat) {
              return null;
            }
            const ecart = Math.round((resultat.choix / juste - 1) * 100);
            return (
              <Trait
                key={id}
                hauteur={resultat.choix}
                nom={partie.noms[id] ?? ""}
                moi={id === moi}
                detail={`${ecart > 0 ? "+" : ""}${texte(lang, "ecart", { ecart })} · ${texte(lang, "points", { n: resultat.points })}`}
              />
            );
          })}
        </>
      )}
    </div>
  );
}

function Nom({ x, nom }: { x: string; nom: string }) {
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: "20%",
        transform: "translateX(-50%)",
        whiteSpace: "nowrap",
      }}
    >
      <Text variant="caption">{nom}</Text>
    </div>
  );
}

/** Une réponse sur la toise : un trait à sa hauteur, le nom à droite. */
function Trait({
  hauteur,
  nom,
  detail,
  accent = false,
  moi = false,
}: {
  hauteur: number;
  nom: string;
  detail: string;
  accent?: boolean;
  moi?: boolean;
}) {
  return (
    <div
      style={{
        position: "absolute",
        left: "50%",
        right: 0,
        bottom: `${(SOL + hauteur * UTILE) * 100}%`,
        borderTop: `${accent || moi ? 2 : 1}px ${accent ? "solid" : "dashed"} currentColor`,
        pointerEvents: "none",
      }}
    >
      <div style={{ position: "absolute", right: 4, bottom: 0 }}>
        <Text
          variant="caption"
          tone={accent ? "primary" : moi ? "default" : "secondary"}
        >
          {nom} {detail}
        </Text>
      </div>
    </div>
  );
}
