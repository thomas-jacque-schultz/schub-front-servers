import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { chartColors } from "../tokens";

export interface StatTileProps {
  label: string;
  value: string;
  hint?: string;
  delta?: string;
  deltaTone?: "positive" | "negative" | "neutral";
  deltaHint?: string;
}

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
