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

const LISERE = 2;

// Même ordre, même largeur de colonne partout : deux rangées de chiffres se comparent verticalement.
export function StatGrid({
  items,
  minWidth = 110,
  size = "medium",
  divided = false,
  align,
  labelLines,
}: StatGridProps) {
  // auto-fit : les colonnes vides se replient, la rangée occupe toute la largeur.
  // Le liseré de la première tuile de chaque rangée tombe dans la marge négative et se masque.
  const grille = (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: `repeat(auto-fit, minmax(${minWidth}px, 1fr))`,
        gap: `${1.5 * spacingUnit}px`,
        ml: divided ? `-${LISERE + 1.5 * spacingUnit}px` : undefined,
      }}
    >
      {items.map(({ key, ...tile }) => (
        <Box
          key={key}
          sx={
            divided
              ? {
                  borderLeft: `${LISERE}px solid`,
                  borderColor: "divider",
                  pl: `${1.5 * spacingUnit}px`,
                }
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

  return divided ? <Box sx={{ overflow: "hidden" }}>{grille}</Box> : grille;
}
