import { requestJson } from "../../common";
import { fenetreParams, type StatsWindow } from "../pages/stats/windows";
import type {
  CollectLane,
  PlayerSuggestionDto,
  SearchedPlayerDto,
} from "../types/player";
import type { MyGamesDto, TeamGameDetailDto } from "../types/stats";

/** Nom-TAG : le dernier tiret sépare le tag, un nom peut en contenir. */
export const playerSlug = (gameName: string, tagLine: string): string =>
  `${gameName}-${tagLine}`;

export const slugFromRiotId = (riotId: string): string | null => {
  const [nom, tag] = riotId.split("#").map((part) => part.trim());
  return nom && tag ? playerSlug(nom, tag) : null;
};

const base = (slug: string) => `/players/${encodeURIComponent(slug)}`;

const params = (extra: Record<string, string>) => {
  const texte = new URLSearchParams(extra).toString();
  return texte ? `?${texte}` : "";
};

export const getPlayerApi = async (
  slug: string,
  periode?: StatsWindow | null,
  light = false,
): Promise<SearchedPlayerDto> =>
  requestJson<SearchedPlayerDto>(
    `${base(slug)}${params({
      ...fenetreParams(periode),
      champions: "30",
      ...(light ? { light: "true" } : {}),
    })}`,
    { method: "GET" },
  );

export const getPlayerGamesApi = async (
  slug: string,
  periode?: StatsWindow | null,
): Promise<MyGamesDto> =>
  requestJson<MyGamesDto>(
    `${base(slug)}/games${params(fenetreParams(periode))}`,
    {
      method: "GET",
    },
  );

export const getPlayerGameDetailApi = async (
  slug: string,
  matchId: string,
  periode?: StatsWindow | null,
): Promise<TeamGameDetailDto> =>
  requestJson<TeamGameDetailDto>(
    `${base(slug)}/games/${encodeURIComponent(matchId)}${params(fenetreParams(periode))}`,
    { method: "GET" },
  );

export const collectPlayerApi = async (
  slug: string,
): Promise<{ lane: CollectLane }> =>
  requestJson<{ lane: CollectLane }>(`${base(slug)}/collect`, {
    method: "POST",
  });

export const searchPlayersApi = async (
  query: string,
): Promise<PlayerSuggestionDto[]> =>
  requestJson<PlayerSuggestionDto[]>(
    `/players/search${params({ q: query, limit: "8" })}`,
    {
      method: "GET",
    },
  );
