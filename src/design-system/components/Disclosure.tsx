import { type ReactNode } from "react";
import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import Typography from "@mui/material/Typography";
import { Icon } from "./Icon";

export interface DisclosureProps {
  title: string;
  meta?: ReactNode;
  open: boolean;
  onToggle: (open: boolean) => void;
  children: ReactNode;
}

export function Disclosure({ title, meta, open, onToggle, children }: DisclosureProps) {
  return (
    <Accordion
      disableGutters
      expanded={open}
      onChange={(_, expanded) => onToggle(expanded)}
      sx={{
        boxShadow: "none",
        border: 1,
        borderColor: "divider",
        borderRadius: 2,
        "&::before": { display: "none" },
      }}
    >
      <AccordionSummary expandIcon={<Icon name="expand" />}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, flexGrow: 1 }}>
          {title}
        </Typography>
        {meta}
      </AccordionSummary>
      <AccordionDetails>{children}</AccordionDetails>
    </Accordion>
  );
}
