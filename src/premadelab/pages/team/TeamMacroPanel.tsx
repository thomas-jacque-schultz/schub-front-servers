import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  Chip,
  Dialog,
  IconButton,
  SelectField,
  Spinner,
  Stack,
  Switch,
  Text,
  TextField,
  messageOf,
  useAuthStore,
  useLocaleFormat,
  useProfileStore,
  useRequest,
} from "../../../common";
import {
  createMacroPlanApi,
  deleteMacroPlanApi,
  getMacroPassApi,
  getMacroPlanApi,
  listMacroPlansApi,
  updateMacroPlanApi,
} from "../../api/macroApi";
import { CanalEquipe, type EtatEquipe } from "../../macro/canalEquipe";
import { MacroPlanner } from "../../macro/MacroPlanner";
import { lisPlan, type Plan } from "../../macro/plan";
import { useMacroPlan } from "../../macro/useMacroPlan";
import type { MacroPlanRequest, MacroPlanSummaryDto } from "../../types/team";

const CLE_CURSEURS = "premadelab.macro.curseurs";

// Le cœur garde les éléments tels quels : il ne connaît pas leur forme.
const versLeCoeur = (plan: Plan) =>
  plan as unknown as NonNullable<MacroPlanRequest["elements"]>;

const lisCurseurs = () => {
  try {
    return localStorage.getItem(CLE_CURSEURS) !== "non";
  } catch {
    return true;
  }
};

type Edition = "creer" | "renommer" | "supprimer" | null;

/** L'onglet Macro Planner d'une équipe (Schub#171, #172) : ses plans nommés, partagés en temps réel. */
export function TeamMacroPanel({ teamId }: { teamId: string }) {
  const { t } = useTranslation("lol");
  const plans = useRequest(`macro-plans/${teamId}`, () =>
    listMacroPlansApi(teamId),
  );
  const [choisi, setChoisi] = useState<string | null>(null);
  const premierCree = useRef(false);

  // Une équipe sans plan en reçoit un à l'ouverture : l'onglet s'ouvre sur une carte, pas sur un formulaire.
  useEffect(() => {
    if (plans.data?.length === 0 && !premierCree.current) {
      premierCree.current = true;
      void createMacroPlanApi(teamId, { name: t("macro.team.defaultName") })
        .then((cree) => {
          setChoisi(cree.id);
          return plans.reload();
        })
        .catch(() => undefined);
    }
  }, [plans, t, teamId]);

  if (plans.error) {
    return <Alert severity="warning">{t("macro.team.loadFailed")}</Alert>;
  }
  const liste = plans.data ?? [];
  const planId =
    liste.find((plan) => plan.id === choisi)?.id ?? liste[0]?.id ?? null;
  if (!planId) {
    return <Spinner label={t("macro.team.connecting")} />;
  }
  return (
    <PlanDEquipe
      key={planId}
      teamId={teamId}
      planId={planId}
      plans={liste}
      onChoisis={setChoisi}
      onPlansChanges={async (selection) => {
        await plans.reload();
        setChoisi(selection);
      }}
    />
  );
}

