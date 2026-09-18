import FormControl from "@mui/material/FormControl";
import FormHelperText from "@mui/material/FormHelperText";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import { type ReactNode, useId } from "react";

export interface SelectOption {
  value: string;
  label: string;
  /** Une option qu'on montre sans la proposer : le refus s'explique alors dans `helperText`. */
  disabled?: boolean;
}

export interface SelectFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  helperText?: ReactNode;
  error?: boolean;
  disabled?: boolean;
  required?: boolean;
  fullWidth?: boolean;
  size?: "small" | "medium";
}

/**
 * La liste déroulante à choix unique.
 *
 * <p>Les options sont **données**, pas passées en enfants : c'est ce qui évite qu'un écran ait
 * besoin du `MenuItem` de MUI, donc d'un import interdit. Une option indisponible se désactive
 * plutôt que de disparaître, quand son absence serait inexplicable pour qui la cherche.</p>
 */
export function SelectField({
  label,
  value,
  onChange,
  options,
  helperText,
  error = false,
  disabled = false,
  required = false,
  fullWidth = true,
  size = "medium",
}: SelectFieldProps) {
  const labelId = useId();

  return (
    <FormControl fullWidth={fullWidth} error={error} disabled={disabled} required={required} size={size}>
      <InputLabel id={labelId}>{label}</InputLabel>
      <Select
        labelId={labelId}
        label={label}
        value={value}
        onChange={(event) => onChange(String(event.target.value))}
      >
        {options.map((option) => (
          <MenuItem key={option.value} value={option.value} disabled={option.disabled}>
            {option.label}
          </MenuItem>
        ))}
      </Select>
      {helperText && <FormHelperText>{helperText}</FormHelperText>}
    </FormControl>
  );
}
