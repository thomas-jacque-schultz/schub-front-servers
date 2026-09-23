import type { Meta, StoryObj } from "@storybook/react";
import InboxOutlinedIcon from "@mui/icons-material/InboxOutlined";
import { Button } from "./Button";
import { Card } from "./Card";
import { EmptyState } from "./EmptyState";

const meta = {
  title: "Primitives/EmptyState",
  component: EmptyState,
  args: {
    title: "Aucun serveur à afficher.",
    description: "Les fiches créées depuis la configuration apparaîtront ici.",
  },
} satisfies Meta<typeof EmptyState>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Simple: Story = {};

export const AvecIcone: Story = {
  args: { icon: <InboxOutlinedIcon fontSize="inherit" /> },
};

export const AvecAction: Story = {
  args: {
    icon: <InboxOutlinedIcon fontSize="inherit" />,
    action: <Button>Ajouter un serveur</Button>,
  },
};

export const DansUneCarte: Story = {
  render: (args) => (
    <Card title="État des serveurs">
      <EmptyState {...args} icon={<InboxOutlinedIcon fontSize="inherit" />} />
    </Card>
  ),
};
