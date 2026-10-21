import { type ReactNode } from "react";
import Box from "@mui/material/Box";

export interface SideLayoutProps {
  children: ReactNode;
  /** La colonne de côté : les joueurs et les scores d'un mini-jeu. Elle passe sous le contenu sur téléphone. */
  side: ReactNode;
  sideWidth?: number;
}

export function SideLayout({
  children,
  side,
  sideWidth = 240,
}: SideLayoutProps) {
  return (
    <Box
      sx={{
        display: "grid",
        gap: 1.5,
        gridTemplateColumns: {
          xs: "minmax(0, 1fr)",
          md: `minmax(0, 1fr) ${sideWidth}px`,
        },
        alignItems: "start",
      }}
    >
      <Box sx={{ minWidth: 0 }}>{children}</Box>
      <Box component="aside">{side}</Box>
    </Box>
  );
}
