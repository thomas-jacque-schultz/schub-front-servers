import Box from "@mui/material/Box";
import MuiTooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { useChartScheme } from "./useChartScheme";

export interface ClockSector {
  key: string;
  /** Heure de début, de 0 à 23 ; le secteur couvre jusqu'au début du suivant. */
  startHour: number;
  endHour: number;
  /** Épaisseur : combien de parties, relativement aux autres secteurs. */
  weight: number;
  /** Au-dessus, en dessous ou près de la moyenne ; « empty » : trop peu pour conclure. */
  tone: "positive" | "negative" | "neutral" | "empty";
  title: string;
}

export interface ClockChartProps {
  label: string;
  sectors: ClockSector[];
  /** Au centre : la phrase la plus nette. */
  center?: string;
  emptyLabel: string;
}

const COTE = 220;
const CENTRE = COTE / 2;
const INTERIEUR = 46;
const EPAISSEUR_MAX = 52;
const EPAISSEUR_MIN = 6;

const angleDe = (heure: number) => (heure / 24) * 2 * Math.PI;

const point = (angle: number, rayon: number) => [
  CENTRE + rayon * Math.sin(angle),
  CENTRE - rayon * Math.cos(angle),
];

const secteur = (debut: number, fin: number, exterieur: number) => {
  const [x1, y1] = point(debut, exterieur);
  const [x2, y2] = point(fin, exterieur);
  const [x3, y3] = point(fin, INTERIEUR);
  const [x4, y4] = point(debut, INTERIEUR);
  return `M ${x1} ${y1} A ${exterieur} ${exterieur} 0 0 1 ${x2} ${y2} L ${x3} ${y3} A ${INTERIEUR} ${INTERIEUR} 0 0 0 ${x4} ${y4} Z`;
};

// Une horloge de 24 heures, minuit en haut : chaque secteur est une plage horaire.
export function ClockChart({
  label,
  sectors,
  center,
  emptyLabel,
}: ClockChartProps) {
  const { chart, palette } = useChartScheme();
  const poidsMax = Math.max(0, ...sectors.map((s) => s.weight));
  if (poidsMax === 0) {
    return (
      <Typography variant="caption" color="text.secondary">
        {emptyLabel}
      </Typography>
    );
  }
  const couleur = (tone: ClockSector["tone"]) =>
    tone === "positive"
      ? chart.positive
      : tone === "negative"
        ? chart.negative
        : tone === "neutral"
          ? chart.markMuted
          : chart.track;

  return (
    <Box>
      <Typography variant="caption" color="text.secondary" component="p">
        {label}
      </Typography>
      <Box
        component="svg"
        viewBox={`0 0 ${COTE} ${COTE}`}
        sx={{
          width: "100%",
          maxWidth: COTE,
          display: "block",
          mx: "auto",
          mt: 0.5,
        }}
        role="img"
        aria-label={center ?? label}
      >
        <circle
          cx={CENTRE}
          cy={CENTRE}
          r={INTERIEUR + EPAISSEUR_MAX}
          fill="none"
          stroke={chart.grid}
        />
        {sectors.map((s) => {
          const exterieur =
            INTERIEUR +
            (s.weight > 0
              ? EPAISSEUR_MIN +
                (EPAISSEUR_MAX - EPAISSEUR_MIN) * (s.weight / poidsMax)
              : 2);
          return (
            <MuiTooltip key={s.key} arrow title={s.title}>
              <path
                d={secteur(angleDe(s.startHour), angleDe(s.endHour), exterieur)}
                fill={couleur(s.tone)}
                stroke={palette.background.paper}
                strokeWidth={2}
              />
            </MuiTooltip>
          );
        })}
        {[0, 6, 12, 18].map((heure) => {
          const [x, y] = point(angleDe(heure), INTERIEUR + EPAISSEUR_MAX + 10);
          return (
            <text
              key={heure}
              x={x}
              y={y}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={10}
              fill={palette.text.secondary}
            >
              {`${heure} h`}
            </text>
          );
        })}
      </Box>
      {center && (
        <Typography
          variant="body2"
          component="p"
          sx={{ textAlign: "center", mt: 1, fontWeight: 600 }}
        >
          {center}
        </Typography>
      )}
      <Box component="table" sx={visuallyHidden}>
        <caption>{label}</caption>
        <tbody>
          {sectors.map((s) => (
            <tr key={s.key}>
              <td>{s.title}</td>
            </tr>
          ))}
        </tbody>
      </Box>
    </Box>
  );
}

const visuallyHidden = {
  position: "absolute",
  width: 1,
  height: 1,
  overflow: "hidden",
  clip: "rect(0 0 0 0)",
  whiteSpace: "nowrap",
} as const;
