import Autocomplete from "@mui/material/Autocomplete";
import Chip from "@mui/material/Chip";
import MuiStack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { type ReactNode } from "react";
import { Avatar } from "./Avatar";

export interface MultiSelectOption {
  value: string;
  label: string;
  avatarUrl?: string | null;
  description?: string | null;
}

export interface MultiSelectProps {
  label: string;
  values: string[];
  onChange: (values: string[]) => void;
  options: MultiSelectOption[];
  helperText?: ReactNode;
  placeholder?: string;
  noOptionsText?: string;
  disabled?: boolean;
  error?: boolean;
}

export function MultiSelect({
  label,
  values,
  onChange,
  options,
  helperText,
  placeholder,
  noOptionsText,
  disabled = false,
  error = false,
}: MultiSelectProps) {
  const byValue = new Map(options.map((option) => [option.value, option]));
  const selected: MultiSelectOption[] = values.map(
    (value) => byValue.get(value) ?? { value, label: value },
  );

  return (
    <Autocomplete
      multiple
      disableCloseOnSelect
      disabled={disabled}
      options={options}
      value={selected}
      noOptionsText={noOptionsText}
      onChange={(_event, next) => onChange(next.map((option) => option.value))}
      getOptionLabel={(option) => option.label}
      isOptionEqualToValue={(option, candidate) => option.value === candidate.value}
      renderOption={(props, option) => {
        const { key, ...optionProps } = props as typeof props & { key: string };
        return (
          <li key={key} {...optionProps}>
            <MuiStack direction="row" spacing={1.5} alignItems="center">
              <Avatar src={option.avatarUrl} name={option.label} size="small" />
              <MuiStack spacing={0}>
                <Typography variant="body2">{option.label}</Typography>
                {option.description && (
                  <Typography variant="caption" color="text.secondary">
                    {option.description}
                  </Typography>
                )}
              </MuiStack>
            </MuiStack>
          </li>
        );
      }}
      renderTags={(tags, getTagProps) =>
        tags.map((option, index) => {
          const { key, ...tagProps } = getTagProps({ index });
          return (
            <Chip
              key={key}
              {...tagProps}
              size="small"
              avatar={<Avatar src={option.avatarUrl} name={option.label} size="small" />}
              label={option.label}
            />
          );
        })
      }
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          placeholder={values.length === 0 ? placeholder : undefined}
          helperText={helperText}
          error={error}
        />
      )}
    />
  );
}
