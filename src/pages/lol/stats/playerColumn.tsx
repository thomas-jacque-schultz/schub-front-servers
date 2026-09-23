import type { AlignedColumn } from "../../../design-system";
import type { PlayerStatsDto, StatLineDto } from "../../../types/stats";
import { PlayerRadar } from "./PlayerRadar";
import { Champions, Files, PlayerHeader, Tableau } from "./PlayerStatsColumn";
import type { RadarReference } from "./radar";
import { RankedStandings } from "./RankedStandings";
import { StatsStateNote } from "./StatsStateNote";

export interface PlayerColumnOptions {
  isViewer: boolean;
  showRadar: boolean;
  teamLines: StatLineDto[];
  reference: RadarReference;
}

// Même ordre de sections pour tous les joueurs : AlignedColumns aligne la n-ième section de chaque colonne.
export const playerColumn = (
  player: PlayerStatsDto,
  { isViewer, showRadar, teamLines, reference }: PlayerColumnOptions,
): AlignedColumn => {
  const connu = player.state === "STATISTIQUES_CONNUES" && player.overall !== null;
  return {
    key: player.memberId,
    sections: [
      <PlayerHeader key="header" player={player} isViewer={isViewer} />,
      <RankedStandings key="ranks" standings={player.rankings} />,
      connu ? <Tableau key="kpi" player={player} /> : <StatsStateNote key="kpi" state={player.state} />,
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
      connu ? <Champions key="champions" player={player} /> : null,
      connu ? <Files key="queues" player={player} /> : null,
    ],
  };
};
