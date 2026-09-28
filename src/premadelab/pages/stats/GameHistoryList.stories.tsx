import type { Meta, StoryObj } from "@storybook/react";
import { Text } from "../../../common";
import { GameHistoryList } from "./GameHistoryList";
import { partie } from "./storyFixtures";

const MEMBRES = [
  { memberId: "m1", displayName: "Joueuse A" },
  { memberId: "m2", displayName: "Joueur B" },
  { memberId: "m3", displayName: "Joueur C" },
  { memberId: "m4", displayName: "Joueuse D" },
];

const meta = {
  title: "PremadeLab/Historique des parties",
  component: GameHistoryList,
  args: {
    games: [
      partie(1, true, MEMBRES),
      partie(2, false, MEMBRES.slice(0, 3)),
      partie(3, true, MEMBRES),
    ],
    avatars: {},
    renderDetail: () => (
      <Text tone="secondary">
        Détail de la partie : face-à-face, début de partie, notes.
      </Text>
    ),
  },
} satisfies Meta<typeof GameHistoryList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Equipe: Story = {};

export const SansPresence: Story = { args: { showPresence: false } };
