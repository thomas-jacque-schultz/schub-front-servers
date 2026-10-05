import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { Tooltip } from "./Tooltip";
import { useChartScheme } from "./useChartScheme";
import { VERDICTS, type Verdict } from "./verdict";

// Chevrons : deux, un, un trait, un, deux. Le cran se lit sans la couleur.
const TRACES: Record<Verdict, string> = {
  veryBelow: "M3 3l5 4 5-4M3 8l5 4 5-4",
  below: "M3 5.5l5 4 5-4",
  average: "M3 8h10",
  above: "M3 10.5l5-4 5 4",
  veryAbove: "M3 8l5-4 5 4M3 13l5-4 5 4",
};

export interface VerdictMarkProps {
  /** Absent : une mesure sans bon ni mauvais sens, tracée en neutre. */
  verdict: Verdict | null;
  label?: string;
  /** Le chiffre exact, au survol : « mieux que 3 % des Platine milieu ». */
  title?: string;
  size?: "small" | "medium";
}

export function VerdictMark({
  verdict,
  label,
  title,
  size = "small",
}: VerdictMarkProps) {
  const { chart } = useChartScheme();
  const couleur =
    verdict === null
      ? chart.markMuted
      : chart.verdict[VERDICTS.indexOf(verdict)];
  const cote = size === "small" ? 14 : 18;
  const marque = (
    <Box
      component="span"
      sx={{ display: "inline-flex", alignItems: "center", gap: 0.5 }}
    >
      <svg
        width={cote}
        height={cote}
        viewBox="0 0 16 16"
        aria-hidden={label ? true : undefined}
        role={label ? undefined : "img"}
        aria-label={label ? undefined : title}
      >
        {verdict === null ? (
          <circle cx="8" cy="8" r="3" fill={couleur} />
        ) : (
          <path
            d={TRACES[verdict]}
            fill="none"
            stroke={couleur}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
      </svg>
      {label && (
        <Typography
          variant="caption"
          component="span"
          sx={{ color: couleur, fontWeight: 600, whiteSpace: "nowrap" }}
        >
          {label}
        </Typography>
      )}
    </Box>
  );
  return title ? <Tooltip title={title}>{marque}</Tooltip> : marque;
}
