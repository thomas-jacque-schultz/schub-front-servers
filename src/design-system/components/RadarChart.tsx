import { Fragment } from "react";
import Box from "@mui/material/Box";
import MuiTooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { useTheme } from "@mui/material/styles";
import { chartColors, typographyTokens } from "../tokens";

export interface RadarAxis {
  key: string;
  label: string;
}

export type RadarEmphasis = "primary" | "secondary" | "muted";

export interface RadarSeries {
  key: string;
  label: string;
  emphasis: RadarEmphasis;
  /** Une valeur par axe, ramenée entre 0 et 1. `null` : pas de donnée, jamais zéro. */
  values: Array<number | null>;
  /** Les valeurs réelles, déjà mises en forme, dans l'ordre des axes. */
  display: string[];
}

export interface RadarChartProps {
  label: string;
  axes: RadarAxis[];
  series: RadarSeries[];
  emptyLabel: string;
  /** Ce que représentent le centre et le bord, en toutes lettres. */
  scaleNote?: string;
}

const LARGEUR = 380;
const HAUTEUR = 300;
const CX = LARGEUR / 2;
const CY = HAUTEUR / 2;
const RAYON = 104;
const ANNEAUX = [0.25, 0.5, 0.75, 1];
const ORDRE: RadarEmphasis[] = ["muted", "secondary", "primary"];

const angle = (index: number, total: number) => -Math.PI / 2 + (2 * Math.PI * index) / total;

const point = (index: number, total: number, ratio: number) => {
  const a = angle(index, total);
  return { x: CX + Math.cos(a) * RAYON * ratio, y: CY + Math.sin(a) * RAYON * ratio };
};

const borne = (value: number) => Math.min(1, Math.max(0, value));

// Un axe sans donnée coupe le tracé : relier ses voisins inventerait une valeur.
const segments = (values: Array<number | null>) => {
  const total = values.length;
  const traits: string[] = [];
  for (let index = 0; index < total; index += 1) {
    const suivant = (index + 1) % total;
    const a = values[index];
    const b = values[suivant];
    if (a === null || b === null) {
      continue;
    }
    const p = point(index, total, borne(a));
    const q = point(suivant, total, borne(b));
    traits.push(`M${p.x},${p.y}L${q.x},${q.y}`);
  }
  return traits.join("");
};

const polygone = (values: Array<number | null>) =>
  values
    .map((value, index) => {
      const p = point(index, values.length, borne(value ?? 0));
      return `${p.x},${p.y}`;
    })
    .join(" ");

