import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import { useMemo, useState } from "react";
import { radii } from "../tokens";
import { ChampionIcon } from "./ChampionIcon";
import { Stack } from "./Stack";
import { Text } from "./Text";
import { TextField } from "./TextField";

export interface ChampionSelectorEntry {
  key: string;
  name: string;
  iconUrl?: string | null;
}

export interface ChampionSelectorProps {
  entries: ChampionSelectorEntry[];
  mode: "single" | "multiple";
  selected: string[];
  onChange: (keys: string[]) => void;
  /** Champions déjà pris ailleurs : visibles, mais pas sélectionnables. */
  disabledKeys?: string[];
  searchLabel: string;
  searchPlaceholder?: string;
  noResultLabel: string;
  autoFocus?: boolean;
}

export function ChampionSelector({
  entries,
  mode,
  selected,
  onChange,
  disabledKeys = [],
  searchLabel,
  searchPlaceholder,
  noResultLabel,
  autoFocus = false,
}: ChampionSelectorProps) {
  const [filtre, setFiltre] = useState<string>("");

  const affiches = useMemo(() => {
    const recherche = filtre.trim().toLowerCase();
    return recherche
      ? entries.filter((entry) => entry.name.toLowerCase().includes(recherche))
      : entries;
  }, [entries, filtre]);

  const choisit = (key: string) => {
    if (mode === "single") {
      onChange(selected.includes(key) ? [] : [key]);
      return;
    }
    onChange(selected.includes(key) ? selected.filter((k) => k !== key) : [...selected, key]);
  };

  return (
    <Stack spacing={1.5}>
      <TextField
        label={searchLabel}
        value={filtre}
        onChange={setFiltre}
        placeholder={searchPlaceholder}
        autoFocus={autoFocus}
      />
      {affiches.length === 0 ? (
        <Text variant="caption" tone="disabled">
          {noResultLabel}
        </Text>
      ) : (
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 0.5,
            maxHeight: 320,
            p: 0.5,
            overflowY: "auto",
          }}
        >
          {affiches.map((entry) => {
            const retenu = selected.includes(entry.key);
            const pris = !retenu && disabledKeys.includes(entry.key);
            return (
              <ButtonBase
                key={entry.key}
                onClick={() => choisit(entry.key)}
                disabled={pris}
                aria-pressed={retenu}
                sx={{
                  borderRadius: `${radii.sm}px`,
                  filter: pris ? "grayscale(1)" : "none",
                  "&:focus-visible": {
                    outline: "2px solid",
                    outlineColor: "primary.main",
                  },
                }}
              >
                <ChampionIcon
                  src={entry.iconUrl}
                  name={entry.name}
                  selected={retenu}
                  dimmed={pris || (mode === "multiple" && !retenu)}
                />
              </ButtonBase>
            );
          })}
        </Box>
      )}
    </Stack>
  );
}
