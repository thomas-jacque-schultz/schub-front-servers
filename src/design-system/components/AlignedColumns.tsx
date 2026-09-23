import { type ReactNode } from "react";
import Box from "@mui/material/Box";
import MuiCard from "@mui/material/Card";
import { spacingUnit } from "../tokens";

export interface AlignedColumn {
  key: string;
  /** Même nombre de sections dans chaque colonne ; une section vide garde sa rangée. */
  sections: ReactNode[];
}

export interface AlignedColumnsProps {
  columns: AlignedColumn[];
  minWidth?: number;
  count?: number;
}

// Subgrid : chaque carte s'étend sur autant de rangées que de sections, la section n de chaque colonne partage donc sa rangée.
export function AlignedColumns({ columns, minWidth = 220, count }: AlignedColumnsProps) {
  const rangees = Math.max(0, ...columns.map((column) => column.sections.length));
  const replie = `repeat(auto-fit, minmax(min(${minWidth}px, 100%), 1fr))`;
  const tenu = count ? `repeat(${count}, minmax(0, 1fr))` : replie;

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: replie, lg: tenu },
        columnGap: `${2 * spacingUnit}px`,
        rowGap: 0,
      }}
    >
      {columns.map((column) => (
        <MuiCard
          key={column.key}
          sx={{
            gridRow: `span ${rangees}`,
            display: "grid",
            gridTemplateRows: "subgrid",
            rowGap: `${1.5 * spacingUnit}px`,
            p: 2,
            mb: 2,
            minWidth: 0,
          }}
        >
          {Array.from({ length: rangees }, (_, index) => (
            <Box key={index} sx={{ minWidth: 0 }}>
              {column.sections[index] ?? null}
            </Box>
          ))}
        </MuiCard>
      ))}
    </Box>
  );
}
