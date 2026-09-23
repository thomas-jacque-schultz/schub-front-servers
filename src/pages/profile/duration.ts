// Jackson sérialise une Duration en ISO-8601 ("PT20M") ou en secondes décimales (1200.0) selon
// WRITE_DURATIONS_AS_TIMESTAMPS : les deux formes sont lues.
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
