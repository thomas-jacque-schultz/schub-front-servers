import CircularProgress from "@mui/material/CircularProgress";

export interface SpinnerProps {
  label: string;
  size?: "small" | "medium" | "large";
}

const SIZE: Record<NonNullable<SpinnerProps["size"]>, number> = {
  small: 18,
  medium: 26,
  large: 40,
};

export function Spinner({ label, size = "medium" }: SpinnerProps) {
  return <CircularProgress size={SIZE[size]} role="status" aria-label={label} />;
}
