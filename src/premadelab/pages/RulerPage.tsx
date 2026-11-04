import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  Card,
  Columns,
  DataTable,
  IconButton,
  PageHeader,
  Stack,
  Text,
  distance,
  type DataTableColumn,
  useDocumentMeta,
  useLocaleFormat,
} from "../../common";
import {
  planDeDepart,
  TRAJETS_DE_REFERENCE,
  VITESSE_PAR_DEFAUT,
  type Repere,
} from "../ruler";
import { CanalLocal } from "../macro/canal";
import { MacroPlanner } from "../macro/MacroPlanner";
import { nouvelId } from "../macro/plan";
import { mesureActive } from "../macro/outils/mesure";
import { useMacroPlan } from "../macro/useMacroPlan";
import { useNomDuPoint } from "../macro/useNomDuPoint";

const CLE = "premadelab.macro";

// Le Macro Planner seul (Schub#166) : mesurer, dessiner et poser des icônes sur la Faille, en unités du jeu. Aucun
// appel au serveur ; le plan reste dans le navigateur.
export default function RulerPage() {
  const { t } = useTranslation("lol");
  const { formatNumber } = useLocaleFormat();
  useDocumentMeta({
    title: t("ruler.meta.title"),
    description: t("ruler.meta.description"),
  });
  const canal = useMemo(() => new CanalLocal(CLE, planDeDepart), []);
  const macro = useMacroPlan(canal);
  const nom = useNomDuPoint();
  const marche = (valeur: number) =>
    t("ruler.seconds", {
      value: formatNumber(Math.round((valeur / VITESSE_PAR_DEFAUT) * 10) / 10),
    });
  const montre = (de: Repere, vers: Repere) => {
    const active = mesureActive(macro);
    const id = active?.id ?? nouvelId();
    macro.joue([
      {
        t: "pose",
        e: { id, type: "mesure", a: de, b: vers, r: active?.r ?? 1000 },
      },
    ]);
    macro.choisis(id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const colonnes: Array<DataTableColumn<{ de: Repere; vers: Repere }>> = [
    {
      key: "route",
      header: t("ruler.reference.route"),
      render: ({ de, vers }) =>
        t("ruler.reference.fromTo", { from: nom(de), to: nom(vers) }),
    },
    {
      key: "distance",
      header: t("ruler.reference.unitsHeader"),
      align: "right",
      width: 96,
      render: ({ de, vers }) => formatNumber(Math.round(distance(de, vers))),
    },
    {
      key: "walk",
      header: t("ruler.reference.walkHeader"),
      align: "right",
      width: 84,
      render: ({ de, vers }) => marche(distance(de, vers)),
    },
    {
      key: "show",
      header: "",
      width: 56,
      render: ({ de, vers }) => (
        <IconButton
          icon="ruler"
          size="small"
          label={t("ruler.reference.show")}
          onClick={() => montre(de, vers)}
        />
      ),
    },
  ];

  return (
    <Stack spacing={2}>
      <PageHeader title={t("ruler.title")} subtitle={t("ruler.subtitle")} />
      <MacroPlanner macro={macro} />
      <Card
        title={t("ruler.reference.title")}
        description={t("ruler.reference.description", {
          speed: formatNumber(VITESSE_PAR_DEFAUT),
        })}
      >
        <Columns minWidth={460}>
          {TRAJETS_DE_REFERENCE.map(({ groupe, trajets }) => (
            <Stack key={groupe} spacing={1}>
              <Text variant="section" component="h3">
                {t(`ruler.reference.groups.${groupe}`)}
              </Text>
              <DataTable
                dense
                layout="fixed"
                caption={t(`ruler.reference.groups.${groupe}`)}
                columns={colonnes}
                rows={trajets}
                rowKey={({ de, vers }) =>
                  `${de.side}:${de.id}-${vers.side}:${vers.id}`
                }
                emptyTitle={t("ruler.reference.title")}
              />
            </Stack>
          ))}
        </Columns>
      </Card>
      <Card title={t("ruler.method.title")}>
        <Stack spacing={1.5}>
          <Text>{t("ruler.method.sources")}</Text>
          <Text>{t("ruler.method.units")}</Text>
          <Text>{t("ruler.method.straight")}</Text>
        </Stack>
      </Card>
    </Stack>
  );
}
