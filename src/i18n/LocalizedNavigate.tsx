import { Navigate } from "react-router-dom";
import { useLocalizedPath } from "./navigation";

export function LocalizedNavigate({ to, replace = false }: { to: string; replace?: boolean }) {
  const localize = useLocalizedPath();
  return <Navigate to={localize(to)} replace={replace} />;
}
