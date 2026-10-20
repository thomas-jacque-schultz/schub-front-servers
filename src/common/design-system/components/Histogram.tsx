import Box from "@mui/material/Box";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { radii, typographyTokens } from "../tokens";
import { useChartScheme } from "./useChartScheme";

export interface HistogramBar {
  /** Sous l'axe : la valeur de la case (« 3 », « 20+ »). */
  label: string;
  /** Hauteur relative ; seules les proportions comptent. */
  value: number;
  tooltip: string;
}

export interface HistogramProps {
  bars: HistogramBar[];
  /** Position du repère en unités de barre, de 0 (bord gauche) au nombre de barres (bord droit). */
  markerAt?: number;
  markerLabel?: string;
  /** Ce que montre le graphique, pour un lecteur d'écran. */
  ariaLabel: string;
  /** Une étiquette d'axe toutes les n barres, la dernière toujours. */
  labelEvery?: number;
  height?: number;
}

/** Une répartition en barres : la barre du repère en couleur de marque, les autres en retrait. */
export function Histogram({
  bars,
  markerAt,
  markerLabel,
  ariaLabel,
  labelEvery = 5,
  height = 96,
}: HistogramProps) {
  const { chart } = useChartScheme();
  const max = Math.max(...bars.map((bar) => bar.value), Number.EPSILON);
  const n = bars.length;
  const repere =
    markerAt === undefined ? null : Math.min(Math.max(markerAt, 0), n);
  const marquee = repere === null ? -1 : Math.min(Math.floor(repere), n - 1);

  return (
    <Box role="img" aria-label={ariaLabel}>
      <Box sx={{ position: "relative", height, pt: markerLabel ? 2.5 : 0 }}>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))`,
            columnGap: "2px",
            alignItems: "end",
            height: "100%",
            borderBottom: "1px solid",
            borderColor: chart.grid,
          }}
        >
          {bars.map((bar, index) => (
            <Tooltip key={index} title={bar.tooltip} placement="top">
              <Box
                sx={{ height: "100%", display: "flex", alignItems: "flex-end" }}
              >
                <Box
                  sx={{
                    width: "100%",
                    height: `${(bar.value / max) * 100}%`,
                    minHeight: bar.value > 0 ? 2 : 0,
                    borderRadius: `${radii.sm}px ${radii.sm}px 0 0`,
                    backgroundColor:
                      index === marquee ? chart.mark : chart.markMuted,
                  }}
                />
              </Box>
            </Tooltip>
          ))}
        </Box>
        {repere !== null && (
          <Box
            aria-hidden
            sx={{
              position: "absolute",
              top: 0,
              bottom: 0,
              left: `${(repere / n) * 100}%`,
              width: 0,
              borderLeft: "2px dashed",
              borderColor: "text.primary",
              pointerEvents: "none",
            }}
          >
            {markerLabel && (
              <Typography
                variant="caption"
                sx={{
                  position: "absolute",
                  top: -2,
                  left: repere / n > 0.6 ? "auto" : 4,
                  right: repere / n > 0.6 ? 4 : "auto",
                  whiteSpace: "nowrap",
                  fontFamily: typographyTokens.monospaceFontFamily,
                  color: "text.primary",
                }}
              >
                {markerLabel}
              </Typography>
            )}
          </Box>
        )}
      </Box>
      <Box
        aria-hidden
        sx={{
          display: "grid",
          gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))`,
          columnGap: "2px",
          mt: 0.5,
        }}
      >
        {bars.map((bar, index) => (
          <Typography
            key={index}
            variant="caption"
            sx={{
              textAlign: "center",
              color: "text.secondary",
              fontFamily: typographyTokens.monospaceFontFamily,
              overflow: "visible",
              whiteSpace: "nowrap",
            }}
          >
            {index % labelEvery === 0 || index === n - 1 ? bar.label : ""}
          </Typography>
        ))}
      </Box>
    </Box>
  );
}
