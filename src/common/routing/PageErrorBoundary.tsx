import { Component, type ErrorInfo, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";
import { Button, Card, EmptyState } from "../design-system";

function PageErrorFallback() {
  const { t } = useTranslation();

  return (
    <Card>
      <EmptyState
        title={t("pageError.title")}
        description={t("pageError.description")}
        action={
          <Button onClick={() => window.location.reload()}>
            {t("pageError.reload")}
          </Button>
        }
      />
    </Card>
  );
}

interface BoundaryProps {
  children: ReactNode;
}

interface BoundaryState {
  failed: boolean;
}

class Boundary extends Component<BoundaryProps, BoundaryState> {
  state: BoundaryState = { failed: false };

  static getDerivedStateFromError(): BoundaryState {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(error, info.componentStack);
  }

  render() {
    return this.state.failed ? <PageErrorFallback /> : this.props.children;
  }
}

/**
 * Une page qui plante ne blanchit plus tout le site : l'en-tête et la navigation restent, et changer
 * d'adresse donne une nouvelle chance à la page suivante.
 */
export function PageErrorBoundary({ children }: BoundaryProps) {
  const { pathname } = useLocation();
  return <Boundary key={pathname}>{children}</Boundary>;
}
