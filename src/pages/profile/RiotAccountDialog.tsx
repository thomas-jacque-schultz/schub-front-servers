import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { ApiError } from "../../api/httpClient";
import {
  RiotAccountChangeRequired,
  linkRiotAccountApi,
  searchKnownRiotAccountsApi,
  verifyRiotAccountApi,
} from "../../api/profileApi";
import { claimTeamsApi } from "../../api/teamsApi";
import {
  Alert,
  Button,
  Chip,
  ChoiceList,
  type ChoiceListOption,
  Dialog,
  EmptyState,
  Spinner,
  Stack,
  Text,
  TextField,
} from "../../design-system";
import { useLocaleFormat } from "../../i18n/format";
import { durationToMinutes } from "./duration";
import { isRiotIdComplete } from "./riotId";
import { RIOT_POSITIONS } from "../../types/profile";
import type {
  KnownRiotAccountDto,
  ProfileDto,
  RiotAccountChangeDto,
  RiotPosition,
} from "../../types/profile";

/** Le temps laissé à la frappe avant d'interroger : une requête par pause, pas par caractère. */
const SEARCH_DEBOUNCE_MS = 300;

/** En dessous, toute saisie ressemble à tout : on n'interroge pas. */
const MIN_QUERY_LENGTH = 3;

/** Au-delà, l'observation date d'une saison précédente : le Riot ID a pu changer de main. */
const PEREMPTION_MS = 180 * 24 * 60 * 60 * 1000;

/**
 * Le cœur sert le poste en **chaîne**, pas en énumération fermée : un poste que Riot ajouterait
 * arriverait ici sans que ce fichier le sache. Ce garde sépare ce qu'on sait traduire du reste.
 */
const estPosteConnu = (position: string): position is RiotPosition =>
  (RIOT_POSITIONS as readonly string[]).includes(position);

/**
 * La partie gauche d'un `Pseudo#TAG`, ou la saisie entière si elle n'en porte pas.
 *
 * <p>C'est elle, et jamais la saisie complète, qui part en recherche : le cœur traite un Riot ID
 * complet comme une demande de vérification et appelle Riot. Le tag n'est pas un critère de
 * recherche ici, c'est ce qui désigne un compte précis — donc l'affaire du bouton.</p>
 */
const pseudoDe = (saisie: string): string => saisie.split("#")[0].trim();

interface RiotAccountDialogProps {
  open: boolean;
  /** Le compte actuellement lié, ou `null`. Sa présence fait de ce dialogue un *changement*. */
  currentRiotId: string | null;
  onClose: () => void;
  onLinked: (profile: ProfileDto) => void;
}

/**
 * Lier — ou changer — son compte Riot.
 *
 * <h2>Une zone, une liste, un geste</h2>
 *
 * <p>On écrit, la liste se remplit depuis nos données à partir de trois caractères, et
 * <strong>on choisit en cliquant dedans</strong>. C'est le seul geste qui lie : il n'existe plus
 * de second chemin, et c'est délibéré — le défaut corrigé ici venait précisément d'une saisie
 * qui validait sans passer par la liste.</p>
 *
 * <h2>Ce que fait le bouton, et ce qu'il ne fait pas</h2>
 *
 * <p><strong>L'API Riot n'a aucune recherche par pseudo partiel.</strong> Ce n'est pas une
 * limitation qu'on contourne, c'est une opération qui n'existe pas chez eux : la liste vient
 * donc de nos données, et au démarrage elle est vide. Le bouton est la réponse à ça — il écrit
 * un `Pseudo#TAG` entier à Riot, qui répond s'il existe, et le compte <em>rejoint la liste</em>.
 * Il n'a rien lié : c'est toujours le clic qui le fera, et le compte vérifié profite à tout le
 * monde puisqu'il reste dans l'index.</p>
 *
 * <h2>Le changement se confirme sur les faits du cœur</h2>
 *
 * <p>Il n'existe pas de route de prévisualisation : un envoi sans `confirmChange` répond 409
 * <em>en portant</em> ce que le remplacement emporte. Le refus est donc l'information, et l'écran
 * ne peut pas proposer de confirmer un changement dont il n'a pas reçu les conséquences.</p>
 */
