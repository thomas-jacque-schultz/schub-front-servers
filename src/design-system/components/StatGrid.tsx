import Box from "@mui/material/Box";
import { spacingUnit } from "../tokens";
import { StatTile, type StatTileProps } from "./StatTile";

export interface StatGridItem extends StatTileProps {
  key: string;
}

export interface StatGridProps {
  items: StatGridItem[];
  /** Largeur minimale d'une tuile : en dessous, la grille passe à la ligne. */
  minWidth?: number;
  size?: StatTileProps["size"];
  /** Un liseré entre les tuiles, pour une rangée de chiffres posée seule sur une carte. */
  divided?: boolean;
  align?: StatTileProps["align"];
  labelLines?: StatTileProps["labelLines"];
}

// Même ordre, même largeur de colonne partout : deux rangées de chiffres se comparent verticalement.
export function StatGrid({
  items,
  minWidth = 110,
  size = "medium",
  divided = false,
  align,
  labelLines,
}: StatGridProps) {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: `repeat(auto-fill, minmax(${minWidth}px, 1fr))`,
        gap: `${1.5 * spacingUnit}px`,
      }}
    >
      {items.map(({ key, ...tile }) => (
        <Box
          key={key}
          sx={
            divided
              ? { borderLeft: "2px solid", borderColor: "divider", pl: 1.25 }
              : undefined
          }
        >
          <StatTile
            {...tile}
            size={size}
            align={align}
            labelLines={labelLines}
          />
        </Box>
      ))}
    </Box>
  );
}
