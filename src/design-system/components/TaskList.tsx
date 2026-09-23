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
  description?: string;
  state: TaskState;
  href?: string;
}

export interface TaskListProps {
  items: TaskListItem[];
  onSelect?: (href: string) => void;
  doneLabel?: string;
}

const ICONS: Record<TaskState, IconName> = {
  todo: "todo",
  pending: "pending",
  done: "done",
};

const TONES: Record<TaskState, string> = {
  todo: "text.secondary",
  pending: "warning.main",
  done: "success.main",
};

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
