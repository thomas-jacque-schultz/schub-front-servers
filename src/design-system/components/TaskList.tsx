import Box from "@mui/material/Box";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItem from "@mui/material/ListItem";
import Typography from "@mui/material/Typography";
import { Icon, type IconName } from "./Icon";
import { radii } from "../tokens";

export type TaskState = "todo" | "pending" | "done";

export interface TaskListItem {
  key: string;
  label: string;
  /** Pourquoi c'est là, ou ce qui bloque. Une ligne sans raison se lit comme un reproche. */
  description?: string;
  state: TaskState;
  /** L'écran qui permet d'agir. Sans lui, la ligne est un constat et non une action. */
  href?: string;
}

export interface TaskListProps {
  items: TaskListItem[];
  /** Appelé avec le `href` de la ligne choisie. Le routage n'appartient pas au design system. */
  onSelect?: (href: string) => void;
  /** Ce qui s'affiche quand il n'y a plus rien à faire. */
  doneLabel?: string;
}

const ICONS: Record<TaskState, IconName> = {
  todo: "todo",
  pending: "pending",
  done: "done",
};

/** La couleur vient du thème : ce sont des états de tâche, pas des états de serveur. */
const TONES: Record<TaskState, string> = {
  todo: "text.secondary",
  pending: "warning.main",
  done: "success.main",
};

/**
 * Une liste de choses à faire, chacune menant à l'écran qui permet de la faire.
 *
 * <p>Trois états et pas deux : <em>en attente</em> n'est pas <em>à faire</em>. Une liaison de
 * compte que le serveur est en train de résoudre ne demande rien à personne, et la présenter
 * comme une action à mener ferait recommencer un geste déjà posé.</p>
 *
 * <p>Ce qui est fait reste affiché plutôt que de disparaître : une liste qui raccourcit sans
 * jamais dire ce qu'elle a validé laisse douter que le geste ait été pris en compte.</p>
 */
export function TaskList({ items, onSelect, doneLabel }: TaskListProps) {
  if (items.length === 0) {
    return doneLabel ? (
      <Typography variant="body2" color="text.secondary">
        {doneLabel}
      </Typography>
    ) : null;
  }

  return (
    <List disablePadding sx={{ display: "grid", gap: 1 }}>
      {items.map((item) => {
        const content = (
          <Box sx={{ display: "flex", gap: 1.5, alignItems: "flex-start", width: "100%" }}>
            <Box sx={{ display: "flex", color: TONES[item.state], mt: 0.25 }}>
              <Icon name={ICONS[item.state]} size="small" />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography
                variant="body2"
                sx={{ fontWeight: item.state === "done" ? 400 : 600 }}
              >
                {item.label}
              </Typography>
              {item.description && (
                <Typography variant="caption" color="text.secondary" component="p">
                  {item.description}
                </Typography>
              )}
            </Box>
            {item.href && (
              <Box sx={{ display: "flex", color: "text.secondary", mt: 0.25 }}>
                <Icon name="chevron" size="small" />
              </Box>
            )}
          </Box>
        );

        const sx = {
          borderRadius: `${radii.md}px`,
          border: 1,
          borderColor: "divider",
          px: 1.5,
          py: 1,
        } as const;

        return item.href ? (
          <ListItemButton
            key={item.key}
            sx={sx}
            onClick={() => onSelect?.(item.href as string)}
          >
            {content}
          </ListItemButton>
        ) : (
          <ListItem key={item.key} sx={sx} disablePadding>
            {content}
          </ListItem>
        );
      })}
    </List>
  );
}
