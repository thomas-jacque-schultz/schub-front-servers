import MuiAvatar from "@mui/material/Avatar";

export interface AvatarProps {
  src?: string | null;
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
