export interface ParsedRiotId {
  gameName: string;
  tagLine: string;
}

export const parseRiotId = (raw: string): ParsedRiotId | null => {
  const parts = raw.trim().split("#");

  if (parts.length !== 2) {
    return null;
  }

  const [gameName, tagLine] = parts.map((part) => part.trim());

  if (!gameName || !tagLine) {
    return null;
  }

  return { gameName, tagLine };
};

export const isRiotIdComplete = (raw: string): boolean => parseRiotId(raw) !== null;
