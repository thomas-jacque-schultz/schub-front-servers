import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { Chip } from "./Chip";
import { Disclosure } from "./Disclosure";

const meta = {
  title: "Primitives/Disclosure",
  component: Disclosure,
  args: {
    title: "2 guildes disponibles",
    open: true,
    onToggle: () => {},
    children: <Typography variant="body2">Le contenu du bloc, déplié.</Typography>,
  },
} satisfies Meta<typeof Disclosure>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Replie: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <Disclosure title="2 guildes disponibles" open={open} onToggle={setOpen}>
        <Stack spacing={1}>
          <Typography variant="body2">#annonces</Typography>
          <Typography variant="body2">#général</Typography>
        </Stack>
      </Disclosure>
    );
  },
};

export const AvecMention: Story = {
  render: () => {
    const [open, setOpen] = useState(true);
    return (
      <Disclosure
        title="2 guildes disponibles"
        meta={<Chip label="3 retenus" tone="primary" />}
        open={open}
        onToggle={setOpen}
      >
        <Typography variant="body2">Le contenu du bloc, déplié.</Typography>
      </Disclosure>
    );
  },
};
