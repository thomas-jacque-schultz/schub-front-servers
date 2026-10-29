// Les pictogrammes de la minimap du jeu (Community Dragon, game/assets/ux/minimap/icons et pings), auto-hébergés
// comme la minimap : aucune requête vers un tiers.
import atakhan from "../assets/macro/atakhan.png";
import baron from "../assets/macro/baron.png";
import caution from "../assets/macro/caution.png";
import controlWard from "../assets/macro/control-ward.png";
import danger from "../assets/macro/danger.png";
import dragon from "../assets/macro/dragon.png";
import farsight from "../assets/macro/farsight.png";
import grubs from "../assets/macro/grubs.png";
import herald from "../assets/macro/herald.png";
import onMyWay from "../assets/macro/on-my-way.png";
import push from "../assets/macro/push.png";
import ward from "../assets/macro/ward.png";

export const MACRO_ICONS = {
  ward,
  controlWard,
  farsight,
  dragon,
  baron,
  herald,
  grubs,
  atakhan,
  danger,
  onMyWay,
  caution,
  push,
} as const;

export type MacroIconKey = keyof typeof MACRO_ICONS;
