import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import MuiTooltip from "@mui/material/Tooltip";
import { radii } from "../tokens";
import { ChampionIcon } from "./ChampionIcon";
import { Icon } from "./Icon";

export interface ChampionPickButtonProps {
  /** Le champion retenu ; absent, la case est vide et invite à choisir. */
  champion?: { name: string; iconUrl?: string | null } | null;
  label: string;
  onClick: () => void;
  size?: "small" | "large";
  /** Le sélecteur de cette case est ouvert. */
  active?: boolean;
}

const COTE = { small: 28, large: 56 } as const;

export function ChampionPickButton({
  champion,
  label,
  onClick,
  size = "large",
  active = false,
}: ChampionPickButtonProps) {
  return (
    <MuiTooltip title={label}>
      <ButtonBase
        onClick={onClick}
        aria-label={label}
        aria-expanded={active}
        sx={{
          borderRadius: `${radii.sm}px`,
          outline: active ? "2px solid" : "none",
          outlineColor: "primary.main",
          outlineOffset: "2px",
          "&:focus-visible": {
            outline: "2px solid",
            outlineColor: "primary.main",
          },
        }}
      >
        {champion ? (
          <ChampionIcon src={champion.iconUrl} name={champion.name} size={size} />
        ) : (
          <Box
            sx={{
              width: COTE[size],
              height: COTE[size],
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "1px dashed",
              borderColor: "divider",
              borderRadius: `${radii.sm}px`,
              color: "text.secondary",
            }}
          >
            <Icon name="add" size="small" />
          </Box>
        )}
      </ButtonBase>
    </MuiTooltip>
  );
}
