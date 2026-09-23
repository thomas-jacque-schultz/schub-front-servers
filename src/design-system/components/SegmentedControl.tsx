import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";

export interface SegmentedControlOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SegmentedControlProps {
  label: string;
  options: SegmentedControlOption[];
  value: string;
  onChange: (value: string) => void;
}

export function SegmentedControl({ label, options, value, onChange }: SegmentedControlProps) {
  return (
    <ToggleButtonGroup
      exclusive
      size="small"
      aria-label={label}
      value={value}
      onChange={(_, choisi: string | null) => choisi && onChange(choisi)}
      sx={{ flexWrap: "wrap" }}
    >
      {options.map((option) => (
        <ToggleButton
          key={option.value}
          value={option.value}
          disabled={option.disabled}
          sx={{ textTransform: "none", py: 0.25, px: 1.25 }}
        >
          {option.label}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  );
}
