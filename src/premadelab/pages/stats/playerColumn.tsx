import { type AlignedColumn } from "../../../common";
import type { PlayerStatsDto, StatLineDto } from "../../types/stats";
import { PlayerRadar } from "./PlayerRadar";
import { ChampionStatCard } from "./ChampionStatCard";
import { championsEnColonne } from "./champions";
import {
  ChampionsHeader,
  Files,
  PlayerHeader,
  Tableau,
} from "./PlayerStatsColumn";
import type { RadarReference } from "./radar";
import { RankedStandings } from "./RankedStandings";
import { StatsStateNote } from "./StatsStateNote";

export interface PlayerColumnOptions {
  isViewer: boolean;
  showRadar: boolean;
  teamLines: StatLineDto[];
  reference: RadarReference;
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
    teamLines,
    reference,
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
      <RankedStandings key="ranks" standings={player.rankings} />,
      connu ? (
        <Tableau key="kpi" player={player} />
      ) : (
        <StatsStateNote key="kpi" state={player.state} />
      ),
      ...(showRadar
        ? [
            connu ? (
              <PlayerRadar
                key="radar"
                overall={player.overall}
                positions={player.positions}
                references={player.references}
                teamLines={teamLines}
                reference={reference}
              />
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
            references={player.references}
          />
        ) : null,
      ),
      connu ? <Files key="queues" player={player} /> : null,
    ],
  };
};
