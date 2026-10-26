import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Card,
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
  useDocumentMeta,
  useLocaleFormat,
  type MapPoint,
} from "../../common";
import {
  ecrireMesure,
  lireMesure,
  PORTEES,
  REPERES,
  repereEn,
  VITESSE_PAR_DEFAUT,
  type Mesure,
} from "../ruler";

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

  useEffect(() => ecrireMesure(mesure), [mesure]);

  const { a, b, r } = mesure;
  const d = distance(a, b);
  const vitesse = Number(vitesseSaisie);
  const nom = (point: MapPoint) => {
    const repere = repereEn(point);
    return repere
      ? t("ruler.landmarkOnSide", {
          name: t(`ruler.landmarks.${repere.id}`),
          side: t(`ruler.sides.${repere.side}`),
        })
      : t("ruler.freePoint");
  };
  const unites = (valeur: number) =>
    t("ruler.units", { value: formatNumber(Math.round(valeur)) });
  const aPortee = d <= r;

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
                  value={
                    vitesse > 0
                      ? t("ruler.seconds", {
                          value: formatNumber(
                            Math.round((d / vitesse) * 10) / 10,
                          ),
                        })
                      : "—"
                  }
                  hint={
                    vitesse > 0
                      ? t("ruler.walkHint", { speed: formatNumber(vitesse) })
                      : undefined
                  }
                />
                <StatTile
                  label={t("ruler.range", { radius: formatNumber(r) })}
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
                      setMesure({ ...mesure, r: Number(choix) });
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
                          setMesure({ ...mesure, r: portee });
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
        </Stack>
      </SideLayout>
    </Stack>
  );
}
