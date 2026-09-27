import LinearProgress from "@mui/material/LinearProgress";

export interface ProgressBarProps {
  label: string;
}

export function ProgressBar({ label }: ProgressBarProps) {
  return <LinearProgress aria-label={label} />;
}
