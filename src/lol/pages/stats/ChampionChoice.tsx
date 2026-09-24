import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button, ChampionSelector, Dialog, Stack, Text } from "../../../design-system";
import type { StatLineDto } from "../../types/stats";

export interface ChampionChoiceProps {
  champions: StatLineDto[];
  selected: string[];
  onChange: (keys: string[]) => void;
  defaultCount: number;
}

export function ChampionChoice({ champions, selected, onChange, defaultCount }: ChampionChoiceProps) {
  const { t } = useTranslation("stats");
  const [ouvert, setOuvert] = useState<boolean>(false);
  const [retenus, setRetenus] = useState<string[]>(selected);

  if (champions.length <= 1) {
    return null;
  }

  const ouvre = () => {
    setRetenus(selected);
    setOuvert(true);
  };

  return (
    <>
      <Button variant="ghost" size="small" onClick={ouvre}>
        {selected.length > 0
          ? t("championChoice.buttonCount", { count: selected.length })
          : t("championChoice.button")}
      </Button>
      <Dialog
        open={ouvert}
        title={t("championChoice.title")}
        cancelLabel={t("championChoice.cancel")}
        confirmLabel={t("championChoice.confirm")}
        onClose={() => setOuvert(false)}
        onConfirm={() => {
          onChange(retenus);
          setOuvert(false);
        }}
      >
        <Stack spacing={1.5}>
          <Stack direction="row" spacing={1} align="center" justify="between">
            <Text variant="caption" tone="secondary">
              {retenus.length > 0
                ? t("championChoice.selected", { count: retenus.length })
                : t("championChoice.default", { count: defaultCount })}
            </Text>
            {retenus.length > 0 && (
              <Button variant="ghost" size="small" onClick={() => setRetenus([])}>
                {t("championChoice.reset")}
              </Button>
            )}
          </Stack>
          <ChampionSelector
            entries={champions.map((line) => ({
              key: line.key,
              name: line.label ?? line.key,
              iconUrl: line.iconUrl,
            }))}
            mode="multiple"
            selected={retenus}
            onChange={setRetenus}
            searchLabel={t("championChoice.search")}
            noResultLabel={t("championChoice.noResult")}
          />
        </Stack>
      </Dialog>
    </>
  );
}
