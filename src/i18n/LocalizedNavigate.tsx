import { Navigate } from "react-router-dom";
import { useLocalizedPath } from "./navigation";

/**
 * `<Navigate>` qui reste dans la langue courante — l'équivalent déclaratif de
 * `useLocalizedNavigate`, pour les redirections écrites dans les gardes de routes.
 */
export function LocalizedNavigate({ to, replace = false }: { to: string; replace?: boolean }) {
  const localize = useLocalizedPath();
  return <Navigate to={localize(to)} replace={replace} />;
}
