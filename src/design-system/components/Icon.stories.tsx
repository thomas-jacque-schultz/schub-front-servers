import type { Meta, StoryObj } from "@storybook/react";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { ICON_NAMES, Icon } from "./Icon";

const meta = {
  title: "Primitives/Icon",
  component: Icon,
  args: { name: "refresh", size: "medium" },
  argTypes: {
    name: { control: "select", options: ICON_NAMES },
    size: { control: "inline-radio", options: ["small", "medium"] },
  },
} satisfies Meta<typeof Icon>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ParDefaut: Story = {};

export const LeRepertoire: Story = {
  render: () => (
    <Stack direction="row" spacing={3} flexWrap="wrap" useFlexGap>
      {ICON_NAMES.map((name) => (
        <Stack key={name} spacing={0.5} alignItems="center" sx={{ width: 96 }}>
          <Icon name={name} />
          <Typography variant="caption" color="text.secondary">
            {name}
          </Typography>
        </Stack>
      ))}
    </Stack>
  ),
};

export const DecorativeOuAnnoncee: Story = {
  render: () => (
    <Stack direction="row" spacing={2} alignItems="center">
      <Icon name="storage" />
      <Icon name="storage" label="Stockage" />
    </Stack>
  ),
};
