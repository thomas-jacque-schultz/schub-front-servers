import { useCallback, useEffect, useRef, useState } from "react";

export interface RequestState<T> {
  data: T | null;
  error: unknown;
  isLoading: boolean;
  reload: () => Promise<void>;
}

/**
 * Une réponse arrivée après une requête plus récente est jetée : sans ça, changer deux fois de période
 * affiche la réponse la plus lente, pas la dernière demandée. `key` nul : rien n'est demandé.
 * La donnée précédente reste affichée pendant le chargement suivant.
 */
export function useRequest<T>(
  key: string | null,
  fetcher: () => Promise<T>,
): RequestState<T> {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<unknown>(null);
  const [isLoading, setIsLoading] = useState<boolean>(key !== null);
  const derniere = useRef(0);
  const demande = useRef(fetcher);

  useEffect(() => {
    demande.current = fetcher;
  });

  const reload = useCallback(async () => {
    const numero = ++derniere.current;
    setIsLoading(true);
    setError(null);
    try {
      const reponse = await demande.current();
      if (numero === derniere.current) {
        setData(reponse);
      }
    } catch (echec) {
      if (numero === derniere.current) {
        setError(echec);
      }
    } finally {
      if (numero === derniere.current) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    if (key === null) {
      derniere.current++;
      setIsLoading(false);
      return;
    }
    void reload();
  }, [key, reload]);

  return { data, error, isLoading, reload };
}

export const messageOf = (error: unknown, fallback: string): string =>
  error instanceof Error && error.message ? error.message : fallback;
