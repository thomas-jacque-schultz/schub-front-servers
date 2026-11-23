import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { radii } from "../tokens";
import { useChartScheme } from "./useChartScheme";

/** La légende de la dernière colonne, à poser au-dessus du tableau. */
export function BreakdownSplitLegend({ parts }: { parts: [string, string] }) {
  const { chart } = useChartScheme();
  return (
    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
      {parts.map((part, index) => (
        <Box
          key={part}
          sx={{ display: "inline-flex", alignItems: "center", gap: 0.75 }}
        >
          <Box
            aria-hidden
            sx={{
              width: 12,
              height: 8,
              borderRadius: `${radii.sm}px`,
              backgroundColor:
                index === 0 ? chart.markMuted : chart.markSecondary,
            }}
          />
          <Typography variant="caption" color="text.secondary">
            {part}
          </Typography>
        </Box>
      ))}
    </Box>
  );
}
