import type { StatLineDto } from "../../types/stats";

export type RadarReference = "team" | "met" | "league";

export const referenceParDefaut = (teamLines?: StatLineDto[]): RadarReference =>
  teamLines && teamLines.length >= 2 ? "team" : "met";
