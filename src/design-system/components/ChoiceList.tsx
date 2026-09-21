import { type ReactNode } from "react";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import MuiStack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

export interface ChoiceListOption {
  id: string;
  label: string;
  /** La ligne secondaire : ce qui permet de distinguer deux options de même libellé. */
  description?: ReactNode;
  /** À droite du libellé — des `Chip`, en général. */
  meta?: ReactNode;
}

export interface ChoiceListProps {
  /** Le nom de la liste pour les lecteurs d'écran. Elle n'a pas toujours un titre visible. */
  label: string;
  options: ChoiceListOption[];
  selectedId?: string | null;
  onSelect: (id: string) => void;
  /** Le temps qu'un choix soit traité : sans ça, un double clic envoie deux fois. */
  disabled?: boolean;
  /** Rendu à la place de la liste quand elle est vide. Une absence se dit, elle ne se tait pas. */
  empty?: ReactNode;
}

/**
 * Une liste d'options que l'on choisit d'un clic.
 *
 * <p>Elle existe parce qu'un `SelectField` ne convient pas ici : choisir entre des homonymes
 * demande de <em>comparer</em> des options sur plusieurs lignes — un nombre de parties, des
 * postes, une date — et une liste déroulante n'en montre qu'une à la fois, repliée dès qu'on la
 * quitte. Le choix est une lecture avant d'être une sélection.</p>
 *
 * <p>Chaque option est un vrai bouton : le clavier et les lecteurs d'écran la parcourent sans
 * qu'on ait à réinventer la navigation. C'est aussi pourquoi `description` et `meta` acceptent du
 * contenu et non des chaînes — le composant met en page, il ne met pas en forme.</p>
 */
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
