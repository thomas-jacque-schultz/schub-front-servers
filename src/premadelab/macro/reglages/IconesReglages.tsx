import { useTranslation } from "react-i18next";
import {
  Button,
  ChampionSelector,
  MACRO_ICONS,
  PictogramPicker,
  SegmentedControl,
  Stack,
  Switch,
  Text,
  type MacroIconKey,
} from "../../../common";
import type { CatalogueDeLaRegle } from "../../rulerChampions";
import type { Camp } from "../plan";
import { VISION, iconeDeChampion } from "../outils/icones";

const GROUPES: Record<"wards" | "objectives" | "pings", MacroIconKey[]> = {
  wards: ["ward", "controlWard", "farsight"],
  objectives: ["dragon", "baron", "herald", "grubs", "atakhan"],
  pings: ["danger", "onMyWay", "caution", "push"],
};
const SANS_CAMP = "none";

/** Ce que pose l'outil Icônes (Schub#170) : une balise, un objectif, un ping ou un champion, et son camp. */
export function IconesReglages({
  icone,
  onIcone,
  camp,
  onCamp,
  vision,
  onVision,
  catalogue,
  peutRetirer,
  onRetire,
}: {
  icone: string;
  onIcone: (icone: string) => void;
  camp: Camp | null;
  onCamp: (camp: Camp | null) => void;
  vision: boolean;
  onVision: (vision: boolean) => void;
  catalogue: CatalogueDeLaRegle | null;
  peutRetirer: boolean;
  onRetire: () => void;
}) {
  const { t } = useTranslation("lol");
  return (
    <Stack spacing={2}>
      {(Object.keys(GROUPES) as (keyof typeof GROUPES)[]).map((groupe) => (
        <Stack key={groupe} spacing={1}>
          <Text variant="caption" tone="secondary">
            {t(`macro.icons.${groupe}`)}
          </Text>
          <PictogramPicker
            label={t(`macro.icons.${groupe}`)}
            options={GROUPES[groupe].map((cle) => ({
              value: cle,
              name: t(`macro.icons.names.${cle}`),
              src: MACRO_ICONS[cle],
            }))}
            value={GROUPES[groupe].some((cle) => cle === icone) ? icone : null}
            onChange={onIcone}
          />
        </Stack>
      ))}
      {VISION[icone] !== undefined && (
        <Switch
          checked={vision}
          onChange={onVision}
          label={t("macro.icons.vision")}
          helperText={t("macro.icons.visionHint")}
        />
      )}
      <Stack spacing={1}>
        <Text variant="caption" tone="secondary">
          {t("macro.icons.champions")}
        </Text>
        {catalogue ? (
          <ChampionSelector
            entries={catalogue.champions.map((champion) => ({
              key: champion.id,
              name: champion.name,
              iconUrl: champion.icon,
            }))}
            mode="single"
            selected={
              icone.startsWith("champion:") ? [icone.slice("champion:".length)] : []
            }
            onChange={([id]) => id && onIcone(iconeDeChampion(id))}
            searchLabel={t("ruler.champions.search")}
            noResultLabel={t("ruler.champions.noResult")}
          />
        ) : (
          <Text variant="caption" tone="secondary">
            {t("ruler.champions.loading")}
          </Text>
        )}
        <SegmentedControl
          label={t("macro.icons.side")}
          value={camp ?? SANS_CAMP}
          onChange={(choix) =>
            onCamp(choix === SANS_CAMP ? null : (choix as Camp))
          }
          options={[
            { value: "blue", label: t("macro.icons.sides.blue") },
            { value: "red", label: t("macro.icons.sides.red") },
            { value: SANS_CAMP, label: t("macro.icons.sides.none") },
          ]}
        />
      </Stack>
      <Button
        size="small"
        variant="secondary"
        disabled={!peutRetirer}
        onClick={onRetire}
      >
        {t("macro.icons.remove")}
      </Button>
    </Stack>
  );
}
