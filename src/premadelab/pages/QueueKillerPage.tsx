import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import {
  APP_URLS,
  Avatar,
  BulletList,
  Button,
  Card,
  Columns,
  GameFrame,
  GamePoster,
  PageHeader,
  SelectField,
  Stack,
  Text,
  TextField,
  Toast,
  useAuthStore,
  useProfileStore,
  useCurrentLanguage,
  useDocumentMeta,
  useLocalizedNavigate,
  useLocalizedPath,
} from "../../common";
import {
  CODE_SALON,
  estJeu,
  FICHES,
  type Jeu,
  JEUX,
  JOUEURS_MAX,
  origineDuJeu,
  splashDuJeu,
  urlDuJeu,
  vignetteDuJeu,
} from "../queueKiller";
import {
  getSalonsDePremadeApi,
  quitteSalonApi,
  type SalonDePremade,
  signalePresenceApi,
} from "../api/queueKillerApi";

// Le cœur oublie une présence après 90 s sans signal (Schub#149).
const PRESENCE_MS = 30_000;

// Les mini-jeux entre premades (Schub#118). Le jeu vit sur son sous-domaine, dans une iframe ; avec lui, deux
// messages seulement : l'init (salon et langue), puis le salon qu'il vient de créer.
export default function QueueKillerPage() {
  const { t } = useTranslation("lol");
  const { game, room } = useParams();
  useDocumentMeta({
    title: t("queueKiller.meta.title"),
    description: t("queueKiller.meta.description"),
  });

  return estJeu(game) ? (
    <Salon key={game} jeu={game} room={room ?? null} />
  ) : (
    <Stack spacing={3}>
      <PageHeader
        title={t("queueKiller.title")}
        subtitle={t("queueKiller.subtitle")}
      />
      <Catalogue />
      <SalonsDePremade />
      <Columns count={2} minWidth={320}>
        <Card title={t("queueKiller.how.title")}>
          <BulletList
            ordered
            tone="secondary"
            items={[
              t("queueKiller.how.create"),
              t("queueKiller.how.share"),
              t("queueKiller.how.play"),
            ]}
          />
        </Card>
        <Rejoindre />
      </Columns>
    </Stack>
  );
}

function Catalogue() {
  const { t } = useTranslation("lol");
  const localize = useLocalizedPath();
  return (
    <Columns count={JEUX.length} minWidth={240}>
      {JEUX.map((jeu) => {
        const fiche = FICHES[jeu];
        return (
          <GamePoster
            key={jeu}
            title={t(`queueKiller.${jeu}.title`)}
            image={splashDuJeu(jeu)}
            genre={t(`queueKiller.${jeu}.genre`)}
            tags={[
              t("queueKiller.players", {
                min: fiche.joueursMin,
                max: JOUEURS_MAX,
              }),
              t("queueKiller.minutes", { n: fiche.minutes }),
            ]}
            body={t(`queueKiller.${jeu}.body`)}
            action={t("queueKiller.create")}
            to={localize(`/queue-killer/${jeu}`)}
          />
        );
      })}
    </Columns>
  );
}

function SalonsDePremade() {
  const { t } = useTranslation("lol");
  const { connected } = useAuthStore();
  const navigate = useLocalizedNavigate();
  const [salons, setSalons] = useState<SalonDePremade[]>([]);

  useEffect(() => {
    if (!connected) {
      return;
    }
    let actif = true;
    const lis = () =>
      void getSalonsDePremadeApi().then(
        (lus) => actif && setSalons(lus),
        () => undefined,
      );
    lis();
    const minuterie = window.setInterval(lis, PRESENCE_MS);
    return () => {
      actif = false;
      window.clearInterval(minuterie);
    };
  }, [connected]);

  const visibles = connected
    ? salons.filter((salon): salon is SalonDePremade & { game: Jeu } =>
        estJeu(salon.game),
      )
    : [];
  if (visibles.length === 0) {
    return null;
  }
  return (
    <Card
      title={t("queueKiller.premade.title")}
      description={t("queueKiller.premade.description")}
    >
      <Stack spacing={1.5}>
        {visibles.map((salon) => (
          <Stack
            key={`${salon.game}/${salon.room}`}
            direction="responsive"
            justify="between"
            spacing={1}
          >
            <Stack direction="row" spacing={2} align="center" wrap>
              <Stack direction="row" spacing={1} align="center">
                <Avatar
                  src={vignetteDuJeu(salon.game)}
                  name={t(`queueKiller.${salon.game}.title`)}
                />
                <Text variant="subtitle">
                  {t(`queueKiller.${salon.game}.title`)}
                </Text>
              </Stack>
              <Stack direction="row" spacing={1.5} align="center" wrap>
                {salon.players.map((joueur, index) => (
                  <Stack
                    key={index}
                    direction="row"
                    spacing={0.75}
                    align="center"
                  >
                    <Avatar
                      src={joueur.avatarUrl}
                      name={joueur.displayName}
                      size="small"
                    />
                    <Text variant="caption">{joueur.displayName}</Text>
                  </Stack>
                ))}
              </Stack>
            </Stack>
            <div>
              <Button
                onClick={() =>
                  navigate(`/queue-killer/${salon.game}/${salon.room}`)
                }
              >
                {t("queueKiller.premade.join")}
              </Button>
            </div>
          </Stack>
        ))}
      </Stack>
    </Card>
  );
}

