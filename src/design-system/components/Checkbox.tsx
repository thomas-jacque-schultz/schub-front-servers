import MuiCheckbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";

export interface CheckboxProps {
  checked: boolean;
  /** Reçoit la valeur suivante : un écran n'a pas à connaître `event.target.checked`. */
  onChange: (checked: boolean) => void;
  /** Le libellé visible. Absent, `aria-label` devient obligatoire. */
  label?: string;
  disabled?: boolean;
  "aria-label"?: string;
}

/**
 * La case à cocher.
 *
 * <p>Sans libellé visible — le cas d'une matrice où l'en-tête de colonne porte le sens — un
 * `aria-label` doit être fourni : une case nue est illisible au lecteur d'écran, qui n'a pas la
 * grille sous les yeux.</p>
 */
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
