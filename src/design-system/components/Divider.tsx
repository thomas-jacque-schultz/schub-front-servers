import MuiDivider from "@mui/material/Divider";

export interface DividerProps {
  label?: string;
}

export function Divider({ label }: DividerProps) {
  return <MuiDivider role={label ? "separator" : "presentation"}>{label}</MuiDivider>;
}
