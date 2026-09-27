import type { Meta, StoryObj } from "@storybook/react";
import { ProgressBar } from "./ProgressBar";

const meta = {
  title: "Primitives/ProgressBar",
  component: ProgressBar,
  args: { label: "Chargement des comptes" },
} satisfies Meta<typeof ProgressBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const EnCours: Story = {};
