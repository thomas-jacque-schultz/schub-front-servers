import MuiAvatar from "@mui/material/Avatar";

export interface AvatarProps {
  /** L'URL de l'image ; absente, les initiales du nom prennent le relais. */
  src?: string | null;
  /** Le nom affiché à côté : il sert d'alternative textuelle et d'initiales. */
  name: string;
  size?: "small" | "medium";
}

const SIZE = { small: 24, medium: 32 } as const;

const initialsOf = (name: string): string =>
  name
    .split(/[\s._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

/**
 * Le portrait d'un compte.
 *
 * <p>L'image est décorative : le nom est **toujours** affiché à côté par l'appelant, et
 * l'alternative textuelle reprend ce nom plutôt que de le répéter à un lecteur d'écran. Sans
 * image, les initiales évitent le trou gris qui laisse croire à un chargement en cours.</p>
 */
export function Avatar({ src, name, size = "medium" }: AvatarProps) {
  return (
    <MuiAvatar
      src={src ?? undefined}
      alt=""
      aria-hidden
      sx={{ width: SIZE[size], height: SIZE[size], fontSize: size === "small" ? 11 : 13 }}
    >
      {initialsOf(name)}
    </MuiAvatar>
  );
}
