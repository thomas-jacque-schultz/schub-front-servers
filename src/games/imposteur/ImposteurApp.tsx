import { useCallback, useMemo, useRef, useState } from "react";
import {
  Button,
  Card,
  ChampionIcon,
  Chip,
  Columns,
  FeatureTile,
  Frame,
  Stack,
  Text,
} from "../../common";
import { icone, splash } from "../commun/champions";
import {
  AvecDonnees,
  Chrono,
  Classement,
  Fin,
  Jeu,
  Preparation,
  Reglage,
  Reponse,
  Salon,
} from "../commun/ecrans";
import type { Evenement } from "../commun/relay";
import type { Lang } from "../commun/textes";
import { estMessageJeu, type MessageJeu, useMeneur } from "../commun/useMeneur";
import { type Contexte, useMaintenant, useSalon } from "../commun/useSalon";
import { cartes as lisCartes } from "./cartes";
import {
  type Carte,
  type Geste,
  MANCHES,
  MANCHES_DEFAUT,
  MINIMUM,
  motValide,
  nouvellePartie,
  type PartieImposteur,
  quiParle,
  TOURS,
} from "./partie";
import { creerRegles } from "./regles";
import { texte } from "./textes";

export function ImposteurApp() {
  return (
    <Jeu
      titre={(lang) => texte(lang, "titre")}
      rendu={(contexte, nom) => (
        <AvecDonnees
          charge={() => lisCartes(contexte.lang)}
          chargement={texte(contexte.lang, "chargement")}
          echec={texte(contexte.lang, "erreurDonnees")}
          reessayer={texte(contexte.lang, "reessayer")}
        >
          {(lues) => (
            <Partie
              contexte={contexte}
              nom={nom}
              version={lues.version}
              cartes={lues.cartes}
            />
          )}
        </AvecDonnees>
      )}
    />
  );
}

function Partie({
  contexte,
  nom,
  version,
  cartes,
}: {
  contexte: Contexte;
  nom: string;
  version: string;
  cartes: Carte[];
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

  const salon = useSalon({ jeu: "imposteur", contexte, nom, surEvenement });
  const { moi, joueurs, meneur } = salon;
  const presents = useRef(joueurs);
  presents.current = joueurs;
  const regles = useMemo(
    () => creerRegles(cartes, () => presents.current),
    [cartes],
  );
  const jeu = useMeneur({ moi, meneur, joueurs, regles, envoie: salon.envoie });
  recoitJeu.current = jeu.recoit;

  const { partie } = jeu;
  const maintenant = useMaintenant(partie !== null && partie.phase !== "fin");
  const restantMs = partie
    ? Math.max(0, partie.restantMs - (maintenant - jeu.recuA))
    : 0;
  const [manches, setManches] = useState(MANCHES_DEFAUT);
  const carte = useCallback(
    (id: string | undefined) => cartes.find((c) => c.id === id) ?? null,
    [cartes],
  );
  const lance = (m: number) =>
    jeu.lance(() =>
      Promise.resolve(
        nouvellePartie(jeu.presents.current, m, lang, cartes, Math.random),
      ),
    );
  const agit = (geste: Geste) => jeu.agit(geste);

  const maCarte =
    partie && partie.phase !== "fin" ? carte(partie.cartes[moi]) : null;

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
        <Stack spacing={1.5}>
          {partie && partie.phase !== "fin" && (
            <Stack spacing={0.5}>
              <Text variant="overline" tone="secondary">
                {texte(lang, "taCarte")}
              </Text>
              {maCarte ? (
                <FeatureTile
                  image={splash(maCarte.id)}
                  imageAlt={maCarte.nom}
                  title={maCarte.nom}
                />
              ) : (
                <Text tone="secondary">{texte(lang, "attenteManche")}</Text>
              )}
            </Stack>
          )}
          <Classement
            lang={lang}
            joueurs={joueurs}
            moi={moi}
            meneur={meneur}
            scores={partie?.scores}
          />
        </Stack>
      }
    >
      {!partie ? (
        <Stack spacing={1.5}>
          <Text tone="secondary">{texte(lang, "regle")}</Text>
          <Preparation
            lang={lang}
            estMeneur={jeu.estMeneur}
            nbJoueurs={joueurs.length}
            minimum={MINIMUM}
            erreur={null}
            onLance={() => lance(manches)}
          >
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
          onRejoue={() => lance(partie.manches)}
        />
      ) : (
        <Stack spacing={1.5}>
          <Consigne
            lang={lang}
            partie={partie}
            moi={moi}
            restantMs={restantMs}
            version={version}
            carte={carte}
            onGeste={agit}
          />
          <Plateau lang={lang} partie={partie} moi={moi} onGeste={agit} />
        </Stack>
      )}
    </Salon>
  );
}

