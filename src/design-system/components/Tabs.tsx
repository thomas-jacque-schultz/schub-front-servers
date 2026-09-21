import { type ReactNode } from "react";
import Box from "@mui/material/Box";
import MuiTab from "@mui/material/Tab";
import MuiTabs from "@mui/material/Tabs";
import { Chip } from "./Chip";

export interface TabItem {
  key: string;
  label: string;
  /**
   * Une étiquette posée à droite du libellé — « à venir », un compte d'éléments.
   *
   * <p>Elle existe pour qu'un onglet dise ce qu'il contient **avant** qu'on clique dessus : un
   * onglet qu'on ouvre pour découvrir qu'il est vide fait le trajet pour rien.</p>
   */
  badge?: string;
  /**
   * Un onglet désactivé reste **visible**, et c'est le but : le masquer ferait disparaître
   * l'existence même de la fonctionnalité, là où le griser annonce ce qui vient.
   */
  disabled?: boolean;
}

export interface TabsProps {
  items: TabItem[];
  /** La clé de l'onglet actif. Contrôlé : c'est l'écran qui décide, pas le composant. */
  value: string;
  onChange: (key: string) => void;
  /** Ce que cette barre d'onglets permet de choisir, pour les lecteurs d'écran. */
  ariaLabel: string;
  /** Le contenu de l'onglet actif — rendu dans le panneau associé, jamais à côté. */
  children?: ReactNode;
}

/**
 * Les onglets : une page, plusieurs vues du même objet.
 *
 * <p>Le composant rend la barre **et** le panneau, au lieu de laisser l'écran poser le second à
 * la main. C'est ce qui garantit le câblage d'accessibilité — `role="tabpanel"`,
 * `aria-controls`, `aria-labelledby` — qui est précisément la partie qu'on oublie quand chaque
 * écran la réécrit. Un onglet dont le panneau n'est pas associé se navigue au clavier sans que
 * le lecteur d'écran annonce jamais ce qui a changé.</p>
 *
 * <p>Seul le panneau actif est rendu : les autres ne sont pas montés. Un panneau qui charge des
 * données ne les charge donc que si on l'ouvre.</p>
 */
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
