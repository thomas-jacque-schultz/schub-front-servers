import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import MuiTooltip from "@mui/material/Tooltip";
import { Avatar } from "./Avatar";

export interface AvatarSelectOption {
  value: string;
  name: string;
  src?: string | null;
  /** Infobulle ; le nom seul si absente. */
  hint?: string;
  /** Déjà retenu ailleurs : grisé, mais un clic le déplace ici. */
  taken?: boolean;
}

export interface AvatarSelectProps {
  label: string;
  options: AvatarSelectOption[];
  value: string | null;
  onChange: (value: string | null) => void;
}

// Choix unique. Recliquer sur l'élu le retire : « personne » est un choix légitime.
export function AvatarSelect({ label, options, value, onChange }: AvatarSelectProps) {
  return (
    <Box role="radiogroup" aria-label={label} sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
      {options.map((option) => {
        const elu = option.value === value;
        return (
          <MuiTooltip key={option.value} title={option.hint ?? option.name}>
            <ButtonBase
              role="radio"
              aria-checked={elu}
              aria-label={option.hint ?? option.name}
              onClick={() => onChange(elu ? null : option.value)}
              sx={{
                borderRadius: "50%",
                p: "2px",
                border: "2px solid",
                borderColor: elu ? "primary.main" : "transparent",
                opacity: option.taken && !elu ? 0.35 : 1,
                filter: option.taken && !elu ? "grayscale(1)" : "none",
                transition: "opacity 120ms, border-color 120ms",
                "&:focus-visible": {
                  outline: "2px solid",
                  outlineColor: "primary.main",
                  outlineOffset: 2,
                },
              }}
            >
              <Avatar src={option.src} name={option.name} />
            </ButtonBase>
          </MuiTooltip>
        );
      })}
    </Box>
  );
}
