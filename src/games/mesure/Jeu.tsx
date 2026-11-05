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
  tailleDe,
} from "./partie";
import { texte } from "./textes";

export const RATIO = 4 / 3;
// La part de la scène où les champions se tiennent : le sol et leurs noms prennent le reste.
const UTILE = 0.86;
const SOL = 0.1;
const X_ETALON = "28%";
const X_CIBLE = "66%";

// Le jeton du thème : ce cadre n'est pas un composant, et l'or y marque le geste à faire.
const OR = "var(--mui-palette-primary-main)";
const COTE_POIGNEE = 14;
const ZONE_POIGNEE = 36;

const portrait = (id: string) => `/premadelab/mesure/${id}.png`;

const enMetres = (lang: Lang, cm: number) =>
  cm < 100
    ? `${cm} cm`
    : `${(cm / 100).toLocaleString(lang, { maximumFractionDigits: cm < 1000 ? 2 : 1 })} m`;

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
                tailleCible: partie.cible
                  ? enMetres(lang, tailleDe(partie.cible))
                  : "",
                tailleEtalon: partie.etalon
                  ? enMetres(lang, tailleDe(partie.etalon))
                  : "",
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
  ...extra,
});

const IMAGE = {
  display: "block",
  height: "100%",
  width: "auto",
  maxWidth: "none",
  userSelect: "none" as const,
  pointerEvents: "none" as const,
};

/**
 * La toise : l'étalon à hauteur fixe, la cible dans son cadre, sur le même sol. Au bilan, la cible prend sa taille dans
 * le lore et chaque réponse y laisse un trait à son nom.
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
  const { etalon, cible } = partie;
  if (!etalon || !cible) {
    return null;
  }
  const auBilan = partie.phase === "bilan";
  const juste = hauteurJuste(etalon, cible);

  return (
    <div style={{ position: "absolute", inset: 0 }}>
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
      <div style={pose(X_ETALON, HAUTEUR_ETALON)}>
        <img
          src={portrait(etalon.id)}
          alt={texte(lang, "portrait", { nom: etalon.nom })}
          draggable={false}
          style={IMAGE}
        />
      </div>
      <div
        style={pose(X_CIBLE, auBilan ? juste : hauteur, {
          transition: auBilan ? "height 400ms ease-out" : undefined,
          outline: actif ? `1px dashed ${OR}` : undefined,
        })}
      >
        <img
          src={portrait(cible.id)}
          alt={texte(lang, "portrait", { nom: cible.nom })}
          draggable={false}
          style={IMAGE}
        />
        {actif && (
          <>
            <Poignee
              cote="gauche"
              hauteur={hauteur}
              onHauteur={onHauteur}
              onLache={onLache}
            />
            <Poignee
              cote="droite"
              hauteur={hauteur}
              onHauteur={onHauteur}
              onLache={onLache}
            />
          </>
        )}
      </div>
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

/**
 * Un coin du cadre, tiré en diagonale. Le cadre grandit depuis le milieu de sa base : la nouvelle taille vient de la
 * projection du pointeur sur la droite qui va de ce milieu au coin, rapportée à celle du point de départ.
 */
function Poignee({
  cote,
  hauteur,
  onHauteur,
  onLache,
}: {
  cote: "gauche" | "droite";
  hauteur: number;
  onHauteur: (hauteur: number) => void;
  onLache: (hauteur: number) => void;
}) {
  const prise = useRef<{
    ancreX: number;
    ancreY: number;
    dx: number;
    dy: number;
    depart: number;
    hauteur: number;
  } | null>(null);
  const courante = useRef(hauteur);
  courante.current = hauteur;
  const projection = (
    p: NonNullable<typeof prise.current>,
    x: number,
    y: number,
  ) => (x - p.ancreX) * p.dx + (y - p.ancreY) * p.dy;

  return (
    <div
      role="presentation"
      onPointerDown={(evenement: PointerEvent<HTMLDivElement>) => {
        const cadre =
          evenement.currentTarget.parentElement?.getBoundingClientRect();
        if (!cadre) {
          return;
        }
        evenement.stopPropagation();
        evenement.currentTarget.setPointerCapture(evenement.pointerId);
        const dx = (cote === "droite" ? 1 : -1) * (cadre.width / 2);
        const dy = -cadre.height;
        const p = {
          ancreX: cadre.left + cadre.width / 2,
          ancreY: cadre.bottom,
          dx,
          dy,
          depart: 0,
          hauteur,
        };
        p.depart = projection(p, evenement.clientX, evenement.clientY);
        prise.current = p;
      }}
      onPointerMove={(evenement) => {
        const p = prise.current;
        if (p) {
          const voulue =
            (p.hauteur * projection(p, evenement.clientX, evenement.clientY)) /
            p.depart;
          onHauteur(Math.min(HAUTEUR_MAX, Math.max(HAUTEUR_MIN, voulue)));
        }
      }}
      onPointerUp={() => {
        if (prise.current) {
          prise.current = null;
          onLache(courante.current);
        }
      }}
      style={{
        position: "absolute",
        top: -ZONE_POIGNEE / 2,
        [cote === "droite" ? "right" : "left"]: -ZONE_POIGNEE / 2,
        width: ZONE_POIGNEE,
        height: ZONE_POIGNEE,
        display: "grid",
        placeItems: "center",
        touchAction: "none",
        cursor: cote === "droite" ? "nesw-resize" : "nwse-resize",
      }}
    >
      <div
        style={{
          width: COTE_POIGNEE,
          height: COTE_POIGNEE,
          borderRadius: "50%",
          background: OR,
          border: "2px solid var(--mui-palette-background-paper)",
        }}
      />
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
