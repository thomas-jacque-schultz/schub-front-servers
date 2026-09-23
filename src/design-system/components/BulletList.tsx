import { type ReactNode } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

export interface BulletListProps {
  items: ReactNode[];
  ordered?: boolean;
  tone?: "default" | "secondary";
}

export function BulletList({ items, ordered = false, tone = "default" }: BulletListProps) {
  return (
    <Box
      component={ordered ? "ol" : "ul"}
      sx={{
        m: 0,
        pl: 3,
        display: "flex",
        flexDirection: "column",
        gap: 1,
        color: tone === "secondary" ? "text.secondary" : "text.primary",
      }}
    >
      {items.map((item, index) => (
        <Typography key={index} component="li" variant="body1" color="inherit">
          {item}
        </Typography>
      ))}
    </Box>
  );
}
