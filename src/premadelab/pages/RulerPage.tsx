import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Card,
  Columns,
  DataTable,
  IconButton,
  MapRuler,
  PageHeader,
  SegmentedControl,
  SideLayout,
  Stack,
  StatTile,
  Switch,
  Text,
  TextField,
  distance,
  type DataTableColumn,
  useCurrentLanguage,
  useDocumentMeta,
  useLocaleFormat,
  useRequest,
  type MapPoint,
} from "../../common";
import {
  ecrireMesure,
  lireMesure,
  PORTEES,
  REPERES,
  repereEn,
  TRAJETS_DE_REFERENCE,
  VITESSE_PAR_DEFAUT,
  type Mesure,
  type Repere,
} from "../ruler";
import { chargerChampions } from "../rulerChampions";
import {
  ChampionPicker,
  ChampionSpells,
  type PorteeTracee,
} from "./ruler/ChampionRanges";

const PERSO = "custom";

// La règle : une mesure de A à B sur la Faille, en unités du jeu, un cercle de portée autour de A et le temps
// de marche. Aucun appel au serveur ; la mesure reste dans le navigateur.
export default function RulerPage() {
  const { t } = useTranslation("lol");
  const { formatNumber } = useLocaleFormat();
  useDocumentMeta({
    title: t("ruler.meta.title"),
    description: t("ruler.meta.description"),
  });
  const [mesure, setMesure] = useState<Mesure>(lireMesure);
  const [aimant, setAimant] = useState(true);
  const [perso, setPerso] = useState(() => !PORTEES.includes(mesure.r));
  const [porteeSaisie, setPorteeSaisie] = useState(String(mesure.r));
  const [vitesseSaisie, setVitesseSaisie] = useState(
    String(VITESSE_PAR_DEFAUT),
  );
  const langue = useCurrentLanguage();
  const catalogue = useRequest(`ddragon/${langue}`, () =>
    chargerChampions(langue),
  );
  const [championId, setChampionId] = useState<string | null>(null);
  const champion =
    catalogue.data?.champions.find((candidat) => candidat.id === championId) ??
    null;
  // La portée tracée par un sort : elle nomme le cercle tant que personne ne change le rayon à la main.
  const [tracee, setTracee] = useState<PorteeTracee | null>(null);
  const changerRayon = (portee: number) => {
    setTracee(null);
    setMesure({ ...mesure, r: portee });
  };
  const tracer = (portee: PorteeTracee) => {
    setTracee(portee);
    setPerso(!PORTEES.includes(portee.range));
    setPorteeSaisie(String(portee.range));
    setMesure({ ...mesure, r: portee.range });
  };
  const choisirChampion = (id: string | null) => {
    setChampionId(id);
    setTracee(null);
    const choisi = catalogue.data?.champions.find(
      (candidat) => candidat.id === id,
    );
    if (choisi) {
      setVitesseSaisie(String(choisi.moveSpeed));
    }
  };

  useEffect(() => ecrireMesure(mesure), [mesure]);

  const { a, b, r } = mesure;
  const d = distance(a, b);
  const vitesse = Number(vitesseSaisie);
  const nom = (point: MapPoint) => {
    const repere = repereEn(point);
    return repere
      ? t(
          repere.approche
            ? "ruler.landmarkOnSideApproximate"
            : "ruler.landmarkOnSide",
          {
            name: t(`ruler.landmarks.${repere.id}`),
            side: t(`ruler.sides.${repere.side}`),
          },
        )
      : t("ruler.freePoint");
  };
  const unites = (valeur: number) =>
    t("ruler.units", { value: formatNumber(Math.round(valeur)) });
  const marche = (valeur: number) =>
    vitesse > 0
      ? t("ruler.seconds", {
          value: formatNumber(Math.round((valeur / vitesse) * 10) / 10),
        })
      : "—";
  const aPortee = d <= r;
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
          onClick={() => {
            setMesure({ ...mesure, a: de, b: vers });
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        />
      ),
    },
  ];

  return (
    <Stack spacing={2}>
      <PageHeader title={t("ruler.title")} subtitle={t("ruler.subtitle")} />
      <SideLayout
        sideWidth={300}
        side={
          <Stack spacing={2}>
            <Card title={t("ruler.measure")}>
              <Stack spacing={1.5}>
                <StatTile label={t("ruler.distance")} value={unites(d)} />
                <StatTile
                  label={t("ruler.walk")}
                  value={marche(d)}
                  hint={
                    vitesse > 0
                      ? t("ruler.walkHint", { speed: formatNumber(vitesse) })
                      : undefined
                  }
                />
                <StatTile
                  label={
                    tracee?.range === r
                      ? t("ruler.rangeOf", {
                          radius: formatNumber(r),
                          source: tracee.label,
                        })
                      : t("ruler.range", { radius: formatNumber(r) })
                  }
                  value={
                    aPortee
                      ? t("ruler.inRange")
                      : t("ruler.missing", { value: unites(d - r) })
                  }
                />
                <Text variant="caption" tone="secondary">
                  {t("ruler.pointA", { name: nom(a) })}
                </Text>
                <Text variant="caption" tone="secondary">
                  {t("ruler.pointB", { name: nom(b) })}
                </Text>
              </Stack>
            </Card>
            <ChampionSpells
              champion={champion}
              version={catalogue.data?.version ?? null}
              langue={langue}
              traced={tracee}
              onTrace={tracer}
            />
            <Card title={t("ruler.settings")}>
              <Stack spacing={2}>
                <Switch
                  checked={aimant}
                  onChange={setAimant}
                  label={t("ruler.snap")}
                  helperText={t("ruler.snapHint")}
                />
                <Stack spacing={1}>
                  <Text variant="caption" tone="secondary">
                    {t("ruler.radius")}
                  </Text>
                  <SegmentedControl
                    label={t("ruler.radius")}
                    value={perso ? PERSO : String(r)}
                    options={[
                      ...PORTEES.map((portee) => ({
                        value: String(portee),
                        label: formatNumber(portee),
                      })),
                      { value: PERSO, label: t("ruler.custom") },
                    ]}
                    onChange={(choix) => {
                      if (choix === PERSO) {
                        setPerso(true);
                        setPorteeSaisie(String(r));
                        return;
                      }
                      setPerso(false);
                      changerRayon(Number(choix));
                    }}
                  />
                  {perso && (
                    <TextField
                      type="number"
                      label={t("ruler.customRadius")}
                      value={porteeSaisie}
                      onChange={(valeur) => {
                        setPorteeSaisie(valeur);
                        const portee = Number(valeur);
                        if (portee > 0) {
                          changerRayon(portee);
                        }
                      }}
                      error={!(Number(porteeSaisie) > 0)}
                    />
                  )}
                </Stack>
                <TextField
                  type="number"
                  label={t("ruler.speed")}
                  value={vitesseSaisie}
                  onChange={setVitesseSaisie}
                  helperText={t("ruler.speedHint")}
                  error={!(vitesse > 0)}
                />
              </Stack>
            </Card>
          </Stack>
        }
      >
        <Stack spacing={1}>
          <MapRuler
            label={t("ruler.mapLabel", {
              a: nom(a),
              b: nom(b),
              distance: unites(d),
            })}
            landmarks={REPERES}
            a={a}
            b={b}
            radius={r}
            snap={aimant}
            measureLabel={unites(d)}
            maxWidth={760}
            onChange={(nouveauA, nouveauB) =>
              setMesure({ ...mesure, a: nouveauA, b: nouveauB })
            }
          />
          <Text variant="caption" tone="secondary" align="center">
            {t("ruler.help")}
          </Text>
          <ChampionPicker
            catalogue={catalogue.data}
            isLoading={catalogue.isLoading}
            error={catalogue.error}
            selected={championId}
            onSelect={choisirChampion}
          />
        </Stack>
      </SideLayout>
      <Card
        title={t("ruler.reference.title")}
        description={t("ruler.reference.description", {
          speed: formatNumber(vitesse > 0 ? vitesse : VITESSE_PAR_DEFAUT),
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
