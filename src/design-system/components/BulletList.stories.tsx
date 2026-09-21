import type { Meta, StoryObj } from "@storybook/react";
import { BulletList } from "./BulletList";

const meta = {
  title: "Primitives/BulletList",
  component: BulletList,
  args: {
    items: [
      "Ce qui est collecté, et pourquoi",
      "Où la donnée est stockée et combien de temps",
      "Comment en demander la suppression",
    ],
  },
} satisfies Meta<typeof BulletList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Puces: Story = {};

/** Numérotée quand l'ordre porte du sens : une marche à suivre, pas un inventaire. */
export const Numerotee: Story = {
  args: { ordered: true },
};

export const Secondaire: Story = {
  args: { tone: "secondary" },
};
