import { type ReactNode } from "react";
import MuiAlert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";

export type AlertSeverity = "info" | "success" | "warning" | "error";

export interface AlertProps {
  severity?: AlertSeverity;
  title?: string;
  children: ReactNode;
  onClose?: () => void;
}

export function Alert({ severity = "info", title, children, onClose }: AlertProps) {
  return (
    <MuiAlert severity={severity} onClose={onClose} variant="outlined">
      {title && <AlertTitle>{title}</AlertTitle>}
      {children}
    </MuiAlert>
  );
}
