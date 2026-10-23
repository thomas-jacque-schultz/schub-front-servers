import Box from "@mui/material/Box";
import CardActionArea from "@mui/material/CardActionArea";
import Typography from "@mui/material/Typography";
import { Link as RouterLink } from "react-router-dom";
import { brand, motion, palettes, playful } from "../tokens";

// Toujours sombre, comme le jeu qu'elle ouvre : une jaquette posée sur la page, claire ou sombre.
const encre = palettes.dark.text;

export interface GamePosterProps {
  title: string;
  /** Le pictogramme du jeu, en grand sur la jaquette. */
  icon: string;
  /** Le genre du jeu, en surtitre. */
  genre: string;
  /** Joueurs et durée. */
  tags: string[];
  body: string;
  /** Le libellé de l'appel, la jaquette entière étant le lien. */
  action: string;
  to: string;
  /** La lueur derrière le pictogramme : une teinte de playful.confetti. */
  accent: string;
}

export function GamePoster({
  title,
  icon,
  genre,
  tags,
  body,
  action,
  to,
  accent,
}: GamePosterProps) {
  return (
    <CardActionArea
      component={RouterLink}
      to={to}
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "stretch",
        justifyContent: "flex-start",
        overflow: "hidden",
        borderRadius: `${playful.radii.card}px`,
        border: "1px solid",
        borderColor: playful.edge,
        background: playful.panel,
        color: encre.primary,
        transition: `transform ${motion.normal}ms ease, box-shadow ${motion.normal}ms ease`,
        "&:hover, &.Mui-focusVisible": {
          transform: "translateY(-3px)",
          boxShadow: playful.glow,
        },
        "&:hover .jaquette-icone": { transform: "rotate(-6deg) scale(1.08)" },
        "@media (prefers-reduced-motion: reduce)": {
          transition: "none",
          "&:hover, &.Mui-focusVisible": { transform: "none" },
          "&:hover .jaquette-icone": { transform: "none" },
        },
      }}
    >
      <Box
        aria-hidden
        sx={{
          display: "grid",
          placeItems: "center",
          height: { xs: 92, sm: 132 },
          background: `radial-gradient(120px 90px at 50% 55%, color-mix(in srgb, ${accent} 40%, transparent) 0%, transparent 70%), ${playful.page}`,
          borderBottom: "1px solid",
          borderColor: playful.edge,
        }}
      >
        <Box
          className="jaquette-icone"
          sx={{
            fontSize: { xs: 46, sm: 64 },
            lineHeight: 1,
            filter: playful.iconShadow,
            transition: `transform ${motion.slow}ms ease`,
          }}
        >
          {icon}
        </Box>
      </Box>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 1.25,
          flex: 1,
          p: 2,
        }}
      >
        <Typography
          sx={{
            fontFamily: playful.fontFamily,
            fontWeight: 600,
            fontSize: "0.75rem",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: palettes.dark.primary.main,
            mb: -0.75,
          }}
        >
          {genre}
        </Typography>
        <Typography
          component="h2"
          sx={{
            fontFamily: playful.fontFamily,
            fontWeight: 700,
            fontSize: "1.375rem",
            lineHeight: 1.2,
          }}
        >
          {title}
        </Typography>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
          {tags.map((tag) => (
            <Box
              key={tag}
              component="span"
              sx={{
                px: 1.25,
                py: 0.25,
                borderRadius: 999,
                bgcolor: playful.tile,
                fontFamily: playful.fontFamily,
                fontSize: "0.8125rem",
                fontWeight: 500,
                color: encre.primary,
              }}
            >
              {tag}
            </Box>
          ))}
        </Box>
        <Typography
          variant="body2"
          sx={{ color: encre.secondary, flex: 1 }}
        >
          {body}
        </Typography>
        <Box
          component="span"
          sx={{
            alignSelf: "flex-start",
            mt: 0.5,
            px: 2,
            py: 0.75,
            borderRadius: `${playful.radii.control}px`,
            bgcolor: brand.gold,
            color: palettes.dark.primary.contrastText,
            fontFamily: playful.fontFamily,
            fontWeight: 600,
            boxShadow: `0 ${playful.press.depth}px 0 ${playful.press.edge}`,
          }}
        >
          {action}
        </Box>
      </Box>
    </CardActionArea>
  );
}
