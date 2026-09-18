import { type ElementType, type ReactNode } from "react";
import Typography from "@mui/material/Typography";

export type TextVariant = "title" | "section" | "subtitle" | "body" | "caption" | "overline";
export type TextTone = "default" | "secondary" | "disabled" | "primary" | "error";

export interface TextProps {
  children: ReactNode;
  /** L'intention, pas la taille : `section` est un titre de bloc, `caption` une mention. */
  variant?: TextVariant;
  tone?: TextTone;
  /** La balise réellement rendue, quand elle doit différer du niveau retenu par défaut. */
  component?: ElementType;
  /** Coupe le texte à une ligne avec des points de suspension — pour une cellule étroite. */
  truncate?: boolean;
}

const VARIANT = {
  title: "h4",
  section: "h6",
  subtitle: "subtitle1",
  body: "body1",
  caption: "body2",
  overline: "overline",
} as const;

/**
 * La balise par défaut de chaque intention.
 *
 * <p>Le titre d'écran est un `h2` et non un `h1` : le `h1` appartient à `PageHeader`, et un écran
 * n'a qu'un titre de premier niveau. Deux `h1` sur une page désorientent la navigation par
 * titres autant que zéro.</p>
 */
const COMPONENT: Record<TextVariant, ElementType> = {
  title: "h2",
  section: "h3",
  subtitle: "p",
  body: "p",
  caption: "p",
  overline: "span",
};

const TONE = {
  default: "text.primary",
  secondary: "text.secondary",
  disabled: "text.disabled",
  primary: "primary.main",
  error: "error.main",
} as const;

/**
 * Le texte de l'application.
 *
 * <p>Six intentions nommées, pas les treize variantes de MUI : un écran déclare le *rôle* du
 * texte, et la taille se décide ici pour tout le monde à la fois.</p>
 */
export function Text({
  children,
  variant = "body",
  tone = "default",
  component,
  truncate = false,
}: TextProps) {
  return (
    <Typography
      variant={VARIANT[variant]}
      component={component ?? COMPONENT[variant]}
      color={TONE[tone]}
      noWrap={truncate}
    >
      {children}
    </Typography>
  );
}