function PlanDEquipe({
  teamId,
  planId,
  plans,
  onChoisis,
  onPlansChanges,
}: {
  teamId: string;
  planId: string;
  plans: MacroPlanSummaryDto[];
  onChoisis: (id: string) => void;
  onPlansChanges: (selection: string | null) => Promise<void>;
}) {
  const { t } = useTranslation("lol");
  const { formatTime } = useLocaleFormat();
  const { profile: session } = useAuthStore();
  const { profile } = useProfileStore();
  const nom = profile?.displayName ?? session?.username ?? "?";
  const [etat, setEtat] = useState<EtatEquipe | null>(null);
  const [curseurs, setCurseurs] = useState(lisCurseurs);
  const [edition, setEdition] = useState<Edition>(null);
  const [saisie, setSaisie] = useState("");
  const [erreur, setErreur] = useState<string | null>(null);
  const plan = plans.find((candidat) => candidat.id === planId);

  // Le nom ne rouvre pas le salon : il n'est lu qu'à la connexion.
  const nomLu = useRef(nom);
  const canal = useMemo(
    () =>
      new CanalEquipe({
        teamId,
        planId,
        nom: nomLu.current,
        charge: async () =>
          lisPlan((await getMacroPlanApi(teamId, planId)).elements),
        enregistre: async (elements) => {
          await updateMacroPlanApi(teamId, planId, {
            elements: versLeCoeur(elements),
          });
        },
        pass: async () => (await getMacroPassApi(teamId)).pass,
        surEtat: setEtat,
      }),
    [teamId, planId],
  );
  const macro = useMacroPlan(canal);

  const basculeCurseurs = (voir: boolean) => {
    setCurseurs(voir);
    if (!voir) {
      canal.curseur(null);
    }
    try {
      localStorage.setItem(CLE_CURSEURS, voir ? "oui" : "non");
    } catch {
      // Le réglage vit le temps de la page.
    }
  };

  const valide = async () => {
    setErreur(null);
    try {
      if (edition === "creer") {
        const cree = await createMacroPlanApi(teamId, { name: saisie.trim() });
        await onPlansChanges(cree.id);
      } else if (edition === "renommer") {
        await updateMacroPlanApi(teamId, planId, { name: saisie.trim() });
        await onPlansChanges(planId);
      } else if (edition === "supprimer") {
        await deleteMacroPlanApi(teamId, planId);
        await onPlansChanges(null);
      }
      setEdition(null);
    } catch (echec) {
      setErreur(messageOf(echec, t("macro.team.saveFailed")));
    }
  };

  const duplique = async () => {
    setErreur(null);
    try {
      const copie = await createMacroPlanApi(teamId, {
        name: t("macro.team.copyName", { name: plan?.name ?? "" }).slice(0, 60),
        elements: versLeCoeur(macro.plan),
      });
      await onPlansChanges(copie.id);
    } catch (echec) {
      setErreur(messageOf(echec, t("macro.team.saveFailed")));
    }
  };

  const enregistrement = etat?.enregistrement;
  const statut =
    etat?.connexion === "connexion" || !etat
      ? t("macro.team.connecting")
      : etat.connexion === "reconnexion"
        ? t("macro.team.reconnecting")
        : enregistrement?.etat === "en-cours"
          ? t("macro.team.saving")
          : enregistrement?.etat === "a-jour" && enregistrement.a
            ? t("macro.team.saved", { time: formatTime(enregistrement.a) })
            : null;

  if (etat?.connexion === "refuse") {
    return <Alert severity="warning">{t("macro.team.forbidden")}</Alert>;
  }

  const enTete = (
    <Stack spacing={1}>
      <Stack direction="row" spacing={1} align="center" wrap>
        <SelectField
          label={t("macro.team.plan")}
          size="small"
          value={planId}
          onChange={onChoisis}
          options={plans.map((candidat) => ({
            value: candidat.id,
            label: candidat.name,
          }))}
        />
        <IconButton
          icon="add"
          label={t("macro.team.create")}
          onClick={() => {
            setSaisie("");
            setEdition("creer");
          }}
        />
        <IconButton
          icon="edit"
          label={t("macro.team.rename")}
          onClick={() => {
            setSaisie(plan?.name ?? "");
            setEdition("renommer");
          }}
        />
        <IconButton
          icon="copy"
          label={t("macro.team.duplicate")}
          onClick={() => void duplique()}
        />
        <IconButton
          icon="delete"
          label={t("macro.team.delete")}
          destructive
          onClick={() => setEdition("supprimer")}
        />
      </Stack>
      <Stack direction="row" spacing={1} align="center" wrap>
        <Text variant="caption" tone="secondary">
          {t("macro.team.present")}
        </Text>
        {(etat?.membres ?? []).map((membre) => (
          <Chip key={membre.id} label={membre.name} />
        ))}
        <Switch
          checked={curseurs}
          onChange={basculeCurseurs}
          label={t("macro.team.cursors")}
          helperText={t("macro.team.cursorsHint")}
        />
      </Stack>
      {statut && (
        <Text variant="caption" tone="secondary">
          {statut}
        </Text>
      )}
      {enregistrement?.etat === "echec" && (
        <Alert severity="warning">{t("macro.team.saveFailed")}</Alert>
      )}
      {erreur && <Alert severity="error">{erreur}</Alert>}
    </Stack>
  );

  return (
    <>
      <MacroPlanner
        macro={macro}
        header={enTete}
        cursors={curseurs ? etat?.curseurs : undefined}
        onCursor={curseurs ? (point) => canal.curseur(point) : undefined}
      />
      <Dialog
        open={edition === "creer" || edition === "renommer"}
        title={t(
          edition === "creer"
            ? "macro.team.createTitle"
            : "macro.team.renameTitle",
        )}
        cancelLabel={t("actions.cancel", { ns: "common" })}
        confirmLabel={t("macro.team.save")}
        confirmDisabled={!saisie.trim()}
        onClose={() => setEdition(null)}
        onConfirm={() => void valide()}
      >
        <TextField
          label={t("macro.team.name")}
          value={saisie}
          onChange={setSaisie}
          helperText={t("macro.team.nameHint")}
          required
          autoFocus
        />
      </Dialog>
      <Dialog
        open={edition === "supprimer"}
        title={t("macro.team.deleteTitle", { name: plan?.name ?? "" })}
        description={t("macro.team.deleteDescription")}
        cancelLabel={t("actions.cancel", { ns: "common" })}
        confirmLabel={t("macro.team.delete")}
        destructive
        onClose={() => setEdition(null)}
        onConfirm={() => void valide()}
      />
    </>
  );
}
