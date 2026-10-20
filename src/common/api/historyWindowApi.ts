import type { Schemas } from "..";
import { requestJson } from "./httpClient";
import { useRequest } from "./useRequest";

export type HistoryWindowDto = Schemas["HistoryWindowDto"];

export const getHistoryWindowApi = async (): Promise<HistoryWindowDto> =>
  requestJson<HistoryWindowDto>("/players/history-window", { method: "GET" });

export const useHistoryWindow = (): HistoryWindowDto | null =>
  useRequest("players/history-window", getHistoryWindowApi).data;
