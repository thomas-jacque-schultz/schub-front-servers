import Box from "@mui/material/Box";

export interface HoneypotFieldProps {
  name: string;
  value: string;
  onChange: (value: string) => void;
  label: string;
}

export function HoneypotField({ name, value, onChange, label }: HoneypotFieldProps) {
  return (
    <Box
      aria-hidden="true"
      sx={{
        position: "absolute",
        width: 1,
        height: 1,
        overflow: "hidden",
        clip: "rect(0 0 0 0)",
        whiteSpace: "nowrap",
      }}
    >
      <label htmlFor={name}>{label}</label>
      <input
        id={name}
        name={name}
        type="text"
        value={value}
        tabIndex={-1}
        autoComplete="off"
        onChange={(event) => onChange(event.target.value)}
      />
    </Box>
  );
}
