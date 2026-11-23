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
  /** À côté du nom, en chasse fixe (un K/D/A, par exemple). */
  caption?: string;
  iconUrl?: string | null;
  /** Le lecteur ou ses coéquipiers : la ligne est marquée. */
  highlight?: boolean;
  /** Valeur de chaque part, par clé de part. */
  values: Record<string, number>;
  total: number;
  /** La dernière colonne : sa valeur, et ce qui l'accompagne en retrait. */
  last?: { value: number; note?: ReactNode };
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
  /** Titre de la dernière colonne, à part des sources (ce qui a été perdu, par exemple). */
  lastLabel?: string;
  format: (value: number) => string;
  /** Libellé du bouton qui déplie ou replie une colonne. */
  toggleLabel: (column: string, open: boolean) => string;
}

// Un joueur par ligne, une source par colonne. Chaque colonne a sa propre échelle, en fond de cellule : on y compare
// les joueurs entre eux, le chiffre écrit dit la grandeur. Une colonne se déplie en ses parts, pour tous à la fois.
export function BreakdownTable({
  caption,
  rowHeader,
  totalLabel,
  columns,
  sections,
  lastLabel,
  format,
  toggleLabel,
}: BreakdownTableProps) {
  const { chart } = useChartScheme();
  const [ouvertes, setOuvertes] = useState<Set<string>>(new Set());
  const lignes = sections.flatMap((section) => section.rows);
  const valeur = (ligne: BreakdownRow, parts: BreakdownPart[]) =>
    parts.reduce((total, part) => total + (ligne.values[part.key] ?? 0), 0);
  // Une part vide pour tous les joueurs n'a rien à montrer.
  const partsVisibles = (colonne: BreakdownColumn) =>
    colonne.parts.filter((part) =>
      lignes.some((ligne) => (ligne.values[part.key] ?? 0) > 0),
    );
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

  const cellules = columns.flatMap((colonne) =>
    ouvertes.has(colonne.key)
      ? partsVisibles(colonne).map((part, index) => ({
          key: part.key,
          parts: [part],
          first: index === 0,
        }))
      : [{ key: colonne.key, parts: colonne.parts, first: true }],
  );
  const plafond = (lire: (ligne: BreakdownRow) => number) =>
    Math.max(1, ...lignes.map(lire));
  const maxima = Object.fromEntries(
    cellules.map((cellule) => [
      cellule.key,
      plafond((ligne) => valeur(ligne, cellule.parts)),
    ]),
  );
  const maxDernier = plafond((ligne) => ligne.last?.value ?? 0);
  const nbColonnes = 2 + cellules.length + (lastLabel ? 1 : 0);
  const separation = { borderLeft: 1, borderColor: "divider" } as const;

  const enTete = {
    fontFamily: typographyTokens.monospaceFontFamily,
    fontSize: "0.7rem",
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
    fontSize: "0.82rem",
  };
  // La barre est le fond de la cellule : elle ne prend aucune hauteur et ne s'ajoute pas au chiffre.
  const fond = (sens: "left" | "right", part: number, couleur: string) =>
    `linear-gradient(to ${sens}, ${couleur} ${part}%, transparent ${part}%)`;

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
          minWidth: 620,
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
              sx={{ ...enTete, textAlign: "left", ...colonneFixe }}
            >
              {rowHeader}
            </Box>
            {columns.map((colonne) => {
              const ouverte = ouvertes.has(colonne.key);
              const visibles = partsVisibles(colonne);
              return (
                <Box
                  component="th"
                  scope="colgroup"
                  key={colonne.key}
                  colSpan={ouverte ? visibles.length : 1}
                  rowSpan={ouverte ? 1 : 2}
                  sx={{
                    ...enTete,
                    ...separation,
                    textAlign: ouverte ? "center" : "right",
                  }}
                >
                  {visibles.length > 1 ? (
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
              sx={{ ...enTete, ...separation }}
            >
              {totalLabel}
            </Box>
            {lastLabel && (
              <Box
                component="th"
                scope="col"
                rowSpan={2}
                sx={{ ...enTete, ...separation, textAlign: "left" }}
              >
                {lastLabel}
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
                      ...(index === 0 ? separation : {}),
                      textTransform: "none",
                      letterSpacing: 0,
                      fontWeight: 400,
                      whiteSpace: "normal",
                      minWidth: 72,
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
                    pt: 1.25,
                    pb: 0.5,
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
                      py: 0.25,
                      fontWeight: 400,
                      ...colonneFixe,
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
                          sx={chiffre}
                        >
                          {ligne.caption}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                  {cellules.map((cellule) => {
                    const v = valeur(ligne, cellule.parts);
                    return (
                      <Box
                        component="td"
                        key={cellule.key}
                        sx={{
                          ...chiffre,
                          ...(cellule.first ? separation : {}),
                          px: 1,
                          textAlign: "right",
                          color: v > 0 ? "text.primary" : "text.disabled",
                          backgroundImage: fond(
                            "left",
                            (100 * v) / maxima[cellule.key],
                            chart.markSoft,
                          ),
                        }}
                      >
                        {format(v)}
                      </Box>
                    );
                  })}
                  <Box
                    component="td"
                    sx={{
                      ...chiffre,
                      ...separation,
                      px: 1,
                      textAlign: "right",
                      fontWeight: 700,
                    }}
                  >
                    {format(ligne.total)}
                  </Box>
                  {lastLabel && (
                    <Box
                      component="td"
                      sx={{
                        ...chiffre,
                        ...separation,
                        px: 1,
                        whiteSpace: "nowrap",
                        backgroundImage: ligne.last
                          ? fond(
                              "right",
                              (100 * ligne.last.value) / maxDernier,
                              chart.track,
                            )
                          : "none",
                      }}
                    >
                      {ligne.last && (
                        <>
                          {format(ligne.last.value)}
                          {ligne.last.note && (
                            <Box
                              component="span"
                              sx={{ color: "text.secondary", ml: 1 }}
                            >
                              {ligne.last.note}
                            </Box>
                          )}
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

const visuallyHidden = {
  position: "absolute",
  width: 1,
  height: 1,
  overflow: "hidden",
  clip: "rect(0 0 0 0)",
  whiteSpace: "nowrap",
} as const;

// La colonne des joueurs reste en place quand le tableau défile sur un écran étroit.
const colonneFixe = {
  position: "sticky",
  left: 0,
  zIndex: 1,
  height: 36,
  backgroundColor: "background.paper",
} as const;
