import { type ReactNode } from "react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

export interface PageHeaderProps {
  title: string;
  eyebrow?: string;
  subtitle?: ReactNode;
  actions?: ReactNode;
}

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
          <Stack direction="row" spacing={1} alignItems="center">
            <Box sx={{ width: 18, height: 2, bgcolor: "primary.main", flexShrink: 0 }} />
            <Typography variant="overline" color="primary" lineHeight={1.6}>
              {eyebrow}
            </Typography>
          </Stack>
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
