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
  /** Largeur figée d'une colonne d'actions, pour que le tableau ne danse pas au rechargement. */
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
}: DataTableProps<Row>) {
  if (rows.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }

  return (
    <TableContainer>
      <Table size={dense ? "small" : "medium"} aria-label={caption}>
        <TableHead>
          <TableRow>
            {columns.map((column) => (
              <TableCell
                key={column.key}
                align={column.align ?? "left"}
                sx={{ width: column.width, fontWeight: 700, whiteSpace: "nowrap" }}
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
                <TableCell key={column.key} align={column.align ?? "left"}>
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
