import { type ElementType, type ReactNode } from "react";
import MuiStack from "@mui/material/Stack";

export type StackDirection = "row" | "column" | "responsive";
export type StackAlign = "start" | "center" | "end" | "stretch" | "baseline";
export type StackJustify = "start" | "center" | "end" | "between";

export interface StackProps {
  children: ReactNode;
  /** `responsive` empile sur mobile et aligne en ligne à partir de `sm`. */
  direction?: StackDirection;
  /** En pas de l'échelle d'espacement, jamais en pixels. */
  spacing?: number;
  align?: StackAlign;
  justify?: StackJustify;
  wrap?: boolean;
  fullWidth?: boolean;
  /** Pour rendre un `form`, un `ul`, un `section`… sans quitter le design system. */
  component?: ElementType;
  onSubmit?: (event: React.FormEvent<HTMLFormElement>) => void;
}

const ALIGN: Record<StackAlign, string> = {
  start: "flex-start",
  center: "center",
  end: "flex-end",
  stretch: "stretch",
  baseline: "baseline",
};

const JUSTIFY: Record<StackJustify, string> = {
  start: "flex-start",
  center: "center",
  end: "flex-end",
  between: "space-between",
};

/**
 * L'empilement — la seule façon d'espacer deux blocs.
 *
 * <p>Il existe pour fermer une porte : sans lui, un écran a besoin du `Stack` de MUI, donc d'un
 * import interdit, donc d'une dérogation. Les propriétés exposées sont volontairement moins
 * nombreuses que celles de MUI, et il n'y a **pas de `sx`** : une mise en page qui ne s'exprime
 * pas avec ces axes est une mise en page à ajouter ici, pas à improviser dans un écran.</p>
 */
export function Stack({
  children,
  direction = "column",
  spacing = 2,
  align,
  justify,
  wrap = false,
  fullWidth = false,
  component,
  onSubmit,
}: StackProps) {
  return (
    <MuiStack
      component={component ?? "div"}
      onSubmit={onSubmit}
      direction={direction === "responsive" ? { xs: "column", sm: "row" } : direction}
      spacing={spacing}
      alignItems={align ? ALIGN[align] : undefined}
      justifyContent={justify ? JUSTIFY[justify] : undefined}
      flexWrap={wrap ? "wrap" : undefined}
      useFlexGap={wrap || undefined}
      sx={fullWidth ? { width: "100%" } : undefined}
    >
      {children}
    </MuiStack>
  );
}
