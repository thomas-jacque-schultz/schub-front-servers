import { useState } from "react";
import { Frame, Stack, Text } from "../../common";
import { splash } from "../commun/champions";
import { Chrono, Fin, Preparation, Reglage } from "../commun/ecrans";
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
      <Preparation
        lang={lang}
        estMeneur={estMeneur}
        nbJoueurs={nbJoueurs}
        minimum={2}
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
      />
    );
  }

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
            ? texte(lang, "cetait", { mot: partie.champion?.nom ?? "" })
            : partie.trouve.includes(moi) && partie.champion
              ? texte(lang, "trouveMoi", { mot: partie.champion.nom })
              : texte(lang, "question")}
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

/** Le splash art, grossi sur son foyer ; son nom n'est dans la page qu'au bilan. */
export function Image({
  lang,
  partie,
  restantMs,
}: {
  lang: Lang;
  partie: PartieZoom;
  restantMs: number;
}) {
  const champion = partie.phase === "fin" ? null : partie.champion;
  if (!champion) {
    return null;
  }
  return (
    <img
      key={champion.id}
      src={splash(champion.id)}
      alt={partie.phase === "bilan" ? champion.nom : texte(lang, "image")}
      draggable={false}
      style={{
        objectFit: "cover",
        userSelect: "none",
        transition: "transform 250ms linear",
        transform: `scale(${grossissement(partie, restantMs)})`,
        transformOrigin: `${partie.foyer.x * 100}% ${partie.foyer.y * 100}%`,
      }}
    />
  );
}
