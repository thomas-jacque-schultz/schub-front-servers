import { useCallback, useEffect, useRef, useState } from "react";
import { Frame, GameStage, Illustration, Stack, Text } from "../../common";
import { catalogue, splash } from "../commun/champions";
import {
  Classement,
  type Fiche,
  Fil,
  Jeu,
  Reponse,
  Salon,
} from "../commun/ecrans";
import type { Evenement } from "../commun/relay";
import { type Contexte, useMaintenant, useSalon } from "../commun/useSalon";
import { estMessageJeu, type MessageJeu, useMeneur } from "../commun/useMeneur";
import { AideChampions } from "./Aide";
import { Board, type Outil } from "./Board";
import { Flux } from "./flux";
import { Consigne } from "./Jeu";
import { Outils } from "./Outils";
import { COULEURS, EPAISSEURS } from "./palette";
import { nouvellePartie, type Partie } from "./partie";
import { nouvelleManche, REGLES } from "./regles";
import { texte } from "./textes";
import { estOperation, type Operation, RATIO, Tableau } from "./traits";

// Le titre, la consigne, le champ de réponse et les outils : le tableau prend la hauteur qui reste.
const RESERVE_PX = 330;

const FICHE: Fiche = {
  titre: (lang) => texte(lang, "titre"),
  icone: "🎨",
  accroche: (lang) => texte(lang, "accroche"),
};

export function ScribbleApp() {
  return (
    <Jeu
      fiche={FICHE}
      rendu={(contexte, nom) => <Salle contexte={contexte} nom={nom} />}
    />
  );
}

