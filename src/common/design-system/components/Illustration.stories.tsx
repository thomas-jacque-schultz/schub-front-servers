import type { Meta, StoryObj } from "@storybook/react";
import { Illustration } from "./Illustration";

const meta = {
  title: "Mise en page/Illustration",
  component: Illustration,
  args: { src: "/premadelab/splash.svg", alt: "Illustration" },
} satisfies Meta<typeof Illustration>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ParDefaut: Story = {};

export const Basse: Story = {
  args: { maxHeight: 160 },
};
