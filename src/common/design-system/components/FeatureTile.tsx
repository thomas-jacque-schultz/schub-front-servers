import Box from "@mui/material/Box";
import MuiCard from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import { Link as RouterLink } from "react-router-dom";
import { motion, radii, spacingUnit } from "../tokens";
import { Text } from "./Text";

export interface FeatureTileProps {
  image: string;
  /** Ce que montre l'image : la tuile est muette pour un lecteur d'écran sans lui. */
  imageAlt: string;
  title: string;
  /** Une route de l'application : la tuile entière devient le lien. */
  to?: string;
}

export function FeatureTile({ image, imageAlt, title, to }: FeatureTileProps) {
  const contenu = (
    <>
      <Box
        component="img"
        src={image}
        alt={imageAlt}
        loading="lazy"
        sx={{
          display: "block",
          width: "100%",
          aspectRatio: "16 / 10",
          objectFit: "cover",
          objectPosition: "top",
          borderBottom: "1px solid",
          borderColor: "divider",
          transition: `transform ${motion.slow}ms ease`,
        }}
      />
      <Box sx={{ p: `${spacingUnit * 1.5}px` }}>
        <Text variant="subtitle">{title}</Text>
      </Box>
    </>
  );

  return (
    <MuiCard
      sx={{
        height: "100%",
        borderRadius: `${radii.lg}px`,
        overflow: "hidden",
        "&:hover img": to ? { transform: "scale(1.03)" } : undefined,
      }}
    >
      {to ? (
        <CardActionArea component={RouterLink} to={to} sx={{ height: "100%" }}>
          {contenu}
        </CardActionArea>
      ) : (
        contenu
      )}
    </MuiCard>
  );
}
