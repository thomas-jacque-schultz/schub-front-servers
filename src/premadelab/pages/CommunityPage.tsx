import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import {
  APP_URLS,
  Button,
  Card,
  EmbeddedApp,
  PageHeader,
  Stack,
  Text,
  Toast,
  useCurrentLanguage,
  useDocumentMeta,
  useLocalizedNavigate,
  useLocalizedPath,
} from "../../common";
import { SCRIBBLE_ORIGIN, SCRIBBLE_URL } from "../games";

// Les mini-jeux entre premades (Schub#118). Le jeu vit sur son sous-domaine, dans une iframe ; avec lui, deux
// messages seulement : l'init (salon et langue), puis le salon qu'il vient de créer.
export default function CommunityPage() {
  const { t } = useTranslation("lol");
  const { game, room } = useParams();
  useDocumentMeta({
    title: t("community.meta.title"),
    description: t("community.meta.description"),
  });

  return (
    <Stack spacing={2}>
      <PageHeader
        title={t("community.title")}
        subtitle={t("community.subtitle")}
      />
      {game === "scribble" ? (
        <ScribbleRoom room={room ?? null} />
      ) : (
        <Catalogue />
      )}
    </Stack>
  );
}

function Catalogue() {
  const { t } = useTranslation("lol");
  const navigate = useLocalizedNavigate();
  return (
    <Card title={t("community.scribble.title")}>
      <Stack spacing={1.5}>
        <Text>{t("community.scribble.body")}</Text>
        <div>
          <Button onClick={() => navigate("/community/scribble")}>
            {t("community.scribble.create")}
          </Button>
        </div>
      </Stack>
    </Card>
  );
}

function ScribbleRoom({ room }: { room: string | null }) {
  const { t } = useTranslation("lol");
  const lang = useCurrentLanguage();
  const localize = useLocalizedPath();
  const navigate = useLocalizedNavigate();
  const cadre = useRef<HTMLIFrameElement>(null);
  // Le salon annoncé par le jeu lui-même : l'adresse change, l'iframe ne se recharge pas.
  const annonce = useRef<string | null>(null);
  // Le salon transmis au jeu à son chargement ; un autre lien collé dans l'adresse recharge le jeu sur lui.
  const [transmis, setTransmis] = useState(room);
  const [toast, setToast] = useState("");

  useEffect(() => {
    if (room !== annonce.current) {
      setTransmis(room);
    }
  }, [room]);

  useEffect(() => {
    const ecoute = (event: MessageEvent) => {
      const data = event.data as { type?: unknown; room?: unknown } | null;
      if (
        event.origin !== SCRIBBLE_ORIGIN ||
        data?.type !== "premadelab:room" ||
        typeof data.room !== "string"
      ) {
        return;
      }
      if (/^[A-Z]{4}$/.test(data.room) && data.room !== room) {
        annonce.current = data.room;
        navigate(`/community/scribble/${data.room}`, { replace: true });
      }
    };
    window.addEventListener("message", ecoute);
    return () => window.removeEventListener("message", ecoute);
  }, [navigate, room]);

  const lien = room
    ? `${APP_URLS.premadelab}${localize(`/community/scribble/${room}`)}`
    : null;

  return (
    <Stack spacing={1.5}>
      <EmbeddedApp
        key={transmis ?? "neuf"}
        ref={cadre}
        src={SCRIBBLE_URL}
        title={t("community.scribble.title")}
        onLoad={() =>
          cadre.current?.contentWindow?.postMessage(
            { type: "premadelab:init", room: transmis, lang },
            SCRIBBLE_ORIGIN,
          )
        }
      />
      {lien && (
        <Stack direction="row" spacing={1} align="center" wrap>
          <Text variant="caption">{t("community.scribble.share")}</Text>
          <Text variant="caption" mono>
            {lien}
          </Text>
          <Button
            size="small"
            variant="secondary"
            onClick={() =>
              void navigator.clipboard.writeText(lien).then(
                () => setToast(t("community.scribble.copied")),
                () => setToast(lien),
              )
            }
          >
            {t("community.scribble.copy")}
          </Button>
        </Stack>
      )}
      <Toast
        open={Boolean(toast)}
        message={toast}
        onClose={() => setToast("")}
      />
    </Stack>
  );
}
