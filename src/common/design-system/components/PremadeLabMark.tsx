import Box from "@mui/material/Box";

export interface PremadeLabMarkProps {
  size?: number;
}

// La marmite qui est aussi une fiole, cinq bulles pour le premade, deux mains qui la portent (Schub#78).
// Les couleurs suivent les rôles : or sur sombre, prune sur clair.
export function PremadeLabMark({ size = 28 }: PremadeLabMarkProps) {
  return (
    <Box
      component="svg"
      viewBox="2 0 60 62"
      aria-hidden
      sx={{ width: size, height: size, flexShrink: 0, display: "block" }}
    >
      <Box component="g" sx={{ color: "primary.light" }} fill="currentColor">
        <circle cx="31" cy="14.5" r="3.2" />
        <circle cx="37.5" cy="9.5" r="2.6" />
        <circle cx="26.5" cy="8" r="2.2" />
        <circle cx="33" cy="3.5" r="1.7" />
        <circle cx="41" cy="15.5" r="1.7" />
      </Box>
      <Box component="g" sx={{ color: "primary.main" }}>
        <g
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
        >
          <path d="M18.5 40.5 Q11.5 39.5 11.5 44 Q11.5 47.5 16 47.5" />
          <path d="M45.5 40.5 Q52.5 39.5 52.5 44 Q52.5 47.5 48 47.5" />
        </g>
        <g fill="currentColor">
          <rect x="23" y="19" width="18" height="4.5" rx="2.25" />
          <path d="M27 23 V31 L15.5 44.5 Q12.5 48.5 15.5 51.5 Q19.5 55 32 55 Q44.5 55 48.5 51.5 Q51.5 48.5 48.5 44.5 L37 31 V23 Z" />
        </g>
      </Box>
      <Box component="g" sx={{ color: "background.default" }}>
        <path
          d="M19.5 45 Q25.5 42 32 45 T44.5 45"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </Box>
      <Box component="g" sx={{ color: "secondary.main" }} fill="currentColor">
        <path d="M4.5 43.5 Q3.5 61 30 61 V57 Q11 57 9.5 46 Q9 42 6.5 42 Q4.5 42 4.5 43.5 Z" />
        <path d="M59.5 43.5 Q60.5 61 34 61 V57 Q53 57 54.5 46 Q55 42 57.5 42 Q59.5 42 59.5 43.5 Z" />
      </Box>
    </Box>
  );
}
