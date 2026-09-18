import LinearProgress from "@mui/material/LinearProgress";

export interface ProgressBarProps {
  /** Ce qui est en train de charger — lu par les lecteurs d'écran, jamais affiché. */
  label: string;
}

/**
 * Le chargement en cours.
 *
 * <p>Indéterminée par construction : aucun des appels de cette application ne sait dire où il en
 * est, et une barre qui prétendrait le contraire mentirait. Le libellé est obligatoire — une
 * barre sans nom ne dit pas *ce qui* charge.</p>
 */
export function ProgressBar({ label }: ProgressBarProps) {
  return <LinearProgress aria-label={label} />;
}
