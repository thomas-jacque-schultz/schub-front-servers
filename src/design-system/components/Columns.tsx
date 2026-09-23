import { type ElementType, type ReactNode } from "react";
import Box from "@mui/material/Box";
import { spacingUnit } from "../tokens";

export interface ColumnsProps {
  children: ReactNode;
  minWidth?: number;
  count?: number;
  spacing?: number;
  component?: ElementType;
}

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
