import { type ReactNode } from "react";
import MuiTooltip from "@mui/material/Tooltip";

export interface TooltipProps {
  /** Le texte affiché au survol et au focus clavier. Vide, l'infobulle ne s'affiche pas. */
  title: string;
  children: ReactNode;
  placement?: "top" | "bottom" | "left" | "right";
}

/**
 * L'infobulle.
 *
 * <p>Elle enveloppe son contenu dans un `span` : un élément désactivé n'émet pas d'événement de
 * survol, et sans cette enveloppe l'infobulle d'un bouton grisé ne s'afficherait jamais — or
 * c'est précisément le cas où elle est la plus utile, puisqu'elle explique le refus.</p>
 *
 * <p>Ce n'est pas un support d'information essentielle : ce qu'on ne peut lire qu'au survol
 * n'existe ni au doigt ni au lecteur d'écran. Une infobulle précise, elle ne remplace pas.</p>
 */
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
