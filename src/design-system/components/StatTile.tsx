import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { chartColors } from "../tokens";

export interface StatTileProps {
  label: string;
  /** Déjà mis en forme par l'appelant : lui seul connaît la locale et l'unité. */
  value: string;
  /** Sur quoi porte le chiffre — nombre de parties, période. */
  hint?: string;
  /** L'écart, signe compris. Sans signe, il se lit comme une valeur absolue. */
  delta?: string;
  deltaTone?: "positive" | "negative" | "neutral";
  /** Ce à quoi l'écart se compare, en toutes lettres. */
  deltaHint?: string;
}

/**
 * Un chiffre, et ce sur quoi il porte.
 *
 * <p>`hint` n'est pas décoratif : un taux calculé sur trois parties se lit exactement comme un
 * taux calculé sur trois cents si rien ne dit lequel des deux on regarde.</p>
 *
 * <p>La couleur de l'écart est une redite : le signe le porte déjà, et c'est ce qui le rend
 * lisible sans distinguer le vert du rouge.</p>
 */
export function StatTile({
  label,
  value,
  hint,
  delta,
  deltaTone = "neutral",
  deltaHint,
}: StatTileProps) {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary" component="p">
        {label}
      </Typography>
      <Typography
        variant="h6"
        component="p"
        sx={{ fontWeight: 700, lineHeight: 1.2 }}
      >
        {value}
      </Typography>
      {delta && (
        <Typography
          variant="body2"
          component="p"
          sx={(theme) => {
            const scheme = theme.palette.mode === "light" ? "light" : "dark";
            const colors = chartColors[scheme];
            return {
              fontWeight: 600,
              color:
                deltaTone === "neutral"
                  ? "text.secondary"
                  : deltaTone === "positive"
                    ? colors.positive
                    : colors.negative,
            };
          }}
        >
          {delta}
          {deltaHint && (
            <Box
              component="span"
              sx={{ color: "text.secondary", fontWeight: 400 }}
            >
              {" "}
              {deltaHint}
            </Box>
          )}
        </Typography>
      )}
      {hint && (
        <Typography variant="caption" color="text.secondary" component="p">
          {hint}
        </Typography>
      )}
    </Box>
  );
}
