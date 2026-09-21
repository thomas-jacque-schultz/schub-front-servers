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

/** Le temps laissé à la frappe avant d'interroger : une requête par pause, pas par caractère. */
const SEARCH_DEBOUNCE_MS = 300;

/** En dessous, toute saisie ressemble à tout : on n'interroge pas. */
const MIN_QUERY_LENGTH = 3;

/** Au-delà, l'observation date d'une saison précédente : le Riot ID a pu changer de main. */
const PEREMPTION_MS = 180 * 24 * 60 * 60 * 1000;

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

export interface RiotAccountPickerProps {
  /** Ce qu'on fait du compte choisi. Le sélecteur ne lie ni n'ajoute rien lui-même. */
  onPick: (account: KnownRiotAccountDto) => void;
  /** Vrai pendant que l'appelant traite le choix : le clic ne se répète pas. */
  busy?: boolean;
  /** Remis à zéro quand il change : fermer et rouvrir ne garde pas la recherche précédente. */
  resetKey?: unknown;
}

/**
 * Une zone, une liste, un geste : on écrit, la liste se remplit depuis nos données à partir de
 * trois caractères, et <strong>on choisit en cliquant dedans</strong>.
 *
 * <p><strong>L'API Riot n'a aucune recherche par pseudo partiel.</strong> Ce n'est pas une
 * limitation qu'on contourne, c'est une opération qui n'existe pas chez eux : la liste vient
 * donc de nos données, et au démarrage elle est vide. Le bouton est la réponse à ça — il écrit
 * un `Pseudo#TAG` entier à Riot, qui répond s'il existe, et le compte <em>rejoint la liste</em>.
 * Il ne choisit rien : c'est toujours le clic qui le fait, et le compte vérifié profite à tout le
 * monde puisqu'il reste dans l'index.</p>
 *
 * <p>Il sert les deux écrans qui désignent un compte Riot — lier le sien, ajouter un membre à
 * une équipe. Les deux posent la même question et l'API ne sait y répondre que d'une façon ;
 * deux copies auraient divergé sur la première correction.</p>
 */
export function RiotAccountPicker({ onPick, busy = false, resetKey }: RiotAccountPickerProps) {
  const { t } = useTranslation("riot");
  const { formatDateTime } = useLocaleFormat();

  const [query, setQuery] = useState<string>("");
  const [suggestions, setSuggestions] = useState<KnownRiotAccountDto[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [hasSearched, setHasSearched] = useState<boolean>(false);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  /** Le Riot ID que Riot vient de confirmer. Il est dans la liste ; reste à le choisir. */
  const [verified, setVerified] = useState<string | null>(null);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    setQuery("");
    setSuggestions([]);
    setHasSearched(false);
    setVerified(null);
    setError("");
  }, [resetKey]);

  /** La recherche, temporisée, et sur le pseudo seul : la frappe n'appelle jamais Riot. */
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

  /**
   * Un poste inconnu s'affiche <strong>brut</strong> plutôt que de rendre une clé de traduction
   * manquante : un `position.NOUVEAU` affiché à l'écran serait pire que le mot d'origine.
   */
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

  /** Demander à Riot. Ce geste n'engage rien : il fait exister le compte dans la liste. */
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
              {/* Des faits servis par le cœur, pas des déductions : se reconnaître sans comparer
                  d'identifiants, savoir avant de cliquer qu'un compte est déjà pris, et voir
                  qu'une identité est vieille plutôt que de la croire courante. */}
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

      {/* Le bouton ne cherche pas : il demande à Riot si ce Riot ID existe, et le fait entrer
          dans la liste. Il ne s'active que sur un `Pseudo#TAG` entier, parce que c'est la seule
          forme que Riot sache résoudre. */}
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
