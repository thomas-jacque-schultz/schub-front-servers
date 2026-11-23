import { Fragment, useState, type ReactNode } from "react";
import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import Typography from "@mui/material/Typography";
import { radii, typographyTokens } from "../tokens";
import { ChampionIcon } from "./ChampionIcon";
import { useChartScheme } from "./useChartScheme";

export interface BreakdownPart {
  key: string;
  label: string;
}

/** Une colonne : la somme de ses parts, et ses parts en sous-colonnes quand on la déplie. */
export interface BreakdownColumn {
  key: string;
  label: string;
  parts: BreakdownPart[];
}

export interface BreakdownRow {
  key: string;
  label: string;
  caption?: string;
  iconUrl?: string | null;
  /** Le lecteur ou ses coéquipiers : la ligne est marquée. */
  highlight?: boolean;
  /** Valeur de chaque part, par clé de part. */
  values: Record<string, number>;
  total: number;
  /** Les deux parts de la dernière colonne : la seconde est mise en avant. */
  split?: [number, number];
  splitCaption?: string;
  /** Sous la barre de la dernière colonne (une frise, par exemple). */
  splitDetail?: ReactNode;
}

export interface BreakdownSection {
  key: string;
  title: string;
  rows: BreakdownRow[];
}

export interface BreakdownTableProps {
  /** Lu par les lecteurs d'écran : ce que le tableau montre. */
  caption: string;
  rowHeader: string;
  totalLabel: string;
  columns: BreakdownColumn[];
  sections: BreakdownSection[];
  /** La dernière colonne, à deux parts : son titre et le nom des deux parts. */
  split?: { label: string; parts: [string, string] };
  format: (value: number) => string;
  /** Libellé du bouton qui déplie ou replie une colonne. */
  toggleLabel: (column: string, open: boolean) => string;
}

const LARGEUR_JOUEUR = 168;

