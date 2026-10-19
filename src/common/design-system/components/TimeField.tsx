import MuiStack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { SelectField } from "./SelectField";

export interface TimeFieldProps {
  /** Nom accessible de la liste des heures ; celle des minutes prend minuteLabel. */
  label: string;
  minuteLabel: string;
  /** HH:mm, toujours sur 24 h. */
  value: string;
  onChange: (value: string) => void;
  minuteStep?: 5 | 10 | 15 | 30;
  disabled?: boolean;
}

const deuxChiffres = (n: number) => String(n).padStart(2, "0");

/** Une heure sur 24 h en deux listes courtes : le champ natif passe en AM/PM selon la langue du navigateur. */
export function TimeField({
  label,
  minuteLabel,
  value,
  onChange,
  minuteStep = 15,
  disabled = false,
}: TimeFieldProps) {
  const [heure = "00", minute = "00"] = value.split(":");
  const minutes = Array.from({ length: 60 / minuteStep }, (_, i) =>
    deuxChiffres(i * minuteStep),
  );
  if (!minutes.includes(minute)) {
    minutes.push(minute);
    minutes.sort();
  }
  return (
    <MuiStack direction="row" spacing={0.5} alignItems="center">
      <SelectField
        label={label}
        value={heure}
        onChange={(h) => onChange(`${h}:${minute}`)}
        options={Array.from({ length: 24 }, (_, h) => ({
          value: deuxChiffres(h),
          label: deuxChiffres(h),
        }))}
        disabled={disabled}
        fullWidth={false}
      />
      <Typography component="span" aria-hidden sx={{ fontWeight: 700 }}>
        :
      </Typography>
      <SelectField
        label={minuteLabel}
        value={minute}
        onChange={(m) => onChange(`${heure}:${m}`)}
        options={minutes.map((m) => ({ value: m, label: m }))}
        disabled={disabled}
        fullWidth={false}
      />
    </MuiStack>
  );
}
