import { requestJson } from "./httpClient";
import type {
  GameReviewDto,
  GameReviewRequest,
  GameReviewsDto,
} from "../types/review";

/**
 * Les notes d'une partie d'équipe.
 *
 * <p>Le chemin porte l'équipe et la partie : une note n'existe pas sans les deux, et c'est
 * l'équipe qui porte les droits. Le cœur refuse une partie qui n'est pas une partie de cette
 * équipe — un 404 — et répond 503 quand il n'a pas pu le vérifier.</p>
 */

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
