import { useState, type ReactNode } from "react";
import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import Collapse from "@mui/material/Collapse";
import Paper from "@mui/material/Paper";
import ToggleButton from "@mui/material/ToggleButton";
import Typography from "@mui/material/Typography";
import { Icon, type IconName } from "./Icon";

export interface ToolPanelTool {
  key: string;
  label: string;
  icon: IconName;
}

export interface ToolPanelMenu {
  key: string;
  label: string;
  tools: readonly ToolPanelTool[];
}

export interface ToolPanelProps {
  label: string;
  menus: readonly ToolPanelMenu[];
  value: string;
  onChange: (tool: string) => void;
  /** Ce qui vaut pour tous les outils : annuler, tout effacer. */
  actions?: ReactNode;
  /** Les réglages de l'outil choisi, sous les menus. */
  children?: ReactNode;
}

/**
 * Les outils d'un tableau, dans une colonne de côté : des menus repliables, comme le ruban d'un traitement de texte
 * mis debout (Schub#168). Un outil choisi reste en surbrillance ; ses réglages suivent.
 */
export function ToolPanel({
  label,
  menus,
  value,
  onChange,
  actions,
  children,
}: ToolPanelProps) {
  const [replies, setReplies] = useState<ReadonlySet<string>>(new Set());
  const bascule = (menu: string) =>
    setReplies((avant) => {
      const apres = new Set(avant);
      if (!apres.delete(menu)) {
        apres.add(menu);
      }
      return apres;
    });

  return (
    <Paper
      component="section"
      aria-label={label}
      variant="outlined"
      sx={{ p: 1.5, display: "flex", flexDirection: "column", gap: 1.5 }}
    >
      {menus.map((menu) => {
        const ouvert = !replies.has(menu.key);
        return (
          <Box key={menu.key}>
            <ButtonBase
              onClick={() => bascule(menu.key)}
              aria-expanded={ouvert}
              sx={{
                width: "100%",
                justifyContent: "space-between",
                py: 0.5,
                borderRadius: 1,
                color: "text.secondary",
              }}
            >
              <Typography
                variant="overline"
                component="h3"
                sx={{ lineHeight: 1.6 }}
              >
                {menu.label}
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  transform: ouvert ? "rotate(180deg)" : "none",
                  transition: "transform 150ms",
                }}
              >
                <Icon name="expand" size="small" />
              </Box>
            </ButtonBase>
            <Collapse in={ouvert}>
              <Box
                role="group"
                aria-label={menu.label}
                sx={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(72px, 1fr))",
                  gap: 0.75,
                  pt: 0.75,
                }}
              >
                {menu.tools.map((tool) => (
                  <ToggleButton
                    key={tool.key}
                    value={tool.key}
                    selected={tool.key === value}
                    onChange={() => onChange(tool.key)}
                    size="small"
                    sx={{
                      flexDirection: "column",
                      gap: 0.25,
                      py: 0.75,
                      textTransform: "none",
                      lineHeight: 1.2,
                      fontSize: "0.75rem",
                    }}
                  >
                    <Icon name={tool.icon} size="small" />
                    {tool.label}
                  </ToggleButton>
                ))}
              </Box>
            </Collapse>
          </Box>
        );
      })}
      {actions && (
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>{actions}</Box>
      )}
      {children && (
        <Box
          sx={{
            borderTop: 1,
            borderColor: "divider",
            pt: 1.5,
            display: "flex",
            flexDirection: "column",
            gap: 1.5,
          }}
        >
          {children}
        </Box>
      )}
    </Paper>
  );
}
