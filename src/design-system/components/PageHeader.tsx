import { type ReactNode } from "react";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

export interface PageHeaderProps {
  title: string;
  /** Surtitre court, en capitales : la section à laquelle l'écran appartient. */
  eyebrow?: string;
  /** Une phrase qui explique l'écran ; pas un mode d'emploi. */
  subtitle?: ReactNode;
  /** Actions de l'écran, alignées à droite sur grand écran. */
  actions?: ReactNode;
}

/**
 * L'en-tête d'un écran : surtitre, titre, sous-titre, actions.
 *
 * <p>Il ne porte **ni** la navigation **ni** le compte connecté : le bandeau applicatif dépend de
 * l'authentification (chantier A) et n'est donc pas encore dessiné. Ce composant est la moitié
 * qui peut être décidée aujourd'hui, et qui le sera une seule fois.</p>
 *
 * <p>Le titre est rendu en `h1` : un écran n'a qu'un titre de premier niveau, et c'est celui-ci.</p>
 */
export function PageHeader({ title, eyebrow, subtitle, actions }: PageHeaderProps) {
  return (
    <Stack
      direction={{ xs: "column", md: "row" }}
      justifyContent="space-between"
      alignItems={{ xs: "flex-start", md: "flex-end" }}
      spacing={2}
    >
      <Stack spacing={1}>
        {eyebrow && (
          <Typography variant="overline" color="primary">
            {eyebrow}
          </Typography>
        )}
        <Typography variant="h4" component="h1">
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 700 }}>
            {subtitle}
          </Typography>
        )}
      </Stack>
      {actions && (
        <Stack direction="row" spacing={1} alignItems="center">
          {actions}
        </Stack>
      )}
    </Stack>
  );
}
