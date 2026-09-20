import type { Meta, StoryObj } from "@storybook/react";
import Stack from "@mui/material/Stack";
import { Spinner } from "./Spinner";

const meta = {
  title: "Primitives/Spinner",
  component: Spinner,
  args: { label: "Chargement des salons", size: "medium" },
  argTypes: { size: { control: "inline-radio", options: ["small", "medium", "large"] } },
} satisfies Meta<typeof Spinner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ParDefaut: Story = {};

export const LesTroisTailles: Story = {
  render: () => (
    <Stack direction="row" spacing={3} alignItems="center">
      <Spinner size="small" label="Chargement" />
      <Spinner size="medium" label="Chargement" />
      <Spinner size="large" label="Chargement" />
    </Stack>
  ),
};
