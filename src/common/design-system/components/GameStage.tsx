import { type ReactNode } from "react";
import Box from "@mui/material/Box";
import { playful } from "../tokens";

export interface GameStageProps {
  /** Largeur sur hauteur : 4 / 3 pour un tableau, 1215 / 717 pour un splash. */
  ratio: number;
  /** La hauteur réservée au reste de l'écran : le champ de réponse reste visible, même dans une iframe. */
  reserve?: number;
  children: ReactNode;
}

/** La scène d'un jeu (le tableau à dessin, l'image à deviner) : elle tient dans la hauteur de l'écran. */
export function GameStage({ ratio, reserve = 0, children }: GameStageProps) {
  // Une boîte de plus : une pile du design system remet à zéro les marges de ses enfants, donc le centrage.
  return (
    <Box sx={{ display: "flex", justifyContent: "center" }}>
      <Box
        sx={{
          position: "relative",
          width: `min(100%, calc((100dvh - ${reserve}px) * ${ratio}))`,
          aspectRatio: String(ratio),
          overflow: "hidden",
          borderRadius: `${playful.radii.card}px`,
          border: "1px solid",
          borderColor: playful.edge,
          bgcolor: "background.paper",
          boxShadow: playful.glow,
          "& > canvas, & > img": {
            display: "block",
            width: "100%",
            height: "100%",
          },
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
