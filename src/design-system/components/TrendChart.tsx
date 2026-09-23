import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import MuiTooltip from "@mui/material/Tooltip";
import { chartColors, radii } from "../tokens";

export interface TrendPoint {
  key: string;
  label: string;
  value: number | null;
  title: string;
}

export interface TrendChartProps {
  label: string;
  points: TrendPoint[];
  scaleMax?: number;
  reference?: number | null;
  referenceLabel?: string;
  valueHeader: string;
  emptyLabel: string;
}

const HAUTEUR = 96;

export function TrendChart({
  label,
  points,
  scaleMax,
  reference,
  referenceLabel,
  valueHeader,
  emptyLabel,
}: TrendChartProps) {
  const mesures = points
    .map((point) => point.value)
    .filter((value): value is number => value !== null);
  const haut = Math.max(scaleMax ?? 0, ...mesures, Number.EPSILON);
  const pasEtiquette = points.length > 8 ? 2 : 1;

  if (points.length === 0) {
    return (
      <Typography variant="caption" color="text.secondary">
        {emptyLabel}
      </Typography>
    );
  }

  return (
    <Box>
      <Typography variant="caption" color="text.secondary" component="p">
        {label}
      </Typography>
      <Box
        aria-hidden
        sx={(theme) => {
          const scheme = theme.palette.mode === "light" ? "light" : "dark";
          return {
            position: "relative",
            display: "flex",
            alignItems: "flex-end",
            gap: "2px",
            height: HAUTEUR,
            mt: 0.5,
            borderBottom: `1px solid ${chartColors[scheme].grid}`,
          };
        }}
      >
        {reference !== null && reference !== undefined && (
          <Box
            sx={(theme) => {
              const scheme = theme.palette.mode === "light" ? "light" : "dark";
              return {
                position: "absolute",
                left: 0,
                right: 0,
                bottom: `${Math.min(1, reference / haut) * HAUTEUR}px`,
                borderTop: `1px dashed ${chartColors[scheme].grid}`,
              };
            }}
          />
        )}
        {points.map((point) => (
          <MuiTooltip key={point.key} title={point.title} placement="top">
            <Box
              sx={(theme) => {
                const scheme =
                  theme.palette.mode === "light" ? "light" : "dark";
                return {
                  flex: 1,
                  minWidth: 6,
                  height: "100%",
                  display: "flex",
                  alignItems: "flex-end",
                  cursor: "default",
                  "&:hover > *": {
                    backgroundColor: chartColors[scheme].markSoft,
                  },
                };
              }}
            >
              <Box
                sx={(theme) => {
                  const scheme =
                    theme.palette.mode === "light" ? "light" : "dark";
                  return {
                    width: "100%",
                    height:
                      point.value === null
                        ? 2
                        : `${Math.max(2, (point.value / haut) * HAUTEUR)}px`,
                    borderRadius: `${radii.sm}px ${radii.sm}px 0 0`,
                    backgroundColor:
                      point.value === null
                        ? chartColors[scheme].track
                        : chartColors[scheme].mark,
                  };
                }}
              />
            </Box>
          </MuiTooltip>
        ))}
      </Box>
      <Box aria-hidden sx={{ display: "flex", gap: "2px", mt: 0.5 }}>
        {points.map((point, index) => (
          <Typography
            key={point.key}
            variant="caption"
            color="text.secondary"
            sx={{ flex: 1, minWidth: 6, textAlign: "center", fontSize: 10 }}
          >
            {index % pasEtiquette === 0 ? point.label : ""}
          </Typography>
        ))}
      </Box>
      {referenceLabel && reference !== null && reference !== undefined && (
        <Typography variant="caption" color="text.secondary" component="p">
          {referenceLabel}
        </Typography>
      )}
      <Box component="table" sx={visuallyHidden}>
        <caption>{label}</caption>
        <thead>
          <tr>
            <th scope="col">{label}</th>
            <th scope="col">{valueHeader}</th>
          </tr>
        </thead>
        <tbody>
          {points.map((point) => (
            <tr key={point.key}>
              <th scope="row">{point.label}</th>
              <td>{point.title}</td>
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