function Consigne({
  lang,
  partie,
  moi,
  restantMs,
  version,
  carte,
  onGeste,
}: {
  lang: Lang;
  partie: PartieImposteur;
  moi: string;
  restantMs: number;
  version: string;
  carte: (id: string | undefined) => Carte | null;
  onGeste: (geste: Geste) => void;
}) {
  const titre =
    partie.phase === "mots"
      ? `${texte(lang, "manche", { n: partie.manche, total: partie.manches })} · ${texte(lang, "tour", { n: partie.tour, total: TOURS })}`
      : texte(lang, "manche", { n: partie.manche, total: partie.manches });
  const chrono = partie.phase !== "revelation" && (
    <Chrono lang={lang} restantMs={restantMs} />
  );
  const nomDe = (id: string) => partie.noms[id] ?? "";

  if (partie.phase === "mots") {
    const parle = quiParle(partie);
    const maCarte = carte(partie.cartes[moi]);
    return (
      <Card title={titre} actions={chrono}>
        {parle === moi && maCarte ? (
          <Stack spacing={1}>
            <Text>{texte(lang, "aToi")}</Text>
            <Reponse
              key={`${partie.manche}-${partie.tour}`}
              lang={lang}
              proche={false}
              actif
              libelle={texte(lang, "tonMot")}
              bouton={texte(lang, "dire")}
              valide={(mot) => motValide(mot, maCarte.nom)}
              erreur={texte(lang, "motRefuse")}
              onEnvoie={(mot) => onGeste({ mot: mot.trim() })}
            />
          </Stack>
        ) : (
          <Text tone="secondary">
            {texte(lang, "parle", { nom: nomDe(parle ?? "") })}
          </Text>
        )}
      </Card>
    );
  }

  if (partie.phase === "vote") {
    const monVote = partie.votes[moi];
    return (
      <Card title={titre} actions={chrono}>
        <Text>
          {monVote
            ? texte(lang, "tonVote", { nom: nomDe(monVote) })
            : texte(lang, "vote")}
        </Text>
      </Card>
    );
  }

  if (partie.phase === "chance") {
    return (
      <Card title={titre} actions={chrono}>
        {partie.imposteur === moi ? (
          <Stack spacing={1.5}>
            <Text>{texte(lang, "chance")}</Text>
            <Stack direction="row" spacing={1} wrap>
              {partie.propositions.map((id) => {
                const c = carte(id);
                return (
                  <Button
                    key={id}
                    variant="secondary"
                    startIcon={
                      <ChampionIcon
                        src={icone(version, id)}
                        name={c?.nom ?? id}
                        size="small"
                      />
                    }
                    onClick={() => onGeste({ chance: id })}
                  >
                    {c?.nom ?? id}
                  </Button>
                );
              })}
            </Stack>
          </Stack>
        ) : (
          <Text tone="secondary">
            {texte(lang, "chanceAutre", { nom: nomDe(partie.imposteur) })}
          </Text>
        )}
      </Card>
    );
  }

  const champion = carte(partie.champion);
  const leurre = carte(partie.leurre);
  return (
    <Card title={titre}>
      <Stack spacing={1.5}>
        {partie.annulee ? (
          <Text>{texte(lang, "annulee")}</Text>
        ) : (
          <>
            <Text variant="subtitle">
              {texte(lang, "imposteurEtait", {
                nom: nomDe(partie.imposteur),
              })}
            </Text>
            {partie.chance && (
              <Text tone="secondary">
                {texte(
                  lang,
                  partie.chance === partie.champion
                    ? "chanceTrouvee"
                    : "chanceRatee",
                  { nom: nomDe(partie.imposteur) },
                )}
              </Text>
            )}
            <Stack direction="row" spacing={1} wrap>
              {Object.entries(partie.gains).map(([id, n]) => (
                <Chip
                  key={id}
                  tone="primary"
                  label={texte(lang, "gain", { nom: nomDe(id), n })}
                />
              ))}
            </Stack>
          </>
        )}
        <Columns minWidth={180} count={2}>
          {champion && (
            <Stack spacing={0.5}>
              <Text variant="overline" tone="secondary">
                {texte(lang, "champion")}
              </Text>
              <FeatureTile
                image={splash(champion.id)}
                imageAlt={champion.nom}
                title={champion.nom}
              />
            </Stack>
          )}
          {leurre && (
            <Stack spacing={0.5}>
              <Text variant="overline" tone="secondary">
                {texte(lang, "leurre")}
              </Text>
              <FeatureTile
                image={splash(leurre.id)}
                imageAlt={leurre.nom}
                title={leurre.nom}
              />
            </Stack>
          )}
        </Columns>
      </Stack>
    </Card>
  );
}

