import Box from "@mui/material/Box";
import { Tooltip } from "./Tooltip";
import { useChartScheme } from "./useChartScheme";

export interface ConfidenceBadgeProps {
  /** Ce que dit le logo, pour les lecteurs d'écran : « confiance insuffisante ». */
  label: string;
  /** L'échantillon, au survol : « 3 parties, il en faut 5 ». */
  title: string;
}

/**
 * Le résultat reste affiché, mais son échantillon est sous le seuil (décision du 05/10, Schub#104). Distinct du
 * badge « Expérimental », qui porte sur la mesure et non sur l'échantillon.
 */
export function ConfidenceBadge({ label, title }: ConfidenceBadgeProps) {
  const { chart } = useChartScheme();
  return (
    <Tooltip title={title}>
      <Box
        component="span"
        role="img"
        aria-label={label}
        sx={{ display: "inline-flex", verticalAlign: "middle" }}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
          <circle
            cx="8"
            cy="8"
            r="6.5"
            fill="none"
            stroke={chart.markMuted}
            strokeWidth="1.5"
            strokeDasharray="2.5 2"
          />
          <path
            d="M6.2 6.3a1.9 1.9 0 1 1 2.6 1.8c-.5.2-.8.6-.8 1.1v.3M8 11.2v.1"
            fill="none"
            stroke={chart.markMuted}
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </Box>
    </Tooltip>
  );
}
