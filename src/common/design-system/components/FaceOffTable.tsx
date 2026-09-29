import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { chartColors, typographyTokens } from "../tokens";

export interface FaceOffRow {
  key: string;
  label: string;
  ours: number;
  theirs: number;
}

export interface FaceOffTableProps {
  title: string;
  rows: FaceOffRow[];
  /** Pour les lecteurs d'écran : qui est à gauche, qui est à droite. */
  oursLabel: string;
  theirsLabel: string;
}

// Nous à gauche, eux à droite ; le camp qui en a le plus est en gras, dans sa couleur.
export function FaceOffTable({
  title,
  rows,
  oursLabel,
  theirsLabel,
}: FaceOffTableProps) {
  const chiffre = (valeur: number, autre: number, camp: "ours" | "theirs") => (
    <Typography
      component="span"
      aria-label={`${camp === "ours" ? oursLabel : theirsLabel} ${valeur}`}
      sx={(theme) => {
        const colors =
          chartColors[theme.palette.mode === "light" ? "light" : "dark"];
        const devant = valeur > autre;
        return {
          fontFamily: typographyTokens.monospaceFontFamily,
          fontVariantNumeric: "tabular-nums",
          fontSize: "1.05rem",
          fontWeight: devant ? 700 : 500,
          textAlign: camp === "ours" ? "right" : "left",
          color: devant
            ? camp === "ours"
              ? colors.positive
              : colors.negative
            : "text.secondary",
        };
      }}
    >
      {valeur}
    </Typography>
  );

  return (
    <Box>
      <Typography
        variant="caption"
        color="text.secondary"
        component="p"
        sx={{ mb: 0.5, textAlign: "center" }}
      >
        {title}
      </Typography>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr) auto minmax(0, 1fr)",
          columnGap: 1.5,
          rowGap: 0.5,
          alignItems: "baseline",
        }}
      >
        {rows.map((row) => (
          <Box key={row.key} sx={{ display: "contents" }}>
            {chiffre(row.ours, row.theirs, "ours")}
            <Typography
              variant="body2"
              component="span"
              sx={{ textAlign: "center" }}
            >
              {row.label}
            </Typography>
            {chiffre(row.theirs, row.ours, "theirs")}
          </Box>
        ))}
      </Box>
    </Box>
  );
}
