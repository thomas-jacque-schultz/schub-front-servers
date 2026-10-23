import { useCallback, useMemo, useRef, useState } from "react";
import {
  APP_URLS,
  Button,
  Card,
  Checkbox,
  ChampionIcon,
  Chip,
  Columns,
  Frame,
  Illustration,
  Link,
  Stack,
  Text,
} from "../../common";
import {
  AvecDonnees,
  Chrono,
  Classement,
  Fin,
  Jeu,
  Preparation,
  Reglage,
  Salon,
} from "../commun/ecrans";
import type { Evenement } from "../commun/relay";
import type { Lang } from "../commun/textes";
import { estMessageJeu, type MessageJeu, useMeneur } from "../commun/useMeneur";
import { type Contexte, useMaintenant, useSalon } from "../commun/useSalon";
import { lisBanque } from "./banque";
import {
  DUREE_DEFAUT,
  DUREES,
  MANCHES,
  MANCHES_DEFAUT,
  nouvellePartie,
  type PartieQuiz,
} from "./partie";
import {
  type QuestionBanque,
  type Theme,
  THEMES,
  themesDisponibles,
} from "./questions";
import { creerRegles } from "./regles";
import { texte } from "./textes";

export function QuizApp() {
  return (
    <Jeu
      titre={(lang) => texte(lang, "titre")}
      rendu={(contexte, nom) => (
        <AvecDonnees
          charge={lisBanque}
          chargement={texte(contexte.lang, "chargement")}
          echec={texte(contexte.lang, "erreurDonnees")}
          reessayer={texte(contexte.lang, "reessayer")}
        >
          {(banque) => <Partie contexte={contexte} nom={nom} banque={banque} />}
        </AvecDonnees>
      )}
    />
  );
}

const nomDuTheme = (lang: Lang, theme: Theme) => texte(lang, `theme_${theme}`);

function Partie({
  contexte,
  nom,
  banque,
}: {
  contexte: Contexte;
  nom: string;
  banque: QuestionBanque[];
}) {
  const { lang } = contexte;
  const recoitJeu = useRef<(de: string | null, m: MessageJeu) => void>(
    () => undefined,
  );
  const surEvenement = useCallback((evenement: Evenement) => {
    if (evenement.type === "message" && estMessageJeu(evenement.data)) {
      recoitJeu.current(evenement.from, evenement.data);
    }
  }, []);

  const salon = useSalon({ jeu: "quiz", contexte, nom, surEvenement });
  const { moi, joueurs, meneur } = salon;
  const presents = useRef(joueurs);
  presents.current = joueurs;
  const courante = useRef(banque);
  const regles = useMemo(
    () =>
      creerRegles(
        () => courante.current,
        () => presents.current,
      ),
    [],
  );
  const jeu = useMeneur({ moi, meneur, joueurs, regles, envoie: salon.envoie });
  recoitJeu.current = jeu.recoit;

  const { partie } = jeu;
  const maintenant = useMaintenant(partie !== null && partie.phase !== "fin");
  const restantMs = partie
    ? Math.max(0, partie.restantMs - (maintenant - jeu.recuA))
    : 0;
  const disponibles = themesDisponibles(banque);
  const [themes, setThemes] = useState<Theme[]>(disponibles);
  const [duree, setDuree] = useState(DUREE_DEFAUT);
  const [manches, setManches] = useState(MANCHES_DEFAUT);
  const lance = (t: Theme[], d: number, m: number) =>
    jeu.lance(() =>
      lisBanque().then((relue) => {
        courante.current = relue;
        return nouvellePartie(
          jeu.presents.current,
          t,
          d,
          m,
          lang,
          relue,
          Math.random,
        );
      }),
    );

  return (
    <Salon
      titre={texte(lang, "titre")}
      lang={lang}
      room={salon.room}
      hote={contexte.hote}
      etat={salon.etat}
      erreur={salon.erreur}
      onNouveau={salon.nouveau}
      cote={
        <Classement
          lang={lang}
          joueurs={joueurs}
          moi={moi}
          meneur={meneur}
          scores={partie?.scores}
          etiquette={(id) =>
            partie?.phase === "question" && id in partie.reponses
              ? texte(lang, "aRepondu")
              : partie?.phase === "bilan" && partie.gains[id]
                ? `+${partie.gains[id]}`
                : null
          }
        />
      }
    >
      {!partie ? (
        <Stack spacing={1.5}>
          {jeu.estMeneur && (
            <Card title={texte(lang, "themes")}>
              <Stack direction="row" spacing={1.5} wrap>
                {disponibles.map((theme) => (
                  <Checkbox
                    key={theme}
                    label={nomDuTheme(lang, theme)}
                    checked={themes.includes(theme)}
                    onChange={(coche) =>
                      setThemes((avant) =>
                        coche
                          ? THEMES.filter(
                              (t) => avant.includes(t) || t === theme,
                            )
                          : avant.filter((t) => t !== theme),
                      )
                    }
                  />
                ))}
              </Stack>
            </Card>
          )}
          <Preparation
            lang={lang}
            estMeneur={jeu.estMeneur}
            nbJoueurs={themes.length > 0 ? joueurs.length : 0}
            minimum={2}
            erreur={themes.length === 0 ? texte(lang, "aucunTheme") : null}
            onLance={() => lance(themes, duree, manches)}
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
        </Stack>
      ) : partie.phase === "fin" ? (
        <Fin
          lang={lang}
          estMeneur={jeu.estMeneur}
          onRejoue={() => lance(partie.themes, partie.duree, partie.manches)}
        />
      ) : (
        <Manche
          lang={lang}
          partie={partie}
          moi={moi}
          restantMs={restantMs}
          onAgit={jeu.agit}
        />
      )}
    </Salon>
  );
}