function Rejoindre() {
  const { t } = useTranslation("lol");
  const navigate = useLocalizedNavigate();
  const [jeu, setJeu] = useState<Jeu>(JEUX[0]);
  const [code, setCode] = useState("");
  const valide = CODE_SALON.test(code);
  const rejoins = () => valide && navigate(`/queue-killer/${jeu}/${code}`);

  return (
    <Card
      title={t("queueKiller.join.title")}
      description={t("queueKiller.join.description")}
    >
      <Stack
        component="form"
        direction="responsive"
        spacing={1.5}
        onSubmit={(event) => {
          event.preventDefault();
          rejoins();
        }}
      >
        <SelectField
          label={t("queueKiller.join.game")}
          value={jeu}
          onChange={(valeur) => estJeu(valeur) && setJeu(valeur)}
          options={JEUX.map((j) => ({
            value: j,
            label: t(`queueKiller.${j}.title`),
          }))}
        />
        <TextField
          label={t("queueKiller.join.code")}
          value={code}
          onChange={(saisie) =>
            setCode(
              saisie
                .toUpperCase()
                .replace(/[^A-Z]/g, "")
                .slice(0, 4),
            )
          }
          onEnter={rejoins}
        />
        <Button type="submit" besideField disabled={!valide}>
          {t("queueKiller.join.submit")}
        </Button>
      </Stack>
    </Card>
  );
}

// Tant que le salon est ouvert, ses coéquipiers le voient dans Queue Killer.
function usePresence(jeu: Jeu, room: string | null) {
  const { connected } = useAuthStore();
  useEffect(() => {
    if (!connected || !room) {
      return;
    }
    const signale = () =>
      void signalePresenceApi(jeu, room).catch(() => undefined);
    const quitte = () => void quitteSalonApi(jeu, room).catch(() => undefined);
    signale();
    const minuterie = window.setInterval(signale, PRESENCE_MS);
    window.addEventListener("pagehide", quitte);
    return () => {
      window.clearInterval(minuterie);
      window.removeEventListener("pagehide", quitte);
      quitte();
    };
  }, [connected, jeu, room]);
}

function Salon({ jeu, room }: { jeu: Jeu; room: string | null }) {
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
  // Compte les chargements de l'iframe : chacun attend son init.
  const [charges, setCharges] = useState(0);
  const { connected } = useAuthStore();
  const { profile, isLoading } = useProfileStore();
  usePresence(jeu, room);

  // Le pseudo du compte part avec l'init (Schub#167) : on attend le profil, sinon le jeu demanderait un pseudo.
  useEffect(() => {
    if (charges === 0 || (connected && !profile && isLoading)) {
      return;
    }
    cadre.current?.contentWindow?.postMessage(
      {
        type: "premadelab:init",
        room: transmis,
        lang,
        nom: connected ? (profile?.displayName ?? null) : null,
      },
      origineDuJeu(jeu),
    );
  }, [charges, connected, isLoading, jeu, lang, profile, transmis]);

  useEffect(() => {
    if (room !== annonce.current) {
      setTransmis(room);
    }
  }, [room]);

  useEffect(() => {
    const ecoute = (event: MessageEvent) => {
      const data = event.data as { type?: unknown; room?: unknown } | null;
      if (
        event.origin !== origineDuJeu(jeu) ||
        data?.type !== "premadelab:room" ||
        typeof data.room !== "string"
      ) {
        return;
      }
      if (CODE_SALON.test(data.room) && data.room !== room) {
        annonce.current = data.room;
        navigate(`/queue-killer/${jeu}/${data.room}`, { replace: true });
      }
    };
    window.addEventListener("message", ecoute);
    return () => window.removeEventListener("message", ecoute);
  }, [jeu, navigate, room]);

  const lien = room
    ? APP_URLS.premadelab + localize(`/queue-killer/${jeu}/${room}`)
    : null;

  return (
    <>
      <GameFrame
        key={transmis ?? "neuf"}
        ref={cadre}
        src={urlDuJeu(jeu)}
        title={t(`queueKiller.${jeu}.title`)}
        image={vignetteDuJeu(jeu)}
        onLoad={() => setCharges((n) => n + 1)}
        back={{ label: t("queueKiller.back"), to: localize("/queue-killer") }}
        room={room}
        roomLabel={t("queueKiller.room")}
        waitingLabel={t("queueKiller.waiting")}
        copyLabel={t("queueKiller.copy")}
        onCopy={() =>
          lien &&
          void navigator.clipboard.writeText(lien).then(
            () => setToast(t("queueKiller.copied")),
            () => setToast(lien),
          )
        }
        fullscreenLabel={t("queueKiller.fullscreen")}
        exitFullscreenLabel={t("queueKiller.exitFullscreen")}
      />
      <Toast
        open={Boolean(toast)}
        message={toast}
        onClose={() => setToast("")}
      />
    </>
  );
}
