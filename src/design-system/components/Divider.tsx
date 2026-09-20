import MuiDivider from "@mui/material/Divider";

export interface DividerProps {
  /** Un intitulé posé sur le trait — il découpe alors une liste longue en sections lisibles. */
  label?: string;
}

/** Le trait de séparation. Sans label, il est purement décoratif et ne dit rien aux lecteurs. */
export function Divider({ label }: DividerProps) {
  return <MuiDivider role={label ? "separator" : "presentation"}>{label}</MuiDivider>;
}