export function RadarChart({ label, axes, series, emptyLabel, scaleNote }: RadarChartProps) {
  const theme = useTheme();
  const couleurs = chartColors[theme.palette.mode === "light" ? "light" : "dark"];
  const surface = theme.palette.background.paper;
  const visibles = series.filter((serie) => serie.values.some((value) => value !== null));

  const trait = (emphasis: RadarEmphasis) =>
    emphasis === "primary"
      ? { stroke: couleurs.mark, dash: undefined, width: 2 }
      : emphasis === "secondary"
        ? { stroke: couleurs.markSecondary, dash: "5 4", width: 2 }
        : { stroke: couleurs.markMuted, dash: "2 3", width: 1.5 };

  if (axes.length < 3 || visibles.length === 0) {
    return (
      <Typography variant="caption" color="text.secondary">
        {emptyLabel}
      </Typography>
    );
  }

  const n = axes.length;

  return (
    <Box>
      <Typography variant="caption" color="text.secondary" component="p">
        {label}
      </Typography>

      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mt: 0.5 }}>
        {visibles.map((serie) => {
          const style = trait(serie.emphasis);
          return (
            <Box key={serie.key} sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
              <svg width="22" height="8" aria-hidden>
                <line
                  x1="1"
                  y1="4"
                  x2="21"
                  y2="4"
                  stroke={style.stroke}
                  strokeWidth={style.width}
                  strokeDasharray={style.dash}
                />
              </svg>
              <Typography variant="caption" color="text.primary">
                {serie.label}
              </Typography>
            </Box>
          );
        })}
      </Box>

      <Box
        component="svg"
        viewBox={`0 0 ${LARGEUR} ${HAUTEUR}`}
        role="img"
        aria-label={label}
        sx={{ width: "100%", maxWidth: 440, height: "auto", display: "block", mx: "auto" }}
      >
        {ANNEAUX.map((ratio) => (
          <polygon
            key={ratio}
            points={polygone(axes.map(() => ratio))}
            fill="none"
            stroke={couleurs.grid}
            strokeWidth={1}
          />
        ))}
        {axes.map((axe, index) => {
          const bout = point(index, n, 1);
          const etiquette = point(index, n, 1.16);
          const cos = Math.cos(angle(index, n));
          return (
            <Fragment key={axe.key}>
              <line x1={CX} y1={CY} x2={bout.x} y2={bout.y} stroke={couleurs.grid} strokeWidth={1} />
              <text
                x={etiquette.x}
                y={etiquette.y}
                textAnchor={cos > 0.2 ? "start" : cos < -0.2 ? "end" : "middle"}
                dominantBaseline="middle"
                fontSize={11}
                fontFamily={typographyTokens.monospaceFontFamily}
                fill={theme.palette.text.secondary}
              >
                {axe.label}
              </text>
            </Fragment>
          );
        })}

        {ORDRE.flatMap((emphasis) =>
          visibles
            .filter((serie) => serie.emphasis === emphasis)
            .map((serie) => {
              const style = trait(serie.emphasis);
              const complet = serie.values.every((value) => value !== null);
              return (
                <g key={serie.key}>
                  {complet && emphasis === "primary" && (
                    <polygon points={polygone(serie.values)} fill={couleurs.markSoft} stroke="none" />
                  )}
                  <path
                    d={segments(serie.values)}
                    fill="none"
                    stroke={style.stroke}
                    strokeWidth={style.width}
                    strokeDasharray={style.dash}
                    strokeLinecap="round"
                  />
                  {emphasis === "primary" &&
                    serie.values.map((value, index) =>
                      value === null ? null : (
                        <circle
                          key={axes[index].key}
                          cx={point(index, n, borne(value)).x}
                          cy={point(index, n, borne(value)).y}
                          r={4}
                          fill={style.stroke}
                          stroke={surface}
                          strokeWidth={2}
                        />
                      ),
                    )}
                </g>
              );
            }),
        )}

        {axes.map((axe, index) => {
          const bout = point(index, n, 0.9);
          return (
            <MuiTooltip
              key={axe.key}
              arrow
              title={
                <Box>
                  <Typography variant="caption" sx={{ fontWeight: 700 }} component="p">
                    {axe.label}
                  </Typography>
                  {visibles.map((serie) => (
                    <Typography key={serie.key} variant="caption" component="p">
                      {`${serie.label} : ${serie.display[index] ?? "—"}`}
                    </Typography>
                  ))}
                </Box>
              }
            >
              <circle cx={bout.x} cy={bout.y} r={26} fill="transparent" />
            </MuiTooltip>
          );
        })}
      </Box>

      {scaleNote && (
        <Typography variant="caption" color="text.secondary" component="p" sx={{ mt: 0.5 }}>
          {scaleNote}
        </Typography>
      )}

      <Box
        component="table"
        sx={{
          position: "absolute",
          width: 1,
          height: 1,
          overflow: "hidden",
          clip: "rect(0 0 0 0)",
          whiteSpace: "nowrap",
        }}
      >
        <caption>{label}</caption>
        <thead>
          <tr>
            <th scope="col" />
            {visibles.map((serie) => (
              <th key={serie.key} scope="col">
                {serie.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {axes.map((axe, index) => (
            <tr key={axe.key}>
              <th scope="row">{axe.label}</th>
              {visibles.map((serie) => (
                <td key={serie.key}>{serie.display[index] ?? "—"}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </Box>
    </Box>
  );
}
