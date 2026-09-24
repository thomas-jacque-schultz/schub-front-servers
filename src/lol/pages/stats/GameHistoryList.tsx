import { type ReactNode, useState } from "react";
import { Expandable, Stack } from "../../../design-system";
import type { TeamGameDto } from "../../types/stats";
import { TeamGameRow } from "./TeamGameRow";

export interface GameHistoryListProps {
  games: TeamGameDto[];
  avatars: Record<string, string | null>;
  showPresence?: boolean;
  /** Le détail n'est monté qu'à l'ouverture : c'est lui qui déclenche son chargement. */
  renderDetail: (game: TeamGameDto) => ReactNode;
}

export function GameHistoryList({
  games,
  avatars,
  showPresence,
  renderDetail,
}: GameHistoryListProps) {
  const [ouvertes, setOuvertes] = useState<string[]>([]);
  const bascule = (matchId: string, ouverte: boolean) =>
    setOuvertes((courantes) =>
      ouverte
        ? [...courantes, matchId]
        : courantes.filter((id) => id !== matchId),
    );

  return (
    <Stack spacing={1}>
      {games.map((game) => (
        <Expandable
          key={game.matchId}
          open={ouvertes.includes(game.matchId)}
          onToggle={(ouverte) => bascule(game.matchId, ouverte)}
          summary={
            <TeamGameRow
              game={game}
              avatars={avatars}
              showPresence={showPresence}
            />
          }
        >
          {renderDetail(game)}
        </Expandable>
      ))}
    </Stack>
  );
}
