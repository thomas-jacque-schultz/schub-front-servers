import LinearProgress from "@mui/material/LinearProgress";

export interface ProgressBarProps {
  label: string;
  /** Entre 0 et 1 : une progression mesurée. Absente, la barre dit seulement que ça avance. */
  value?: number;
}

export function ProgressBar({ label, value }: ProgressBarProps) {
  if (value === undefined) {
    return <LinearProgress aria-label={label} />;
  }
  return (
    <LinearProgress
      aria-label={label}
      variant="determinate"
      value={Math.round(Math.min(1, Math.max(0, value)) * 100)}
    />
  );
}
