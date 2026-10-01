import Box from "@mui/material/Box";

export interface PremadeLabMarkProps {
  size?: number;
}

// La marmite qui est aussi une fiole, trois bulles (Schub#78).
// Les couleurs suivent les rôles : or sur sombre, prune sur clair.
export function PremadeLabMark({ size = 28 }: PremadeLabMarkProps) {
  return (
    <Box
      component="svg"
      viewBox="6 0 52 52"
      aria-hidden
      sx={{ width: size, height: size, flexShrink: 0, display: "block" }}
    >
      <Box component="g" sx={{ color: "primary.light" }} fill="currentColor">
        <circle cx="31" cy="9.5" r="3" />
        <circle cx="37.5" cy="4.5" r="2.2" />
        <circle cx="26" cy="3.8" r="1.6" />
      </Box>
      <Box component="g" sx={{ color: "primary.main" }}>
        <g
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
        >
          <path d="M18.5 35.5 Q11.5 34.5 11.5 39 Q11.5 42.5 16 42.5" />
          <path d="M45.5 35.5 Q52.5 34.5 52.5 39 Q52.5 42.5 48 42.5" />
        </g>
        <g fill="currentColor">
          <rect x="23" y="14" width="18" height="4.5" rx="2.25" />
          <path d="M27 18 V26 L15.5 39.5 Q12.5 43.5 15.5 46.5 Q19.5 50 32 50 Q44.5 50 48.5 46.5 Q51.5 43.5 48.5 39.5 L37 26 V18 Z" />
        </g>
      </Box>
      <Box component="g" sx={{ color: "background.default" }}>
        <path
          d="M19.5 40 Q25.5 37 32 40 T44.5 40"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </Box>
    </Box>
  );
}
