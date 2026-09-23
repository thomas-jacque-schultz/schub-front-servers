import { type ElementType, type ReactNode } from "react";
import MuiStack from "@mui/material/Stack";

export type StackDirection = "row" | "column" | "responsive";
export type StackAlign = "start" | "center" | "end" | "stretch" | "baseline";
export type StackJustify = "start" | "center" | "end" | "between";

export interface StackProps {
  children: ReactNode;
  direction?: StackDirection;
  spacing?: number;
  align?: StackAlign;
  justify?: StackJustify;
  wrap?: boolean;
  fullWidth?: boolean;
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
