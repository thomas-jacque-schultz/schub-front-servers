import { type ElementType, type ReactNode } from "react";
import Box from "@mui/material/Box";
import { spacingUnit } from "../tokens";

export interface ColumnsProps {
  children: ReactNode;
  /** Largeur en dessous de laquelle une colonne passe à la ligne, en pixels. */
  minWidth?: number;
  /**
   * Nombre de colonnes à tenir **sur une seule ligne** dès que l'écran est large.
   *
   * <p>`auto-fit` seul ne le garantit pas : il replie dès que `count × minWidth` dépasse le
   * conteneur, et le dernier passe à la ligne — cinq joueurs en quatre plus un. Avec `count`,
   * les colonnes se resserrent au lieu de se replier au-dessus du point de rupture, et se
   * replient en dessous.</p>
   */
  count?: number;
  /** En pas de l'échelle d'espacement, jamais en pixels. */
  spacing?: number;
  component?: ElementType;
}

/** Des colonnes de même largeur, qui se replient quand l'écran ne les tient plus. */
export function Columns({
  children,
  minWidth = 220,
  count,
  spacing = 2,
  component = "div",
}: ColumnsProps) {
  const replie = `repeat(auto-fit, minmax(min(${minWidth}px, 100%), 1fr))`;
  const tenu = count ? `repeat(${count}, minmax(0, 1fr))` : replie;

  return (
    <Box
      component={component}
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: replie, lg: tenu },
        gap: `${spacing * spacingUnit}px`,
        alignItems: "stretch",
      }}
    >
      {children}
    </Box>
  );
}
