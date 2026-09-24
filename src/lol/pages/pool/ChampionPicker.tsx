import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ChampionSelector, Dialog, EmptyState, Stack, Text } from "../../../design-system";
import type { ChampionCatalogEntryDto } from "../../types/pool";
import type { GameRole } from "../../types/team";
import { selectorEntries } from "./catalog";

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

  // Ne pas dépendre de selected (recréé à chaque rendu) : la sélection était effacée après une écriture refusée.
  useEffect(() => {
    if (open) {
      setRetenus(selected);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

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
            <Text variant="caption" tone="secondary">
              {t("picker.selected", { count: retenus.length })}
            </Text>
            <ChampionSelector
              entries={selectorEntries(catalog)}
              mode="multiple"
              selected={retenus}
              onChange={setRetenus}
              searchLabel={t("picker.search")}
              searchPlaceholder={t("picker.searchPlaceholder")}
              noResultLabel={t("picker.none")}
            />
          </>
        )}
      </Stack>
    </Dialog>
  );
}
