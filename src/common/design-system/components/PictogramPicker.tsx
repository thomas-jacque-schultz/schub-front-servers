import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import MuiTooltip from "@mui/material/Tooltip";

export interface PictogramOption {
  value: string;
  name: string;
  src: string;
}

export interface PictogramPickerProps {
  label: string;
  options: readonly PictogramOption[];
  /** null : aucun des pictogrammes de ce groupe n'est choisi. */
  value: string | null;
  onChange: (value: string) => void;
}

/** Un pictogramme à choisir dans un groupe : balise, objectif, ping (Schub#170). */
export function PictogramPicker({
  label,
  options,
  value,
  onChange,
}: PictogramPickerProps) {
  return (
    <Box
      role="radiogroup"
      aria-label={label}
      sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}
    >
      {options.map((option) => (
        <MuiTooltip key={option.value} title={option.name}>
          <ButtonBase
            role="radio"
            aria-checked={option.value === value}
            aria-label={option.name}
            onClick={() => onChange(option.value)}
            sx={{
              width: 40,
              height: 40,
              borderRadius: 1,
              border: "2px solid",
              borderColor:
                option.value === value ? "primary.main" : "transparent",
              bgcolor: "action.hover",
              "&:focus-visible": {
                outline: "2px solid",
                outlineColor: "primary.main",
                outlineOffset: 2,
              },
            }}
          >
            <Box
              component="img"
              src={option.src}
              alt=""
              sx={{ width: 28, height: 28, objectFit: "contain" }}
            />
          </ButtonBase>
        </MuiTooltip>
      ))}
    </Box>
  );
}
