import MuiCheckbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";

export interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  "aria-label"?: string;
}

export function Checkbox({ checked, onChange, label, disabled = false, ...rest }: CheckboxProps) {
  const control = (
    <MuiCheckbox
      checked={checked}
      onChange={(event) => onChange(event.target.checked)}
      disabled={disabled}
      inputProps={{ "aria-label": rest["aria-label"] }}
      size="small"
    />
  );

  if (!label) {
    return control;
  }

  return <FormControlLabel control={control} label={label} disabled={disabled} />;
}
