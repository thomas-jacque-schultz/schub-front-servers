import Box from "@mui/material/Box";
import { keyframes } from "@mui/material/styles";
import { playful, typographyTokens } from "../tokens";
import { Icon } from "./Icon";

const bat = keyframes`
  from { transform: scale(1); }
  to { transform: scale(1.08); }
`;

export interface CountdownProps {
  seconds: number;
  label: string;
  /** En dessous, le chrono passe au rouge et bat. */
  urgentBelow?: number;
}

/** Le chrono d'une manche : une pastille, qui s'affole dans les dernières secondes. */
export function Countdown({ seconds, label, urgentBelow = 5 }: CountdownProps) {
  const urgent = seconds <= urgentBelow;
  return (
    <Box
      role="timer"
      aria-label={label}
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: 0.75,
        px: 1.5,
        py: 0.5,
        borderRadius: 999,
        border: "1px solid",
        borderColor: urgent ? "error.main" : playful.edge,
        color: urgent ? "error.main" : "primary.main",
        fontFamily: typographyTokens.monospaceFontFamily,
        fontVariantNumeric: "tabular-nums",
        fontWeight: typographyTokens.weights.bold,
        fontSize: "1.25rem",
        minWidth: "4.5ch",
        animation: urgent
          ? `${bat} 500ms ease-in-out infinite alternate`
          : "none",
        "@media (prefers-reduced-motion: reduce)": { animation: "none" },
      }}
    >
      <Icon name="pending" size="small" />
      {seconds}
    </Box>
  );
}
