import Box from "@mui/material/Box";
import { keyframes } from "@mui/material/styles";
import { useEffect, useState } from "react";

const RAYON = 14;
const TOUR = 2 * Math.PI * RAYON;

const remplit = keyframes`
  from { stroke-dashoffset: ${TOUR}; }
  to { stroke-dashoffset: 0; }
`;

export interface CursorCooldownProps {
  /** Une valeur neuve lance une attente ; null n'en montre aucune. */
  trigger: string | number | null;
  durationMs: number;
}

/**
 * L'attente avant le prochain essai (Schub#161) : un anneau autour de la souris, qui se remplit puis disparaît.
 * Il suit le pointeur où qu'il soit dans la page, sans le gêner.
 */
export function CursorCooldown({ trigger, durationMs }: CursorCooldownProps) {
  const [position, setPosition] = useState<{ x: number; y: number } | null>(
    null,
  );
  const [fini, setFini] = useState<string | number | null>(null);

  useEffect(() => {
    const suit = (event: PointerEvent) =>
      setPosition({ x: event.clientX, y: event.clientY });
    window.addEventListener("pointermove", suit);
    window.addEventListener("pointerdown", suit);
    return () => {
      window.removeEventListener("pointermove", suit);
      window.removeEventListener("pointerdown", suit);
    };
  }, []);

  if (trigger === null || trigger === fini || !position) {
    return null;
  }
  return (
    <Box
      component="svg"
      key={trigger}
      aria-hidden
      viewBox={`0 0 ${RAYON * 2 + 4} ${RAYON * 2 + 4}`}
      sx={{
        position: "fixed",
        left: position.x,
        top: position.y,
        width: RAYON * 2 + 4,
        height: RAYON * 2 + 4,
        transform: "translate(-50%, -50%)",
        pointerEvents: "none",
        zIndex: (theme) => theme.zIndex.tooltip,
        color: "primary.main",
      }}
    >
      <circle
        cx={RAYON + 2}
        cy={RAYON + 2}
        r={RAYON}
        fill="none"
        stroke="currentColor"
        strokeOpacity={0.25}
        strokeWidth={3}
      />
      <Box
        component="circle"
        cx={RAYON + 2}
        cy={RAYON + 2}
        r={RAYON}
        fill="none"
        stroke="currentColor"
        strokeWidth={3}
        strokeLinecap="round"
        strokeDasharray={TOUR}
        transform={`rotate(-90 ${RAYON + 2} ${RAYON + 2})`}
        onAnimationEnd={() => setFini(trigger)}
        sx={{
          strokeDashoffset: 0,
          animation: `${remplit} ${durationMs}ms linear`,
        }}
      />
    </Box>
  );
}
