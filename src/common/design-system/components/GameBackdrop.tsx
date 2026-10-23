import Box from "@mui/material/Box";
import { keyframes } from "@mui/material/styles";
import { playful } from "../tokens";

// Les griffonnages du fond des jeux (Schub#145) : des traits ronds, comme dessinés au feutre, dans les marges.
const FORMES = {
  etoile:
    "M12 3l2.6 5.6 6.1.7-4.5 4.2 1.2 6L12 16.6l-5.4 2.9 1.2-6-4.5-4.2 6.1-.7z",
  couronne: "M3 8l4.5 4L12 5l4.5 7L21 8l-2 10H5z",
  crayon: "M4 20l1-4L16 5l3 3L8 19zM14 7l3 3",
  epee: "M14.5 3H21v6.5L10 20.5 3.5 14zM5 19l-2 2M7.5 16.5l-3-3",
  eclat: "M12 2v6M12 16v6M2 12h6M16 12h6M5 5l3 3M16 16l3 3M19 5l-3 3M8 16l-3 3",
  vague: "M2 12c3-6 5 6 8 0s5 6 8 0 3 4 4 2",
  manette:
    "M6 8h12a4 4 0 014 4v2a3 3 0 01-5.2 2L15 14H9l-1.8 2A3 3 0 012 14v-2a4 4 0 014-4zM7 11v3M5.5 12.5h3M16 12h.01M18 13.5h.01",
} as const;

type Forme = keyof typeof FORMES;

const DOODLES: {
  forme: Forme;
  x: number;
  y: number;
  taille: number;
  tourne: number;
  or: boolean;
}[] = [
  { forme: "etoile", x: 3, y: 14, taille: 44, tourne: -12, or: true },
  { forme: "crayon", x: 5, y: 44, taille: 64, tourne: 18, or: false },
  { forme: "eclat", x: 2, y: 70, taille: 34, tourne: 0, or: true },
  { forme: "vague", x: 7, y: 88, taille: 56, tourne: -8, or: false },
  { forme: "couronne", x: 44, y: 3, taille: 40, tourne: 8, or: true },
  { forme: "manette", x: 70, y: 6, taille: 46, tourne: -10, or: false },
  { forme: "etoile", x: 92, y: 18, taille: 36, tourne: 14, or: false },
  { forme: "epee", x: 90, y: 40, taille: 58, tourne: -20, or: true },
  { forme: "eclat", x: 95, y: 62, taille: 30, tourne: 0, or: false },
  { forme: "couronne", x: 89, y: 84, taille: 42, tourne: -6, or: true },
  { forme: "vague", x: 52, y: 95, taille: 60, tourne: 4, or: true },
];

const flotte = keyframes`
  from { transform: translateY(0) rotate(var(--tourne)); }
  to { transform: translateY(-8px) rotate(calc(var(--tourne) + 4deg)); }
`;

/** Le fond des mini-jeux : prune profond et griffonnages dans les marges, derrière tout le contenu. */
export function GameBackdrop() {
  return (
    <Box
      aria-hidden
      sx={{
        position: "fixed",
        inset: 0,
        zIndex: -1,
        overflow: "hidden",
        background: playful.page,
        pointerEvents: "none",
      }}
    >
      {DOODLES.map((d, index) => (
        <Box
          key={index}
          component="svg"
          viewBox="0 0 24 24"
          sx={{
            position: "absolute",
            left: `${d.x}%`,
            top: `${d.y}%`,
            width: { xs: d.taille * 0.6, md: d.taille },
            height: { xs: d.taille * 0.6, md: d.taille },
            color: d.or ? playful.doodle.gold : playful.doodle.prune,
            "--tourne": `${d.tourne}deg`,
            transform: `rotate(${d.tourne}deg)`,
            animation: `${flotte} ${6 + (index % 4)}s ease-in-out ${index * 0.4}s infinite alternate`,
            "@media (prefers-reduced-motion: reduce)": { animation: "none" },
          }}
        >
          <path
            d={FORMES[d.forme]}
            fill="none"
            stroke="currentColor"
            strokeWidth={1.6}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Box>
      ))}
    </Box>
  );
}
