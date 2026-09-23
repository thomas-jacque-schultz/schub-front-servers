import { type ReactNode } from "react";
import MuiTextField from "@mui/material/TextField";

export interface TextFieldProps {
  label: string;
  value: string;
  onChange?: (value: string) => void;
  name?: string;
  type?: "text" | "password" | "number" | "url";
  placeholder?: string;
  helperText?: ReactNode;
  error?: boolean;
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  fullWidth?: boolean;
  autoFocus?: boolean;
  multiline?: boolean;
  minRows?: number;
  select?: boolean;
  children?: ReactNode;
}

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
