import { requestJson, type HistoryWindowDto } from "../../common";
import type {
  CrawlerDto,
  IngestLoadDto,
  IngestSummaryDto,
} from "../types/ingest";

export const getIngestLoadApi = async (): Promise<IngestLoadDto> =>
  requestJson<IngestLoadDto>("/ingest/load", { method: "GET" });

export const getIngestSummaryApi = async (): Promise<IngestSummaryDto> =>
  requestJson<IngestSummaryDto>("/ingest/summary", { method: "GET" });

export const getCrawlerApi = async (): Promise<CrawlerDto> =>
  requestJson<CrawlerDto>("/ingest/crawler", { method: "GET" });

export const toggleCrawlerApi = async (enabled: boolean): Promise<CrawlerDto> =>
  requestJson<CrawlerDto>("/ingest/crawler", {
    method: "PUT",
    body: JSON.stringify({ enabled }),
  });

export const updateHistoryWindowApi = async (
  window: HistoryWindowDto,
): Promise<HistoryWindowDto> =>
  requestJson<HistoryWindowDto>("/ingest/history-window", {
    method: "PUT",
    body: JSON.stringify(window),
  });
