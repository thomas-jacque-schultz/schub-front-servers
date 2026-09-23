import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ChampionIcon,
  Dialog,
  EmptyState,
  Stack,
  Text,
  TextField,
} from "../../../design-system";
import type { ChampionCatalogEntryDto } from "../../../types/pool";
import type { GameRole } from "../../../types/team";

export interface ChampionPickerProps {
  open: boolean;
  role: GameRole | null;
  catalog: ChampionCatalogEntryDto[];
  selected: string[];
  saving: boolean;
  onClose: () => void;
  onConfirm: (championKeys: string[]) => void;
}

export function ChampionPicker({
  open,
  role,
  catalog,
  selected,
  saving,
  onClose,
  onConfirm,
}: ChampionPickerProps) {
  const { t } = useTranslation("pool");
  const { t: tTeams } = useTranslation("teams");

  const [retenus, setRetenus] = useState<string[]>(selected);
  const [filtre, setFiltre] = useState<string>("");

  // Ne pas dépendre de selected (recréé à chaque rendu) : la sélection était effacée après une écriture refusée.
  useEffect(() => {
    if (open) {
      setRetenus(selected);
      setFiltre("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const affiches = useMemo(() => {
    const recherche = filtre.trim().toLowerCase();
    if (!recherche) {
      return catalog;
    }
    return catalog.filter((champion) => champion.name.toLowerCase().includes(recherche));
  }, [catalog, filtre]);

  const bascule = (key: string) =>
    setRetenus((courants) =>
      courants.includes(key) ? courants.filter((retenu) => retenu !== key) : [...courants, key],
    );

  return (
    <Dialog
      open={open}
      title={t("picker.title", { role: role ? tTeams(`roles.${role}`) : "" })}
      description={t("picker.description")}
      cancelLabel={t("actions.cancel", { ns: "common" })}
      confirmLabel={t("picker.confirm")}
      confirmLoading={saving}
      onClose={onClose}
      onConfirm={() => onConfirm(retenus)}
    >
      <Stack spacing={2}>
        {catalog.length === 0 ? (
          <EmptyState title={t("patch.missingTitle")} description={t("picker.catalogEmpty")} />
        ) : (
          <>
            <TextField
              label={t("picker.search")}
              value={filtre}
              onChange={setFiltre}
              placeholder={t("picker.searchPlaceholder")}
            />
            <Text variant="caption" tone="secondary">
              {t("picker.selected", { count: retenus.length })}
            </Text>
            {affiches.length === 0 ? (
              <Text variant="caption" tone="disabled">
                {t("picker.none")}
              </Text>
            ) : (
              <Stack direction="row" spacing={0.5} wrap>
                {affiches.map((champion) => (
                  <ChampionChoice
                    key={champion.championKey}
                    champion={champion}
                    selected={retenus.includes(champion.championKey)}
                    onToggle={() => bascule(champion.championKey)}
                  />
                ))}
              </Stack>
            )}
          </>
        )}
      </Stack>
    </Dialog>
  );
}

function ChampionChoice({
  champion,
  selected,
  onToggle,
}: {
  champion: ChampionCatalogEntryDto;
  selected: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={selected}
      style={{ background: "none", border: "none", padding: 0, cursor: "pointer" }}
    >
      <ChampionIcon
        src={champion.iconUrl}
        name={champion.name}
        selected={selected}
        dimmed={!selected}
      />
    </button>
  );
}
