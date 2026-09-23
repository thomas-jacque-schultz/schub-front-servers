import FormControlLabel from "@mui/material/FormControlLabel";
import MuiSwitch from "@mui/material/Switch";

export interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  helperText?: string;
  disabled?: boolean;
}

export function Switch({ checked, onChange, label, helperText, disabled = false }: SwitchProps) {
  return (
    <FormControlLabel
      control={
        <MuiSwitch
          checked={checked}
          onChange={(event) => onChange(event.target.checked)}
          disabled={disabled}
        />
      }
      label={helperText ? `${label} — ${helperText}` : label}
      disabled={disabled}
    />
  );
}
