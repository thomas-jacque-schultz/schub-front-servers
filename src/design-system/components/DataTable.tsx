import { type ReactNode } from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import { EmptyState } from "./EmptyState";

export interface DataTableColumn<Row> {
  key: string;
  header: string;
  align?: "left" | "center" | "right";
  /** Largeur de la colonne. En `layout="fixed"`, c'est elle qui la détermine. */
  width?: number | string;
  render: (row: Row) => ReactNode;
}

export interface DataTableProps<Row> {
  columns: Array<DataTableColumn<Row>>;
  rows: Row[];
  /** La clé React d'une ligne — jamais l'index : une liste rechargée se réordonne. */
  rowKey: (row: Row) => string;
  /** Résumé lu par les lecteurs d'écran : ce que ce tableau liste. */
  caption: string;
  emptyTitle: string;
  emptyDescription?: string;
  dense?: boolean;
  /**
   * `fixed` fige les largeurs déclarées.
   *
   * <p>En `auto`, le navigateur répartit les colonnes d'après leur contenu : une cellule plus
   * longue dans une ligne élargit la colonne pour toutes, et un rechargement redistribue tout.
   * Les colonnes « dansent », et c'est la cause, pas la conséquence. `fixed` la retire : la
   * largeur vient de la déclaration, le contenu s'y plie.</p>
   */
  layout?: "auto" | "fixed";
  /** Largeur minimale sous laquelle le tableau défile plutôt que de se tasser. */
  minWidth?: number;
}

/**
 * Le tableau de données.
 *
 * <p>Les colonnes sont **déclarées**, pas écrites en JSX : c'est ce qui permet d'aligner les
 * en-têtes et les cellules sans que chaque écran redécide de ses marges, et de traiter le cas
 * de la liste vide une seule fois, ici.</p>
 *
 * <p>Une liste vide rend un {@link EmptyState} et non un tableau à zéro ligne : un cadre vide se
 * lit comme une panne de chargement.</p>
 */
export function DataTable<Row>({
  columns,
  rows,
  rowKey,
  caption,
  emptyTitle,
  emptyDescription,
  dense = false,
  layout = "auto",
  minWidth,
}: DataTableProps<Row>) {
  if (rows.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }

  const fixe = layout === "fixed";

  return (
    <TableContainer sx={{ overflowX: "auto" }}>
      <Table
        size={dense ? "small" : "medium"}
        aria-label={caption}
        sx={{ tableLayout: fixe ? "fixed" : "auto", minWidth }}
      >
        {fixe && (
          <colgroup>
            {columns.map((column) => (
              <col key={column.key} style={{ width: column.width }} />
            ))}
          </colgroup>
        )}
        <TableHead>
          <TableRow>
            {columns.map((column) => (
              <TableCell
                key={column.key}
                align={column.align ?? "left"}
                sx={{
                  width: fixe ? undefined : column.width,
                  fontWeight: 700,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {column.header}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={rowKey(row)} hover>
              {columns.map((column) => (
                <TableCell
                  key={column.key}
                  align={column.align ?? "left"}
                  sx={{ verticalAlign: "middle", wordBreak: fixe ? "break-word" : undefined }}
                >
                  {column.render(row)}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