// Un joueur par ligne, une source par colonne. Chaque colonne a sa propre échelle : on y compare les joueurs entre
// eux, le chiffre écrit dit la grandeur. Une colonne se déplie en ses parts, pour tous les joueurs à la fois.
export function BreakdownTable({
  caption,
  rowHeader,
  totalLabel,
  columns,
  sections,
  split,
  format,
  toggleLabel,
}: BreakdownTableProps) {
  const { chart } = useChartScheme();
  const [ouvertes, setOuvertes] = useState<Set<string>>(new Set());
  const lignes = sections.flatMap((section) => section.rows);
  const somme = (ligne: BreakdownRow, colonne: BreakdownColumn) =>
    colonne.parts.reduce(
      (total, part) => total + (ligne.values[part.key] ?? 0),
      0,
    );
  // Une part vide pour les dix joueurs n'a rien à montrer.
  const partsVisibles = (colonne: BreakdownColumn) =>
    colonne.parts.filter((part) =>
      lignes.some((ligne) => (ligne.values[part.key] ?? 0) > 0),
    );
  const max = (valeur: (ligne: BreakdownRow) => number) =>
    Math.max(1, ...lignes.map(valeur));
  const basculer = (cle: string) =>
    setOuvertes((avant) => {
      const apres = new Set(avant);
      if (apres.has(cle)) {
        apres.delete(cle);
      } else {
        apres.add(cle);
      }
      return apres;
    });

  // Les cellules de données, dans l'ordre des en-têtes.
  const cellules: {
    key: string;
    value: (ligne: BreakdownRow) => number;
    first: boolean;
  }[] = columns.flatMap((colonne) =>
    ouvertes.has(colonne.key)
      ? partsVisibles(colonne).map((part, index) => ({
          key: part.key,
          value: (ligne: BreakdownRow) => ligne.values[part.key] ?? 0,
          first: index === 0,
        }))
      : [
          {
            key: colonne.key,
            value: (ligne: BreakdownRow) => somme(ligne, colonne),
            first: true,
          },
        ],
  );
  const maxima = Object.fromEntries(
    cellules.map((cellule) => [cellule.key, max(cellule.value)]),
  );
  const maxSplit = max((ligne) =>
    ligne.split ? ligne.split[0] + ligne.split[1] : 0,
  );
  const nbColonnes = 2 + cellules.length + (split ? 1 : 0);

  const enTete = {
    fontFamily: typographyTokens.monospaceFontFamily,
    fontSize: "0.72rem",
    fontWeight: 600,
    letterSpacing: "0.04em",
    textTransform: "uppercase" as const,
    color: "text.secondary",
    textAlign: "right" as const,
    verticalAlign: "bottom",
    px: 1,
    py: 0.75,
    whiteSpace: "nowrap" as const,
  };
  const chiffre = {
    fontFamily: typographyTokens.monospaceFontFamily,
    fontVariantNumeric: "tabular-nums",
    fontSize: "0.85rem",
  };

  const barre = (valeur: number, plafond: number) => (
    <Box
      aria-hidden
      sx={{
        height: 4,
        mt: 0.5,
        borderRadius: `${radii.sm}px`,
        backgroundColor: chart.track,
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          height: "100%",
          width: `${(100 * valeur) / plafond}%`,
          backgroundColor: chart.mark,
        }}
      />
    </Box>
  );

  return (
    <Box
      sx={{
        overflowX: "auto",
        border: 1,
        borderColor: "divider",
        borderRadius: `${radii.md}px`,
      }}
    >
      <Box
        component="table"
        sx={{
          width: "100%",
          minWidth: 640,
          borderCollapse: "separate",
          borderSpacing: 0,
        }}
      >
        <Box component="caption" sx={visuallyHidden}>
          {caption}
        </Box>
        <Box component="thead">
          <Box component="tr">
            <Box
              component="th"
              scope="col"
              rowSpan={2}
              sx={{
                ...enTete,
                textAlign: "left",
                ...colonneFixe(LARGEUR_JOUEUR),
              }}
            >
              {rowHeader}
            </Box>
            {columns.map((colonne) => {
              const ouverte = ouvertes.has(colonne.key);
              const visibles = partsVisibles(colonne);
              const depliable = visibles.length > 1;
              return (
                <Box
                  component="th"
                  scope="colgroup"
                  key={colonne.key}
                  colSpan={ouverte ? visibles.length : 1}
                  rowSpan={ouverte ? 1 : 2}
                  sx={{
                    ...enTete,
                    textAlign: ouverte ? "center" : "right",
                    borderLeft: 1,
                    borderColor: "divider",
                  }}
                >
                  {depliable ? (
                    <ButtonBase
                      onClick={() => basculer(colonne.key)}
                      aria-expanded={ouverte}
                      aria-label={toggleLabel(colonne.label, ouverte)}
                      sx={{
                        font: "inherit",
                        letterSpacing: "inherit",
                        textTransform: "inherit",
                        color: "primary.main",
                        borderRadius: `${radii.sm}px`,
                        px: 0.5,
                        "&:focus-visible": {
                          outline: 2,
                          outlineStyle: "solid",
                          outlineColor: "primary.main",
                        },
                      }}
                    >
                      {colonne.label}
                      <Box component="span" aria-hidden sx={{ ml: 0.5 }}>
                        {ouverte ? "−" : "+"}
                      </Box>
                    </ButtonBase>
                  ) : (
                    colonne.label
                  )}
                </Box>
              );
            })}
            <Box
              component="th"
              scope="col"
              rowSpan={2}
              sx={{ ...enTete, borderLeft: 1, borderColor: "divider" }}
            >
              {totalLabel}
            </Box>
            {split && (
              <Box
                component="th"
                scope="col"
                rowSpan={2}
                sx={{
                  ...enTete,
                  textAlign: "left",
                  borderLeft: 1,
                  borderColor: "divider",
                  minWidth: 180,
                }}
              >
                {split.label}
              </Box>
            )}
          </Box>
          <Box component="tr">
            {columns
              .filter((colonne) => ouvertes.has(colonne.key))
              .flatMap((colonne) =>
                partsVisibles(colonne).map((part, index) => (
                  <Box
                    component="th"
                    scope="col"
                    key={part.key}
                    sx={{
                      ...enTete,
                      textTransform: "none",
                      letterSpacing: 0,
                      fontWeight: 400,
                      whiteSpace: "normal",
                      minWidth: 72,
                      borderLeft: index === 0 ? 1 : 0,
                      borderColor: "divider",
                    }}
                  >
                    {part.label}
                  </Box>
                )),
              )}
          </Box>
        </Box>
        <Box component="tbody">
          {sections.map((section) => (
            <Fragment key={section.key}>
              <Box component="tr">
                <Box
                  component="th"
                  scope="colgroup"
                  colSpan={nbColonnes}
                  sx={{
                    ...enTete,
                    textAlign: "left",
                    pt: 1.5,
                    borderTop: 1,
                    borderColor: "divider",
                  }}
                >
                  {section.title}
                </Box>
              </Box>
              {section.rows.map((ligne) => (
                <Box component="tr" key={ligne.key}>
                  <Box
                    component="th"
                    scope="row"
                    sx={{
                      textAlign: "left",
                      px: 1,
                      py: 0.75,
                      fontWeight: 400,
                      ...colonneFixe(LARGEUR_JOUEUR),
                      boxShadow: ligne.highlight
                        ? `inset 3px 0 0 ${chart.mark}`
                        : "none",
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        minWidth: 0,
                      }}
                    >
                      <ChampionIcon
                        src={ligne.iconUrl}
                        name={ligne.label}
                        size="small"
                      />
                      <Box sx={{ minWidth: 0 }}>
                        <Typography
                          variant="body2"
                          noWrap
                          sx={{ fontWeight: ligne.highlight ? 700 : 500 }}
                        >
                          {ligne.label}
                        </Typography>
                        {ligne.caption && (
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            noWrap
                            component="p"
                            sx={chiffre}
                          >
                            {ligne.caption}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </Box>
                  {cellules.map((cellule) => {
                    const valeur = cellule.value(ligne);
                    return (
                      <Box
                        component="td"
                        key={cellule.key}
                        sx={{
                          px: 1,
                          py: 0.75,
                          textAlign: "right",
                          borderLeft: cellule.first ? 1 : 0,
                          borderColor: "divider",
                          color: valeur > 0 ? "text.primary" : "text.disabled",
                          ...chiffre,
                        }}
                      >
                        {format(valeur)}
                        {barre(valeur, maxima[cellule.key])}
                      </Box>
                    );
                  })}
                  <Box
                    component="td"
                    sx={{
                      px: 1,
                      py: 0.75,
                      textAlign: "right",
                      fontWeight: 700,
                      borderLeft: 1,
                      borderColor: "divider",
                      ...chiffre,
                    }}
                  >
                    {format(ligne.total)}
                  </Box>
                  {split && (
                    <Box
                      component="td"
                      sx={{
                        px: 1,
                        py: 0.75,
                        borderLeft: 1,
                        borderColor: "divider",
                      }}
                    >
                      {ligne.split && (
                        <>
                          <Box
                            aria-hidden
                            sx={{
                              display: "flex",
                              gap: "2px",
                              height: 8,
                              borderRadius: `${radii.sm}px`,
                              overflow: "hidden",
                              backgroundColor: chart.track,
                            }}
                          >
                            <Box
                              sx={{
                                width: `${(100 * ligne.split[0]) / maxSplit}%`,
                                backgroundColor: chart.markMuted,
                              }}
                            />
                            {ligne.split[1] > 0 && (
                              <Box
                                sx={{
                                  width: `${(100 * ligne.split[1]) / maxSplit}%`,
                                  backgroundColor: chart.markSecondary,
                                }}
                              />
                            )}
                          </Box>
                          {ligne.splitCaption && (
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              component="p"
                              sx={{ ...chiffre, fontSize: "0.75rem", mt: 0.25 }}
                            >
                              {ligne.splitCaption}
                            </Typography>
                          )}
                          {ligne.splitDetail}
                        </>
                      )}
                    </Box>
                  )}
                </Box>
              ))}
            </Fragment>
          ))}
        </Box>
      </Box>
    </Box>
  );
}

/** La légende de la dernière colonne, à poser au-dessus du tableau. */
export function BreakdownSplitLegend({ parts }: { parts: [string, string] }) {
  const { chart } = useChartScheme();
  return (
    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
      {parts.map((part, index) => (
        <Box
          key={part}
          sx={{ display: "inline-flex", alignItems: "center", gap: 0.75 }}
        >
          <Box
            aria-hidden
            sx={{
              width: 12,
              height: 8,
              borderRadius: `${radii.sm}px`,
              backgroundColor:
                index === 0 ? chart.markMuted : chart.markSecondary,
            }}
          />
          <Typography variant="caption" color="text.secondary">
            {part}
          </Typography>
        </Box>
      ))}
    </Box>
  );
}

const visuallyHidden = {
  position: "absolute",
  width: 1,
  height: 1,
  overflow: "hidden",
  clip: "rect(0 0 0 0)",
  whiteSpace: "nowrap",
} as const;

// La colonne des joueurs reste en place quand le tableau défile sur un écran étroit.
const colonneFixe = (largeur: number) =>
  ({
    position: "sticky",
    left: 0,
    zIndex: 1,
    width: largeur,
    minWidth: largeur,
    maxWidth: largeur,
    backgroundColor: "background.paper",
  }) as const;
