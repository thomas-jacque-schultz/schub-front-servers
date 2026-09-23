import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { ApiError } from "../../api/httpClient";
import { searchKnownRiotAccountsApi, verifyRiotAccountApi } from "../../api/profileApi";
import {
  Alert,
  Button,
  Chip,
  ChoiceList,
  type ChoiceListOption,
  EmptyState,
  Spinner,
  Stack,
  Text,
  TextField,
} from "../../design-system";
import { useLocaleFormat } from "../../i18n/format";
import { isRiotIdComplete } from "../../pages/profile/riotId";
import { RIOT_POSITIONS } from "../../types/profile";
import type { KnownRiotAccountDto, RiotPosition } from "../../types/profile";

const SEARCH_DEBOUNCE_MS = 300;

const MIN_QUERY_LENGTH = 3;

const PEREMPTION_MS = 180 * 24 * 60 * 60 * 1000;

const estPosteConnu = (position: string): position is RiotPosition =>
  (RIOT_POSITIONS as readonly string[]).includes(position);

// La partie gauche seulement : une saisie complète déclencherait un appel à Riot.
const pseudoDe = (saisie: string): string => saisie.split("#")[0].trim();

export interface RiotAccountPickerProps {
  onPick: (account: KnownRiotAccountDto) => void;
  busy?: boolean;
  resetKey?: unknown;
}

export function RiotAccountPicker({ onPick, busy = false, resetKey }: RiotAccountPickerProps) {
  const { t } = useTranslation("riot");
  const { formatDateTime } = useLocaleFormat();

  const [query, setQuery] = useState<string>("");
  const [suggestions, setSuggestions] = useState<KnownRiotAccountDto[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [hasSearched, setHasSearched] = useState<boolean>(false);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [verified, setVerified] = useState<string | null>(null);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    setQuery("");
    setSuggestions([]);
    setHasSearched(false);
    setVerified(null);
    setError("");
  }, [resetKey]);

  useEffect(() => {
    const cherche = pseudoDe(query);

    if (cherche.length < MIN_QUERY_LENGTH) {
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
  }, [query]);

  const nomDePoste = useCallback(
    (position: string): string =>
      estPosteConnu(position) ? t(`position.${position}`) : position,
    [t],
  );

  const messageDeRefus = useCallback(
    (cause: unknown): string => {
      if (cause instanceof ApiError) {
        if (cause.status === 404) {
          return t("errors.notFound");
        }
        if (cause.status === 503) {
          return t("verify.unavailable");
        }
      }
      return cause instanceof Error ? cause.message : t("errors.failed");
    },
    [t],
  );

  const verifier = async () => {
    const riotId = query.trim();
    setIsVerifying(true);
    setError("");
    setVerified(null);

    try {
      setSuggestions(await verifyRiotAccountApi(riotId));
      setHasSearched(true);
      setVerified(riotId);
    } catch (verifyError) {
      setError(messageDeRefus(verifyError));
    } finally {
      setIsVerifying(false);
    }
  };

  const parRiotId = useMemo(
    () => new Map(suggestions.map((account) => [account.riotId, account])),
    [suggestions],
  );

  const options = useMemo<ChoiceListOption[]>(
    () =>
      suggestions.map((account) => {
        const perimee = Date.now() - new Date(account.observedAt).getTime() > PEREMPTION_MS;
        return {
          id: account.riotId,
          label: account.riotId,
          description:
            account.source === "RESOLUTION"
              ? t("suggestion.verifiedAt", {
                  date: formatDateTime(new Date(account.observedAt)),
                })
              : t("suggestion.lastPlayed", {
                  date: formatDateTime(new Date(account.observedAt)),
                }),
          meta: (
            <>
              {account.mine && <Chip label={t("suggestion.mine")} tone="success" />}
              {account.alreadyLinked && !account.mine && (
                <Chip label={t("suggestion.alreadyLinked")} tone="warning" variant="outline" />
              )}
              {perimee && <Chip label={t("suggestion.stale")} tone="warning" variant="outline" />}
              <Chip
                label={
                  account.matchCount === 0
                    ? t("suggestion.neverPlayed")
                    : t("suggestion.matchCount", { count: account.matchCount })
                }
                tone="primary"
                variant="outline"
              />
              {account.positions.slice(0, 2).map((played) => (
                <Chip
                  key={played.position}
                  label={t("suggestion.positionWithCount", {
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
    <Stack spacing={2.5}>
      {error && <Alert severity="error">{error}</Alert>}

      <Stack spacing={1}>
        <TextField
          label={t("search.label")}
          value={query}
          onChange={(value) => {
            setQuery(value);
            setVerified(null);
          }}
          placeholder={t("search.placeholder")}
          helperText={t("search.helper")}
          autoFocus
        />
        {isSearching && (
          <Stack direction="row" spacing={1} align="center">
            <Spinner label={t("search.searching")} size="small" />
            <Text variant="caption" tone="secondary">
              {t("search.searching")}
            </Text>
          </Stack>
        )}
      </Stack>

      <Stack spacing={1}>
        <Stack direction="row" justify="end">
          <Button
            variant="secondary"
            disabled={!isRiotIdComplete(query)}
            loading={isVerifying}
            onClick={() => void verifier()}
          >
            {t("verify.action")}
          </Button>
        </Stack>
        <Text variant="caption" tone="secondary">
          {query.trim().length > 0 && !isRiotIdComplete(query)
            ? t("verify.needsFullId")
            : t("verify.helper")}
        </Text>
        {verified && <Alert severity="success">{t("verify.done", { riotId: verified })}</Alert>}
      </Stack>

      {hasSearched && !isSearching && (
        <ChoiceList
          label={t("search.suggestions")}
          options={options}
          disabled={busy}
          onSelect={(riotId) => {
            const account = parRiotId.get(riotId);
            if (account) {
              onPick(account);
            }
          }}
          empty={
            <EmptyState
              title={t("search.noSuggestionTitle")}
              description={t("search.noSuggestionDescription")}
            />
          }
        />
      )}
    </Stack>
  );
}
