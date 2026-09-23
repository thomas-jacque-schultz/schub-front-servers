import MuiIconButton from "@mui/material/IconButton";
import { Icon, type IconName } from "./Icon";
import { Spinner } from "./Spinner";
import { Tooltip } from "./Tooltip";

export interface IconButtonProps {
  icon: IconName;
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  size?: "small" | "medium";
  destructive?: boolean;
}

export function IconButton({
  icon,
  label,
  onClick,
  disabled = false,
  loading = false,
  size = "medium",
  destructive = false,
}: IconButtonProps) {
  return (
    <Tooltip title={label}>
      <MuiIconButton
        aria-label={label}
        onClick={onClick}
        disabled={disabled || loading}
        size={size}
        color={destructive ? "error" : "default"}
        aria-busy={loading || undefined}
      >
        {loading ? <Spinner size="small" label={label} /> : <Icon name={icon} size={size} />}
      </MuiIconButton>
    </Tooltip>
  );
}
