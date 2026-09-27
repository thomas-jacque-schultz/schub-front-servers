import type { ReactNode } from "react";
import { LocalizedNavigate } from "../i18n/LocalizedNavigate";
import { useAuthStore } from "../stores/authStore";
import type { Permission } from "../types/permission";

interface GuardProps {
  children: ReactNode;
}

/** Commun à Schub et aux applications : une URL se tape à la main, la route redit la condition du menu. */
export function RequireAuth({ children }: GuardProps) {
  const { connected } = useAuthStore();
  return connected ? (
    <>{children}</>
  ) : (
    <LocalizedNavigate to="/login" replace />
  );
}

export function RequirePermission({
  anyOf,
  children,
}: GuardProps & { anyOf: Permission[] }) {
  const { connected, canAny } = useAuthStore();

  if (!connected) {
    return <LocalizedNavigate to="/login" replace />;
  }

  return canAny(...anyOf) ? (
    <>{children}</>
  ) : (
    <LocalizedNavigate to="/" replace />
  );
}
