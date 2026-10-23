import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import { keyframes } from "@mui/material/styles";
import { playful } from "../tokens";

const PARTICULES = 16;
const DUREE_MS = 900;

const eclate = keyframes`
  from { transform: translate(0, 0) rotate(0deg); opacity: 1; }
  to { transform: translate(var(--dx), var(--dy)) rotate(var(--r)); opacity: 0; }
`;

export interface CelebrationProps {
  /** Une valeur neuve déclenche une gerbe ; null n'en déclenche aucune. */
  trigger: string | number | null;
}

/** Une gerbe de confettis au milieu de l'écran, quand on marque. Rien si l'on a demandé moins d'animations. */
export function Celebration({ trigger }: CelebrationProps) {
  const [gerbe, setGerbe] = useState<string | number | null>(null);

  useEffect(() => {
    if (trigger === null) {
      return;
    }
    setGerbe(trigger);
    const fin = window.setTimeout(() => setGerbe(null), DUREE_MS);
    return () => window.clearTimeout(fin);
  }, [trigger]);

  if (gerbe === null) {
    return null;
  }
  return (
    <Box
      key={gerbe}
      aria-hidden
      sx={{
        position: "fixed",
        left: "50%",
        top: "40%",
        pointerEvents: "none",
        zIndex: 1500,
        "@media (prefers-reduced-motion: reduce)": { display: "none" },
      }}
    >
      {Array.from({ length: PARTICULES }, (_, i) => {
        const angle = (i / PARTICULES) * 2 * Math.PI;
        const portee = 90 + (i % 3) * 40;
        return (
          <Box
            key={i}
            sx={{
              position: "absolute",
              width: i % 2 ? 8 : 6,
              height: i % 2 ? 12 : 6,
              borderRadius: i % 2 ? "2px" : "50%",
              bgcolor: playful.confetti[i % playful.confetti.length],
              "--dx": `${Math.round(Math.cos(angle) * portee)}px`,
              "--dy": `${Math.round(Math.sin(angle) * portee + 40)}px`,
              "--r": `${(i % 2 ? 1 : -1) * 280}deg`,
              animation: `${eclate} ${DUREE_MS}ms cubic-bezier(.2,.7,.4,1) forwards`,
            }}
          />
        );
      })}
    </Box>
  );
}
