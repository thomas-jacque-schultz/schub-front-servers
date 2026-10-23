import Box from "@mui/material/Box";
import { radii } from "../tokens";

export interface IllustrationProps {
  src: string;
  /** Ce que montre l'image ; vide si elle ne fait que décorer. */
  alt: string;
  /** Plafond de hauteur : une illustration ne pousse pas le contenu hors de l'écran. */
  maxHeight?: number;
}

/** Une image seule, en pleine largeur, recadrée sans déformation : le splash d'une question de quiz. */
export function Illustration({ src, alt, maxHeight = 320 }: IllustrationProps) {
  return (
    <Box
      component="img"
      src={src}
      alt={alt}
      loading="lazy"
      sx={{
        display: "block",
        width: "100%",
        maxHeight,
        aspectRatio: "16 / 9",
        objectFit: "cover",
        objectPosition: "top",
        borderRadius: `${radii.md}px`,
        border: "1px solid",
        borderColor: "divider",
      }}
    />
  );
}
