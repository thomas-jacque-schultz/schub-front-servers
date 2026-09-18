import { type ReactNode } from "react";
import Box from "@mui/material/Box";
import { backdropSx } from "../theme";

export interface PageBackdropProps {
  /** `page` pour un écran pleine hauteur, `panel` pour une zone interne plus calme. */
  variant?: "page" | "panel";
  /** Centre verticalement le contenu, comme sur l'accueil et l'écran de connexion. */
  centered?: boolean;
  children: ReactNode;
}

/**
 * Le fond d'écran de l'application.
 *
 * <p>Il existe pour une raison précise : les dégradés étaient recopiés à la main dans quatre
 * écrans, avec des valeurs hexadécimales légèrement différentes à chaque fois. Ils vivent
 * désormais dans les tokens, et un écran qui veut ce fond met ce composant — il ne réécrit pas
 * un `radial-gradient`.</p>
 */
export function PageBackdrop({ variant = "page", centered = false, children }: PageBackdropProps) {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        position: "relative",
        display: "flex",
        flexDirection: "column",
        justifyContent: centered ? "center" : "flex-start",
        py: { xs: 3, md: 4 },
        ...backdropSx[variant],
      }}
    >
      {children}
    </Box>
  );
}
