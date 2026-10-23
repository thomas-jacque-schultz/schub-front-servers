import { useCallback, useRef, useState } from "react";
import {
  Button,
  GameStage,
  SegmentedControl,
  Stack,
  SwatchButton,
} from "../../common";
import { catalogue } from "../commun/champions";
import {
  Classement,
  type Fiche,
  Fil,
  Jeu,
  Reponse,
  Salon,
} from "../commun/ecrans";
import type { Evenement } from "../commun/relay";
import type { Lang } from "../commun/textes";
import { type Contexte, useMaintenant, useSalon } from "../commun/useSalon";
import { estMessageJeu, type MessageJeu, useMeneur } from "../commun/useMeneur";
import { Board } from "./Board";
import { Flux } from "./flux";
import { Consigne } from "./Jeu";
import { nouvellePartie, type Partie } from "./partie";
import { nouvelleManche, REGLES } from "./regles";
import { texte } from "./textes";
import { estMorceau, GOMME, type Morceau, RATIO, Tableau } from "./traits";

const COULEURS = [
  "#F2E9EE",
  "#8A8A8A",
  "#E0576B",
  "#FF8C42",
  "#FFD23F",
  "#C9A227",
  "#8B5A2B",
  "#9BE564",
  "#4FB783",
  "#2E7D32",
  "#3DDBD9",
  "#5B9BE8",
  "#1E3A8A",
  "#8E5CF7",
  "#A4477E",
  "#FF77B7",
];
const EPAISSEURS = [0.004, 0.009, 0.02];
const NOMS_EPAISSEURS = ["fin", "moyen", "epais"] as const;
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
  const recus = useRef(new Flux<Morceau>()).current;
  const [version, setVersion] = useState(0);
  const [couleur, setCouleur] = useState(COULEURS[0]);
  const [epaisseur, setEpaisseur] = useState(EPAISSEURS[1]);
  const enPartie = useRef<{ current: Partie | null }>({ current: null });
  const recoitJeu = useRef<(de: string | null, m: MessageJeu) => void>(
    () => undefined,
  );

  const vide = useCallback(() => {
    tableau.vide();
    setVersion((v) => v + 1);
  }, [tableau]);

  const surEvenement = useCallback(
    (evenement: Evenement) => {
      switch (evenement.type) {
        case "joined":
          tableau.vide();
          evenement.history
            .filter(estMorceau)
            .forEach((morceau) => tableau.ajoute(morceau));
          setVersion((v) => v + 1);
          break;
        case "message": {
          const p = enPartie.current.current;
          if (estMessageJeu(evenement.data)) {
            recoitJeu.current(evenement.from, evenement.data);
          } else if (
            estMorceau(evenement.data) &&
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
            onMorceau={(morceau) => salon.envoie(morceau, true)}
            recus={recus}
          />
        </GameStage>
        {enCours && !dessinateur && (
          <Reponse
            key={`${partie.cycle}-${partie.dessinateur}-${devine}`}
            lang={lang}
            proche={jeu.proche}
            actif={devine}
            onEnvoie={jeu.devine}
          />
        )}
        {dessinable && (
          <Outils
            lang={lang}
            couleur={couleur}
            epaisseur={epaisseur}
            onCouleur={setCouleur}
            onEpaisseur={setEpaisseur}
            onEfface={effaceTout}
          />
        )}
      </Stack>
    </Salon>
  );
}

function Outils({
  lang,
  couleur,
  epaisseur,
  onCouleur,
  onEpaisseur,
  onEfface,
}: {
  lang: Lang;
  couleur: string;
  epaisseur: number;
  onCouleur: (couleur: string) => void;
  onEpaisseur: (epaisseur: number) => void;
  onEfface: () => void;
}) {
  return (
    <Stack direction="row" spacing={1.5} align="center" wrap>
      <Stack direction="row" spacing={0.5} wrap>
        {COULEURS.map((c) => (
          <SwatchButton
            key={c}
            color={c}
            label={c}
            selected={c === couleur}
            onClick={() => onCouleur(c)}
          />
        ))}
      </Stack>
      <SegmentedControl
        label={texte(lang, "epaisseur")}
        value={String(EPAISSEURS.indexOf(epaisseur))}
        onChange={(rang) => onEpaisseur(EPAISSEURS[Number(rang)])}
        options={NOMS_EPAISSEURS.map((n, rang) => ({
          value: String(rang),
          label: texte(lang, n),
        }))}
      />
      <Button
        size="small"
        variant={couleur === GOMME ? "primary" : "secondary"}
        onClick={() => onCouleur(GOMME)}
      >
        {texte(lang, "gomme")}
      </Button>
      <Button size="small" variant="ghost" onClick={onEfface}>
        {texte(lang, "effacer")}
      </Button>
    </Stack>
  );
}
