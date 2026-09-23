import type { AlignedColumn } from "../../../design-system";
import type { MetricScaleDto, PlayerStatsDto } from "../../../types/stats";
import { PlayerRadar } from "./PlayerRadar";
import { Champions, Files, PlayerHeader, Tableau } from "./PlayerStatsColumn";
import { rangDeReference } from "./rank";
import { RankedStandings } from "./RankedStandings";
import { StatsStateNote } from "./StatsStateNote";

export interface PlayerColumnOptions {
  isViewer: boolean;
  scale: MetricScaleDto | null;
  showRadar: boolean;
}

// Même ordre de sections pour tous les joueurs : AlignedColumns aligne la n-ième section de chaque colonne.
export const playerColumn = (
  player: PlayerStatsDto,
  { isViewer, scale, showRadar }: PlayerColumnOptions,
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
                radar={player.radar}
                scale={scale}
                rank={rangDeReference(player.rankings)}
              />
            ) : null,
          ]
        : []),
      connu ? <Champions key="champions" player={player} /> : null,
      connu ? <Files key="queues" player={player} /> : null,
    ],
  };
};
