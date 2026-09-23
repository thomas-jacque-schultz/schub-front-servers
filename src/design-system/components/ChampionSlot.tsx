import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { radii, typographyTokens } from "../tokens";
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
}: ChampionSlotProps) {
  return (
    <Box
      sx={{
        display: "inline-flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 0.25,
        p: framed ? 0.5 : 0,
        border: framed ? "1px solid" : "none",
        borderColor: "divider",
        borderRadius: `${radii.sm}px`,
        minWidth: size === "small" ? 40 : 56,
      }}
    >
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
          sx={{ fontFamily: typographyTokens.monospaceFontFamily, fontVariantNumeric: "tabular-nums", mt: playerName ? 0.5 : 0 }}
        >
          {caption}
        </Typography>
      )}
    </Box>
  );
}
