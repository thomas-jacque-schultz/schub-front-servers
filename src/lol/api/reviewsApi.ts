import { requestJson } from "../../api/httpClient";
import type {
  GameReviewDto,
  GameReviewRequest,
  GameReviewsDto,
} from "../types/review";

const base = (teamId: string, matchId: string) =>
  `/teams/${teamId}/games/${matchId}/reviews`;

export const getGameReviewsApi = async (
  teamId: string,
  matchId: string,
): Promise<GameReviewsDto> =>
  requestJson<GameReviewsDto>(base(teamId, matchId), { method: "GET" });

export const createGameReviewApi = async (
  teamId: string,
  matchId: string,
  request: GameReviewRequest,
): Promise<GameReviewDto> =>
  requestJson<GameReviewDto>(base(teamId, matchId), {
    method: "POST",
    body: JSON.stringify(request),
  });

export const updateGameReviewApi = async (
  teamId: string,
  matchId: string,
  reviewId: string,
  content: string,
): Promise<GameReviewDto> =>
  requestJson<GameReviewDto>(`${base(teamId, matchId)}/${reviewId}`, {
    method: "PUT",
    body: JSON.stringify({ content }),
  });

export const deleteGameReviewApi = async (
  teamId: string,
  matchId: string,
  reviewId: string,
): Promise<void> => {
  await requestJson<unknown>(`${base(teamId, matchId)}/${reviewId}`, {
    method: "DELETE",
  });
};
