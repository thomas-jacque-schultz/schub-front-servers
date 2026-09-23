import { type ReactNode } from "react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

export interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
}

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
