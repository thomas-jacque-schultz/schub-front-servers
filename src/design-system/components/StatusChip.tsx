import Chip from "@mui/material/Chip";
import { alpha } from "@mui/material/styles";
import { useTranslation } from "react-i18next";
import { type ServerStatusToken, statusColors } from "../tokens";

export interface StatusChipProps {
  status: ServerStatusToken;
  label?: string;
  size?: "small" | "medium";
}

export function StatusChip({ status, label, size = "medium" }: StatusChipProps) {
  const { t } = useTranslation();
  const text = label ?? t(`serverStatus.${status}`);

  return (
    <Chip
      size={size}
      label={text}
      variant="outlined"
      sx={(theme) => {
        const scheme = theme.palette.mode === "light" ? "light" : "dark";
        const color = statusColors[scheme][status];
        return {
          color,
          borderColor: alpha(color, 0.5),
          backgroundColor: alpha(color, 0.12),
          fontWeight: 600,
        };
      }}
    />
  );
}
