import { type AlignedColumn } from "../../../common";
import type { PlayerStatsDto, StatLineDto } from "../../types/stats";
import { ChampionStatCard } from "./ChampionStatCard";
import { championsEnColonne } from "./champions";
import { ChampionsHeader, Files, PlayerHeader } from "./PlayerStatsColumn";
import { PremadeRadar, PremadeTiles } from "./PremadeColumn";
import { StatsStateNote } from "./StatsStateNote";

export interface PlayerColumnOptions {
  isViewer: boolean;
  showRadar: boolean;
  premadeLines: { memberId: string; line: StatLineDto }[];
  champions: string[];
  onChampionsChange: (keys: string[]) => void;
  // Le même nombre de rangées de champions dans chaque colonne : une carte par rangée, alignée sur ses voisines.
  championRows: number;
}

// Même ordre de sections pour tous les joueurs : AlignedColumns aligne la n-ième section de chaque colonne.
export const playerColumn = (
  player: PlayerStatsDto,
  {
    isViewer,
    showRadar,
    premadeLines,
    champions,
    onChampionsChange,
    championRows,
  }: PlayerColumnOptions,
): AlignedColumn => {
  const connu =
    player.state === "STATISTIQUES_CONNUES" && player.overall !== null;
  const lignes = connu ? championsEnColonne(player, champions) : [];
  return {
    key: player.memberId,
    sections: [
      <PlayerHeader key="header" player={player} isViewer={isViewer} />,
      connu ? (
        <PremadeTiles key="kpi" player={player} lines={premadeLines} />
      ) : (
        <StatsStateNote key="kpi" state={player.state} />
      ),
      ...(showRadar
        ? [
            connu ? (
              <PremadeRadar key="radar" player={player} lines={premadeLines} />
            ) : null,
          ]
        : []),
      connu ? (
        <ChampionsHeader
          key="champions"
          player={player}
          selected={champions}
          onChange={onChampionsChange}
        />
      ) : null,
      ...Array.from({ length: championRows }, (_, index) =>
        lignes[index] ? (
          <ChampionStatCard
            key={lignes[index].key}
            line={lignes[index]}
            compact
          />
        ) : null,
      ),
      connu ? <Files key="queues" player={player} /> : null,
    ],
  };
};
