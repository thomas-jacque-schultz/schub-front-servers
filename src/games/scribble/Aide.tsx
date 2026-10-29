import { useEffect, useState } from "react";
import {
  Button,
  ChampionPickButton,
  Frame,
  Icon,
  Stack,
  Text,
} from "../../common";
import { type Catalogue, catalogue, icone } from "../commun/champions";
import type { Lang } from "../commun/textes";
import { texte } from "./textes";

/**
 * L'aide de qui devine (Schub#160) : tous les champions en icônes, un clic propose le champion. Plus lent que de
 * taper son nom, c'est voulu. Les noms sont lus dans la langue de la partie, celle du mot à trouver.
 */
export function AideChampions({
  lang,
  langPartie,
  onPropose,
}: {
  lang: Lang;
  langPartie: Lang;
  onPropose: (nom: string) => void;
}) {
  const [ouverte, setOuverte] = useState(false);
  const [lu, setLu] = useState<Catalogue | null>(null);
  const [essayes, setEssayes] = useState<string[]>([]);

  useEffect(() => {
    if (!ouverte || lu) {
      return;
    }
    let vivant = true;
    catalogue(langPartie)
      .then((c) => vivant && setLu(c))
      .catch(() => undefined);
    return () => {
      vivant = false;
    };
  }, [ouverte, lu, langPartie]);

  return (
    <Stack spacing={1}>
      <Stack direction="row">
        <Button
          size="small"
          variant="ghost"
          startIcon={<Icon name="help" size="small" />}
          onClick={() => setOuverte((o) => !o)}
        >
          {texte(lang, ouverte ? "aideFermer" : "aide")}
        </Button>
      </Stack>
      {ouverte && (
        <Frame dense>
          {lu ? (
            <Stack direction="row" spacing={0.25} wrap>
              {[...lu.champions]
                .sort((a, b) => a.nom.localeCompare(b.nom))
                .map((champion) => (
                  <ChampionPickButton
                    key={champion.id}
                    size="small"
                    champion={{
                      name: champion.nom,
                      iconUrl: icone(lu.version, champion.id),
                    }}
                    label={champion.nom}
                    disabled={essayes.includes(champion.id)}
                    onClick={() => {
                      setEssayes((deja) => [...deja, champion.id]);
                      onPropose(champion.nom);
                    }}
                  />
                ))}
            </Stack>
          ) : (
            <Text variant="caption" tone="secondary">
              {texte(lang, "aideChargement")}
            </Text>
          )}
        </Frame>
      )}
    </Stack>
  );
}
