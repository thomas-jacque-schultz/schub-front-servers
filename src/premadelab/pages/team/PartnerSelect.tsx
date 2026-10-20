import { useTranslation } from "react-i18next";
import { SelectField, useProfileStore, useRequest } from "../../../common";
import { getPlayerCompanionsApi, slugFromRiotId } from "../../api/playersApi";

export interface Partner {
  riotId: string;
  gameName: string;
  tagLine: string;
}

/** Les compagnons du joueur connecté (Schub#96), du plus fréquent au moins fréquent, sans l'effectif (#73). */
export function PartnerSelect({
  exclude,
  onPick,
  disabled = false,
}: {
  exclude: string[];
  onPick: (partner: Partner) => void;
  disabled?: boolean;
}) {
  const { t } = useTranslation("teams");
  const { profile } = useProfileStore();
  const slug = profile?.riot.riotId
    ? slugFromRiotId(profile.riot.riotId)
    : null;
  const { data } = useRequest(slug ? `companions/${slug}` : null, () =>
    getPlayerCompanionsApi(slug ?? ""),
  );

  const dejaLa = new Set(exclude.map((riotId) => riotId.toLowerCase()));
  const partenaires = (data?.companions ?? [])
    .filter((compagnon) => !dejaLa.has(compagnon.riotId.toLowerCase()))
    .sort((a, b) => b.games - a.games);

  if (partenaires.length === 0) {
    return null;
  }

  return (
    <SelectField
      label={t("roster.add.partners")}
      value=""
      disabled={disabled}
      onChange={(riotId) => {
        const separation = riotId.lastIndexOf("#");
        onPick({
          riotId,
          gameName: riotId.slice(0, separation),
          tagLine: riotId.slice(separation + 1),
        });
      }}
      options={partenaires.map((compagnon) => ({
        value: compagnon.riotId,
        label: t("roster.add.partner", {
          riotId: compagnon.riotId,
          count: compagnon.games,
        }),
      }))}
    />
  );
}
