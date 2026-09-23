import { type ReactNode } from "react";
import MuiTooltip from "@mui/material/Tooltip";

export interface TooltipProps {
  title: string;
  children: ReactNode;
  placement?: "top" | "bottom" | "left" | "right";
}

// Enveloppe span : un élément désactivé n'émet pas d'événement de survol.
export function Tooltip({ title, children, placement = "top" }: TooltipProps) {
  if (!title) {
    return <>{children}</>;
  }

  return (
    <MuiTooltip title={title} placement={placement}>
      <span style={{ display: "inline-flex" }}>{children}</span>
    </MuiTooltip>
  );
}
