import { useState } from "react";
import { Card, ChampionPickButton, Stack, Text, TextField } from "../../common";
import { type Donnees, iconeObjet } from "../commun/ddragon";
import { normalise } from "../commun/devinette";
import type { Lang } from "../commun/textes";
import { grille } from "./familles";
import { nomFamille } from "./lecture";
import { texte } from "./textes";

/**
 * Tous les objets de la boutique en petites icônes, une rangée serrée par famille, le nom au survol (Schub#161) :
 * la grille tient sans défiler. Un essai raté se grise pour soi seul.
 */
export function GrilleObjets({
  lang,
  donnees: lues,
  actif,
  onChoisis,
}: {
  lang: Lang;
  donnees: Donnees;
  actif: boolean;
  onChoisis: (id: string) => void;
}) {
  const [colonnes] = useState(() => grille(lues.objets, Math.random));
  const [essayes, setEssayes] = useState<string[]>([]);
  const [filtre, setFiltre] = useState("");
  const cherche = normalise(filtre);
  return (
    <Card>
      <Stack spacing={1.5}>
        <TextField
          label={texte(lang, "filtre")}
          value={filtre}
          onChange={setFiltre}
        />
        <Stack spacing={0.5}>
          {colonnes.map(({ famille, objets }) => {
            const vus = objets.filter((o) =>
              normalise(o.nom).includes(cherche),
            );
            return (
              vus.length > 0 && (
                <Stack
                  key={famille}
                  direction="row"
                  spacing={0.25}
                  align="center"
                  wrap
                >
                  <Text variant="overline" tone="secondary">
                    {nomFamille(lang, famille)}
                  </Text>
                  {vus.map((o) => (
                    <ChampionPickButton
                      key={o.id}
                      champion={{
                        name: o.nom,
                        iconUrl: iconeObjet(lues.version, o.id),
                      }}
                      label={o.nom}
                      size="small"
                      disabled={!actif || essayes.includes(o.id)}
                      onClick={() => {
                        setEssayes((deja) => [...deja, o.id]);
                        onChoisis(o.id);
                      }}
                    />
                  ))}
                </Stack>
              )
            );
          })}
        </Stack>
      </Stack>
    </Card>
  );
}
