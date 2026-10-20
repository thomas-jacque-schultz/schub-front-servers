import type { Schemas } from "../../common";

export type MasteryDto = Schemas["MasteryDto"];

/** La page publique d'un joueur recherché : profil tout de suite, statistiques dès que ses parties arrivent. */
export type SearchedPlayerDto = Schemas["SearchedPlayerDto"];

export type CollectLane = "KNOWN" | "FAST" | "SLOW";

export type PlayerSuggestionDto = Schemas["PlayerSuggestionDto"];

/** « Joue souvent avec » : coéquipiers d'au moins `minimumGames` parties sur le mois en cours (Schub#96). */
export type CompanionsDto = Schemas["CompanionsDto"];
