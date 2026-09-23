import type { Meta, StoryObj } from "@storybook/react";
import { AlignedColumns } from "./AlignedColumns";
import { Text } from "./Text";

const meta = {
  title: "Mise en page/AlignedColumns",
  component: AlignedColumns,
} satisfies Meta<typeof AlignedColumns>;

export default meta;
type Story = StoryObj<typeof meta>;

const texte = (lignes: number) => (
  <Text variant="caption" tone="secondary">
    {Array.from({ length: lignes }, () => "Une ligne de contenu.").join(" ")}
  </Text>
);

export const SectionsDeHauteursDifferentes: Story = {
  args: {
    count: 3,
    columns: [
      { key: "a", sections: [<Text key="t">Haut</Text>, texte(1), texte(6), texte(2)] },
      { key: "b", sections: [<Text key="t">Jungle</Text>, texte(4), texte(1), texte(2)] },
      { key: "c", sections: [<Text key="t">Milieu</Text>, null, texte(3), texte(8)] },
    ],
  },
};
