import type { Schemas } from "../../common";

export type PoolState =
  | "MAITRISES_CONNUES"
  | "COMPTE_RIOT_ABSENT"
  | "MAITRISES_INDISPONIBLES"
  | "CATALOGUE_INDISPONIBLE"
  | "AUCUNE_MAITRISE";

export type ChampionCatalogEntryDto = Schemas["ChampionCatalogEntryDto"];

export type ChampionPoolMemberDto = Schemas["ChampionPoolMemberDto"];

export type ChampionPoolEntryDto = Schemas["ChampionPoolEntryDto"];

export type ChampionPoolColumnDto = Schemas["ChampionPoolColumnDto"];

export type ChampionPoolDto = Schemas["ChampionPoolDto"];
