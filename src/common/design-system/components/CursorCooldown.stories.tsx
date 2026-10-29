import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Button } from "./Button";
import { CursorCooldown } from "./CursorCooldown";

// Un clic lance l'attente : l'anneau se remplit autour de la souris pendant deux secondes, puis disparaît.
const meta = {
  title: "Jeux/CursorCooldown",
  component: CursorCooldown,
  args: { trigger: null, durationMs: 2000 },
  render: (args) => {
    const [essai, setEssai] = useState<number | null>(null);
    return (
      <>
        <Button onClick={() => setEssai((n) => (n ?? 0) + 1)}>
          Un essai raté
        </Button>
        <CursorCooldown {...args} trigger={essai} />
      </>
    );
  },
} satisfies Meta<typeof CursorCooldown>;

export default meta;
type Story = StoryObj<typeof meta>;

export const AuClic: Story = {};
