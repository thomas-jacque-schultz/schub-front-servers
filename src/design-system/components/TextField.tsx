import { type ReactNode } from "react";
import MuiTextField from "@mui/material/TextField";

export interface TextFieldProps {
  label: string;
  value: string;
  /** Reçoit directement la valeur : un écran n'a pas à connaître `event.target.value`. */
  onChange?: (value: string) => void;
  name?: string;
  type?: "text" | "password" | "number" | "url";
  placeholder?: string;
  /** Message d'aide, ou message d'erreur quand `error` est vrai. */
  helperText?: ReactNode;
  error?: boolean;
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  fullWidth?: boolean;
  autoFocus?: boolean;
  multiline?: boolean;
  minRows?: number;
  /** Rend une liste déroulante ; les options sont passées en enfants. */
  select?: boolean;
  children?: ReactNode;
}

/**
 * Le champ de saisie.
 *
 * <p>Le libellé est obligatoire, et il n'y a pas de variante sans libellé : un champ dont le
 * seul indice est son `placeholder` disparaît pour un lecteur d'écran, et son sens disparaît
 * aussi pour tout le monde dès que le champ est rempli.</p>
 */
export function TextField({
  label,
  value,
  onChange,
  name,
  type = "text",
  placeholder,
  helperText,
  error = false,
  required = false,
  disabled = false,
  readOnly = false,
  fullWidth = true,
  autoFocus = false,
  multiline = false,
  minRows,
  select = false,
  children,
}: TextFieldProps) {
  return (
    <MuiTextField
      label={label}
      name={name}
      value={value}
      onChange={(event) => onChange?.(event.target.value)}
      type={type}
      placeholder={placeholder}
      helperText={helperText}
      error={error}
      required={required}
      disabled={disabled}
      fullWidth={fullWidth}
      autoFocus={autoFocus}
      multiline={multiline}
      minRows={minRows}
      select={select}
      slotProps={{ input: { readOnly } }}
    >
      {children}
    </MuiTextField>
  );
}
