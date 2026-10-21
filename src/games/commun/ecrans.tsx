import { type ReactNode, useEffect, useRef, useState } from "react";
import {
  Alert,
  AppThemeProvider,
  Button,
  Card,
  PageContainer,
  SelectField,
  SideLayout,
  Stack,
  Text,
  TextField,
} from "../../common";
import type { Ligne } from "./devinette";
import { playerName, rememberName } from "./identity";
import type { Joueur } from "./relay";
import { type CleCommune, type Lang, texteCommun } from "./textes";
import { type Contexte, type EtatSalon, useContexte } from "./useSalon";

// Les écrans communs des jeux sur le design system de PremadeLab (Schub#139). Scribble et Zoom ont encore leurs
// équivalents en CSS (salon.tsx, jeu.tsx).

const NOM_MAX = 24;
const REPONSE_MAX = 60;
const FIL_AFFICHE = 8;

/** L'entrée d'un jeu : le thème, puis la langue et le salon (PremadeLab ou l'adresse), puis le pseudo. */
export function Jeu({
  titre,
  rendu,
}: {
  titre: (lang: Lang) => string;
  rendu: (contexte: Contexte, nom: string) => ReactNode;
}) {
  return (
    <AppThemeProvider defaultMode="dark">
      <Entree titre={titre} rendu={rendu} />
    </AppThemeProvider>
  );
}

function Entree({
  titre,
  rendu,
}: {
  titre: (lang: Lang) => string;
  rendu: (contexte: Contexte, nom: string) => ReactNode;
}) {
  const contexte = useContexte();
  const [nom, setNom] = useState<string | null>(playerName());
  const [saisie, setSaisie] = useState("");

  if (!contexte) {
    return null;
  }
  if (nom) {
    return <PageContainer>{rendu(contexte, nom)}</PageContainer>;
  }
  const { lang } = contexte;
  const propre = saisie.trim().slice(0, NOM_MAX);
  return (
    <PageContainer width="sm">
      <Stack
        component="form"
        spacing={2}
        onSubmit={(event) => {
          event.preventDefault();
          if (propre) {
            rememberName(propre);
            setNom(propre);
          }
        }}
      >
        <Text variant="title" component="h1">
          {titre(lang)}
        </Text>
        <TextField
          label={texteCommun(lang, "pseudoInvite")}
          value={saisie}
          onChange={setSaisie}
          autoFocus
          fullWidth
        />
        <div>
          <Button type="submit" disabled={!propre}>
            {texteCommun(lang, "rejoindre")}
          </Button>
        </div>
      </Stack>
    </PageContainer>
  );
}

/** Les données d'un jeu (Data Dragon…) avant le salon : le meneur et qui reprend après lui en ont besoin. */
export function AvecDonnees<T>({
  charge,
  chargement,
  echec,
  reessayer,
  children,
}: {
  charge: () => Promise<T>;
  chargement: string;
  echec: string;
  reessayer: string;
  children: (donnees: T) => ReactNode;
}) {
  const [donnees, setDonnees] = useState<T | null>(null);
  const [erreur, setErreur] = useState(false);
  const [essai, setEssai] = useState(0);
  const lis = useRef(charge);
  lis.current = charge;

  useEffect(() => {
    let actif = true;
    lis.current().then(
      (lues) => actif && setDonnees(() => lues),
      () => actif && setErreur(true),
    );
    return () => {
      actif = false;
    };
  }, [essai]);

  if (donnees) {
    return <>{children(donnees)}</>;
  }
  if (erreur) {
    return (
      <Stack spacing={1} align="start">
        <Alert severity="error">{echec}</Alert>
        <Button
          variant="secondary"
          onClick={() => {
            setErreur(false);
            setEssai((n) => n + 1);
          }}
        >
          {reessayer}
        </Button>
      </Stack>
    );
  }
  return <Text tone="secondary">{chargement}</Text>;
}

