import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Button,
  Card,
  ChampionIcon,
  ChampionPickButton,
  CursorCooldown,
  Frame,
  Stack,
  Text,
  TextField,
} from "../../common";
import { icone } from "../commun/champions";
import { type Donnees, donnees, iconeObjet } from "../commun/ddragon";
import { normalise } from "../commun/devinette";
import {
  AvecDonnees,
  Chrono,
  Classement,
  type Fiche,
  Fil,
  Fin,
  Jeu,
  Preparation,
  Reglage,
  Reponse,
  Salon,
} from "../commun/ecrans";
import type { Evenement } from "../commun/relay";
import type { Lang } from "../commun/textes";
import { type Univers, univers } from "../commun/univers";
import { estMessageJeu, type MessageJeu, useMeneur } from "../commun/useMeneur";
import { type Contexte, useMaintenant, useSalon } from "../commun/useSalon";
import {
  DELAI_ERREUR_MS,
  DUREE_DEFAUT,
  DUREES,
  type Enigme,
  type Indice,
  MANCHES,
  MANCHES_DEFAUT,
  nouvellePartie,
  type PartieIndices,
  visibles,
} from "./partie";
import { type Famille, grille } from "./familles";
import { creerRegles } from "./regles";
import { texte } from "./textes";

const FICHE: Fiche = {
  titre: (lang) => texte(lang, "titre"),
  icone: "🕵️",
  accroche: (lang) => texte(lang, "accroche"),
};

export function IndicesApp() {
  return (
    <Jeu
      fiche={FICHE}
      rendu={(contexte, nom) => (
        <AvecDonnees
          charge={() =>
            Promise.all([
              donnees(contexte.lang),
              univers(contexte.lang).catch(() => null),
            ])
          }
          chargement={texte(contexte.lang, "chargement")}
          echec={texte(contexte.lang, "erreurDonnees")}
          reessayer={texte(contexte.lang, "reessayer")}
        >
          {([lues, u]) => (
            <Partie contexte={contexte} nom={nom} donnees={lues} univers={u} />
          )}
        </AvecDonnees>
      )}
    />
  );
}

