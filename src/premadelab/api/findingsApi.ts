import { requestJson } from "../../common";
import { fenetreParams, type StatsWindow } from "../pages/stats/windows";
import type { FindingDto } from "../types/findings";

const params = (periode?: StatsWindow | null) => {
  const texte = new URLSearchParams(fenetreParams(periode)).toString();
  return texte ? `?${texte}` : "";
};

export const getMyFindingsApi = async (
  periode?: StatsWindow | null,
): Promise<FindingDto[]> =>
  requestJson<FindingDto[]>(`/me/stats/findings${params(periode)}`, {
    method: "GET",
  });

export const getMyGameFindingsApi = async (
  matchId: string,
): Promise<FindingDto[]> =>
  requestJson<FindingDto[]>(
    `/me/stats/games/${encodeURIComponent(matchId)}/findings`,
    {
      method: "GET",
    },
  );

export const getPlayerFindingsApi = async (
  slug: string,
  periode?: StatsWindow | null,
): Promise<FindingDto[]> =>
  requestJson<FindingDto[]>(
    `/players/${encodeURIComponent(slug)}/findings${params(periode)}`,
    {
      method: "GET",
    },
  );

export const getPlayerGameFindingsApi = async (
  slug: string,
  matchId: string,
): Promise<FindingDto[]> =>
  requestJson<FindingDto[]>(
    `/players/${encodeURIComponent(slug)}/games/${encodeURIComponent(matchId)}/findings`,
    { method: "GET" },
  );