/** Le titre, le code du salon, et le lien à copier quand le jeu est ouvert seul. */
export function EnTete({
  titre,
  lang,
  room,
  hote,
}: {
  titre: string;
  lang: Lang;
  room: string | null;
  hote: string | null;
}) {
  const [copie, setCopie] = useState(false);
  const lien = room ? `${location.origin}/${room}` : null;
  return (
    <Stack direction="row" spacing={1.5} align="center" wrap>
      <Text variant="section" component="h1" tone="primary">
        {titre}
      </Text>
      {room && (
        <Text mono tone="secondary">
          {room}
        </Text>
      )}
      {!hote && lien && (
        <Button
          size="small"
          variant="ghost"
          onClick={() =>
            void navigator.clipboard?.writeText(lien).then(() => {
              setCopie(true);
              window.setTimeout(() => setCopie(false), 1500);
            })
          }
        >
          {texteCommun(lang, copie ? "copie" : "copier")}
        </Button>
      )}
    </Stack>
  );
}

/** Le salon : l'en-tête, puis le jeu et sa colonne de joueurs, ou l'erreur qui l'a fermé. */
export function Salon({
  titre,
  lang,
  room,
  hote,
  etat,
  erreur,
  onNouveau,
  cote,
  children,
}: {
  titre: string;
  lang: Lang;
  room: string | null;
  hote: string | null;
  etat: EtatSalon;
  erreur: CleCommune | null;
  onNouveau: () => void;
  cote: ReactNode;
  children: ReactNode;
}) {
  return (
    <Stack spacing={1.5}>
      <EnTete titre={titre} lang={lang} room={room} hote={hote} />
      {etat === "erreur" && erreur ? (
        <Stack spacing={1} align="start">
          <Alert severity="error">{texteCommun(lang, erreur)}</Alert>
          <Button variant="secondary" onClick={onNouveau}>
            {texteCommun(lang, "nouveau")}
          </Button>
        </Stack>
      ) : (
        <SideLayout side={cote}>
          {etat === "salon" ? (
            children
          ) : (
            <Text tone="secondary">
              {texteCommun(
                lang,
                etat === "reconnexion" ? "reconnexion" : "connexion",
              )}
            </Text>
          )}
        </SideLayout>
      )}
    </Stack>
  );
}

