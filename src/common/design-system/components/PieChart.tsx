import Box from "@mui/material/Box";
import MuiTooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { useChartScheme } from "./useChartScheme";
import { typographyTokens } from "../tokens";

export interface PieSlice {
  key: string;
  label: string;
  value: number;
  /** Sous le libellé, dans la légende et l'infobulle : taux de victoire, effectif. */
  detail?: string;
}

export interface PieChartProps {
  label: string;
  slices: PieSlice[];
  emptyLabel: string;
  /** Au-delà de cinq parts, les plus petites se regroupent sous ce libellé. */
  otherLabel: string;
  /** Détail de la part regroupée, à partir des parts qu'elle contient. */
  otherDetail?: (slices: PieSlice[]) => string;
}

const COTE = 160;
const RAYON = 72;
const EPAISSEUR = 26;
const PARTS_MAX = 5;

const arc = (debut: number, fin: number) => {
  const exterieur = RAYON;
  const interieur = RAYON - EPAISSEUR;
  const point = (angle: number, rayon: number) => [
    COTE / 2 + rayon * Math.sin(angle),
    COTE / 2 - rayon * Math.cos(angle),
  ];
  const grand = fin - debut > Math.PI ? 1 : 0;
  const [x1, y1] = point(debut, exterieur);
  const [x2, y2] = point(fin, exterieur);
  const [x3, y3] = point(fin, interieur);
  const [x4, y4] = point(debut, interieur);
  return `M ${x1} ${y1} A ${exterieur} ${exterieur} 0 ${grand} 1 ${x2} ${y2} L ${x3} ${y3} A ${interieur} ${interieur} 0 ${grand} 0 ${x4} ${y4} Z`;
};

export function PieChart({
  label,
  slices,
  emptyLabel,
  otherLabel,
  otherDetail,
}: PieChartProps) {
  const { chart, palette } = useChartScheme();
  const utiles = slices
    .filter((slice) => slice.value > 0)
    .sort((a, b) => b.value - a.value);
  const total = utiles.reduce((somme, slice) => somme + slice.value, 0);
  if (total === 0) {
    return (
      <Typography variant="caption" color="text.secondary">
        {emptyLabel}
      </Typography>
    );
  }

  const parts: (PieSlice & { color: string })[] = [];
  if (utiles.length <= PARTS_MAX) {
    utiles.forEach((slice, index) =>
      parts.push({ ...slice, color: chart.categories[index] }),
    );
  } else {
    const gardees = utiles.slice(0, PARTS_MAX - 1);
    const reste = utiles.slice(PARTS_MAX - 1);
    gardees.forEach((slice, index) =>
      parts.push({ ...slice, color: chart.categories[index] }),
    );
    parts.push({
      key: "__autres",
      label: otherLabel,
      value: reste.reduce((somme, slice) => somme + slice.value, 0),
      detail: otherDetail?.(reste),
      color: chart.markMuted,
    });
  }

  const part = (valeur: number) =>
    new Intl.NumberFormat(undefined, {
      style: "percent",
      maximumFractionDigits: 0,
    }).format(valeur / total);

  let angle = 0;
  const arcs = parts.map((slice) => {
    const debut = angle;
    angle += (slice.value / total) * 2 * Math.PI;
    return { slice, debut, fin: angle };
  });
  const infobulle = (slice: PieSlice) =>
    [`${slice.label} · ${part(slice.value)}`, slice.detail]
      .filter(Boolean)
      .join("\n");

  return (
    <Box>
      <Typography variant="caption" color="text.secondary" component="p">
        {label}
      </Typography>
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: 2,
          mt: 0.5,
        }}
      >
        <Box
          component="svg"
          viewBox={`0 0 ${COTE} ${COTE}`}
          sx={{ width: COTE, height: COTE, flexShrink: 0 }}
          aria-hidden
        >
          {arcs.map(({ slice, debut, fin }) => (
            <MuiTooltip
              key={slice.key}
              arrow
              title={
                <Box sx={{ whiteSpace: "pre-line" }}>{infobulle(slice)}</Box>
              }
            >
              {parts.length === 1 ? (
                <circle
                  cx={COTE / 2}
                  cy={COTE / 2}
                  r={RAYON - EPAISSEUR / 2}
                  fill="none"
                  stroke={slice.color}
                  strokeWidth={EPAISSEUR}
                />
              ) : (
                <path
                  d={arc(debut, fin)}
                  fill={slice.color}
                  stroke={palette.background.paper}
                  strokeWidth={2}
                />
              )}
            </MuiTooltip>
          ))}
        </Box>
        <Box
          component="ul"
          sx={{ listStyle: "none", p: 0, m: 0, minWidth: 0, flex: "1 1 160px" }}
        >
          {parts.map((slice) => (
            <Box
              component="li"
              key={slice.key}
              sx={{
                display: "grid",
                gridTemplateColumns: "10px minmax(0, 1fr) auto",
                columnGap: 1,
                alignItems: "baseline",
                py: 0.25,
              }}
            >
              <Box
                sx={{
                  width: 10,
                  height: 10,
                  borderRadius: "2px",
                  bgcolor: slice.color,
                }}
              />
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="body2" component="p" noWrap>
                  {slice.label}
                </Typography>
                {slice.detail && (
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    component="p"
                  >
                    {slice.detail}
                  </Typography>
                )}
              </Box>
              <Typography
                variant="body2"
                component="span"
                sx={{
                  fontFamily: typographyTokens.monospaceFontFamily,
                  fontVariantNumeric: "tabular-nums",
                  fontWeight: 600,
                }}
              >
                {part(slice.value)}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
}
