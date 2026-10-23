import ButtonBase from "@mui/material/ButtonBase";

export interface SwatchButtonProps {
  /** Une couleur de données (l'encre d'un dessin), pas une couleur d'interface. */
  color: string;
  label: string;
  selected?: boolean;
  onClick: () => void;
}

/** Une pastille de couleur à choisir. */
export function SwatchButton({
  color,
  label,
  selected = false,
  onClick,
}: SwatchButtonProps) {
  return (
    <ButtonBase
      aria-label={label}
      aria-pressed={selected}
      onClick={onClick}
      sx={{
        width: 24,
        height: 24,
        borderRadius: "50%",
        bgcolor: color,
        border: "1px solid",
        borderColor: "divider",
        outline: selected ? "2px solid" : "none",
        outlineColor: "primary.main",
        outlineOffset: "2px",
        "&:focus-visible": {
          outline: "2px solid",
          outlineColor: "primary.main",
        },
      }}
    />
  );
}
