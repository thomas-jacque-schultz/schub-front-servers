import { requestJson } from "./httpClient";
import { useRequest } from "./useRequest";

export interface HistoryWindowDto {
  maxGames: number;
  maxAgeDays: number;
  minGames: number;
}

export const getHistoryWindowApi = async (): Promise<HistoryWindowDto> =>
  requestJson<HistoryWindowDto>("/players/history-window", { method: "GET" });

export const useHistoryWindow = (): HistoryWindowDto | null =>
  useRequest("players/history-window", getHistoryWindowApi).data;
