import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import MuiTooltip from "@mui/material/Tooltip";
import { Avatar } from "./Avatar";

export interface AvatarToggleOption {
  value: string;
  name: string;
  src?: string | null;
}

export interface AvatarToggleGroupProps {
  label: string;
  options: AvatarToggleOption[];
  values: string[];
  onChange: (values: string[]) => void;
}

// Aucun choix n'est un choix : tout décocher revient à tout montrer, pas à un écran vide.
export function AvatarToggleGroup({ label, options, values, onChange }: AvatarToggleGroupProps) {
  const bascule = (value: string) =>
    onChange(values.includes(value) ? values.filter((v) => v !== value) : [...values, value]);

  return (
    <Box role="group" aria-label={label} sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
      {options.map((option) => {
        const actif = values.length === 0 || values.includes(option.value);
        return (
          <MuiTooltip key={option.value} title={option.name}>
            <ButtonBase
              aria-pressed={values.includes(option.value)}
              aria-label={option.name}
              onClick={() => bascule(option.value)}
              sx={{
                borderRadius: "50%",
                p: "2px",
                border: "2px solid",
                borderColor: values.includes(option.value) ? "primary.main" : "transparent",
                opacity: actif ? 1 : 0.4,
                transition: "opacity 120ms, border-color 120ms",
                "&:focus-visible": { outline: "2px solid", outlineColor: "primary.main", outlineOffset: 2 },
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
