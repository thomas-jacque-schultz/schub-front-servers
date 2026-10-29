import { useCallback, useRef } from "react";
import { GameStage, Stack } from "../../common";
import { catalogue } from "../commun/champions";
import {
  Classement,
  type Fiche,
  Fil,
  Jeu,
  Reponse,
  Salon,
} from "../commun/ecrans";
import type { RelaisEvenement as Evenement } from "../../common";
import { type Contexte, useMaintenant, useSalon } from "../commun/useSalon";
import { estMessageJeu, type MessageJeu, useMeneur } from "../commun/useMeneur";
import { Consigne, Image } from "./Jeu";
import { nouvellePartie } from "./partie";
import { REGLES } from "./regles";
import { texte } from "./textes";

// Le splash art garde son format (1215 × 717) ; le titre, la consigne et le champ de réponse restent visibles.
const RATIO = 1215 / 717;
const RESERVE_PX = 280;

const FICHE: Fiche = {
  titre: (lang) => texte(lang, "titre"),
  icone: "🔍",
  accroche: (lang) => texte(lang, "accroche"),
};

export function ZoomApp() {
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

  const salon = useSalon({ jeu: "zoom", contexte, nom, surEvenement });
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
  const maintenant = useMaintenant(partie?.phase === "manche");
  const restantMs = partie
    ? Math.max(0, partie.restantMs - (maintenant - jeu.recuA))
    : 0;
  const enCours = partie !== null && partie.phase !== "fin";
  const devine =
    partie?.phase === "manche" &&
    partie.devineurs.includes(moi) &&
    !partie.trouve.includes(moi);

  return (
    <Salon
      lang={lang}
      room={salon.room}
      hote={contexte.hote}
      etat={salon.etat}
      erreur={salon.erreur}
      onNouveau={salon.nouveau}
      fete={enCours && partie.trouve.includes(moi) ? partie.manche : null}
      cote={
        <Stack spacing={1.5}>
          <Classement
            lang={lang}
            joueurs={joueurs}
            moi={moi}
            meneur={meneur}
            scores={partie?.scores}
            etiquette={(id) =>
              enCours && partie.trouve.includes(id) ? "✓" : null
            }
          />
          {enCours && <Fil lang={lang} fil={partie.fil} noms={partie.noms} />}
        </Stack>
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
              catalogue(lang).then(({ champions: liste }) =>
                nouvellePartie(
                  jeu.presents.current,
                  duree,
                  manches,
                  lang,
                  liste,
                  Math.random,
                ),
              ),
            )
          }
        />
        {enCours && (
          <>
            <GameStage ratio={RATIO} reserve={RESERVE_PX}>
              <Image lang={lang} partie={partie} restantMs={restantMs} />
            </GameStage>
            <Reponse
              key={`${partie.manche}-${devine}`}
              lang={lang}
              proche={jeu.proche}
              actif={devine}
              onEnvoie={jeu.devine}
            />
          </>
        )}
      </Stack>
    </Salon>
  );
}
