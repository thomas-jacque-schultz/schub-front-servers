import type { Meta, StoryObj } from "@storybook/react";
import { DotStrip } from "./DotStrip";

const meta = {
  title: "Données/DotStrip",
  component: DotStrip,
  args: {
    duration: 1800,
    ariaLabel: "Morts dans le temps",
    points: [
      { key: "a", at: 300, value: 300, label: "5:00 · 300" },
      {
        key: "b",
        at: 900,
        value: 750,
        emphasis: true,
        label: "15:00 · 750, dont 450 de série",
      },
      { key: "c", at: 1500, value: 400, label: "25:00 · 400" },
    ],
  },
  decorators: [
    (Story) => (
      <div style={{ width: 240 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof DotStrip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Morts: Story = {};
