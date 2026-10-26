import { useCallback, useEffect, useRef } from "react";

// Ce que le joueur a fait pendant une question (Schub#163) : quitter le jeu (onglet caché, alt-tab) ou copier-coller.
// Le navigateur ne voit ni un deuxième écran ni un téléphone ; entre amis, ça suffit.

export interface Vigilance {
  absent: boolean;
  copie: boolean;
}

// Plus court, c'est un clic dans la barre de PremadeLab au-dessus du jeu.
const ABSENCE_MS = 1_000;

/** cle : la question en cours, null entre deux ; tout repart de zéro quand elle change. */
export function useVigilance(cle: string | null): () => Vigilance {
  const releve = useRef<Vigilance>({ absent: false, copie: false });
  const parti = useRef<number | null>(null);

  useEffect(() => {
    releve.current = { absent: false, copie: false };
    parti.current = null;
    if (cle === null) {
      return;
    }
    const part = () => {
      parti.current ??= Date.now();
    };
    const revient = () => {
      if (parti.current !== null && Date.now() - parti.current > ABSENCE_MS) {
        releve.current.absent = true;
      }
      parti.current = null;
    };
    const visibilite = () => (document.hidden ? part() : revient());
    const copie = () => {
      releve.current.copie = true;
    };
    window.addEventListener("blur", part);
    window.addEventListener("focus", revient);
    document.addEventListener("visibilitychange", visibilite);
    document.addEventListener("copy", copie);
    document.addEventListener("cut", copie);
    document.addEventListener("paste", copie);
    return () => {
      window.removeEventListener("blur", part);
      window.removeEventListener("focus", revient);
      document.removeEventListener("visibilitychange", visibilite);
      document.removeEventListener("copy", copie);
      document.removeEventListener("cut", copie);
      document.removeEventListener("paste", copie);
    };
  }, [cle]);

  return useCallback(() => {
    if (parti.current !== null && Date.now() - parti.current > ABSENCE_MS) {
      releve.current.absent = true;
    }
    return { ...releve.current };
  }, []);
}
