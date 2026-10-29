import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Card,
  SegmentedControl,
  Stack,
  StatTile,
  Switch,
  Text,
  TextField,
  distance,
  useLocaleFormat,
} from "../../../common";
import { PORTEES } from "../../ruler";
import { useNomDuPoint } from "../useNomDuPoint";
import type { ElementMesure } from "../plan";
import type { PorteeTracee } from "../../pages/ruler/ChampionRanges";

const PERSO = "custom";

/** La mesure choisie, en chiffres : distance, temps de marche, portée. */
export function MesureLue({
  mesure,
  vitesse,
  tracee,
}: {
  mesure: ElementMesure | null;
  vitesse: number;
  tracee: PorteeTracee | null;
}) {
  const { t } = useTranslation("lol");
  const { formatNumber } = useLocaleFormat();
  const nom = useNomDuPoint();
  if (!mesure) {
    return (
      <Card title={t("ruler.measure")}>
        <Text variant="caption" tone="secondary">
          {t("macro.noMeasure")}
        </Text>
      </Card>
    );
  }
  const { a, b, r } = mesure;
  const d = distance(a, b);
  const unites = (valeur: number) =>
    t("ruler.units", { value: formatNumber(Math.round(valeur)) });
  const marche =
    vitesse > 0
      ? t("ruler.seconds", {
          value: formatNumber(Math.round((d / vitesse) * 10) / 10),
        })
      : "—";
  return (
    <Card title={t("ruler.measure")}>
      <Stack spacing={1.5}>
        <StatTile label={t("ruler.distance")} value={unites(d)} />
        <StatTile
          label={t("ruler.walk")}
          value={marche}
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
            d <= r
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
  );
}

/** Les réglages de la règle : aimant, cercle de portée, vitesse de marche. */
export function MesureReglages({
  aimant,
  onAimant,
  rayon,
  onRayon,
  vitesse,
  onVitesse,
}: {
  aimant: boolean;
  onAimant: (aimant: boolean) => void;
  rayon: number;
  onRayon: (rayon: number) => void;
  vitesse: string;
  onVitesse: (vitesse: string) => void;
}) {
  const { t } = useTranslation("lol");
  const { formatNumber } = useLocaleFormat();
  const [perso, setPerso] = useState(() => !PORTEES.includes(rayon));
  const [saisie, setSaisie] = useState(String(rayon));
  const enPerso = perso || !PORTEES.includes(rayon);
  return (
    <Stack spacing={2}>
      <Switch
        checked={aimant}
        onChange={onAimant}
        label={t("ruler.snap")}
        helperText={t("ruler.snapHint")}
      />
      <Stack spacing={1}>
        <Text variant="caption" tone="secondary">
          {t("ruler.radius")}
        </Text>
        <SegmentedControl
          label={t("ruler.radius")}
          value={enPerso ? PERSO : String(rayon)}
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
              setSaisie(String(rayon));
              return;
            }
            setPerso(false);
            onRayon(Number(choix));
          }}
        />
        {enPerso && (
          <TextField
            type="number"
            label={t("ruler.customRadius")}
            value={saisie}
            onChange={(valeur) => {
              setSaisie(valeur);
              const portee = Number(valeur);
              if (portee > 0 && portee <= 30000) {
                onRayon(portee);
              }
            }}
            error={!(Number(saisie) > 0)}
          />
        )}
      </Stack>
      <TextField
        type="number"
        label={t("ruler.speed")}
        value={vitesse}
        onChange={onVitesse}
        helperText={t("ruler.speedHint")}
        error={!(Number(vitesse) > 0)}
      />
    </Stack>
  );
}
