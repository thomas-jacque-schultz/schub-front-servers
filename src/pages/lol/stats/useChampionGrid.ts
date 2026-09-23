import { useEffect, useState } from "react";
import { getChampionGridApi } from "../../../api/statsApi";
import type { ChampionGridDto } from "../../../types/stats";

const cache = new Map<string, Promise<ChampionGridDto | null>>();

export const useChampionGrid = (
  championId: string | null | undefined,
  tier: string | null | undefined,
) => {
  const [grille, setGrille] = useState<ChampionGridDto | null>(null);
  useEffect(() => {
    if (!championId || !tier) {
      setGrille(null);
      return;
    }
    const cle = `${championId}/${tier}`;
    if (!cache.has(cle)) {
      cache.set(
        cle,
        getChampionGridApi(championId, tier).catch(() => {
          cache.delete(cle);
          return null;
        }),
      );
    }
    let actif = true;
    cache.get(cle)!.then((reponse) => actif && setGrille(reponse));
    return () => {
      actif = false;
    };
  }, [championId, tier]);
  return grille;
};
