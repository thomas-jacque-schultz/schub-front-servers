import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { MapRuler, type MapRulerLandmark } from "./MapRuler";
import { distance, type MapPoint } from "./mapRuler";

const REPERES: MapRulerLandmark[] = [
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

function Interactive({ radius, snap }: { radius: number; snap: boolean }) {
  const [a, setA] = useState<MapPoint>(REPERES[2]);
  const [b, setB] = useState<MapPoint>(REPERES[7]);
  return (
    <MapRuler
      label="De A à B"
      landmarks={REPERES}
      a={a}
      b={b}
      radius={radius}
      snap={snap}
      measureLabel={`${Math.round(distance(a, b))}`}
      onChange={(nouveauA, nouveauB) => {
        setA(nouveauA);
        setB(nouveauB);
      }}
    />
  );
}

const meta = {
  title: "Données/MapRuler",
  component: Interactive,
  args: { radius: 1200, snap: true },
  decorators: [(Story) => <div style={{ maxWidth: 520 }}>{Story()}</div>],
} satisfies Meta<typeof Interactive>;

export default meta;
type Story = StoryObj<typeof meta>;

export const MesureDeTourATour: Story = {};

export const SansAimant: Story = { args: { snap: false, radius: 550 } };