function Salle({ contexte, nom }: { contexte: Contexte; nom: string }) {
  const { lang } = contexte;
  const tableau = useRef(new Tableau()).current;
  const recus = useRef(new Flux<Operation>()).current;
  const [version, setVersion] = useState(0);
  const [couleur, setCouleur] = useState(COULEURS[0]);
  const [outil, setOutil] = useState<Outil>("feutre");
  // Mes traits et remplissages encore sur le tableau, du plus ancien au plus récent : Ctrl + Z retire le dernier.
  const [mesFaits, setMesFaits] = useState<string[]>([]);
  const [epaisseur, setEpaisseur] = useState(EPAISSEURS[2]);
  const changeEpaisseur = useCallback(
    (sens: 1 | -1) =>
      setEpaisseur((avant) => {
        const rang = EPAISSEURS.indexOf(avant) + sens;
        return EPAISSEURS[Math.min(EPAISSEURS.length - 1, Math.max(0, rang))];
      }),
    [],
  );
  const enPartie = useRef<{ current: Partie | null }>({ current: null });
  const recoitJeu = useRef<(de: string | null, m: MessageJeu) => void>(
    () => undefined,
  );

  const vide = useCallback(() => {
    tableau.vide();
    setMesFaits([]);
    setVersion((v) => v + 1);
  }, [tableau]);

  const surEvenement = useCallback(
    (evenement: Evenement) => {
      switch (evenement.type) {
        case "joined":
          tableau.vide();
          evenement.history
            .filter(estOperation)
            .forEach((operation) => tableau.enregistre(operation));
          setMesFaits([]);
          setVersion((v) => v + 1);
          break;
        case "message": {
          const p = enPartie.current.current;
          if (estMessageJeu(evenement.data)) {
            recoitJeu.current(evenement.from, evenement.data);
          } else if (
            estOperation(evenement.data) &&
            (!p || (p.phase === "dessin" && evenement.from === p.dessinateur))
          ) {
            recus.emet(evenement.data);
          }
          break;
        }
        case "cleared":
          vide();
          break;
      }
    },
    [recus, tableau, vide],
  );

  const salon = useSalon({ jeu: "scribble", contexte, nom, surEvenement });
  const { moi, joueurs, meneur, efface } = salon;

  const effaceTout = useCallback(() => {
    efface();
    vide();
  }, [efface, vide]);

  const jeu = useMeneur({
    moi,
    meneur,
    joueurs,
    regles: REGLES,
    envoie: salon.envoie,
    surPublication: (avant, apres) => {
      if (nouvelleManche(avant, apres)) {
        effaceTout();
      }
    },
  });
  recoitJeu.current = jeu.recoit;
  enPartie.current = jeu.courante;

  const { partie } = jeu;
  const maintenant = useMaintenant(
    partie?.phase === "choix" || partie?.phase === "dessin",
  );
  const enCours = partie !== null && partie.phase !== "fin";

  // Tout le monde dessine en attendant la première partie ; ensuite, le dessinateur seul, et personne à la fin.
  const dessinable =
    !partie || (partie.phase === "dessin" && partie.dessinateur === moi);
  const devine =
    partie?.phase === "dessin" &&
    partie.devineurs.includes(moi) &&
    !partie.trouve.includes(moi);
  const dessinateur = enCours && partie.dessinateur === moi;

  const fait = (operation: Operation) => {
    salon.envoie(operation, true);
    if (operation.k !== "u") {
      setMesFaits((faits) =>
        faits.includes(operation.id) ? faits : [...faits, operation.id],
      );
    }
  };
  const annule = useCallback(() => {
    const id = mesFaits.at(-1);
    if (id === undefined) {
      return;
    }
    const annulation: Operation = { k: "u", id };
    recus.emet(annulation);
    salon.envoie(annulation, true);
    setMesFaits((faits) => faits.slice(0, -1));
  }, [mesFaits, recus, salon]);

  useEffect(() => {
    if (!dessinable) {
      return;
    }
    const touche = (event: KeyboardEvent) => {
      const saisie = (event.target as HTMLElement | null)?.closest(
        "input, textarea",
      );
      if (
        (event.ctrlKey || event.metaKey) &&
        event.key.toLowerCase() === "z" &&
        !saisie
      ) {
        event.preventDefault();
        annule();
      }
    };
    window.addEventListener("keydown", touche);
    return () => window.removeEventListener("keydown", touche);
  }, [annule, dessinable]);

  return (
    <Salon
      lang={lang}
      room={salon.room}
      hote={contexte.hote}
      etat={salon.etat}
      erreur={salon.erreur}
      onNouveau={salon.nouveau}
      fete={
        enCours && partie.trouve.includes(moi)
          ? `${partie.cycle}-${partie.dessinateur}`
          : null
      }
      cote={
        <Stack spacing={1.5}>
          <Classement
            lang={lang}
            joueurs={joueurs}
            moi={moi}
            meneur={meneur}
            scores={partie?.scores}
            etiquette={(id) =>
              !enCours
                ? null
                : id === partie.dessinateur
                  ? texte(lang, "dessinateur")
                  : partie.trouve.includes(id)
                    ? "✓"
                    : null
            }
          />
          {dessinateur && partie.phase === "dessin" && partie.mot && (
            <Frame dense>
              <Stack spacing={0.75}>
                <Text variant="overline" tone="secondary">
                  {texte(lang, "modele")}
                </Text>
                <Illustration
                  src={splash(partie.mot.id)}
                  alt={partie.mot.nom}
                  maxHeight={180}
                />
              </Stack>
            </Frame>
          )}
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
          restantMs={
            partie
              ? Math.max(0, partie.restantMs - (maintenant - jeu.recuA))
              : 0
          }
          nbJoueurs={joueurs.length}
          erreur={jeu.erreur}
          onLance={(duree, tours) =>
            jeu.lance(() =>
              catalogue(lang).then(({ version: v, champions }) =>
                nouvellePartie(
                  jeu.presents.current,
                  duree,
                  tours,
                  lang,
                  v,
                  champions,
                  Math.random,
                ),
              ),
            )
          }
          onChoisis={jeu.agit}
        />
        <GameStage ratio={RATIO} reserve={RESERVE_PX}>
          <Board
            tableau={tableau}
            actif={dessinable}
            couleur={couleur}
            epaisseur={epaisseur}
            version={version}
            auteur={moi}
            outil={outil}
            onOperation={fait}
            recus={recus}
            onCran={changeEpaisseur}
          />
        </GameStage>
        {enCours && !dessinateur && (
          <>
            <Reponse
              key={`${partie.cycle}-${partie.dessinateur}-${devine}`}
              lang={lang}
              proche={jeu.proche}
              actif={devine}
              onEnvoie={jeu.devine}
            />
            {devine && (
              <AideChampions
                key={`${partie.cycle}-${partie.dessinateur}`}
                lang={lang}
                langPartie={partie.lang}
                onPropose={jeu.devine}
              />
            )}
          </>
        )}
        {dessinable && (
          <Outils
            lang={lang}
            couleur={couleur}
            epaisseur={epaisseur}
            outil={outil}
            peutAnnuler={mesFaits.length > 0}
            onCouleur={setCouleur}
            onEpaisseur={setEpaisseur}
            onOutil={setOutil}
            onAnnule={annule}
            onEfface={effaceTout}
          />
        )}
      </Stack>
    </Salon>
  );
}
