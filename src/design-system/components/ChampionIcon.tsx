import Box from "@mui/material/Box";
import Tooltip from "@mui/material/Tooltip";
import { radii } from "../tokens";

export interface ChampionIconProps {
  src?: string | null;
  name: string;
  size?: "small" | "medium" | "large";
  dimmed?: boolean;
  selected?: boolean;
}

const TAILLES: Record<NonNullable<ChampionIconProps["size"]>, number> = {
  small: 28,
  medium: 40,
  large: 56,
};

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
