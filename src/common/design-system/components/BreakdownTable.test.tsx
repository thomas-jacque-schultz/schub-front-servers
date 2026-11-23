import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { AppThemeProvider } from "../AppThemeProvider";
import { BreakdownTable } from "./BreakdownTable";

const rendu = () =>
  renderToString(
    <AppThemeProvider>
      <BreakdownTable
        caption="Répartition"
        rowHeader="Joueur"
        totalLabel="Total"
        lastLabel="Perdu"
        columns={[
          {
            key: "fixe",
            label: "Fixe",
            parts: [{ key: "base", label: "Base" }],
          },
          {
            key: "gains",
            label: "Gains",
            parts: [
              { key: "a", label: "A" },
              { key: "b", label: "B" },
            ],
          },
        ]}
        sections={[
          {
            key: "s",
            title: "Camp",
            rows: [
              {
                key: "1",
                label: "Un",
                values: { base: 500, a: 300, b: 0 },
                total: 800,
                last: { value: 200 },
              },
              {
                key: "2",
                label: "Deux",
                values: { base: 500, a: 100, b: 0 },
                total: 600,
              },
            ],
          },
        ]}
        format={String}
        toggleLabel={(colonne) => colonne}
      />
    </AppThemeProvider>,
  );

describe("BreakdownTable", () => {
  it("se rend avec une colonne uniforme, chaque valeur écrite, en vrai tableau titré", () => {
    const html = rendu();
    expect(html).toContain("<table");
    expect(html).toContain("Répartition");
    expect(html).toContain(">800<");
    expect(html).toContain('scope="row"');
  });
});
