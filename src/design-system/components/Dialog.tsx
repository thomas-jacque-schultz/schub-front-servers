import { type ReactNode } from "react";
import MuiDialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import { Button } from "./Button";

export interface DialogProps {
  open: boolean;
  title: string;
  description?: ReactNode;
  children?: ReactNode;
  confirmLabel?: string;
  cancelLabel: string;
  onConfirm?: () => void;
  onClose: () => void;
  confirmDisabled?: boolean;
  confirmLoading?: boolean;
  destructive?: boolean;
  maxWidth?: "xs" | "sm" | "md" | "lg";
}

export function Dialog({
  open,
  title,
  description,
  children,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onClose,
  confirmDisabled = false,
  confirmLoading = false,
  destructive = false,
  maxWidth = "sm",
}: DialogProps) {
  return (
    <MuiDialog open={open} onClose={onClose} fullWidth maxWidth={maxWidth}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        {description && <DialogContentText sx={{ mb: 2 }}>{description}</DialogContentText>}
        {children}
      </DialogContent>
      <DialogActions>
        <Button variant="ghost" onClick={onClose}>
          {cancelLabel}
        </Button>
        {confirmLabel && onConfirm && (
          <Button
            variant={destructive ? "danger" : "primary"}
            onClick={onConfirm}
            disabled={confirmDisabled}
            loading={confirmLoading}
          >
            {confirmLabel}
          </Button>
        )}
      </DialogActions>
    </MuiDialog>
  );
}
