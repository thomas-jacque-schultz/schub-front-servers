import type { Meta, StoryObj } from "@storybook/react";
import { ScoreRow } from "./ScoreRow";
import { Stack } from "./Stack";
import { Text } from "./Text";

const meta = {
  title: "Données/ScoreRow",
  component: ScoreRow,
  args: {
    label: "CS par minute",
    value: "7,6",
    score: 0.72,
    scoreLabel: "Mieux que 72 % des joueurs de son palier",
    adornment: <Text variant="caption">Or</Text>,
  },
  decorators: [(Story) => <div style={{ maxWidth: 420 }}>{Story()}</div>],
} satisfies Meta<typeof ScoreRow>;

export default meta;
type Story = StoryObj<typeof meta>;

export const AvecNote: Story = {};

export const AvecPrecision: Story = {
  args: {
    label: "KDA",
    value: "2,1",
    hint: "7,3 / 6,6 / 6,5 par partie",
    score: 0.28,
    adornment: undefined,
  },
};

export const SansJauge: Story = {
  args: {
    label: "Dégâts subis par minute",
    value: "1 326",
    score: null,
    adornment: undefined,
  },
};

export const Empilees: Story = {
  render: () => (
    <Stack spacing={0}>
      <ScoreRow label="Dégâts par minute" value="911" score={0.72} />
      <ScoreRow label="Part des dégâts de l'équipe" value="23 %" score={0.55} />
      <ScoreRow label="Participation aux kills" value="43 %" score={0.9} />
    </Stack>
  ),
};
