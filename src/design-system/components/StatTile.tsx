import type { ReactNode } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { chartColors, typographyTokens } from "../tokens";

export interface StatTileProps {
  label: string;
  value: string;
  hint?: string;
  delta?: string;
  deltaTone?: "positive" | "negative" | "neutral";
  deltaHint?: string;
  size?: "medium" | "small";
  /** À droite du chiffre : une icône de niveau, par exemple. */
  adornment?: ReactNode;
  /** Centrée, la tuile porte sa note sous le chiffre plutôt qu'à côté. */
  align?: "start" | "center";
  /** Lignes réservées au libellé : dans une rangée, les chiffres tombent alors à la même hauteur. */
  labelLines?: number;
}

export function StatTile({
  label,
  value,
  hint,
  delta,
  deltaTone = "neutral",
  deltaHint,
  size = "medium",
  adornment,
  align = "start",
  labelLines,
}: StatTileProps) {
  const centree = align === "center";
  return (
    <Box sx={centree ? { textAlign: "center" } : undefined}>
      <Typography
        variant="caption"
        color="text.secondary"
        component="p"
        sx={
          labelLines
            ? {
                minHeight: `${labelLines * 1.66}em`,
                display: "flex",
                alignItems: "flex-end",
                justifyContent: centree ? "center" : "flex-start",
              }
            : undefined
        }
      >
        {label}
      </Typography>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 0.75,
          ...(centree ? { flexDirection: "column", gap: 0.25 } : {}),
        }}
      >
        <Typography
          variant={size === "small" ? "subtitle1" : "h6"}
          component="p"
          sx={{
            fontWeight: 700,
            lineHeight: 1.2,
            fontFamily: typographyTokens.monospaceFontFamily,
            fontVariantNumeric: "tabular-nums",
            letterSpacing: "-0.01em",
          }}
        >
          {value}
        </Typography>
        {adornment}
      </Box>
      {delta && (
        <Typography
          variant="body2"
          component="p"
          sx={(theme) => {
            const scheme = theme.palette.mode === "light" ? "light" : "dark";
            const colors = chartColors[scheme];
            return {
              fontWeight: 600,
              color:
                deltaTone === "neutral"
                  ? "text.secondary"
                  : deltaTone === "positive"
                    ? colors.positive
                    : colors.negative,
            };
          }}
        >
          {delta}
          {deltaHint && (
            <Box
              component="span"
              sx={{ color: "text.secondary", fontWeight: 400 }}
            >
              {" "}
              {deltaHint}
            </Box>
          )}
        </Typography>
      )}
      {hint && (
        <Typography variant="caption" color="text.secondary" component="p">
          {hint}
        </Typography>
      )}
    </Box>
  );
}
