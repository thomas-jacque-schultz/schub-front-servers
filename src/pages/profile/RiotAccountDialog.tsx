import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  linkRiotAccountApi,
  previewRiotAccountChangeApi,
  searchKnownRiotAccountsApi,
} from "../../api/profileApi";
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
import { isRiotIdComplete } from "./riotId";
import type {
  KnownRiotAccountDto,
  ProfileDto,
  RiotAccountChangePreviewDto,
} from "../../types/profile";

/** Le temps laissé à la frappe avant d'interroger. Trois lettres tapées, une requête. */
const SEARCH_DEBOUNCE_MS = 300;

/** En dessous, toute saisie ressemble à tout : on n'interroge pas. */
const MIN_QUERY_LENGTH = 3;

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

  const [preview, setPreview] = useState<RiotAccountChangePreviewDto | null>(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const isChange = currentRiotId !== null;

  const reset = useCallback(() => {
    setQuery("");
    setSuggestions([]);
    setHasSearched(false);
    setExact("");
    setCandidate(null);
    setPreview(null);
    setError("");
  }, []);

  useEffect(() => {
    if (!open) {
      reset();
    }
  }, [open, reset]);

  /** La recherche, temporisée : une requête par pause de frappe, pas une par caractère. */
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

  const candidateRiotId = useMemo(() => {
    if (candidate === null) {
      return null;
    }
    return typeof candidate === "string" ? candidate : candidate.riotId;
  }, [candidate]);

  /**
   * Les conséquences, demandées au cœur dès qu'un candidat est retenu.
   *
   * <p>Seulement pour un *changement* : une première liaison n'écrase rien, il n'y a donc aucune
   * conséquence à annoncer, et demander un calcul pour l'afficher vide serait du bruit.</p>
   */
  useEffect(() => {
    if (!isChange || candidateRiotId === null) {
      setPreview(null);
      return;
    }

    let active = true;
    setIsPreviewLoading(true);

    void previewRiotAccountChangeApi(candidateRiotId)
      .then((result) => {
        if (active) {
          setPreview(result);
        }
      })
      .finally(() => {
        if (active) {
          setIsPreviewLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [isChange, candidateRiotId]);

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
            <Chip
              label={t("riot.suggestion.matchCount", { count: account.matchCount })}
              tone="primary"
              variant="outline"
            />
            {account.positions.slice(0, 2).map((played) => (
              <Chip
                key={played.position}
                label={t("riot.suggestion.positionWithCount", {
                  position: t(`riot.position.${played.position}`),
                  count: played.matches,
                })}
                variant="outline"
              />
            ))}
          </>
        ),
      })),
    [suggestions, t, formatDateTime],
  );

  const onConfirm = async () => {
    if (candidateRiotId === null) {
      return;
    }

    setIsSaving(true);
    setError("");

    try {
      onLinked(await linkRiotAccountApi(candidateRiotId));
      onClose();
    } catch (linkError) {
      setError(linkError instanceof Error ? linkError.message : t("riot.link.failed"));
    } finally {
      setIsSaving(false);
    }
  };

  const chosen = typeof candidate === "object" && candidate !== null ? candidate : null;

  return (
    <Dialog
      open={open}
      title={isChange ? t("riot.change.title") : t("riot.link.title")}
      description={isChange ? t("riot.change.description") : undefined}
      cancelLabel={t("actions.cancel", { ns: "common" })}
      confirmLabel={
        candidateRiotId === null
          ? undefined
          : isChange
            ? t("riot.change.confirm")
            : t("riot.link.confirm")
      }
      confirmDisabled={candidateRiotId === null}
      confirmLoading={isSaving}
      destructive={isChange}
      onClose={onClose}
      onConfirm={candidateRiotId === null ? undefined : () => void onConfirm()}
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

            {/* Deux absences, deux messages. « Rien ne correspond à votre saisie » et « nous
                n'avons encore collecté aucune partie » demandent des gestes différents, et les
                confondre laisserait croire à une panne au démarrage — quand c'est l'état normal. */}
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
            {/* La carte de confirmation : ce qu'on s'apprête à revendiquer, relu une fois. */}
            <Card title={t("riot.link.confirmTitle")} description={t("riot.link.confirmDescription")}>
              <Stack spacing={1}>
                {isChange && (
                  <Text variant="caption" tone="secondary">
                    {t("riot.change.from")} : {currentRiotId}
                  </Text>
                )}
                <Text variant="subtitle">{candidateRiotId}</Text>
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
                          position: t(`riot.position.${played.position}`),
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

            {isChange && <ChangeConsequences preview={preview} isLoading={isPreviewLoading} />}
          </Stack>
        )}
      </Stack>
    </Dialog>
  );
}

/**
 * Les conséquences d'un changement — **celles que le cœur renvoie**, et rien d'autre.
 *
 * <p>Un champ absent ne produit aucune ligne. C'est délibéré : inventer « environ vingt minutes »
 * quand le serveur n'a pas su l'établir donnerait un chiffre qu'on lirait comme vrai, et qui
 * survivrait à celui qui l'a écrit. Quand rien n'est calculable, on le dit.</p>
 */
function ChangeConsequences({
  preview,
  isLoading,
}: {
  preview: RiotAccountChangePreviewDto | null;
  isLoading: boolean;
}) {
  const { t } = useTranslation("profile");

  if (isLoading) {
    return <Spinner label={t("riot.change.consequencesTitle")} size="small" />;
  }

  if (!preview) {
    return <Alert severity="warning">{t("riot.change.unknownConsequences")}</Alert>;
  }

  const lines: string[] = [];

  if (preview.statsResetToZero) {
    lines.push(t("riot.change.statsReset"));
  }
  if (preview.matchesKeptOnPreviousAccount !== null) {
    lines.push(t("riot.change.matchesKept", { count: preview.matchesKeptOnPreviousAccount }));
  }
  if (preview.estimatedIngestMinutes !== null) {
    lines.push(t("riot.change.ingestDuration", { count: preview.estimatedIngestMinutes }));
  }
  if (preview.affectedTeams.length > 0) {
    lines.push(
      t("riot.change.affectedTeams", {
        teams: preview.affectedTeams.map((team) => team.name).join(", "),
      }),
    );
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