/** Les joueurs du salon, rangés par score quand une partie a commencé. */
export function Classement({
  lang,
  joueurs,
  moi,
  meneur,
  scores,
  etiquette,
}: {
  lang: Lang;
  joueurs: Joueur[];
  moi: string;
  meneur: string | null;
  scores?: Record<string, number>;
  /** Ce qu'un joueur fait dans la manche (« a répondu », « choisit le thème »). */
  etiquette?: (id: string) => string | null;
}) {
  const ranges = scores
    ? [...joueurs].sort((a, b) => (scores[b.id] ?? 0) - (scores[a.id] ?? 0))
    : joueurs;
  return (
    <Card title={texteCommun(lang, scores ? "scores" : "joueurs")}>
      <Stack spacing={0.75}>
        {ranges.map((j) => {
          const role = etiquette?.(j.id);
          return (
            <Stack key={j.id} direction="row" justify="between" spacing={1}>
              <Stack spacing={0}>
                <Text tone={j.id === moi ? "primary" : "default"} truncate>
                  {j.name}
                </Text>
                {(role || j.id === meneur) && (
                  <Text variant="caption" tone="secondary">
                    {[
                      role,
                      j.id === meneur ? texteCommun(lang, "meneur") : null,
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </Text>
                )}
              </Stack>
              {scores && (
                <Text mono tone="secondary">
                  {texteCommun(lang, "points", { n: scores[j.id] ?? 0 })}
                </Text>
              )}
            </Stack>
          );
        })}
      </Stack>
    </Card>
  );
}

/** Les dernières réponses fausses, et qui a trouvé. */
export function Fil({
  lang,
  fil,
  noms,
}: {
  lang: Lang;
  fil: Ligne[];
  noms: Record<string, string>;
}) {
  if (fil.length === 0) {
    return null;
  }
  return (
    <Card title={texteCommun(lang, "reponses")}>
      <Stack spacing={0.5}>
        {fil.slice(-FIL_AFFICHE).map((ligne, index) => (
          <Text
            key={index}
            variant="caption"
            tone={ligne.trouve ? "primary" : "secondary"}
          >
            {ligne.trouve
              ? texteCommun(lang, "aTrouve", { nom: noms[ligne.joueur] ?? "" })
              : texteCommun(lang, "ligne", {
                  nom: noms[ligne.joueur] ?? "",
                  texte: ligne.texte ?? "",
                })}
          </Text>
        ))}
      </Stack>
    </Card>
  );
}

export function Chrono({ lang, restantMs }: { lang: Lang; restantMs: number }) {
  return (
    <span aria-label={texteCommun(lang, "chrono")}>
      <Text variant="section" mono tone="primary">
        {Math.ceil(restantMs / 1000)}
      </Text>
    </span>
  );
}

/** Un réglage de partie, choisi par le meneur avant de lancer. */
export function Reglage({
  libelle,
  valeurs,
  valeur,
  format,
  onChange,
}: {
  libelle: string;
  valeurs: number[];
  valeur: number;
  format: (valeur: number) => string;
  onChange: (valeur: number) => void;
}) {
  return (
    <SelectField
      label={libelle}
      value={String(valeur)}
      onChange={(choisie) => onChange(Number(choisie))}
      options={valeurs.map((v) => ({ value: String(v), label: format(v) }))}
      fullWidth={false}
      size="small"
    />
  );
}

/** Avant la partie : les réglages et le bouton du meneur, ou l'attente pour les autres. */
export function Preparation({
  lang,
  estMeneur,
  nbJoueurs,
  minimum,
  erreur,
  onLance,
  children,
}: {
  lang: Lang;
  estMeneur: boolean;
  nbJoueurs: number;
  minimum: number;
  erreur: string | null;
  onLance: () => void;
  children?: ReactNode;
}) {
  if (!estMeneur) {
    return <Text tone="secondary">{texteCommun(lang, "attenteMeneur")}</Text>;
  }
  return (
    <Stack spacing={1.5}>
      <Stack direction="row" spacing={1.5} wrap align="center">
        {children}
      </Stack>
      <Stack direction="row" spacing={1.5} wrap align="center">
        <Button disabled={nbJoueurs < minimum} onClick={onLance}>
          {texteCommun(lang, "lancer")}
        </Button>
        {nbJoueurs < minimum && (
          <Text variant="caption" tone="secondary">
            {texteCommun(lang, "attenteJoueursN", { n: minimum })}
          </Text>
        )}
      </Stack>
      {erreur && <Alert severity="error">{erreur}</Alert>}
    </Stack>
  );
}

/** La fin de partie : le meneur relance, les autres attendent. */
export function Fin({
  lang,
  estMeneur,
  onRejoue,
  children,
}: {
  lang: Lang;
  estMeneur: boolean;
  onRejoue: () => void;
  children?: ReactNode;
}) {
  return (
    <Stack spacing={1.5}>
      <Text variant="section">{texteCommun(lang, "recap")}</Text>
      {children}
      {estMeneur ? (
        <div>
          <Button onClick={onRejoue}>{texteCommun(lang, "rejouer")}</Button>
        </div>
      ) : (
        <Text tone="secondary">{texteCommun(lang, "recapAttente")}</Text>
      )}
    </Stack>
  );
}

/** La réponse tapée. Le formulaire se remonte à chaque manche (key) : le champ reprend le focus. */
export function Reponse({
  lang,
  proche,
  actif,
  libelle,
  bouton,
  valide = () => true,
  erreur,
  onEnvoie,
}: {
  lang: Lang;
  proche: boolean;
  actif: boolean;
  libelle?: string;
  bouton?: string;
  /** Une saisie refusée avant d'être envoyée (le mot d'In-vo-posteur), avec sa raison dans erreur. */
  valide?: (texte: string) => boolean;
  erreur?: string;
  onEnvoie: (texte: string) => void;
}) {
  const [saisie, setSaisie] = useState("");
  const propre = saisie.slice(0, REPONSE_MAX);
  const refusee = propre.trim() !== "" && !valide(propre);
  const envoie = () => {
    if (actif && propre.trim() && !refusee) {
      onEnvoie(propre);
      setSaisie("");
    }
  };
  return (
    <Stack
      component="form"
      direction="row"
      spacing={1}
      align="start"
      onSubmit={(event) => {
        event.preventDefault();
        envoie();
      }}
    >
      <TextField
        label={libelle ?? texteCommun(lang, "reponse")}
        value={propre}
        onChange={setSaisie}
        readOnly={!actif}
        autoFocus={actif}
        fullWidth
        error={refusee}
        helperText={
          refusee ? erreur : proche ? texteCommun(lang, "proche") : undefined
        }
      />
      <Button
        type="submit"
        besideField
        disabled={!actif || !propre.trim() || refusee}
      >
        {bouton ?? texteCommun(lang, "proposer")}
      </Button>
    </Stack>
  );
}
