import { type ReactNode } from "react";
import Box from "@mui/material/Box";
import { radii } from "../tokens";

export interface FrameProps {
  children: ReactNode;
  /** Le liseré prend la couleur d'accent : une ligne, un joueur, pas davantage. */
  accent?: boolean;
  /** Plus serré qu'une carte : un encadré se pose dans une carte ou dans une ligne. */
  dense?: boolean;
}

export function Frame({ children, accent = false, dense = false }: FrameProps) {
  return (
    <Box
      sx={{
        border: "1px solid",
        borderColor: accent ? "primary.main" : "divider",
        borderRadius: `${radii.md}px`,
        p: dense ? 0.75 : 1.5,
        bgcolor: "background.paper",
      }}
    >
      {children}
    </Box>
  );
}
