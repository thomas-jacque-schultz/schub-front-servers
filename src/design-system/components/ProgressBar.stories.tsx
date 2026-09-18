import type { Meta, StoryObj } from "@storybook/react";
import { ProgressBar } from "./ProgressBar";

const meta = {
  title: "Primitives/ProgressBar",
  component: ProgressBar,
  args: { label: "Chargement des comptes" },
} satisfies Meta<typeof ProgressBar>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Toujours indéterminée : aucun appel de cette application ne sait dire où il en est, et une
 * barre qui prétendrait le contraire mentirait.
 */
export const EnCours: Story = {};
