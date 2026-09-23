import { type ReactNode } from "react";
import Box from "@mui/material/Box";
import MuiTab from "@mui/material/Tab";
import MuiTabs from "@mui/material/Tabs";
import { Chip } from "./Chip";

export interface TabItem {
  key: string;
  label: string;
  badge?: string;
  disabled?: boolean;
}

export interface TabsProps {
  items: TabItem[];
  value: string;
  onChange: (key: string) => void;
  ariaLabel: string;
  children?: ReactNode;
}

export function Tabs({ items, value, onChange, ariaLabel, children }: TabsProps) {
  return (
    <Box>
      <MuiTabs
        value={value}
        onChange={(_event, next: string) => onChange(next)}
        aria-label={ariaLabel}
        variant="scrollable"
        scrollButtons="auto"
        allowScrollButtonsMobile
        sx={{ borderBottom: 1, borderColor: "divider" }}
      >
        {items.map((item) => (
          <MuiTab
            key={item.key}
            value={item.key}
            id={`tab-${item.key}`}
            aria-controls={`panel-${item.key}`}
            disabled={item.disabled}
            iconPosition="end"
            icon={item.badge ? <Chip label={item.badge} tone="secondary" variant="outline" /> : undefined}
            label={item.label}
          />
        ))}
      </MuiTabs>
      <Box
        role="tabpanel"
        id={`panel-${value}`}
        aria-labelledby={`tab-${value}`}
        sx={{ pt: 3 }}
      >
        {children}
      </Box>
    </Box>
  );
}
