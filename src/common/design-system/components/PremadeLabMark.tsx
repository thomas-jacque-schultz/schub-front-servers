import Box from "@mui/material/Box";

export interface PremadeLabMarkProps {
  size?: number;
}

const FLAMME =
  "M33 50.5 C33.6 53.6 38.2 55.6 38.2 59.6 C38.2 61.9 35.5 63.3 32 63.3 C28.5 63.3 25.8 61.9 25.8 59.6 C25.8 57 27.5 55.5 28.8 54.2 C29.2 55.8 30 56.8 31 57.1 C31.1 54.6 31.6 52.5 33 50.5 Z";
// Les deux petites flammes : la grande réduite aux 7/10, celle de gauche retournée.
const FLAMME_GAUCHE =
  "translate(21.5 63.3) scale(-0.7 0.7) translate(-32 -63.3)";
const FLAMME_DROITE = "translate(42.5 63.3) scale(0.7) translate(-32 -63.3)";

// La marmite qui est aussi une fiole, trois bulles, sur le feu (Schub#78).
// Les couleurs suivent les rôles : or sur sombre, prune sur clair.
export function PremadeLabMark({ size = 28 }: PremadeLabMarkProps) {
  return (
    <Box
      component="svg"
      viewBox="1 0 62 64"
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
      <Box component="g" sx={{ color: "secondary.main" }} fill="currentColor">
        <path d={FLAMME} />
        <path transform={FLAMME_GAUCHE} d={FLAMME} />
        <path transform={FLAMME_DROITE} d={FLAMME} />
      </Box>
      <Box
        component="path"
        sx={{ color: "primary.light" }}
        fill="currentColor"
        d="M32.6 56.2 C33 57.8 35 58.8 35 60.5 C35 61.6 33.7 62.3 32 62.3 C30.3 62.3 29 61.6 29 60.5 C29 59.3 29.8 58.6 30.6 58.1 C30.9 58.8 31.3 59.2 31.8 59.3 C31.8 58.2 32 57.1 32.6 56.2 Z"
      />
    </Box>
  );
}
