import { type ReactNode } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { playful } from "../tokens";

const PINCEAU =
  "M10 24C44 8 124 12 204 9c80-3 150-6 188 10 7 16 5 35-3 48-68 11-168 8-248 9-60 1-112 3-130-9C3 53 3 36 10 24z" +
  "M30 74c60 4 140 1 200 3M250 6c40-2 90-1 120 3";

export interface GameTitleProps {
  title: string;
  /** Un pictogramme du jeu, posé devant le titre. */
  icon?: ReactNode;
  /** Une phrase qui dit à quoi l'on joue. */
  tagline?: string;
  /** À droite du titre : le code du salon, le lien à copier. */
  children?: ReactNode;
}

/** Le titre d'un mini-jeu, posé sur un coup de pinceau. */
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
        <Box
          sx={{
            position: "relative",
            display: "inline-flex",
            alignItems: "center",
            gap: 1.25,
            px: 2.5,
            py: 1,
            transform: "rotate(-1.5deg)",
          }}
        >
          <Box
            component="svg"
            aria-hidden
            viewBox="0 0 400 84"
            preserveAspectRatio="none"
            sx={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              color: playful.brush,
            }}
          >
            <path d={PINCEAU} fill="currentColor" />
          </Box>
          {icon && (
            <Box
              aria-hidden
              sx={{ position: "relative", fontSize: "1.75rem", lineHeight: 1 }}
            >
              {icon}
            </Box>
          )}
          <Typography
            component="h1"
            sx={{
              position: "relative",
              fontFamily: playful.fontFamily,
              fontWeight: 700,
              fontSize: "clamp(1.5rem, 4vw, 2.25rem)",
              lineHeight: 1.1,
              color: "text.primary",
            }}
          >
            {title}
          </Typography>
        </Box>
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
