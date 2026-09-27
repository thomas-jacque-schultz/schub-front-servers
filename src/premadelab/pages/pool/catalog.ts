import { type ChampionSelectorEntry } from "../../../common";
import type { ChampionCatalogEntryDto } from "../../types/pool";

export const selectorEntries = (
  catalog: ChampionCatalogEntryDto[],
): ChampionSelectorEntry[] =>
  catalog.map((champion) => ({
    key: champion.championKey,
    name: champion.name,
    iconUrl: champion.iconUrl,
  }));
