import {
  Button,
  SegmentedControl,
  Stack,
  SwatchButton,
  Text,
} from "../../common";
import type { Lang } from "../commun/textes";
import type { Outil } from "./Board";
import { COULEURS, EPAISSEURS } from "./palette";
import { texte } from "./textes";
import { GOMME } from "./traits";

const OUTILS: Outil[] = ["feutre", "rectangle", "cercle", "pot"];

export function Outils({
  lang,
  couleur,
  epaisseur,
  outil,
  peutAnnuler,
  onCouleur,
  onEpaisseur,
  onOutil,
  onAnnule,
  onEfface,
}: {
  lang: Lang;
  couleur: string;
  epaisseur: number;
  outil: Outil;
  peutAnnuler: boolean;
  onCouleur: (couleur: string) => void;
  onEpaisseur: (epaisseur: number) => void;
  onOutil: (outil: Outil) => void;
  onAnnule: () => void;
  onEfface: () => void;
}) {
  return (
    <Stack direction="row" spacing={1.5} align="center" wrap>
      <Stack direction="row" spacing={0.5} wrap>
        {COULEURS.map((c) => (
          <SwatchButton
            key={c}
            color={c}
            label={c}
            selected={c === couleur}
            onClick={() => onCouleur(c)}
          />
        ))}
      </Stack>
      <SegmentedControl
        label={texte(lang, "outil")}
        value={outil}
        onChange={(choisi) => onOutil(choisi as Outil)}
        options={OUTILS.map((o) => ({
          value: o,
          label: texte(lang, `outil_${o}`),
        }))}
      />
      <SegmentedControl
        label={texte(lang, "epaisseur")}
        value={String(EPAISSEURS.indexOf(epaisseur))}
        onChange={(rang) => onEpaisseur(EPAISSEURS[Number(rang)])}
        options={EPAISSEURS.map((_, rang) => ({
          value: String(rang),
          label: String(rang + 1),
        }))}
      />
      <Button
        size="small"
        variant={couleur === GOMME ? "primary" : "secondary"}
        onClick={() => onCouleur(GOMME)}
      >
        {texte(lang, "gomme")}
      </Button>
      <Button
        size="small"
        variant="secondary"
        disabled={!peutAnnuler}
        onClick={onAnnule}
      >
        {texte(lang, "annuler")}
      </Button>
      <Button size="small" variant="ghost" onClick={onEfface}>
        {texte(lang, "effacer")}
      </Button>
      <Text variant="caption" tone="secondary">
        {texte(lang, "astuces")}
      </Text>
    </Stack>
  );
}
