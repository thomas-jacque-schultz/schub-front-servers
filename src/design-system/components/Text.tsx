import { type ElementType, type ReactNode } from "react";
import Typography from "@mui/material/Typography";

export type TextVariant = "title" | "section" | "subtitle" | "body" | "caption" | "overline";
export type TextTone = "default" | "secondary" | "disabled" | "primary" | "error";

export interface TextProps {
  children: ReactNode;
  variant?: TextVariant;
  tone?: TextTone;
  component?: ElementType;
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
