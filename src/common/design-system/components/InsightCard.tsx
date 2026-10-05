import { type ReactNode, useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { Button } from "./Button";
import { Card } from "./Card";
import { Icon } from "./Icon";
import { useChartScheme } from "./useChartScheme";
import { VERDICTS, type Verdict } from "./verdict";
import { VerdictMark } from "./VerdictMark";

export interface InsightCardProps {
  /** Court : « Revenus », pas une question (retour du 05/10). */
  title: string;
  /** Une phrase de douze mots au plus, qui dit quoi en conclure. */
  conclusion?: ReactNode;
  /** null : mesure sans bon ni mauvais sens. Absent : pas de verdict du tout. */
  verdict?: Verdict | null;
  verdictLabel?: string;
  /** Un seul visuel, choisi pour la question. */
  visual?: ReactNode;
  /** Replié par défaut : tous les chiffres, la méthode, l'échantillon. Monté seulement à l'ouverture. */
  details?: ReactNode;
  detailsLabel?: string;
  hideDetailsLabel?: string;
  /** Le logo « confiance insuffisante », en tête de l'encart. */
  badge?: ReactNode;
  children?: ReactNode;
}

/** L'encart commun (Schub#92) : un titre, une conclusion, un visuel, le détail sur demande. */
export function InsightCard({
  title,
  conclusion,
  verdict,
  verdictLabel,
  visual,
  details,
  detailsLabel,
  hideDetailsLabel,
  badge,
  children,
}: InsightCardProps) {
  const [open, setOpen] = useState(false);
  const { chart } = useChartScheme();
  const accent =
    verdict === undefined || verdict === null
      ? chart.markMuted
      : chart.verdict[VERDICTS.indexOf(verdict)];

  return (
    <Card title={title} actions={badge}>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {conclusion && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              pl: 1.25,
              borderLeft: "3px solid",
              borderColor: accent,
            }}
          >
            {verdict !== undefined && (
              <VerdictMark verdict={verdict} size="medium" />
            )}
            <Typography variant="body1" component="p" sx={{ fontWeight: 600 }}>
              {conclusion}
            </Typography>
            {verdictLabel && (
              <Typography
                variant="caption"
                component="span"
                sx={{ color: accent, ml: "auto", whiteSpace: "nowrap" }}
              >
                {verdictLabel}
              </Typography>
            )}
          </Box>
        )}
        {visual}
        {children}
        {details && detailsLabel && (
          <Box>
            <Button
              variant="ghost"
              size="small"
              onClick={() => setOpen((ouvert) => !ouvert)}
              endIcon={
                <Box
                  component="span"
                  sx={{
                    display: "inline-flex",
                    transform: open ? "rotate(180deg)" : "none",
                  }}
                >
                  <Icon name="expand" size="small" />
                </Box>
              }
            >
              {open ? (hideDetailsLabel ?? detailsLabel) : detailsLabel}
            </Button>
            {open && <Box sx={{ pt: 1.5 }}>{details}</Box>}
          </Box>
        )}
      </Box>
    </Card>
  );
}
