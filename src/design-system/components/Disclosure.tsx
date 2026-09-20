import { type ReactNode } from "react";
import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import Typography from "@mui/material/Typography";
import { Icon } from "./Icon";

export interface DisclosureProps {
  /** L'intitulé toujours visible, celui sur lequel on clique. */
  title: string;
  /** Une mention secondaire à droite du titre — un compte, un état. */
  meta?: ReactNode;
  open: boolean;
  onToggle: (open: boolean) => void;
  children: ReactNode;
}

/**
 * Le bloc repliable.
 *
 * <p>Il est **contrôlé** : l'ouverture appartient à l'écran, pas au composant. C'est ce qui
 * permet de réagir à l'ouverture — charger une liste, par exemple — sans dupliquer l'état.</p>
 *
 * <p>Le contenu replié reste dans le DOM : replier n'est pas masquer une information sensible,
 * c'est ranger une liste longue.</p>
 */
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
