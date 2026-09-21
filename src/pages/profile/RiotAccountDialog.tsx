import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ApiError } from "../../api/httpClient";
import { RiotAccountChangeRequired, linkRiotAccountApi } from "../../api/profileApi";
import { claimTeamsApi } from "../../api/teamsApi";
import { RiotAccountPicker } from "../../components/riot/RiotAccountPicker";
import { Alert, Button, Dialog, Stack, Text } from "../../design-system";
import { durationToMinutes } from "./duration";
import type { ProfileDto, RiotAccountChangeDto } from "../../types/profile";

interface RiotAccountDialogProps {
  open: boolean;
  /** Le compte actuellement lié, ou `null`. Sa présence fait de ce dialogue un *changement*. */
  currentRiotId: string | null;
  onClose: () => void;
  onLinked: (profile: ProfileDto) => void;
}

/**
 * Lier — ou changer — son compte Riot.
 *
 * <p>La zone de saisie, la liste et le bouton « demander à Riot » vivent dans
 * {@link RiotAccountPicker} : l'écran d'ajout d'un membre d'équipe pose exactement la même
 * question, et l'API n'y répond que d'une façon. Ce qui reste ici est ce qui n'appartient qu'au
 * profil — le changement et ses conséquences.</p>
 *
 * <h2>Le changement se confirme sur les faits du cœur</h2>
 *
 * <p>Il n'existe pas de route de prévisualisation : un envoi sans `confirmChange` répond 409
 * <em>en portant</em> ce que le remplacement emporte. Le refus est donc l'information, et l'écran
 * ne peut pas proposer de confirmer un changement dont il n'a pas reçu les conséquences. Deux 409
 * possibles, qui se distinguent par la présence de ces conséquences — « déjà pris par quelqu'un
 * d'autre » n'en porte pas, et demande un geste opposé.</p>
 */
export function RiotAccountDialog({
  open,
  currentRiotId,
  onClose,
  onLinked,
}: RiotAccountDialogProps) {
  const { t } = useTranslation("profile");

  /** Le compte qu'on ne peut lier qu'en assumant ce que le cœur a renvoyé avec son refus. */
  const [pending, setPending] = useState<{ riotId: string; change: RiotAccountChangeDto } | null>(
    null,
  );
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const isChange = currentRiotId !== null;

  const messageDeRefus = (cause: unknown): string => {
    // Le statut, et non le texte du serveur : le cœur répond en français, et le reprendre tel
    // quel afficherait une phrase française sur le site anglais.
    if (cause instanceof ApiError && cause.status === 409) {
      return t("riot.link.conflict");
    }
    return cause instanceof Error ? cause.message : t("riot.link.failed");
  };

  const lier = async (riotId: string, confirmChange: boolean) => {
    setIsSaving(true);
    setError("");

    try {
      const profil = await linkRiotAccountApi(riotId, confirmChange);

      // Le cœur le demande explicitement après un succès : c'est cet appel qui rattache les
      // places d'effectif laissées à ce Riot ID, et qui les resynchronise après un changement.
      // Son échec ne remet pas la liaison en cause — elle, elle a abouti.
      await claimTeamsApi().catch(() => undefined);

      onLinked(profil);
      onClose();
    } catch (linkError) {
      if (linkError instanceof RiotAccountChangeRequired) {
        setPending({ riotId, change: linkError.change });
      } else {
        setError(messageDeRefus(linkError));
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog
      open={open}
      title={isChange ? t("riot.change.title") : t("riot.link.title")}
      description={isChange && !pending ? t("riot.change.description") : undefined}
      cancelLabel={t("actions.cancel", { ns: "common" })}
      confirmLabel={pending ? t("riot.change.confirm") : undefined}
      confirmLoading={isSaving}
      destructive={Boolean(pending)}
      onClose={onClose}
      onConfirm={pending ? () => void lier(pending.riotId, true) : undefined}
    >
      <Stack spacing={2.5}>
        {error && <Alert severity="error">{error}</Alert>}

        {pending ? (
          <Stack spacing={2}>
            {/* Revenir à la liste sans perdre la recherche déjà faite. */}
            <Stack direction="row">
              <Button
                variant="ghost"
                onClick={() => {
                  setPending(null);
                  setError("");
                }}
              >
                {t("actions.back", { ns: "common" })}
              </Button>
            </Stack>
            <Text variant="caption" tone="secondary">
              {t("riot.change.from")} : {currentRiotId} — {t("riot.change.to")} : {pending.riotId}
            </Text>
            <ChangeConsequences change={pending.change} />
          </Stack>
        ) : (
          <RiotAccountPicker
            resetKey={open}
            busy={isSaving}
            onPick={(account) => void lier(account.riotId, false)}
          />
        )}
      </Stack>
    </Dialog>
  );
}

/**
 * Ce que le remplacement emporte — **les faits que le cœur a renvoyés**, et rien d'autre.
 *
 * <p>Un champ absent ou faux ne produit aucune ligne. C'est délibéré : inventer « environ vingt
 * minutes » quand le serveur ne l'a pas dit donnerait un chiffre qu'on lirait comme vrai, et qui
 * survivrait à celui qui l'a écrit.</p>
 */
function ChangeConsequences({ change }: { change: RiotAccountChangeDto }) {
  const { t } = useTranslation("profile");

  const minutes = durationToMinutes(change.estimatedDuration);

  const lines: string[] = [];

  if (change.statsReset) {
    lines.push(t("riot.change.statsReset"));
  }
  if (change.ingestRestarted) {
    lines.push(t("riot.change.ingestRestarted"));
  }
  if (change.estimatedMatches > 0) {
    lines.push(t("riot.change.estimatedMatches", { count: change.estimatedMatches }));
  }
  if (minutes !== null && minutes > 0) {
    lines.push(t("riot.change.estimatedDuration", { count: minutes }));
  }
  if (change.rosterSlotsToClaim) {
    lines.push(t("riot.change.rosterSlotsToClaim"));
  }

  if (lines.length === 0) {
    return <Alert severity="warning">{t("riot.change.unknownConsequences")}</Alert>;
  }

  return (
    <Alert severity="warning" title={t("riot.change.consequencesTitle")}>
      <Stack spacing={0.5} component="ul">
        {lines.map((line) => (
          <Text key={line} component="li" variant="caption">
            {line}
          </Text>
        ))}
      </Stack>
    </Alert>
  );
}
