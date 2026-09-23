import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { chartColors, radii } from "../tokens";

export interface MeterBarProps {
  value: number | null;
  label: string;
  valueLabel?: string;
  hint?: string;
}

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
