/**
 * Une durée servie par le cœur, ramenée en minutes.
 *
 * <p>Jackson sérialise une `Duration` de deux façons selon `WRITE_DURATIONS_AS_TIMESTAMPS` :
 * en ISO-8601 (`"PT20M"`) ou en secondes décimales (`1200.0`). Rien ne fixe ce réglage côté cœur,
 * et les deux formes sont plausibles sur le fil.</p>
 *
 * <p><strong>Les deux sont donc lues, et ce n'est pas de la complaisance :</strong> se tromper de
 * forme n'échouerait pas, ça afficherait « 1 200 minutes » là où il faut lire « 20 minutes ». Un
 * chiffre faux est pire qu'un chiffre absent, parce qu'il se lit comme vrai. `null` quand la forme
 * n'est ni l'une ni l'autre : l'écran n'affiche alors pas de ligne de durée.</p>
 */
const ISO_DURATION = /^P(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:([\d.]+)S)?)?$/;

export const durationToMinutes = (value: string | number | null | undefined): number | null => {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value === "number") {
    return Number.isFinite(value) ? Math.round(value / 60) : null;
  }

  const match = ISO_DURATION.exec(value.trim());
  if (!match) {
    return null;
  }

  const [, days, hours, minutes, seconds] = match;
  const total =
    Number(days ?? 0) * 1440 +
    Number(hours ?? 0) * 60 +
    Number(minutes ?? 0) +
    Number(seconds ?? 0) / 60;

  return Number.isFinite(total) ? Math.round(total) : null;
};