/** Le plateau : un cadre par joueur, ses mots dessous, celui qui parle en accent ; le vote s'y fait. */
function Plateau({
  lang,
  partie,
  moi,
  onGeste,
}: {
  lang: Lang;
  partie: PartieImposteur;
  moi: string;
  onGeste: (geste: Geste) => void;
}) {
  const parle = quiParle(partie);
  const voix: Record<string, number> = {};
  for (const cible of Object.values(partie.votes)) {
    voix[cible] = (voix[cible] ?? 0) + 1;
  }
  const revele = partie.phase === "revelation" && !partie.annulee;
  const peutVoter =
    partie.phase === "vote" &&
    partie.ordre.includes(moi) &&
    !(moi in partie.votes);

  return (
    <Columns minWidth={180}>
      {partie.ordre.map((id) => (
        <Frame
          key={id}
          accent={
            id === parle ||
            partie.votes[moi] === id ||
            (revele && id === partie.imposteur)
          }
        >
          <Stack spacing={1}>
            <Stack direction="row" justify="between" align="center" spacing={1}>
              <Text
                variant="subtitle"
                tone={id === moi ? "primary" : "default"}
                truncate
              >
                {partie.noms[id] ?? ""}
              </Text>
              {partie.phase === "vote" && id in partie.votes && (
                <Text variant="caption" tone="secondary">
                  {texte(lang, "aVote")}
                </Text>
              )}
              {revele && (voix[id] ?? 0) > 0 && (
                <Text variant="caption" mono tone="secondary">
                  {texte(lang, "voix", { n: voix[id] })}
                </Text>
              )}
            </Stack>
            <Stack direction="row" spacing={0.75} wrap>
              {(partie.mots[id] ?? []).map((mot, index) => (
                <Chip key={index} label={mot} variant="outline" />
              ))}
            </Stack>
            {peutVoter && id !== moi && (
              <div>
                <Button
                  size="small"
                  variant="secondary"
                  onClick={() => onGeste({ vote: id })}
                >
                  {texte(lang, "voter")}
                </Button>
              </div>
            )}
          </Stack>
        </Frame>
      ))}
    </Columns>
  );
}
