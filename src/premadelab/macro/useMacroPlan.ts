import { useCallback, useEffect, useRef, useState } from "react";
import type { Canal } from "./canal";
import { appliqueTout, inverse, type Operation, type Plan } from "./plan";

const ANNULATIONS_MAX = 200;

export interface MacroPlan {
  plan: Plan;
  /** Faux tant que le canal n'a pas donné le plan de départ. */
  pret: boolean;
  actif: string | null;
  choisis: (id: string | null) => void;
  /** Un geste : ses opérations, jouées ici puis envoyées ; Ctrl + Z le défait d'un bloc. */
  joue: (operations: Operation[]) => void;
  annule: () => void;
  peutAnnuler: boolean;
}

/**
 * Le plan du Macro Planner, sur un canal (Schub#168). On n'annule que ses propres gestes : chez les autres, une
 * annulation arrive comme n'importe quelle opération.
 */
export function useMacroPlan(canal: Canal): MacroPlan {
  const [plan, setPlan] = useState<Plan>([]);
  const [pret, setPret] = useState(false);
  const [actif, setActif] = useState<string | null>(null);
  const [annulables, setAnnulables] = useState(0);
  const courant = useRef<Plan>([]);
  const annulations = useRef<Operation[][]>([]);

  const remplace = useCallback((suivant: Plan) => {
    courant.current = suivant;
    setPlan(suivant);
  }, []);

  useEffect(() => {
    setPret(false);
    return canal.ouvre({
      depart: (depart) => {
        annulations.current = [];
        setAnnulables(0);
        remplace(depart);
        setPret(true);
      },
      recoit: (operations) =>
        remplace(appliqueTout(courant.current, operations)),
    });
  }, [canal, remplace]);

  const joue = useCallback(
    (operations: Operation[]) => {
      if (operations.length === 0) {
        return;
      }
      annulations.current = [
        ...annulations.current.slice(-(ANNULATIONS_MAX - 1)),
        inverse(courant.current, operations),
      ];
      setAnnulables(annulations.current.length);
      remplace(appliqueTout(courant.current, operations));
      canal.envoie(operations);
    },
    [canal, remplace],
  );

  const annule = useCallback(() => {
    const defaites = annulations.current.pop();
    setAnnulables(annulations.current.length);
    if (!defaites || defaites.length === 0) {
      return;
    }
    remplace(appliqueTout(courant.current, defaites));
    canal.envoie(defaites);
  }, [canal, remplace]);

  return {
    plan,
    pret,
    actif,
    choisis: setActif,
    joue,
    annule,
    peutAnnuler: annulables > 0,
  };
}
