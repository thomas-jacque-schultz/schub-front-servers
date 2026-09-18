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
  /** Portrait facultatif : c'est ce qui fait reconnaître un compte plus vite qu'un pseudo. */
  avatarUrl?: string | null;
  /** Une ligne secondaire sous le libellé — un identifiant, un rôle. */
  description?: string | null;
}

export interface MultiSelectProps {
  label: string;
  /** Les valeurs retenues. Une valeur absente des options reste retenue et s'affiche telle quelle. */
  values: string[];
  onChange: (values: string[]) => void;
  options: MultiSelectOption[];
  helperText?: ReactNode;
  placeholder?: string;
  noOptionsText?: string;
  disabled?: boolean;
  error?: boolean;
}

/**
 * Le sélecteur multiple, avec portrait et libellé.
 *
 * <p>Une valeur **inconnue du catalogue reste affichée** au lieu de disparaître : c'est le cas
 * d'un identifiant de compte qui ne désigne plus personne. La faire disparaître retirerait
 * silencieusement un administrateur d'une fiche à la première sauvegarde ; la montrer telle
 * quelle la rend corrigeable.</p>
 */
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
