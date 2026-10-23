import { type Ref, useEffect, useRef, useState } from "react";
import Box from "@mui/material/Box";
import MuiButton from "@mui/material/Button";
import MuiIconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import { Link as RouterLink } from "react-router-dom";
import { palettes, playful, typographyTokens } from "../tokens";
import { Icon } from "./Icon";
import { Tooltip } from "./Tooltip";

// Sombre en clair comme en sombre : la barre fait corps avec le jeu qu'elle encadre.
const encre = palettes.dark.text;

const commande = {
  color: encre.primary,
  bgcolor: playful.tile,
  borderRadius: `${playful.radii.control}px`,
  "&:hover": { bgcolor: playful.tileHover },
};

export interface GameFrameProps {
  /** L'adresse du jeu, sur son sous-domaine. */
  src: string;
  title: string;
  icon: string;
  onLoad?: () => void;
  ref?: Ref<HTMLIFrameElement>;
  back: { label: string; to: string };
  /** Le code du salon ; null tant que le jeu ne l'a pas annoncé. */
  room: string | null;
  roomLabel: string;
  waitingLabel: string;
  copyLabel: string;
  onCopy: () => void;
  fullscreenLabel: string;
  exitFullscreenLabel: string;
}

/** Un mini-jeu d'un autre domaine dans la page : sa barre (retour, salon, lien, plein écran), puis l'iframe. */
export function GameFrame({
  src,
  title,
  icon,
  onLoad,
  ref,
  back,
  room,
  roomLabel,
  waitingLabel,
  copyLabel,
  onCopy,
  fullscreenLabel,
  exitFullscreenLabel,
}: GameFrameProps) {
  const cadre = useRef<HTMLDivElement>(null);
  const [pleinEcran, setPleinEcran] = useState(false);
  // Safari sur iPhone n'ouvre en plein écran qu'une vidéo.
  const [permis] = useState(
    () => typeof document !== "undefined" && document.fullscreenEnabled,
  );

  useEffect(() => {
    const suit = () =>
      setPleinEcran(document.fullscreenElement === cadre.current);
    document.addEventListener("fullscreenchange", suit);
    return () => document.removeEventListener("fullscreenchange", suit);
  }, []);

  const bascule = () =>
    void (pleinEcran
      ? document.exitFullscreen()
      : cadre.current?.requestFullscreen());

  return (
    <Box
      ref={cadre}
      sx={{
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        borderRadius: `${playful.radii.card}px`,
        border: "1px solid",
        borderColor: playful.edge,
        background: playful.page,
        boxShadow: playful.glow,
        "&:fullscreen": { borderRadius: 0, border: "none" },
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: { xs: 1, sm: 1.5 },
          px: { xs: 1, sm: 1.5 },
          py: 1,
          background: playful.panel,
          borderBottom: "1px solid",
          borderColor: playful.edge,
          color: encre.primary,
        }}
      >
        <MuiButton
          component={RouterLink}
          to={back.to}
          aria-label={back.label}
          startIcon={<Icon name="back" size="small" />}
          sx={{
            ...commande,
            flexShrink: 0,
            minWidth: 0,
            px: 1.25,
            fontFamily: playful.fontFamily,
            textTransform: "none",
            "& .MuiButton-startIcon": { mr: { xs: 0, sm: 1 }, ml: 0 },
          }}
        >
          <Box component="span" sx={{ display: { xs: "none", sm: "inline" } }}>
            {back.label}
          </Box>
        </MuiButton>
        <Typography
          component="h1"
          noWrap
          sx={{
            flex: 1,
            minWidth: 0,
            fontFamily: playful.fontFamily,
            fontWeight: 700,
            fontSize: { xs: "1.0625rem", sm: "1.25rem" },
          }}
        >
          <Box component="span" aria-hidden sx={{ mr: 1 }}>
            {icon}
          </Box>
          {title}
        </Typography>
        {room ? (
          <>
            <Box
              sx={{
                display: "flex",
                alignItems: "baseline",
                gap: 1,
                flexShrink: 0,
              }}
            >
              <Typography
                variant="overline"
                sx={{
                  color: encre.secondary,
                  display: { xs: "none", md: "inline" },
                }}
              >
                {roomLabel}
              </Typography>
              <Typography
                aria-label={`${roomLabel} ${room}`}
                sx={{
                  fontFamily: typographyTokens.monospaceFontFamily,
                  fontWeight: 700,
                  fontSize: { xs: "1.125rem", sm: "1.375rem" },
                  letterSpacing: "0.18em",
                  color: palettes.dark.primary.main,
                }}
              >
                {room}
              </Typography>
            </Box>
            <MuiButton
              onClick={onCopy}
              aria-label={copyLabel}
              startIcon={<Icon name="copy" size="small" />}
              sx={{
                ...commande,
                flexShrink: 0,
                minWidth: 0,
                px: 1.25,
                fontFamily: playful.fontFamily,
                textTransform: "none",
                "& .MuiButton-startIcon": { mr: { xs: 0, md: 1 }, ml: 0 },
              }}
            >
              <Box
                component="span"
                sx={{ display: { xs: "none", md: "inline" } }}
              >
                {copyLabel}
              </Box>
            </MuiButton>
          </>
        ) : (
          <Typography
            variant="body2"
            sx={{ color: encre.secondary, flexShrink: 0 }}
          >
            {waitingLabel}
          </Typography>
        )}
        {permis && (
          <Tooltip title={pleinEcran ? exitFullscreenLabel : fullscreenLabel}>
            <MuiIconButton
              onClick={bascule}
              aria-label={pleinEcran ? exitFullscreenLabel : fullscreenLabel}
              sx={{ ...commande, flexShrink: 0 }}
            >
              <Icon
                name={pleinEcran ? "fullscreenExit" : "fullscreen"}
                size="small"
              />
            </MuiIconButton>
          </Tooltip>
        )}
      </Box>
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
          border: "none",
          height: {
            xs: "calc(100dvh - 96px)",
            md: "clamp(560px, calc(100dvh - 190px), 900px)",
          },
          "*:fullscreen > &": { flex: 1, height: "auto" },
        }}
      />
    </Box>
  );
}
