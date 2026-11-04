import { useTranslation } from "react-i18next";
import type { MapPoint } from "../../common";
import { repereEn } from "../ruler";

/** Comment on nomme un point de la carte : le repère qu'il touche, sinon « point libre ». */
export function useNomDuPoint() {
  const { t } = useTranslation("lol");
  return (point: MapPoint) => {
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
}
