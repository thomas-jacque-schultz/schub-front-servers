import { type ReactNode } from "react";
import MuiLink from "@mui/material/Link";
import { Link as RouterLink } from "react-router-dom";
import { Icon } from "./Icon";

export interface LinkProps {
  /** Chemin interne **déjà localisé**, ou URL absolue pour une destination extérieure. */
  href: string;
  children: ReactNode;
  /**
   * `external` ouvre dans un nouvel onglet, avec `rel="noopener noreferrer"` et une icône qui
   * l'annonce. Déduit de l'adresse quand il n'est pas précisé : ce qui commence par `http` sort
   * du site.
   */
  external?: boolean;
  tone?: "default" | "muted";
}

/**
 * Le lien.
 *
 * <p>Il existe pour une raison précise : un lien interne doit passer par le routeur (sans quoi
 * chaque clic recharge toute l'application), et un lien sortant doit porter `noopener` — deux
 * règles que personne ne retient à chaque appel. Le composant les tient à la place des écrans.</p>
 *
 * <p>L'icône de sortie n'est pas décorative : elle prévient qu'un onglet va s'ouvrir, ce qui est
 * la seule chose qui rend ce comportement acceptable.</p>
 */
export function Link({ href, children, external, tone = "default" }: LinkProps) {
  const goesOutside = external ?? /^https?:\/\//.test(href);

  if (goesOutside) {
    return (
      <MuiLink
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        underline="hover"
        color={tone === "muted" ? "text.secondary" : "primary.main"}
      >
        {children} <Icon name="external" size="small" />
      </MuiLink>
    );
  }

  return (
    <MuiLink
      component={RouterLink}
      to={href}
      underline="hover"
      color={tone === "muted" ? "text.secondary" : "primary.main"}
    >
      {children}
    </MuiLink>
  );
}
