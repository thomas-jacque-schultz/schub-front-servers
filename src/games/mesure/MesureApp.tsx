import { useCallback, useRef, useState } from "react";
import { Button, GameStage, Slider, Stack, Text } from "../../common";
import type { RelaisEvenement as Evenement } from "../../common";
import { catalogue } from "../commun/champions";
import { Classement, type Fiche, Jeu, Salon } from "../commun/ecrans";
import { estMessageJeu, type MessageJeu, useMeneur } from "../commun/useMeneur";
import { type Contexte, useMaintenant, useSalon } from "../commun/useSalon";
import { Consigne, RATIO, Scene } from "./Jeu";
import {
  HAUTEUR_MAX,
  HAUTEUR_MIN,
  nouvellePartie,
  type PartieMesure,
} from "./partie";
import { REGLES } from "./regles";
import { texte } from "./textes";

const RESERVE_PX = 330;
const FICHE: Fiche = {
  titre: (lang) => texte(lang, "titre"),
  icone: "📏",
  accroche: (lang) => texte(lang, "accroche"),
};

export function MesureApp() {
  return (
    <Jeu
      fiche={FICHE}
      rendu={(contexte, nom) => <Salle contexte={contexte} nom={nom} />}
    />
  );
}

function Salle({ contexte, nom }: { contexte: Contexte; nom: string }) {
  const { lang } = contexte;
  const recoitJeu = useRef<(de: string | null, m: MessageJeu) => void>(
    () => undefined,
  );
  const surEvenement = useCallback((evenement: Evenement) => {
    if (evenement.type === "message" && estMessageJeu(evenement.data)) {
      recoitJeu.current(evenement.from, evenement.data);
    }
  }, []);

  const salon = useSalon({ jeu: "mesure", contexte, nom, surEvenement });
  const { moi, joueurs, meneur } = salon;
  const jeu = useMeneur({
    moi,
    meneur,
    joueurs,
    regles: REGLES,
    envoie: salon.envoie,
  });
  recoitJeu.current = jeu.recoit;

  const { partie } = jeu;
  const enCours = partie !== null && partie.phase !== "fin";
  const maintenant = useMaintenant(enCours);
  const restantMs = partie
    ? Math.max(0, partie.restantMs - (maintenant - jeu.recuA))
    : 0;

  return (
    <Salon
      lang={lang}
      room={salon.room}
      hote={contexte.hote}
      etat={salon.etat}
      erreur={salon.erreur}
      onNouveau={salon.nouveau}
      fete={
        partie?.phase === "bilan" && (partie.resultats[moi]?.points ?? 0) >= 80
          ? partie.manche
          : null
      }
      cote={
        <Classement
          lang={lang}
          joueurs={joueurs}
          moi={moi}
          meneur={meneur}
          scores={partie?.scores}
          etiquette={(id) =>
            partie?.phase === "manche" && partie.valides.includes(id)
              ? texte(lang, "aValide")
              : null
          }
        />
      }
    >
      <Stack spacing={1.5}>
        <Consigne
          lang={lang}
          partie={partie}
          moi={moi}
          estMeneur={jeu.estMeneur}
          restantMs={restantMs}
          nbJoueurs={joueurs.length}
          erreur={jeu.erreur}
          onLance={(duree, manches) =>
            jeu.lance(() =>
              catalogue(lang).then(({ champions }) =>
                nouvellePartie(
                  jeu.presents.current,
                  duree,
                  manches,
                  lang,
                  champions,
                  Math.random,
                ),
              ),
            )
          }
        />
        {enCours && (
          <Toise
            key={partie.manche}
            lang={lang}
            partie={partie}
            moi={moi}
            estMeneur={jeu.estMeneur}
            agit={jeu.agit}
          />
        )}
      </Stack>
    </Salon>
  );
}

function Toise({
  lang,
  partie,
  moi,
  estMeneur,
  agit,
}: {
  lang: Contexte["lang"];
  partie: PartieMesure;
  moi: string;
  estMeneur: boolean;
  agit: (valeur: unknown) => void;
}) {
  const [hauteur, setHauteur] = useState(partie.depart);
  const { etalon, cible } = partie;
  const valide = partie.valides.includes(moi);
  const joue =
    partie.phase === "manche" && partie.joueurs.includes(moi) && !valide;

  if (!etalon || !cible) {
    return null;
  }
  return (
    <Stack spacing={1}>
      <GameStage ratio={RATIO} reserve={RESERVE_PX}>
        <Scene
          lang={lang}
          partie={partie}
          moi={moi}
          hauteur={hauteur}
          actif={joue}
          onHauteur={setHauteur}
          onLache={(valeur) => agit({ choix: valeur })}
        />
      </GameStage>
      {partie.phase === "manche" ? (
        <Stack direction="row" spacing={2} align="center">
          <Slider
            label={texte(lang, "curseur", { cible: cible.nom })}
            value={hauteur}
            min={HAUTEUR_MIN}
            max={HAUTEUR_MAX}
            step={0.002}
            disabled={!joue}
            onChange={setHauteur}
            onCommit={(valeur) => agit({ choix: valeur })}
          />
          <Button
            disabled={!joue}
            onClick={() => agit({ choix: hauteur, valide: true })}
          >
            {texte(lang, valide ? "valide" : "valider")}
          </Button>
        </Stack>
      ) : (
        estMeneur && (
          <div>
            <Button variant="secondary" onClick={() => agit({ suite: true })}>
              {texte(lang, "suite")}
            </Button>
          </div>
        )
      )}
      {partie.phase === "manche" && (
        <Text variant="caption" tone="secondary">
          {texte(lang, "regler")}
        </Text>
      )}
    </Stack>
  );
}
