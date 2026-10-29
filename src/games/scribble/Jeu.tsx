import { type ReactNode, useState } from "react";
import { Button, ChampionIcon, Frame, Stack, Text } from "../../common";
import { type Champion, icone } from "../commun/champions";
import { Chrono, Fin, Preparation, Reglage } from "../commun/ecrans";
import type { Lang } from "../commun/textes";
import {
  DUREE_DEFAUT,
  DUREES,
  type Partie,
  TOURS,
  TOURS_DEFAUT,
} from "./partie";
import { texte } from "./textes";

function Bandeau({
  gauche,
  droite,
  children,
}: {
  gauche?: ReactNode;
  droite?: ReactNode;
  children: ReactNode;
}) {
  return (
    <Frame dense>
      <Stack
        direction="row"
        spacing={1.5}
        align="center"
        justify="between"
        wrap
      >
        {gauche}
        <Stack direction="row" spacing={1} align="center" wrap>
          {children}
        </Stack>
        {droite ?? <span />}
      </Stack>
    </Frame>
  );
}

function AvecIcone({
  version,
  champion,
  children,
}: {
  version: string;
  champion: Champion;
  children: ReactNode;
}) {
  return (
    <Stack direction="row" spacing={1} align="center">
      <ChampionIcon
        src={icone(version, champion.id)}
        name={champion.nom}
        tooltip=""
        size="small"
      />
      <Text variant="subtitle">{children}</Text>
    </Stack>
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
      <Preparation
        lang={lang}
        estMeneur={estMeneur}
        nbJoueurs={nbJoueurs}
        minimum={2}
        erreur={erreur ? texte(lang, "erreurMots") : null}
        onLance={() => onLance(duree, tours)}
      >
        <Reglage
          libelle={texte(lang, "duree")}
          valeurs={DUREES}
          valeur={duree}
          format={(n) => texte(lang, "secondes", { n })}
          onChange={setDuree}
        />
        <Reglage
          libelle={texte(lang, "tours")}
          valeurs={TOURS}
          valeur={tours}
          format={String}
          onChange={setTours}
        />
      </Preparation>
    );
  }

  if (partie.phase === "fin") {
    return (
      <Fin
        lang={lang}
        estMeneur={estMeneur}
        onRejoue={() => onLance(partie.duree, partie.tours)}
      />
    );
  }

  const nom = partie.noms[partie.dessinateur] ?? "";
  const tour = (
    <Text variant="caption" mono tone="secondary">
      {texte(lang, "tour", { n: partie.cycle, total: partie.tours })}
    </Text>
  );
  const chrono = partie.phase !== "bilan" && (
    <Chrono lang={lang} restantMs={restantMs} />
  );

  if (partie.phase === "choix") {
    return (
      <Bandeau gauche={tour} droite={chrono}>
        {partie.dessinateur === moi ? (
          <>
            <Text>{texte(lang, "choisisMot")}</Text>
            {partie.choix.map((champion, index) => (
              <Button
                key={champion.id}
                variant="secondary"
                startIcon={
                  <ChampionIcon
                    src={icone(partie.version, champion.id)}
                    name={champion.nom}
                    tooltip=""
                    size="small"
                  />
                }
                onClick={() => onChoisis(index)}
              >
                {champion.nom}
              </Button>
            ))}
          </>
        ) : (
          <Text tone="secondary">{texte(lang, "choisitMot", { nom })}</Text>
        )}
      </Bandeau>
    );
  }

  const mot = partie.mot;
  if (partie.phase === "dessin" && mot) {
    const vu = partie.dessinateur === moi || partie.trouve.includes(moi);
    return (
      <Bandeau gauche={tour} droite={chrono}>
        {vu ? (
          <AvecIcone version={partie.version} champion={mot}>
            {texte(lang, partie.dessinateur === moi ? "dessine" : "trouveMoi", {
              mot: mot.nom,
            })}
          </AvecIcone>
        ) : (
          <Text variant="subtitle">{texte(lang, "devine")}</Text>
        )}
      </Bandeau>
    );
  }

  return (
    <Bandeau gauche={tour}>
      {mot && (
        <AvecIcone version={partie.version} champion={mot}>
          {texte(lang, "cetait", { mot: mot.nom })}
        </AvecIcone>
      )}
    </Bandeau>
  );
}
