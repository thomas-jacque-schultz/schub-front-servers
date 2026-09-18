import { type ReactNode } from "react";
import MuiAlert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";

export type AlertSeverity = "info" | "success" | "warning" | "error";

export interface AlertProps {
  severity?: AlertSeverity;
  title?: string;
  children: ReactNode;
  /** Affiche la croix de fermeture. Sans rappel, le message reste tant que la cause dure. */
  onClose?: () => void;
}

/**
 * Le message d'état d'un écran : ce qui a échoué, ce qui manque, ce qui vient de réussir.
 *
 * <p>Quatre niveaux et pas un de plus. La distinction qui compte est celle entre `warning` — ça
 * marche encore, mais amputé — et `error` — ça n'a pas eu lieu ; les confondre apprend au
 * lecteur à ignorer les deux.</p>
 */
export function Alert({ severity = "info", title, children, onClose }: AlertProps) {
  return (
    <MuiAlert severity={severity} onClose={onClose} variant="outlined">
      {title && <AlertTitle>{title}</AlertTitle>}
      {children}
    </MuiAlert>
  );
}
