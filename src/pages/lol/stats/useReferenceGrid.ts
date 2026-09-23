import { useEffect, useState } from "react";
import { getReferenceGridApi } from "../../../api/statsApi";
import type { ReferenceGridDto, ReferenceScope } from "../../../types/stats";

// Recalculés une fois par jour : une grille lue reste bonne pour la session.
const cache = new Map<string, Promise<ReferenceGridDto | null>>();

export const useReferenceGrid = (
  position: string | null | undefined,
  scope: ReferenceScope,
  tier: string | null | undefined,
): ReferenceGridDto | null => {
  const [grille, setGrille] = useState<ReferenceGridDto | null>(null);
  useEffect(() => {
    if (!position) {
      setGrille(null);
      return;
    }
    const cle = `${position}/${scope}/${tier ?? ""}`;
    if (!cache.has(cle)) {
      cache.set(
        cle,
        getReferenceGridApi(position, scope, tier).catch(() => {
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
  }, [position, scope, tier]);
  return grille;
};
