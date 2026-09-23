import MuiAlert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";
import { type AlertSeverity } from "./Alert";

export interface ToastProps {
  open: boolean;
  message: string;
  severity?: AlertSeverity;
  onClose: () => void;
  autoHideMs?: number;
}

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
