import type { SessionRecord } from "@/lib/dal/practice";
import type { Overview } from "@/lib/stats/core";
import type { Level } from "@/lib/dal/users";
import { addDays } from "@/lib/time";
import { mean } from "@/lib/utils";

export type Recommendation = {
  id: string;
  title: string;
  reason: string;
  href: string;
  kind: "timed" | "pacer" | "rsvp" | "span" | "grid" | "chunks" | "scan" | "checkin" | "library";
  minutes: number;
};

export function recommend(input: {
  overview: Overview;
  sessions: SessionRecord[];
  level: Level;
  checkInAvailable: boolean;
  today: string;
}): Recommendation[] {
  const { overview, sessions, level, checkInAvailable, today } = input;
  const recs: Recommendation[] = [];
  const weekAgo = addDays(today, -7);
  const recent = sessions.filter((s) => s.localDate >= weekAgo);
  const has = (kind: string) => recent.some((s) => s.exercise === kind);
  const comfort = overview.comfortWpm;

  if (overview.totals.naturalReads === 0) {
    recs.push({
      id: "baseline",
      title: "Set your baseline",
      reason: "A timed read with questions gives you an honest starting point to measure progress against.",
      href: "/train/timed",
      kind: "timed",
      minutes: 4,
    });
  }

  if (checkInAvailable && sessions.length > 0) {
    recs.push({
      id: "checkin",
      title: "Weekly check-in",
      reason: "One standardized read each week keeps your progress measurement trustworthy.",
      href: "/check-in",
      kind: "checkin",
      minutes: 5,
    });
  }

  const lastQuiz = sessions.filter((s) => s.comprehension != null).slice(-3);
  const recentComp = lastQuiz.length >= 2 ? mean(lastQuiz.map((s) => s.comprehension!)) : null;
  if (recentComp != null && recentComp < 0.7) {
    recs.push({
      id: "steady",
      title: "Steady the pace",
      reason: `Your last reads averaged ${Math.round(recentComp * 100)}% comprehension. A slightly slower pacer rebuilds understanding first.`,
      href: `/train/pacer?wpm=${Math.round(comfort * 0.95)}`,
      kind: "pacer",
      minutes: 4,
    });
  } else if (recentComp != null && recentComp >= 0.85 && lastQuiz.length >= 3) {
    const target = Math.round((comfort * 1.15) / 10) * 10;
    recs.push({
      id: "stretch",
      title: `Stretch to ${target} WPM`,
      reason: `Your last three reads averaged ${Math.round(recentComp * 100)}% comprehension, so you're ready for a faster pacer.`,
      href: `/train/pacer?wpm=${target}`,
      kind: "pacer",
      minutes: 4,
    });
  }

  const lastChunks = sessions.filter((s) => s.exercise === "chunks").at(-1);
  if (lastChunks && (lastChunks.accuracy ?? 1) < 0.65) {
    recs.push({
      id: "chunks-easier",
      title: "Phrase flash, one size down",
      reason: `Your last phrase drill scored ${Math.round((lastChunks.accuracy ?? 0) * 100)}%. Smaller phrases help you build accuracy first.`,
      href: `/train/chunks?size=${Math.max(2, (lastChunks.score ?? 3) - 1)}`,
      kind: "chunks",
      minutes: 3,
    });
  } else if (!has("chunks")) {
    recs.push({
      id: "chunks",
      title: "Phrase flash",
      reason: "You haven't trained phrase recognition this week. Reading in phrases is the core fluency skill.",
      href: "/train/chunks",
      kind: "chunks",
      minutes: 3,
    });
  }

  if (!has("span") && level !== "foundations") {
    recs.push({
      id: "span",
      title: "Word flash",
      reason: "Quick single-glance recognition practice keeps word identification sharp.",
      href: "/train/span",
      kind: "span",
      minutes: 3,
    });
  }

  if (!has("grid")) {
    recs.push({
      id: "grid",
      title: "Two-minute focus warm-up",
      reason: "A focus grid before reading settles your attention, and attention is the real bottleneck.",
      href: "/train/grid",
      kind: "grid",
      minutes: 2,
    });
  }

  if (!has("scan") && level !== "foundations") {
    recs.push({
      id: "scan",
      title: "Scan hunt",
      reason: "Scanning is a strategic gear: find facts without reading everything.",
      href: "/train/scan",
      kind: "scan",
      minutes: 3,
    });
  }

  const target = Math.round((comfort * 1.2) / 10) * 10;
  const fallbacks: Recommendation[] = [
    {
      id: "fresh-read",
      title: "A fresh timed read",
      reason: "Your natural reads are the honest measure of progress. One more data point sharpens your trend.",
      href: "/train/timed",
      kind: "timed",
      minutes: 4,
    },
    {
      id: "rsvp-stretch",
      title: `RSVP stretch at ${target} WPM`,
      reason: "A short burst about 20% above your comfortable pace builds tolerance for speed.",
      href: `/train/rsvp?wpm=${target}`,
      kind: "rsvp",
      minutes: 3,
    },
  ];

  recs.push({
    id: "library",
    title: "Read something new",
    reason: "Wide reading builds the knowledge and vocabulary that make every future read faster.",
    href: "/library",
    kind: "library",
    minutes: 5,
  });

  for (const f of fallbacks) if (recs.length < 3 && !recs.some((r) => r.kind === f.kind)) recs.push(f);
  return recs.slice(0, 3);
}
