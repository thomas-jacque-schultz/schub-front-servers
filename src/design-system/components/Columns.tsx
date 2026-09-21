import { type ElementType, type ReactNode } from "react";
import Box from "@mui/material/Box";
import { spacingUnit } from "../tokens";

export interface ColumnsProps {
  children: ReactNode;
  /** Largeur en dessous de laquelle une colonne passe à la ligne, en pixels. */
  minWidth?: number;
  /** En pas de l'échelle d'espacement, jamais en pixels. */
  spacing?: number;
  component?: ElementType;
}

/**
 * Des colonnes de même largeur, qui se replient quand l'écran ne les tient plus.
 *
 * <p>`auto-fit` plutôt qu'un nombre de colonnes figé : « cinq joueurs » n'est pas une largeur, et
 * un effectif de six ou de trois se range aussi bien.</p>
 */
export function Columns({
  children,
  minWidth = 220,
  spacing = 2,
  component = "div",
}: ColumnsProps) {
  return (
    <Box
      component={component}
      sx={{
        display: "grid",
        gridTemplateColumns: `repeat(auto-fit, minmax(min(${minWidth}px, 100%), 1fr))`,
        gap: `${spacing * spacingUnit}px`,
        alignItems: "stretch",
      }}
    >
      {children}
    </Box>
  );
}
