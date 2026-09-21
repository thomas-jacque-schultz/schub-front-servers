import { type ReactNode } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

export interface BulletListProps {
  items: ReactNode[];
  /** Numérote au lieu de pointer. Pour une énumération dont l'ordre porte du sens. */
  ordered?: boolean;
  tone?: "default" | "secondary";
}

/**
 * Une énumération dans de la prose.
 *
 * <p>Elle existe parce qu'une page de texte — conditions d'utilisation, politique de
 * confidentialité — énumère, et qu'un `Stack` de `Text` rend une suite de paragraphes : la
 * relation « ces éléments forment une liste » disparaît pour un lecteur d'écran. Ici la balise
 * est un vrai `ul` ou `ol`, et la puce est rendue par le navigateur.</p>
 */
export function BulletList({ items, ordered = false, tone = "default" }: BulletListProps) {
  return (
    <Box
      component={ordered ? "ol" : "ul"}
      sx={{
        m: 0,
        pl: 3,
        display: "flex",
        flexDirection: "column",
        gap: 1,
        color: tone === "secondary" ? "text.secondary" : "text.primary",
      }}
    >
      {items.map((item, index) => (
        <Typography key={index} component="li" variant="body1" color="inherit">
          {item}
        </Typography>
      ))}
    </Box>
  );
}
