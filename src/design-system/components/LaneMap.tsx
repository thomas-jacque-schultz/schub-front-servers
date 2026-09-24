import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { useChartScheme } from "./useChartScheme";
import { typographyTokens } from "../tokens";

export type LaneMapKey = "TOP" | "MID" | "BOT";

export interface LaneMapZone {
  key: LaneMapKey;
  label: string;
  value: number;
  valueLabel: string;
}

export interface LaneMapProps {
  label: string;
  zones: LaneMapZone[];
  /** La zone à cerner : le côté fort, par exemple. */
  highlight?: LaneMapKey | null;
}

// La Faille vue d'en haut : le couloir du haut longe les bords gauche et haut, celui du bas les bords bas et
// droit, le milieu suit la diagonale. Chaque zone se teinte selon sa part du temps : une seule teinte, plus
// dense quand on y a passé plus de temps.
const ZONES: Record<
  LaneMapKey,
  { points: string; x: number; y: number; angle: number }
> = {
  TOP: { points: "0,0 78,0 0,78", x: 26, y: 26, angle: 0 },
  MID: {
    points: "78,0 100,0 100,22 22,100 0,100 0,78",
    x: 50,
    y: 50,
    angle: -45,
  },
  BOT: { points: "100,22 100,100 22,100", x: 74, y: 74, angle: 0 },
};

const COULOIRS = [
  "M 8 92 L 8 8 L 92 8",
  "M 10 90 L 90 10",
  "M 8 92 L 92 92 L 92 8",
];

export function LaneMap({ label, zones, highlight }: LaneMapProps) {
  const { chart: couleurs, palette } = useChartScheme();
  const total = zones.reduce(
    (somme, zone) => somme + Math.max(0, zone.value),
    0,
  );
  return (
    <Box>
      <Typography
        variant="caption"
        color="text.secondary"
        component="p"
        sx={{ mb: 0.5 }}
      >
        {label}
      </Typography>
      <Box
        component="svg"
        viewBox="0 0 100 100"
        role="img"
        aria-label={`${label} : ${zones.map((zone) => `${zone.label} ${zone.valueLabel}`).join(", ")}`}
        sx={{
          display: "block",
          width: "100%",
          maxWidth: 200,
          aspectRatio: "1",
          overflow: "visible",
        }}
      >
        <rect
          x="0"
          y="0"
          width="100"
          height="100"
          rx="3"
          fill={couleurs.track}
        />
        {zones.map((zone) => {
          const part = total > 0 ? Math.max(0, zone.value) / total : 0;
          return (
            <polygon
              key={zone.key}
              points={ZONES[zone.key].points}
              fill={couleurs.mark}
              fillOpacity={0.08 + 0.52 * part}
              stroke={
                zone.key === highlight
                  ? couleurs.mark
                  : palette.background.paper
              }
              strokeWidth={zone.key === highlight ? 1.5 : 1}
              strokeLinejoin="round"
            />
          );
        })}
        {COULOIRS.map((d) => (
          <path
            key={d}
            d={d}
            fill="none"
            stroke={palette.text.disabled}
            strokeWidth="0.8"
            strokeDasharray="2 2"
          />
        ))}
        {zones.map((zone) => {
          const { x, y, angle } = ZONES[zone.key];
          return (
            <g key={zone.key} transform={`rotate(${angle} ${x} ${y})`}>
              <text
                x={x}
                y={y - 2}
                textAnchor="middle"
                fontSize="6.5"
                fill={palette.text.secondary}
              >
                {zone.label}
              </text>
              <text
                x={x}
                y={y + 7}
                textAnchor="middle"
                fontSize="9"
                fontWeight="700"
                fontFamily={typographyTokens.monospaceFontFamily}
                fill={palette.text.primary}
              >
                {zone.valueLabel}
              </text>
            </g>
          );
        })}
      </Box>
    </Box>
  );
}