function Manche({
  lang,
  partie,
  moi,
  restantMs,
  onAgit,
}: {
  lang: Lang;
  partie: PartieQuiz;
  moi: string;
  restantMs: number;
  onAgit: (valeur: unknown) => void;
}) {
  const titre = [
    texte(lang, "manche", { n: partie.manche, total: partie.manches }),
    partie.theme ? nomDuTheme(lang, partie.theme) : null,
  ]
    .filter(Boolean)
    .join(" · ");
  const chrono = partie.phase !== "bilan" && (
    <Chrono lang={lang} restantMs={restantMs} />
  );

  if (partie.phase === "theme") {
    return (
      <Card title={titre} actions={chrono}>
        {partie.choisit === moi ? (
          <Stack spacing={1.5}>
            <Text>{texte(lang, "choisis")}</Text>
            <Stack direction="row" spacing={1.5} wrap>
              {partie.proposes.map((theme) => (
                <Button key={theme} onClick={() => onAgit(theme)}>
                  {nomDuTheme(lang, theme)}
                </Button>
              ))}
            </Stack>
          </Stack>
        ) : (
          <Text tone="secondary">
            {texte(lang, "choisit", {
              nom: partie.noms[partie.choisit ?? ""] ?? "",
            })}
          </Text>
        )}
      </Card>
    );
  }

  const mienne = partie.reponses[moi]?.choix;
  const joue = partie.joueursManche.includes(moi);

  if (partie.phase === "question") {
    return (
      <Card title={titre} actions={chrono}>
        <Stack spacing={1.5}>
          <Enonce partie={partie} />
          <Columns minWidth={220} count={2}>
            {partie.choix.map((choix, index) => (
              <Button
                key={index}
                fullWidth
                variant={mienne === index ? "primary" : "secondary"}
                disabled={!joue || mienne !== undefined}
                onClick={() => onAgit(index)}
              >
                <Choix partie={partie} index={index} texte={choix} />
              </Button>
            ))}
          </Columns>
          {mienne !== undefined && (
            <Text variant="caption" tone="secondary">
              {texte(lang, "attenteReponses")}
            </Text>
          )}
        </Stack>
      </Card>
    );
  }

  const solution = partie.solution;
  const contact = `${APP_URLS.premadelab}${lang === "en" ? "/en" : ""}/contact?sujet=mini-jeux`;
  return (
    <Card title={titre}>
      <Stack spacing={1.5}>
        <Enonce partie={partie} />
        {solution ? (
          <>
            <Columns minWidth={220} count={2}>
              {partie.choix.map((choix, index) => (
                <Frame key={index} dense accent={index === solution.bonne}>
                  <Stack
                    direction="row"
                    justify="between"
                    align="center"
                    spacing={1}
                  >
                    <Text
                      tone={index === solution.bonne ? "primary" : "secondary"}
                      component="div"
                    >
                      <Choix partie={partie} index={index} texte={choix} />
                    </Text>
                    {index === solution.bonne ? (
                      <Chip
                        tone="success"
                        size="small"
                        label={texte(lang, "bonneReponse")}
                      />
                    ) : mienne === index ? (
                      <Chip
                        tone="error"
                        size="small"
                        label={texte(lang, "tonChoix")}
                      />
                    ) : null}
                  </Stack>
                </Frame>
              ))}
            </Columns>
            <Text>{solution.explication}</Text>
            <Stack direction="row" spacing={2} wrap>
              {solution.source && (
                <Link href={solution.source}>{texte(lang, "source")}</Link>
              )}
              <Link href={contact} tone="muted">
                {texte(lang, "signaler")}
              </Link>
            </Stack>
          </>
        ) : (
          <Text tone="secondary">{texte(lang, "annulee")}</Text>
        )}
      </Stack>
    </Card>
  );
}

/** L'énoncé, et son illustration : l'icône d'un objet, ou le splash d'un skin en grand. */
function Enonce({ partie }: { partie: PartieQuiz }) {
  return (
    <Stack spacing={1}>
      {partie.image &&
        (partie.image.includes("/splash/") ? (
          <Illustration src={partie.image} alt={partie.enonce} />
        ) : (
          <ChampionIcon src={partie.image} name={partie.enonce} size="large" />
        ))}
      <Text variant="subtitle">{partie.enonce}</Text>
    </Stack>
  );
}

/** Un choix : sa rangée d'icônes quand il en a une, puis son texte. */
function Choix({
  partie,
  index,
  texte: libelle,
}: {
  partie: PartieQuiz;
  index: number;
  texte: string;
}) {
  const icones = partie.imagesChoix?.[index];
  if (!icones) {
    return <>{libelle}</>;
  }
  const noms = libelle.split(" + ");
  return (
    <Stack direction="row" spacing={0.5} align="center" wrap>
      {icones.map((src, i) => (
        <ChampionIcon
          key={i}
          src={src}
          name={noms[i] ?? libelle}
          size="small"
        />
      ))}
      <span>{libelle}</span>
    </Stack>
  );
}
