import { type ReactNode } from "react";
import Container from "@mui/material/Container";

export interface PageContainerProps {
  children: ReactNode;
  /** sm : un formulaire seul (le pseudo d'un mini-jeu) ; lg : un écran de jeu. */
  width?: "sm" | "md" | "lg";
}

/** Le cadre d'une page hors de la coquille : un mini-jeu ouvert seul ou dans l'iframe de PremadeLab. */
export function PageContainer({ children, width = "lg" }: PageContainerProps) {
  return (
    <Container maxWidth={width} sx={{ py: 1.5 }}>
      {children}
    </Container>
  );
}
