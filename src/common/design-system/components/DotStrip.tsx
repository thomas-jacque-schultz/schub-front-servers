import Box from "@mui/material/Box";
import { useChartScheme } from "./useChartScheme";

export interface DotStripPoint {
  key: string;
  /** Seconde de jeu. */
  at: number;
  /** Grandeur du point : son aire lui est proportionnelle. */
  value: number;
  /** Le point est cerné : il porte la part mise en avant. */
  emphasis?: boolean;
  /** Au survol. */
  label: string;
}

export interface DotStripProps {
  /** Durée de la frise, en secondes. */
  duration: number;
  points: DotStripPoint[];
  ariaLabel: string;
  /** Plus grande valeur commune à plusieurs frises, pour qu'elles se comparent. */
  maxValue?: number;
}

const HAUTEUR = 22;
const RAYON_MAX = 8;

// Une frise d'événements dans le temps : un point par événement, cerné quand il porte la part mise en avant.
export function DotStrip({
  duration,
  points,
  ariaLabel,
  maxValue,
}: DotStripProps) {
  const { chart } = useChartScheme();
  const plafond = Math.max(
    1,
    maxValue ?? Math.max(0, ...points.map((point) => point.value)),
  );
  return (
    <Box
      component="svg"
      role="img"
      aria-label={ariaLabel}
      sx={{
        display: "block",
        width: "100%",
        height: HAUTEUR,
        overflow: "visible",
        mt: 0.5,
      }}
    >
      <line
        x1="0"
        x2="100%"
        y1={HAUTEUR / 2}
        y2={HAUTEUR / 2}
        stroke={chart.grid}
        strokeWidth={1}
      />
      {points.map((point) => (
        <circle
          key={point.key}
          cx={`${(100 * Math.min(point.at, duration)) / Math.max(1, duration)}%`}
          cy={HAUTEUR / 2}
          r={2.5 + (RAYON_MAX - 2.5) * Math.sqrt(point.value / plafond)}
          fill={chart.markMuted}
          stroke={point.emphasis ? chart.markSecondary : "none"}
          strokeWidth={point.emphasis ? 2 : 0}
        >
          <title>{point.label}</title>
        </circle>
      ))}
    </Box>
  );
}
