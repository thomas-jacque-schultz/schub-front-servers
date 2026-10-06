import { type ReactNode } from "react";
import MuiCard from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

export interface CardProps {
  title?: ReactNode;
  description?: ReactNode;
  /** La méthode, sous le contenu : un encart commence par ce qu'il montre, pas par comment le lire (Schub#88). */
  footnote?: ReactNode;
  actions?: ReactNode;
  disablePadding?: boolean;
  /** Hauteur minimale, pour qu'une grille de cartes voisines se lise ligne à ligne. */
  minHeight?: number;
  children?: ReactNode;
}

export function Card({
  title,
  description,
  footnote,
  actions,
  disablePadding = false,
  minHeight,
  children,
}: CardProps) {
  const hasHeader = Boolean(title || description || actions);

  return (
    <MuiCard sx={minHeight ? { minHeight } : undefined}>
      <CardContent
        sx={disablePadding ? { p: 0, "&:last-child": { pb: 0 } } : undefined}
      >
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
              {actions && (
                <Stack direction="row" spacing={1}>
                  {actions}
                </Stack>
              )}
            </Stack>
          )}
          {children}
          {footnote && (
            <Typography variant="caption" color="text.secondary" component="p">
              {footnote}
            </Typography>
          )}
        </Stack>
      </CardContent>
    </MuiCard>
  );
}
