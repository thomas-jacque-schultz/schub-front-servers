import type { ReactNode } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { chartColors, radii, typographyTokens } from "../tokens";

export interface ScoreRowProps {
  label: string;
  value: string;
  hint?: string;
  /** Place de la valeur, de 0 à 1, « plus haut = mieux ». Absente : pas de jauge. */
  score?: number | null;
  /** Ce que dit la jauge, pour les lecteurs d'écran. */
  scoreLabel?: string;
  /** À droite, sur toute la hauteur : un emblème de palier, par exemple. */
  adornment?: ReactNode;
}

// Une ligne d'analyse : le chiffre, et d'un coup d'œil où il se place. Plusieurs lignes empilées alignent
// leurs valeurs et leurs jauges sur les mêmes colonnes.
export function ScoreRow({
  label,
  value,
  hint,
  score,
  scoreLabel,
  adornment,
}: ScoreRowProps) {
  const ratio =
    score === null || score === undefined || Number.isNaN(score)
      ? null
      : Math.min(1, Math.max(0, score));
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: "minmax(0, 1fr) auto 104px",
        gridTemplateAreas: `"label value note" "jauge jauge note"`,
        columnGap: 1.5,
        rowGap: 0.5,
        alignItems: "center",
        py: 0.75,
      }}
    >
      <Box sx={{ gridArea: "label", minWidth: 0 }}>
        <Typography variant="body2" component="p" sx={{ lineHeight: 1.3 }}>
          {label}
        </Typography>
        {hint && (
          <Typography variant="caption" color="text.secondary" component="p">
            {hint}
          </Typography>
        )}
      </Box>
      <Typography
        component="p"
        sx={{
          gridArea: "value",
          fontWeight: 700,
          fontSize: "1.05rem",
          fontFamily: typographyTokens.monospaceFontFamily,
          fontVariantNumeric: "tabular-nums",
          textAlign: "right",
        }}
      >
        {value}
      </Typography>
      <Box
        role={ratio === null ? undefined : "meter"}
        aria-label={ratio === null ? undefined : (scoreLabel ?? label)}
        aria-valuenow={ratio === null ? undefined : Math.round(ratio * 100)}
        aria-valuemin={ratio === null ? undefined : 0}
        aria-valuemax={ratio === null ? undefined : 100}
        sx={(theme) => {
          const scheme = theme.palette.mode === "light" ? "light" : "dark";
          return {
            gridArea: "jauge",
            height: 6,
            borderRadius: `${radii.pill}px`,
            backgroundColor:
              ratio === null ? "transparent" : chartColors[scheme].track,
            overflow: "hidden",
          };
        }}
      >
        {ratio !== null && (
          <Box
            sx={(theme) => {
              const scheme = theme.palette.mode === "light" ? "light" : "dark";
              return {
                width: `${ratio * 100}%`,
                height: "100%",
                borderRadius: `${radii.pill}px`,
                backgroundColor: chartColors[scheme].mark,
              };
            }}
          />
        )}
      </Box>
      <Box
        sx={{ gridArea: "note", display: "flex", justifyContent: "flex-start" }}
      >
        {adornment}
      </Box>
    </Box>
  );
}
