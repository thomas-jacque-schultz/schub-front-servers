import Box from "@mui/material/Box";

export interface HoneypotFieldProps {
  /** Le nom du champ envoyé au serveur. Il doit ressembler à un champ légitime. */
  name: string;
  value: string;
  onChange: (value: string) => void;
  /** Le libellé lu par les rares agents qui l'atteindraient malgré tout. */
  label: string;
}

/**
 * Le champ leurre d'un formulaire public.
 *
 * <p>Un robot qui remplit aveuglément tout ce qu'il trouve remplit aussi celui-ci ; le serveur
 * rejette alors la requête. C'est la couche anti-spam la moins chère qui soit, et elle n'impose
 * rien au visiteur — ni énigme, ni image à déchiffrer.</p>
 *
 * <p><strong>Il est masqué correctement, et c'est tout l'enjeu</strong> : `display: none` est le
 * premier réflexe et le mauvais, parce que les robots un peu sérieux le détectent. Le champ est
 * donc sorti de l'écran, retiré de l'ordre de tabulation (`tabIndex=-1`), masqué aux lecteurs
 * d'écran (`aria-hidden`) et privé d'auto-remplissage — sinon le navigateur d'un visiteur
 * pourrait le remplir à sa place et le faire passer pour un robot.</p>
 */
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
