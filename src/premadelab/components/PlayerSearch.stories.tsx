import type { Meta, StoryObj } from "@storybook/react";
import { expect, userEvent, within } from "@storybook/test";
import { fauxServeur, json } from "../../../.storybook/fauxServeur";
import type { PlayerSuggestionDto } from "../types/player";
import { PlayerSearch } from "./PlayerSearch";

const HIER = new Date(Date.now() - 86_400_000).toISOString();

const TROUVES: PlayerSuggestionDto[] = [
  {
    riotId: "Nova#EUW",
    gameName: "Nova",
    tagLine: "EUW",
    matchCount: 42,
    positions: ["MIDDLE"],
    lastPlayedAt: HIER,
  },
  {
    riotId: "Novalune#1234",
    gameName: "Novalune",
    tagLine: "1234",
    matchCount: 7,
    positions: ["TOP"],
    lastPlayedAt: HIER,
  },
];

const recherche = (trouves: PlayerSuggestionDto[]) =>
  fauxServeur((url) =>
    url.pathname.endsWith("/players/search") ? json(trouves) : undefined,
  );

const saisir = async (canvasElement: HTMLElement, texte: string) => {
  const canvas = within(canvasElement);
  await userEvent.type(canvas.getByRole("textbox"), texte);
  return canvas;
};

const meta = {
  title: "PremadeLab/Recherche de joueur",
  component: PlayerSearch,
  decorators: [recherche([])],
} satisfies Meta<typeof PlayerSearch>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Saisie: Story = {};

export const Propositions: Story = {
  decorators: [recherche(TROUVES)],
  play: async ({ canvasElement }) => {
    const canvas = await saisir(canvasElement, "Nov");
    await expect(await canvas.findByText("Nova#EUW")).toBeInTheDocument();
  },
};

export const AucuneProposition: Story = {
  play: async ({ canvasElement }) => {
    await saisir(canvasElement, "Zzq");
  },
};

export const RiotIdIncomplet: Story = {
  play: async ({ canvasElement }) => {
    const canvas = await saisir(canvasElement, "Nova{Enter}");
    await expect(canvas.getByRole("textbox")).toHaveAttribute(
      "aria-invalid",
      "true",
    );
  },
};
