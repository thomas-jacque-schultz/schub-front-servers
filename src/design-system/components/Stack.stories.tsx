import type { Meta, StoryObj } from "@storybook/react";
import { Card } from "./Card";
import { Stack } from "./Stack";
import { Text } from "./Text";

const meta = {
  title: "Primitives/Stack",
  component: Stack,
  args: { direction: "column", spacing: 2, children: null },
  argTypes: {
    direction: { control: "inline-radio", options: ["column", "row", "responsive"] },
    spacing: { control: { type: "range", min: 0, max: 6, step: 0.5 } },
    align: { control: "inline-radio", options: [undefined, "start", "center", "end", "stretch"] },
    justify: { control: "inline-radio", options: [undefined, "start", "center", "end", "between"] },
  },
} satisfies Meta<typeof Stack>;

export default meta;
type Story = StoryObj<typeof meta>;

const Bloc = ({ label }: { label: string }) => (
  <Card>
    <Text>{label}</Text>
  </Card>
);

export const Colonne: Story = {
  render: (args) => (
    <Stack {...args}>
      <Bloc label="Premier bloc" />
      <Bloc label="Deuxième bloc" />
      <Bloc label="Troisième bloc" />
    </Stack>
  ),
};

export const Ligne: Story = {
  args: { direction: "row" },
  render: Colonne.render,
};

export const Responsive: Story = {
  args: { direction: "responsive" },
  render: Colonne.render,
};

export const EspaceEtReparties: Story = {
  args: { direction: "row", justify: "between", align: "center" },
  render: Colonne.render,
};
