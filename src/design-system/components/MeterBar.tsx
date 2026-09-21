import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { chartColors, radii } from "../tokens";

export interface MeterBarProps {
  /** Entre 0 et 1. Hors bornes, la barre est bornée ; `null` ne dessine aucun remplissage. */
  value: number | null;
  /** Ce que la barre mesure — lu par les lecteurs d'écran. */
  label: string;
  /** La valeur en toutes lettres, affichée à droite. Sans elle, la barre seule ne se lit pas. */
  valueLabel?: string;
  hint?: string;
}

/**
 * Une proportion, en une barre.
 *
 * <p>Une seule teinte et un fond neutre : la part manquante n'est pas une seconde série, et lui
 * donner une couleur ferait croire à deux grandeurs comparables.</p>
 *
 * <p>Sans valeur, la barre reste dessinée mais vide — un dénominateur absent n'est pas un zéro,
 * et une barre qui disparaîtrait ferait perdre la ligne.</p>
 */
export function MeterBar({ value, label, valueLabel, hint }: MeterBarProps) {
  const ratio =
    value === null || Number.isNaN(value)
      ? null
      : Math.min(1, Math.max(0, value));

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", gap: 1 }}>
        <Typography variant="caption" color="text.secondary">
          {label}
        </Typography>
        {valueLabel && (
          <Typography variant="caption" sx={{ fontWeight: 600 }}>
            {valueLabel}
          </Typography>
        )}
      </Box>
      <Box
        role="meter"
        aria-label={label}
        aria-valuenow={ratio === null ? undefined : Math.round(ratio * 100)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuetext={valueLabel}
        sx={(theme) => {
          const scheme = theme.palette.mode === "light" ? "light" : "dark";
          return {
            height: 8,
            borderRadius: `${radii.pill}px`,
            backgroundColor: chartColors[scheme].track,
            overflow: "hidden",
          };
        }}
      >
        {ratio !== null && (
          <Box
            sx={(theme) => {
              const scheme = theme.palette.mode === "light" ? "light" : "dark";
              return {
                width: `${ratio * 100}%`,
                height: "100%",
                borderRadius: `${radii.pill}px`,
                backgroundColor: chartColors[scheme].mark,
              };
            }}
          />
        )}
      </Box>
      {hint && (
        <Typography
          variant="caption"
          color="text.secondary"
          component="p"
          sx={{ mt: 0.25 }}
        >
          {hint}
        </Typography>
      )}
    </Box>
  );
}
