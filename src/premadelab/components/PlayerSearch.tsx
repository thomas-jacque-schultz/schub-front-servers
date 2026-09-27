import { type FormEvent, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Button,
  ChoiceList,
  type ChoiceListOption,
  Stack,
  TextField,
  useLocalizedNavigate,
} from "../../common";
import {
  playerSlug,
  searchPlayersApi,
  slugFromRiotId,
} from "../api/playersApi";
import type { PlayerSuggestionDto } from "../types/player";

const DEBOUNCE_MS = 300;
const MIN_QUERY = 3;

/** Un Riot ID complet ouvre sa page ; une saisie partielle propose les comptes déjà connus. */
export function PlayerSearch() {
  const { t } = useTranslation("lol");
  const navigate = useLocalizedNavigate();
  const [query, setQuery] = useState<string>("");
  const [suggestions, setSuggestions] = useState<PlayerSuggestionDto[]>([]);
  const [invalid, setInvalid] = useState<boolean>(false);

  useEffect(() => {
    const pseudo = query.split("#")[0].trim();
    if (pseudo.length < MIN_QUERY) {
      setSuggestions([]);
      return;
    }
    let active = true;
    const timer = setTimeout(() => {
      searchPlayersApi(pseudo)
        .then((found) => active && setSuggestions(found))
        .catch(() => active && setSuggestions([]));
    }, DEBOUNCE_MS);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [query]);

  const open = (slug: string) =>
    navigate(`/players/${encodeURIComponent(slug)}`);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const slug = slugFromRiotId(query);
    if (slug) {
      open(slug);
    } else {
      setInvalid(true);
    }
  };

  const options: ChoiceListOption[] = suggestions.map((player) => ({
    id: player.riotId,
    label: player.riotId,
    description: t("search.suggestionMeta", { count: player.matchCount }),
  }));

  return (
    <form onSubmit={submit}>
      <Stack spacing={2}>
        <Stack direction="responsive" spacing={1.5} align="start">
          <TextField
            label={t("search.label")}
            value={query}
            onChange={(value) => {
              setQuery(value);
              setInvalid(false);
            }}
            placeholder={t("search.placeholder")}
            helperText={invalid ? t("search.invalid") : t("search.helper")}
            error={invalid}
            fullWidth
          />
          <Button type="submit" size="large">
            {t("search.submit")}
          </Button>
        </Stack>
        {options.length > 0 && (
          <Stack spacing={1}>
            <ChoiceList
              label={t("search.known")}
              options={options}
              onSelect={(id) => {
                const player = suggestions.find(
                  (candidate) => candidate.riotId === id,
                );
                if (player) {
                  open(playerSlug(player.gameName, player.tagLine));
                }
              }}
            />
          </Stack>
        )}
      </Stack>
    </form>
  );
}
