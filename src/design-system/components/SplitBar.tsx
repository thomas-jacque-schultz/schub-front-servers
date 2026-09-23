import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { chartColors, radii, typographyTokens } from "../tokens";

export interface SplitBarSegment {
  key: string;
  label: string;
  value: number;
  valueLabel?: string;
}

export interface SplitBarProps {
  label: string;
  segments: SplitBarSegment[];
  /** Le segment à mettre en avant ; les autres restent en retrait. */
  highlight?: string | null;
}

// Une seule barre, découpée en parts : la part se lit à la longueur, pas à la teinte.
export function SplitBar({ label, segments, highlight }: SplitBarProps) {
  const total = segments.reduce((somme, segment) => somme + Math.max(0, segment.value), 0);
  return (
    <Box>
      <Typography variant="caption" color="text.secondary" component="p">
        {label}
      </Typography>
      <Box
        role="img"
        aria-label={`${label} : ${segments.map((s) => `${s.label} ${s.valueLabel ?? s.value}`).join(", ")}`}
        sx={(theme) => {
          const scheme = theme.palette.mode === "light" ? "light" : "dark";
          return {
            display: "flex",
            gap: "2px",
            height: 10,
            borderRadius: `${radii.sm}px`,
            overflow: "hidden",
            backgroundColor: chartColors[scheme].track,
          };
        }}
      >
        {total > 0 &&
          segments
            .filter((segment) => segment.value > 0)
            .map((segment) => (
              <Box
                key={segment.key}
                sx={(theme) => {
                  const scheme = theme.palette.mode === "light" ? "light" : "dark";
                  return {
                    flexGrow: segment.value,
                    flexBasis: 0,
                    backgroundColor:
                      segment.key === highlight ? chartColors[scheme].mark : chartColors[scheme].markMuted,
                  };
                }}
              />
            ))}
      </Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", gap: 1, mt: 0.25 }}>
        {segments.map((segment) => (
          <Typography
            key={segment.key}
            variant="caption"
            sx={{
              fontFamily: typographyTokens.monospaceFontFamily,
              fontWeight: segment.key === highlight ? 700 : 400,
              color: segment.key === highlight ? "text.primary" : "text.secondary",
            }}
          >
            {`${segment.label} ${segment.valueLabel ?? segment.value}`}
          </Typography>
        ))}
      </Box>
    </Box>
  );
}
