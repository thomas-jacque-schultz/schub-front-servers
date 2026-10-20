import Box from "@mui/material/Box";
import { spacingUnit } from "../tokens";
import { ChampionIcon } from "./ChampionIcon";
import { Text } from "./Text";

export interface ChampionRowItem {
  name: string;
  iconUrl?: string | null;
}

export interface ChampionRowProps {
  champions: ChampionRowItem[];
  /** Nombre de colonnes, le même d'une ligne à l'autre pour que les icônes s'alignent. */
  columns: number;
}

export function ChampionRow({ champions, columns }: ChampionRowProps) {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
        columnGap: `${spacingUnit}px`,
        alignItems: "center",
      }}
    >
      {champions.map((champion, index) => (
        <Box
          key={`${champion.name}-${index}`}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: `${spacingUnit / 2}px`,
            minWidth: 0,
          }}
        >
          <ChampionIcon size="small" name={champion.name} src={champion.iconUrl} />
          <Box sx={{ display: { xs: "none", sm: "block" }, minWidth: 0 }}>
            <Text truncate>{champion.name}</Text>
          </Box>
        </Box>
      ))}
    </Box>
  );
}
