import Box from "@mui/material/Box";
import Tooltip from "@mui/material/Tooltip";
import { radii } from "../tokens";

export interface ChampionIconProps {
  /** L'URL absolue et déjà versionnée servie par le cœur, ou `null` hors catalogue. */
  src?: string | null;
  /**
   * Le nom du champion. Il **n'est pas décoratif** : c'est l'alternative textuelle de l'icône et
   * l'infobulle. Une grille d'icônes sans nom n'est lisible que par qui les connaît déjà.
   */
  name: string;
  size?: "small" | "medium" | "large";
  /** Retiré du pool : l'icône se lit comme non retenue, sans disparaître. */
  dimmed?: boolean;
  /** Entouré : retenu à ce poste. */
  selected?: boolean;
}

const TAILLES: Record<NonNullable<ChampionIconProps["size"]>, number> = {
  small: 28,
  medium: 40,
  large: 56,
};

/**
 * L'icône d'un champion.
 *
 * <p>Sans URL — un champion sorti après le patch servi —, les premières lettres de son nom
 * tiennent la place. Le cadre garde la même taille : une grille qui se déforme sur un champion
 * manquant se lit comme cassée.</p>
 */
export function ChampionIcon({
  src,
  name,
  size = "medium",
  dimmed = false,
  selected = false,
}: ChampionIconProps) {
  const cote = TAILLES[size];

  const cadre = {
    width: cote,
    height: cote,
    borderRadius: `${radii.sm}px`,
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    opacity: dimmed ? 0.35 : 1,
    outline: selected ? "2px solid" : "none",
    outlineColor: "primary.main",
    outlineOffset: "1px",
    bgcolor: "action.hover",
    fontSize: cote / 2.6,
    fontWeight: 700,
    transition: "opacity 120ms ease",
  };

  return (
    <Tooltip title={name}>
      {src ? (
        <Box component="img" src={src} alt={name} loading="lazy" sx={cadre} />
      ) : (
        <Box component="span" role="img" aria-label={name} sx={cadre}>
          {name.slice(0, 2)}
        </Box>
      )}
    </Tooltip>
  );
}
