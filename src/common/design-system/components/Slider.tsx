import MuiSlider from "@mui/material/Slider";

export interface SliderProps {
  /** Ce que règle le curseur, pour un lecteur d'écran. */
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  /** Quand le curseur est lâché : le moment d'envoyer la valeur à d'autres. */
  onCommit?: (value: number) => void;
  disabled?: boolean;
}

export function Slider({
  label,
  value,
  min,
  max,
  step,
  onChange,
  onCommit,
  disabled = false,
}: SliderProps) {
  return (
    <MuiSlider
      aria-label={label}
      value={value}
      min={min}
      max={max}
      step={step}
      disabled={disabled}
      valueLabelDisplay="off"
      onChange={(_, valeur) => onChange(valeur as number)}
      onChangeCommitted={(_, valeur) => onCommit?.(valeur as number)}
    />
  );
}
