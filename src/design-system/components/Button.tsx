import { type ReactNode } from "react";
import CircularProgress from "@mui/material/CircularProgress";
import MuiButton from "@mui/material/Button";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "small" | "medium" | "large";

export interface ButtonProps {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  type?: "button" | "submit";
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  startIcon?: ReactNode;
  endIcon?: ReactNode;
  onClick?: () => void;
  "aria-label"?: string;
}

const MUI_VARIANT: Record<ButtonVariant, "contained" | "outlined" | "text"> = {
  primary: "contained",
  secondary: "outlined",
  ghost: "text",
  danger: "contained",
};

export function Button({
  children,
  variant = "primary",
  size = "medium",
  type = "button",
  disabled = false,
  loading = false,
  fullWidth = false,
  startIcon,
  endIcon,
  onClick,
  ...rest
}: ButtonProps) {
  return (
    <MuiButton
      type={type}
      variant={MUI_VARIANT[variant]}
      color={variant === "danger" ? "error" : variant === "secondary" ? "inherit" : "primary"}
      size={size}
      disabled={disabled || loading}
      fullWidth={fullWidth}
      onClick={onClick}
      startIcon={loading ? <CircularProgress size={16} color="inherit" /> : startIcon}
      endIcon={endIcon}
      aria-busy={loading || undefined}
      aria-label={rest["aria-label"]}
    >
      {children}
    </MuiButton>
  );
}
