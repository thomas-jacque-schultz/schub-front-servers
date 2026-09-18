import FormControlLabel from "@mui/material/FormControlLabel";
import MuiSwitch from "@mui/material/Switch";

export interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  /** Précise l'effet de la bascule quand le libellé seul est ambigu. */
  helperText?: string;
  disabled?: boolean;
}

/**
 * La bascule : un réglage qui prend effet tout de suite.
 *
 * <p>C'est ce qui la distingue d'une case à cocher, qui attend un enregistrement. Le libellé est
 * obligatoire et s'écrit à l'état, pas à l'action — « Notifications activées », pas
 * « Activer » — sinon on ne sait plus si on lit l'état courant ou le bouton qui le change.</p>
 */
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
