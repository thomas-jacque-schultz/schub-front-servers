import { type ReactNode } from "react";
import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import { radii } from "../tokens";
import { Icon } from "./Icon";

export interface ExpandableProps {
  /** Toute la ligne est le bouton : elle ne doit contenir aucun autre élément cliquable. */
  summary: ReactNode;
  open: boolean;
  onToggle: (open: boolean) => void;
  children: ReactNode;
}

// Le contenu n'est monté qu'ouvert : un détail qui se charge ne part qu'au clic.
export function Expandable({
  summary,
  open,
  onToggle,
  children,
}: ExpandableProps) {
  return (
    <Accordion
      disableGutters
      expanded={open}
      onChange={(_, expanded) => onToggle(expanded)}
      slotProps={{ transition: { unmountOnExit: true } }}
      sx={{
        boxShadow: "none",
        border: "1px solid",
        borderColor: open ? "primary.main" : "divider",
        borderRadius: `${radii.md}px`,
        bgcolor: "background.paper",
        "&::before": { display: "none" },
      }}
    >
      <AccordionSummary
        expandIcon={<Icon name="expand" />}
        sx={{
          px: 1.5,
          "& .MuiAccordionSummary-content": { my: 1.25, minWidth: 0 },
        }}
      >
        {summary}
      </AccordionSummary>
      <AccordionDetails
        sx={{
          px: 1.5,
          pb: 2,
          borderTop: "1px solid",
          borderColor: "divider",
          pt: 2,
        }}
      >
        {children}
      </AccordionDetails>
    </Accordion>
  );
}
