import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { Tooltip } from "./Tooltip";
import { chartColors, radii, typographyTokens } from "../tokens";

export interface QuadCorner {
  value: string;
  tone?: "positive" | "negative" | "neutral";
  /** Ce que le coin compare, en toutes lettres. */
  hint: string;
}

export interface QuadStatTileProps {
  label: string;
  /** En haut à gauche, en grand. */
  main: QuadCorner;
  topRight: QuadCorner;
  bottomLeft: QuadCorner;
  bottomRight: QuadCorner;
}

function Coin({
  corner,
  main = false,
  align,
}: {
  corner: QuadCorner;
  main?: boolean;
  align: "start" | "end";
}) {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: align === "end" ? "flex-end" : "flex-start",
        minWidth: 0,
      }}
    >
      <Tooltip title={corner.hint}>
        <Box
          component="span"
          sx={(theme) => {
            const colors =
              chartColors[theme.palette.mode === "light" ? "light" : "dark"];
            return {
              fontFamily: typographyTokens.monospaceFontFamily,
              fontVariantNumeric: "tabular-nums",
              fontWeight: main ? 700 : 600,
              fontSize: main ? "1.05rem" : "0.8rem",
              lineHeight: 1.3,
              whiteSpace: "nowrap",
              cursor: "help",
              color:
                corner.tone === "positive"
                  ? colors.positive
                  : corner.tone === "negative"
                    ? colors.negative
                    : main
                      ? "text.primary"
                      : "text.secondary",
            };
          }}
        >
          {corner.value}
        </Box>
      </Tooltip>
    </Box>
  );
}

export function QuadStatTile({
  label,
  main,
  topRight,
  bottomLeft,
  bottomRight,
}: QuadStatTileProps) {
  return (
    <Box
      sx={{
        px: 1,
        py: 0.75,
        minWidth: 0,
        border: "1px solid",
        borderColor: "divider",
        borderRadius: `${radii.md}px`,
        bgcolor: "background.paper",
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
        {label}
      </Typography>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr) auto",
          alignItems: "baseline",
          columnGap: 1,
        }}
      >
        <Coin corner={main} main align="start" />
        <Coin corner={topRight} align="end" />
        <Coin corner={bottomLeft} align="start" />
        <Coin corner={bottomRight} align="end" />
      </Box>
    </Box>
  );
}
