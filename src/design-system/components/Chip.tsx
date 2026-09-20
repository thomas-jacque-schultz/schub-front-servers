import { type ReactNode } from "react";
import MuiChip from "@mui/material/Chip";

export type ChipTone = "neutral" | "primary" | "secondary" | "success" | "warning" | "error";

export interface ChipProps {
  label: string;
  /** L'intention, pas la couleur : `neutral` pour une simple étiquette de classement. */
  tone?: ChipTone;
  /** `outline` pour une étiquette qui ne doit pas peser autant qu'une pastille pleine. */
  variant?: "filled" | "outline";
  size?: "small" | "medium";
  /** Une icône du répertoire, posée à gauche du libellé. */
  icon?: ReactNode;
}

const TONE: Record<ChipTone, "default" | "primary" | "secondary" | "success" | "warning" | "error"> =
  {
    neutral: "default",
    primary: "primary",
    secondary: "secondary",
    success: "success",
    warning: "warning",
    error: "error",
  };

/**
 * L'étiquette : un compte, une origine, un état qui n'est pas celui d'un serveur.
 *
 * <p>À ne pas confondre avec {@link StatusChip}, qui est le cas particulier « statut d'un serveur
 * de jeu » et porte sa propre traduction. Celui-ci est générique et n'invente aucun libellé :
 * l'appelant lui donne un texte déjà traduit.</p>
 */
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
      icon={icon ? <>{icon}</> : undefined}
    />
  );
}
