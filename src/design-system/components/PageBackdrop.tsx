import { type ReactNode } from "react";
import Box from "@mui/material/Box";
import { backdropSx, gridOverlaySx } from "../theme";

export interface PageBackdropProps {
  variant?: "page" | "panel";
  centered?: boolean;
  children: ReactNode;
}

export function PageBackdrop({ variant = "page", centered = false, children }: PageBackdropProps) {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        position: "relative",
        display: "flex",
        flexDirection: "column",
        justifyContent: centered ? "center" : "flex-start",
        py: { xs: 3, md: 4 },
        ...backdropSx[variant],
        ...(variant === "page" ? { "&::before": gridOverlaySx } : {}),
      }}
    >
      {children}
    </Box>
  );
}
