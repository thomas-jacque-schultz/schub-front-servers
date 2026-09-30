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
  /** À gauche, le joueur : la valeur en grand, puis `bottomLeft`. À droite, l'équipe : `topRight`, puis `bottomRight`. */
  main: QuadCorner;
  topRight: QuadCorner;
  bottomLeft: QuadCorner;
  bottomRight: QuadCorner;
}

function Coin({
  corner,
  main = false,
  align,
  area,
}: {
  corner: QuadCorner;
  main?: boolean;
  align: "start" | "end";
  area: string;
}) {
  return (
    <Box
      sx={{
        gridArea: area,
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
          gridTemplateColumns: "minmax(0, 1fr) 1px auto",
          gridTemplateAreas: `"main sep tr" "bl sep br"`,
          alignItems: "baseline",
          columnGap: 1,
        }}
      >
        <Coin corner={main} main align="start" area="main" />
        <Box
          aria-hidden
          sx={{
            gridArea: "sep",
            alignSelf: "stretch",
            bgcolor: "divider",
            opacity: 0.5,
          }}
        />
        <Coin corner={topRight} align="end" area="tr" />
        <Coin corner={bottomLeft} align="start" area="bl" />
        <Coin corner={bottomRight} align="end" area="br" />
      </Box>
    </Box>
  );
}
