import MuiIconButton from "@mui/material/IconButton";
import { Icon, type IconName } from "./Icon";
import { Spinner } from "./Spinner";
import { Tooltip } from "./Tooltip";

export interface IconButtonProps {
  /** L'icône, par son nom dans le répertoire du design system. */
  icon: IconName;
  /**
   * Ce que fait le bouton. **Obligatoire** : il sert d'infobulle et d'`aria-label`, et un bouton
   * qui n'affiche qu'un dessin est muet sans lui.
   */
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  /** Remplace l'icône par un indicateur et bloque le bouton. */
  loading?: boolean;
  size?: "small" | "medium";
  /** Peint le bouton en rouge : à réserver à ce qui détruit. */
  destructive?: boolean;
}

/**
 * Le bouton réduit à son icône — pour les actions répétées d'une ligne de tableau, où un libellé
 * complet multiplierait la largeur par trois.
 *
 * <p>Il impose son `label` plutôt que de le proposer : c'est la seule différence qui sépare un
 * bouton accessible d'un pictogramme décoratif que personne ne peut activer au clavier.</p>
 */
export function IconButton({
  icon,
  label,
  onClick,
  disabled = false,
  loading = false,
  size = "medium",
  destructive = false,
}: IconButtonProps) {
  return (
    <Tooltip title={label}>
      <MuiIconButton
        aria-label={label}
        onClick={onClick}
        disabled={disabled || loading}
        size={size}
        color={destructive ? "error" : "default"}
        aria-busy={loading || undefined}
      >
        {loading ? <Spinner size="small" label={label} /> : <Icon name={icon} size={size} />}
      </MuiIconButton>
    </Tooltip>
  );
}
