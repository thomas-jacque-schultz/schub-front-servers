import { type Ref } from "react";
import Box from "@mui/material/Box";
import { radii } from "../tokens";

export interface EmbeddedAppProps {
  src: string;
  /** Annoncé par les lecteurs d'écran. */
  title: string;
  onLoad?: () => void;
  ref?: Ref<HTMLIFrameElement>;
}

/** Une application d'un autre domaine (un mini-jeu) dans la page : bord net, hauteur bornée à l'écran. */
export function EmbeddedApp({ src, title, onLoad, ref }: EmbeddedAppProps) {
  return (
    <Box
      component="iframe"
      ref={ref}
      src={src}
      title={title}
      onLoad={onLoad}
      allow="clipboard-write"
      sx={{
        display: "block",
        width: "100%",
        height: "min(78vh, 760px)",
        border: "1px solid",
        borderColor: "divider",
        borderRadius: `${radii.sm}px`,
        bgcolor: "background.paper",
      }}
    />
  );
}
