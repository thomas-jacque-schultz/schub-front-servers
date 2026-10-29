import type { Meta, StoryObj } from "@storybook/react";
import { MacroMap, type MacroMapLandmark, type MacroShape } from "./MacroMap";
import { MACRO_ICONS } from "./macroIcons";

const REPERES: MacroMapLandmark[] = [
  { x: 400, y: 420, kind: "fountain", side: "blue" },
  { x: 1550, y: 1660, kind: "nexus", side: "blue" },
  { x: 5846, y: 6396, kind: "tower", side: "blue" },
  { x: 3872, y: 7900, kind: "camp", side: "blue" },
  { x: 5007, y: 10471, kind: "objective", side: "neutral" },
  { x: 9866, y: 4414, kind: "objective", side: "neutral" },
  { x: 4400, y: 9600, kind: "crab", side: "neutral" },
  { x: 9054, y: 8504, kind: "tower", side: "red" },
  { x: 13350, y: 13240, kind: "nexus", side: "red" },
  { x: 14500, y: 14480, kind: "fountain", side: "red" },
];

const MESURE: MacroShape[] = [
  { kind: "range", center: REPERES[2], radius: 1200, color: "mark" },
  { kind: "line", from: REPERES[2], to: REPERES[4], color: "mark", width: 0.0033 },
  { kind: "point", at: REPERES[2], letter: "A", color: "mark" },
  { kind: "point", at: REPERES[4], letter: "B", color: "markSecondary" },
  { kind: "label", at: { x: 5426, y: 8433 }, text: "4 095" },
];

const PLAN: MacroShape[] = [
  {
    kind: "line",
    from: { x: 7000, y: 3000 },
    to: { x: 9600, y: 4300 },
    color: "#5B9BE8",
    width: 0.006,
    arrow: true,
  },
  {
    kind: "path",
    points: [
      { x: 3000, y: 9000 },
      { x: 3600, y: 9800 },
      { x: 4400, y: 10200 },
      { x: 4900, y: 10300 },
    ],
    color: "#E0576B",
    width: 0.006,
  },
  {
    kind: "ellipse",
    from: { x: 8900, y: 3700 },
    to: { x: 10800, y: 5100 },
    color: "#FFD23F",
    width: 0.003,
  },
  { kind: "range", center: { x: 8300, y: 6200 }, radius: 900, color: "#FFD23F" },
  { kind: "icon", at: { x: 8300, y: 6200 }, src: MACRO_ICONS.ward },
  { kind: "icon", at: { x: 9866, y: 4414 }, src: MACRO_ICONS.dragon },
  { kind: "icon", at: { x: 6200, y: 7600 }, src: MACRO_ICONS.danger },
  { kind: "selection", at: { x: 6200, y: 7600 } },
];

const meta = {
  title: "Données/MacroMap",
  component: MacroMap,
  args: {
    label: "La Faille",
    landmarks: REPERES,
    shapes: MESURE,
  },
  decorators: [(Story) => <div style={{ maxWidth: 520 }}>{Story()}</div>],
} satisfies Meta<typeof MacroMap>;

export default meta;
type Story = StoryObj<typeof meta>;

export const UneMesure: Story = {};

export const UnPlan: Story = {
  args: {
    shapes: PLAN,
    cursors: [{ id: "1", name: "Membre 2", at: { x: 7600, y: 7000 }, color: "#4FB783" }],
  },
};
