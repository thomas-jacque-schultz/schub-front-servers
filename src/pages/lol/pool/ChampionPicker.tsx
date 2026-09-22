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
  /** Les clés déjà retenues à ce poste. */
  selected: string[];
  saving: boolean;
  onClose: () => void;
  onConfirm: (championKeys: string[]) => void;
}

/**
 * Le catalogue entier, en icônes, où l'on choisit ce que l'équipe accepte d'aligner à un poste.
 *
 * <p>Une grille d'icônes et non une liste déroulante : on reconnaît un champion à son portrait
 * bien avant son nom, et le geste demandé est « clique ceux que tu veux », pas « ouvre, cherche,
 * valide, recommence ». Le filtre reste là pour qui connaît le nom.</p>
 *
 * <p>Le choix n'est envoyé qu'à la validation — un aller-retour par clic ferait de chaque
 * hésitation une écriture, et un réseau lent rendrait la grille inutilisable.</p>
 */
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

  // `selected` est un tableau reconstruit à chaque rendu du parent : en dépendre réinitialisait
  // la sélection à chaque re-rendu, et donc l'effaçait quand une écriture échouait. On ne repart
  // de l'état du serveur qu'à l'ouverture.
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

/**
 * Un vrai bouton, et {@code aria-pressed} plutôt qu'une icône « cochée » : sans lui, un lecteur
 * d'écran annonce le nom du champion sans dire s'il est retenu, et la grille devient illisible
 * pour qui ne voit pas le liseré.
 */
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
