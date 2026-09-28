import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent, within } from "@storybook/test";
import { enAttente, fauxServeur, json } from "../../../.storybook/fauxServeur";
import type { KnownRiotAccountDto } from "../types/profile";
import { RiotAccountPicker } from "./RiotAccountPicker";

const IL_Y_A_DEUX_JOURS = new Date(Date.now() - 2 * 86_400_000).toISOString();

const compte = (
  gameName: string,
  tagLine: string,
  matchCount: number,
  extra: Partial<KnownRiotAccountDto> = {},
): KnownRiotAccountDto => ({
  riotId: `${gameName}#${tagLine}`,
  gameName,
  tagLine,
  matchCount,
  positions: [
    { position: "MIDDLE", matches: Math.ceil(matchCount / 2) },
    { position: "TOP", matches: Math.floor(matchCount / 3) },
  ],
  lastPlayedAt: IL_Y_A_DEUX_JOURS,
  observedAt: IL_Y_A_DEUX_JOURS,
  source: "PARTICIPATION",
  alreadyLinked: false,
  mine: false,
  ...extra,
});

const CONNUS = [
  compte("Nova", "EUW", 42),
  compte("Novalune", "1234", 7),
  compte("Nov4", "FR1", 0, { alreadyLinked: true }),
];
const VERIFIE = [compte("Nova", "EUW", 42, { source: "RESOLUTION" })];

const suggestions = (repondre: (q: string) => Response | Promise<Response>) =>
  fauxServeur((url) =>
    url.pathname.endsWith("/users/me/riot-account/suggestions")
      ? repondre(url.searchParams.get("q") ?? "")
      : undefined,
  );

const saisir = async (canvasElement: HTMLElement, texte: string) => {
  const canvas = within(canvasElement);
  await userEvent.type(canvas.getByRole("textbox"), texte);
  return canvas;
};

// Laisse passer la recherche différée : sa réponse arriverait après la vérification et l'effacerait.
const RECHERCHE_FINIE_MS = 800;

const demanderARiot = async (canvasElement: HTMLElement) => {
  const canvas = await saisir(canvasElement, "Nova#EUW");
  await new Promise((fin) => setTimeout(fin, RECHERCHE_FINIE_MS));
  await userEvent.click(
    canvas.getByRole("button", { name: /Demander à Riot|Ask Riot/ }),
  );
  return canvas;
};

const meta = {
  title: "PremadeLab/Sélecteur de compte Riot",
  component: RiotAccountPicker,
  args: { onPick: fn() },
  decorators: [suggestions(() => json([]))],
} satisfies Meta<typeof RiotAccountPicker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Saisie: Story = {};

export const Propositions: Story = {
  decorators: [suggestions(() => json(CONNUS))],
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

export const Verification: Story = {
  decorators: [suggestions((q) => (q.includes("#") ? enAttente() : json([])))],
  play: async ({ canvasElement }) => {
    await demanderARiot(canvasElement);
  },
};

export const Verifie: Story = {
  decorators: [suggestions((q) => json(q.includes("#") ? VERIFIE : []))],
  play: async ({ canvasElement }) => {
    const canvas = await demanderARiot(canvasElement);
    await expect(await canvas.findByText("Nova#EUW")).toBeInTheDocument();
  },
};

export const Refus: Story = {
  decorators: [
    suggestions((q) =>
      q.includes("#") ? json({ detail: "Inconnu" }, 404) : json([]),
    ),
  ],
  play: async ({ canvasElement }) => {
    await demanderARiot(canvasElement);
  },
};
