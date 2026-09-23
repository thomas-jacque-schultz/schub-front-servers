import { type ReactNode } from "react";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import MuiStack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

export interface ChoiceListOption {
  id: string;
  label: string;
  description?: ReactNode;
  meta?: ReactNode;
}

export interface ChoiceListProps {
  label: string;
  options: ChoiceListOption[];
  selectedId?: string | null;
  onSelect: (id: string) => void;
  disabled?: boolean;
  empty?: ReactNode;
}

export function ChoiceList({
  label,
  options,
  selectedId,
  onSelect,
  disabled = false,
  empty,
}: ChoiceListProps) {
  if (options.length === 0) {
    return empty ? <>{empty}</> : null;
  }

  return (
    <List aria-label={label} dense disablePadding sx={{ width: "100%" }}>
      {options.map((option) => (
        <ListItemButton
          key={option.id}
          selected={option.id === selectedId}
          disabled={disabled}
          onClick={() => onSelect(option.id)}
          sx={{ borderRadius: 1, alignItems: "flex-start", gap: 1 }}
        >
          <MuiStack spacing={0.25} sx={{ flexGrow: 1, minWidth: 0 }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {option.label}
            </Typography>
            {option.description && (
              <Typography variant="caption" color="text.secondary" component="div">
                {option.description}
              </Typography>
            )}
          </MuiStack>
          {option.meta && (
            <MuiStack direction="row" spacing={0.5} alignItems="center" flexWrap="wrap" useFlexGap>
              {option.meta}
            </MuiStack>
          )}
        </ListItemButton>
      ))}
    </List>
  );
}
