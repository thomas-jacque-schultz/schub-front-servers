import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { ApiError } from "../../api/httpClient";
import {
  RiotAccountChangeRequired,
  linkRiotAccountApi,
  searchKnownRiotAccountsApi,
} from "../../api/profileApi";
import { claimTeamsApi } from "../../api/teamsApi";
import {
  Alert,
  Button,
  Card,
  Chip,
  ChoiceList,
  type ChoiceListOption,
  Dialog,
  Divider,
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

/**
 * Le cœur sert le poste en **chaîne**, pas en énumération fermée : un poste que Riot ajouterait
 * arriverait ici sans que ce fichier le sache. Ce garde sépare ce qu'on sait traduire du reste.
 */
const estPosteConnu = (position: string): position is RiotPosition =>
  (RIOT_POSITIONS as readonly string[]).includes(position);

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
 * <h2>Deux chemins, et pourquoi les deux sont nécessaires</h2>
 *
 * <p><strong>L'API Riot n'a aucune recherche par pseudo partiel.</strong> Ce n'est pas une
 * limitation qu'on contourne, c'est une opération qui n'existe pas chez eux. Les suggestions
 * viennent donc de <em>nos</em> données : chaque partie collectée porte le Riot ID de ses dix
 * participants. D'où la conséquence à ne pas traiter comme une panne — <strong>au démarrage, il
 * n'y a rien à proposer</strong>, et l'écran doit le dire.</p>
 *
 * <p>C'est exactement pour ça que la <strong>saisie exacte reste toujours ouverte</strong>, en
 * dessous et non derrière un repli : elle est le chemin qui fonctionne dans tous les cas, la
 * recherche n'étant qu'une aide.</p>
 *
 * <h2>Pourquoi une carte de confirmation</h2>
 *
 * <p>La propriété du compte Riot n'est <strong>pas vérifiée</strong> — RSO demande une
 * approbation Riot séparée, hors périmètre. Rien n'empêche donc de lier le compte de quelqu'un
 * d'autre par erreur de frappe, et rien ne le signalerait ensuite : les statistiques seraient
 * simplement celles d'un inconnu. La carte donne à relire ce qu'on s'apprête à revendiquer.</p>
 *
 * <h2>Le changement se confirme sur les faits du cœur</h2>
 *
 * <p>Il n'existe pas de route de prévisualisation : un envoi sans {@code confirmChange} répond
 * 409 <em>en portant</em> ce que le remplacement emporte. Le refus est donc l'information, et
 * l'écran ne peut pas proposer de confirmer un changement dont il n'a pas reçu les conséquences —
 * la garantie est structurelle, pas une discipline à tenir.</p>
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

  const [exact, setExact] = useState<string>("");
  /** Le compte retenu, en attente de confirmation. `null` = on est encore en train de choisir. */
  const [candidate, setCandidate] = useState<KnownRiotAccountDto | string | null>(null);
  /** Les conséquences renvoyées par le 409. Non nul = il reste à les assumer. */
  const [change, setChange] = useState<RiotAccountChangeDto | null>(null);

  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const isChange = currentRiotId !== null;

  const reset = useCallback(() => {
    setQuery("");
    setSuggestions([]);
    setHasSearched(false);
    setExact("");
    setCandidate(null);
    setChange(null);
    setError("");
  }, []);

  useEffect(() => {
    if (!open) {
      reset();
    }
  }, [open, reset]);

  /** La recherche, temporisée. */
  useEffect(() => {
    const trimmed = query.trim();

    if (!open || trimmed.length < MIN_QUERY_LENGTH) {
      setSuggestions([]);
      setHasSearched(false);
      return;
    }

    let active = true;
    setIsSearching(true);

    const timer = setTimeout(() => {
      void searchKnownRiotAccountsApi(trimmed)
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

  const candidateRiotId = useMemo(() => {
    if (candidate === null) {
      return null;
    }
    return typeof candidate === "string" ? candidate : candidate.riotId;
  }, [candidate]);

  /**
   * La phrase d'un refus, choisie sur le **statut** et non sur le texte du serveur.
   *
   * <p>Le cœur répond en français. Le reprendre tel quel afficherait une phrase française sur le
   * site anglais — visible, et faux. Le statut, lui, est la même information dans les deux
   * langues. Le message du serveur reste le repli pour ce qu'on n'a pas prévu : le taire
   * laisserait un échec sans explication.</p>
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
      }
      return cause instanceof Error ? cause.message : t("riot.link.failed");
    },
    [t],
  );

  /**
   * Envoyer la liaison.
   *
   * <p>Premier envoi sans {@code confirmChange} : s'il s'agit d'en remplacer un autre, le cœur
   * refuse en rendant les conséquences, et l'écran bascule sur elles. Le second envoi les assume.
   * Les deux 409 possibles se distinguent par la présence de ces conséquences — « déjà pris par
   * quelqu'un d'autre » n'en porte pas, et demande un geste opposé.</p>
   */
  const envoyer = async (confirmChange: boolean) => {
    if (candidateRiotId === null) {
      return;
    }

    setIsSaving(true);
    setError("");

    try {
      const profil = await linkRiotAccountApi(candidateRiotId, confirmChange);

      // Le cœur le demande explicitement après un succès : c'est cet appel qui rattache les
      // places d'effectif laissées à ce Riot ID, et qui les resynchronise après un changement.
      // Son échec ne remet pas la liaison en cause — elle, elle a abouti.
      await claimTeamsApi().catch(() => undefined);

      onLinked(profil);
      onClose();
    } catch (linkError) {
      if (linkError instanceof RiotAccountChangeRequired) {
        setChange(linkError.change);
      } else {
        setError(messageDeRefus(linkError));
      }
    } finally {
      setIsSaving(false);
    }
  };

  const options = useMemo<ChoiceListOption[]>(
    () =>
      suggestions.map((account) => ({
        id: account.riotId,
        label: account.riotId,
        description: account.lastPlayedAt
          ? t("riot.suggestion.lastPlayed", { date: formatDateTime(new Date(account.lastPlayedAt)) })
          : t("riot.suggestion.lastPlayedUnknown"),
        meta: (
          <>
            {/* Deux faits servis par le cœur, pas des déductions : se reconnaître sans comparer
                d'identifiants, et savoir avant de cliquer qu'un compte est déjà pris — sinon on
                découvre le 409 après coup. */}
            {account.mine && <Chip label={t("riot.suggestion.mine")} tone="success" />}
            {account.alreadyLinked && !account.mine && (
              <Chip label={t("riot.suggestion.alreadyLinked")} tone="warning" variant="outline" />
            )}
            <Chip
              label={t("riot.suggestion.matchCount", { count: account.matchCount })}
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
      })),
    [suggestions, t, formatDateTime, nomDePoste],
  );

  const chosen = typeof candidate === "object" && candidate !== null ? candidate : null;

  /** Le libellé du bouton de validation dépend de l'étape, pas seulement du mode. */
  const confirmLabel = (() => {
    if (candidateRiotId === null) {
      return undefined;
    }
    if (change) {
      return t("riot.change.confirm");
    }
    return isChange ? t("riot.change.action") : t("riot.link.confirm");
  })();

  return (
    <Dialog
      open={open}
      title={isChange ? t("riot.change.title") : t("riot.link.title")}
      description={isChange && !change ? t("riot.change.description") : undefined}
      cancelLabel={t("actions.cancel", { ns: "common" })}
      confirmLabel={confirmLabel}
      confirmDisabled={candidateRiotId === null}
      confirmLoading={isSaving}
      destructive={Boolean(change)}
      onClose={onClose}
      onConfirm={candidateRiotId === null ? undefined : () => void envoyer(Boolean(change))}
    >
      <Stack spacing={2.5}>
        {error && <Alert severity="error">{error}</Alert>}

        {candidateRiotId === null ? (
          <>
            <Stack spacing={1}>
              <TextField
                label={t("riot.link.searchLabel")}
                value={query}
                onChange={setQuery}
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

            {/* Un seul message, et il couvre les deux absences possibles : rien ne ressemble à la
                saisie, ou rien n'a encore été collecté. Le front ne peut pas les distinguer — la
                réponse est une liste vide dans les deux cas — donc il ne prétend pas le faire, et
                dit ce qui est vrai des deux : c'est normal, et la saisie exacte est juste en
                dessous. */}
            {hasSearched && !isSearching && (
              <ChoiceList
                label={t("riot.link.suggestions")}
                options={options}
                onSelect={(riotId) => {
                  setCandidate(suggestions.find((account) => account.riotId === riotId) ?? riotId);
                }}
                empty={
                  <EmptyState
                    title={t("riot.link.noSuggestionTitle")}
                    description={t("riot.link.noSuggestionDescription")}
                  />
                }
              />
            )}

            <Divider />

            <Stack spacing={1}>
              <Text variant="caption" tone="secondary">
                {t("riot.link.exactHelper")}
              </Text>
              <TextField
                label={t("riot.link.exactLabel")}
                value={exact}
                onChange={setExact}
                placeholder={t("riot.link.exactPlaceholder")}
                error={exact.trim().length > 0 && !isRiotIdComplete(exact)}
                helperText={
                  exact.trim().length > 0 && !isRiotIdComplete(exact)
                    ? t("riot.link.malformed")
                    : undefined
                }
              />
              <Stack direction="row" justify="end">
                <Button
                  variant="secondary"
                  disabled={!isRiotIdComplete(exact)}
                  onClick={() => setCandidate(exact.trim())}
                >
                  {t("actions.validate", { ns: "common" })}
                </Button>
              </Stack>
            </Stack>
          </>
        ) : (
          <Stack spacing={2}>
            {/* Revenir au choix sans perdre la recherche déjà faite. Sans ce retour, se tromper
                de compte coûte d'annuler le dialogue entier et de tout retaper. */}
            <Stack direction="row">
              <Button
                variant="ghost"
                onClick={() => {
                  setCandidate(null);
                  setChange(null);
                  setError("");
                }}
              >
                {t("actions.back", { ns: "common" })}
              </Button>
            </Stack>

            {/* La carte de confirmation : ce qu'on s'apprête à revendiquer, relu une fois. */}
            <Card title={t("riot.link.confirmTitle")} description={t("riot.link.confirmDescription")}>
              <Stack spacing={1}>
                {isChange && (
                  <Text variant="caption" tone="secondary">
                    {t("riot.change.from")} : {currentRiotId}
                  </Text>
                )}
                <Stack spacing={0.25}>
                  {isChange && (
                    <Text variant="caption" tone="secondary">
                      {t("riot.change.to")}
                    </Text>
                  )}
                  <Text variant="subtitle">{candidateRiotId}</Text>
                </Stack>
                {chosen && (
                  <Stack direction="row" spacing={1} wrap>
                    <Chip
                      label={t("riot.suggestion.matchCount", { count: chosen.matchCount })}
                      tone="primary"
                      variant="outline"
                    />
                    {chosen.positions.map((played) => (
                      <Chip
                        key={played.position}
                        label={t("riot.suggestion.positionWithCount", {
                          position: nomDePoste(played.position),
                          count: played.matches,
                        })}
                        variant="outline"
                      />
                    ))}
                  </Stack>
                )}
                {chosen?.lastPlayedAt && (
                  <Text variant="caption" tone="secondary">
                    {t("riot.suggestion.lastPlayed", {
                      date: formatDateTime(new Date(chosen.lastPlayedAt)),
                    })}
                  </Text>
                )}
              </Stack>
            </Card>

            {change && <ChangeConsequences change={change} />}
          </Stack>
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
