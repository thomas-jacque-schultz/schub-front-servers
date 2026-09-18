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
  /** Ce que l'action va faire, en une phrase. Une confirmation sans énoncé ne confirme rien. */
  description?: ReactNode;
  children?: ReactNode;
  confirmLabel?: string;
  cancelLabel: string;
  onConfirm?: () => void;
  onClose: () => void;
  confirmDisabled?: boolean;
  confirmLoading?: boolean;
  /** Peint l'action en rouge : à réserver à ce qui détruit ou retire un droit. */
  destructive?: boolean;
  maxWidth?: "xs" | "sm" | "md";
}

/**
 * La boîte de dialogue : une question, et deux réponses.
 *
 * <p>Le bouton d'annulation est **obligatoire** et son libellé aussi : une modale sans sortie
 * visible est un piège, et la croix seule ne se voit pas au clavier.</p>
 */
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
