import Chip from "@mui/material/Chip";
import { alpha } from "@mui/material/styles";
import { useTranslation } from "react-i18next";
import { type ServerStatusToken, statusColors } from "../tokens";

export interface StatusChipProps {
  status: ServerStatusToken;
  /** Remplace le libellé traduit. À n'utiliser que hors du domaine « serveur ». */
  label?: string;
  size?: "small" | "medium";
}

/**
 * L'état d'un serveur, en une puce.
 *
 * <p>Quatre statuts et quatre seulement — `ONLINE`, `OFFLINE`, `UNKNOWN`, `UNREACHABLE` — parce
 * que c'est ce que le cœur expose. La distinction entre *éteint* et *injoignable* est portée par
 * la couleur : un serveur arrêté est normal, un serveur injoignable est une panne.</p>
 *
 * <p>Le libellé est traduit ici, pas par l'appelant : c'est ce qui garantit qu'une liste de
 * serveurs ne mélange pas les langues.</p>
 */
export function StatusChip({ status, label, size = "medium" }: StatusChipProps) {
  const { t } = useTranslation();
  const text = label ?? t(`serverStatus.${status}`);

  return (
    <Chip
      size={size}
      label={text}
      variant="outlined"
      sx={(theme) => {
        const scheme = theme.palette.mode === "light" ? "light" : "dark";
        const color = statusColors[scheme][status];
        return {
          color,
          borderColor: alpha(color, 0.5),
          backgroundColor: alpha(color, 0.12),
          fontWeight: 600,
        };
      }}
    />
  );
}
