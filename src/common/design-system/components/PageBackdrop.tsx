import { type ReactNode } from "react";
import Box from "@mui/material/Box";
import { useIdentity } from "../identity";
import { backdropSxOf, gridOverlaySxOf } from "../theme";

export interface PageBackdropProps {
  variant?: "page" | "panel";
  centered?: boolean;
  children: ReactNode;
}

export function PageBackdrop({
  variant = "page",
  centered = false,
  children,
}: PageBackdropProps) {
  const identity = useIdentity();
  return (
    <Box
      sx={{
        minHeight: "100vh",
        position: "relative",
        display: "flex",
        flexDirection: "column",
        justifyContent: centered ? "center" : "flex-start",
        py: { xs: 3, md: 4 },
        ...backdropSxOf(identity)[variant],
        ...(variant === "page"
          ? { "&::before": gridOverlaySxOf(identity) }
          : {}),
      }}
    >
      {children}
    </Box>
  );
}
