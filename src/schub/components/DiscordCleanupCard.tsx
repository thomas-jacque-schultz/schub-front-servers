import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  Button,
  Card,
  Dialog,
  Stack,
  Text,
  messageOf,
} from "../../common";
import { cleanChannelsApi, previewChannelCleanupApi } from "../api/discordApi";
import type { ChannelCleanupDto } from "../types/discord";

const totaux = (salons: ChannelCleanupDto[]) => {
  const traites = salons.filter((s) => s.allowed);
  return {
    channels: traites.length,
    messages: traites.reduce((somme, s) => somme + s.toDelete, 0),
    reposts: traites.reduce((somme, s) => somme + s.toRepost, 0),
  };
};

/** Le décompte est demandé avant d'ouvrir la confirmation : rien n'est supprimé tant qu'elle n'est pas validée (discord#28). */
function DiscordCleanupCard() {
  const { t } = useTranslation("discord");
  const [apercu, setApercu] = useState<ChannelCleanupDto[] | null>(null);
  const [enCours, setEnCours] = useState(false);
  const [erreur, setErreur] = useState("");
  const [bilan, setBilan] = useState("");

  const ouvrir = async () => {
    setEnCours(true);
    setErreur("");
    setBilan("");
    try {
      setApercu(await previewChannelCleanupApi());
    } catch (e) {
      setErreur(messageOf(e, t("cleanup.errors.preview")));
    } finally {
      setEnCours(false);
    }
  };

  const nettoyer = async () => {
    setEnCours(true);
    try {
      setBilan(t("cleanup.done", totaux(await cleanChannelsApi())));
      setApercu(null);
    } catch (e) {
      setErreur(messageOf(e, t("cleanup.errors.clean")));
      setApercu(null);
    } finally {
      setEnCours(false);
    }
  };

  const prevu = apercu ? totaux(apercu) : null;
  const interdits = apercu?.filter((s) => !s.allowed) ?? [];
  const rienAFaire = prevu !== null && prevu.messages + prevu.reposts === 0;

  return (
    <Card title={t("cleanup.title")} description={t("cleanup.description")}>
      <Stack spacing={2}>
        {erreur && <Alert severity="error">{erreur}</Alert>}
        {bilan && <Alert severity="success">{bilan}</Alert>}
        <Stack direction="row" justify="end">
          <Button
            variant="danger"
            onClick={() => void ouvrir()}
            loading={enCours && apercu === null}
          >
            {t("cleanup.button")}
          </Button>
        </Stack>
      </Stack>
      <Dialog
        open={apercu !== null}
        title={t("cleanup.title")}
        description={
          rienAFaire ? t("cleanup.nothing") : t("cleanup.summary", prevu ?? {})
        }
        confirmLabel={t("cleanup.confirm")}
        cancelLabel={t("actions.cancel", { ns: "common" })}
        onConfirm={() => void nettoyer()}
        onClose={() => setApercu(null)}
        confirmDisabled={rienAFaire}
        confirmLoading={enCours}
        destructive
      >
        {interdits.length > 0 && (
          <Alert severity="warning">
            <Text>
              {t("cleanup.forbidden", {
                channels: interdits.map((s) => `#${s.name}`).join(", "),
              })}
            </Text>
          </Alert>
        )}
      </Dialog>
    </Card>
  );
}

export default DiscordCleanupCard;
