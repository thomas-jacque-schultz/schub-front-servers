import type { Meta, StoryObj } from "@storybook/react";
import Stack from "@mui/material/Stack";
import { Link } from "./Link";

const meta = {
  title: "Primitives/Link",
  component: Link,
  args: { href: "/servers", children: "L'état des serveurs", tone: "default" },
  argTypes: { tone: { control: "inline-radio", options: ["default", "muted"] } },
} satisfies Meta<typeof Link>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Interne: Story = {};

/**
 * Une adresse absolue est déduite comme sortante : nouvel onglet, `noopener`, et l'icône qui
 * prévient. C'est ce qui rend l'ouverture d'onglet acceptable — une surprise silencieuse ne
 * l'est pas.
 */
export const Sortant: Story = {
  args: { href: "https://example.org/un-document", children: "Un document public" },
};

export const LesDeuxTons: Story = {
  render: () => (
    <Stack spacing={1}>
      <Link href="/servers">Ton par défaut</Link>
      <Link href="/servers" tone="muted">
        Ton discret, pour un pied de page
      </Link>
    </Stack>
  ),
};
