import { type ReactNode } from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import { typographyTokens } from "../tokens";
import { EmptyState } from "./EmptyState";

export interface DataTableColumn<Row> {
  key: string;
  header: string;
  align?: "left" | "center" | "right";
  width?: number | string;
  render: (row: Row) => ReactNode;
}

export interface DataTableProps<Row> {
  columns: Array<DataTableColumn<Row>>;
  rows: Row[];
  rowKey: (row: Row) => string;
  caption: string;
  emptyTitle: string;
  emptyDescription?: string;
  dense?: boolean;
  layout?: "auto" | "fixed";
  minWidth?: number;
  /** Encadre une ligne dans la couleur d'accent : à réserver à une ligne par tableau, ou presque. */
  rowAccent?: (row: Row) => boolean;
}

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
  rowAccent,
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
                  fontFamily: typographyTokens.monospaceFontFamily,
                  fontSize: "0.72rem",
                  letterSpacing: typographyTokens.letterSpacing.wide,
                  textTransform: "uppercase",
                  fontWeight: 600,
                  color: "text.secondary",
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
            <TableRow
              key={rowKey(row)}
              hover
              sx={
                rowAccent?.(row)
                  ? { outline: "1px solid", outlineColor: "primary.main", outlineOffset: "-1px" }
                  : undefined
              }
            >
              {columns.map((column) => (
                <TableCell
                  key={column.key}
                  align={column.align ?? "left"}
                  sx={{
                    verticalAlign: "middle",
                    wordBreak: fixe ? "break-word" : undefined,
                    ...(column.align === "right"
                      ? { fontFamily: typographyTokens.monospaceFontFamily }
                      : {}),
                  }}
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
