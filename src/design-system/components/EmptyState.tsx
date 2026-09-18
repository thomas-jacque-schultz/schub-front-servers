import { type ReactNode } from "react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

export interface EmptyStateProps {
  title: string;
  /** Ce que l'utilisateur peut faire pour que la liste ne soit plus vide. */
  description?: string;
  /** Illustration ou icône, purement décorative : elle est masquée aux lecteurs d'écran. */
  icon?: ReactNode;
  /** Une action, au plus : un vide n'appelle qu'un geste. */
  action?: ReactNode;
}

/**
 * Le vide, dit correctement.
 *
 * <p>Une liste vide sans explication se lit comme une panne. Ce composant existe pour qu'une
 * absence de données annonce toujours ce qu'elle est et ce qu'on peut y faire.</p>
 */
export function EmptyState({ title, description, icon, action }: EmptyStateProps) {
  return (
    <Stack spacing={1.5} alignItems="center" sx={{ py: 5, px: 3, textAlign: "center" }}>
      {icon && (
        <Box aria-hidden sx={{ color: "text.disabled", display: "flex", fontSize: 40 }}>
          {icon}
        </Box>
      )}
      <Typography variant="h6" component="p">
        {title}
      </Typography>
      {description && (
        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 420 }}>
          {description}
        </Typography>
      )}
      {action}
    </Stack>
  );
}
