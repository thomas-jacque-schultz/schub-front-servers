// Données inventées pour Storybook, qui est public : aucun joueur réel, aucun identifiant Riot.
import type {
  RadarReferencesDto,
  RankedStandingDto,
  ReferenceGridDto,
  StatLineDto,
  TeamGameDto,
  TeamGamePlayerDto,
} from "../../types/stats";

const IL_Y_A = (jours: number) =>
  new Date(Date.now() - jours * 86_400_000).toISOString();

export const ligne = (
  key: string,
  label: string | null,
  games: number,
  extra: Partial<StatLineDto> = {},
): StatLineDto => ({
  key,
  label,
  iconUrl: null,
  games,
  wins: Math.round(games * 0.54),
  winRate: 0.54,
  kda: 3.1,
  killsPerGame: 6.2,
  deathsPerGame: 4.1,
  assistsPerGame: 6.5,
  csPerMinute: 7.4,
  goldPerMinute: 412,
  damagePerMinute: 780,
  damageTakenPerMinute: 690,
  visionPerMinute: 0.9,
  killParticipation: 0.58,
  deathShare: 0.19,
  wardsKilledPerMinute: 0.12,
  controlWardsPlaced: 2.1,
  damageShare: 0.26,
  deathsPer10: 1.4,
  timeDeadShare: 0.06,
  turretDamagePerMinute: 210,
  turretTakedowns: 1.3,
  epicMonsterDamagePerMinute: 95,
  platesDiff: 0.4,
  laningGames: Math.round(games * 0.8),
  goldDiffAt15: 180,
  csDiffAt15: 6,
  xpDiffAt15: 120,
  killsDiffAt15: 0.3,
  afkGames: 0,
  secondsPlayed: games * 1800,
  firstPlayedAt: IL_Y_A(14),
  lastPlayedAt: IL_Y_A(1),
  versusRest: { referenceGames: 30, winRateDelta: 0.06, kdaDelta: 0.4 },
  ...extra,
});

export const references: RadarReferencesDto = {
  position: "MIDDLE",
  tier: "GOLD",
  met: {
    tier: "GOLD",
    position: "MIDDLE",
    population: 214,
    minimumGames: 5,
    bounds: {
      damagePerMinute: { low: 420, high: 980 },
      goldPerMinute: { low: 330, high: 470 },
      damageTakenPerMinute: { low: 480, high: 920 },
      kda: { low: 1.4, high: 4.8 },
      killParticipation: { low: 0.38, high: 0.71 },
      deathShare: { low: 0.12, high: 0.27 },
      visionPerMinute: { low: 0.45, high: 1.25 },
      winRate: { low: 0.38, high: 0.63 },
    },
  },
};

// Quantiles 5 % à 95 % de chaque métrique du radar, pour le palier Or.
export const grilleOr = (position: string): ReferenceGridDto => {
  const percentiles = [0.05, 0.25, 0.5, 0.75, 0.95];
  const quantiles: Record<string, number[]> = {
    damagePerMinute: [420, 610, 720, 840, 980],
    goldPerMinute: [330, 380, 405, 430, 470],
    damageTakenPerMinute: [480, 600, 680, 760, 920],
    kda: [1.4, 2.2, 2.8, 3.5, 4.8],
    killParticipation: [0.38, 0.5, 0.56, 0.62, 0.71],
    deathShare: [0.12, 0.16, 0.19, 0.22, 0.27],
    visionPerMinute: [0.45, 0.7, 0.85, 1.0, 1.25],
    winRate: [0.38, 0.46, 0.5, 0.54, 0.63],
  };
  return {
    patches: ["16.19", "16.18"],
    scope: "MEAN",
    position,
    computedAt: IL_Y_A(0),
    percentiles,
    metrics: Object.fromEntries(
      Object.entries(quantiles).map(([cle, values]) => [
        cle,
        {
          polarity:
            cle === "deathShare" || cle === "damageTakenPerMinute"
              ? "LOWER"
              : "HIGHER",
          tiers: { GOLD: { count: 214, values } },
          rankMeans: null,
          missingTiers: [],
        },
      ]),
    ),
  };
};

const rang = (tier: string, division: string): RankedStandingDto => ({
  queue: "RANKED_SOLO",
  riotQueueType: "RANKED_SOLO_5x5",
  tier,
  division,
  leaguePoints: 42,
  wins: 61,
  losses: 55,
  hotStreak: false,
  inactive: false,
  observedAt: IL_Y_A(0),
});

const joueur = (
  side: number,
  position: string,
  championName: string,
  win: boolean,
  extra: Partial<TeamGamePlayerDto> = {},
): TeamGamePlayerDto => ({
  memberId: null,
  displayName: null,
  championId: championName.length * 7,
  championName,
  iconUrl: null,
  position,
  side,
  win,
  kills: 5,
  deaths: 4,
  assists: 8,
  goldEarned: 11_200,
  damageToChampions: 21_400,
  damageTaken: 18_900,
  minionsKilled: 190,
  visionScore: 28,
  afk: false,
  soloRank: rang("GOLD", "II"),
  flexRank: null,
  at15: null,
  ...extra,
});

const CHAMPIONS_ALLIES = ["Orianna", "Vi", "Jinx", "Lulu", "Ornn"];
const CHAMPIONS_ADVERSES = ["Syndra", "Sejuani", "Caitlyn", "Nautilus", "Jax"];
const POSTES = ["MIDDLE", "JUNGLE", "BOTTOM", "UTILITY", "TOP"];

export const partie = (
  numero: number,
  win: boolean,
  membres: { memberId: string; displayName: string }[],
): TeamGameDto => {
  const allies = POSTES.map((poste, i) =>
    joueur(
      100,
      poste,
      CHAMPIONS_ALLIES[(i + numero) % 5],
      win,
      i < membres.length ? { ...membres[i], kills: 7 - i, deaths: 2 + i } : {},
    ),
  );
  const enemies = POSTES.map((poste, i) =>
    joueur(200, poste, CHAMPIONS_ADVERSES[(i + numero) % 5], !win),
  );
  const moyenne = { value: 13.4, tier: "GOLD", division: "II", counted: 5 };
  return {
    matchId: `FICTIF_${numero}`,
    startedAt: IL_Y_A(numero),
    durationSeconds: 1_740 + numero * 90,
    queueId: 440,
    queue: "RANKED_FLEX",
    patch: "16.19",
    presentPlayers: membres.length,
    splitSides: false,
    win,
    players: allies.filter((allie) => allie.memberId !== null),
    allies: allies.filter((allie) => allie.memberId === null),
    enemies,
    allyRanks: { solo: moyenne, flex: null },
    enemyRanks: { solo: { ...moyenne, value: 12.8 }, flex: null },
    ranksObservedAt: IL_Y_A(0),
  };
};
