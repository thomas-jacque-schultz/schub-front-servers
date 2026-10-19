import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { useChartScheme } from "./useChartScheme";
import { typographyTokens } from "../tokens";

export interface RingGauge {
  key: string;
  label: string;
  /** Une part, de 0 à 1 ; null : rien à mesurer, l'anneau reste vide. */
  value: number | null;
  valueLabel: string;
  detail?: string;
}

export interface RingGaugesProps {
  label: string;
  items: RingGauge[];
}

const COTE = 56;
const RAYON = 22;
const EPAISSEUR = 7;
const CIRCONFERENCE = 2 * Math.PI * RAYON;

/** Une part par personne, quand les parts ne s'additionnent pas : un anneau chacun plutôt qu'un camembert. */
export function RingGauges({ label, items }: RingGaugesProps) {
  const { chart } = useChartScheme();
  return (
    <Box>
      <Typography variant="caption" color="text.secondary" component="p">
        {label}
      </Typography>
      <Box
        component="ul"
        sx={{
          listStyle: "none",
          p: 0,
          m: 0,
          mt: 1,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(96px, 1fr))",
          gap: 1.5,
        }}
      >
        {items.map((item) => {
          const part = Math.min(1, Math.max(0, item.value ?? 0));
          return (
            <Box
              component="li"
              key={item.key}
              aria-label={[item.label, item.valueLabel, item.detail]
                .filter(Boolean)
                .join(", ")}
              sx={{ textAlign: "center", minWidth: 0 }}
            >
              <Box
                component="svg"
                viewBox={`0 0 ${COTE} ${COTE}`}
                aria-hidden
                sx={{ width: COTE, height: COTE, display: "block", mx: "auto" }}
              >
                <circle
                  cx={COTE / 2}
                  cy={COTE / 2}
                  r={RAYON}
                  fill="none"
                  stroke={chart.track}
                  strokeWidth={EPAISSEUR}
                />
                {item.value !== null && part > 0 && (
                  <circle
                    cx={COTE / 2}
                    cy={COTE / 2}
                    r={RAYON}
                    fill="none"
                    stroke={chart.mark}
                    strokeWidth={EPAISSEUR}
                    strokeDasharray={`${part * CIRCONFERENCE} ${CIRCONFERENCE}`}
                    transform={`rotate(-90 ${COTE / 2} ${COTE / 2})`}
                  />
                )}
                <text
                  x={COTE / 2}
                  y={COTE / 2 + 3.5}
                  textAnchor="middle"
                  fontSize="11"
                  fontWeight="700"
                  fontFamily={typographyTokens.monospaceFontFamily}
                  fill="currentColor"
                >
                  {item.valueLabel}
                </text>
              </Box>
              <Typography variant="body2" component="p" noWrap sx={{ mt: 0.5 }}>
                {item.label}
              </Typography>
              {item.detail && (
                <Typography
                  variant="caption"
                  color="text.secondary"
                  component="p"
                >
                  {item.detail}
                </Typography>
              )}
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
