import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import Typography from "@mui/material/Typography";
import { motion, radii, typographyTokens } from "../tokens";
import { Avatar } from "./Avatar";
import { ChampionIcon } from "./ChampionIcon";

export interface ChampionSlotProps {
  championName: string;
  championIcon?: string | null;
  /** Le joueur qui l'a pris ; absent pour un adversaire, dont le nom n'apporte rien. */
  playerName?: string | null;
  playerAvatar?: string | null;
  /** Une donnée courte sous l'icône : K/D/A, écart. */
  caption?: string;
  size?: "small" | "medium";
  framed?: boolean;
  /** Rend l'emplacement cliquable ; l'étiquette dit ce que le clic ouvre. */
  onClick?: () => void;
  ariaLabel?: string;
}

// Le champion d'abord, le joueur en pastille : c'est le champion qu'on reconnaît d'un coup d'œil.
export function ChampionSlot({
  championName,
  championIcon,
  playerName,
  playerAvatar,
  caption,
  size = "medium",
  framed = true,
  onClick,
  ariaLabel,
}: ChampionSlotProps) {
  const contenu = (
    <>
      <Box sx={{ position: "relative" }}>
        <ChampionIcon src={championIcon} name={championName} size={size} />
        {playerName && (
          <Box sx={{ position: "absolute", right: -6, bottom: -6 }}>
            <Avatar src={playerAvatar} name={playerName} size="small" />
          </Box>
        )}
      </Box>
      {caption && (
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{
            fontFamily: typographyTokens.monospaceFontFamily,
            fontVariantNumeric: "tabular-nums",
            mt: playerName ? 0.5 : 0,
          }}
        >
          {caption}
        </Typography>
      )}
    </>
  );
  const sx = {
    display: "inline-flex",
    flexDirection: "column" as const,
    alignItems: "center",
    gap: 0.25,
    p: framed || onClick ? 0.5 : 0,
    border: framed ? "1px solid" : "none",
    borderColor: "divider",
    borderRadius: `${radii.sm}px`,
    minWidth: size === "small" ? 40 : 56,
  };

  if (!onClick) {
    return <Box sx={sx}>{contenu}</Box>;
  }
  return (
    <ButtonBase
      onClick={onClick}
      aria-label={ariaLabel}
      sx={{
        ...sx,
        transition: `border-color ${motion.fast}ms`,
        "&:hover, &.Mui-focusVisible": {
          borderColor: "primary.main",
          bgcolor: "action.hover",
        },
      }}
    >
      {contenu}
    </ButtonBase>
  );
}
