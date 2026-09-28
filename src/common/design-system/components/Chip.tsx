import { type ReactNode } from "react";
import Box from "@mui/material/Box";
import MuiChip from "@mui/material/Chip";

export type ChipTone =
  "neutral" | "primary" | "secondary" | "success" | "warning" | "error";

export interface ChipProps {
  label: string;
  tone?: ChipTone;
  variant?: "filled" | "outline";
  size?: "small" | "medium";
  icon?: ReactNode;
}

const TONE: Record<
  ChipTone,
  "default" | "primary" | "secondary" | "success" | "warning" | "error"
> = {
  neutral: "default",
  primary: "primary",
  secondary: "secondary",
  success: "success",
  warning: "warning",
  error: "error",
};

export function Chip({
  label,
  tone = "neutral",
  variant = "filled",
  size = "small",
  icon,
}: ChipProps) {
  return (
    <MuiChip
      label={label}
      color={TONE[tone]}
      variant={variant === "outline" ? "outlined" : "filled"}
      size={size}
      // MUI pose sa classe d'icône sur cet élément : un fragment la refusait, et l'icône perdait marge et couleur.
      icon={
        icon ? (
          <Box component="span" sx={{ display: "inline-flex" }}>
            {icon}
          </Box>
        ) : undefined
      }
    />
  );
}
