/** XP needed to go from level n to n+1. Gentle linear growth. */
export function xpForNext(level: number) {
  return 100 + 40 * (level - 1);
}

/** Total XP required to reach `level`. */
export function xpToReach(level: number) {
  const n = level - 1;
  return 100 * n + 20 * n * (n - 1);
}

export type LevelInfo = {
  level: number;
  title: string;
  xp: number;
  intoLevel: number;
  needed: number;
  progress: number;
};

export function levelTitle(level: number): string {
  if (level >= 30) return "Master reader";
  if (level >= 20) return "Expert reader";
  if (level >= 15) return "Skilled reader";
  if (level >= 10) return "Fluent reader";
  if (level >= 6) return "Focused reader";
  if (level >= 3) return "Reader";
  return "Novice";
}

export function levelFromXp(xp: number): LevelInfo {
  let level = 1;
  while (xpToReach(level + 1) <= xp) level++;
  const intoLevel = xp - xpToReach(level);
  const needed = xpForNext(level);
  return { level, title: levelTitle(level), xp, intoLevel, needed, progress: intoLevel / needed };
}
