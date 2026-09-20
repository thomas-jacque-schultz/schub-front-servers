import CircularProgress from "@mui/material/CircularProgress";

export interface SpinnerProps {
  /** Ce qui est en train de charger — lu par les lecteurs d'écran, jamais affiché. */
  label: string;
  size?: "small" | "medium" | "large";
}

const SIZE: Record<NonNullable<SpinnerProps["size"]>, number> = {
  small: 18,
  medium: 26,
  large: 40,
};

/**
 * L'attente circulaire, pour un chargement dont on ne connaît pas la durée.
 *
 * <p>{@link ProgressBar} occupe la largeur d'un bloc et annonce le chargement d'un écran ;
 * celui-ci tient dans un bouton ou une cellule. Les deux portent un `label` obligatoire : une
 * animation sans énoncé ne dit pas ce qu'elle fait attendre.</p>
 */
export function Spinner({ label, size = "medium" }: SpinnerProps) {
  return <CircularProgress size={SIZE[size]} role="status" aria-label={label} />;
}
