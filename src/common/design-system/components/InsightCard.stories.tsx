import type { Meta, StoryObj } from "@storybook/react";
import { ConfidenceBadge } from "./ConfidenceBadge";
import { InsightCard } from "./InsightCard";
import { ScoreRow } from "./ScoreRow";
import { Stack } from "./Stack";
import { Text } from "./Text";
import { VERDICTS } from "./verdict";
import { VerdictMark } from "./VerdictMark";

const LIBELLES = {
  veryBelow: "Très en dessous",
  below: "En dessous",
  average: "Dans la moyenne",
  above: "Au-dessus",
  veryAbove: "Très au-dessus",
} as const;

const meta = {
  title: "Données/InsightCard",
  component: InsightCard,
  args: {
    title: "Revenus",
    conclusion: "Tu farmes moins que les Platine milieu.",
    verdict: "below",
    verdictLabel: "En dessous",
    visual: (
      <ScoreRow
        label="CS par minute"
        value="6,1"
        score={0.31}
        scoreLabel="Mieux que 31 % des Platine milieu"
      />
    ),
    details: (
      <Text variant="caption" tone="secondary">
        Mieux que 31 % des Platine au poste Milieu (412 joueurs), sur 38
        parties.
      </Text>
    ),
    detailsLabel: "Voir le détail",
    hideDetailsLabel: "Masquer le détail",
  },
  decorators: [(Story) => <div style={{ maxWidth: 440 }}>{Story()}</div>],
} satisfies Meta<typeof InsightCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const EnDessous: Story = {};

export const TresAuDessus: Story = {
  args: {
    title: "Vision",
    conclusion: "Ta vision est celle d'un Diamant.",
    verdict: "veryAbove",
    verdictLabel: "Très au-dessus",
  },
};

export const Neutre: Story = {
  args: {
    title: "Dégâts subis",
    conclusion: "Autant que les Platine milieu.",
    verdict: null,
    verdictLabel: undefined,
  },
};

export const ConfianceInsuffisante: Story = {
  args: {
    title: "Duos",
    conclusion: "Lee Sin et Thresh gagnent 3 parties sur 3.",
    verdict: "veryAbove",
    badge: (
      <ConfidenceBadge
        label="Confiance insuffisante"
        title="3 parties : il en faut 5 pour conclure."
      />
    ),
  },
};

/** Les cinq crans de l'échelle unique, et la mesure neutre. */
export const Echelle: Story = {
  render: () => (
    <Stack spacing={1}>
      {VERDICTS.map((verdict) => (
        <VerdictMark
          key={verdict}
          verdict={verdict}
          label={LIBELLES[verdict]}
        />
      ))}
      <VerdictMark verdict={null} label="Sans bon ni mauvais sens" />
    </Stack>
  ),
};
