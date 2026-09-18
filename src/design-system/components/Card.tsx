import { type ReactNode } from "react";
import MuiCard from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

export interface CardProps {
  /** Titre de la carte. Absent, l'en-tête n'est pas rendu du tout. */
  title?: ReactNode;
  /** Une phrase qui dit à quoi sert la carte ; pas un second titre. */
  description?: ReactNode;
  /** Actions alignées à droite de l'en-tête. */
  actions?: ReactNode;
  /** Retire la gouttière interne, pour un tableau qui doit toucher les bords. */
  disablePadding?: boolean;
  children?: ReactNode;
}

/**
 * La surface de base : tout bloc de contenu se pose dessus.
 *
 * <p>Bordure, rayon et ombre viennent du thème et non de chaque appel — c'était l'un des points
 * où l'ancien code divergeait, chaque carte reposant ses propres `boxShadow`.</p>
 */
export function Card({ title, description, actions, disablePadding = false, children }: CardProps) {
  const hasHeader = Boolean(title || description || actions);

  return (
    <MuiCard>
      <CardContent sx={disablePadding ? { p: 0, "&:last-child": { pb: 0 } } : undefined}>
        <Stack spacing={2}>
          {hasHeader && (
            <Stack
              direction={{ xs: "column", sm: "row" }}
              justifyContent="space-between"
              alignItems={{ xs: "flex-start", sm: "center" }}
              spacing={1.5}
            >
              <Stack spacing={0.5}>
                {title && (
                  <Typography variant="h6" component="h2">
                    {title}
                  </Typography>
                )}
                {description && (
                  <Typography variant="body2" color="text.secondary">
                    {description}
                  </Typography>
                )}
              </Stack>
              {actions && <Stack direction="row" spacing={1}>{actions}</Stack>}
            </Stack>
          )}
          {children}
        </Stack>
      </CardContent>
    </MuiCard>
  );
}