export function RiotAccountDialog({
  open,
  currentRiotId,
  onClose,
  onLinked,
}: RiotAccountDialogProps) {
  const { t } = useTranslation("profile");
  const { formatDateTime } = useLocaleFormat();

  const [query, setQuery] = useState<string>("");
  const [suggestions, setSuggestions] = useState<KnownRiotAccountDto[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [hasSearched, setHasSearched] = useState<boolean>(false);

  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  /** Le Riot ID que Riot vient de confirmer. Il est dans la liste ; reste à le choisir. */
  const [verified, setVerified] = useState<string | null>(null);

  /** Le compte qu'on ne peut lier qu'en assumant ce que le cœur a renvoyé avec son refus. */
  const [pending, setPending] = useState<{ riotId: string; change: RiotAccountChangeDto } | null>(
    null,
  );

  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const isChange = currentRiotId !== null;

  const reset = useCallback(() => {
    setQuery("");
    setSuggestions([]);
    setHasSearched(false);
    setIsVerifying(false);
    setVerified(null);
    setPending(null);
    setError("");
  }, []);

  useEffect(() => {
    if (!open) {
      reset();
    }
  }, [open, reset]);

  /** La recherche, temporisée, et sur le pseudo seul : la frappe n'appelle jamais Riot. */
  useEffect(() => {
    const cherche = pseudoDe(query);

    if (!open || cherche.length < MIN_QUERY_LENGTH) {
      setSuggestions([]);
      setHasSearched(false);
      return;
    }

    let active = true;
    setIsSearching(true);

    const timer = setTimeout(() => {
      void searchKnownRiotAccountsApi(cherche)
        .then((found) => {
          if (active) {
            setSuggestions(found);
            setHasSearched(true);
          }
        })
        .finally(() => {
          if (active) {
            setIsSearching(false);
          }
        });
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [query, open]);

  /**
   * Le nom d'un poste, traduit quand on le connaît.
   *
   * <p>Un poste inconnu s'affiche <strong>brut</strong> plutôt que de rendre une clé de traduction
   * manquante : un `riot.position.NOUVEAU` affiché à l'écran serait pire que le mot d'origine.</p>
   */
  const nomDePoste = useCallback(
    (position: string): string =>
      estPosteConnu(position) ? t(`riot.position.${position}`) : position,
    [t],
  );

  /**
   * La phrase d'un refus, choisie sur le **statut** et non sur le texte du serveur.
   *
   * <p>Le cœur répond en français. Le reprendre tel quel afficherait une phrase française sur le
   * site anglais — visible, et faux. Le statut, lui, est la même information dans les deux
   * langues. Le message du serveur reste le repli pour ce qu'on n'a pas prévu.</p>
   */
  const messageDeRefus = useCallback(
    (cause: unknown): string => {
      if (cause instanceof ApiError) {
        if (cause.status === 409) {
          return t("riot.link.conflict");
        }
        if (cause.status === 404) {
          return t("riot.link.notFound");
        }
        if (cause.status === 503) {
          return t("riot.link.verifyUnavailable");
        }
      }
      return cause instanceof Error ? cause.message : t("riot.link.failed");
    },
    [t],
  );

  /** Demander à Riot. Ce geste n'engage rien : il fait exister le compte dans la liste. */
  const verifier = async () => {
    const riotId = query.trim();
    setIsVerifying(true);
    setError("");
    setVerified(null);

    try {
      const trouves = await verifyRiotAccountApi(riotId);
      setSuggestions(trouves);
      setHasSearched(true);
      setVerified(riotId);
    } catch (verifyError) {
      setError(messageDeRefus(verifyError));
    } finally {
      setIsVerifying(false);
    }
  };

  /**
   * Lier le compte choisi.
   *
   * <p>Premier envoi sans `confirmChange` : s'il s'agit d'en remplacer un autre, le cœur refuse
   * en rendant les conséquences, et l'écran bascule sur elles. Les deux 409 possibles se
   * distinguent par la présence de ces conséquences — « déjà pris par quelqu'un d'autre » n'en
   * porte pas, et demande un geste opposé.</p>
   */
  const lier = async (riotId: string, confirmChange: boolean) => {
    setIsSaving(true);
    setError("");

    try {
      const profil = await linkRiotAccountApi(riotId, confirmChange);

      // Le cœur le demande explicitement après un succès : c'est cet appel qui rattache les
      // places d'effectif laissées à ce Riot ID, et qui les resynchronise après un changement.
      // Son échec ne remet pas la liaison en cause — elle, elle a abouti.
      await claimTeamsApi().catch(() => undefined);

      onLinked(profil);
      onClose();
    } catch (linkError) {
      if (linkError instanceof RiotAccountChangeRequired) {
        setPending({ riotId, change: linkError.change });
      } else {
        setError(messageDeRefus(linkError));
      }
    } finally {
      setIsSaving(false);
    }
  };

  const options = useMemo<ChoiceListOption[]>(
    () =>
      suggestions.map((account) => {
        const perimee = Date.now() - new Date(account.observedAt).getTime() > PEREMPTION_MS;
        return {
          id: account.riotId,
          label: account.riotId,
          description:
            account.source === "RESOLUTION"
              ? t("riot.suggestion.verifiedAt", {
                  date: formatDateTime(new Date(account.observedAt)),
                })
              : t("riot.suggestion.lastPlayed", {
                  date: formatDateTime(new Date(account.observedAt)),
                }),
          meta: (
            <>
              {/* Des faits servis par le cœur, pas des déductions : se reconnaître sans comparer
                  d'identifiants, savoir avant de cliquer qu'un compte est déjà pris, et voir
                  qu'une identité est vieille plutôt que de la croire courante. */}
              {account.mine && <Chip label={t("riot.suggestion.mine")} tone="success" />}
              {account.alreadyLinked && !account.mine && (
                <Chip label={t("riot.suggestion.alreadyLinked")} tone="warning" variant="outline" />
              )}
              {perimee && (
                <Chip label={t("riot.suggestion.stale")} tone="warning" variant="outline" />
              )}
              <Chip
                label={
                  account.matchCount === 0
                    ? t("riot.suggestion.neverPlayed")
                    : t("riot.suggestion.matchCount", { count: account.matchCount })
                }
                tone="primary"
                variant="outline"
              />
              {account.positions.slice(0, 2).map((played) => (
                <Chip
                  key={played.position}
                  label={t("riot.suggestion.positionWithCount", {
                    position: nomDePoste(played.position),
                    count: played.matches,
                  })}
                  variant="outline"
                />
              ))}
            </>
          ),
        };
      }),
    [suggestions, t, formatDateTime, nomDePoste],
  );

  return (
    <Dialog
      open={open}
      title={isChange ? t("riot.change.title") : t("riot.link.title")}
      description={isChange && !pending ? t("riot.change.description") : undefined}
      cancelLabel={t("actions.cancel", { ns: "common" })}
      confirmLabel={pending ? t("riot.change.confirm") : undefined}
      confirmLoading={isSaving}
      destructive={Boolean(pending)}
      onClose={onClose}
      onConfirm={pending ? () => void lier(pending.riotId, true) : undefined}
    >
      <Stack spacing={2.5}>
        {error && <Alert severity="error">{error}</Alert>}

        {pending ? (
          <Stack spacing={2}>
            {/* Revenir à la liste sans perdre la recherche déjà faite. */}
            <Stack direction="row">
              <Button
                variant="ghost"
                onClick={() => {
                  setPending(null);
                  setError("");
                }}
              >
                {t("actions.back", { ns: "common" })}
              </Button>
            </Stack>
            <Text variant="caption" tone="secondary">
              {t("riot.change.from")} : {currentRiotId} — {t("riot.change.to")} : {pending.riotId}
            </Text>
            <ChangeConsequences change={pending.change} />
          </Stack>
        ) : (
          <>
            <Stack spacing={1}>
              <TextField
                label={t("riot.link.searchLabel")}
                value={query}
                onChange={(value) => {
                  setQuery(value);
                  setVerified(null);
                }}
                placeholder={t("riot.link.searchPlaceholder")}
                helperText={t("riot.link.searchHelper")}
                autoFocus
              />
              {isSearching && (
                <Stack direction="row" spacing={1} align="center">
                  <Spinner label={t("riot.link.searching")} size="small" />
                  <Text variant="caption" tone="secondary">
                    {t("riot.link.searching")}
                  </Text>
                </Stack>
              )}
            </Stack>

            {/* Le bouton ne cherche pas : il demande à Riot si ce Riot ID existe, et le fait
                entrer dans la liste. Il ne s'active que sur un `Pseudo#TAG` entier, parce que
                c'est la seule forme que Riot sache résoudre. */}
            <Stack spacing={1}>
              <Stack direction="row" justify="end">
                <Button
                  variant="secondary"
                  disabled={!isRiotIdComplete(query)}
                  loading={isVerifying}
                  onClick={() => void verifier()}
                >
                  {t("riot.link.verify")}
                </Button>
              </Stack>
              <Text variant="caption" tone="secondary">
                {query.trim().length > 0 && !isRiotIdComplete(query)
                  ? t("riot.link.verifyNeedsFullId")
                  : t("riot.link.verifyHelper")}
              </Text>
              {verified && <Alert severity="success">{t("riot.link.verified", { riotId: verified })}</Alert>}
            </Stack>

            {hasSearched && !isSearching && (
              <ChoiceList
                label={t("riot.link.suggestions")}
                options={options}
                onSelect={(riotId) => void lier(riotId, false)}
                empty={
                  <EmptyState
                    title={t("riot.link.noSuggestionTitle")}
                    description={t("riot.link.noSuggestionDescription")}
                  />
                }
              />
            )}
          </>
        )}
      </Stack>
    </Dialog>
  );
}

/**
 * Ce que le remplacement emporte — **les faits que le cœur a renvoyés**, et rien d'autre.
 *
 * <p>Un champ absent ou faux ne produit aucune ligne. C'est délibéré : inventer « environ vingt
 * minutes » quand le serveur ne l'a pas dit donnerait un chiffre qu'on lirait comme vrai, et qui
 * survivrait à celui qui l'a écrit.</p>
 */
function ChangeConsequences({ change }: { change: RiotAccountChangeDto }) {
  const { t } = useTranslation("profile");

  const minutes = durationToMinutes(change.estimatedDuration);

  const lines: string[] = [];

  if (change.statsReset) {
    lines.push(t("riot.change.statsReset"));
  }
  if (change.ingestRestarted) {
    lines.push(t("riot.change.ingestRestarted"));
  }
  if (change.estimatedMatches > 0) {
    lines.push(t("riot.change.estimatedMatches", { count: change.estimatedMatches }));
  }
  if (minutes !== null && minutes > 0) {
    lines.push(t("riot.change.estimatedDuration", { count: minutes }));
  }
  if (change.rosterSlotsToClaim) {
    lines.push(t("riot.change.rosterSlotsToClaim"));
  }

  if (lines.length === 0) {
    return <Alert severity="warning">{t("riot.change.unknownConsequences")}</Alert>;
  }

  return (
    <Alert severity="warning" title={t("riot.change.consequencesTitle")}>
      <Stack spacing={0.5} component="ul">
        {lines.map((line) => (
          <Text key={line} component="li" variant="caption">
            {line}
          </Text>
        ))}
      </Stack>
    </Alert>
  );
}
