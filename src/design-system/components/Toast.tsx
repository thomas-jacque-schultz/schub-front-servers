import MuiAlert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";
import { type AlertSeverity } from "./Alert";

export interface ToastProps {
  open: boolean;
  message: string;
  severity?: AlertSeverity;
  onClose: () => void;
  /** Durée d'affichage. Les messages d'erreur restent plus longtemps que les confirmations. */
  autoHideMs?: number;
}

/**
 * La notification passagère : ce qui vient de se produire, sans interrompre.
 *
 * <p>Elle ne remplace pas {@link import("./Alert").Alert} : un message qui disparaît ne convient
 * qu'à une information qu'on peut manquer sans conséquence — « rôle enregistré ». Une erreur
 * qu'il faut corriger reste sur l'écran, dans un `Alert`.</p>
 *
 * <p>`role="status"` et non `alert` : le message est annoncé sans couper la lecture en cours.</p>
 */
export function Toast({ open, message, severity = "success", onClose, autoHideMs = 4000 }: ToastProps) {
  return (
    <Snackbar
      open={open}
      autoHideDuration={autoHideMs}
      onClose={onClose}
      anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
    >
      <MuiAlert severity={severity} variant="filled" onClose={onClose} role="status">
        {message}
      </MuiAlert>
    </Snackbar>
  );
}
