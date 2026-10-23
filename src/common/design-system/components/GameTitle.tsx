import { type ReactNode } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { playful } from "../tokens";

const PINCEAU = encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 84" preserveAspectRatio="none">` +
    `<path fill="${playful.brush}" d="M10 24C44 8 124 12 204 9c80-3 150-6 188 10 7 16 5 35-3 48-68 11-168 8-248 9-60 1-112 3-130-9C3 53 3 36 10 24z"/>` +
    `</svg>`,
);

export interface GameTitleProps {
  title: string;
  /** Un pictogramme du jeu, posé devant le titre. */
  icon?: ReactNode;
  /** Une phrase qui dit à quoi l'on joue. */
  tagline?: string;
  /** À droite du titre : le code du salon, le lien à copier. */
  children?: ReactNode;
}

/** Le titre d'un mini-jeu, sur un coup de pinceau : un par ligne quand le titre passe à la ligne. */
export function GameTitle({ title, icon, tagline, children }: GameTitleProps) {
  return (
    <Box
      sx={{ display: "flex", flexDirection: "column", gap: 0.75, minWidth: 0 }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 2,
          flexWrap: "wrap",
        }}
      >
        <Typography
          component="h1"
          sx={{
            fontFamily: playful.fontFamily,
            fontWeight: 700,
            fontSize: "clamp(1.5rem, 4vw, 2.25rem)",
            lineHeight: 1.6,
            color: "text.primary",
            transform: "rotate(-1.5deg)",
          }}
        >
          <Box
            component="span"
            sx={{
              px: 2,
              py: 0.5,
              backgroundImage: `url("data:image/svg+xml,${PINCEAU}")`,
              backgroundSize: "100% 100%",
              backgroundRepeat: "no-repeat",
              boxDecorationBreak: "clone",
              WebkitBoxDecorationBreak: "clone",
            }}
          >
            {icon && (
              <Box component="span" aria-hidden sx={{ mr: 1 }}>
                {icon}
              </Box>
            )}
            {title}
          </Box>
        </Typography>
        {children}
      </Box>
      {tagline && (
        <Typography color="text.secondary" sx={{ pl: 0.5 }}>
          {tagline}
        </Typography>
      )}
    </Box>
  );
}
