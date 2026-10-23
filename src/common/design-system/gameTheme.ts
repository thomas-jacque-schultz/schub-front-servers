// La police ronde n'est importée qu'ici ; ses fichiers ne se téléchargent que là où elle s'affiche, dans les jeux.
import "@fontsource-variable/fredoka";

import { createTheme } from "@mui/material/styles";
import { appThemeOptions } from "./theme";
import { brand, identity, motion, playful } from "./tokens";

const ronde = { fontFamily: playful.fontFamily, fontWeight: 600 };

/** Le thème des mini-jeux (Schub#145) : celui des applications, en plus rond et plus vivant. */
export const createGameTheme = () =>
  createTheme(appThemeOptions(identity), {
    shape: { borderRadius: playful.radii.control },
    typography: {
      h2: ronde,
      h3: ronde,
      h4: ronde,
      h5: ronde,
      h6: ronde,
      subtitle1: ronde,
      button: { ...ronde, fontSize: "1rem" },
    },
    components: {
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: playful.radii.card,
            border: "1px solid",
            borderColor: playful.edge,
            background: playful.panel,
            backdropFilter: "blur(6px)",
            boxShadow: playful.glow,
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: playful.radii.control,
            transition: `transform ${motion.fast}ms ease, box-shadow ${motion.fast}ms ease`,
          },
          outlined: {
            backgroundColor: playful.tile,
            borderColor: playful.edge,
            "&:hover": {
              backgroundColor: playful.tileHover,
              borderColor: playful.edge,
              boxShadow: playful.glow,
            },
          },
          containedPrimary: {
            boxShadow: `0 ${playful.press.depth}px 0 ${playful.press.edge}`,
            "&:hover": {
              transform: "translateY(-1px)",
              boxShadow: `0 ${playful.press.depth + 1}px 0 ${playful.press.edge}`,
            },
            "&:active": {
              transform: `translateY(${playful.press.depth}px)`,
              boxShadow: `0 0 0 ${brand.goldDeep}`,
            },
            "@media (prefers-reduced-motion: reduce)": {
              transition: "none",
              "&:hover, &:active": { transform: "none" },
            },
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: { borderRadius: 999, fontFamily: playful.fontFamily },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: playful.radii.control,
            backgroundColor: playful.field,
          },
        },
      },
    },
  });
