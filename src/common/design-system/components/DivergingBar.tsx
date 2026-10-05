import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { radii, typographyTokens } from "../tokens";
import { useChartScheme } from "./useChartScheme";

export interface DivergingBarProps {
  label: string;
  value: number;
  /** Écart absolu qui remplit une demi-barre : au-delà, la barre est pleine. */
  max: number;
  valueLabel: string;
  /** Ce que vaut le zéro, pour les lecteurs d'écran : « moyenne de ton palier ». */
  centerLabel?: string;
}

/** Un écart, centré sur zéro : vert à droite quand on fait mieux, rouge à gauche quand on fait moins bien. */
export function DivergingBar({
  label,
  value,
  max,
  valueLabel,
  centerLabel,
}: DivergingBarProps) {
  const { chart } = useChartScheme();
  const part = Math.min(1, Math.abs(value) / Math.max(max, Number.EPSILON));
  const positif = value >= 0;
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: "minmax(0, 1fr) 72px",
        columnGap: 1.5,
        rowGap: 0.5,
        alignItems: "center",
        py: 0.5,
      }}
    >
      <Typography variant="body2" component="p" sx={{ lineHeight: 1.3 }}>
        {label}
      </Typography>
      <Typography
        component="p"
        sx={{
          fontFamily: typographyTokens.monospaceFontFamily,
          fontWeight: 700,
          textAlign: "right",
          color: positif ? chart.positive : chart.negative,
        }}
      >
        {valueLabel}
      </Typography>
      <Box
        role="img"
        aria-label={`${label} : ${valueLabel}${centerLabel ? ` (${centerLabel} = 0)` : ""}`}
        sx={{
          gridColumn: "1 / -1",
          position: "relative",
          height: 8,
          borderRadius: `${radii.sm}px`,
          backgroundColor: chart.track,
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left: positif ? "50%" : `${50 - part * 50}%`,
            width: `${part * 50}%`,
            borderRadius: `${radii.sm}px`,
            backgroundColor: positif ? chart.positive : chart.negative,
          }}
        />
        <Box
          sx={{
            position: "absolute",
            top: -3,
            bottom: -3,
            left: "calc(50% - 1px)",
            width: 2,
            backgroundColor: chart.markMuted,
          }}
        />
      </Box>
    </Box>
  );
}
