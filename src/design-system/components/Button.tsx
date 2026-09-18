import { type ReactNode } from "react";
import CircularProgress from "@mui/material/CircularProgress";
import MuiButton from "@mui/material/Button";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "small" | "medium" | "large";

export interface ButtonProps {
  children: ReactNode;
  /** `primary` pour l'action principale d'un écran, une seule à la fois. */
  variant?: ButtonVariant;
  size?: ButtonSize;
  type?: "button" | "submit";
  disabled?: boolean;
  /** Affiche un indicateur et bloque le bouton : à préférer à un `disabled` muet. */
  loading?: boolean;
  fullWidth?: boolean;
  startIcon?: ReactNode;
  endIcon?: ReactNode;
  onClick?: () => void;
  /** Rappel d'accessibilité : obligatoire quand le libellé ne suffit pas à comprendre l'action. */
  "aria-label"?: string;
}

const MUI_VARIANT: Record<ButtonVariant, "contained" | "outlined" | "text"> = {
  primary: "contained",
  secondary: "outlined",
  ghost: "text",
  danger: "contained",
};

/**
 * Le bouton de l'application.
 *
 * <p>Quatre intentions nommées plutôt que le couple `variant`/`color` de MUI : un écran déclare
 * ce que le bouton *fait*, pas comment il est peint. C'est ce qui permet de redessiner tous les
 * boutons dangereux d'un coup, ici, sans rouvrir les écrans.</p>
 */
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
