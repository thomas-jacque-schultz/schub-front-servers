import type { ReactNode } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { chartColors, radii, typographyTokens } from "../tokens";

export interface ComparisonEntry {
  label: string;
  value: ReactNode;
  /** Colore la valeur : meilleure ou moins bonne que la référence d'à côté. */
  tone?: "positive" | "negative" | "neutral";
}

export interface ComparisonTileProps {
  title: string;
  /** Trois valeurs côte à côte, la première mise en avant. */
  entries: ComparisonEntry[];
}

export function ComparisonTile({ title, entries }: ComparisonTileProps) {
  return (
    <Box>
      <Typography
        variant="caption"
        color="text.secondary"
        component="p"
        sx={{ mb: 0.5 }}
      >
        {title}
      </Typography>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: `repeat(${entries.length}, minmax(0, 1fr))`,
          border: "1px solid",
          borderColor: "divider",
          borderRadius: `${radii.md}px`,
          bgcolor: "background.paper",
        }}
      >
        {entries.map((entry, index) => (
          <Box
            key={entry.label}
            sx={{
              px: 1,
              py: 0.75,
              minWidth: 0,
              borderLeft: index === 0 ? "none" : "1px solid",
              borderColor: "divider",
            }}
          >
            <Typography
              variant="caption"
              color="text.secondary"
              component="p"
              noWrap
              sx={{
                fontSize: "0.68rem",
                letterSpacing: typographyTokens.letterSpacing.wide,
                textTransform: "uppercase",
              }}
            >
              {entry.label}
            </Typography>
            <Box
              sx={(theme) => {
                const colors =
                  chartColors[
                    theme.palette.mode === "light" ? "light" : "dark"
                  ];
                return {
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                  minHeight: 24,
                  fontFamily: typographyTokens.monospaceFontFamily,
                  fontVariantNumeric: "tabular-nums",
                  fontWeight: index === 0 ? 700 : 500,
                  fontSize: index === 0 ? "1.05rem" : "0.95rem",
                  color:
                    entry.tone === "positive"
                      ? colors.positive
                      : entry.tone === "negative"
                        ? colors.negative
                        : index === 0
                          ? "text.primary"
                          : "text.secondary",
                };
              }}
            >
              {entry.value}
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
