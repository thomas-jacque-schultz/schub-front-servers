import type { Meta, StoryObj } from "@storybook/react";
import { EmbeddedApp } from "./EmbeddedApp";

const meta = {
  title: "Structure/EmbeddedApp",
  component: EmbeddedApp,
  args: { src: "about:blank", title: "Application intégrée" },
} satisfies Meta<typeof EmbeddedApp>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Vide: Story = {};
