import type { Schemas } from "../../common";

export type ComboKind =
  "JGL_TOP" | "JGL_MID" | "JGL_SUP" | "ADC_SUP" | "JGL_MID_SUP" | "COMPOSITION";

export type ComboPickDto = Schemas["Pick"];

export type ComboDto = Schemas["Combo"];

export type BanDto = Schemas["Ban"];

export type LaneThreatDto = Schemas["LaneThreat"];

export type DraftAdviceDto = Schemas["DraftAdviceDto"];

export type CompositionRecordDto = Schemas["CompositionRecordDto"];
