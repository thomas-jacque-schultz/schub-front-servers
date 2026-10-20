import type { Meta, StoryObj } from "@storybook/react";
import { Columns } from "./Columns";
import { FeatureTile } from "./FeatureTile";

const meta = {
  title: "Mise en page/FeatureTile",
  component: FeatureTile,
  args: {
    image: "/premadelab/splash.svg",
    imageAlt: "Illustration",
    title: "Ta fiche : rang, champions, style de jeu",
  },
} satisfies Meta<typeof FeatureTile>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SansLien: Story = {};

export const AvecLien: Story = {
  args: { to: "/combos" },
};

export const EnGrille: Story = {
  render: (args) => (
    <Columns minWidth={240} count={3}>
      <FeatureTile {...args} to="/" />
      <FeatureTile {...args} title="Les stats de ta premade" to="/" />
      <FeatureTile {...args} title="Prépare ta draft" to="/" />
    </Columns>
  ),
};
