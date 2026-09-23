import { type ReactNode } from "react";
import MuiLink from "@mui/material/Link";
import { Link as RouterLink } from "react-router-dom";
import { Icon } from "./Icon";

export interface LinkProps {
  href: string;
  children: ReactNode;
  external?: boolean;
  tone?: "default" | "muted";
}

export function Link({ href, children, external, tone = "default" }: LinkProps) {
  const goesOutside = external ?? /^https?:\/\//.test(href);

  if (goesOutside) {
    return (
      <MuiLink
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        underline="hover"
        color={tone === "muted" ? "text.secondary" : "primary.main"}
      >
        {children} <Icon name="external" size="small" />
      </MuiLink>
    );
  }

  return (
    <MuiLink
      component={RouterLink}
      to={href}
      underline="hover"
      color={tone === "muted" ? "text.secondary" : "primary.main"}
    >
      {children}
    </MuiLink>
  );
}