function Partie({
  contexte,
  nom,
  donnees: lues,
  univers: u,
}: {
  contexte: Contexte;
  nom: string;
  donnees: Donnees;
  univers: Univers | null;
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

  const salon = useSalon({ jeu: "indices", contexte, nom, surEvenement });
  const { moi, joueurs, meneur } = salon;
  const presents = useRef(joueurs);
  presents.current = joueurs;
  const regles = useMemo(
    () => creerRegles(lues, u, () => presents.current),
    [lues, u],
  );
  const jeu = useMeneur({ moi, meneur, joueurs, regles, envoie: salon.envoie });
  recoitJeu.current = jeu.recoit;

  const { partie } = jeu;
  const maintenant = useMaintenant(partie !== null && partie.phase !== "fin");
  const restantMs = partie
    ? Math.max(0, partie.restantMs - (maintenant - jeu.recuA))
    : 0;
  const [duree, setDuree] = useState(DUREE_DEFAUT);
  const [manches, setManches] = useState(MANCHES_DEFAUT);
  const lance = (d: number, m: number) =>
    jeu.lance(() =>
      Promise.resolve(nouvellePartie(jeu.presents.current, d, m, lang, lues)),
    );

  return (
    <Salon
      lang={lang}
      room={salon.room}
      hote={contexte.hote}
      etat={salon.etat}
      erreur={salon.erreur}
      onNouveau={salon.nouveau}
      fete={
        partie && partie.phase !== "fin" && partie.trouve.includes(moi)
          ? partie.manche
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
              partie?.phase === "manche" && partie.trouve.includes(id)
                ? "✓"
                : null
            }
          />
          {partie && partie.phase !== "fin" && (
            <Fil lang={lang} fil={partie.fil} noms={partie.noms} />
          )}
        </Stack>
      }
    >
      {!partie ? (
        <Preparation
          lang={lang}
          estMeneur={jeu.estMeneur}
          nbJoueurs={joueurs.length}
          minimum={2}
          erreur={null}
          onLance={() => lance(duree, manches)}
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
      ) : partie.phase === "fin" ? (
        <Fin
          lang={lang}
          estMeneur={jeu.estMeneur}
          onRejoue={() => lance(partie.duree, partie.manches)}
        />
      ) : (
        <Manche
          lang={lang}
          partie={partie}
          moi={moi}
          restantMs={restantMs}
          proche={jeu.proche}
          donnees={lues}
          onChoisis={jeu.agit}
          onObjet={(id) => jeu.agit({ objet: id })}
          onDevine={jeu.devine}
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
  proche,
  donnees: lues,
  onChoisis,
  onObjet,
  onDevine,
}: {
  lang: Lang;
  partie: PartieIndices;
  moi: string;
  restantMs: number;
  proche: boolean;
  donnees: Donnees;
  onChoisis: (categorie: "champion" | "objet") => void;
  onObjet: (id: string) => void;
  onDevine: (texte: string) => void;
}) {
  // Après chaque essai, deux secondes d'attente (Schub#161) ; le meneur ignore aussi ceux qui arrivent pendant.
  const [essai, setEssai] = useState<number | null>(null);
  const [attente, setAttente] = useState(false);
  const minuterie = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(minuterie.current), []);
  const essaie = (envoi: () => void) => {
    envoi();
    setEssai((n) => (n ?? 0) + 1);
    setAttente(true);
    window.clearTimeout(minuterie.current);
    minuterie.current = window.setTimeout(
      () => setAttente(false),
      DELAI_ERREUR_MS,
    );
  };

  const titre = texte(lang, "manche", {
    n: partie.manche,
    total: partie.manches,
  });

  if (partie.phase === "categorie") {
    return (
      <Card
        title={titre}
        actions={<Chrono lang={lang} restantMs={restantMs} />}
      >
        {partie.choisit === moi ? (
          <Stack spacing={1.5}>
            <Text>{texte(lang, "choisis")}</Text>
            <Stack direction="row" spacing={1.5} wrap>
              <Button onClick={() => onChoisis("champion")}>
                {texte(lang, "champion")}
              </Button>
              <Button onClick={() => onChoisis("objet")}>
                {texte(lang, "objet")}
              </Button>
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

  const enigme = partie.enigme;
  if (!enigme) {
    return null;
  }
  const montres = visibles(partie, restantMs);
  const pas = (partie.duree * 1000) / enigme.indices.length;
  const prochainDans = Math.ceil(
    (restantMs - (enigme.indices.length - montres) * pas) / 1000,
  );
  const enManche = partie.phase === "manche";
  const devine =
    enManche && partie.devineurs.includes(moi) && !partie.trouve.includes(moi);

  return (
    <Stack spacing={1.5}>
      <Card
        title={titre}
        description={texte(
          lang,
          enigme.categorie === "champion"
            ? "questionChampion"
            : "questionObjet",
        )}
        actions={enManche && <Chrono lang={lang} restantMs={restantMs} />}
      >
        <Stack spacing={1}>
          {enigme.indices.slice(0, montres).map((indice, index) => (
            <Frame key={index} dense>
              <Text variant="overline" tone="secondary">
                {libelle(lang, indice)}
              </Text>
              <Text>{valeur(lang, indice)}</Text>
            </Frame>
          ))}
          {enManche && montres < enigme.indices.length && (
            <Text variant="caption" tone="secondary">
              {texte(lang, "prochain", { n: Math.max(0, prochainDans) })}
            </Text>
          )}
        </Stack>
      </Card>
      {enManche ? (
        <>
          {enigme.categorie === "objet" && (
            <Text variant="caption" tone="secondary">
              {texte(lang, "grille")}
            </Text>
          )}
          <Reponse
            key={`${partie.manche}-${devine}`}
            lang={lang}
            proche={proche}
            actif={devine && !attente}
            onEnvoie={(t) => essaie(() => onDevine(t))}
          />
          {enigme.categorie === "objet" && (
            <GrilleObjets
              key={partie.manche}
              lang={lang}
              donnees={lues}
              actif={devine && !attente}
              onChoisis={(id) => essaie(() => onObjet(id))}
            />
          )}
          <CursorCooldown
            trigger={devine ? essai : null}
            durationMs={DELAI_ERREUR_MS}
          />
        </>
      ) : (
        <Solution lang={lang} version={partie.version} enigme={enigme} />
      )}
    </Stack>
  );
}

/**
 * Tous les objets de la boutique en petites icônes, une rangée serrée par famille, le nom au survol (Schub#161) :
 * la grille tient sans défiler. Un essai raté se grise pour soi seul.
 */
function GrilleObjets({
  lang,
  donnees: lues,
  actif,
  onChoisis,
}: {
  lang: Lang;
  donnees: Donnees;
  actif: boolean;
  onChoisis: (id: string) => void;
}) {
  const [colonnes] = useState(() => grille(lues.objets, Math.random));
  const [essayes, setEssayes] = useState<string[]>([]);
  const [filtre, setFiltre] = useState("");
  const cherche = normalise(filtre);
  return (
    <Card>
      <Stack spacing={1.5}>
        <TextField
          label={texte(lang, "filtre")}
          value={filtre}
          onChange={setFiltre}
        />
        <Stack spacing={0.5}>
          {colonnes.map(({ famille, objets }) => {
            const vus = objets.filter((o) =>
              normalise(o.nom).includes(cherche),
            );
            return (
              vus.length > 0 && (
                <Stack
                  key={famille}
                  direction="row"
                  spacing={0.25}
                  align="center"
                  wrap
                >
                  <Text variant="overline" tone="secondary">
                    {nomFamille(lang, famille)}
                  </Text>
                  {vus.map((o) => (
                    <ChampionPickButton
                      key={o.id}
                      champion={{
                        name: o.nom,
                        iconUrl: iconeObjet(lues.version, o.id),
                      }}
                      label={o.nom}
                      size="small"
                      disabled={!actif || essayes.includes(o.id)}
                      onClick={() => {
                        setEssayes((deja) => [...deja, o.id]);
                        onChoisis(o.id);
                      }}
                    />
                  ))}
                </Stack>
              )
            );
          })}
        </Stack>
      </Stack>
    </Card>
  );
}

function Solution({
  lang,
  version,
  enigme,
}: {
  lang: Lang;
  version: string;
  enigme: Enigme;
}) {
  return (
    <Frame accent>
      <Stack direction="row" spacing={1.5} align="center">
        <ChampionIcon
          src={
            enigme.categorie === "champion"
              ? icone(version, enigme.id)
              : iconeObjet(version, enigme.id)
          }
          name={enigme.nom}
          size="large"
        />
        <Text variant="subtitle">
          {texte(lang, "cetait", { mot: enigme.nom })}
        </Text>
      </Stack>
    </Frame>
  );
}

const libelle = (lang: Lang, indice: Indice): string => {
  switch (indice.type) {
    case "classes":
      return texte(lang, "classes");
    case "portee":
      return texte(lang, "portee");
    case "sort":
      return texte(lang, "sort");
    case "titre":
      return texte(lang, "titreChampion");
    case "region":
      return texte(lang, "region");
    case "skin":
      return texte(lang, "skin");
    case "roles":
      return texte(lang, "roles");
    case "recette":
      return texte(lang, "recette");
    case "prix":
      return texte(lang, "prix");
    case "stats":
      return texte(lang, "stats");
    case "composants":
      return texte(lang, "composants");
    case "description":
      return texte(lang, "description");
  }
};

const nomFamille = (lang: Lang, famille: Famille) =>
  texte(lang, `famille_${famille}`);

const CLASSES = ["Fighter", "Mage", "Assassin", "Marksman", "Tank", "Support"];

const valeur = (lang: Lang, indice: Indice): string => {
  switch (indice.type) {
    case "classes":
      return indice.classes
        .map((classe) =>
          CLASSES.includes(classe) ? texte(lang, classe as "Fighter") : classe,
        )
        .join(", ");
    case "portee":
      return [
        texte(lang, indice.aDistance ? "aDistance" : "melee"),
        indice.ressource,
      ]
        .filter(Boolean)
        .join(" · ");
    case "sort":
    case "region":
    case "skin":
      return indice.nom;
    case "roles":
      return indice.familles.map((f) => nomFamille(lang, f)).join(", ");
    case "recette":
      return indice.noms.join(", ") || texte(lang, "aucuneRecette");
    case "titre":
    case "description":
      return indice.texte;
    case "prix":
      return texte(lang, `tranche${indice.tranche}` as "tranche0");
    case "stats":
      return indice.lignes.join(" · ") || texte(lang, "aucuneStat");
    case "composants":
      return indice.noms.join(", ") || texte(lang, "aucunComposant");
  }
};
