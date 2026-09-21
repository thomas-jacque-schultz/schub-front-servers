import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import MuiTooltip from "@mui/material/Tooltip";
import { chartColors, radii } from "../tokens";

export interface TrendPoint {
  key: string;
  /** L'étiquette d'axe. Une sur deux est affichée quand la série est longue. */
  label: string;
  /** `null` = pas de mesure sur ce pas. Ce n'est pas zéro. */
  value: number | null;
  /** Le détail au survol : valeur mise en forme et assise. */
  title: string;
}

export interface TrendChartProps {
  /** Ce que la série mesure, affiché en titre et repris dans le tableau équivalent. */
  label: string;
  points: TrendPoint[];
  /** Haut de l'échelle. Par défaut le maximum observé, au minimum 1. */
  scaleMax?: number;
  /** Repère horizontal, dans l'unité des valeurs — par exemple la moyenne du joueur. */
  reference?: number | null;
  referenceLabel?: string;
  /** En-tête de la colonne des valeurs dans le tableau équivalent. */
  valueHeader: string;
  emptyLabel: string;
}

const HAUTEUR = 96;

/**
 * Une évolution, à série unique.
 *
 * <p>Une seule teinte, parce qu'il n'y a qu'une grandeur : une deuxième couleur ferait croire à
 * une deuxième série. Pas de second axe, jamais.</p>
 *
 * <p>Un pas sans mesure ne dessine pas de barre et garde sa place. L'écraser à zéro ferait lire
 * « il a tout perdu ce mois-là » là où il n'a rien joué.</p>
 *
 * <p>Le tableau équivalent n'est pas une option d'accessibilité : c'est le seul chemin vers ces
 * chiffres pour qui ne voit pas la hauteur des barres, et il porte les mêmes valeurs.</p>
 */
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

/** Le tableau existe pour les lecteurs d'écran ; le masquer par `display: none` l'en priverait. */
const visuallyHidden = {
  position: "absolute",
  width: 1,
  height: 1,
  overflow: "hidden",
  clip: "rect(0 0 0 0)",
  whiteSpace: "nowrap",
} as const;
